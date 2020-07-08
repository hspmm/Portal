var env = process.env.NODE_ENV || 'development';
var config = require('./db.config')[env];

const appInfo = {
    name: config.APP_NAME,
    uniqueName : config.uniqueAppName,
    version : config.APP_VERSION,
    description : config.description,
    baseUrl : config.url,
    serverPort : config.port,
    securityApp : process.env.PRIMARY_SECURITY_APP_NAME,
    sessionSecret : 'ICUMedical_Portal',
    sessionMaxAge : 3000,
    isServicesEnabled : true,
    isISASEnabled : true,
    licenseManagerApp : process.env.PRIMARY_LICENSE_MANAGER_APP_NAME,
    notificationManagerApp : process.env.PRIMARY_NOTIFICATION_MANAGER_APP_NAME,
    PortalUrls : {
        getPluginConfigDetailsAPI : process.env.GET_PLUGIN_CONFIG_DETAILS_API
    },
    privileges : [
        {
            name : "May Add and Edit Customer and Products",
            description : "Admin can view and modify",
            key : "Admin"
        },
        {
            name : "May View Plugins and Products",
            description : "User can view plugins",
            key : "Plugin User"
        },
        {
            name : "May View Customer",
            description : "User can only view",
            key : "User"
        }
    ]
}

module.exports = appInfo



