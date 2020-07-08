var express = require('express');
var createError = require('http-errors');
var session = require('express-session');
var AppConfig = require('./config/app-config');
const bodyparser = require("body-parser");
var logger = require('morgan');
var winston = require('./utils/winston.utils');
var cors = require('cors');
const dotenv = require('dotenv').config();
var indexRouter = require('./routes/v1/index');
var net = require('net');
const validate = require('./validators/validate');
var app = express();
var xmlParser = require('express-xml-bodyparser');
var db = require("./database/index")
var UiApiFallback = require('connect-history-api-fallback');
const { ppid } = require('process');
// var path = require('path');
//console.log(path);
// var cookieParser = require('cookie-parser');

//console.log(session);

//var rfs = require('rotating-file-stream');
// //console.log(rfs);
// var fs = require('fs');

// const uuidv1 = require('uuid/v1');


app.use(logger('dev'));
app.use(logger('combined', { stream:  winston.Logger.stream }))


app.use(session({ 
  /* genid: function(req) {
    // console.log("%%%%%%%%%@@@@@@@@@@@@@@@: ON REQUEST GENRATING SESSION ID :",uuidv1())
    return uuidv1() // use UUIDs for session IDs
  }, */
  secret: AppConfig.sessionSecret, 
  store: db.mySessionStore,
  resave: false,//Forces the session to be saved back to the session store, even if the session was never modified during the request, default value is true
  saveUninitialized : false, //Forces a session that is “uninitialized” to be saved to the store. A session is uninitialized when it is new but not modified
  rolling : true, //Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown
  cookie: { maxAge: AppConfig.sessionMaxAge, expires : AppConfig.sessionMaxAge}
}))


// console.log("App Error");
// db.sessions.destroy({where: {}}).then(function () {});

//app.use(express.static(__dirname + '/dist/msas'));
app.use(express.json({limit: '1mb'}));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// app.use(bodyparser.json({limit: '1mb'}));
// app.use(bodyparser.urlencoded({extended : true})); // you can parse incoming request if object, with nested objects, arrays or strings or any type
// app.use(cookieParser());
app.use(xmlParser({
  trim: false,
  explicitArray: false
}));


app.use(function (req, res, next) { 
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST,PUT,DELET');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,sessionid,email,multipart/form-data,application/x-www-form-urlencoded');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.use(function(req,res,next){
  res.locals.url = req.protocol + '://' + req.headers.host + req.url;
  next();
})


// app.use('/api/v1',enterpriseConfigurator);

app.use('/api/v1',[validate.checkIsServicesEnabled, validate.checkSessionExpiry],indexRouter);
app.use(UiApiFallback());
app.use(express.static('UI/portal-ui'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
  // res.status(404).send("Route Not Found")
  res.status(404).send("Requested route not found")
});


// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   // console.log("####### RESSSSSS:",err.status)
//   if(err.status){
//     console.log("##### ERRRORRR",err)
//     res.status(err.status || 500).send(err || res);
//   }else{
//     console.log("##### RESSSSSSSS")
//     res.status(200).send(err || res);
//   }
//   //res.status(err.status || 500).send(err || res);
// });

app.use(function(req,res){
  res.status(404).send({
    message: "Route Not Found"
  })
})

// var client = net.connect(3000, 'localhost', function() {
//   console.log("bla");
// });
// client.on('error', function(ex) {
//   console.log("handled error");
//   console.log(ex);
// });


process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error', err)
  process.exit(1) //mandatory (as per the Node docs)
})

module.exports = app;
