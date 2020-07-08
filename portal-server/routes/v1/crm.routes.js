const express = require('express')
const router = express.Router();
const utils = require('../../utils/check.utils')

const validate = require('../../validators/validate');

var crm = require('../../controllers/crm.server.controller');
// const { validator } = require('sequelize/types/lib/utils/validator-extras');


router.route('/postHierarchy')
    .post(crm.postHierarchy);
    // .post([utils.authentication.checkRequiredFields],user.authentication);

router.route('/getToken')
      .post(crm.getToken);
      
router.route('/UpdateCustomer')
    .post([validate.checkAdminPrivileges],crm.UpdateCustomer);
    // .post([utils.authentication.checkRequiredFields],user.authentication);

router.route('/CustomerDetails')
    .post([validate.checkAdminPrivileges],crm.CustomerDetails);

router.route('/getCustomerGUID')
    .get([validate.checkAdminPrivileges],crm.getCustomerGUID);

router.route('/getCustomerList')
    .get([validate.checkUserPrivileges],crm.getCustomerList);

router.route('/certificateValidate')
    .post(crm.certificateValidate);
router.route('/getFileData/:CustomerId')
    .get(crm.getFileData);

router.route('/getLicensedProducts')
    .get(crm.getLicensedProducts);    

// router.route('/getCustomerDetails')
//     .get(crm.getCustomerDetails);
    
router.route('/validateCustomer')
    .get(crm.validateCustomer);

module.exports = router;