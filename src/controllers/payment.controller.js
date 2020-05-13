/**
 * Payment related api's controller
 */

import * as HttpStatus from 'http-status-codes';
const Stripe =  require("stripe")(process.env.STRIPE_SECRET_KEY);
import { Customer, Payment, sequelize } from '../database/models';
import Utilis from '../utils/utilis';

class PaymentController {

  static async processStripePayment(req, res, next){
    try{
      if(!req.body.email || !req.body.amount || !req.body.order_id || !req.body.stripeToken)
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, 'Required body params missing');

      sequelize.transaction(tr => {
        let customer;
        Customer.findOne({
          where: {
            email: req.body.email
          }
        })
        .then(customerRS => {
          customer = customerRS;
          if(!customer)
            throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, `customer email is not present`);
        
          return Stripe.customers.create({
            email: customer.email,
            card: req.body.stripeToken
          });

        })
        .then((stripeCustomer) =>{
          return Stripe.charges.create({
            amount: req.body.amount * 100,
            currency: 'usd',
            description: `Charge for order: ${req.body.order_id}`,
            customer: stripeCustomer.id
          });
  
        })
        .then(charge => {
          return Payment.create({
            amount: charge.amount / 100,
            customer_id: customer.customer_id,
            order_id: req.body.order_id,
            payment_refrence_id: charge.id,
            payment_gateway: 'STRIPE',
            paid_on: new Date()
          });
          
        })
        .then(payment => {
          res.status(HttpStatus.CREATED).json(payment);;
        })
        .catch(error => {
          return next(error);
        });
                
      })
      .catch(error => {
        return next(error);
      });

    }catch(error) {
      return next(error);
    }

  }
  
}

export default PaymentController;