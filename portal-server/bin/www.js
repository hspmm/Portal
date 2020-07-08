#!/usr/bin/env node

/**
 * Module dependencies.
 */
var app = require('../app');
var debug = require('debug')('portal-server:server');
const models = require('../database');
const Installation = models.installation;
var http = require('http');
var pluginsCtrl = require('../controllers/plugins.server.controller');
var isasCtrl = require('../controllers/isas.server.controller');
var AppConfig = require('../config/app-config');
var server;




/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '4005');
app.set('port', port);


/**** BEGIN OF CHECK SECURITY APP AVAILABILITY BEFORE START OF SERVER ****/
console.log("## EC server was initialized")
console.log("## Is EC was enabled with Security Plugin ? :", AppConfig.isISASEnabled)
AppConfig.isISASEnabled ===true ? checkForSecurityPlugin() : startServerWithoutSecurityPlugin();



/**** BEGING OF CHECK OF SECURITY APP ****/
async function checkForSecurityPlugin() {
  try{
  let isSecurityPluginAvailable = await isasCtrl.detectSecurityPluginAndConfigDetails();
  console.log(isSecurityPluginAvailable ? '## CREATING EC SERVER' : 'CLOSING EC SERVER');
  isSecurityPluginAvailable ? createMyServer(isSecurityPluginAvailable) : closeMyServer();
}catch(error){
  console.log('error in checkForSecurityPlugin ', error)
}
}



async function startServerWithoutSecurityPlugin() {
  createMyServer(null);
}



/****** BEGING OF CREATE EC SERVER ******/
async function createMyServer(securityPluginConfigInfo) {

  try {
    server = http.createServer(app);
    //models.sequelize.sync({alter:true}).then(function() {
    //console.log("## STARTING EC SERVER:")
    server.listen(port, async () => {
      //console.log("## EC SERVER LISTENING ON PORT :",port);
      debug('Portal server listening on port ' + server.address().port);
      if (securityPluginConfigInfo) { //@@@***CHANGE CONDITION (to true) WHEN DEV IS DONE
        // /***** START STORING CONFIG DETAILS OF SECURITY PLUGIN *****/
        //console.log(JSON.stringify(securityPluginConfigInfo) + "one more time");
        securityPluginConfigInfo.IsLicenced = true; // TO DO CHECK FOR LICENCE
        let pluginConfigInfo = await pluginsCtrl.checkAndStoreConfigInfoOfPlugins(securityPluginConfigInfo.response);
        if (pluginConfigInfo && pluginConfigInfo.success === true) {
          let doneWithInitialSteps = await pluginsCtrl.doInitialStepsWithSecurityPlugin(pluginConfigInfo.response);

          console.log("## DONE WITH INITIAL STEPS OF ICUMED PORTAL:", doneWithInitialSteps.response, doneWithInitialSteps.success);
          if (doneWithInitialSteps.success === true) {
            console.log("## DONE WITH INITIAL STEPS OF PORTAL:",doneWithInitialSteps.response)
            Installation.findAll()
              .then(async function (products) {
                data = JSON.parse(JSON.stringify(products));
                console.log('product list', data);
                if(data.length>0){
                let defaultUserForPortal = await isasCtrl.createDefaultUserForPortal(data[0]);
                console.log("+++++++++++++++> :", defaultUserForPortal.response)
                } 

              });
          }

          else{
            closeMyServer(server);
          }
        }
      }
      //});
      server.on('error', onError);
      server.on('listening', onListening);

    })
  }

  catch (err) {

  }

}


/********** CLOSE THE SERVER CONNECTION ************/
async function closeMyServer(server) {
  console.log("FAILED TO STORE SECURITY PLUGIN CONFIG DETAILS IN DB")
  // server.close()
  isasCtrl.closeMyECServer();
}


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    case 'UnhandledPromiseRejectionWarning':
      console.error('Server is down');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}