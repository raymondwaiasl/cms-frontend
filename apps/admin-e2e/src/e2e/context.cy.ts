describe('Failed case', () => {
  before(() => {
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
    cy.clearLocalStorage('token');
    cy.intercept({
      method: 'POST', // Route all GET requests
      url: '/userInfo/login', // that have a URL that matches '/users/*'
    }).as('login');
    cy.visit('/login');
    cy.get('#username').type('admin');
    cy.get('input[type=password]').type('123123');
    cy.get('button[type=submit]').click();
  });
  afterEach(() => {
    cy.visit('/context');
  });

  it('Visit Create Context Page', () => {
    cy.visit('/context');
    cy.get('button[data-cy="create_context"]').click();
    cy.location('pathname').should('eq', '/context/detail');
  });
  it('Missing Context name and User Role', () => {
    cy.get('button[data-cy="create_context"]').click();

    cy.get('button[type=submit]').click();
    cy.get('p[aria-label=contextName-error]').contains('This Field is required');
    cy.get('p[aria-label=role-error]').contains('This Field is required');
    cy.get('p[aria-label=selectItem-error]').contains('Selected Workspace list cannot be empty');
  });
  it('Missing Context name only', () => {
    cy.get('button[data-cy="create_context"]').click();
    const select = cy.get('div[data-cy=select]');
    select.click();
    cy.get('ul[aria-labelledby=user-role-selection]').children('li:first').click();
    cy.get('button[type=submit]').click();
    cy.get('p[aria-label=contextName-error]').contains('This Field is required');
    cy.get('p[aria-label=selectItem-error]').contains('Selected Workspace list cannot be empty');
  });
  it('Create Context without workspace', () => {
    cy.intercept('http://localhost:8080/context/addContext').as('getContext');
    cy.get('button[data-cy="create_context"]').click();
    const select = cy.get('div[data-cy=select]');
    select.click();
    cy.get('ul[aria-labelledby=user-role-selection]').children('li:first').click();
    cy.get('div[aria-label=context-name]')
      .children('div.MuiInput-root')
      .children('input')
      .type('test');
    cy.get('button[type=submit]').click();
    cy.get('p[aria-label=selectItem-error]').contains('Selected Workspace list cannot be empty');
  });
  //   it('Create Context workspace', () => {
  //     cy.intercept('http://localhost:8080/context/addContext').as('getContext');
  //     cy.get('button[data-cy="create_context"]').click();
  //     const select = cy.get('div[data-cy=select]');
  //     select.click();
  //     cy.get('ul[aria-labelledby=user-role-selection]').children('li:first').click();
  //     cy.get('div[aria-label=context-name]')
  //       .children('div.MuiInput-root')
  //       .children('input')
  //       .type('test');
  //     cy.get('button[type=submit]').click();
  //     cy.get('p[aria-label=selectItem-error]').contains('Selected Workspace list cannot be empty');
  //     cy.get('button[type=submit]').click()
  //     // cy.wait('@getContext').then(() => {
  //     //   cy.location('pathname').should('eq', '/context');
  //     // });
  //     // cy.get('div[data-field=misContextName]:last').children('button').should('contain.text', 'test');
  //   });
});
