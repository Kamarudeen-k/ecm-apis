/**
 * Takes care of Authenticaion using JWT tocken
 * @author: Kamarudeen
 */

const jwtLib = require('jsonwebtoken');
const fs = require('fs');
const mkdirp = require('mkdirp');
const getDirName = require('path').dirname;
const logger = require('fancy-log');
const { generateKeyPair, bCrypt } = require('crypto');

var signingOptions = {
    'algorithm' : 'HS256'
 };

 var passCode = 't-shirt-shop scrt-code-2019';
 var privateKey;
 var publicKey;
 var priKeyFile = './keys/private.key.pem';
 var pubKeyFile = './keys/cert-public.pem';
 
 function generateKeyPairCertificates(){
    var keyGenOptions = {
        modulusLength: 512,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: passCode
        }
    };

    generateKeyPair('rsa', keyGenOptions, (err, pubKey, priKey) => {
        // Handle errors and use the generated key pair.
        if(err){
            logger.error('Error generating keys. '+ err.stack);
            return;
        }
        privateKey = priKey;
        publicKey = pubKey;
       
        mkdirp(getDirName(priKeyFile), function(err){
            if(err){
                logger.error('Error creating private key file directory');
                return;
            }
            fs.writeFile(priKeyFile, privateKey, function(err){
                if(err)
                    logger.error('Error creating private key file. '+err.stack);
                return;
            });        
            
        });
        mkdirp(getDirName(pubKeyFile), function(err){
            if(err){
                logger.error('Error creating public key file directory');
                return;
            }
            fs.writeFile(pubKeyFile, publicKey, function(err){
                if(err)
                    logger.error('Error creating public key certificate.' +err.stack);
                return;
            });
            
        });
        
    });

 }

//Generate key if it doesnt exists
if(!fs.existsSync(priKeyFile) || !fs.existsSync(pubKeyFile))
    generateKeyPairCertificates();
else{
    fs.readFile(priKeyFile, function(err, priKey){
        if(err)
            logger.error('Error Reading private key file. '+err.stack);
        else
            privateKey = priKey;
    });

    fs.readFile(pubKeyFile, function(err, pubKey){
        if(err)
            logger.error('Error Reading public key file. '+err.stack);
        else
            publicKey = pubKey; 
    });
    
}

var getJWTToken = function(userEmail){
    var jwtToken;
    try{
        jwtToken = jwtLib.sign(userEmail, privateKey, signingOptions);
        
    }catch(err)
    {
        logger.error('Error creating jwt token. '+ err.stack);
        return false;        
    }

    return jwtToken;
}

var isTokenValid = function(jwtToken){
    if(jwtToken == null || jwtToken.length < 2)
        return false;
    
    try{
        return jwtLib.verify(jwtToken, privateKey, signingOptions);
    }catch(err){
        return false;
    }
    
}

var getPublicKey = function(){
    return publicKey;
}

var getEncrptedData = function(data){
    var hashedData;
    try{
        hashedData = bCrypt.hash(data, 10);
        
    }catch(err){
        logger.error('Error in ecrytion: '+ err.stack);
        return false;s
    }
    return hashedData;
}

var isHashEqual = function(dataOne, dataTwo){
    try{
        return bCrypt.compare(dataOne, dataTwo);
    }catch(err){
        logger.error('Error in hashing comparison '+ err.stack);
        return false;
    }s
}

var isEmailValid = function(email){
    if(email == null || email.indexOf('@') < 1  || email.indexOf('.') < 3){
        return false;
    }

    return true;
}

module.exports = {
    'getJWTToken' : getJWTToken,
    'isTokenValid' : isTokenValid,
    'getPublicKey' : getPublicKey,
    'getEncrptedData' : getEncrptedData,
    'isHashEqual' : isHashEqual,
    'isEmailValid'  : isEmailValid
}