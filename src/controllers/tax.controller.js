
/**
 * Tax controller contains methods which are needed for all tax request
 * Implement the functionality for the methods
 * 
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */

import * as HttpStatus from 'http-status-codes';
import { Tax } from '../database/models';
import Utilis from '../utils/utilis';

class TaxController {
  /**
   * This method get all taxes
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getAllTax(req, res, next) {
    try{
      const taxes = await Tax.findAll();
      res.status(HttpStatus.OK).json(taxes);
    }catch(error){
      return next(error);
    }
  }

  /**
   * This method gets a single tax using the tax id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getSingleTax(req, res, next) {
    try{
      const tax_id = req.params.tax_id;
      if(!tax_id || isNaN(tax_id))
        throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, 'Param tax_id is not a number');

      let tax = await Tax.findByPk(tax_id);
      if(!tax)
        tax = {};
        
      res.status(HttpStatus.OK).json(tax);
    }catch(error){
      return next(error);
    }
  }
}

export default TaxController;
