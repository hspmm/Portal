var _ = require('lodash');
var STATUS = require('../utils/status-codes-messages.utils');
var commonUtils = require('../utils/common.utils')
var AllDetectedPluginsHashTable = require('./plugins.server.controller');
var ISASctrl = require('./isas.server.controller');
var redictionLogs = require('../utils/winston.utils').PortalRedirectionLogs
var globalLogger = require('../utils/winston.utils').PortalLogs



/************************************************************
 ****** REDIRECTION OF PLUGIN COMMUNICATION VIA EC API ******
 *************************************************************/

async function redirectionApi(req, res, next){
  let requestedUrl = req.url;
  let requestedMethod = req.method;
  let requestedBody = req.body;
  let requestedHeaders = req.headers;
  let redirectionPluginInfo = await getRedirectionUrlPluginInfo(requestedUrl);
  if((redirectionPluginInfo && redirectionPluginInfo.servicesEnabled === true && redirectionPluginInfo.IsLicenced === true)){
    globalLogger.info("RequestedUrl :"+requestedUrl+"\t" + "RedirectionInfo :"+JSON.stringify(redirectionPluginInfo))
    redictionLogs.info("RequestedUrl :"+requestedUrl+"\t" + "RedirectionInfo :"+JSON.stringify(redirectionPluginInfo))
    let finalRedirectionApi = redirectionPluginInfo.redirectionUrl;
    // console.log("finalRedirectionApi :",finalRedirectionApi);
    // console.log("requestedMethod:",requestedMethod)
    // console.log("requestedBody:",requestedBody)

    let redirectionApiSChema = await commonUtils.createApiSchemaForSecurityPlugin(finalRedirectionApi,requestedMethod,requestedBody,'',null);
    redirectionApiSChema.requestHeaders = requestedHeaders;
    redirectionApiSChema.requestHeaders['x-forwarded-for'] = req.connection.remoteAddress
    ISASctrl.fetchSecurityPluginApi(redirectionApiSChema).then(async response =>{
     res.send(response);
      // let createdResp = commonUtils.createResponse(STATUS.SUCCESS, response);
      // commonUtils.sendResponse(req, res, createdResp, next);
    }).catch(async error =>{
      let createdResp = await commonUtils.createResponse(STATUS.ERROR.PLUGIN_API_REHOST,'',error);
      commonUtils.sendResponse(req, res, createdResp, next);
    })
  }else{
    globalLogger.error("RequestedUrl :"+requestedUrl+"\t" + "RedirectionInfo : No matched url found")
    redictionLogs.error("RequestedUrl :"+requestedUrl+"\t" + "RedirectionInfo :  No matched url found")
    let createdResp = commonUtils.createResponse(STATUS.ERROR.PLUGIN_API_REHOST,'','All the services are stoped for this request because of either the Licence has expired nor the services are disabled');
    commonUtils.sendResponse(req, res, createdResp, next);
  }
}


/*************************************************
 ******** GET REDIRECTION PLUGIN INFO URL ********
 *************************************************/

async function getRedirectionUrlPluginInfo(requestedUrl){
  let detectedPluginsHashTable = AllDetectedPluginsHashTable.detectedPluginsHashtable
  // console.log("AllDetectedPluginsHashTable:",AllDetectedPluginsHashTable)
  // console.log("Actual requestedUrl:",requestedUrl)
  let plugin, splitOfReqUrl = requestedUrl.split('/')
  // console.log("splitOfReqUrl:",splitOfReqUrl)
  let redirectionPluginInfo = detectedPluginsHashTable[splitOfReqUrl[1]]
  plugin = redirectionPluginInfo
  if(redirectionPluginInfo && redirectionPluginInfo.prependUrl && redirectionPluginInfo.prependUrl.includes(splitOfReqUrl[1])){
    // console.log("unique name INcluded in prepend URL")
    let redirectionSuffixUrl = requestedUrl
    // console.log("redirectionSuffixUrl:",redirectionSuffixUrl)
    plugin.redirectionUrl = redirectionPluginInfo.url + redirectionSuffixUrl
  }else if(redirectionPluginInfo && redirectionPluginInfo.prependUrl && !(redirectionPluginInfo.prependUrl.includes(splitOfReqUrl[1]))){
    // console.log("unique name not INcluded in prepend URL")
    let redirectionSuffixUrl = requestedUrl.replace('/'+splitOfReqUrl[1],'')
    // console.log("redirectionSuffixUrl:",redirectionSuffixUrl)
    plugin.redirectionUrl = redirectionPluginInfo.url + redirectionSuffixUrl
  }else{
    plugin = ''
  }
  return plugin
}

// async function getRedirectionUrlPluginInfo(requestedUrl){
//   console.log("Rehost api coming:",AllDetectedPluginsHashTable.detectedPluginsHashtable);
//   let detectedPluginsHashTable = AllDetectedPluginsHashTable.detectedPluginsHashtable;
//   let plugin , splitOfReqUrl = requestedUrl.split('/');
//   console.log('in console of rehost API ', splitOfReqUrl);
  // for(let key in detectedPluginsHashTable){
  //   let splitOfReqUrl = detectedPluginsHashTable[key].prependUrl.replace('/','')
  //   let prependUrl = '\/'+splitOfReqUrl+'\(.*)/'
  //   let checkMatchedUrl = requestedUrl.match(prependUrl);    
  //   if((checkMatchedUrl != null) && (checkMatchedUrl.length > 0)){
  //     console.log("MATTCHHHEDDDDDDDD:",checkMatchedUrl);
  //     plugin = detectedPluginsHashTable[key];
  //     plugin.redirectionUrl = detectedPluginsHashTable[key].url + requestedUrl;
  //   }
  // }
//   return plugin
// }


module.exports = {
  redirectionApi : redirectionApi
}