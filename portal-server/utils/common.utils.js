var jsonxml = require('jsontoxml');
var path = require('path');
var o2x = require('object-to-xml');
const fs = require('fs');
const glob = require('glob');
var moment = require('moment');
var crypto = require('crypto');
var AppConfig = require('../config/app-config')
const _ = require('lodash');
const uuidv1 = require('uuid/v1');
// const models = require('../models');
// var session = require('express-session');

async function schemaOfPluginConfigInfo(pluginInfo, previousDataOfPluginInfo){
    //console.log("previousDataOfPluginInfo:",previousDataOfPluginInfo)
    if(previousDataOfPluginInfo){
        pluginInfo.Uid = previousDataOfPluginInfo.Uid
        // pluginInfo.ServicesEnabled = previousDataOfPluginInfo.ServicesEnabled
    }
    let schema = {
        //Uid: pluginInfo.Uid ? pluginInfo.Uid : uuidv1(),
        Uid: pluginInfo.Uid ? pluginInfo.Uid : pluginInfo.Guid ? pluginInfo.Guid : 'Default-'+uuidv1(),
        Name: pluginInfo.name ? pluginInfo.name : '',
        UniqueName: pluginInfo.uniqueName ? pluginInfo.uniqueName : '',
        Version: pluginInfo.version ? _.toString(pluginInfo.version) : '',
        Description: pluginInfo.description ? pluginInfo.description : '',
        UiPort: pluginInfo.uiPort ? _.toString(pluginInfo.uiPort) : '',
        BaseUrl: pluginInfo.baseUrl ? pluginInfo.baseUrl : '',
        Type: pluginInfo.type ? pluginInfo.type : '',
        Instances: pluginInfo.instances ? _.toString(pluginInfo.instances) : '',
        ServerPort: pluginInfo.serverPort ? _.toString(pluginInfo.serverPort) : '',
        PrependUrl: pluginInfo.prependUrl ? pluginInfo.prependUrl : '',
        IconUrl : pluginInfo.iconUrl ? pluginInfo.iconUrl : '',
        UiUrls: pluginInfo.uiUrls ? JSON.stringify(pluginInfo.uiUrls) : '',
        ServerUrls: pluginInfo.serverUrls ? JSON.stringify(pluginInfo.serverUrls)  : '',
        IsRegistered: pluginInfo.IsRegistered ? pluginInfo.IsRegistered : false,
        ServicesEnabled: pluginInfo.ServicesEnabled ? pluginInfo.ServicesEnabled : true,
        IsLicenced: pluginInfo.IsLicenced ? pluginInfo.IsLicenced : false,
        IsActive: pluginInfo.IsActive ? pluginInfo.IsActive : true,
        CreatedDate: pluginInfo.CreatedDate,
        LastModifiedDate: pluginInfo.LastModifiedDate
    }
    // console.log("schema:",schema)
    return schema;
}

async function schemaOfNodeCreation(nodeObj, req){
    let schema = {
        NodeName: nodeObj.nodeName ? nodeObj.nodeName : null,
        NodeShortName: nodeObj.nodeShortName ? nodeObj.nodeShortName : nodeObj.nodeName,
        ParentID: nodeObj.parentId ? nodeObj.parentId : null,
        NodeType: nodeObj.nodeType ? nodeObj.nodeType : null,
        TypeOf: nodeObj.typeOf == 0 ? 0 : nodeObj.typeOf != 0 ? nodeObj.typeOf : null,
        PluginID: nodeObj.pluginId ? nodeObj.pluginId : null,
        NodeInfo: nodeObj.nodeInfo ? nodeObj.nodeInfo : null,
        PluginInfoId: nodeObj.pluginInfoId ? nodeObj.pluginInfoId : null,
        IsActive: nodeObj.isActive ? nodeObj.isActive : null,
        // CreatedBy: nodeObj.nodeUid ? '' : req.session.user,
        CreatedBy: nodeObj.nodeUid ? null : 'test',
        // ModifiedBy: req.session.user ? req.session.user : ''
        ModifiedBy: req.session ? req.session.user ? req.session.user : 'test' : 'test'
    }
    if(nodeObj.uid){
        schema.Uid = nodeObj.uid
    }
    return await schema;
}

async function createApiToGetPluginConfigDetails(baseUrl, serverPort, prependUrl){
    return baseUrl + ':' + serverPort + prependUrl + AppConfig.PortalUrls.getPluginConfigDetailsAPI
}

async function createRegisterationApi(securityPluginInfo){
    console.log("CREATING API FOR REGISTRATION WITH SECURITY PLUGIN INFO")
    let registerationApi
    if(securityPluginInfo && securityPluginInfo.ServerPort && securityPluginInfo.BaseUrl && securityPluginInfo.ServerUrls){
        let securityPluginBaseUrl = securityPluginInfo.BaseUrl,
            securityPluginPort = securityPluginInfo.ServerPort, 
            securityPluginServerUrls = securityPluginInfo.ServerUrls

        registerationApi = securityPluginBaseUrl +':'+ securityPluginPort +'/' + securityPluginServerUrls.applicationRegistration
        return registerationApi
    }else{
        return registerationApi = false
    }
}

async function createPrivilegesRegisterationApi(securityPluginInfo){
    console.log("CREATING API FOR PRIVELEGES REGISTRATION WITH SECURITY PLUGIN INFO")
    let privilegesRegisterationApi
    if(securityPluginInfo && securityPluginInfo.ServerPort && securityPluginInfo.BaseUrl && securityPluginInfo.ServerUrls){
        let securityPluginBaseUrl = securityPluginInfo.BaseUrl,
            securityPluginPort = securityPluginInfo.ServerPort, 
            securityPluginServerUrls = securityPluginInfo.ServerUrls

        privilegesRegisterationApi = securityPluginBaseUrl +':'+ securityPluginPort +'/' + securityPluginServerUrls.privilegeRegistration
        return privilegesRegisterationApi
    }else{
        return privilegesRegisterationApi = false
    }
}


async function createAuthenticationApi(securityPluginInfo){
    console.log("CREATING API FOR AUTHENTICATION")
    let authenticationApi
    if(securityPluginInfo && securityPluginInfo.ServerPort && securityPluginInfo.BaseUrl && securityPluginInfo.ServerUrls){
        let securityPluginBaseUrl = securityPluginInfo.BaseUrl,
            securityPluginPort = securityPluginInfo.ServerPort, 
            securityPluginServerUrls = securityPluginInfo.ServerUrls

        authenticationApi = securityPluginBaseUrl +':'+ securityPluginPort +'/' + securityPluginServerUrls.userAuthentication
        return authenticationApi
    }else{
        return authenticationApi = false
    }
}


async function createApiToGetRolesAndPrivilegesForUser(securityPluginInfo){
    console.log("CREATING API TO GET ROLES AND PRIVILEGES OF USER")
    let getRolesAndPrivilegesApi
    if(securityPluginInfo && securityPluginInfo.ServerPort && securityPluginInfo.BaseUrl && securityPluginInfo.ServerUrls){
        let securityPluginBaseUrl = securityPluginInfo.BaseUrl,
            securityPluginPort = securityPluginInfo.ServerPort, 
            securityPluginServerUrls = securityPluginInfo.ServerUrls

            getRolesAndPrivilegesApi = securityPluginBaseUrl +':'+ securityPluginPort +'/' + securityPluginServerUrls.introspect
        return getRolesAndPrivilegesApi
    }else{
        return getRolesAndPrivilegesApi = false
    }
}



async function createApiSchemaForSecurityPlugin(reqApi,reqMethod,requestBody,hashedBase64,reqHeaders){
    let headers = hashedBase64 ? { "Content-Type" : 'application/json', "Authorization" : "Basic "+hashedBase64} : { "Content-Type" : 'application/json'}
    if(reqHeaders){
        headers["accesstoken"] = "abcd1234"
    }
    let apiSchema
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

    return apiSchema
}
async function createReqBodyOfGetNewToken(refreshToken){
    let reqBody = {
        newtokenrequest : {
            refreshtoken : refreshToken
        }
    }
    return reqBody;
}

async function createApiSchemaToGetNewToken(securityPluginInfo){
    if(securityPluginInfo && securityPluginInfo.ServerPort && securityPluginInfo.BaseUrl && securityPluginInfo.ServerUrls){
        let getNewTokenApi;
        let securityPluginBaseUrl = securityPluginInfo.BaseUrl,
            securityPluginPort = securityPluginInfo.ServerPort, 
            securityPluginServerUrls = securityPluginInfo.ServerUrls
        if(securityPluginServerUrls.getNewToken){
            getNewTokenApi = securityPluginBaseUrl +':'+ securityPluginPort +'/' + securityPluginServerUrls.getNewToken
            return {success:true, response:getNewTokenApi}
        }else{
            return {success:false, response:"'getNewToken' api field not found in the security plugin config info in DB"}
        }
    }else{
        return {success:false, response:"required fields not found in security plugin config info in DB"}
    }
}

async function createAppConfigInfoSchema(appConfig){
    let appConfigInfo = {
        Name : appConfig.name,
        Description : appConfig.description,
        UniqueName : appConfig.uniqueName,
        Version : appConfig.version,
        UiPort : 4200,
        BaseUrl : appConfig.baseUrl,
        ServerPort : appConfig.serverPort,
        SecurityApp : appConfig.securityApp,
        Type : 'Default',
        Privileges : appConfig.privileges,
        IsRegistered : false,  
        ServicesEnabled : appConfig.isServicesEnabled         
    }
    return appConfigInfo
}



function createResponse(status, respData, errorData){
    let response = {
        responseCode : status[0],
        statusCode : status[2]
    }

    if(status[0] != 0){
        response.statusMessage = status[1]
    }

    if(respData){
        response.data = respData
    }

    if(errorData){
        response.errorMessage = errorData
    }

    return response;
}


function sendResponse(req,res,message,next){
    //console.log("%%%:",req.headers)
    if(req.headers['content-type'] && req.headers['content-type'].toLowerCase().indexOf("xml") != -1){
        res.set('Content-Type', 'text/xml');
        res.status(message.statusCode).send(o2x({
            '?xml version="1.0" encoding="utf-8"?' : null,
            message
        }));
    }else{
        res.status(message.statusCode).send(message)
    }
    
}


async function createHmacHash(ApplicationId, ApplicationSecret){

    console.log("Secret key:", ApplicationSecret)
    let UtcDateTime = moment.utc().format();
    console.log("MOMENT TIME:", UtcDateTime)
    let hmac = await crypto.createHmac('sha256', ApplicationSecret).update(UtcDateTime.toString()).digest('hex');
    console.log("UtcDateTime.toString():",UtcDateTime.toString())
    console.log("HMAC:",hmac)
    let jsonObj = ApplicationId + ":" + UtcDateTime.toString() + ":" + hmac;
    let hashedBase64 = Buffer.from(jsonObj).toString('base64')
    console.log("hashedBase64:",hashedBase64)

    return hashedBase64
}





async function createRegisterApplicationBody(appName,appVersion,adminName,adminEmail,appPrivileges){
    let requestBody = {
      ApplicationRegistration : {
        ApplicationName : appName,
        ApplicationVersion : appVersion,
        AdminName : adminName,
        AdminEmail : adminEmail,
        PrivilegeDetails : {
            Privilege : []
        }
      }
    }
    let returnObj 
    if(_.isArray(appPrivileges)){
        let privilegeArr = []
        let count = 0
        _.forEach(appPrivileges,(privilege)=>{
            let privilegeSchema =  {
                name : privilege.name,
                key : privilege.key
            }  
      
            count = count + 1
            privilegeArr.push(privilegeSchema)
            if(count == appPrivileges.length){
            //   console.log("privilegeArr : ",privilegeArr)
              if(privilegeArr < appPrivileges.length){
                returnObj= {success : false, response : "Privileges schema should have to be (name,key)"}
              }else{
                // console.log("privilegeArr success in register api schema")
                requestBody.ApplicationRegistration.PrivilegeDetails.Privilege = privilegeArr
                returnObj = {success : true, response : requestBody}
              }         
            }
        })
    }else if(_.isPlainObject(appPrivileges)){
        let privilegeArr = []
        privilegeArr.push(appPrivileges)
        requestBody.ApplicationRegistration.PrivilegeDetails.Privilege = privilegeArr
        returnObj = {success : true, response : requestBody}
    }else{
        returnObj = { success: false , response : "Privileges should have to be in Array in configuration file"}
    }
    return returnObj
}


async function createPrivilegeRegistrationApiBody(appPrivileges){
    let privilegeArr = []
    let configFilePrivileges = appPrivileges
    let returnObj 
    if(_.isArray(configFilePrivileges)){
      let count = 0
      let requestBody2 = {
        privilegeregistration : {
          privilege : []
        }
      }
      _.forEach(configFilePrivileges,(configPrivilege)=>{
        let privilegeSchema =  {
            name : configPrivilege.name,
            description : configPrivilege.description,
            key : configPrivilege.key
        }  
  
        count = count + 1
        privilegeArr.push(privilegeSchema)
        if(count == configFilePrivileges.length){
          console.log("privilegeArr : ",privilegeArr)
          if(privilegeArr < configFilePrivileges.length){
            returnObj= {success : false, response : "Privileges schema should have to be (name,description,key)"}
          }else{
            console.log("privilegeArr success ")
            requestBody2.privilegeregistration.privilege = privilegeArr
            returnObj = {success : true, response : requestBody2}
          }         
        }
      })
    }else{
      returnObj = { success: false , response : "Privileges should have to be in Array in configuration file"}
    }  
    return returnObj  
}


async function createLDAPauthenticationApiReqBody(userName, password, authenticationType){
    let requestBody = {
        authenticationRequest : {
            authenticationType : authenticationType,
            authenticationMethod : 'Password',
            authenticationParameters : {
                username : userName,
                password : password
                //domainname : 'icuinnov.corp'
            }
        }
    }
    return requestBody;
}

async function createStandaloneUserAuthenticationApiReqBody(userName, password, authenticationType){
    let requestBody = {
        authenticationRequest : {
            authenticationType : authenticationType,
            authenticationMethod : 'Password',
            authenticationParameters : {
                username : userName,
                password : password
            }
        }
    }
    return requestBody;
}


async function createReqBodyToGetRolesAndPrivilegesForUser(userAccessToken, siteId){
    let requestBody = {
        introspectrequest : {
          accesstoken : userAccessToken,
          siteid : siteId
        }
    }
    return requestBody;
}



async function getDetectedPluginConfigFiles(){
    let acceptedPluginConfigFiles = [], rejectedPluginsConfigFiles = [], pluginConfigFiles = {}
    return new Promise((resolve,reject)=>{
        glob(process.env.PLUGINS_PATH, async function(err,files){
            if(err){
                reject(err)
            }else{
                if(files && files.length > 0){
                    let totalCount = files.length, acceptedCount = 0, rejectedCount = 0
                    for(let i=0;i<files.length;i++){
                        let plugingData =await require('../'+files[i]);
                        if(plugingData && plugingData.name && plugingData.serverPort && plugingData.baseUrl && plugingData.prependUrl){
            
                        acceptedCount = acceptedCount + 1
                        acceptedPluginConfigFiles.push(plugingData)    
                        }else{
                        rejectedCount = rejectedCount + 1
                        rejectedPluginsConfigFiles.push(plugingData)
                        }

                        if(totalCount == acceptedCount + rejectedCount){
                            //console.log("#####%%% REJECTED PLUGINS :",rejectedCount)
                            //console.log("#####%%% ACCEPTED PLUGINS :",acceptedCount)
                            //console.log("#####%%% TOTAL DETECTED PLUGINS :",totalCount)
                            pluginConfigFiles.acceptedPluginConfigFiles = acceptedPluginConfigFiles
                            pluginConfigFiles.rejectedPluginsConfigFiles = rejectedPluginsConfigFiles
                            
                            resolve(pluginConfigFiles)
                        }
            
                    }
                }else{
                    pluginConfigFiles.acceptedPluginConfigFiles = acceptedPluginConfigFiles
                    pluginConfigFiles.rejectedPluginsConfigFiles = rejectedPluginsConfigFiles

                    resolve(pluginConfigFiles)
                }
        
            }
        })
      })
}



async function createUserSession(req, response){
   /*  console.log("###@@@ SESSION INFO :",req.session)
    console.log("###@@@ SESSION INFO :",req.session.id)
    console.log("###@@@ response INFO :",response) */

    try{
        let currentExpiryTime = new Date(response.AccessToken_ExpiryTime) - new Date(Date.now())

        // let sessionId  = req.session.id, seesionExpiry = req.session.cookie.originalMaxAge = response.ExpiresIn * 60
        let sessionId  = req.session.id, seesionExpiry  = new Date(Date.now() + 3600000); 
        console.log("###@@@ SESSION OBJ :",seesionExpiry)
        let sessionObj = {
            sessionId : sessionId,
            userName : response.userName,
            mappedPrivileges : response.MappedPrivileges,
            authenticationType : response.authenticationType,
            expires : seesionExpiry
        }
        req.session.userName = response.userName
        req.session.accessToken = response.AccessToken
        req.session.refreshToken = response.RefreshToken
        req.session.privileges = JSON.stringify(response.MappedPrivileges)
        req.session.expires = seesionExpiry
        req.session.tokenRefreshedAt = new Date(Date.now()),
        req.session.tokenTimeOutInterval = currentExpiryTime

        /* return models.mySessionStore.set(sessionId,sessionObj,(err,resp)=>{
            if(err){
                console.log("###@@@ err INFO :",err)
            }
            console.log("RRRRR:",resp)
            return _.assign({},response,{sessionId:sessionId, expires : seesionExpiry})
        }) */

        /*req.session.save((err,resp)=>{
            if(err){
                console.log("###@@@ err INFO :",err)
            }
            console.log("Created Session")
        })*/
        // return _.assign({},response,{sessionId:sessionId, expires : seesionExpiry})
        return sessionObj
        
    }catch(error){
        console.log("Error of session creation:",error)
        let sessionObj = {
            sessionId : req.session.id,
            userName : response.userName,
            mappedPrivileges : response.MappedPrivileges,
            authenticationType : response.authenticationType,
            expires : seesionExpiry
        }
        return sessionObj
    }
}



async function createDefaultUserReqBody(rootNodeInfo){
    let requestBody = {
        defaultUserRequest: {
            nodeinfo: {
                uid: rootNodeInfo.Uid,
                nodeid: 1,
                nodename:"Enterprises",
                nodetype: 'enterprise-hierarchy'
            }
        }
    }
    return requestBody;
}



async function createDefaultUserApiSchema(securityPluginInfo){
    let createDefaultUserApi
    if(securityPluginInfo && securityPluginInfo.ServerPort && securityPluginInfo.BaseUrl && securityPluginInfo.ServerUrls){
        let securityPluginBaseUrl = securityPluginInfo.BaseUrl,
            securityPluginPort = securityPluginInfo.ServerPort, 
            securityPluginServerUrls = securityPluginInfo.ServerUrls

            createDefaultUserApi = securityPluginBaseUrl +':'+ securityPluginPort +'/' + securityPluginServerUrls.createDefaultUser
        return createDefaultUserApi
    }else{
        return createDefaultUserApi = false
    }
}


async function createReqBodyOfValidateApplication(accessToken){
    let reqBody = {
        Validateapplicationrequest:{
            Applicationtoken: accessToken
        }
    }
    return reqBody;  
}

async function createValidateApplicationApi(securityPluginInfo){
    let getValidateApplicationApi
    if(securityPluginInfo && securityPluginInfo.ServerPort && securityPluginInfo.BaseUrl && securityPluginInfo.ServerUrls){
        let securityPluginBaseUrl = securityPluginInfo.BaseUrl,
            securityPluginPort = securityPluginInfo.ServerPort, 
            securityPluginServerUrls = securityPluginInfo.ServerUrls
        if(securityPluginServerUrls.validateApplication){
            getValidateApplicationApi = securityPluginBaseUrl +':'+ securityPluginPort +'/' + securityPluginServerUrls.validateApplication
        }else{
            getValidateApplicationApi = false
        }            
        return getValidateApplicationApi
    }else{
        return false
    }
}




/* function assignAutoIncrementNumber(callback){
    fs.exists('auto-increment.json', function(exists) {
        if (exists) {
            let rawdata = fs.readFileSync('auto-increment.json');
            let data = JSON.parse(rawdata);
            console.log("INCREMENT NUMBER",data);
            data.incrementNumber = data.incrementNumber + 1

            fs.writeFileSync('auto-increment.json', JSON.stringify(data),(err)=>{
                if(err){
                    console.log(err)
                }else{
                    console.log("Created successfully")
                }
            });
            let id = data.incrementNumber
            callback(null,id);
        }else{
            let obj = {
                incrementNumber : 1
            }
            let json = JSON.stringify(obj);
            fs.writeFile('auto-increment.json', json,(err)=>{
            if(err){
                console.log(err)
            }else
                console.log("Created successfully")
            });
            let id = obj.incrementNumber
            callback(null,id);
        }
    });
} */

module.exports = {
    schemaOfPluginConfigInfo : schemaOfPluginConfigInfo,
    schemaOfNodeCreation : schemaOfNodeCreation,
    createRegisterationApi : createRegisterationApi,
    createPrivilegesRegisterationApi : createPrivilegesRegisterationApi,
    createApiToGetPluginConfigDetails : createApiToGetPluginConfigDetails,
    createPrivilegeRegistrationApiBody : createPrivilegeRegistrationApiBody,
    createApiSchemaForSecurityPlugin : createApiSchemaForSecurityPlugin,
    createLDAPauthenticationApiReqBody : createLDAPauthenticationApiReqBody,
    createStandaloneUserAuthenticationApiReqBody : createStandaloneUserAuthenticationApiReqBody,
    createAuthenticationApi : createAuthenticationApi,
    createApiToGetRolesAndPrivilegesForUser : createApiToGetRolesAndPrivilegesForUser,
    createReqBodyToGetRolesAndPrivilegesForUser : createReqBodyToGetRolesAndPrivilegesForUser,
    createUserSession : createUserSession,
    createAppConfigInfoSchema : createAppConfigInfoSchema,
    createReqBodyOfGetNewToken: createReqBodyOfGetNewToken,
    createApiSchemaToGetNewToken:createApiSchemaToGetNewToken,
    createReqBodyOfValidateApplication:createReqBodyOfValidateApplication,
    createValidateApplicationApi:createValidateApplicationApi,
    
    sendResponse : sendResponse,
    createResponse : createResponse,
    // assignAutoIncrementNumber : assignAutoIncrementNumber,
    createHmacHash : createHmacHash,
    getDetectedPluginConfigFiles : getDetectedPluginConfigFiles,
    createRegisterApplicationBody : createRegisterApplicationBody,
    createDefaultUserReqBody : createDefaultUserReqBody,
    createDefaultUserApiSchema : createDefaultUserApiSchema,

}