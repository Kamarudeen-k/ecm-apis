/**
 * This helps to integrate facebook user signups
 */

import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
import * as HttpStatus from 'http-status-codes';
import log from 'fancy-log';
import * as configs from '../database/config/config';
import {Customer, sequelize} from '../database/models';
import Utilis from '../utils/utilis';


let port = (process.env.PORT) ? process.env.PORT : 80;

passport.use(new FacebookStrategy({
    clientID: configs.fb_client_app_id,
    clientSecret:configs.fb_client_app_secret,
    callbackURL: `http://localhost:${port}/customers/auth/facebook/callback`,
    profileFields: ['id', 'name', 'emails']
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
        try{
          if(profile.emails.length < 1)
            throw Utilis.buildHttpError(HttpStatus.INTERNAL_SERVER_ERROR, 'facebook didnt provide your email!')
          
          let email = profile.emails[0].value;
          let name = `${profile.name.givenName} ${(profile.name.middleName)?(profile.name.middleName):''} ${(profile.name.familyName)?(profile.name.familyName):''}`;
          Customer.findOrCreate({
            defaults: {
              name: name,
              password: accessToken.substring(0, 16),
            },
            where: {
              email: email
            }
          })
          .then(customer => {
            log('facebook user integration succesful');
            customer.accessToken = accessToken;
            done(null, customer);
            //avoid warning error message
            return new Promise(function(resolve, reject){
              return resolve(customer);
            });
          })
          .catch(error => {
            log.error(`error updating facbook user info into DB: ${error.message}`);
            return done(error);
          });
         
        }catch(error){
          return done(error);
        }
    });
  }
));

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
passport.deserializeUser(function(user, done) {
    done(null, user);
  });

export default passport;