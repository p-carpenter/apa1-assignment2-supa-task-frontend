import React from "react";
import { render } from "@testing-library/react";
import Providers from "@/app/contexts/Providers";

// Import individual providers to mock them
import { AuthProvider } from "@/app/contexts/AuthContext";
import { IncidentProvider } from "@/app/contexts/IncidentContext";
import { ThemeProvider } from "@/app/contexts/ThemeContext";

// Mock the individual context providers
jest.mock("@/app/contexts/AuthContext", () => ({
  AuthProvider: jest.fn(({ children }) => (
    <div data-testid="auth-provider">{children}</div>
  )),
}));

jest.mock("@/app/contexts/IncidentContext", () => ({
  IncidentProvider: jest.fn(({ children }) => (
    <div data-testid="incident-provider">{children}</div>
  )),
}));

jest.mock("@/app/contexts/ThemeContext", () => ({
  ThemeProvider: jest.fn(({ children }) => (
    <div data-testid="theme-provider">{children}</div>
  )),
}));

describe("Providers Component", () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  test("renders all providers in the correct nesting order", () => {
    // Create a test component
    const TestComponent = () => (
      <div data-testid="test-component">Test Content</div>
    );

    render(
      <Providers>
        <TestComponent />
      </Providers>
    );

    // Verify that all providers were called
    expect(AuthProvider).toHaveBeenCalled();
    expect(IncidentProvider).toHaveBeenCalled();
    expect(ThemeProvider).toHaveBeenCalled();

    // Verify the nesting order based on the implementation
    // This verifies that:
    // 1. AuthProvider is the outermost provider, wrapping IncidentProvider and ThemeProvider
    // 2. IncidentProvider is in the middle, wrapping ThemeProvider
    // 3. ThemeProvider is the innermost provider, wrapping the children

    // First, verify that AuthProvider receives IncidentProvider as its child
    const authProviderProps = AuthProvider.mock.calls[0][0];
    expect(authProviderProps.children.type).toBe(IncidentProvider);

    // Next, verify that IncidentProvider receives ThemeProvider as its child
    const incidentProviderProps = IncidentProvider.mock.calls[0][0];
    expect(incidentProviderProps.children.type).toBe(ThemeProvider);

    // Finally, verify that ThemeProvider receives the TestComponent as its child
    const themeProviderProps = ThemeProvider.mock.calls[0][0];
    expect(themeProviderProps.children.type).toBe(TestComponent);
  });

  test("passes children through all providers correctly", () => {
    const childContent = "Test Child Content";

    render(
      <Providers>
        <div>{childContent}</div>
      </Providers>
    );

    // Verify each provider was called with appropriate children
    expect(AuthProvider).toHaveBeenCalled();
    expect(IncidentProvider).toHaveBeenCalled();
    expect(ThemeProvider).toHaveBeenCalled();

    // Verify the final children are correctly passed to the ThemeProvider
    const themeProviderProps = ThemeProvider.mock.calls[0][0];
    expect(themeProviderProps.children).toEqual(<div>{childContent}</div>);
  });
});
