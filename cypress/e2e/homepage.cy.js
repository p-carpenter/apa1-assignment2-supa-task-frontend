describe('Homepage', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000');
    });
  
    it('displays the main title', () => {
      cy.contains('TECH INCIDENTS').should('be.visible');
    });
  
    it('navigates to catalog when explore button is clicked', () => {
      cy.contains('EXPLORE ARCHIVE').click();
      cy.url().should('include', '/gallery');
    });
  
    it('opens and closes info modal', () => {
      cy.contains('What is the Tech Incidents Archive?').click();
      cy.contains('About the Tech Incidents Archive').should('be.visible');
      cy.contains('Close').click();
      cy.contains('About the Tech Incidents Archive').should('not.exist');
    });
  });