const express = require('express');
const router = express.Router();
var products = require('../../controllers/products.server.controller');
const utils = require('../../utils/check.utils') 
const validate = require('../../validators/validate');


/* router.route('/')
    .get(plugins.allRegisteredPluginList); */

    
router.route('/addProduct')
    .post([validate.checkAdminPrivileges],products.addProduct);


router.route('/editProduct')
    .post([validate.checkAdminPrivileges],products.editProduct);

router.route('/deleteProduct')
    .post([validate.checkAdminPrivileges],products.deleteProduct);

router.route('/getProductList')
    .get([validate.checkAdminPrivileges],products.getProductList);


module.exports = router;