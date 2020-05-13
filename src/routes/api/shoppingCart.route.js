import { Router } from 'express';
import ShoppingCartController from '../../controllers/shoppingCart.controller';
import PaymentController from '../../controllers/payment.controller';

const router = Router();
router.get('/shoppingcart/generateUniqueId', ShoppingCartController.generateUniqueCart);
router.post('/shoppingcart/add', ShoppingCartController.addItemToCart);
router.get('/shoppingcart/:cart_id', ShoppingCartController.getCart);
router.put('/shoppingcart/update/:item_id', ShoppingCartController.updateCartItem);
router.delete('/shoppingcart/empty/:cart_id', ShoppingCartController.emptyCart);
router.delete('/shoppingcart/removeProduct/:item_id', ShoppingCartController.removeItemFromCart);
router.post('/orders', ShoppingCartController.createOrder);
router.get(
  '/orders/inCustomer/:customer_id',
  ShoppingCartController.getCustomerOrders
);
router.get(
  '/orders/:order_id',
  ShoppingCartController.getOrderDetails
);
router.get('/orders/shortDetail/:order_id', ShoppingCartController.getOrderSummary);
router.post(
  '/stripe/charge/callback',
  PaymentController.processStripePayment
);

export default router;
