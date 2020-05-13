/**
 * Check each method in the shopping cart controller and add code to implement
 * the functionality or fix any bug.
 * The static methods and their function include:
 * 
 * - generateUniqueCart - To generate a unique cart id
 * - addItemToCart - To add new product to the cart
 * - getCart - method to get list of items in a cart
 * - updateCartItem - Update the quantity of a product in the shopping cart
 * - emptyCart - should be able to clear shopping cart
 * - removeItemFromCart - should delete a product from the shopping cart
 * - createOrder - Create an order
 * - getCustomerOrders - get all orders of a customer
 * - getOrderSummary - get the details of an order
 * - processStripePayment - process stripe payment
 * 
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */

import { v4 as UUIDV4 } from 'uuid';
import * as HttpStatus from 'http-status-codes';
import Utilis from '../utils/utilis';
import { Order, OrderDetail, ShoppingCart, Product, sequelize } from '../database/models';
import CustomerController from './customer.controller';
 
/**
 *
 *
 * @class shoppingCartController
 */
class ShoppingCartController {
  /**
   * generate random unique id for cart identifier
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart_id
   * @memberof shoppingCartController
   */
  static generateUniqueCart(req, res, next) {
    try{
      let uuId = UUIDV4();
      res.status(HttpStatus.OK).json({
        cart_id: uuId
      });

    }catch(error){
      return next(error);
    }
  }

  /**
   * adds item to a cart with cart_id
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async addItemToCart(req, res, next) {
    try{
      const { cart_id, product_id, attributes, quantity } = req.body;console.log('length: '+cart_id.length);
      if(!cart_id || cart_id === '' || !product_id || isNaN(product_id)
        || attributes === null || !quantity || isNaN(quantity))
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, 'Required Params missing');

      const cart = await sequelize.query('CALL shopping_cart_add_product(:cartId, :prodId, :attrbs, :qty)', {
        replacements:{
          cartId: cart_id,
          prodId: product_id,
          attrbs: attributes,
          qty: quantity
        }
      });
      res.status(HttpStatus.CREATED).json(cart[0]);      
    }catch(error){
      return next(error);
    }
  }

  /**
   * get shopping cart using the cart_id
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async getCart(req, res, next) {
    try{
      const cart_id = req.params.cart_id;
      if(!cart_id)
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, 'Param cart_id is required');
      
      const products = await ShoppingCart.findAll({
        attributes: ['item_id', 'cart_id', 'product_id', 'attributes','quantity'],
        where: {
          cart_id: cart_id
        },
        include: [{
          model: Product,
          attributes: ['name', 'image', 'price', 'discounted_price']
        }]
      });
      res.status(HttpStatus.OK).json(products);
    }catch(error){
      return next(error);
    }
  }

  /**
   * update cart item quantity using the item_id in the request param
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async updateCartItem(req, res, next) {
    try{
      const item_id  = req.params.item_id;
      if(!item_id || isNaN(item_id))
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, 'Param item_id is not a number');
      
      const quantity = req.body.quantity;
      if(!quantity || isNaN(quantity))
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, 'Param quantity is not a number');
      
      sequelize.transaction(tr => {
        return ShoppingCart.update({
          quantity: quantity
        }, {
          where: {
            item_id: item_id
          }
        })
        .then(row => {
          return ShoppingCart.findByPk(item_id);
        })
        .then(cart => {
          res.status(HttpStatus.OK).json(cart);
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
   * removes all items in a cart
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async emptyCart(req, res, next) {
    try{
      const cart_id = req.params.cart_id;
      if(!cart_id)
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, 'Param cart_id is required');
      
      await ShoppingCart.destroy({
        where: {
          cart_id: cart_id
        }
      });
      res.status(HttpStatus.OK).json({});
    }catch(error){
      return next(error);
    }
  }

  /**
   * remove single item from cart
   * cart id is obtained from current session
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with message
   * @memberof ShoppingCartController
   */
  static async removeItemFromCart(req, res, next) {
    try {
      const item_id = req.params.item_id;
      if(!item_id || isNaN(item_id))
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, 'Param item_id is not a number');
      
      const cart = await ShoppingCart.findByPk(item_id);
      if(!cart){
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: `Item with id ${item_id} is not present in the cart`
        });
      }
      await ShoppingCart.destroy({
        where: {
          item_id: item_id
        }
      });
      res.status(HttpStatus.OK).json({
        message: `Item with id ${item_id} has been removed from cart`
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * create an order from a cart
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with created order
   * @memberof ShoppingCartController
   */
  static async createOrder(req, res, next) {
    try {
      let { cart_id, shipping_id, tax_id, customer_id, email } = req.body;
      let token = req.headers['user-key'];
      let tokens = [];
      if(token){
        tokens = token.split(' ');
      }
      if(!tokens[1] || tokens[1] === '')
        throw Utilis.buildHttpError(HttpStatus.UNAUTHORIZED, 'Unauthorized access denied!');
      
      if(!email || email === '')
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, 'Param email is required');

      if(!CustomerController.isAccessTokenValid(email, tokens[1]))
        throw Utilis.buildHttpError(HttpStatus.UNAUTHORIZED, 'Unauthorized access denied');
        
      if(!cart_id || !shipping_id || !tax_id || !customer_id)
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, 'Required Params missing');

      const orderId = await sequelize.query('CALL shopping_cart_create_order(:cart_id, :customer_id, :shipping_id, :tax_id)', {
        replacements: {
          cart_id: cart_id,
          customer_id: customer_id,
          shipping_id: shipping_id,
          tax_id: tax_id
        }
      });
      res.status(HttpStatus.CREATED).json(orderId);

    } catch (error) {
      return next(error);
    }
  }

  /**
   *
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with customer's orders
   * @memberof ShoppingCartController
   */
  static async getCustomerOrders(req, res, next) {
    const customer_id = req.params.customer_id;  
    try {
      if(!customer_id || isNaN(customer_id))
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, 'Param customer_id is not a number');
      
      const orders = await Order.findAll({
        where: {
          customer_id: customer_id
        }
      });

      res.status(HttpStatus.OK).json(orders);
      
    } catch (error) {
      return next(error);
    }
  }

  /**
   *
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with order summary
   * @memberof ShoppingCartController
   */
  static async getOrderDetails(req, res, next) {
    const order_id = req.params.order_id;  
    try {
      if(!order_id || isNaN(order_id))
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, 'Param order_id is not a number');

      const orderDetails = await OrderDetail.findAll({
        where: {
          order_id: order_id
        }
      });
        
      res.status(HttpStatus.OK).json({
        order_id: order_id,
        order_items: orderDetails
      });

    } catch (error) {
      return next(error);
    }
  }

  /**
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  static async getOrderSummary(req, res, next){
    try{
      let order_id = req.params.order_id;
      if(!order_id || isNaN(order_id))
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, 'Param oder_id is not a number');

      const orderSummary = await Order.findOne({
        where:{
          order_id: order_id
        },
        attributes: ['order_id', 'total_amount', 'created_on', 'shipped_on', 'status']
      });
      res.status(HttpStatus.OK).json(orderSummary);
    }catch(error){
      return next(error);
    }
  }

  /**
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async processStripePayment(req, res, next) {
    const { email, stripeToken, order_id } = req.body; // eslint-disable-line
    const { customer_id } = req;  // eslint-disable-line
    try {
      // implement code to process payment and send order confirmation email here
    } catch (error) {
      return next(error);
    }
  }
}

export default ShoppingCartController;
