import React from "react";
import { render } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { IncidentProvider } from "@/app/contexts/IncidentContext";
import { ThemeProvider } from "@/app/contexts/ThemeContext";
import { handlers } from "./msw-handlers";
import { AuthProvider } from "@/app/contexts/AuthContext";

// Mock data for testing
export const mockIncidents = [
  {
    id: "1",
    name: "Mock Incident 1",
    category: "Software",
    severity: "3",
    incident_date: "2000-01-01",
    description: "Mock description 1",
  },
  {
    id: "2",
    name: "Mock Incident 2",
    category: "Hardware",
    severity: "4",
    incident_date: "1990-05-15",
    description: "Mock description 2",
  },
];

// Set up custom render function with configurable providers
const customRender = (ui, options = {}) => {
  // Default options
  const defaultOptions = {
    withAuth: true,
    withIncidents: true,
    withTheme: true,
    ...options,
  };

  // Create wrapper based on options
  const Wrapper = ({ children }) => {
    let wrappedComponent = children;

    // Add ThemeProvider if requested
    if (defaultOptions.withTheme) {
      wrappedComponent = <ThemeProvider>{wrappedComponent}</ThemeProvider>;
    }

    // Add IncidentProvider if requested
    if (defaultOptions.withIncidents) {
      wrappedComponent = (
        <IncidentProvider incidents={mockIncidents}>
          {wrappedComponent}
        </IncidentProvider>
      );
    }

    // Add AuthProvider if requested
    if (defaultOptions.withAuth) {
      wrappedComponent = <AuthProvider>{wrappedComponent}</AuthProvider>;
    }

    return wrappedComponent;
  };

  return render(ui, { wrapper: Wrapper, ...options });
};

// Set up MSW server
const server = setupServer(...handlers);

export { customRender as render, server };
