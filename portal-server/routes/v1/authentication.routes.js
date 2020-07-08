const express = require('express')
const router = express.Router();
const utils = require('../../utils/check.utils')

var user = require('../../controllers/users.server.controller');

const validate = require('../../validators/validate');



router.route('/login')
    .post([utils.authentication.checkRequiredFields],user.login);
    // .post([utils.authentication.checkRequiredFields],user.authentication);


router.route('/logout') .delete([validate.checkReqHeaders],user.logout);
    // .delete([utils.authentication.checkRequiredFields],user.logout);
    // .post([utils.authentication.checkRequiredFields],user.authentication);

router.route('/valid')
    .get([validate.checkReqHeaders],user.checkValidUser);


//console



module.exports = router;