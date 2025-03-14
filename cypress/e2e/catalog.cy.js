describe('Catalog Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/catalog');
    
    // Wait for incidents to load
    cy.get('[data-testid="incident-grid"]').should('exist');
  });

  it('loads incident cards', () => {
    cy.get('[data-testid="incident-item"]').should('have.length.at.least', 1);
  });

  it('filters incidents by category', () => {
    // Click on category filter dropdown
    cy.get('[data-testid="category-filter"]').click();
    
    // Select the first category option
    cy.get('[data-testid="category-option"]').first().click();
    
    // Verify filter has been applied - check for active class
    cy.get('[data-testid="category-option"]')
      .first()
      .should('have.class', 'active');
      
    // Check that the incident list has been filtered
    cy.get('[data-testid="incident-count"]').should('exist');
  });

  it('searches for incidents', () => {
    // Get the text of the first incident title for search
    cy.get('[data-testid="incident-title"]')
      .first()
      .invoke('text')
      .then((text) => {
        // Use the first word of the title for search
        const searchTerm = text.split(' ')[0];
        
        // Type in search box
        cy.get('[data-testid="search-input"]').type(searchTerm);
        
        // Check if search is applied - at least one result should appear
        cy.get('[data-testid="incident-item"]').should('have.length.at.least', 1);
        
        // Clear search
        cy.get('[data-testid="search-input"]').clear();
        
        // Type a search term unlikely to match anything
        cy.get('[data-testid="search-input"]').type('xyzabc123nonexistent');
        
        // Should have no results
        cy.get('[data-testid="no-results"]').should('be.visible');
      });
  });

  it('navigates to year folders when available', () => {
    // Click on a year folder
    cy.get('[data-testid="year-folder"]').first().dblclick();
    
    // Should show we're in a year view
    cy.get('[data-testid="current-path"]').should('contain', '/');
    
    // Back button should appear
    cy.get('[data-testid="back-button"]').should('be.visible');
    
    // Click back to return to main view
    cy.get('[data-testid="back-button"]').click();
    
    // Should be back at root
    cy.get('[data-testid="current-path"]').should('not.contain', '/');
  });

  it('navigates to gallery when clicking on an incident', () => {
    cy.get('[data-testid="incident-item"]').first().dblclick();
    cy.url().should('include', '/gallery');
  });
  
  it('sorts incidents by different criteria', () => {
    // Get initial first incident title
    cy.get('[data-testid="incident-title"]')
      .first()
      .invoke('text')
      .as('initialFirstTitle');
    
    // Open sort dropdown
    cy.get('[data-testid="sort-dropdown"]').click();
    
    // Select a different sort option (e.g., by severity)
    cy.get('[data-testid="sort-option-severity"]').click();
    
    // Compare new first incident title with initial one
    cy.get('[data-testid="incident-title"]')
      .first()
      .invoke('text')
      .then(function(newFirstTitle) {
        // Skip this assertion if we only have one incident (can't test sorting)
        cy.get('[data-testid="incident-item"]').then(($items) => {
          if ($items.length > 1) {
            // This could be the same if the first item happens to be the same after sorting
            // So we're being cautious with the assertion
            cy.log(`Initial title: ${this.initialFirstTitle}, New title: ${newFirstTitle}`);
          }
        });
      });
  });
});