import { getGreeting } from '../support/app.po';

describe('Login', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
    cy.clearLocalStorage('token');
    cy.visit('/');
  });

  it('basic control', () => {
    // Custom command example, see `../support/commands.ts` file
    // cy.login('my-email@something.com', 'myPassword');

    cy.url().should('include', '/');
    cy.get('input#username');
    let passwordField = cy.get('input#password');
    cy.get('input[type=checkbox]').click().should('be.checked', 'true');
    cy.get('button[aria-label="toggle password visibility"]')
      .click()
      .then(() => {
        passwordField.should('have.attr', 'type', 'text');
      });
    cy.get('button[type=submit]').should('be.disabled');
    // Function helper example, see `../support/app.po.ts` file
  });
  it('login fail case', () => {
    cy.intercept({
      method: 'POST', // Route all GET requests
      url: '/userInfo/login', // that have a URL that matches '/users/*'
    }).as('login'); // and assign an alias
    // Custom command example, see `../support/commands.ts` file
    // cy.login('my-email@something.com', 'myPassword');
    cy.get('input#username').type('something');
    cy.get('input#password').type('something');
    let btn = cy.get('button[type=submit]');
    cy.get('button[type=submit]').should('not.be.disabled');
    btn.click();
    cy.wait('@login').then((interception) => {
      assert.isNotNull(interception.response.body);
      assert.strictEqual(interception.response.statusCode, 401);
    });
    // Function helper example, see `../support/app.po.ts` file
  });
  it('login Success case', () => {
    // Custom command example, see `../support/commands.ts` file
    // cy.login('my-email@something.com', 'myPassword');
    cy.get('input#username').type('admin');
    cy.get('input#password').type('123123');
    let btn = cy.get('button[type=submit]');
    cy.get('button[type=submit]').should('not.be.disabled');
    btn.click();
    cy.url().should('eq', 'http://localhost:3000/');
    cy.window().then((win) => {
      assert.isString(win.sessionStorage.getItem('token'));
    });

    // Function helper example, see `../support/app.po.ts` file
  });
});
