

var STATUS = require('../utils/status-codes-messages.utils');
var commonUtils = require('../utils/common.utils')
const AppConfig = require('../config/app-config');
var env = process.env.NODE_ENV || 'development';
// var config = require(__dirname + '/../config/db.config.js')[env];
var config = require('../config/db.config')[env];
const exec = require('child_process').exec;
// var pm2 = require('pm2');
var devConfig = require('../config/db.config')['development'];
var pluginsRoute = require('./plugins.server.controller');
var commonUtils = require('../utils/common.utils');
var ISASctrl = require('./isas.server.controller')
const _ = require('lodash');
const models = require('../database');
var logger = require('../utils/winston.utils').PortalLogs;
var crmControl = require('./crm.server.controller');
var CommonCtrl = require('./common.server.controller');

/***************************************
************AUTHENTICATION *************
****************************************/
async function login(req, res, next) {
    logger.info('IN LOGIN API')
    if (AppConfig.isISASEnabled === true) {
        console.log("AUTHENTICATION WITH ISAS, ISAS STATUS:", AppConfig.isISASEnabled)
        let userName = req.body.userDetails.userName, password = req.body.userDetails.password, authenticationType = req.body.authType
        let appName = AppConfig.name, appVersion = AppConfig.version;
        let appAdminName = AppConfig.adminName ? AppConfig.adminName : null;
        let appAdminEmail = AppConfig.adminEmail ? AppConfig.adminEmail : null;
        let appPrivileges = AppConfig.privileges ? AppConfig.privileges : [];
        let requestBody = await commonUtils.createStandaloneUserAuthenticationApiReqBody(userName, password, "ISAS")

        let respOfIsRegisteredApp = await ISASctrl.isRegisteredAppWithSecurityPlugin(appName, appVersion, appAdminName, appAdminEmail, appPrivileges)
        if (respOfIsRegisteredApp && (respOfIsRegisteredApp.success === true) && (respOfIsRegisteredApp.response.RegistrationResponse.ErrorCode == 0)) {
            let appRegistrationResp = respOfIsRegisteredApp.response.RegistrationResponse;
            let securityPlugin = await ISASctrl.getSecurityPluginConfigInfo();
            let authenticationApi = await commonUtils.createAuthenticationApi(securityPlugin);
            let hashedBase64 = await commonUtils.createHmacHash(appRegistrationResp.Application_Id, appRegistrationResp.Application_Secret);
            let apiSchema = await commonUtils.createApiSchemaForSecurityPlugin(authenticationApi, 'POST', requestBody, hashedBase64);
            apiSchema.requestHeaders['x-forwarded-for'] = req.connection.remoteAddress
            console.log(apiSchema);
            ISASctrl.fetchSecurityPluginApi(apiSchema).then(async successRes => {
                if (successRes.AuthenticationResponse.ErrorCode == 0) {
                    let rolesAndPrivileges = await getRolesAndPrivilegesForUser(securityPlugin, appRegistrationResp.Application_Id, appRegistrationResp.Application_Secret, successRes.AuthenticationResponse)
                    if (rolesAndPrivileges.success === true) {
                        let finalResponse = _.assign({}, successRes.AuthenticationResponse, rolesAndPrivileges.response.IntrospectResponse, { userName: userName, authenticationType: authenticationType });
                        //console.log("SUCCESS RESPONSE FOR AUTHENTICATION:",finalResponse)
                        let sessionObj = await commonUtils.createUserSession(req, finalResponse)
                        //finalResponse = _.assign({}, finalResponse, {sessionId:sessionId});
                        console.log("SUCCESS RESPONSE FOR AUTHENTICATION:", sessionObj)
                        let sessionLog = await createSessionLog(sessionObj)
                        console.log("sessionLog", sessionLog)
                        let createdResp = commonUtils.createResponse(STATUS.SUCCESS, sessionObj)
                        commonUtils.sendResponse(req, res, createdResp, next)
                    } else {
                        let createdResp = commonUtils.createResponse(AUTEHNTICATION_FAILED_INTERNAL_ERROR)
                        commonUtils.sendResponse(req, res, createdResp, next)
                    }
                } else {
                    let createdResp = commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED, '', successRes.AuthenticationResponse)
                    commonUtils.sendResponse(req, res, createdResp, next)
                }
            }).catch(error => {
                let createdResp = commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED_INTERNAL_ERROR)
                commonUtils.sendResponse(req, res, createdResp, next)
            })
        } else {
            let createdResp = commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED_INTERNAL_ERROR)
            commonUtils.sendResponse(req, res, createdResp, next)
        }
    } else {
        console.log("AUTHENTICATION WITHOUT ISAS, ISAS STATUS:", AppConfig.isISASEnabled)
        authentication(req, res, next)
    }
}



/********** CREATE SESSION LOGS *****************/
async function createSessionLog(sessionObj) {
    logger.info('IN CREATE SESSION ')
    console.log("COMING TO LOG")
    try {
        let sessionObj1 = {
            sid: sessionObj.sessionId,
            userName: sessionObj.userName,
            expires: sessionObj.expires,
            // data : JSON.stringify(sessionObj)
        }

        return models.sessionLogs.create(sessionObj1).then(sessResp => {
            console.log("Storing Session Log")
            return true
        }).catch(error => {
            console.log("error Storing Session Log", error)
            return false
        })
    } catch (err) {
        logger.error('ERROR IN  CREATING SESSION');
        console.log("error Storing Session Log", err)
        return false
    }

}



/******************* ALTERNATE AUTHENTICATION METHOD WITHOUT SECURITY PLUGIN ********************/
async function authentication(req, res, next) {
    let createdResp = commonUtils.createResponse(STATUS.SUCCESS, req.body)
    commonUtils.sendResponse(req, res, createdResp, next)
}



/******************* GET ROLES AND PRIVILEGES OF USER ********************/
async function getRolesAndPrivilegesForUser(securityPlugin, ApplicationId, ApplicationSecret, userTokenInfo) {
    let userAccessToken = userTokenInfo.AccessToken
    let siteId = "1"
    let getRolesAndPrivilegesOfUserApi = await commonUtils.createApiToGetRolesAndPrivilegesForUser(securityPlugin)
    let reqBodyToGetRolesAndPrivilegesForUser = await commonUtils.createReqBodyToGetRolesAndPrivilegesForUser(userAccessToken, siteId)
    let hashedBase64 = await commonUtils.createHmacHash(ApplicationId, ApplicationSecret)
    let apiSchema = await commonUtils.createApiSchemaForSecurityPlugin(getRolesAndPrivilegesOfUserApi, 'POST', reqBodyToGetRolesAndPrivilegesForUser, hashedBase64)

    console.log(apiSchema)

    return ISASctrl.fetchSecurityPluginApi(apiSchema).then(succesResp => {
        return { success: true, response: succesResp }
    }).catch(error => {
        return { success: false, response: error }
    })
}



/********************* USER LOGOUT ************************/
async function logout(req, res, next) {
    logger.info('IN LOGOUT API');
    if (req.headers.accesstoken) {
        let accessToken = req.headers.accesstoken
        try {
            models.mySessionStore.destroy(accessToken, async (err, sessionData) => {
                if (sessionData || (accessToken && sessionData == null)) {
                    if ((accessToken && sessionData == null)) {
                        let expiredUserLog = await CommonCtrl.getExpiredUserSessionLog(req.headers.accesstoken)
                        if (expiredUserLog.success === true) {
                            let createdResp = commonUtils.createResponse(STATUS.SUCCESS, " session expired")
                            commonUtils.sendResponse(req, res, createdResp, next)
                        }
                    } else {
                        let createdResp = commonUtils.createResponse(STATUS.SUCCESS, " logout Successfully")
                        commonUtils.sendResponse(req, res, createdResp, next)
                    }
                    let createdResp = await commonUtils.createResponse(STATUS.SUCCESS, "Successfully logout")
                    commonUtils.sendResponse(req, res, createdResp, next)
                } else {
                    console.log("Checking session error:", err)
                    let createdResp = await commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED_INTERNAL_ERROR, '', "Token not valid")
                    commonUtils.sendResponse(req, res, createdResp, next)
                }
            })
        } catch (error) {
            console.log("Checking session error:", error)
            let createdResp = await commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED_INTERNAL_ERROR, '', "Token not valid")
            commonUtils.sendResponse(req, res, createdResp, next)
        }
    } else {
        let createdResp = await commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED_INTERNAL_ERROR, '', "Token not found in headers")
        commonUtils.sendResponse(req, res, createdResp, next)
    }

}







/******************* Check Valid User ********************/


async function checkValidUser(req,res,next){
    // console.log("Coming to controller:",req.headers.accesstoken)

    console.log("Validation Occuring");
    if(req.headers.accesstoken){
        let accessToken = req.headers.accesstoken
        try{
            models.mySessionStore.get(accessToken,(err,sessionData)=>{                   
               
                // console.log("Success of validation:",sessionData)
                if(sessionData){
                    let createdResp = commonUtils.createResponse(STATUS.SUCCESS, sessionData) 
                    commonUtils.sendResponse(req, res, createdResp, next)
                }

                else if(accessToken.length > 40){
                    let applicationValidation = crmControl.verifyToken(accessToken);
                    applicationValidation
                    .then(function(validation){

                        console.log(validation);
                        
                        let createdResp = commonUtils.createResponse(STATUS.SUCCESS, {valid:validation.response});
                        commonUtils.sendResponse(req, res, createdResp, next);
                    })                    
                    .catch(function(err){
                        let createdResp = commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED_INTERNAL_ERROR, '',err); 
                        commonUtils.sendResponse(req, res, createdResp, next);
                    })
                }
                
                else{
                    console.log("Checking session error:",err)
                    let createdResp = commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED_INTERNAL_ERROR, '',"Token not valid") 
                    commonUtils.sendResponse(req, res, createdResp, next)
                }
            })
        }catch(error){
            console.log("Checking session error:",error)
            let createdResp = commonUtils.createResponse(STATUS.ERROR.AUTEHNTICATION_FAILED_INTERNAL_ERROR, '',"Token not valid") 
            commonUtils.sendResponse(req, res, createdResp, next)
        }
    }
}







module.exports = {
    login: login,
    logout: logout,
    authentication: authentication,
    checkValidUser: checkValidUser
}
