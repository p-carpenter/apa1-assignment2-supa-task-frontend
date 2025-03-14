describe("Homepage", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  it("displays the main sections of the homepage", () => {
    // Check that main sections are visible
    cy.get('[data-testid="hero-section"]').should("be.visible");
    cy.get('[data-testid="main-content"]').should("be.visible");
    cy.get('[data-testid="featured-incidents"]').should("be.visible");
  });

  it("allows navigation to catalog page", () => {
    // Find and click the explore button
    cy.get('[data-testid="explore-button"]').click();

    // Should navigate to catalog
    cy.url().should("include", "/catalog");
  });

  it("allows navigation to signup/login", () => {
    // There should be auth links in the header
    cy.get('[data-testid="header"]').within(() => {
      // Check if we're already logged in
      cy.get("body").then(($body) => {
        if ($body.find('[data-testid="user-menu"]').length > 0) {
          // If logged in, test user menu
          cy.get('[data-testid="user-menu"]').click();
          cy.get('[data-testid="profile-link"]').should("be.visible");
          cy.get('[data-testid="logout-button"]').should("be.visible");
        } else {
          // If not logged in, check for login/signup links
          cy.get('[data-testid="login-link"]').should("be.visible");
          cy.get('[data-testid="signup-link"]').should("be.visible");
          
          // Test navigation to login page
          cy.get('[data-testid="login-link"]').click();
          cy.url().should("include", "/login");
          
          // Go back to homepage
          cy.go("back");
          
          // Test navigation to signup page
          cy.get('[data-testid="signup-link"]').click();
          cy.url().should("include", "/signup");
        }
      });
    });
  });

  it("displays featured incidents correctly", () => {
    // Check that featured incidents section exists and has items
    cy.get('[data-testid="featured-incidents"]').within(() => {
      cy.get('[data-testid="featured-item"]').should("have.length.at.least", 1);
      
      // Check that each featured item has the expected elements
      cy.get('[data-testid="featured-item"]').first().within(() => {
        cy.get('[data-testid="featured-title"]').should("be.visible");
        cy.get('[data-testid="featured-date"]').should("be.visible");
      });
    });
  });

  it("opens info modal when clicking info button", () => {
    // Find and click the info button
    cy.get('[data-testid="info-button"]').click();
    
    // Modal should appear
    cy.get('[data-testid="info-modal"]').should("be.visible");
    
    // Should be able to close it
    cy.get('[data-testid="close-modal-button"]').click();
    
    // Modal should disappear
    cy.get('[data-testid="info-modal"]').should("not.exist");
  });

  it("shows donation panel in sidebar", () => {
    // Check that donation panel exists
    cy.get('[data-testid="donation-panel"]').should("be.visible");
    
    // Should have donation controls
    cy.get('[data-testid="donation-amount"]').should("be.visible");
    cy.get('[data-testid="donate-button"]').should("be.visible");
  });

  it("allows clicking on featured incidents to navigate to gallery", () => {
    // Click on the first featured incident
    cy.get('[data-testid="featured-item"]').first().click();
    
    // Should navigate to gallery
    cy.url().should("include", "/gallery");
  });
  
  it("shows correct navigation in header", () => {
    // Header should have logo and navigation links
    cy.get('[data-testid="header"]').within(() => {
      cy.get('[data-testid="logo"]').should("be.visible");
      cy.get('[data-testid="nav-links"]').should("be.visible");
      
      // Nav links should include catalog
      cy.get('[data-testid="catalog-link"]').should("be.visible");
    });
  });
});