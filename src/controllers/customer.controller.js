/**
 * Customer controller handles all requests that has to do with customer
 * Some methods needs to be implemented from scratch while others may contain one or two bugs
 * 
 * - create - allow customers to create a new account
 * - login - allow customers to login to their account
 * - getCustomerProfile - allow customers to view their profile info
 * - updateCustomerProfile - allow customers to update their profile info like name, email, password, day_phone, eve_phone and mob_phone
 * - updateCustomerAddress - allow customers to update their address info
 * - updateCreditCard - allow customers to update their credit card number
 * 
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */

import * as HttpStatus from 'http-status-codes';
import { Customer, LoginDetails, sequelize } from '../database/models';
import Utilis from '../utils/utilis';
import * as auth from '../utils/Authentication';
import log from 'fancy-log';

const DAY_MSEC = 86400*1000;
let loginMap = new Map();
/**
 *
 *
 * @class CustomerController
 */
class CustomerController {
  /**
   * create a customer record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, customer data and access token
   * @memberof CustomerController
   */
  static async create(req, res, next) {
    try{
      const email = req.body.email;
      const name = req.body.name;
      const password = req.body.password;

      if(!auth.isEmailValid(email))
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, `Param 'email' is not valid`, 'email', 'USR_03');
      
      if(name === null || name === undefined || name.trim().length < 1)
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, `Param 'name' is required`, 'name', 'USR_02');
      
      if(password === null || password === undefined || password.length < 1)
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, `Param 'password' is required`, 'password', 'USR_02');
      
      sequelize.transaction(tr => {
        return Customer.findOne({
          where: {
            email: email
          }
        })
        .then(customer => {
          if(customer)
            throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, `Param ${email} already exists`, 'email', 'USR_04');
          
          return Customer.create(req.body);
        })
        .then(customer => {
          CustomerController.login(req, res, next);
        })
        /*.then(response => {
          res.status(HttpStatus.CREATED).json(response);
        })*/
        .catch(error => {
          return next(error);
        });

      })
      .catch(error => {
        return next(error);
      });
      
    }catch(error){
      return next(error);
    }
  }

  /**
   * log in a customer
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, and access token
   * @memberof CustomerController
   */
  static async login(req, res, next) {
    try{
      const email = req.body.email;
      const password = req.body.password;
      if(!auth.isEmailValid(email))
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST,`Email ${email} is not valid`, 'email', 'USR_03');
      
      if(password === null || password === undefined || password.length < 1)
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, `password is empty or not present`, 'password', 'USR_01');
      
      let customer;
      sequelize.transaction(tr => {
        Customer.findOne({
          where: {
            email: email
          }
        })
        .then(customerRS => {
          if(!customerRS)
            throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, 'User does not exist!', 'email', 'USR_05');
          
          customer = customerRS;
          let dateTimeNow = new Date();
          let token = auth.getJWTToken(email+dateTimeNow.getTime());
          if(customer.email === email && customer.validatePassword(password)){
            return LoginDetails.create({
              customer_id: customer.customer_id,
              last_login: dateTimeNow,
              access_token: token,
              token_expires_in: new Date(dateTimeNow.getTime()+DAY_MSEC)
            });
          }else{
            throw Utilis.buildHttpError(HttpStatus.UNAUTHORIZED, `username or password is invalid`, '', 'USR_01');
          }
        })
        .then(logins => {
          //don't display password
          if(customer && customer.password)
            customer.password = '';
          
          loginMap.set(email, {
            accessToken: logins.access_token,
            expiresIn: logins.token_expires_in
          });

          res.status(HttpStatus.CREATED).json({
            customer,
            accessToken: logins.access_token,
            expiresIn: logins.token_expires_in
          });
          
        })
        .catch(error => {
          return next(error);
        });
      
      })
      .catch(error => {
        return next(error);
      });

    }catch(error){
      return next(error);
    }
  }

  /**
   * get customer profile data
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async getCustomerProfile(req, res, next) {
    try{
      const customer_id = req.params.customer_id;  
      if(customer_id === null || customer_id === undefined || isNaN(customer_id) || customer_id < 1)
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, `Param ${customer_id} is not a number`, 'customer_id');

      const customer = await Customer.findByPk(customer_id);
      //don't display password
      if(customer && customer.password)
        customer.password = '';
    
      return res.status(HttpStatus.OK).json(customer);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * update customer profile data such as name, email, password, day_phone, eve_phone and mob_phone
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async updateCustomerProfile(req, res, next) {
    try{
      const customer_id = Utilis.checkParamNBuildError('customer_id', req.params.customer_id);
      let customer = await Customer.findByPk(customer_id);
      if(!customer)
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, `Customer with id ${customer_id} is not present`, 'customer_id');
      
      let email = req.body.email;
      if(email){
        let recs = await Customer.findOne({
          where: {
            email: email
          }
        });

        if(recs)
          throw Utilis.buildHttpError(HttpStatus.CONFLICT, `Email id ${email} already exists`, 'email', 'USR_04');
      }

      let credit_card = req.body.credit_card;
      if(credit_card){
        credit_card = credit_card.trim();
        if(credit_card.length < 14 || isNaN(credit_card))
          throw Utilis.buildHttpError(HttpStatus.UNPROCESSABLE_ENTITY, `credit_card is not valid`, 'credit_card', 'USR_08');
      }
      
      sequelize.transaction(tr => {
        return Customer.update(req.body, {
          where: {
            customer_id: customer_id
          }
        })
        .then(customer => {
          return Customer.findByPk(customer_id);
        })
        .then(customer => {
          //don't display password
          if(customer && customer.password)
            customer.password = '';

          res.status(HttpStatus.OK).json(customer);
        })
        .catch(error =>{
          return next(error);
        });
      })
      .catch(error => {
        return next(error);
      });
      
    }catch(error){
      return next(error);
    }
  }

  /**
   * Provides facebook user's login 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  static async fbLogin(req, res, next){
    try{
      sequelize.transaction(tr => {
        let dateTimeNow = new Date();
        LoginDetails.create({
          customer_id: req.user[0].customer_id,
          last_login: dateTimeNow,
          access_token: req.user.accessToken,
          token_expires_in: new Date(dateTimeNow.getTime()+DAY_MSEC)
        })
        .then(logins => {
          delete req.user.accessToken;
          //don't display the password
          req.user[0].password = '';

          loginMap.set(req.user[0].email, {
            accessToken: logins.access_token,
            expiresIn: logins.token_expires_in
          });

          res.status(HttpStatus.CREATED).json({
            customer: req.user[0],
            accessToken: logins.access_token,
            expiresIn: logins.token_expires_in
          });
          
        })
        .catch(error => {
          return next(error);
        });
      
      })
      .catch(error => {
        return next(error);
      });

    }catch(error){
      return next(error);
    }
  }

  static isAccessTokenValid(email, token){
    try{
      let userInfo = loginMap.get(email);
      if(!userInfo)
        return false;

      let timeNow = new Date();  
      if(timeNow.getTime() > userInfo.expiresIn.getTime())
        return false;
      
      if(token !== userInfo.accessToken)
        return false;
      else
        return true;
        
    }catch(error){
      log(`Error: ${error.message}`);
      return false;
    }
  }

  /**
   * update customer profile data such as address_1, address_2, city, region, postal_code, country and shipping_region_id
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async updateCustomerAddress(req, res, next) {
    // write code to update customer address info such as address_1, address_2, city, region, postal_code, country
    // and shipping_region_id
    return res.status(200).json({ message: 'this works' });
  }

  /**
   * update customer credit card
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async updateCreditCard(req, res, next) {
    // write code to update customer credit card number
    return res.status(200).json({ message: 'this works' });
  }
}

export default CustomerController;
