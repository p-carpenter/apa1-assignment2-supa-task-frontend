describe("Authentication Flows", () => {
  beforeEach(() => {
    // Clear any existing authentication state
    cy.clearLocalStorage();
    cy.clearCookies();

    // Visit the homepage
    cy.visit("http://localhost:3000/");
  });

  it("redirects unauthenticated users from protected routes to login", () => {
    // Try to access a protected route (profile)
    cy.visit("http://localhost:3000/profile");

    // Should be redirected to login
    cy.url().should("include", "/login");
    cy.get('[data-testid="login-form"]').should("be.visible");
  });

  it("displays login form with validation", () => {
    // Navigate to login page
    cy.visit("http://localhost:3000/login");

    // Form elements should be visible
    cy.get('[data-testid="login-form"]').should("be.visible");
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");

    // Submit empty form to trigger validation
    cy.get('button[type="submit"]').click();

    // Error messages should appear
    cy.get('[data-testid="email-error"]').should("be.visible");
    cy.get('[data-testid="password-error"]').should("be.visible");

    // Fill in email only
    cy.get('input[type="email"]').type("test@example.com");
    cy.get('button[type="submit"]').click();

    // Only password error should remain
    cy.get('[data-testid="email-error"]').should("not.exist");
    cy.get('[data-testid="password-error"]').should("be.visible");
  });

  it("displays registration form with validation", () => {
    // Navigate to signup page
    cy.visit("http://localhost:3000/signup");

    // Form elements should be visible
    cy.get('[data-testid="signup-form"]').should("be.visible");
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
    cy.get('input[name="confirmPassword"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");

    // Submit empty form to trigger validation
    cy.get('button[type="submit"]').click();

    // Error messages should appear
    cy.get('[data-testid="email-error"]').should("be.visible");
    cy.get('[data-testid="password-error"]').should("be.visible");

    // Test password confirmation validation
    cy.get('input[type="email"]').type("new@example.com");
    cy.get('input[type="password"]').type("password123");
    cy.get('input[name="confirmPassword"]').type("different");
    cy.get('button[type="submit"]').click();

    // Password mismatch error should appear
    cy.get('[data-testid="confirm-password-error"]').should("be.visible");
  });

  it("allows users to login with valid credentials", () => {
    // Visit login page
    cy.visit("http://localhost:3000/login");

    // Enter valid credentials
    cy.get('input[type="email"]').type("test@example.com");
    cy.get('input[type="password"]').type("password123");

    // Submit form
    cy.get('button[type="submit"]').click();

    // Should be redirected to homepage or dashboard
    cy.url().should("not.include", "/login");

    cy.get('[data-testid="user-menu"]').should("be.visible");
    cy.get('[data-testid="logout-button"]').should("exist");
  });

  it("shows error message for invalid credentials", () => {
    // Visit login page
    cy.visit("http://localhost:3000/login");

    // Enter invalid credentials
    cy.get('input[type="email"]').type("wrong@example.com");
    cy.get('input[type="password"]').type("wrongpassword");

    // Submit form
    cy.get('button[type="submit"]').click();

    // Should show error message
    cy.get('[data-testid="auth-error"]')
      .should("be.visible")
      .and("contain.text", "Invalid email or password");

    // Should still be on login page
    cy.url().should("include", "/login");
  });

  it("allows users to logout", () => {
    // Login first
    cy.visit("http://localhost:3000/login");
    cy.get('input[type="email"]').type("test@example.com");
    cy.get('input[type="password"]').type("password123");
    cy.get('button[type="submit"]').click();

    // Wait for login to complete
    cy.get('[data-testid="user-menu"]').should("be.visible");

    // Click on user menu to expand it
    cy.get('[data-testid="user-menu"]').click();

    // Click logout button
    cy.get('[data-testid="logout-button"]').click();

    // Should be logged out - check for login button
    cy.get('[data-testid="login-link"]').should("be.visible");
    cy.get('[data-testid="user-menu"]').should("not.exist");
  });

  it("allows users to navigate between login and signup pages", () => {
    // Start at login page
    cy.visit("http://localhost:3000/login");

    // Click link to signup
    cy.get('[data-testid="signup-link"]').click();

    // Should now be on signup page
    cy.url().should("include", "/signup");
    cy.get('[data-testid="signup-form"]').should("be.visible");

    // Click link back to login
    cy.get('[data-testid="login-link"]').click();

    // Should be back on login page
    cy.url().should("include", "/login");
    cy.get('[data-testid="login-form"]').should("be.visible");
  });

  it("restricts incident management features to authenticated users", () => {
    // Visit gallery as unauthenticated user
    cy.visit("http://localhost:3000/gallery");

    // Add/edit buttons should not be visible
    cy.get('[data-testid="add-incident-button"]').should("not.exist");
    cy.get('[data-testid="edit-incident-button"]').should("not.exist");

    // Now login
    cy.visit("http://localhost:3000/login");
    cy.get('input[type="email"]').type("test@example.com");
    cy.get('input[type="password"]').type("password123");
    cy.get('button[type="submit"]').click();

    // Go back to gallery
    cy.visit("http://localhost:3000/gallery");

    // Add/edit buttons should now be visible
    cy.get('[data-testid="add-incident-button"]').should("be.visible");
    cy.get('[data-testid="edit-incident-button"]').should("be.visible");
  });
});
