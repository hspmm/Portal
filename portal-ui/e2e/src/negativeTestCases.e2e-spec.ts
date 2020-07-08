import { browser, element, by, protractor} from 'protractor';
import { BrowserStack } from 'protractor/built/driverProviders';
const locator = require('./test.json');
const Request = require('request');



xdescribe('Error handleing/ negative test cases for Icu Medical Portal e2e tsting', () => {
  browser.driver.manage().window().maximize();

  xit('should display login page', () => {
    browser.get('http://localhost:4200/');
    browser.sleep(2000);
  });

  xit('Login failed, Username is required', async() => {
    browser.get('http://localhost:4200/');
    element(by.id(locator.locatorForLoginPage.name)).sendKeys('');
    browser.sleep(2000);
    expect(element(by.xpath('/html/body/app-root/app-login-page/div/div[3]/div/div[3]/form/div/mat-form-field[1]/div/div[3]/div/mat-error')).getText()).toEqual('Enter a valid Username');
    browser.sleep(3000);
    });

});


