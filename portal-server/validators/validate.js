const _ = require('lodash');
var moment = require('moment');
const models = require('../database');
var { updateSessionExpiry, getUserSessionById, updateIsasAccessToken, checkUserPrivilegeAccess } = require('../controllers/common.server.controller');
var AppConfig = require('../config/app-config')

module.exports = {
    user: {
        checkAccesstoken: function (req, res, next) {
            if (!req.headers.accesstoken) {
                return res.status(401).send({
                    message: "Accestoken expired"
                })
            }
            next();
        },
        requiresLogin: function (req, res, next) {
            if (!req.headers.accesstoken) {
                return res.status(401).send({
                    message: "Accesstoken not found in headers"
                })
            }
            next();
        }
    },

    checkIsServicesEnabled: function (req, res, next) {
        console.log("isServicesEnabled:", AppConfig.isServicesEnabled)
        if (!AppConfig.isServicesEnabled) {
            return res.status(500).send({
                message: "Currently services are disabled"
            })
        }
        next();

    },


    checkReqHeaders: function(req,res,next){
        // console.log("REQ::",req.path.match(/^\/plugin\//) !=null)
        if(req.path == '/user/login' || (req.path.match(/^\/plugin\//) != null )){
            next()            
        }else if(req.headers && req.headers.accesstoken){
            next()
        }else{
            return res.status(401).send({
                message: "Accesstoken not found in headers"
            })
        }    
    },


    checkAdminPrivileges: async function(req,res,next){
        console.log('in validators req.body**********************************', req.headers.accesstoken);
        let sessionId = req.headers.accesstoken
        let appPrivilegesKeys = JSON.parse(process.env.APP_PRIVILEGES_KEYS)
        let userAccess = await checkUserPrivilegeAccess(sessionId, appPrivilegesKeys.canAddAndEditCustomerAndProduct)
        if(userAccess.success){
            next()
        }else{
            return res.status(440).send(userAccess.response)
        }
    },
    

    checkPluginUserPrivileges: async function(req,res,next){
        console.log('in check privileges of PlufginUSer********************',req.headers.sessionId);
        let sessionId = req.headers.accesstoken
        let appPrivilegesKeys = JSON.parse(process.env.APP_PRIVILEGES_KEYS)
        let userAccess = await checkUserPrivilegeAccess(sessionId, appPrivilegesKeys.canViewProductAndPlugins)
        if(userAccess.success){
            next()
        }else{
            return res.status(440).send(userAccess.response)
        }
    },


    
    checkUserPrivileges: async function(req,res,next){
        console.log('in check privileges of USER********************',req.headers.accesstoken);
        let sessionId = req.headers.accesstoken
        let appPrivilegesKeys = JSON.parse(process.env.APP_PRIVILEGES_KEYS)
        let userAccess = await checkUserPrivilegeAccess(sessionId, appPrivilegesKeys.canViewCustomer)
        if(userAccess.success){
            next()
        }else{
            return res.status(440).send(userAccess.response)
        }
    },

    
    checkSessionExpiry: async function (req, res, next) {
        console.log('request path is ', req.path);
        if ((req.path == '/user/login') || (req.path == '/user/logout') || (req.path == '/customers/postHierarchy')||(req.path == '/customers/getToken') ||(req.path == '/customers/validateCustomer') ||
         (req.path == '/user/valid') || (req.path == '/customers/getLicensedProducts') || (req.path.match(/^\/plugin\//) != null)) {
        next()
        } else {
            console.log("req.headers.accesstoken:", req.headers.accesstoken);
            if (!req.headers.accesstoken) {
                return res.status(401).send({
                    message: "Accesstoken not found in headers"
                })
            } else {

                console.log('==================>in validatoe',req.headers.accesstoken);
                let userSession = await getUserSessionById(req.headers.accesstoken);
                console.log('here *******************$$$$$$$$$%%%%%%%%%%%%^^^^^^^^^^&&&&&&&&&&&',req.headers.accesstoken, 'user session info',userSession.response);

                if (userSession.success === true) {
                    // console.log("userSession.response:",userSession)
                    let tokenRefreshedAt = new Date(userSession.response.tokenRefreshedAt).getTime();
                    let IsasTokenExpiryTime = new Date(tokenRefreshedAt + parseInt(userSession.response.tokenTimeOutInterval));
                    let startTime = moment()
                    let end = moment(IsasTokenExpiryTime)
                    if (end.diff(startTime, 'seconds') < 70) {
                        // if(true){
                        let updateTokenResp = await updateIsasAccessToken(req.headers.accesstoken, userSession.response);
                        if (updateTokenResp.success) {
                            next()
                        } else {
                            // return res.status(500).send({ errCode: 'SESS_EXP', message: "Failed to update token" })
                            let updateSession = await updateSessionExpiry(userSession.response);
                            if(updateSession.success === true){                            
                                next()
                            }else{
                                return res.status(440).send(updateSession.resopnse)
                            }
                        }
                    } else {
                        let updateSession = await updateSessionExpiry(userSession.response);
                        if (updateSession.success === true) {
                            next()
                        } else {
                            return res.status(440).send(updateSession.resopnse)
                        }
                    }

                } else {
                    return res.status(440).send(userSession.response)
                }

                //next();
            }
        }
    }
}