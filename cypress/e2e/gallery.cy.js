describe("Gallery Page", () => {
  beforeEach(() => {
    // Visit the catalog page first
    cy.visit("http://localhost:3000/catalog");

    // Wait for incidents to load
    cy.get(".incident-item").should("have.length.at.least", 1);

    // Open the first incident to navigate to gallery
    cy.get(".incident-card").first().dblclick();

    // Verify we've navigated to the gallery page
    cy.url().should("include", "/gallery");
  });

  it("renders the correct decade-specific UI components", () => {
    // Get the current incident date to determine expected decade theme
    cy.get('[data-testid="incident-date"]').then(($dateEl) => {
      const dateText = $dateEl.text();
      const year = new Date(dateText).getFullYear();
      const decade = Math.floor(year / 10) * 10;

      // Check for decade-specific UI elements
      if (decade === 1980) {
        cy.get(".macintosh-window").should("exist");
        cy.get('[data-testid="terminal-cursor"]').should("exist");
      } else if (decade === 1990) {
        cy.get(".win98-window").should("exist");
        cy.get(".win95-title-bar").should("exist");
      } else if (decade === 2000) {
        cy.get(".aero-window").should("exist");
        cy.get(".geocities-header").should("exist");
      } else if (decade === 2010) {
        cy.get(".material-window").should("exist");
      } else if (decade === 2020) {
        cy.get(".glassmorphic-window").should("exist");
      }
    });
  });

  it("navigates between incidents correctly", () => {
    // Get the name of the first incident
    cy.get('[data-testid="incident-title"]')
      .invoke("text")
      .as("firstIncidentTitle");

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
  });

  it("renders artifact content correctly", () => {
    // Look for artifact container
    cy.get(".artifact-renderer").should("exist");

    // Check different artifact types
    cy.get(".artifact-renderer").then(($artifact) => {
      if ($artifact.hasClass("artifact-type-image")) {
        // Image artifact should have an image tag
        cy.get(".artifact-image").should("exist").and("be.visible");
      } else if ($artifact.hasClass("artifact-type-code")) {
        // Code artifact should have an iframe
        cy.get(".artifact-code").should("exist");
        cy.get("iframe").should("have.attr", "scrolling", "no");
      }
    });
  });

  it("expands and collapses artifact on click", () => {
    // Artifact should start not expanded
    cy.get(".artifact-renderer").should("not.have.class", "artifact-expanded");

    // Click to expand
    cy.get(".artifact-renderer").click();

    // Should now be expanded
    cy.get(".artifact-renderer").should("have.class", "artifact-expanded");

    // Click again to collapse
    cy.get(".artifact-renderer").click();

    // Should no longer be expanded
    cy.get(".artifact-renderer").should("not.have.class", "artifact-expanded");
  });

  it("navigates by year correctly", () => {
    // Open year navigation
    cy.get('[data-testid="year-nav-button"]').click();

    // Should show year options
    cy.get(".year-nav-dropdown").should("be.visible");

    // Click on a different year
    cy.get(".year-option").not(".active").first().click();

    // Verify URL has changed
    cy.url().should("include", "/gallery");

    // Navigation dropdown should close
    cy.get(".year-nav-dropdown").should("not.exist");
  });

  it("returns to catalog when clicking close button", () => {
    // Click the close button
    cy.get('[data-testid="close-gallery-button"]').click();

    // Should navigate back to catalog
    cy.url().should("include", "/catalog");
    cy.get(".incident-grid").should("exist");
  });

  it("handles browser back/forward navigation properly", () => {
    // Get the first incident URL
    cy.url().as("firstUrl");

    // Navigate to next incident
    cy.get('[data-testid="next-incident-button"]').click();
    cy.url().as("secondUrl");

    // Navigate back using browser
    cy.go("back");

    // Should show first incident again
    cy.url().then(function (currentUrl) {
      expect(currentUrl).to.eq(this.firstUrl);
    });

    // Navigate forward
    cy.go("forward");

    // Should show second incident
    cy.url().then(function (currentUrl) {
      expect(currentUrl).to.eq(this.secondUrl);
    });
  });
});
