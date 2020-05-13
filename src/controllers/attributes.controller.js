/**
 * The controller defined below is the attribute controller, highlighted below are the functions of each static method
 * in the controller
 *  Some methods needs to be implemented from scratch while others may contain one or two bugs
 * 
 * - getAllAttributes - This method should return an array of all attributes
 * - getSingleAttribute - This method should return a single attribute using the attribute_id in the request parameter
 * - getAttributeValues - This method should return an array of all attribute values of a single attribute using the attribute id
 * - getProductAttributes - This method should return an array of all the product attributes
 * NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
import * as HttpStatus from 'http-status-codes';
import { Attribute, AttributeValue, Product, Sequelize } from '../database/models';

const { Op } = Sequelize;

class AttributeController {
  /**
   * This method get all attributes
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getAllAttributes(req, res, next) {
    try{
      const attributes = await Attribute.findAll();
      return res.status(HttpStatus.OK).json(attributes);
    }catch(error){
      return next(error);
    }

  }

  /**
   * This method gets a single attribute using the attribute id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getSingleAttribute(req, res, next) {
    try{
      const attribute_id = req.params.attribute_id;
      if(isNaN(attribute_id)){
        let error = new Error(`attribute_id is not a number`);
        error.status = HttpStatus.BAD_REQUEST;
        error.field = 'attribute_id';
        throw error;
      }

      const attribute = await Attribute.findByPk(attribute_id);
      if(attribute){
        return res.status(HttpStatus.OK).json(attribute);
      }else{
        let error = new Error(`Attribute with id ${attribute_id} is not present`);
        error.status = HttpStatus.BAD_REQUEST;
        error.field = 'attribute_id';
        throw error;
      }
    }catch(error){
      return next(error);
    }
    
  }

  /**
   * This method gets a list attribute values in an attribute using the attribute id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getAttributeValues(req, res, next) {
    try{
      const attribute_id = req.params.attribute_id;
      if(isNaN(attribute_id)){
        let error = new Error(`attribute_id is not a number`);
        error.status = HttpStatus.BAD_REQUEST;
        error.field = 'attribute_id';
        throw error;
      }

      const atValues = await AttributeValue.findAll({
        where: {
          attribute_id: attribute_id
        }
      });

      return res.status(HttpStatus.OK).json(atValues);

    }catch(error){
      return next(error);
    }
    
  }

  /**
   * This method gets a list attribute values in a product using the product id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getProductAttributes(req, res, next) {
    try{
      let product_id = req.params.product_id;
      if(isNaN(product_id)){
        let error = new Error('product_id is not a number');
        error.status = HttpStatus.BAD_REQUEST;
        error.field = 'product_id';
        throw error;
      }

      const atValues = await AttributeValue.findAll({
        include: [{
          model: Product,
          where: {
            product_id: product_id
          }
        },
        {
          model: Attribute,
          as: 'attribute_type'
        }]
      });
      
      if(atValues.length > 0){
        let outAttributes = [];
        let outValue = {};
        atValues.forEach(element => {
            outValue = {};
            outValue = {
            attribute_name: element.attribute_type.name,
            attribute_value_id: element.attribute_value_id,
            attribute_value: element.value
          }
          outAttributes.push(outValue);
        });

        res.status(HttpStatus.OK).json(outAttributes);
      }
      else {
        res.status(HttpStatus.OK).json({});
      }

    }catch(error){
      return next(error);
    }
    
  }

}

export default AttributeController;
