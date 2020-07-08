var pluginData = {
    name: "ISAS",
    uniqueName : 'isas',
    version: 0.1,
    uiPort: 4201,
    description:'For Authorization and Authentication',
    // baseUrl: "http://10.74.56.89",
    baseUrl: "http://localhost",
    type:"Default",
    instances : 1,
    serverPort: 3001,
    prependUrl: "/api/v1",
    iconUrl :"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",
    uiUrls: [
        {
            name: "user",
            description: "for user information",
            url: "/users"
        }
    ],
    serverUrls : {
        applicationRegisteration : 'api/v1/application/registration',
        authentication : 'api/v1/user/Authentication',
        privilegesRegistration : 'api/v1/privilege/Registration',
        introspect : 'api/v1/token/introspect',
    } 
}
module.exports = pluginData;
