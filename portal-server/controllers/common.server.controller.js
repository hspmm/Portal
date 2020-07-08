const models = require('../database');
var IsasCtrl = require('./isas.server.controller');
var commonUtils = require('../utils/common.utils');
const _ = require('lodash');



/***************** UPDATE SESSION EXPIRY TIME ******************/
async function updateSessionExpiry(sessionData){
  // console.log("sessionData in update Session:",sessionData)
  sessionId = sessionData.sid
  try{
      let sesionExpiry  = new Date(Date.now() + parseInt(sessionData.tokenTimeOutInterval)) 
      console.log('Session expiry ', sesionExpiry);
      return models.sessions.update({
          expires : sesionExpiry
      },{
          where : {
              sid : sessionId
          }
      }).then(async resp=>{ 
        let newSessionData = await getUserSessionById(sessionId);
        if(newSessionData.success){
          return {success:true, resopnse : newSessionData.response}
        }else{
          return {success:false, resopnse : newSessionData.response}
        }          
      }).catch(error=>{
        console.log( "Failed to Update session info ");
          return {success:false, resopnse : {errCode : 'SESS_EXP',message: "Failed to Update session info"}}
      }) 
  }catch(error){
    console.log( "Failed to Update session info ");
      return {success:false, resopnse : {errCode : 'SESS_EXP',message: "Failed to Update session info"}}
  }
}


/***************** GET USER SESSION INFO BY ID ***********************/
async function getUserSessionById(sessionId) {
  console.log('session id in get user session by ID',sessionId);
    try {
      return models.sessions.findOne({
        raw:true,
        where: {
          sid : sessionId
        }
      }).then(sessionData=>{
      console.log("sessionData:",sessionData)
      if (sessionData) {
        return {success: true, response: sessionData}
      } else {
        
    console.log( "Session Expired");
        return {success: false, response: {errCode : 'SESS_EXP',message: "Session Expired"}}
      }
    }).catch(err=>{
      console.log("Failed to fetch session info");
      return {success: false, response: {errCode : 'SESS_EXP',message: "Failed to fetch session info"}}
    })
  } catch (error) {
    console.log( "Failed to fetch session info a1 ",error)
    return {success: false, response: {errCode : 'SESS_EXP',message: "Failed to fetch session info"}}
  }
}



/***************** GET EXPIRED USER SESSION LOG WITH SESSION ID ********************/
async function getExpiredUserSessionLog(sessionId) {

  try {
    return models.sessionLogs.findOne({
      raw: true,
      where: {
        sid: sessionId
      }
    }).then(userlog => {
      return { success: true, response: userlog}
    }).catch(err => {
      return { success: false, response: err}
    })
  } catch (error) {
    return { success: false, response: error}
  }
}


/***************** CHECK USER PRIVILEGES ******************/
async function checkUserPrivilegeAccess(sessionId, privilege){
  console.log("privilege:",privilege)
  let userSessionInfo = await getUserSessionById(sessionId);
  if(userSessionInfo.success === true){
    userSessionInfo = userSessionInfo.response
    if(userSessionInfo.privileges){
      let userPrivileges = JSON.parse(userSessionInfo.privileges)
      let appPrivilegesKeys = privilege
      let foundPrivilege = _.filter(userPrivileges,(privilege)=> {return _.toLower(privilege.Privilege.Key)  == _.toLower(appPrivilegesKeys)})
      if(foundPrivilege.length > 0){
        return {success: true, response: true}
      }else{
        return {success: false, response: userSessionInfo.userName+" has no permission to do this action"}
      }
    }else{
      return {success: false, response: userSessionInfo.userName+" has no permission to do this action"}
    }
  }else{
    return {success:false, response:userSessionInfo.response}
  } 
}


/**************** UPDATE ISAS ACCESSTOKEN ********************/
async function updateIsasAccessToken(sessionId, userSessionInfo){
  
  console.log('in UPdate session exipiry in ISAS update ************', sessionId);
  let securityPlugin = await IsasCtrl.getSecurityPluginFromDb()
  if(securityPlugin.success){
    let reqBodyOfGetNewToken = await commonUtils.createReqBodyOfGetNewToken(userSessionInfo.refreshToken)
    let apiToGetNewToken = await commonUtils.createApiSchemaToGetNewToken(securityPlugin.response)
    if(apiToGetNewToken.success){
      let ecAppIdAndAppSecret = await IsasCtrl.getPortalAppIdAndAppSecret()
      if(ecAppIdAndAppSecret && ecAppIdAndAppSecret.success === true){
        let hmacSecretId = await commonUtils.createHmacHash(ecAppIdAndAppSecret.response.ApplicationId, ecAppIdAndAppSecret.response.ApplicationSecret)
        let getNewTokenApiSchema = await commonUtils.createApiSchemaForSecurityPlugin(apiToGetNewToken.response,'POST',reqBodyOfGetNewToken,hmacSecretId,null);
        let getNewTokenReq = await commonApiFetch(getNewTokenApiSchema)
        if(getNewTokenReq.success){
          let tokenResp = getNewTokenReq.response.TokenResponse
          if(tokenResp.ErrorCode == 0){
            let userTokenUpdate = await updateNewTokenInUserSession(sessionId, tokenResp.AccessToken, tokenResp.RefreshToken, tokenResp.AccessToken_ExpiryTime)
            // console.log("userTokenUpdate:",userTokenUpdate)
            return {success:userTokenUpdate.success, response:userTokenUpdate.response}
          }else{
            return { success: false, response: tokenResp.ErrorText}
          }
        }else{
          return { success: false, response: getNewTokenReq.response}
        }
      }else{
        return { success: false, response: ecAppIdAndAppSecret.response}
      }
    }else{
      return { success: false, response: apiToGetNewToken.response}
    }
  }else{
    return {success:false, response:'Failed to update the security accesstoken'}
  }
}


/************** COMMON API CALL TO FETCH FROM OTHER PLUGINS ***************/
async function commonApiFetch(apiReq){
  return IsasCtrl.fetchSecurityPluginApi(apiReq).then(apiResp =>{
    // console.log("## GET NEW TOKEN SUCCESSFULL :",apiResp)
    return { success: true, response: apiResp}
  }).catch(error=>{
    // console.log("## FAILED TO GET NEW TOKEN  :",error)
    return { success: false, response: error}
  })
}


/************** UPDATE NEW ACCESSTOKEN IN USER SESSION *****************/
async function updateNewTokenInUserSession(sessionId, newAccessToken, newRefreshToken, newAccessTokenExpiryTime){
  try{
    let newCurrentExpiryTime = new Date(newAccessTokenExpiryTime) - new Date(Date.now())
    let newSesionExpiry  = new Date(Date.now() + parseInt(newCurrentExpiryTime)) 
    return models.sessions.update({
      accessToken : newAccessToken,
      refreshToken : newRefreshToken,
      expires : newSesionExpiry,
      tokenTimeOutInterval : newCurrentExpiryTime,
      tokenRefreshedAt : new Date(Date.now())
    },{
      where : {
        sid : sessionId
      }
    }).then(async resp=>{
      let getUserInfo = await getUserSessionById(sessionId);
      if(getUserInfo.success){
        return {success:true, response: getUserInfo.response}
      }else{
        return {success:false, response:getUserInfo.response }
      }
    }).catch(err=>{
      return {success:false, response:err}
      // return {success:false, response:'Failed to update the new token in user session'}
    })
  }catch(error){
    return {success:false, response:error}
    // return {success:false, response:'Failed to update the new token in user session'}
  }
}





module.exports = {
  updateSessionExpiry : updateSessionExpiry,
  getUserSessionById : getUserSessionById,
  getExpiredUserSessionLog : getExpiredUserSessionLog,
  checkUserPrivilegeAccess : checkUserPrivilegeAccess,
  updateIsasAccessToken : updateIsasAccessToken
}