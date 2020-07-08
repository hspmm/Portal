const models = require('../database');
const dotenv = require('dotenv').config();
var STATUS = require('../utils/status-codes-messages.utils')
var commonUtils = require('../utils/common.utils')
const Installation = models.installation;

var AppConfig = require('../config/app-config')

var GetPortalAppRegistartionInfo = require('./isas.server.controller').getPortalAppIdAndAppSecret

var PluginRoutes = require('./plugins.server.controller');

var logger = require('../utils/winston.utils').PortalLogs
async function getHierarchyTree(req, res, next) {
    logger.info("IN GET HIERARCHY TREE API");
    let getTreeData = await getHierarchyTreeData();
    if (getTreeData.success === true) {
        let createdResp = commonUtils.createResponse(STATUS.SUCCESS, getTreeData.response);
        console.log('created Response is ********', createdResp);
        commonUtils.sendResponse(req, res, createdResp, next);
    } else {
        let createdResp = commonUtils.createResponse(STATUS.ERROR.GET_HIERARCHY_TREE, '', getTreeData.response);
        commonUtils.sendResponse(req, res, createdResp, next);
    }
}

async function getHierarchyTreeData() {

    var singleInstance = await getSingleInstancePlugin();
    // console.log('single instance is==========>>>', singleInstance)
    fakeRoot = await createFakeRoot();
    console.log()
    try {
        return models.customers.findAll()
            .then(async function (customers) {

                let customersOb = JSON.parse(JSON.stringify(customers));
                let customerList = await getCustomerList(customersOb);
                console.log('customerList is **********', customerList);
                fakeRoot.children = customerList;


                // console.log('the main fake root', fakeRoot);
                let hierarchyTree = [];
                hierarchyTree.push(fakeRoot);


                // console.log('upgradeed hierarchy tree ', hierarchyTree);
                // console.log('here');
                let hierarchyTreeResponse = {}
                hierarchyTreeResponse.hierarchyTree = hierarchyTree;
                hierarchyTreeResponse.singleInstancePlugins = singleInstance.response.singleInstancePlugins;

                hierarchyTreeResponse = JSON.parse(JSON.stringify(hierarchyTreeResponse));
                return { success: true, response: hierarchyTreeResponse }

            }).catch(err => {
                return { success: false, response: err }
            });
    } catch{       
        return { success: false, response: 'Error in getHierarchyTreeData API'}
    }
}

async function createFakeRoot() {

    Installation.findAll()
        .then(async function (AppData) {
            data = JSON.parse(JSON.stringify(AppData));
            console.log('Installation Table Data list', data);
            logger.info("IN CREATE FAKE ROOT DATA COME FROM INSTALLATIONS");
            if (data.length > 0) {

                fakeRoot = {};
                fakeRoot.Uid = data[0].Uid;
                fakeRoot.ParentID = null;
                fakeRoot.NodeName = "Enterprises";
                fakeRoot.NodeID = 1;
                fakeRoot.NodeType = 'enterprise-hierarchy';
                fakeRoot.PluginID = null;



                console.log('fakeRoot is', fakeRoot);
                return fakeRoot;

            }

        });


}
async function getSingleInstancePlugin() {
    console.log('>>>>>>>>in the get single instace plugin ');
    let PluginDetails = await PluginRoutes.getListOfPluginsInDB()
    console.log('plugin details is here *********** ', PluginDetails);
    PluginDetails = PluginDetails.success === true ? PluginDetails.response : []
    let singleInstancePlugins = []
    for (let i = 0; i < PluginDetails.length; i++) {
        let plugin = PluginDetails[i];
        console.log(plugin)
        if (plugin && (plugin.Instances == 1) && (plugin.ServicesEnabled === true) && (plugin.IsActive === true) && (plugin.UniqueName != AppConfig.securityApp)) {
            console.log('inside if condition ');
            let singleInstancePlugin = {
                name: plugin.Name,
                Uid: plugin.Uid,
                rootNodeId: 1
            }

            singleInstancePlugins.push(singleInstancePlugin)

            console.log('singleInstancePlugin details is*******', singleInstancePlugins);
        }
    }
    let ecAppInfo = await GetPortalAppRegistartionInfo()
    if (ecAppInfo.success === true) {
        let singleInstancePlugin = {
            name: ecAppInfo.response.ApplicationName,
            Uid: ecAppInfo.response.ApplicationGuid,
            rootNodeId: 1
        }
        singleInstancePlugins.push(singleInstancePlugin)
    }
    let hierarchyTreeResponse = {

        singleInstancePlugins: singleInstancePlugins
    }
    console.log('Response Hierarchy tree is', hierarchyTreeResponse);
    return { success: true, response: hierarchyTreeResponse }
}




async function getCustomerList(customers) {

    logger.info("IN GET CUSTOMER LIST API");
    customerList = [];
    for (let j = 0; j < customers.length; j++) {
        customerList.push(await generateCustomer(customers[j]));
    }

    return customerList;
}

async function generateCustomer(customer) {
    changedCustomer = {};
    changedCustomer.ParentID = 1;
    changedCustomer.Uid = customer.CustomerID;
    changedCustomer.NodeName = customer.NodeName;
    changedCustomer.NodeID = customer.NodeID + 1
    changedCustomer.NodeType = 'enterprise-hierarchy';
    changedCustomer.PluginID = null;
    changedCustomer.children = [];
    return changedCustomer;
}

module.exports = {
    getHierarchyTree: getHierarchyTree
}