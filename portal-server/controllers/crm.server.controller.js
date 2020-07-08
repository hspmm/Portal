//db connection usig sequelize
const db = require("../database");
const Customer = db.customers;
const Nodes = db.nodes;

const Product = db.products;

var fs = require('fs');
var rfs = require('rotating-file-stream');
var path = require('path')
const Op = require("sequelize").Op;

var logger = require('../utils/winston.utils').PortalLogs
const { base64encode, base64decode } = require('nodejs-base64');

const { Certificate } = require('@fidm/x509')

var jwt = require('jsonwebtoken');

var secretKey = "Aweqa2r3dadf434d1!3131w@232%";

var commonUtils = require('../utils/common.utils');
var ISASctrl = require('./isas.server.controller');
var licenseManagerAppKey = "LicenseManagerApplication";
var fetch = require('node-fetch');
const { response } = require("express");
const { Console } = require("console");


var certificateDirectory = path.join(__dirname, '../Certificate')
fs.existsSync(certificateDirectory) || fs.mkdirSync(certificateDirectory)

async function certificateValidate(req, res, next) {

  console.log('**************************in certificate validate API ', req.body);
  logger.info("In CERTIFICATE VALIDATION API ");
  req.body.formData = req.body.formData.substr(req.body.formData.indexOf(',') + 1);
  

  let cert = JSON.stringify(req.body);
  
  let decodeCertificate = base64decode(JSON.parse(cert).formData);
  
  const certificateData = Certificate.fromPEM(decodeCertificate);
  console.log('certificateData',certificateData);
  console.log('certificate valid to is ', certificateData.isCA, certificateData.validTo);
  
  if ( certificateData.isCA === false || certificateData.validTo === null ) {      
    
    logger.error("CERTIFICARE VALIDATION FAIL");

    res.status(500).send({ status: 500, message: 'Certificate is not valid ' })
  } else {
    
    logger.info("CERTIFICATE VALIDATION SUCCESS ");

    let CertificateData = {
      validTo: certificateData.validTo,
      isCA: certificateData.isCA,
      CertificateName: certificateData.issuer.attributes[0].value,
      CertificatePath: decodeCertificate
    }
    logger.info("CERTIFICATE IS UPLOADED SUCCESSFULLY");
    res.status(200).send({ status: 500, message: "Certificate is Uploaded Successfully", Data: CertificateData });
  }
};



async function CustomerDetails(req, res, next) {
  console.log('In Add/save Customer  ', req.body);
  if(req.body.formData.CustomerID){
  logger.info(" IN CUSTOMER DETAILS API ");
  var fileCertificatePath;
  if (req.body.formData.CertificatePath) {

    var accessCertificateStrean = rfs.createStream(req.body.formData.CustomerID + '.cer', {
      path: certificateDirectory,
      maxFiles: 30,
    })



    fs.writeFile(accessCertificateStrean.filename, req.body.formData.CertificatePath, (err) => {
      if (err) {
        
        logger.error("ERROR IN CUSTOMER  CERTIFICATE FILE " + err);

        res.status(500).send({ status: 500, message: "Error While Writing Certificate Data into File " });
      }
      
      logger.info("CERTIFICATE WRITTEN SUCCESSFULLY IN FILE. ");
      fileCertificatePath = accessCertificateStrean.filename;
    })
  } else {
    fileCertificatePath = '';
  }
  


  Customer.findOne({ where: { [Op.or]: [{ CustomerID: req.body.formData.CustomerID.trim() }, { NodeName: req.body.formData.NodeName.trim() }, { DomainName: req.body.formData.DomainName.trim() }] } }).then(function (Result) {
    
    if (Result != null) {
      res.status(500).send({ status: 500, Message: 'Customer with same details already exist' });

    } else {
      
      Customer.create(
        {
          CustomerID: req.body.formData.CustomerID, NodeName: req.body.formData.NodeName, DomainName: req.body.formData.DomainName, EmailID: req.body.formData.EmailID, Telephone: JSON.stringify(req.body.formData.Telephone),
          CertificatePath: fileCertificatePath, CertificateValidity: req.body.formData.CertificateValidity, isCA: req.body.formData.isCA, CertificateName: req.body.formData.CertificateName

        }).then((result, err) => {
          if (result) {
            
            logger.info("CUSTOMER DETAILS STORED SUCCESSFULLY IN DATABASE ");

            res.status(200).send({ status: 200, message: "Customer Details Saved Successfully" });
          }
          else {
            
            logger.error("FAILED TO STORE CUSTOMER DETAILS " + err);

            res.status(500).send({ status: 500, message: "Inernal Server Error" });
          }
        })
        .catch(err => {
          
          res.status(500).send({ error: err });
        });
    }
  })
  }else{
    res.status(500).send({ status: 500, Message: 'CustomerId is not Available' });
  }
}

async function getFileData(req, res) {
  
  console.log("IN GET FILE DATA API ")
  logger.info("IN GET FILE DATA API ");

  Customer.findAll({
    where: { CustomerID: req.params.CustomerId }
  }).then((result, err) => {
    if (result) {
      
      logger.info("CUSTOMER DETAILS COME FROM DATABASE ");
      let fileData = {
        CustomerID: result[0].dataValues.CustomerID,
        NodeName: result[0].dataValues.NodeName
      }
      fs.writeFile('./key.json', JSON.stringify(fileData), (err) => {
        if (err) {          
          logger.error("ERROR TO GET THE FILE " + err);

        }
        
        logger.info("SUCCESSFULLY WRITTEN TO FILE ");
        const file = path.resolve(__dirname, `.././key.json`);
        const file1 = JSON.parse(fs.readFileSync('key.json'));
        console.log("file is ", file1);
        res.download(file)
      });

    }
    else {
      
      logger.error("ERROR IN GETFILEDATA API ");
      res.status(500).send({ status: 500, message: "Inernal Server Error" });
    }
  })
}



async function UpdateCustomer(req, res) {
  console.log('UPdate customer req.body is ----------------->', req.body);
  if(req.body.formData.CustomerID){
  console.log('req.body of update customer', req.body);
  var UpdateCustomer = true;
  Customer.findAll({ where: { [Op.or]: [{ NodeName: req.body.formData.NodeName.trim() }, { DomainName: req.body.formData.DomainName.trim() }] } })
    .then(function (CustomerData) {
      var data = JSON.parse(JSON.stringify(CustomerData));
      console.log('CUstomer list', data);
      for (let j = 0; j < data.length; j++) {
        if (data[j].CustomerID == req.body.formData.CustomerID) {
          console.log('Upadte the customer ')

        } else {
          console.log('same customer already exists ');
          UpdateCustomer = false;
        }
      }
      if (UpdateCustomer == true) {
        console.log('write values for update');
        logger.info("IN UPDATECUSTOMER API ")
        console.log('Update Customer Name ', req.body.formData.NodeName);
        
        if (req.body.formData.CertificatePath.formData) {
          
          var filepath = certificateDirectory + '\\' + req.body.formData.CustomerID + '.cert';
          fs.writeFile(filepath, JSON.stringify(req.body.formData.CertificatePath), (err) => {
            if (err) {
              logger.error("FAILED TO WRITE IN FILE  " + err);

              
            }
            
            logger.info("SUCCESSFULLY WRITTEN TO THE FILE  ");

          });
        } else {
          logger.info("NO change in the Certificate  file  ");
        }
        Customer.update(
          {
            NodeName: req.body.formData.NodeName, DomainName: req.body.formData.DomainName, EmailID: req.body.formData.EmailID, Telephone: JSON.stringify(req.body.formData.Telephone),
            CertificatePath: filepath, CertificateValidity: req.body.formData.CertificateValidity, isCA: req.body.formData.isCA, CertificateName: req.body.formData.CertificateName
          },
          {
            where: {
              CustomerID: req.body.formData.CustomerID
            }
          }).then((result) => {
            
            logger.info(" CUSTOMER DETAILS UPDATE SUCCESSULLY ");

            res.status(200).send({ status: 200, message: "Customer Details Updated Successfully" });
          }).catch(err => {
            
            logger.error("FAILED TO UPDATE THE CUSTOMER DETAILS IN DATABASE ");

            res.status(500).send({ error: err });
          });
      } else {
        res.status(500).send({ status: 500, Message: "!!Same Customer Details Are Already Exists" });
      }
    })
  }else{
    
    res.status(500).send({ status: 500, Message: 'CustomerId is not Available' });
  }
}


async function postHierarchy(req, res, next) {
  console.log('in post hierarchy')
console.log('in post hierarchy ', req.body);
  let result = [];
  var promises = [];

  let treeData = req.body[0];
  let customerId = req.body[0].Uid;

  try{
    var decoded = jwt.verify(req.headers.accesstoken, secretKey);


    
    if (decoded.Uid === customerId)
    {


              Customer.findOne({ where: { CustomerID: customerId } }).then(function (customers) {
                if (customers === null) {
                  res.status(500).send({"error" : "Customer Does not Exist"});
                }
            
                else {                
            
                  result = flattenTree(JSON.parse(JSON.stringify(treeData)), result, customers.CustomerID);            
                  Nodes.findAll({ where: { RootID: customerId } }).then(function (nodes) {

                    var nodeEntries = JSON.parse(JSON.stringify(nodes));
                    var entriesTobeDeleted = findEntriesToDelete(result, nodeEntries);
                    var entriesToBeAdded = findEntriesToInsert(result, nodeEntries);
                    var entriesToBeUpdated = findEntriestoUpdate(result, nodeEntries);            
                         
                    entriesTobeDeleted.forEach((res) => {
                      promises.push(
                        Nodes.destroy({ where: { Uid: res.Uid } })
                          .then(function () {
                            
                          })
                      );
                    })
            
                    entriesToBeAdded.forEach((res) => {                      
                      promises.push(
                        Nodes.create(res)
                          .then(function () {
                            
                          })
                      )
            
                    });
            
            
                    entriesToBeUpdated.forEach((res) => {            
                      let nodeValue = getNodeValues(res, customerId);
                      promises.push(
                        Nodes.update(nodeValue, {
                          where: {
                            Uid: res.Uid
                          }
                        })
                          .then(function () {
            
                          })
                      )
            
                    });
            
                  })
            
            
                  console.log(result.length);
                  Promise.all(promises).then(() => {
                    console.log(result);
                    res.send(result);
                  })
                    .catch((err) => {
                      console.log(err);
                    });
                  
                }
            
            
              });
    }else{
      res.send('Data is not correct');
    }


  }

  catch{
    res.send({"error" : "Token Expired !!!!!!!!"});
  }
  


}

function findEntriesToDelete(postedArray, databaseArray) {
  var arrayToBeDeleted = [];
  for (var el in databaseArray) {
    if (!doesExist(databaseArray[el], postedArray)) {
      arrayToBeDeleted.push(databaseArray[el]);
    }
  }

  return arrayToBeDeleted;
}

function findEntriesToInsert(postedArray, databaseArray) {
  var arrayToBeInserted = [];

  for (var el in postedArray) {
    if (!doesExist(postedArray[el], databaseArray)) {
      arrayToBeInserted.push(postedArray[el]);
    }
  }

  return arrayToBeInserted;

}

function findEntriestoUpdate(postedArray, databaseArray) {

  var arrayToBeUpdated = [];

  for (var el in postedArray) {
    if (doesExist(postedArray[el], databaseArray)) {
      arrayToBeUpdated.push(postedArray[el]);
    }
  }

  return arrayToBeUpdated;

}

function doesExist(element, arrayOfElements) {
  var doesExist = false;

  for (var el in arrayOfElements) {
    if (element.Uid === arrayOfElements[el].Uid) {
      doesExist = true;
      break;
    }
  }
  return doesExist;
}

async function getCustomerList(req, res) {

  let data = [];
  let singleCustomer = {};
  var promises = [];

  Customer.findAll()
    .then(function (customers) {
      console.log("customer length is", customers);
      for (let i = 0; i < customers.length; i++) {
        customers[i].dataValues.Telephone = JSON.parse(customers[i].dataValues.Telephone);
      }

      customers.forEach(customer => {
        console.log(JSON.stringify(customer));

        promises.push(
          Nodes.findAll({ where: { RootID: customer.CustomerID } })
            .then(function (nodes) {

              singleCustomer = JSON.parse(JSON.stringify(customer));
              console.log("single customer is", singleCustomer)

              data.push(singleCustomer);
              console.log(singleCustomer);

              if (nodes.length === 0) {
              }
              else {
                
                arrayOfNodes = JSON.parse(JSON.stringify(nodes));
                generateTree(singleCustomer, arrayOfNodes, getSubArray(arrayOfNodes, 1));
              }

            })
        );
      })

      Promise.all(promises).then(() =>
        res.send(data)
      );
    });
}

function getSubArray(parentArray, nodeID) {
  let subArray = [];
  for (const el in parentArray) {

    if (parentArray[el].ParentID === nodeID) {
      subArray.push(parentArray[el]);
    }
  }

  return subArray;
}

function generateTree(root, allNodes, childNodes) {

  root.children = [];
  for (value of childNodes) {

    root.children.push(value);
    generateTree(value, allNodes, getSubArray(allNodes, value.NodeID));

  }

  return root;

}

function flattenTree(root, result = [], rootID) {

  if (!root.children.length) {

    let nodeValue = getNodeValues(root, rootID);
    result.push(nodeValue);
  }

  else {
    for (const child of root.children) {
      flattenTree(child, result, rootID);
    }

    let nodeValue = getNodeValues(root, rootID);
    result.push(nodeValue);

  }

  return result;
}

function getNodeValues(root, rootID) {

  let returnNode = {};
  returnNode.Uid = root.Uid;
  returnNode.NodeID = root.NodeID;
  returnNode.NodeName = root.NodeName;
  returnNode.NodeShortName = root.NodeShortName;
  returnNode.ParentID = root.ParentID;
  returnNode.RootID = rootID;
  returnNode.NodeType = root.NodeType;
  returnNode.TypeOf = root.TypeOf;
  returnNode.NodeInfo = root.NodeInfo;
  returnNode.TypeName = root.TypeName;
  returnNode.IconUrl = root.IconUrl; 
  returnNode.CreatedDate = root.createdAt;
  returnNode.LastModifiedDate = root.updatedAt;


  return returnNode;
}


async function getCustomerGUID(req, res) {
  console.log("in get customer GUID ");
  const uuidv1 = require('uuid/v1');
  let GUID = uuidv1();
  console.log("this is generated UUID ", GUID);
  res.send({ GUID });
}


async function getToken(req,res,next){
  console.log('here in get token')
  console.log('in get token ',req.body);

  if(req.body.CustomerId)
  {

    Customer.findOne({ where: { CustomerID: req.body.CustomerId } }).then(function (customers) {

      console.log(customers);
      
      if (customers === null){
console.log('error":"Customer does not Exist')
        res.status(500).send({"error":"Customer does not Exist"});
      }

      else{
        var token = jwt.sign({ Uid: req.body.CustomerId }, secretKey, { expiresIn: 60 * 5 });
        console.log('token', token);
        res.status(200).send({token});
      }

    })
  }

  else {
    res.status(500).send("Internal Server Error");
  }

}


async function getLicensedProducts(req,res,next){
console.log('in the get licensse product ');
  try{
    var decoded = jwt.verify(req.headers.accesstoken, secretKey);
    console.log('here is the decode onee',decoded.Uid);
    //res.status(200).send(decoded.Uid);

    if (decoded.Uid)
    {

      let checkIfLicenseManagerisAvailable = await checkIfLicenseManagerisActive();

      let data = {};
      data.success = false;
      data.item = [];

      if (checkIfLicenseManagerisAvailable.success === true && checkIfLicenseManagerisAvailable.configDetails){
    
          let pluginDetail = checkIfLicenseManagerisAvailable.configDetails;
    
          let licenseMangerUrl = pluginDetail.baseUrl;
          let licenseManagerPort = pluginDetail.serverPort;
          let licensMangerprependUrl = pluginDetail.prependUrl;

          let accessToken = await generateToken(licenseManagerAppKey);

          let allProducts =  await getProductsFromDatabase();
          
          console.log('all products', allProducts);
          
          data.item.ent_key = decoded.Uid;         

          let appUrl = licenseMangerUrl + ":"+ licenseManagerPort + licensMangerprependUrl  + "/entappfeaturemap/" 
                            + await getQueryString(decoded.Uid);

          let apiSchema  = await createApiSchemaToGetFeatureList(appUrl,'get',null,accessToken.message);

          let fetchResult = await fetchLicenseFeatures(apiSchema);

          let featureList = fetchResult.response.item;

          console.log('feature list is', fetchResult);

          let updatedFeatureList = [];
          
          for (let i=0 ;i <featureList.length; i++)
          {
            if (await doesAppExist(featureList[i],allProducts)){
              console.log('reached in if else table ');
              updatedFeatureList.push(featureList[i]);            
            }
          }          

          data.success = true;
          data.item = updatedFeatureList;
          console.log('updated feature list is ', updatedFeatureList);
          res.send(data);

      }

    }
  }

    catch(error)
    {
      console.log(error);
      res.send({"error" : "Token Expired !!!!!!!!"});
    }

}

async function doesAppExist(feature,allProducts){
  
  let doesExist = false;

  for (let j=0 ;j< allProducts.length;j++){
    if(allProducts[j].ProductUid === feature.app_key){
      doesExist = true;
      break;
    }
  }
  return doesExist;

}


async function getProductsFromDatabase(){

  return Product.findAll()
    .then(function (products) {

      let data = JSON.parse(JSON.stringify(products));
      for (let j = 0; j < data.length; j++) {
        data[j].FeatureList = JSON.parse(data[j].FeatureList);
      }
      return data;



    });


}

async function getQueryString(enterpriseName){

  return enterpriseName;

}

async function fetchLicenseFeatures(apiSchema){
  return fetchApi(apiSchema).then(async responseFromLicensePlugin =>{
    if(responseFromLicensePlugin){
      return {success:true, response: responseFromLicensePlugin}
    }else{
      return {success:false, response: responseFromLicensePlugin}
    }
    
  }).catch(error =>{
    return {success : false, response: error}
  })
}


async function checkIfLicenseManagerisActive(){

  let availablePlugins = await commonUtils.getDetectedPluginConfigFiles();
  availablePlugins = availablePlugins.acceptedPluginConfigFiles || [];
  
  if(availablePlugins && availablePlugins.length > 0){
      for (j=0 ;j<availablePlugins.length;j++){
         if(availablePlugins[j].uniqueName === "licensemanager"){
            let pluginStatus = doIndividualPluginServicesRestart(availablePlugins[j]);

            return pluginStatus;
         } 
      }

      return {success : false, configDetails : null};

  }
}


async function doIndividualPluginServicesRestart(plugin){
  logger.info('IN PLUGIN SERVICE RESATRT FUNCTION ');
  
    let configDetails = await ISASctrl.getPluginsConfigurationDetails(plugin)
    if(configDetails && configDetails.success === true){
  
      return {success : true,configDetails : configDetails.response};
  
    }
  
    else{
      return {success : false, configDetails : null};
    }
}


async function createApiSchemaToGetFeatureList(reqApi,reqMethod,requestBody,reqHeaders){

  let headers = { "Content-Type" : 'application/json'};
    if(reqHeaders){
        headers.accesstoken = reqHeaders;
    }
    let apiSchema;
    if(((reqMethod).toLowerCase() == "put") || (reqMethod).toLowerCase() == "post"){
        requestBody = JSON.stringify(requestBody)
        apiSchema = {
            requestApi : reqApi,
            requestMethod : reqMethod,
            requestHeaders : headers,
            requestBody : requestBody
        }
      }else{
        apiSchema = {
            requestApi : reqApi,
            requestMethod : reqMethod,
            requestHeaders : headers
        }
      }

    return apiSchema;
    
}


async function fetchApi(apiSchema){
  let requestApi = apiSchema.requestApi
  let requestMethod = apiSchema.requestMethod
  let requestHeaders = apiSchema.requestHeaders
  let requestBody = apiSchema.requestBody
  let secondParameter = {}
  if(requestBody){
    secondParameter.method = requestMethod
    secondParameter.headers= requestHeaders
    secondParameter.body = requestBody 
  }else{
    secondParameter.method = requestMethod
    secondParameter.headers= requestHeaders
  }

  return new Promise(async (resolve, reject)=>{
    if(requestApi && requestMethod && requestHeaders){
      fetch(requestApi, secondParameter).then(resp => {
        return resp.json()
      }).then((jsonData) => {
        resolve(jsonData)
      }).catch((err) => {
        reject(err)
      });
    }else{
      reject("required fields are missing(requestApi,requestMethod,requestHeaders,requestBody(body is optional))")
    }
  })

}

async function generateToken(key){

  try {
    var token = jwt.sign({ key: key }, secretKey, { expiresIn: 60 * 5 });
    return {success : true, message: token}; 
  }
  catch {
    return {success : false, message : 'Error Getting the Token'}; 
  }

}


async function verifyToken(token){

  return new Promise(function(resolve, reject){
    jwt.verify(token, secretKey, function(err, decode){
        if (err){
            reject({success : false, response : "Token Expired !!!!"})
            return;
        }

        resolve({success : true, response : "Token is Successfully Verified"})
    })
  })

}

// async function getCustomerDetails(req,res){
// console.log('in get Customer Details API');
// Customer.findAll({
//   attributes:['CustomerID','NodeName','DomainName','EmailID']
// }) .then(function (CustomerDetails) {
  
//   let data = JSON.parse(JSON.stringify(CustomerDetails));
//   console.log('Customer Details come from database', data);
//   res.send(data);

// })

// }
async function validateCustomer(req, res, next){
console.log('in validate customer');
  console.log('in if condition ', req.body.CustomerId)

  Customer.findAll({
     where: {   CustomerId:req.body.CustomerId  } 
  }).then(function (CustomerData,err) {
    var data = JSON.parse(JSON.stringify(CustomerData));
    if(data.length>0){
      console.log('Data is verified successfully', data);
      res.send({success:true, response:'Customer is varified successfully.'})
    }else{
      res.send({success:false, response:'Customer not present in Portal.'})
    }
  }).catch((err)=>{
  console.log('Error in Validate customer API')
  res.send({success:false, response:'Error in portal DB connectivity'})
    
  })


} 

module.exports = {
  UpdateCustomer: UpdateCustomer,
  getCustomerGUID: getCustomerGUID,
  postHierarchy: postHierarchy,
  getCustomerList: getCustomerList,
  CustomerDetails: CustomerDetails,
  certificateValidate: certificateValidate,
  getFileData: getFileData,
  getToken : getToken,
  getLicensedProducts : getLicensedProducts,
  generateToken : generateToken,
  verifyToken : verifyToken,
  // getCustomerDetails : getCustomerDetails,
  validateCustomer: validateCustomer
  
}