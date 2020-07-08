const db = require("../database");
const Product = db.products;
//const Nodes = db.nodes;

var commonUtils = require('../utils/common.utils');
var ISASctrl = require('./isas.server.controller');

var STATUS = require('../utils/status-codes-messages.utils');
const AppConfig = require('../config/app-config');
var env = process.env.NODE_ENV || 'development';

var fs = require('fs');
var rfs = require('rotating-file-stream');
var path = require('path')
const Op = require("sequelize").Op;
const licenseManagerAppUrl ='/application';
const licenseManagerFeatureUrl = '/feature';
var logger = require('../utils/winston.utils').PortalLogs;
const fetch = require('node-fetch');


async function addProduct(req, res) {
  
  logger.info("IN ADD PRODUCT API");
  Product.findOne({ where: { [Op.or]: [{ ProductUid: req.body.ProductUid.trim() }] } }).then(function (Result) {
    console.log("result is", Result)
    if (Result != null) {
      logger.error('ADD PRODUCT API TERMINATED BECAUSE PRODUCT WITH SAME PRODUCT PART NO. ALREADY EXISTS')
      res.status(500).send({ status: 500, message: '!!Product With Same Product Part No. Already Exists!!' });
    } else {
      console.log('reached here in second scan');
      logger.info('VALIDATING  PRODUCT PART NAME AND VERSION')
      Product.findAll({ where: { [Op.and]: [{ ProductName: req.body.ProductName.trim() }, { Version: req.body.Version.trim() }] } })
        .then(function (ProductDataAgain) {
          if (ProductDataAgain.length > 0) {
            console.log('Data is ', ProductDataAgain)

            //Pushing data to license manager
            // pushDataToLicenseManager(req);

            prodData = JSON.parse(JSON.stringify(ProductDataAgain));
            console.log('Product data again is here ', prodData);

            console.log('same Product already exists ');
            logger.error('!!PRODUCT WITH SAME PRODUCT NAME AND VERSION ALREADY EXISTS!!')
            res.status(500).send({ status: 500, message: "!!Product With Same Product Name and Version Already Exists!!" });

          } else {
            prodData = JSON.parse(JSON.stringify(ProductDataAgain));
            console.log('Product data again is here ', prodData);
            logger.info('PRODUCT IS VALIDATED IN ADD PRODUCT ')
            console.log("in the add Product Table", req.body);
            Product.create(
              {
                ProductUid: req.body.ProductUid, ProductName: req.body.ProductName, Version: req.body.Version, Description: req.body.Description, FeatureList: JSON.stringify(req.body.featureList),
                DateCreated: new Date() + "", DateUpdated: new Date() + ""

              }).then((result, err) => {
                if (result) {
                  console.log("Deatils Saved Successfully");
                  logger.info("PRODUCT DETAILS STORED SUCCESSFULLY IN DATABASE ");
                  pushDataToLicenseManager(req,"Add");

                  res.status(200).send({ status: 200, message: "Product Details Saved Successfully" });
                }
                else {
                  console.log("err in database", err);
                  logger.error("FAILED TO STORE PRODUCT DETAILS ");

                  res.status(500).send({ status: 500, message: "Inernal Server Error" });
                }
              })
              .catch(err => {
                console.log('in CustomerDetails API', err);
                res.status(500).send({ error: err });
              });
          }
        })
    }
  })
}

async function editProduct(req, res) {
  logger.info('IN EDIT PRODUCT API');
  var UpdateProduct = true;
  Product.findAll({ where: { [Op.or]: [{ ProductUid: req.body.ProductUid.trim() }] } })
    .then(function (ProductsData) {
      data = JSON.parse(JSON.stringify(ProductsData));
      console.log('product list in edit product ', data);
      for (let k = 0; k < data.length; k++) {
        if (data[k].Id == req.body.Id) {
          console.log('Update the product ')

        } else {
          logger.error('SAME PRODUCT ALREADY EXISTS IN DATABSE')
          console.log('same Product already exists ');
          UpdateProduct = false;
        }
      }
      if (UpdateProduct == true) {
        var UpdateProdData = true;
        console.log('Second Validation start');
        logger.info('VALIDATION BEFORE UPDATING THE PRODUCT')
        Product.findAll({ where: { [Op.and]: [{ ProductName: req.body.ProductName.trim() }, { Version: req.body.Version.trim() }] } })
          .then(function (ProductDataAgain) {
            ProdData = JSON.parse(JSON.stringify(ProductDataAgain));
            console.log('product list in edit product ', ProdData);
            for (let m = 0; m < ProdData.length; m++) {
              if (ProdData[m].Id == req.body.Id) {
                console.log('!! Update the product No Match Found!! ')
                logger.info('VALIDATION SUCCESSFULLY COMPLETED PRODUCT IS UPDATING')

              } else {
                console.log('!!Match Found!! ');
                logger.error('VALIDATION FAILED SAME PRODUCT ALREADY EXISTS ');
                UpdateProdData = false;
              }
            }
            if (UpdateProdData == true) {

              console.log("in the edit Product  ", req.body.Id, req.body);
              var featureList = JSON.stringify(req.body.featureList)
              console.log("in the product Update ", featureList);

              Product.update(
                {
                  ProductUid: req.body.ProductUid, ProductName: req.body.ProductName, Version: req.body.Version, Description: req.body.Description, FeatureList: featureList,
                  DateCreated: new Date() + "", DateUpdated: new Date() + ""

                },
                {
                  where: {
                    Id: req.body.Id
                  }
                }).then((result) => {
                  console.log("result from database", result);
                  logger.info(" CUSTOMER DETAILS UPDATE SUCCESSULLY ");

                  //Pushing data to license manager
                  pushDataToLicenseManager(req,"Edit");

                  res.status(200).send({ status: 200, message: "Product Updated Successfully" });
                }).catch(err => {
                  console.log('In Update Customer API', err);
                  logger.error("FAILED TO UPDATE THE CUSTOMER DETAILS IN DATABASE ");

                  res.status(500).send({ error: err });
                });


            } else {
              res.status(500).send({ status: 500, message: "!!Product With Same Product Name and Version Already Exists!!" });
            }
          })


      } else {
        res.status(500).send({ status: 500, message: "!!Product with same part no already exist" });

      }
    });
}


async function deleteProduct(req, res) {
  logger.info('IN DELETE PRODUCT API')
  console.log("in delete product API ", req.body.Id);
  Product.destroy({
    where: {
      Id: req.body.Id //this will be your id that you want to delete
    }
  }).then(function (rowDeleted) { // rowDeleted will return number of rows deleted
    if (rowDeleted === 1) {
      console.log('Deleted successfully');
      logger.info('PRODUCT DELETED SUCCESSFULLY');
      res.status(200).send({ status: 200, message: "Product Deleted successfully" });

    }
  }, function (err) {
    console.log(err);
    logger.error('IN DELETE PRODUCT API INTERNAL SERVER ERROR');
    res.status(500).send({ status: 500, message: "Inernal Server Error" });
  });

}

async function getProductList(req, res) {
  logger.info('IN GET PRODUCT LIST API');
  let data = [];
  var dataToPush = [];
  var promises = [];
  Product.findAll()
    .then(function (products) {

      //data = JSON.parse(JSON.stringify(product));

      //for (var entry in product){
      //dataToPush.push(normalizeData(data[entry]));
      //}
      //console.log(dataToPush);
      ///res.status(200).send(dataToPush);

      //console.log(JSON.parse(JSON.stringify(products)));

      data = JSON.parse(JSON.stringify(products));
      console.log('product list', data);
      for (let j = 0; j < data.length; j++) {
        data[j].FeatureList = JSON.parse(data[j].FeatureList);
      }
      logger.info(' PRODUCT LIST SEND SUCCESSFULLY');
      console.log('updated data us', data);
      res.status(200).send(data);



    });

}

async function normalizeData(productEntry) {

  let newEntry = {};
  newEntry.ProductName = productEntry.ProductName;
  newEntry.ProductUid = productEntry.ProductUid;
  newEntry.Status = productEntry.Status;
  newEntry.Description = productEntry.Description;
  newEntry.Version = productEntry.Version;

  return newEntry;

}


async function pushDataToLicenseManager(req,type){
  logger.info('IN PUST DATA TO LICENSE MANAGER API');
console.log('In Push Data to License Manager');
  let product = req.body;
  let featureList = req.body.featureList;

  let checkIfLicenseManagerisAvailable = await checkIfLicenseManagerisActive();

  if (checkIfLicenseManagerisAvailable.success === true && checkIfLicenseManagerisAvailable.configDetails){

      let pluginDetail = checkIfLicenseManagerisAvailable.configDetails;

      let licenseMangerUrl = pluginDetail.baseUrl;
      let licenseManagerPort = pluginDetail.serverPort;
      let licensMangerprependUrl = pluginDetail.prependUrl;

      let productUrl = licenseMangerUrl + ":"+ licenseManagerPort + licensMangerprependUrl  + licenseManagerAppUrl;
      let featureUrl = licenseMangerUrl + ":" + licenseManagerPort + licensMangerprependUrl + licenseManagerFeatureUrl;
      console.log(JSON.stringify(product));
      console.log(JSON.stringify(featureList));
      let productbody = {};
      let products = [];
      let productforLicenseManager = await generateProductforLicenseManager(product);

      //console.log(JSON.stringify(productforLicenseManager));
      products.push(productforLicenseManager);

      productbody.item = [];
      // productbody.item.applications = [];
      productbody.item = products;

      console.log(JSON.stringify(productbody));

      let featureBody = {};
      featureBody.item = [];
      // featureBody.item.features = [];

      let featuresToAdd = [];

      for (j = 0; j<featureList.length;j++){
        let ft = await generateFeatureforLicenseManager(featureList[j],req.body);
        JSON.stringify(ft);
        featuresToAdd.push(ft);
      }

      featureBody.item = featuresToAdd;

      console.log(JSON.stringify(featureBody));

      if (type === "Add"){
      fetch(productUrl, {
        method: 'post',
        body:    JSON.stringify(productbody),
        headers: { 'Content-Type': 'application/json' , 'accesstoken' : req.headers.accesstoken},
      })
      .then(res => {
        res.json();
        logger.info('PRODUCT LIST SEND SUCESSFULLY TO LICENSE MANAGER')
      })
      .then(json => {
          console.log(json)
          fetch(featureUrl, {
          method: 'post',
          body:    JSON.stringify(featureBody),
          headers: { 'Content-Type': 'application/json' , 'accesstoken' : req.headers.accesstoken},
        })
        .then(res => {
          res.json();
          logger.info('FEATURE LIST SEND SUCCESSFULLY TO LICENSE MANAGER');
        })
        .then(json => {

          //console.log(json)
        });


      }); 
    }
      
    else if (type === "Edit"){
      fetch(productUrl, {
        method: 'put',
        body:    JSON.stringify(productbody),
        headers: { 'Content-Type': 'application/json' , 'accesstoken' : req.headers.accesstoken},
      })
      .then(res => {
        res.json();
        logger.info('PRODUCT LIST SEND SUCESSFULLY TO LICENSE MANAGER')
      })
      .then(json => {
          console.log(json)
          fetch(featureUrl, {
          method: 'post',
          body:    JSON.stringify(featureBody),
          headers: { 'Content-Type': 'application/json' , 'accesstoken' : req.headers.accesstoken},
        })
        .then(res => {
          res.json();
          logger.info('FEATURE LIST SEND SUCCESSFULLY TO LICENSE MANAGER');
        })
        .then(json => {

          //console.log(json)
        });


      }); 
      
    }

  }
}

async function checkIfLicenseManagerisActive(){

  availablePlugins = await commonUtils.getDetectedPluginConfigFiles();
  availablePlugins = availablePlugins.acceptedPluginConfigFiles || [];
  
  if(availablePlugins && availablePlugins.length > 0){

  
      /*db.plugins.findAll({
        where : {

        }
      }).then(function (plugin){

      })*/

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
  console.log(plugin);

  let configDetails = await ISASctrl.getPluginsConfigurationDetails(plugin)
  // console.log("----------- after getting response from config file:",configDetails)
  // console.log("----------- Not a security plugin",(configDetails.response.uniqueName && (configDetails.response.uniqueName).toLowerCase() != (AppConfig.securityApp).toLowerCase()))
  if(configDetails && configDetails.success === true){

    return {success : true,configDetails : configDetails.response};

  }

  else{
    return {success : false, configDetails : null};
  }
}



async function generateProductforLicenseManager(productAdded){
  logger.info('IN GENERATE PRODUCT FOR LICENSE MANAGER')
  let product = {};
  product.app_key = productAdded.ProductUid;
  product.app_name = productAdded.ProductName;
  product.from_ver = productAdded.Version;
  product.expires_on = "9999-12-31T00:00:00.000Z";
  return product;

}

async function generateFeatureforLicenseManager(featureAdded, productAdded){
  logger.info('IN GENERATE FEATURE FOR LICENSE MANAGER')
  let feature = {};
  feature.app_key = productAdded.ProductUid;
  feature.feature_key = featureAdded.FeatureID;
  feature.feature_name = featureAdded.FeatureName;
  feature.from_ver = productAdded.Version;
  feature.expires_on = "9999-12-31T00:00:00.000Z";
  return feature;

}


module.exports = {
  addProduct: addProduct,
  editProduct: editProduct,
  deleteProduct: deleteProduct,
  getProductList: getProductList
}