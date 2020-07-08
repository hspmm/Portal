const express = require('express');
const router = express.Router();
var plugins = require('../../controllers/plugins.server.controller');
const utils = require('../../utils/check.utils')
const validate = require('../../validators/validate') ;
console.log('here');
/* router.route('/')
    .get(plugins.allRegisteredPluginList); */


router.route('/detect')
    .get(plugins.dectectListOfPlugins);


router.route('/services/activate')
    .put([validate.checkPluginUserPrivileges, utils.plugin.checkPluginServicesEnableDisableBody],plugins.enableAndDisablePluginServices);


router.route('/services/restart/all')    
    .get([validate.checkPluginUserPrivileges],plugins.restartAllPluginServices);

router.route('/services/restart/:uid?')
    .get([validate.checkPluginUserPrivileges, utils.plugin.checkPluginUidInParams],plugins.restartinvidualPluginServices);


router.route('/licensemanager/fetch')
    .get(plugins.getLicenseManagerInfo);
    
router.route('/notificationmanager/url')
.get(plugins.getNotificationManagerUrl);

router.route('/:id')
    .get(plugins.getRegisteredpluginById);


module.exports = router;