/**
 * This class has utility mthods useful across the projects
 */

import * as HttpStatus from 'http-status-codes';

class Utilis {

    /**
     * This method checks the given parameter values and builds and throws an error object if its empty or INT value less than 1
     * @param {*} paramName 
     * @param {*} paramValue 
     * @param {*} paramType 
     * @returns paramValue or throws error object
     */
    static checkParamNBuildError(paramName, paramValue, paramType = 'INT'){
        if(paramType === 'INT' && (paramValue === null || paramValue === undefined || isNaN(paramValue) || paramValue < 1)){
            throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, `Param ${paramName} is not a number`, paramName);
        
        } else if(paramType === 'STRING' && (paramValue === null || paramValue === undefined || paramValue.trim().length === 0)){
            throw Utilis.buildHttpError(HttpStatus.BAD_REQUEST, `Param ${paramName} is Empty!`, paramName);
        
        }
        
        if(paramType === 'INT')
            return parseInt(paramValue);
    
        return paramValue;
    }
    
    static buildHttpError(status, message, fieldName = '', code = ''){
        let error = new Error(message);
        error.status = status;
        
        if(fieldName.trim().length > 0)
            error.field = fieldName;

        if(code.trim().length > 0)
            error.code = code;
        
        return error;
    }
    

}

export default Utilis;