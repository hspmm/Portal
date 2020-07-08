const express = require('express');
const router = express.Router();

//console.log(router);

var authenticationRoutes = require('./authentication.routes');
var pluginRoutes = require('./plugins.routes');


var pluginApiRoutes = require('./additional.routes');

var crmroutes = require('./crm.routes');
var productroutes = require('./products.routes');

var hierarchyRoutes = require('./hierarchy.routes');
// var applicationRoutes = require('./application.routes');

router.use('/plugin', pluginApiRoutes);

router.use('/user', authenticationRoutes);

router.use('/plugins', pluginRoutes);

router.use('/customers',crmroutes);


router.use('/products',productroutes);

//console.log(productroutes);

router.use('/hierarchy',hierarchyRoutes);

//console.log(hierarchyRoutes);


// router.use('/application', applicationRoutes);


module.exports = router;