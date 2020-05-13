/**
 * The Shipping Controller contains all the static methods that handles all shipping request
 * This piece of code work fine, but you can test and debug any detected issue
 * 
 * - getShippingRegions - Returns a list of all shipping region
 * - getShippingType - Returns a list of shipping type in a specific shipping region
 * 
 */
import * as HttpStatus from 'http-status-codes';
import { ShippingRegion, Shipping } from '../database/models';
import Utilis from '../utils/utilis';

class ShippingController {
  /**
   * get all shipping regions
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and shipping regions data
   * @memberof ShippingController
   */
  static async getShippingRegions(req, res, next) {
    try {
      const shippingRegions = await ShippingRegion.findAll();
      return res.status(200).json({
        status: true,
        shippingRegions,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get get shipping region shipping types
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and shipping types data
   * @memberof ShippingController
   */
  static async getShippingType(req, res, next) {
    const shipping_region_id = req.params.shipping_region_id; 
    try {
      if(!shipping_region_id || isNaN(shipping_region_id))
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, 'Param shipping_region_id is not a number');

      const shippingTypes = await Shipping.findAll({
        where: {
          shipping_region_id,
        },
      });

      return res.status(HttpStatus.OK).json({
        status: true,
        shippingTypes,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default ShippingController;
