const fetch = require('node-fetch');
const models = require('../database');

const RegisteredApplications = models.registeredApplications;
const SequelizeOperator = require('sequelize').Op;
var commonUtils = require('../utils/common.utils');
var AppConfig = require('../config/app-config')
var env = process.env.NODE_ENV || 'development';
var config = require('../config/db.config')[env];
// var pluginsCtrl = require('../controllers/plugins.server.controller')
// var myServer = require('../bin/www')
const _ = require('lodash');
const _this = this;

/************ BEGIN OF CHECKING SECURITY APP ************/
async function checkSecurityPluginAvailability(){
  console.log("## CHECKING FOR SECURIY PLUGIN AVAILABILITY")
  let securityPlugin = await getSecurityPlugin()
  return securityPlugin === false ? false : securityPlugin  
}

/************ GET SECURITY PLUGIN ****************/
async function getSecurityPlugin(){
  let securityPlugin = false;
  let pluginConfigFiles = await commonUtils.getDetectedPluginConfigFiles();
  pluginConfigFiles = pluginConfigFiles.acceptedPluginConfigFiles || [];
  if(pluginConfigFiles && pluginConfigFiles.length > 0){
      _.forEach(pluginConfigFiles, (plugin) =>{
          if((plugin.uniqueName && (plugin.uniqueName).toLowerCase() === (AppConfig.securityApp).toLowerCase()) && (plugin.type && (plugin.type).toLowerCase() === 'default')){
            securityPlugin = plugin;
          }
      });

  }
  return securityPlugin
}

/***********************************************
 ********** GET SECURITY PLUGIN FROM DB *******
************************************************/
async function getSecurityPluginFromDb(){
  try{
    return models.Plugins.findOne({
      raw:true,
      where : {
        UniqueName : AppConfig.securityApp
      }
    }).then(securityPlugin=>{
      if(securityPlugin.UiUrls || securityPlugin.ServerUrls){
        securityPlugin.UiUrls = securityPlugin.UiUrls ? JSON.parse(securityPlugin.UiUrls) : {}
        securityPlugin.ServerUrls = securityPlugin.ServerUrls ? JSON.parse(securityPlugin.ServerUrls) : {}
      }
      return {success:true, response:securityPlugin}
    }).catch(err=>{
      return {success:false, response: 'Security plugin Info not found'}
    })
  }catch(error){
    return {success:false, response: 'Security plugin Info not found'}
  }
}
/************ GET PLUGIN CONFIGURATION DETAILS ****************/
async function getPluginsConfigurationDetails(plugin){
  console.log("###GET CONFIG DETAILS OF PLUGIN:",plugin.name)
  let getPluginConfigDetailsApi = await commonUtils.createApiToGetPluginConfigDetails(plugin.baseUrl, plugin.serverPort,plugin.prependUrl)
  //console.log("###Creating API for posting the EC details to "+ plugin.name +"Plugin :",getPluginConfigDetailsApi)
  let apiSchema = await commonUtils.createApiSchemaForSecurityPlugin(getPluginConfigDetailsApi,'POST',{configInfoRequest:{baseUrl:AppConfig.baseUrl,port:(AppConfig.serverPort).toString()}})
  let responseFromSecurityPluginAPI = fetchSecurityPluginApi(apiSchema);
  return responseFromSecurityPluginAPI.then(response =>{
    //console.log("###Success Response from "+ plugin.name +" Plugin config API:",response)
    return {success : true, response: response}
  }).catch(error =>{
    console.log("###@Error from "+ plugin.name +" Plugin config API:",error)
    /* let response = {
      name: "ISAS",
      uniqueName : 'isas',
      version: 0.1,
      uiPort: 4201,
      description:'For Authorization and Authentication',
      baseUrl: "http://3.132.244.71",
      type:"Default",
      instances : 1,
      serverPort: 3001,
      prependUrl: "/api/v1",
      iconUrl :`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`,
      uiUrl: [
          {
              name: "user",
              description: "for user information",
              url: "/users"
          }
      ],
      serverUrl : {
        applicationRegisteration : 'api/v1/application/registration',
          authentication : 'api/v1/user/Authentication',
          privilegesRegistration : 'api/v1/privilege/Registration',
          introspect : 'api/v1/token/introspect',
      }
    } */

    return {success : false, response: error}
  })

 /*  let pluginUrl = plugin.baseUrl+plugin.serverPort+'/configurationInfo'
  let requestBody = {baseUrl: config.url, port: config.port}
  let apiSchema = await commonUtils.createApiSchemaForIsas(pluginUrl,'POST',requestBody)
  let gettingPluginConfiguration = ISASctrl.fetchSecurityPluginApi(apiSchema)
  return gettingPluginConfiguration.then(async pluginConfig=>{
    console.log("Succes of getting plugin configuration:",pluginConfig)
    let plugin = await registerDetectedPlugins(pluginConfig)
    if(plugin != 'error'){
      return {success : true, pluginConfigData: pluginConfig, data:plugin}
    }else if(plugin === 'error'){
      return {success : false, pluginConfigData: pluginConfig, data:plugin}
    }
   
  }).catch(error=>{
    console.log("ERROR of getting plugin configuration:",error)
    return {success : false, pluginConfig: error, data:error}
  }) */

}

/*********** FETCH SECURITY PLUGIN CONFIG DETAILS **************/
async function getSecurityPluginConfigInfo(){
  let securityPlugin = await getSecurityPlugin()
  console.log(securityPlugin != false ? "Found Security Plugin with required Fields" : "Security Plugin found with no required Fields")
  let pluginInfo
  securityPlugin != false ? pluginInfo = await checkPluginConfigDetailsInDB(securityPlugin) : pluginInfo = false
  pluginInfo != false ? pluginInfo.success === true ? pluginInfo = pluginInfo.response[0] : pluginInfo = false : pluginInfo = false
  return pluginInfo;
}

/****** DETECT SECURITY PLUGIN AND ITS CONFIG DETAILS ************/
async function detectSecurityPluginAndConfigDetails(){
  let isSecurityPluginAvailable = await checkSecurityPluginAvailability()
  console.log(isSecurityPluginAvailable != false ? "Detected Security Plugin with required Fields" : "Security Plugin detected with no required Fields")
  if(isSecurityPluginAvailable != false){
    console.log("## SECURITY PLUGIN IS AVAILABLE:",isSecurityPluginAvailable.name)
    let securityPluginConfigInfo = await getPluginsConfigurationDetails(isSecurityPluginAvailable)
    securityPluginConfigInfo && securityPluginConfigInfo.success === true ? securityPluginConfigInfo = securityPluginConfigInfo : securityPluginConfigInfo = securityPluginConfigInfo
    return securityPluginConfigInfo
  }else{
    // closeMyECServer()
    return {success: false, response: 'Security plugin not found'}
  }
}

/******** CHECK IS REGISTERED APPLICATION WITH SECURITY PLUGIN OR NOT ************/
async function isRegisteredAppWithSecurityPlugin(registrationAppName, registrationAppVersion, registrationAppAdminName, registrationAppAdminEmail, regitsrationAppPrivileges){
  let securityPlugin = await getSecurityPluginConfigInfo()  
  if(securityPlugin){
    let registartionApi = await commonUtils.createRegisterationApi(securityPlugin)
    if(registartionApi != false){
      let registrationApiRequestBody = await commonUtils.createRegisterApplicationBody(registrationAppName, registrationAppVersion, registrationAppAdminName, registrationAppAdminEmail, regitsrationAppPrivileges)

      console.log(registartionApi + registrationApiRequestBody);
      
      if(registrationApiRequestBody && registrationApiRequestBody.success === true){
        let registrationApiSchema = await commonUtils.createApiSchemaForSecurityPlugin(registartionApi,'POST',registrationApiRequestBody.response)
        return fetchSecurityPluginApi(registrationApiSchema).then(async responseFromSecurityPlugin =>{
          if(responseFromSecurityPlugin && responseFromSecurityPlugin.RegistrationResponse.ErrorCode != 0){
            return {success:false, response: responseFromSecurityPlugin}
          }else{
            return {success:true, response: responseFromSecurityPlugin}
          }
          
        }).catch(error =>{
          return {success : false, response: error}
        })
      }else{
        return {success : false, response: registrationApiRequestBody}
      }
    }
  }else{
    let securityPluginInfo = await detectSecurityPluginAndConfigDetails()
    securityPluginInfo && securityPluginInfo.success === true ? checkIsRegisteredAppWithSecurityPlugin(securityPlugin, registrationAppName, registrationAppVersion) : {success: false, response: "Failed to register"}
  }
}

/************* CHECK IS PLUGIN CONFIG DEATILS IN DB ****************/
async function checkPluginConfigDetailsInDB(pluginInfo){
  console.log("## CHECK IS PLUGIN CONFIG DETAILS ALREADY SAVED:",pluginInfo.name)
  if(pluginInfo){
    try{
      return models.plugins.findAll({
        raw: true,
        where : {
          [SequelizeOperator.or] : [
            {
              UniqueName : pluginInfo.uniqueName
            }
            /* {
              ServerPort : pluginInfo.serverPort
            } */
          ]
        }
      }).then(plugins =>{
        console.log(plugins)
        if(plugins && plugins.length > 0){
          _.forEach(plugins,(plugin) =>{            
            if(plugin.UiUrls || plugin.ServerUrls){
              plugin.UiUrls = plugin.UiUrls ? JSON.parse(plugin.UiUrls) : {}
              plugin.ServerUrls = plugin.ServerUrls ? JSON.parse(plugin.ServerUrls) : {}
            }
          })
        }
        return { success : true, response : plugins}
      }).catch(resErr =>{
        return  { success : false, response : resErr}
      })
    }catch(error){
      return  { success : false, response : error}
    }
  }else{
    return { success : false, response : "Required parameters not found in the request"}
  }

}


async function fetchSecurityPluginApi(apiSchema){
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
        //console.log("BODY:",requestBody)
        fetch(requestApi, secondParameter).then(resp => {
          return resp.json()
        }).then((jsonData) => {
          //console.log("## Response from the API :",jsonData);
          resolve(jsonData)
        }).catch((err) => {
          // handle error for example
          console.log("## ERROR MSAS API :",err);
          reject(err)
        });
      }else{
        reject("required fields are missing(requestApi,requestMethod,requestHeaders,requestBody(body is optional))")
      }
    })
  
}



/********************************************
 **** FETCH LICENSE PLUGIN CONFIG DETAILS ****
*********************************************/
async function getLicensePluginConfigInfo(){
  let licensePlugin = {
    name : AppConfig.licenseManagerApp,
    uniqueName : AppConfig.licenseManagerApp
  }
  let pluginInfo
  licensePlugin != false ? pluginInfo = await checkPluginConfigDetailsInDB(licensePlugin) : pluginInfo = false
  pluginInfo != false ? pluginInfo.success === true ? pluginInfo = pluginInfo.response[0] : pluginInfo = false : pluginInfo = false
  return pluginInfo;
}


/********************************************
 **** FETCH LICENSE PLUGIN CONFIG DETAILS ****
*********************************************/
async function getNotificationPluginConfigInfo(){
  console.log('in ISAS Get notification')
  let notificationPlugin = {
    name : AppConfig.notificationManagerApp,
    uniqueName : AppConfig.notificationManagerApp
  }
  let pluginInfo
  notificationPlugin != false ? pluginInfo = await checkPluginConfigDetailsInDB(notificationPlugin) : pluginInfo = false
  pluginInfo != false ? pluginInfo.success === true ? pluginInfo = pluginInfo.response[0] : pluginInfo = false : pluginInfo = false
  return pluginInfo;
}





/************************************************
 ****** CREATE DEFAULT USER FOR EC IN ISAS ******
*************************************************/
async function createDefaultUserForPortal(rootNodeInfo){
  let defaultUserReqBody = await commonUtils.createDefaultUserReqBody(rootNodeInfo)
  console.log("REQ BODY :",defaultUserReqBody)
  let securityPluginInfo = await getSecurityPluginConfigInfo()
  if(securityPluginInfo){
    let defaultUserApi = await commonUtils.createDefaultUserApiSchema(securityPluginInfo)
    if(defaultUserApi !== false){
      let ecAppIdAndAppSecret = await getPortalAppIdAndAppSecret()
      if(ecAppIdAndAppSecret && ecAppIdAndAppSecret.success === true){
        let hmacId = await commonUtils.createHmacHash(ecAppIdAndAppSecret.response.ApplicationId, ecAppIdAndAppSecret.response.ApplicationSecret)
        let apiSchema = await commonUtils.createApiSchemaForSecurityPlugin(defaultUserApi,'POST',defaultUserReqBody,hmacId,null)
        let responseFromSecurityPluginAPI = fetchSecurityPluginApi(apiSchema)
        return responseFromSecurityPluginAPI.then(response =>{
          if(response && response.RegistrationResponse.ErrorCode === 0){
            return {success : true, response: response}
          }else{
            return {success : false, response: response}
          }          
        }).catch(error =>{
          return {success : false, response: error}
        })
      }else{
        return {success:false, response: ecAppIdAndAppSecret.response}
      }
    }else{
      return {success:false, response: 'Create Default user Api not found'}
    }
  }else{
    return {success:false, response: 'Security plugin not found in DB'}
  }
}

/************************************************
 ****** GET EC POrtal APP ID AND APP SECRET ID *********
*************************************************/
async function getPortalAppIdAndAppSecret(){
  try{
      return RegisteredApplications.findOne({
          raw:true,
          where : {
              ApplicationName : AppConfig.name
          }
      }).then(resp=>{
          if(resp){
              return {success:true, response:resp}
          }else{
              return {success:false, response:resp}
          }           
      }).catch(error=>{
          return {success:false, response:error}
      })
  }catch(error){
    console.log('in the error og get Portal APPID and APP Secret')
      return {success:false, response:error}
  }
}














/************ CLOSE PORTAL SERVER ***************/
async function closeMyECServer(){
  console.log("## CLOSING EC SERVER")
  process.exit(1)
}

module.exports = {
  getSecurityPluginFromDb : getSecurityPluginFromDb,
    getSecurityPlugin : getSecurityPlugin,
    fetchSecurityPluginApi : fetchSecurityPluginApi,
    checkSecurityPluginAvailability : checkSecurityPluginAvailability,
    getPluginsConfigurationDetails : getPluginsConfigurationDetails,
    isRegisteredAppWithSecurityPlugin : isRegisteredAppWithSecurityPlugin,
    closeMyECServer : closeMyECServer,
    detectSecurityPluginAndConfigDetails : detectSecurityPluginAndConfigDetails,
    checkPluginConfigDetailsInDB : checkPluginConfigDetailsInDB,
    getSecurityPluginConfigInfo : getSecurityPluginConfigInfo,
    createDefaultUserForPortal: createDefaultUserForPortal,
    getPortalAppIdAndAppSecret : getPortalAppIdAndAppSecret,
    getLicensePluginConfigInfo :getLicensePluginConfigInfo,
    getNotificationPluginConfigInfo :getNotificationPluginConfigInfo,
}
