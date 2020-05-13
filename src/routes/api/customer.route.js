import { Router } from 'express';
import passport from 'passport';
import CustomerController from '../../controllers/customer.controller';

// These are valid routes but they may contain a bug, please try to define and fix them

const router = Router();
router.post(
  '/customers',
  CustomerController.create
);
router.post('/customers/login',  CustomerController.login);
router.get('/customers/:customer_id', CustomerController.getCustomerProfile);
router.patch('/customers/:customer_id', CustomerController.updateCustomerProfile);
router.patch('/customers/:customer_id/address', CustomerController.updateCustomerProfile);
router.patch('/customers/:customer_id/creditCard', CustomerController.updateCustomerProfile);
router.get('/customers/auth/facebook', passport.authenticate('facebook', {
    scope: ['email'] 
}));
router.get('/customers/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '',
    failureRedirect: ''
  }), CustomerController.fbLogin);


export default router;
