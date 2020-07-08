const express = require('express');
const router = express.Router();
var hierarchy = require('../../controllers/hierarchy.server.controller');


router.route('/tree')
    .get(hierarchy.getHierarchyTree);
module.exports = router;
