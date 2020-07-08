const fs = require('fs')
const models = require('../database');
const SequelizeOperator = require('sequelize').Op;
var STATUS = require('../utils/status-codes-messages.utils');
var commonUtils = require('../utils/common.utils');
const fetch = require('node-fetch')
var AppConfig = require('../config/app-config')
const _ = require('lodash');
var ISASctrl = require('./isas.server.controller')
var env = process.env.NODE_ENV || 'development';
var config = require('../config/db.config')[env];
var logger = require('../utils/winston.utils').PortalLogs

const _this = this
const AllRegisteredApplications = []
const AllFailedRegisteredApplications = []
var AllDetectedPluginsHashTable = {}



/*********** CHECK AND STORE CONFIG DETAILS OF PLUGINS ***********/
async function checkAndStoreConfigInfoOfPlugins(pluginInfo){
  logger.info('## CAME TO CHECK AND STORE CONFIG OF PLUGINS');
  console.log("## CAME TO CHECK AND STORE CONFIG OF PLUGINS");
  console.log(pluginInfo);
  let isPluginConfigInfo = await ISASctrl.checkPluginConfigDetailsInDB(pluginInfo);
  console.log("## Plugin Config Info :",isPluginConfigInfo.response.length > 0 ? 'Found In DB' : 'NotFound In DB');
  let responseOfPluginConfigInfo;
  isPluginConfigInfo && isPluginConfigInfo.success === true ? isPluginConfigInfo.response.length == 0 ? responseOfPluginConfigInfo = await savePluginConfigDetails(pluginInfo) 
  : responseOfPluginConfigInfo = await updatePluginConfigDetails(isPluginConfigInfo.response[0],pluginInfo) : {succes:false, response:''};
  console.log("responseOfPluginConfigInfo:",responseOfPluginConfigInfo.success === true ? 'succesfully saved/updated' : 'Failed to save/update');
  return responseOfPluginConfigInfo;
}



/*********** UPDATE PLUGIN CONFIG DETAILS **************/
async function updatePluginConfigDetails(previousDataOfPluginInfo, currentPluginInfo){
  console.log("## UPDATING PLUGIN CONFIG DETAILS:")
  let pluginDetailsSchema = await commonUtils.schemaOfPluginConfigInfo(currentPluginInfo, previousDataOfPluginInfo)
  console.log("## UPDATING PLUGIN CONFIG DETAILS:",pluginDetailsSchema)
  try{
    return models.plugins.update(pluginDetailsSchema,{
      where : {
        Uid : previousDataOfPluginInfo.Uid
      }
    }).then(resp =>{
      return models.plugins.findOne({
        raw : true,
        where : {
          Uid : previousDataOfPluginInfo.Uid
        }
      }).then(plugins =>{
        return { success: true, response: plugins }
      }).catch(err =>{
        return { success: false, response: err }
      })
      
    }).catch(err =>{
      return  { success : false, response : err}
    })
  }catch(error){
    return  { success : false, response : error}
  }
}


/*********** SAVE PLUGIN CONFIG DETAILS **************/
async function savePluginConfigDetails(pluginInfo){
  console.log("## SAVING PLUGIN CONFIG DETAILS" + pluginInfo + "Test adasdhadajdasdasfjas")
logger.info("## SAVING PLUGIN CONFIG DETAILS")
  let pluginDetailsSchema = await commonUtils.schemaOfPluginConfigInfo(pluginInfo)
  try{
    return models.plugins.create(pluginDetailsSchema).then(resp =>{
      return { success: true, response: resp }
    }).catch(err =>{
      return  { success : false, response : err}
    })
  }catch(error){
    logger.error('ERROR IN SAVING PLUGIN CONFIG DETAILS')
    return  { success : false, response : error}
  }
}





/************ BEGIN OF DO INITIAL STEPS WITH SECURITY APP ************/
async function doInitialStepsWithSecurityPlugin(PluginInfo){
  console.log("## Doing Initial Steps With Security Plugin")
  let respOfRegisterApp = await registerApplicationWithSecurityPlugin(AppConfig)  
  if(respOfRegisterApp && respOfRegisterApp.success === true){
    logger.info("SUCESSFULLY REGISTERED THE APPLICATION WITH SECURITY PLUGIN")
    
    let detetctedPlugins = await detectAllAvailablePlugins()
    console.log("## DETECTED PLUGINS EXCLUDING SECURITY PLUGIN:",detetctedPlugins.length)
    logger.info("DETECTED PLUGINS EXCLUDING SECURITY PLUGINS :"+detetctedPlugins.length)
    return {success :true, response :detetctedPlugins}
  
  }else{
    
    logger.error("FAILED TO REGISTERED THE APPLICATION WITH SECURITY PLUGIN : "+respOfRegisterApp.response)
    return {success : false, response : false}
    
  }
}



/*********** REGISTER APPLICATION WITH SECURITY PLUGIN ***********/
async function registerApplicationWithSecurityPlugin(appInfo){
  
  let registrationAppName = appInfo.name , registrationAppVersion = _.toString(appInfo.version);
  let registraionAppAdminName = appInfo.adminName ? appInfo.adminName : null;
  let registrationAppAdminEmail = appInfo.adminEmail ? appInfo.adminEmail : null;
  let registrationAppPrivileges = appInfo.privileges ? appInfo.privileges : [];
  let respOfIsRegisteredApp = await ISASctrl.isRegisteredAppWithSecurityPlugin(registrationAppName, registrationAppVersion, registraionAppAdminName, registrationAppAdminEmail, registrationAppPrivileges)
  
  if(respOfIsRegisteredApp && respOfIsRegisteredApp.success === true){
    if(respOfIsRegisteredApp && respOfIsRegisteredApp.response.RegistrationResponse.ErrorCode == 0){

      console.log(respOfIsRegisteredApp.response.RegistrationResponse);

      let registerSaveResp = await checkAndsaveRegistrationResponseInDB(registrationAppName,registrationAppVersion, respOfIsRegisteredApp.response.RegistrationResponse)
      return registerSaveResp;
    }else{
      return respOfIsRegisteredApp
    }
  }else{
    return respOfIsRegisteredApp
  }
}



/************* SAVE REGISTARTION RESPONSE IN DB ****************/
async function checkAndsaveRegistrationResponseInDB(registrationAppName,registrationAppVersion, registrationResponse){
  let isNewRegisteredApp = await checkDBisNewRegisteredApplication(registrationResponse)
  console.log("%%%#########:",isNewRegisteredApp)
  if((isNewRegisteredApp && isNewRegisteredApp.success === true) && (isNewRegisteredApp && isNewRegisteredApp.response == null)){
    let saveResponse = await saveResponseOfRegistration(registrationAppName,registrationAppVersion, registrationResponse)
    return saveResponse
  }else if((isNewRegisteredApp && isNewRegisteredApp.success === true) && (isNewRegisteredApp && isNewRegisteredApp.response != null)){
    return { success: true, response : isNewRegisteredApp.response}
  }else{
    return { success: false, response : isNewRegisteredApp.response}
  }
}



/************ CHECK IS NEW REGISTERED APPLICATION **************/
async function checkDBisNewRegisteredApplication(registrationResponse){
  try{
    return await models.registeredApplications.findOne({
      raw: true,
      where : {
        // ApplicationId : registrationResponse.Application_Id
        ApplicationGuid : registrationResponse.Application_GUID
      }
    }).then(response =>{
      //console.log("Already it is registered: YES :",response)
      if(response){
        return  {success: true , response : response}
      }else{
        return  {success: true , response : null}
      }
      
    }).catch(err =>{
      console.log("Error while checking register application response to DB:",err)
      return {success: false , response : err}
    })

  }catch{
    return {success: false , response : STATUS.ERROR.DB_FETCH[1]}
  }
}


/*********** STORE REGISTERED APPLICATION ***************/
async function saveResponseOfRegistration(registrationAppName,registrationAppVersion, registrationResponse){
  // console.log("----> save registarion response in regired app tabkle:",registrationResponse)
  let obj = {
    ApplicationId : registrationResponse.Application_Id,
    ApplicationName : registrationAppName,
    ApplicationVersion : registrationAppVersion,
    ApplicationSecret : registrationResponse.Application_Secret,
    ApplicationGuid : registrationResponse.Application_GUID
  }

  
  console.log(obj);
  try{
    return await models.registeredApplications.create(obj).then(response =>{
      // let savedApplication = await this.checkDBisNewRegisteredApplication(registrationResponse)
      return  {success: true , response : response.dataValues}
    }).catch(err =>{
      console.log("Error while saving register application response to DB:",err)
      return {success: false , response : err}
    })
  }catch(error){
    return { success: false, response: error}
  }
}



/************* REGISTER APPLICATION PRIVILIGES **************/
/************* REGISTER APPLICATION PRIVILIGES **************/
async function registerApplicationPriviliges(registrationAppInfo){
  console.log("## REGISTERING APPLICATION PRIVILEGES WITH SECURITY PLUGIN :",registrationAppInfo.name)
  let registrationAppName = registrationAppInfo.name , registrationAppVersion = _.toString(registrationAppInfo.version), registrationAppPrivileges = registrationAppInfo.privileges ? registrationAppInfo.privileges : []
  let registraionAppAdminName = registrationAppInfo.adminName ? registrationAppInfo.adminName : null;
  let registrationAppAdminEmail = registrationAppInfo.adminEmail ? registrationAppInfo.adminEmail : null;
  console.log("## CHEKING IS APPLICATION ALREADY REGISTERED OR NOT :",registrationAppInfo.name)
  let respOfIsRegisteredApp = await ISASctrl.isRegisteredAppWithSecurityPlugin(registrationAppName, registrationAppVersion, registraionAppAdminName, registrationAppAdminEmail, registrationAppPrivileges)
  if(respOfIsRegisteredApp && (respOfIsRegisteredApp.success === true) && (respOfIsRegisteredApp.response.RegistrationResponse.ErrorCode == 0)){
    let respOfRegisterPrivileges = await goToRegisterPrivileges(respOfIsRegisteredApp.response.RegistrationResponse, registrationAppPrivileges)
    if(respOfRegisterPrivileges && respOfRegisterPrivileges.succes === true){
      return {success: true, response: respOfRegisterPrivileges.response}
    }else{
      return respOfRegisterPrivileges
    }
  }else{
    return respOfIsRegisteredApp
  }
}


/************* REGISTER APPLICATION PRIVILIGES (interlink function of register privileges method) **************/
async function goToRegisterPrivileges(appRegistrationInfo, registrationAppPrivileges){
  console.log("## CAME TO MAIN LOGIC OF REGISTERING PRIVILEGES ") 
  logger.info('IN REGIISTER PRIVILEGES ');
  let securityPlugin = await ISASctrl.getSecurityPluginConfigInfo()
  if(securityPlugin != false){
    let privilegesRegistrationApiRequestBody = await commonUtils.createPrivilegeRegistrationApiBody(registrationAppPrivileges)
    if(privilegesRegistrationApiRequestBody && (privilegesRegistrationApiRequestBody.success === true)){
      privilegesRegistrationApiRequestBody = privilegesRegistrationApiRequestBody.response
      let privilegesRegistartionApi = await commonUtils.createPrivilegesRegisterationApi(securityPlugin)
      let hashedBase64 = await commonUtils.createHmacHash(appRegistrationInfo.Application_Id, appRegistrationInfo.Application_Secret)
      let privilegesRegistrationApiSchema = await commonUtils.createApiSchemaForSecurityPlugin(privilegesRegistartionApi, 'POST', privilegesRegistrationApiRequestBody, hashedBase64)
      return ISASctrl.fetchSecurityPluginApi(privilegesRegistrationApiSchema).then(privilegesResp =>{
        // console.log("Privileges registration response: ",privilegesResp)
        console.log("Privileges registration response: ")
        if(privilegesResp && privilegesResp.PrivilegeRegistrationResponse && privilegesResp.PrivilegeRegistrationResponse.ErrorCode === 0){
          return {success : true, response: privilegesResp.PrivilegeRegistrationResponse}
        }else{
          return {success : false, response: privilegesResp.PrivilegeRegistrationResponse}
        }
      }).catch(error =>{
        return {success: false, response: error}
      })
    }else{
      return privilegesRegistrationApiRequestBody
    }
  }else{
    return {success : false, response: 'Failed to register privileges'}
  }
}



/******************* DETECT ALL PLUGINS AND CHECK WEATHER REGISTERED AND GET CONFIG INFO FROM THE PLUGINS **********************/
async function detectAllAvailablePlugins(){
  return new Promise(async (resolve, reject)=>{
    let listOfavailablePlugins = []
    let availablePlugins = await commonUtils.getDetectedPluginConfigFiles();
    logger.info("DETECTED PLUGINS :"+JSON.stringify(availablePlugins))
    //console.log("##@@@ AVAILABLE PLUGINS :",availablePlugins.acceptedPluginConfigFiles.length);
    //console.log("##@@@ AVAILABLE PLUGINS :",availablePlugins.acceptedPluginConfigFiles);
    availablePlugins = availablePlugins.acceptedPluginConfigFiles || [];
    if(availablePlugins && availablePlugins.length > 0){
      let count = 0
      //console.log(availablePlugins.length + JSON.stringify(availablePlugins));

      let allPlugins = await checkPluginStatusAndReturnAllPluginsInfo(availablePlugins, 0);
      console.log("########################################################allPlugins",allPlugins);
      console.log("########################################################AllDetectedPluginsHashTable",AllDetectedPluginsHashTable);
      listOfavailablePlugins = allPlugins;
      resolve(listOfavailablePlugins);
       
    }
  })
}

async function checkPluginStatusAndReturnAllPluginsInfo(availablePlugins, index) {

  
  let allPluginsConfigInfo = [];
  let plugin = availablePlugins[index];
  let pluginStatus = await doIndividualPluginServicesRestart(availablePlugins[index]);
  if (pluginStatus.success === true) {
    allPluginsConfigInfo.push(pluginStatus.response)
    if (index < availablePlugins.length - 1) {
      index = index + 1;
      let allPlugins = await checkPluginStatusAndReturnAllPluginsInfo(availablePlugins, index);
      allPlugins.forEach((singlePlugin) => {
        allPluginsConfigInfo.push(singlePlugin)
      })
    }
  } else {
    let respOfRemovePluginInfoFromHash
    if( (pluginStatus.success === false) && ((pluginStatus.plugin.name).toLowerCase() != (AppConfig.securityApp).toLowerCase())){
      respOfRemovePluginInfoFromHash = await removePluginDataFromHashTableAndDisableInDB(availablePlugins[index])
    }else{
      respOfRemovePluginInfoFromHash = true
    }
    
    if (respOfRemovePluginInfoFromHash && (index < availablePlugins.length - 1)) {
      index = index + 1
      let allPlugins = await checkPluginStatusAndReturnAllPluginsInfo(availablePlugins, index)
      allPlugins.forEach((singlePlugin) => {
        allPluginsConfigInfo.push(singlePlugin)
      })
    }
  }

  return allPluginsConfigInfo
}

/****************** REMOVE EXISTING DATA FORM HAS TABLE AND DISABLE THE SERVICES IF PLUGIN IS UNAVAILABLE ***************/
async function removePluginDataFromHashTableAndDisableInDB(plugin){
  let respOfRemoveFromHashTable = await removePluginInfoFromHashTable(plugin) 
  if(respOfRemoveFromHashTable){
    let disablePlugin = await disablePluginServicesByUniqueName(plugin)
    if(disablePlugin.success === true){
      return true
    }else{
      return true
    }
  }

}

async function removePluginInfoFromHashTable(plugin){
  for(let key in AllDetectedPluginsHashTable){
    console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&:",AllDetectedPluginsHashTable[key])
    if(AllDetectedPluginsHashTable[key] && ((AllDetectedPluginsHashTable[key].name).toLowerCase() == (plugin.name).toLowerCase())){
      console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&@@@@:Key:",key)
      console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&:AllDetectedPluginsHashTable[key]:",AllDetectedPluginsHashTable[key])
      console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&:AllDetectedPluginsHashTable[key].name:",AllDetectedPluginsHashTable[key].name)
      console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&:plugin:",plugin.name)
      AllDetectedPluginsHashTable[key].servicesEnabled = false
    }
  }
  return true
}


/********************************* CHECK LICENCE FOR PLUGINS ****************************************/
async function checkLicenceForPlugin(pluginConfigInfo){
  return {success : true, response: true}
}


/******************************** DETECT ALL REGISTERED PLUGINS **************************************/
async function dectectListOfPlugins(req,res,next){
  console.log('in detect list of plugins');
  let listOfPlugins = await getListOfPluginsInDB()
  if(listOfPlugins.success === true){
    let createdResp = commonUtils.createResponse(STATUS.SUCCESS, listOfPlugins.response)
    commonUtils.sendResponse(req, res, createdResp, next)
  }else{
    let createdResp = commonUtils.createResponse(STATUS.ERROR.DETECTING_PLUGINS,'',error)
    commonUtils.sendResponse(req, res, createdResp, next)
  }

}

async function getListOfPluginsInDB(){
  try{
    return models.plugins.findAll({
      raw: true,
      where : {
        IsActive : true
      }
    }).then(registeredPlugins =>{
      return {success: true, response: registeredPlugins}
    }).catch(err =>{
      return {success: false, response: err}
    })
  }catch(error){
    return {success: false, response: error}
  }
}




/*********************************** ENABLE OR DISABLE THE PLUGIN SERVICES (Update in DB in plugin_details table) *****************************************/
async function enableAndDisablePluginServices(req,res,next){
  let pluginInfo = req.body
  console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&pluginInfo:",req.body) 
  try{
    models.plugins.update({
      ServicesEnabled : pluginInfo.serviceEnable
    },{
      where : {
        Uid : pluginInfo.uid
      }
    }).then(async response =>{
      console.log("RESPONSE:",response)
      if( !(_.includes(response, 0)) ){
        console.log("Coming to IF:")
        let allPlugins = await getListOfPluginsInDB()
        console.log("allPlugins:",allPlugins)
        if(allPlugins.success === true){
          console.log("Coming to success:",AllDetectedPluginsHashTable['sample'])
          if(AllDetectedPluginsHashTable[(pluginInfo.uniqueName).toLowerCase()]){
            AllDetectedPluginsHashTable[(pluginInfo.uniqueName).toLowerCase()].servicesEnabled = pluginInfo.serviceEnable //updating detectedPlugins Hash table
          }          
          let appConfigInfo = await commonUtils.createAppConfigInfoSchema(AppConfig)
          allPlugins.response.unshift(appConfigInfo)
          console.log("Creation of resp")
          let createdResp = commonUtils.createResponse(STATUS.SUCCESS, allPlugins.response)
          commonUtils.sendResponse(req, res, createdResp, next)
        }else{
          console.log("Coming to else")
          let createdResp = commonUtils.createResponse(STATUS.ERROR.UPDATE_ENABLE_DISABLE_PLUGIN_SERVICES,'',allPlugins.response)
          commonUtils.sendResponse(req, res, createdResp, next)
        }
      }else{
        console.log("Coming to else2")
        let createdResp = commonUtils.createResponse(STATUS.ERROR.UPDATE_ENABLE_DISABLE_PLUGIN_SERVICES,'','Requested uid not found in DB')
        commonUtils.sendResponse(req, res, createdResp, next)
      }

    }).catch(err =>{
      console.log("Coming to Catch:",err)
      let createdResp = commonUtils.createResponse(STATUS.ERROR.UPDATE_ENABLE_DISABLE_PLUGIN_SERVICES,'',err)
      commonUtils.sendResponse(req, res, createdResp, next)
    })
  }catch(error){
    console.log("Coming to Catch2")
    let createdResp = commonUtils.createResponse(STATUS.ERROR.UPDATE_ENABLE_DISABLE_PLUGIN_SERVICES,'',error)
    commonUtils.sendResponse(req, res, createdResp, next)
  }
}



/*************************** GET PLUGIN BY UID ******************************/
async function getRegisteredpluginById(req,res,next){
  if(req.params.id){
    let pluginUid = req.params.id
    console.log("Plugin ID:",pluginUid)
    let plugin = await getPluginFromDbByID(pluginUid)
    console.log("Plugin:",plugin)
    if(plugin.success === true){
      if((plugin.response != null)){
        let createdResp = commonUtils.createResponse(STATUS.SUCCESS, plugin.response)
        commonUtils.sendResponse(req, res, createdResp, next)
      }else{
        let createdResp = commonUtils.createResponse(STATUS.SUCCESS, 'No plugins found with the requested id')
        commonUtils.sendResponse(req, res, createdResp, next)
      }

    }else{
      let createdResp = commonUtils.createResponse(STATUS.ERROR.REGISTERED_PLUGIN_BY_ID,'',STATUS.ERROR.REGISTERED_PLUGIN_BY_ID[1])
      commonUtils.sendResponse(req, res, createdResp, next)
    }
  }else{
    let createdResp = commonUtils.createResponse(STATUS.ERROR.PLUGIN_ID_NOT_FOUND_REGISTERED_PLUGIN)
    commonUtils.sendResponse(req, res, createdResp, next)
  }
}

async function getPluginFromDbByID(pluginUid){
  try{
    return await models.plugins.findOne({
      raw : true,
      where:{
        Uid : pluginUid
      }
    }).then(plugin =>{
      return  {success: true , response : plugin}
    }).catch(err =>{
      console.log("Error while finding the plugin with plugin-ID:",err)
      return {success: false , response : err}
    })

  }catch(error){
    return {success: false , response : error}
  }
}


/********************** RESTART ALL PLUGIN SERVICES **************************/
async function restartAllPluginServices(req,res,next){
  let isSecurityPluginAvailable = await ISASctrl.detectSecurityPluginAndConfigDetails()
  console.log(isSecurityPluginAvailable && isSecurityPluginAvailable.success === true ? '## Security plugin not found' : 'Security plugin found')
  if(isSecurityPluginAvailable && isSecurityPluginAvailable.success === true){
    isSecurityPluginAvailable = isSecurityPluginAvailable.response;
    let licenceCheck = await checkLicenceForPlugin(isSecurityPluginAvailable)
    licenceCheck.success === true ? isSecurityPluginAvailable.IsLicenced =  true : isSecurityPluginAvailable.IsLicenced = false;
    let pluginConfigInfo = await checkAndStoreConfigInfoOfPlugins(isSecurityPluginAvailable)
    if(pluginConfigInfo && pluginConfigInfo.success === true){
      let doneWithInitialSteps = await doInitialStepsWithSecurityPlugin(pluginConfigInfo.response)
      if(doneWithInitialSteps.success != true){
        let createdResp = commonUtils.createResponse(STATUS.ERROR.RESTARTING_ALL_PLUGIN_SERVICES,'',STATUS.ERROR.RESTARTING_ALL_PLUGIN_SERVICES[1])
        commonUtils.sendResponse(req, res, createdResp, next)
      }else{
        let listOfPlugins = await getListOfPluginsInDB()
        if(listOfPlugins.success === true){
          let createdResp = commonUtils.createResponse(STATUS.SUCCESS, listOfPlugins.response)
          commonUtils.sendResponse(req, res, createdResp, next)
        }else{
          let createdResp = commonUtils.createResponse(STATUS.SUCCESS, doneWithInitialSteps.response)
          commonUtils.sendResponse(req, res, createdResp, next)
        }
      }
    }
  }else{
    let createdResp = commonUtils.createResponse(STATUS.ERROR.RESTARTING_ALL_PLUGIN_SERVICES,'',STATUS.ERROR.RESTARTING_ALL_PLUGIN_SERVICES[1])
    commonUtils.sendResponse(req, res, createdResp, next)
  }
}


async function restartinvidualPluginServices(req,res,next){
  console.log("Plugin Uid:",req.params.uid)
  let pluginUid = req.params.uid
  let plugin = await getPluginFromDbByID(pluginUid); 
  if(plugin.success === true){
    let availablePlugins = await commonUtils.getDetectedPluginConfigFiles();
    availablePlugins = availablePlugins.acceptedPluginConfigFiles || [];
    if(availablePlugins && availablePlugins.length > 0){
      let count = 0
      let found = false
      availablePlugins.forEach(async detectedPlugin => {
        if(plugin.response.UniqueName === detectedPlugin.uniqueName){
          count = count + 1;
          found = true;
          let doneWithRestartingPluginServices = await doIndividualPluginServicesRestart(detectedPlugin);
          if(doneWithRestartingPluginServices.success === true){
            let createdResp = commonUtils.createResponse(STATUS.SUCCESS, doneWithRestartingPluginServices.response)
            commonUtils.sendResponse(req, res, createdResp, next)
          }else{
            let createdResp = commonUtils.createResponse(STATUS.ERROR.RESTARTING_INDIVIDUAL_PLUGIN_SERVICES,'',STATUS.ERROR.RESTARTING_INDIVIDUAL_PLUGIN_SERVICES[1])
            commonUtils.sendResponse(req, res, createdResp, next)
          }
        }else{ count = count + 1 }

        if(availablePlugins.length === count){
          if(found === false){
            let createdResp = commonUtils.createResponse(STATUS.ERROR.RESTARTING_INDIVIDUAL_PLUGIN_SERVICES,'',STATUS.ERROR.RESTARTING_INDIVIDUAL_PLUGIN_SERVICES[1])
            commonUtils.sendResponse(req, res, createdResp, next)
          }
        }
      });
    }else{
      let createdResp = commonUtils.createResponse(STATUS.ERROR.RESTARTING_INDIVIDUAL_PLUGIN_SERVICES,'',STATUS.ERROR.RESTARTING_INDIVIDUAL_PLUGIN_SERVICES[1])
      commonUtils.sendResponse(req, res, createdResp, next)
    }
  }else{
    let createdResp = commonUtils.createResponse(STATUS.ERROR.RESTARTING_INDIVIDUAL_PLUGIN_SERVICES,'',STATUS.ERROR.RESTARTING_INDIVIDUAL_PLUGIN_SERVICES[1])
    commonUtils.sendResponse(req, res, createdResp, next)
  } 
}


async function doIndividualPluginServicesRestart(plugin){

  console.log(plugin);

  let configDetails = await ISASctrl.getPluginsConfigurationDetails(plugin)
  // console.log("----------- after getting response from config file:",configDetails)
  // console.log("----------- Not a security plugin",(configDetails.response.uniqueName && (configDetails.response.uniqueName).toLowerCase() != (AppConfig.securityApp).toLowerCase()))
  if(configDetails && configDetails.success === true){

      let licenceCheck = await checkLicenceForPlugin(configDetails.reponse)
      // console.log("licenceCheck :",licenceCheck)
      configDetails.response.IsLicenced = licenceCheck.success === true ?  true : false;

      //console.log("-----------> ######## IS ISAS PLUGIN :",(configDetails.response.uniqueName && (configDetails.response.uniqueName).toLowerCase() != (AppConfig.securityApp).toLowerCase()))
      if((configDetails.response.uniqueName && (configDetails.response.uniqueName).toLowerCase() != (AppConfig.securityApp).toLowerCase())){
        let registration = await registerApplicationWithSecurityPlugin(configDetails.response)
        // console.log("------------>#### in DO INDIVIDUAL RESTART REGITRATION OF PLUGIN:",registration)
        if(registration && registration.success === true){
          configDetails.response.IsRegistered = true
          configDetails.response.ServicesEnabled = true
          configDetails.response.Guid = registration.response.ApplicationGuid
          let storeConfigDetailsInDb = await checkAndStoreConfigInfoOfPlugins(configDetails.response)
          if(storeConfigDetailsInDb && storeConfigDetailsInDb.success === true){
            let pluginRedirectionUrl = plugin.baseUrl + ':' + plugin.serverPort
            let pluginHashTable = {}
            pluginHashTable.name = configDetails.response.name
            pluginHashTable.url = pluginRedirectionUrl
            pluginHashTable.prependUrl = plugin.prependUrl
            pluginHashTable.servicesEnabled = storeConfigDetailsInDb.response.ServicesEnabled
            pluginHashTable.IsLicenced = storeConfigDetailsInDb.response.IsLicenced
            AllDetectedPluginsHashTable[(configDetails.response.uniqueName).toLowerCase()] = {}
            AllDetectedPluginsHashTable[(configDetails.response.uniqueName).toLowerCase()] = pluginHashTable
            // console.log("ALL DETECTED PLUGINS HASH TABLE:",AllDetectedPluginsHashTable)
            return {success : true, response: storeConfigDetailsInDb.response, plugin:plugin }
          }else{ return {success : false, response: storeConfigDetailsInDb.response, plugin:plugin } }
        }else{ return {success : false, response: registration.response, plugin:plugin} }
      }else{
       
          configDetails.response.IsRegistered = true
          configDetails.response.ServicesEnabled = true
          let storeConfigDetailsInDb = await checkAndStoreConfigInfoOfPlugins(configDetails.response)
          if(storeConfigDetailsInDb && storeConfigDetailsInDb.success === true){
            let pluginRedirectionUrl = plugin.baseUrl + ':' + plugin.serverPort
            let pluginHashTable = {}
            pluginHashTable.name = configDetails.response.name
            pluginHashTable.url = pluginRedirectionUrl
            pluginHashTable.prependUrl = plugin.prependUrl
            pluginHashTable.servicesEnabled = storeConfigDetailsInDb.response.ServicesEnabled
            pluginHashTable.IsLicenced = storeConfigDetailsInDb.response.IsLicenced
            AllDetectedPluginsHashTable[(configDetails.response.uniqueName).toLowerCase()] = {}
            AllDetectedPluginsHashTable[(configDetails.response.uniqueName).toLowerCase()] = pluginHashTable
            // console.log("ALL DETECTED PLUGINS HASH TABLE:",AllDetectedPluginsHashTable)
            return {success : true, response: storeConfigDetailsInDb.response, plugin:plugin }
          }else{ return {success : false, response: storeConfigDetailsInDb.response, plugin:plugin } }
      }

    // }else{
    //   return {success : false, response: 'SecurityPlugin cannot be able to restart, if need restart Enterprise Configurator', plugin:plugin}
    // }
  }else{
    // console.log("AllDetectedPluginsHashTable:",AllDetectedPluginsHashTable)    
    return {success : false, response: configDetails.response, plugin:plugin}
  }
}

async function disablePluginServicesByUniqueName(plugin){
  try{
    return models.plugins.update({
      ServicesEnabled : false,
    },{
      where : {
        // name : plugin.name
        [SequelizeOperator.or] : [
          {
            name : plugin.name
          },
          {
            PrependUrl : plugin.prependUrl
          }
        ]
      }
    }).then(resp=>{
      return {success: true, response: resp}
    }).catch(error=>{
      return {success: false, response: error}
    })
  }catch(err){
    return {success: false, response: err}
  }
}



/********** GET PLUGIN FROM DB BY NAME *********************/
async function getPluginFromDbByName(pluginName){
  if(pluginName){
    try{
      return models.plugins.findOne({
        raw: true,
        where : {
          UniqueName : pluginName
        }
      }).then(plugin =>{
        if(plugin){
          return {success: true, response: plugin}
        }else{
          return {success: false, response: "Requested plugin found as not registered"}
        }
      }).catch(err =>{
        return {success: false, response: err}
      })
    }catch(error){
  
    }
  }else{
    return {success : false, response: "plugin name not found in request"}
  }

}

/***********************************************************************************************************************************************************************
 ******************************************************** END OF NEW CHANGES *******************************************************************************************
 ************************************************************************************************************************************************************************/

         

/*******************************************
 ***** GET LICENSE MANAGER PLUGIN INFO *****
********************************************/
async function getLicenseManagerInfo(req,res,next){
  let licenseManagerPluginInfo = await ISASctrl.getLicensePluginConfigInfo();
  if(licenseManagerPluginInfo){
    let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, licenseManagerPluginInfo)
    commonUtils.sendResponse(req, res, createdResp, next)
  }else{
    let createdResp = await commonUtils.createResponse(STATUS.ERROR.GET_LICENSEMANAGER_INFO,'')
    commonUtils.sendResponse(req, res, createdResp, next)
  }
}


/*******************************************
 ***** GET NOTIFICATION MANAGER URL*** *****
********************************************/
async function getNotificationManagerUrl(req,res,next){
  let notificationManagerPluginInfo = await ISASctrl.getNotificationPluginConfigInfo();
  if(notificationManagerPluginInfo && notificationManagerPluginInfo.BaseUrl && notificationManagerPluginInfo.UiPort){
    let obj = {
      notificationViewerUiUrl : notificationManagerPluginInfo.BaseUrl + ':' + notificationManagerPluginInfo.UiPort
    }
    let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, obj)
    commonUtils.sendResponse(req, res, createdResp, next)
  }else{
    let createdResp = await commonUtils.createResponse(STATUS.ERROR.GET_NOTIFICATION_VIEWER_URL,'Failed to fetch the notification manager')
    commonUtils.sendResponse(req, res, createdResp, next)
  }
}



module.exports = {
  checkAndStoreConfigInfoOfPlugins : checkAndStoreConfigInfoOfPlugins,
  doInitialStepsWithSecurityPlugin : doInitialStepsWithSecurityPlugin,
  detectedPluginsHashtable : AllDetectedPluginsHashTable,
  enableAndDisablePluginServices : enableAndDisablePluginServices,
  getRegisteredpluginById : getRegisteredpluginById,
  dectectListOfPlugins : dectectListOfPlugins,
  restartAllPluginServices : restartAllPluginServices,
  restartinvidualPluginServices : restartinvidualPluginServices,
  getPluginFromDbByID : getPluginFromDbByID,
  getPluginFromDbByName : getPluginFromDbByName,
  getListOfPluginsInDB:getListOfPluginsInDB,
  checkDBisNewRegisteredApplication : checkDBisNewRegisteredApplication,
  getLicenseManagerInfo :getLicenseManagerInfo ,
  getNotificationManagerUrl:getNotificationManagerUrl,
  // checkIsPluginRegistered : checkIsPluginRegistered,   
  // allRegisteredPluginList : allRegisteredPluginList,
}
