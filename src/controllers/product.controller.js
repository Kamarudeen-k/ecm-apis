/**
 * The Product controller contains all static methods that handles product request
 * Some methods work fine, some needs to be implemented from scratch while others may contain one or two bugs
 * The static methods and their function include:
 * 
 * - getAllProducts - Return a paginated list of products
 * - searchProducts - Returns a list of product that matches the search query string
 * - getProductsByCategory - Returns all products in a product category
 * - getProductsByDepartment - Returns a list of products in a particular department
 * - getProduct - Returns a single product with a matched id in the request params
 * - getAllDepartments - Returns a list of all product departments
 * - getDepartment - Returns a single department
 * - getAllCategories - Returns all categories
 * - getSingleCategory - Returns a single category
 * - getDepartmentCategories - Returns all categories in a department
 * 
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
import * as HttpStatus from 'http-status-codes';
import * as MemoryCache from 'memory-cache';
import Utilis from '../utils/utilis';
import {
  Product,
  Department,
  AttributeValue,
  Attribute,
  Category,
  Review,
  sequelize
} from '../database/models';

const cacheDuration = 120 * 1000; // 2 mins

/**
 *
 *
 * @class ProductController
 */
class ProductController {
  /**
   * get all products
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getAllProducts(req, res, next) {
    try {
      const { query } = req;
      let { page, limit, description_length} = query;
      if(page === null || page === undefined || isNaN(page) || page < 1)
        page = 1;
      else
        page = parseInt(page);
      
      if(limit === null || limit === undefined || isNaN(limit) || limit < 1)
        limit = 20;
      else  
        limit = parseInt(limit);

      if(description_length === null || description_length === undefined || isNaN(description_length) || description_length < 1)
        description_length = 200;
      else
        description_length = parseInt(description_length);
      
      let offset = (page-1) * limit; 
      const sqlQueryMap = {
        limit,
        offset
      };
      
      const products = await Product.findAndCountAll(sqlQueryMap);
      let totalPages = products.count/limit;
      if(totalPages % 1)
        totalPages = totalPages - (totalPages % 1) + 1;

      let outProducts = {
        paginationMeta:{
          currentPage: page,
          currentPageSize: products.rows.length,
          totalPages: totalPages,
          totalRecords: products.count
        },
        rows: products.rows
      };
      
      return res.status(HttpStatus.OK).json( outProducts );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * search all products
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async searchProduct(req, res, next) {
    try{
      const query_string = Utilis.checkParamNBuildError('query_string', req.query.query_string, 'STRING');
      const all_words = Utilis.checkParamNBuildError('all_words', req.query.all_words, 'STRING');

      let { page, limit, description_length} = req.query;

      if(page === null || page === undefined || isNaN(page) || page < 1)
        page = 1;
      else
        page = parseInt(page);
      
      if(limit === null || limit === undefined || isNaN(limit) || limit < 1)
        limit = 20;
      else
        limit = parseInt(limit);
      
      if(description_length === null || description_length === undefined || isNaN(description_length) || description_length < 1)
        description_length = 200;
      else
        description_length = parseInt(description_length);
      
      let offset = (page-1) * limit; 

      const prodsCount = await sequelize.query('CALL catalog_count_search_result(:searchText, :allWords)', {
          replacements: {
            searchText: query_string,
            allWords: all_words
          }
      });

      let products = [];
      if(prodsCount[0].count > 0){
        products = await sequelize.query('CALL catalog_search(:searchText, :allWords, :descLength, :pageSize, :startItem)', {
          replacements: {
            searchText: query_string,
            allWords: all_words,
            descLength: description_length,
            pageSize: limit,
            startItem: offset
          }
        });
      }

      res.status(HttpStatus.OK).json({
        products: {
          count: prodsCount[0].count,
          rows: products
        }
      });

    }catch(error){
      return next(error);
    }
    
  }

  /**
   * get all products by caetgory
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getProductsByCategory(req, res, next) {
    try {
      const category_id = req.params.category_id; 
      const { query } = req;
      let { page, limit, description_length} = query;
      if(category_id === null || category_id === undefined || isNaN(category_id)){
        let error = new Error('category_id is not a number');
        error.status = HttpStatus.BAD_REQUEST;
        error.field = 'category_id';
        throw error;
      }
      if(page === null || page === undefined || isNaN(page) || page < 1)
        page = 1;
      else
        page = parseInt(page);
      
      if(limit === null || limit === undefined || isNaN(limit) || limit < 1)
        limit = 20;
      else
        limit = parseInt(limit);
      
      if(description_length === null || description_length === undefined || isNaN(description_length) || description_length < 1)
        description_length = 200;
      else
        description_length = parseInt(description_length);
      
      let offset = (page-1) * limit; 
      
      const products = await Product.findAndCountAll({
        include: [
          {
            model: Category,
            where: {
              category_id,  
            },
            attributes: [],
          },
        ],
        limit: limit,
        offset: offset,
      });
      
      res.status(HttpStatus.OK).json(products);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all products by department
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getProductsByDepartment(req, res, next) {
    try {
      const department_id = req.params.department_id; 
      const { query } = req;
      let { page, limit, description_length} = query;
      if(department_id === null || department_id === undefined || isNaN(department_id)){
        let error = new Error('department_id is not a number');
        error.status = HttpStatus.BAD_REQUEST;
        error.field = 'department_id';
        throw error;
      }
      if(page === null || page === undefined || isNaN(page) || page < 1)
        page = 1;
      else
        page = parseInt(page);

      if(limit === null || limit === undefined || isNaN(limit) || limit < 1)
        limit = 20;
      else
        limit = parseInt(limit);
      
      if(description_length === null || description_length === undefined || isNaN(description_length) || description_length < 1)
        description_length = 200;
      else
        description_length = parseInt(description_length);
      
      let offset = (page-1) * limit; 
      
      const products = await Product.findAndCountAll({
        include: [
          {
            model: Department,
            where: {
              department_id: department_id,  
            },
            attributes: [],
          },
        ],
        limit: limit,
        offset: offset
      });
      
      res.status(HttpStatus.OK).json(products);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method returns the list of reviews for a Product
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  static async getReviewsOfProduct(req, res, next){
    try{
      const product_id = req.params.product_id;
      if(product_id === null || product_id === undefined || isNaN(product_id)){
        let error = new Error('product_id is not a number');
        error.status = HttpStatus.BAD_REQUEST;
        error.field = 'product_id';
        throw error;
      }

      const reviews = await Review.findAndCountAll({
        where: {
          product_id: product_id
        }
      });
      res.status(HttpStatus.OK).json(reviews);
    }catch(error){
      return next(error);
    }
  }

  /**
   * This method adds a review to a product
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  static async addReviewsOfProduct(req, res, next){
    try{
      const product_id = Utilis.checkParamNBuildError('product_id', req.params.product_id);
      const customer_id = Utilis.checkParamNBuildError('customer_id', req.body.customer_id);
      const review = Utilis.checkParamNBuildError('review', req.body.review, 'STRING');
      const rating = Utilis.checkParamNBuildError('rating', req.body.rating);
      
      const result = await sequelize.query('CALL catalog_create_product_review(:custId, :prodId, :revw, :ratng)', {
          replacements: {
            custId: customer_id,
            prodId: product_id,
            revw: review,
            ratng: rating
          }
      });
      res.status(HttpStatus.CREATED).json(result);
    }catch(error){
      return next(error);
    }
  }

  /**
   * get single product details
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product details
   * @memberof ProductController
   */
  static async getProduct(req, res, next) {
    try{
      const product_id  = req.params.product_id; 
      if(product_id === null || product_id === undefined || isNaN(product_id))
      {
        let error = new Error('product_id is not a number');
        error.status = HttpStatus.BAD_REQUEST;
        error.field = 'product_id';
        throw error;
      }
      const product = await Product.findByPk(product_id, {
        include: [
          {
            model: AttributeValue,
            as: 'attributes',
            attributes: ['value'],
            through: {
              attributes: [],
            },
            include: [
              {
                model: Attribute,
                as: 'attribute_type',
              },
            ],
          },
        ],
      });
      return res.status(HttpStatus.OK).json( product );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all departments
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and department list
   * @memberof ProductController
   */
  static async getAllDepartments(req, res, next) {
    try {
      const cacheKey = '__ecom_get_all_departments';
      let departments = MemoryCache.get(cacheKey);
      if(!departments){
        departments = await Department.findAll();
        MemoryCache.put(cacheKey, departments, cacheDuration);
      }

      return res.status(HttpStatus.OK).json(departments);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get a single department
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getDepartment(req, res, next) {
    try {
      const department_id = req.params.department_id; 
      if(department_id === null || department_id === undefined || isNaN(department_id)){
        let error = new Error('department_id is not a number');
        error.code = 'DEP_01';
        error.status = HttpStatus.BAD_REQUEST;
        error.field = 'department_id';
        throw error;
      }

      const department = await Department.findByPk(department_id);
      if (department) {
        return res.status(HttpStatus.OK).json(department);
      }

      let error = new Error(`Department with id ${department_id} does not exist`);
      error.status = HttpStatus.BAD_REQUEST;
      error.code = 'DEP_02';
      error.field = 'department_id';
      throw error;
      
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method should get all categories
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getAllCategories(req, res, next) {
    try {
      const cacheKey = '__ecom_get_all_categories';
      let categories = MemoryCache.get(cacheKey);
      if(!categories){
        categories = await Category.findAll();
        MemoryCache.put(cacheKey, categories, cacheDuration);
      }
      return res.status(HttpStatus.OK).json(categories);
    }catch(error){
      return next(error);
    }
    
  }

  /**
   * This method should get a single category using the categoryId
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getSingleCategory(req, res, next) {
    try {
      const category_id = req.params.category_id;
      if(category_id === null || category_id === undefined || isNaN(category_id)){
        let error = new Error('category_id is not a number');
        error.status = HttpStatus.BAD_REQUEST;
        error.field = 'category_id';
        throw error;
      }

      const category = await Category.findByPk(category_id);
      if (category) {
        return res.status(HttpStatus.OK).json(category);
      }

      let error = new Error(`Category with id ${category_id} does not exist`);
      error.status = HttpStatus.BAD_REQUEST;
      error.code = 'CAT_01';
      error.field = 'category_id';
      throw error;

    } catch (error) {
      return next(error);
    }
    
  }

  /**
   * This method should get list of categories in a department
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getDepartmentCategories(req, res, next) {
    try{
      const department_id = req.params.department_id; 
      if(department_id === null || department_id === undefined || isNaN(department_id)){
        let error = new Error(`department with id ${department_id} is not a number`);
        error.status = HttpStatus.BAD_REQUEST;
        error.code = 'DEP_01';
        error.field = 'department_id';
        throw error;
      }

      const categories = await Category.findAll({
        where: {
          department_id: department_id
        }
      });
      
      return res.status(HttpStatus.OK).json(categories);
    }catch(error){
      return next(error);
    }
    
  }

  /**
   * This method returns the category of a product
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  static async getProductCategories(req, res, next) {
    try{
      const product_id = req.params.product_id; 
      if(product_id === null || product_id === undefined || isNaN(product_id)){
        let error = new Error(`Product with id ${product_id} is not a number`);
        error.status = HttpStatus.BAD_REQUEST;
        error.field = 'product_id';
        throw error;  
      }

      const categories = await Category.findAll({
        include: [{
          model: Product,
          where: { 
            product_id: product_id
          }
        }]
      });

      if(categories.length < 1){
        return res.status(HttpStatus.OK).json({});
      }else
      {
        //prepare the resultset as expected 
        let outCategories = [];
        categories.forEach(element => {
          let outElement = {
            category_id: element.category_id,
            department_id: element.department_id,
            name: element.name
          };
          outCategories.push(outElement);
        });

        return res.status(HttpStatus.OK).json(outCategories);
      }

    }catch(error){
      return next(error);
    }
    
  }
}

export default ProductController;
