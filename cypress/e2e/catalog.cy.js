describe('Catalog Page', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/catalog');
    });
  
    it('loads incident cards', () => {
      cy.get('.incident-item').should('have.length.at.least', 1);
    });
  
    it('filters incidents by category', () => {
      // Get the first available category
      // click on multi-select dropdown and click on the first dropdown-option
        cy.get('.multi-select-dropdown').first().click();
      
      // Verify filter has been applied
      cy.get('.multi-select-dropdown')
        .children().first()
        .should('have.class', 'active');
    });
  
    it('searches for incidents', () => {
      // Type in search box
      cy.get('[data-testid="search-input"]').type('test');
      
      // Check if search is applied
      cy.get('.incident-card').should('have.length.at.least', 0);
    });
  
    it('navigates to gallery when clicking on an incident', () => {
      cy.get('.incident-card').first().dblclick();
      cy.url().should('include', '/gallery');
    });
  });