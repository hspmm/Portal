const locator = require('./test.json');
export {};
const Request = require('request');

describe('Positive / Negative test cases for API testing', function() {

  fit('Positive API testing for login Portal' , function(done) {
    console.log('login method of portal..');
    Request.post({
      headers: { 'content-type': 'application/json' , Accesstoken: 'shsdjfgdfhdfghfghsdfgsdhfs' },
      url: 'http://localhost:4000/api/v1/user/login',
      body: JSON.stringify({
        userDetails: {userName: 'esadmin1', password: 'user@123'},
        authType: 'LDAP'
      })
      }, (error, response, body) => {
        if (error) {
            console.log('error...', error);
            return console.dir(error);
        }
        console.log('login successfull....')
        console.dir('Body : ******');
        console.dir('body', body);
        console.log('body data', body);
        console.log('\n\n\nResponse Code ****:' + response.statusCode );
        expect(response.statusCode).toBe(200);
        done();
    });
  });

  fit('Negative API testing for login Portal' , function(done) {
    console.log('login method of portal..');
    Request.post({
      headers: { 'content-type': 'application/json' , Accesstoken: 'shsdjfgdfhdfghfghsdfgsdhfs' },
      url: 'http://localhost:4000/api/v1/user/login',
      body: JSON.stringify({
        userDetails: {userName: 'user@123', password: 'user@123'},
        authType: 'LDAP'
      })
      }, (error, response, body) => {
        if (error) {
            console.log('error...', error);
            return console.dir(error);

        }
        console.log('login successfull....')
        console.dir('Body : ******');
        console.dir('body', body);
        console.log('body data', body);
        console.log('\n\n\nResponse Code ****:' + response.statusCode );
        expect(response.statusCode).toBe(401);
        done();
    });
  });

  fit('positive API testing for User Authentication...', function(done) {
    console.log('in authentication method of API');
    Request.get({
      headers: { 'content-type': 'application/json' , Accesstoken: 'shsdjfgsdhfghsdfgsdhfs' },
      url: 'http://localhost:4000/api/v1/plugins/detect'
      }, (error, response, body) => {
        if (error) {
            return console.dir(error);
        }
        console.dir('Body : ******');
        console.dir(body);

        console.log('\n\n\nResponse Code ****:' + response.statusCode );
		      // tslint:disable-next-line: indent
		      expect(response.statusCode).toBe(200);
          // this below line took half day of research
        done();
    });
  });

  fit('positive API testing for get Customer list', function(done) {
    Request.get({
      headers: { 'content-type': 'application/json' , Accesstoken: 'shsdjfgsdhfghsdfgsdhfs' },
      url: 'http://localhost:4000/api/v1/customers/getCustomerList'

      }, (error, response, body) => {
        if (error) {
            return console.dir(error);
        }
        console.dir('Body : ******');
        console.dir(body);

        console.log('\n\n\nResponse Code ****:' + response.statusCode );
		      // tslint:disable-next-line: indent
		      expect(response.statusCode).toBe(200);
          // this below line took half day of research
        done();
    });
  });

  fit('negative API testing for get Customer list', function(done) {
    Request.get({
      headers: { 'content-type': 'application/json' , Accesstoken: 'shsdjfgdfhdfghfghsdfgsdhfs'  },
      url: 'http://localhost:4000/api/v1/getCustomerList'

      }, (error, response, body) => {
        if (error) {
            return console.dir(error);
        }
        console.dir('Body : ******');
        console.dir(body);

        console.log('\n\n\nResponse Code ****:' + response.statusCode );
		      // tslint:disable-next-line: indent
		      expect(response.statusCode).toBe(404);
          // this below line took half day of research
        done();
    });
  });

  fit('positive API testing for get Customer GUID while editing', function(done) {
    console.log('in customer edit method...');
    Request.get({
      headers: { 'content-type': 'application/json',  Accesstoken: 'shsdjfgdfhdfghfghsdfgsdhfs' },
      url: 'http://localhost:4000/api/v1/customers/getCustomerGUID',
          }, (error, response, body) => {
        if (error) {
            return console.dir(error);
        }
        console.dir('Body : ******');
        console.dir('body', body);

        console.log('\n\n\nResponse Code ****:' + response.statusCode );
		      expect(response.statusCode).toBe(200);
          // this below line took half day of research
        done();
    });
  });

  fit('API negative testing for get Customer GUID while editing', function(done) {
    console.log('in customer edit method...');
    Request.get({
      headers: { 'content-type': 'application/json' ,  Accesstoken: 'shsdjfgdfhdfghfghsdfgsdhfs'},
      url: 'http://localhost:4000/api/v1/customers/',
          }, (error, response, body) => {
        if (error) {
            return console.dir(error);
        }
        console.dir('Body : ******');
        console.dir('body', body);

        console.log('\n\n\nResponse Code ****:' + response.statusCode );
		      expect(response.statusCode).toBe(404);
          // this below line took half day of research
        done();
    });
  });

  xit('API testing for adding Customer details)', function(done) {
    console.log('adding customer method..');
    Request.post({
      headers: { 'content-type': 'application/json' , Accesstoken: 'shsdjfgdfhdfghfghsdfgsdhfs' },
      url: 'http://localhost:4000/api/v1/customers/CustomerDetails/',
      body: JSON.stringify({
        formData: {
           CustomerID: 'asd-61dgfash0-11ea-6677-8dnfadf',
					 NodeName: 'Bajaj',
					 EmailID: 'bajaj@gmail.com',
           Telephone: '9783900094',
           DomainName: 'bajaj.com'
        }
      })

      }, (error, response, body) => {
        if (error) {
            console.log('error...', error);
            return console.dir(error);

        }
        console.dir('Body : ******');
        console.dir('body', body);
        console.log('body data', body);
        console.log('\n\n\nResponse Code ****:' + response.statusCode );
        expect(response.statusCode).toBe(200);
        done();
    });
  });

  it('negative API testing for adding Customer details when customer is already exist)', function(done) {
    console.log('adding customer method..');
    Request.post({
      headers: { 'content-type': 'application/json' , Accesstoken: 'shsdjfgdfhdfghfghsdfgsdhfs' },
      url: 'http://localhost:4000/api/v1/customers/CustomerDetails/',
      body: JSON.stringify({
        formData: {
          CustomerID: 'asd-61dgfash0-11ea-6677-8dnfadf',
          NodeName: 'Bajaj',
          EmailID: 'bajaj@gmail.com',
          Telephone: '9783900094',
          DomainName: 'bajaj.com'
       }
      })

      }, (error, response, body) => {
        if (error) {
            return console.dir(error);
        }
        console.dir('Body : ******');
        console.dir('body', body);
        console.log('body data', body);

        console.log('\n\n\nResponse Code ****:' + response.statusCode );
        // expect(response.statusCode).toBe(200) ;
        expect(response.statusCode).toBe(500);
          // expect(response.statusCode).toEqual(0);
          // this below line took half day of research
        done();
    });
  });

  xit('positive API testing for to edit/update Customer details', function(done) {
    Request.post({
      headers: { 'content-type': 'application/json' , Accesstoken: 'shsdjfgdfhdfghfghsdfgsdhfs' },
      url: 'http://localhost:4000/api/v1/customers/UpdateCustomer',
      body: JSON.stringify({
        formData: {
           CustomerID: '38a693d0-6d9f-11ea-a61d-7d84f9f34463',
					 NodeName: 'Kaiser1',
					 EmailID: 'kaiser@gmail.com',
					 Telephone: '9783900094'
        }
      })

      }, (error, response, body) => {
        if (error) {
            return console.dir(error);
        }
        console.dir('Body : ******');
        console.dir('body', body);

        console.log('\n\n\nResponse Code ****:' + response.statusCode );
		      expect(response.statusCode).toBe(200);
          // this below line took half day of research
        done();
    });
  });

  fit('negative API testing for to edit/update Customer details', function(done) {
    Request.post({
      headers: { 'content-type': 'application/json' , Accesstoken: 'shsdjfgdfhdfghfghsdfgsdhfs'},
      url: 'http://localhost:4000/api/v1/UpdateCustomer',
      body: JSON.stringify({
        formData: {
           CustomerID: '38a693d0-6d9f-11ea-a61d-7d84f9f34463',
					 NodeName: 'Kaiser1',
					 EmailID: 'kaiser@gmail.com',
					 Telephone: '9783900094'
        }
      })

      }, (error, response, body) => {
        if (error) {
            return console.dir(error);
        }
        console.dir('Body : ******');
        console.dir('body', body);

        console.log('\n\n\nResponse Code ****:' + response.statusCode );
		      expect(response.statusCode).toBe(404);
          // this below line took half day of research
        done();
    });
  });

  fit('API testing for to post hierarchy', function(done) {
    console.log('in post hierrarchy...');
    Request.post({
      headers: { 'content-type': 'application/json', Accesstoken: 'shsdjfgdfhdfghfghsdfgsdhfs'},
      url: 'http://localhost:4000/api/v1/customers/postHierarchy',
      body: JSON.stringify({
          Id: '38a693d0-6d9f-11ea-a61d-7d84f9f34463',
          NodeID: 1,
          NodeName: 'Kaiser Permanente',
          NodeShortName: 'Kaiser Permanente',
          ParentID: null,
          NodeType: 'enterprise-hierarchy',
          TypeOf: 'enterprise-configurartor',
          PluginID: null,
          NodeInfo: null,
          CreatedDate: '2019-12-16T17:37:46.021Z',
          LastModifiedDate: '2019-12-16T17:37:46.022Z',
          CreatedBy: 'anand',
          PluginInfoId: null,
          ModifiedBy: 'anand',
          IsActive: 1,
          createdAt: '2019-12-16T12:07:43.161Z',
          updatedAt: '2019-12-16T12:07:43.161Z',
            children: [
                {
                    Id: '1b513c80-4343-11ea-bhhc-abf86d237728',
                    NodeID: 139,
                    NodeName: 'Mednet 2',
                    NodeShortName: 'Mednet 2',
                    ParentID: 1,
                    NodeType: 'application',
                    TypeOf: 'Mednet',
                    PluginID: 1,
                    NodeInfo: null,
                    CreatedDate: '2020-01-30T09:30:08.084Z',
                    LastModifiedDate: '2020-01-30T09:30:08.084Z',
                    CreatedBy: 'user1',
                    PluginInfoId: '1b505220-4343-11ea-bf1c-abf86d237728',
                    ModifiedBy: 'user1',
                    IsActive: 1,
                    createdAt: '2020-01-30T09:30:08.840Z',
                    updatedAt: '2020-01-30T09:30:08.840Z',
                    children: []
                }
            ]

      })

      }, (error, response, body) => {
        if (error) {
            return console.dir(error);
        }
        console.dir('Body : ******');
        console.dir('body', body);

        console.log('\n\n\nResponse Code ****:' + response.statusCode );
		      expect(response.statusCode).toBe(200);
          // this below line took half day of research
        done();
    });
  });

  it('negative API testing for to post hierarchy', function(done) {
    console.log('in post hierrarchy...');
    Request.post({
      headers: { 'content-type': 'application/json' ,Accesstoken: 'shsdjfgdfhdfghfghsdfgsdhfs' },
      url: 'http://localhost:4000/api/postHierarchy',
      body: JSON.stringify({
          Id: '38a693d0-6d9f-11ea-a61d-7d84f9f34463',
          NodeID: 1,
          NodeName: 'Kaiser Permanente',
          NodeShortName: 'Kaiser Permanente',
          ParentID: null,
          NodeType: 'enterprise-hierarchy',
          TypeOf: 'enterprise-configurartor',
          PluginID: null,
          NodeInfo: null,
          CreatedDate: '2019-12-16T17:37:46.021Z',
          LastModifiedDate: '2019-12-16T17:37:46.022Z',
          CreatedBy: 'anand',
          PluginInfoId: null,
          ModifiedBy: 'anand',
          IsActive: 1,
          createdAt: '2019-12-16T12:07:43.161Z',
          updatedAt: '2019-12-16T12:07:43.161Z',
            children: [
                {
                    Id: '1b513c80-4343-11ea-bhhc-abf86d237728',
                    NodeID: 139,
                    NodeName: 'Mednet 2',
                    NodeShortName: 'Mednet 2',
                    ParentID: 1,
                    NodeType: 'application',
                    TypeOf: 'Mednet',
                    PluginID: 1,
                    NodeInfo: null,
                    CreatedDate: '2020-01-30T09:30:08.084Z',
                    LastModifiedDate: '2020-01-30T09:30:08.084Z',
                    CreatedBy: 'user1',
                    PluginInfoId: '1b505220-4343-11ea-bf1c-abf86d237728',
                    ModifiedBy: 'user1',
                    IsActive: 1,
                    createdAt: '2020-01-30T09:30:08.840Z',
                    updatedAt: '2020-01-30T09:30:08.840Z',
                    children: []
                }
            ]

      })

      }, (error, response, body) => {
        if (error) {
            return console.dir(error);
        }
        console.dir('Body : ******');
        console.dir('body', body);

        console.log('\n\n\nResponse Code ****:' + response.statusCode );
		      expect(response.statusCode).toBe(404);
          // this below line took half day of research
        done();
    });
  });
});


