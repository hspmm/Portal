require('dotenv').config({path: '../.env'});

var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config/db.config.js')[env];

const Sequelize = require("sequelize");
var session = require('express-session');
var SequelizeStore = require('connect-session-sequelize')(session.Store);

//console.log(config);

const sequelize = new Sequelize(config.database, config.username, config.password, config.options,

  /*pool: {
    max: parseInt(process.env.poolMax),
    min: parseInt(process.env.poolMin),
    acquire: process.env.poolAcquire,
    idle: process.env.poolIdle
  }*/
);

console.log("####### DB INFO:",config.options)


const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.customers = require("./models/customer.js")(sequelize, Sequelize);
db.nodes = require("./models/nodes.js")(sequelize,Sequelize);
db.plugins = require("./models/plugins.js")(sequelize,Sequelize);
db.registeredApplications = require("./models/registeredApplications.js")(sequelize,Sequelize);
db.sessionLogs = require("./models/sessionLogs.js")(sequelize,Sequelize);
db.sessions = require("./models/sessions.js")(sequelize,Sequelize);
db.products = require("./models/products.js")(sequelize,Sequelize);
db.installation = require("./models/installation.js")(sequelize,Sequelize);



/*********** BEGIN OF SESSION TABLE AND SYNCING LOGIC ***********/


function extendDefaultFields(defaults, session) {
  console.log("@@@@@@@@@@#############:SESSION:",session) 
  return {
    data: defaults.data,
    tokenTimeOutInterval : session.tokenTimeOutInterval,
    expires: session.expires,
    userName: session.userName,
    accessToken : session.accessToken,
    refreshToken : session.refreshToken,
    privileges : session.privileges,
    tokenRefreshedAt : new Date(Date.now()),
  };
}

var mySessionStore = new SequelizeStore({
  db: sequelize,
  table: 'Sessions',  
  disableTouch : false,
  extendDefaultFields: extendDefaultFields,
  checkExpirationInterval: 60000, // The interval at which to cleanup expired sessions in milliseconds.
  // expiration: session.expires // The maximum age (in milliseconds) of a valid session.
})

db.mySessionStore = mySessionStore;

module.exports = db;