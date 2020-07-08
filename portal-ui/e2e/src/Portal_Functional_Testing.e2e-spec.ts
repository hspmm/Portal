import { browser, element, by, protractor} from 'protractor';
import { BrowserStack } from 'protractor/built/driverProviders';
const locator = require('./test.json');
const Request = require('request');
const fs = require('fs');
const path = require('path');
const util = require('util');

describe('Positive test cases for Icu Medical Portal e2e tsting', () => {
  browser.driver.manage().window().maximize();

  fit('should display login page', () => {
    browser.get('http://localhost:4200/');
    browser.sleep(2000);
  });

  fit('should be able to login successfully ', async () => {
    browser.get('http://localhost:4200/');
    browser.sleep(3000);
    await element(by.id(locator.locatorForLoginPage.name)).clear();
    await element(by.id(locator.locatorForLoginPage.password)).clear();
    await element(by.id(locator.locatorForLoginPage.name)).sendKeys('esadmin1');
    await element(by.id(locator.locatorForLoginPage.password)).sendKeys('user@123');
    await element(by.id(locator.locatorForLoginPage.loginButton)).click();
  });

  xit('edit and refresh button should be disabled while adding customer', async () => {
    await element(by.id(locator.locatorToAddCustomer.button)).click();
    browser.sleep(3000);
    expect(element(by.xpath(locator.locatorForEditButtonCustomer.button)).isEnabled).toBe(true);
    browser.sleep(2000);
  });

  fit('should be able to add Customer and view it',  async() => {
   // browser.get('http://localhost:4200/dashboard'); //addCustomer
    browser.sleep(3000);
    element(by.id(locator.locatorForAddCustomer.addCustomer)).click();
    browser.sleep(3000);
    element(by.id(locator.locatorForAddCustomer.name)).sendKeys('Apollo');
    browser.sleep(3000);
    element(by.id(locator.locatorForAddCustomer.emailID)).sendKeys('kaiser@test.com');
    browser.sleep(3000);
    element(by.id(locator.locatorForAddCustomer.domain)).sendKeys('kaiser.com');
    browser.sleep(3000);
    element(by.id(locator.locatorForAddCustomer.telephone)).sendKeys('+91 7437312345');
    browser.sleep(3000);
    const fileToUpload = 'C:/Users/NS00032326/Documents/certificate/ce.p12';
    const absolutePath = path.resolve(__dirname, fileToUpload);
    browser.sleep(3000);
    await element(by.css('input[type="file"]')).sendKeys(absolutePath);
   // element(by.id('uploadButton')).click();
    browser.sleep(5000);
    element(by.xpath('/html/body/div[2]/div[2]/div/mat-dialog-container/app-customer-page/form/div/label')).click();
    browser.sleep(3000);
    element(by.id(locator.locatorForAddCustomer.addButton)).click().then(() => {
      browser.sleep(6000);
      expect(element(by.xpath('')).isDisplayed());
    });

  });

  it('should be able to cancel the customer',  ( ) => {
    browser.get('http://localhost:4200/dashboard');
    browser.sleep(8000);
    element(by.id(locator.locatorForAddCustomer.addCustomer)).click();
    browser.sleep(8000);
    element(by.id(locator.locatorForAddCustomer.name)).sendKeys('Apollo');
    browser.sleep(3000);
    element(by.id(locator.locatorForAddCustomer.emailID)).sendKeys('kaiser@test.com');
    browser.sleep(3000);
    element(by.id(locator.locatorForAddCustomer.domain)).sendKeys('kaiser.com');
    browser.sleep(3000);
    // element(by.id(locator.locatorForAddCustomer.telephone)).sendKeys('+9174373');
    // browser.sleep(3000);
    element(by.id(locator.locatorForCancelCustomer.button)).click();
    browser.sleep(9000);

  });

  it('should display customer already existed', () => {
    browser.sleep(3000);
    element(by.id(locator.locatorForAddCustomer.addCustomer)).click();
    browser.sleep(4000);
    element(by.id(locator.locatorForAddCustomer.name)).sendKeys('Apollo');
    browser.sleep(3000);
    element(by.id(locator.locatorForAddCustomer.emailID)).sendKeys('kaiser@test.com');
    browser.sleep(3000);
    element(by.id(locator.locatorForAddCustomer.domain)).sendKeys('kaiser.com');
    browser.sleep(3000);
    element(by.id(locator.locatorForAddCustomer.telephone)).sendKeys('+9174373');
    browser.sleep(3000);
    element(by.id(locator.locatorForAddCustomer.addButton)).click().then(() => {
      expect(element(by.cssContainingText('div.error-popup', 'Customer with same details already exist')));
    });
    browser.sleep(6000);
  });

  it('should display customer already existed...', () => {
    browser.get('http://localhost:4200/dashboard');
    browser.sleep(3000);
    element(by.id(locator.locatorForAddCustomer.addCustomer)).click();
    browser.sleep(4000);
    element(by.id(locator.locatorForAddCustomer.name)).sendKeys('Apollo');
    browser.sleep(3000);
    element(by.id(locator.locatorForAddCustomer.emailID)).sendKeys('kaiser@test.com');
    browser.sleep(3000);
    element(by.id(locator.locatorForAddCustomer.domain)).sendKeys('kaiser.com');
    browser.sleep(3000);
    element(by.id(locator.locatorForAddCustomer.telephone)).sendKeys('+9174373');
    browser.sleep(3000);
    element(by.id(locator.locatorForAddCustomer.addButton)).click();
    browser.sleep(5000);
    Request.get('http://localhost:4000/api/v1/customers/getCustomerList', async(req, res) => {
        const data = JSON.parse(res.body);
        console.log('data......', data[1].NodeName);
        // if (data[1].NodeName === 'Apollo'){
        expect(data[1].NodeName).toBe('Apollo');
        expect(element(by.cssContainingText('div.error-popup', 'Customer with same details already exist')));
      //  }
   });


    // element(by.xpath('/html/body/app-root/app-landing/app-dashboard/div/div[2]/div[1]/div/mat-tree/mat-tree-node[1]')).click();
    // browser.sleep(5000);
  });

  it('testing customer list with server side', async () => {
    // browser.get('http://localhost:4200/dashboard');
    browser.sleep(2000);
    // tslint:disable-next-line: max-line-length
    await element(by.xpath('/html/body/app-root/app-landing/app-dashboard/div/div[2]/div[1]/div/mat-tree/mat-nested-tree-node/div/li')).click();
    browser.sleep(4000);
    Request.get('http://localhost:4000/api/v1/customers/getCustomerList', async (req, res) => {
      const data = JSON.parse(res.body);
      console.log('Customer data', data);
      console.log('CustomerID', data[0].CustomerID);
      console.log('Node Name', data[0].NodeName);
      console.log('EmailId', data[0].EmailID);
      console.log('Telephone', data[0].Telephone);
      // tslint:disable-next-line: max-line-length
      await expect(data[0].NodeName).toBe('kaiser');
     //  expect(checkError()).toEqual(0);
      if (res) {
        console.log('response', res);
      }
  });
});

  it('should be able to edit the customer',  async () => {
    // tslint:disable-next-line: max-line-length
    browser.get('http://localhost:4200/dashboard');
    browser.sleep(2000);
    // tslint:disable-next-line: max-line-length
    element(by.xpath('/html/body/app-root/app-landing/app-dashboard/div/div[2]/div[1]/div/mat-tree/mat-nested-tree-node/div/li')).click();
    element(by.xpath('//*[@id="edit-customer"]')).click();
    element(by.xpath('//*[@id="name"]')).clear();
    element(by.xpath('//*[@id="name"]')).sendKeys('Kaiser1');
    element(by.xpath(locator.locatorForAddCustomer.emailID)).clear();
    element(by.xpath(locator.locatorForAddCustomer.emailID)).sendKeys('kaiser@test.com');
    element(by.xpath(locator.locatorForAddCustomer.domain)).clear();
    element(by.xpath(locator.locatorForAddCustomer.domain)).sendKeys('google');
    element(by.xpath(locator.locatorForAddCustomer.telephone)).clear();
    element(by.xpath(locator.locatorForAddCustomer.telephone)).sendKeys('+9174373');
    await element(by.xpath(locator.locatorForAddCustomer.addButton)).click().then(() => {
      browser.sleep(5000);
      expect(element(by.cssContainingText('div.success-popup', 'Customer Updated Successfully')));
      expect(element(by.xpath('/html/body/app-root/app-landing/app-dashboard/div/div[1]/button[4]')).click()); // to refresh after edit
    });

    browser.sleep(2000);
  });


  it('should be able to generate the download the file', async ()  => {
    browser.sleep(4000);
    await element(by.id(locator.locatorToDownloadFile.button)).click();
    // element(by.className('app-button-color mt-3 mb-3 mr-2')).click();
    browser.sleep(8000);
  });

  it('verifying downloded file' ,  async () => {
    browser.get('http://localhost:4200/dashboard');
    const filename = 'keyFile.json';
    browser.sleep(4000);
    // tslint:disable-next-line: max-line-length
    await element(by.xpath('/html/body/app-root/app-landing/app-dashboard/div/div[2]/div[1]/div/mat-tree/mat-nested-tree-node/div/li')).click();
    browser.sleep(4000);
    await element(by.id(locator.locatorToDownloadFile.button)).click();
    expect(filename).toContain('keyFile.json');
    // if (fs.existsSync(filename)) {
    //   console.log('path exists..');
    //   fs.unlinkSync(filename);
    // } else {
    // console.log('file is', filename);
    // expect(filename).toContain('keyFile.json');
    // return fs.existsSync(filename);
    // }
  });

  it('should hide customer details on click of arrow' , async () => {
    browser.sleep(2000);
    await(element(by.xpath(locator.locatorToHideDetails.button))).click();
    browser.sleep(5000);
  });

  it('should go to back to home page', () => {
    browser.sleep(3000);
    element(by.xpath('/html/body/app-root/app-landing/mat-toolbar/mat-toolbar-row/div[4]/button[1]')).click();
    browser.sleep(3000);
  });

  it('should logout suceessfully', () => {
    browser.get('http://localhost:4200/dashboard');
    element(by.xpath('/html/body/app-root/app-landing/mat-toolbar/mat-toolbar-row/div[4]/button[2]/span/mat-icon[2]')).click();
    browser.sleep(2000);
    element(by.xpath('/html/body/div[2]/div[2]/div/div/div/button[2]')).click().then(() => {
     expect(element(by.xpath('http://localhost:4200/')));
     browser.switchTo();
    });
});
});
