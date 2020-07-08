const dotenv = require('dotenv').config();

module.exports = {
    development: {
        username : process.env.DEV_DB_USERNAME,
        password : process.env.DEV_DB_PASSWORD,
        database : process.env.DEV_DB_DATABASE,
        url: process.env.DEV_APP_URL,
        port: process.env.PORT,
        description : process.env.DESCRIPTION,
        APP_NAME: process.env.APP_NAME,
        uniqueAppName : process.env.UNIQUE_APP_NAME,
        APP_VERSION: process.env.DEV_APP_VERSION,
        options:  {
            host: process.env.DEV_DB_HOST,
            dialect: process.env.DEV_DB,
            logging: false,
            dialectOptions:{
                options: {
                    instanceName: process.env.DEV_DB_INSTANCE != '' ? process.env.DEV_DB_INSTANCE : '',
                    encrypt: true,
                    // enableArithAbort: true,
                }
            }
           
        }
    },
    production: {
        username: process.env.PROD_DB_USERNAME,
        password: process.env.PROD_DB_PASSWORD,
        database: process.env.PROD_DB_DATABASE,
        url : process.env.PROD_APP_URL,
        port: process.env.PORT,
        description : process.env.DESCRIPTION,
        APP_NAME: process.env.APP_NAME,
        uniqueAppName : process.env.UNIQUE_APP_NAME,
        APP_VERSION: process.env.PROD_APP_VERSION,
        options:  {
            host: process.env.PROD_DB_HOST,
            dialect: process.env.PROD_DB,
            logging: false,
            dialectOptions:{
                options: {
                    instanceName: process.env.PROD_DB_INSTANCE ? process.env.PROD_DB_INSTANCE : '',
                    encrypt: true,
                }
              }
        }      

    }
};