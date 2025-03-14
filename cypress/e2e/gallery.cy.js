describe("Gallery Page", () => {
  beforeEach(() => {
    // Visit the catalog page first
    cy.visit("http://localhost:3000/catalog");

    // Wait for incidents to load
    cy.get('[data-testid="incident-item"]').should("have.length.at.least", 1);

    // Open the first incident to navigate to gallery
    cy.get('[data-testid="incident-item"]').first().dblclick();

    // Verify we've navigated to the gallery page
    cy.url().should("include", "/gallery");
    
    // Wait for gallery content to load
    cy.get('[data-testid="gallery-viewer"]').should("exist");
  });

  it("displays incident details correctly", () => {
    // Check basic incident information is displayed
    cy.get('[data-testid="incident-title"]').should("be.visible");
    cy.get('[data-testid="incident-description"]').should("be.visible");
    cy.get('[data-testid="incident-date"]').should("be.visible");
    cy.get('[data-testid="incident-category"]').should("be.visible");
  });

  it("renders the correct decade-specific UI components", () => {
    // Get the current incident date to determine expected decade theme
    cy.get('[data-testid="incident-date"]').then(($dateEl) => {
      const dateText = $dateEl.text();
      
      // Try to extract a year from the date text using regex
      const yearMatch = dateText.match(/\b(19[8-9][0-9]|20[0-2][0-9])\b/);
      
      if (yearMatch) {
        const year = parseInt(yearMatch[0]);
        const decade = Math.floor(year / 10) * 10;

        // Log the detected decade for debugging
        cy.log(`Detected year: ${year}, decade: ${decade}`);

        // Check for decade-specific UI elements based on data attributes instead of classes
        if (decade === 1980) {
          cy.get('[data-decade="1980s"]').should("exist");
        } else if (decade === 1990) {
          cy.get('[data-decade="1990s"]').should("exist");
        } else if (decade === 2000) {
          cy.get('[data-decade="2000s"]').should("exist");
        } else if (decade >= 2010) {
          // For 2010s and 2020s, check for any modern viewer
          cy.get('[data-decade="modern"]').should("exist");
        }
      } else {
        // If we can't determine the decade, at least verify some viewer is showing
        cy.get('[data-testid="incident-viewer"]').should("exist");
      }
    });
  });

  it("navigates between incidents correctly", () => {
    // Get the title of the first incident
    cy.get('[data-testid="incident-title"]')
      .invoke("text")
      .as("firstIncidentTitle");

    // Check if we have more than one incident to navigate between
    cy.get('[data-testid="next-incident-button"]').then(($button) => {
      // Only run this test if the next button exists and is not disabled
      if ($button.length > 0 && !$button.prop('disabled')) {
        // Click the next button
        cy.get('[data-testid="next-incident-button"]').click();

        // Verify URL has changed
        cy.url().should("include", "/gallery");

        // Verify the title has changed
        cy.get('[data-testid="incident-title"]')
          .invoke("text")
          .then(function (newTitle) {
            expect(newTitle).not.to.equal(this.firstIncidentTitle);
          });

        // Click previous button to go back
        cy.get('[data-testid="prev-incident-button"]').click();

        // Verify we're back to the first incident
        cy.get('[data-testid="incident-title"]')
          .invoke("text")
          .then(function (title) {
            expect(title).to.equal(this.firstIncidentTitle);
          });
      } else {
        cy.log('Skip navigation test - only one incident available');
      }
    });
  });

  it("renders artifact content when available", () => {
    // Check if an artifact exists
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="artifact-renderer"]').length > 0) {
        // Look for artifact container
        cy.get('[data-testid="artifact-renderer"]').should("exist");
        
        // Check for different artifact content types
        cy.get('[data-testid="artifact-content"]').should("exist");
      } else {
        cy.log("No artifact present for this incident - skipping test");
      }
    });
  });

  it("returns to catalog when clicking close button", () => {
    // Click the close button
    cy.get('[data-testid="close-gallery-button"]').click();

    // Should navigate back to catalog
    cy.url().should("include", "/catalog");
    cy.get('[data-testid="incident-grid"]').should("exist");
  });

  it("handles browser back/forward navigation", () => {
    // Check if navigation is possible
    cy.get('[data-testid="next-incident-button"]').then(($button) => {
      if ($button.length > 0 && !$button.prop('disabled')) {
        // Get the first incident URL
        cy.url().as("firstUrl");

        // Navigate to next incident
        cy.get('[data-testid="next-incident-button"]').click();
        cy.url().as("secondUrl");

        // Navigate back using browser
        cy.go("back");

        // Should show first incident again
        cy.url().should("deep.include", "/gallery");

        // Navigate forward
        cy.go("forward");

        // Should still be in gallery
        cy.url().should("deep.include", "/gallery");
      } else {
        cy.log('Skip browser navigation test - need multiple incidents');
      }
    });
  });
  
  it("shows incident details in the correct format", () => {
    // Check if details section exists
    cy.get('[data-testid="incident-details"]').should("exist");
    
    // Verify key pieces of information
    cy.get('[data-testid="incident-severity"]').should("exist");
    cy.get('[data-testid="incident-impact"]').should("exist");
    
    // Check timeline section if present
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="incident-timeline"]').length > 0) {
        cy.get('[data-testid="timeline-event"]').should("have.length.at.least", 1);
      }
    });
  });
});