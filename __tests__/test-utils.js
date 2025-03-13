import React from "react";
import { render } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { IncidentProvider } from "@/app/contexts/IncidentContext";
import { ThemeProvider } from "@/app/contexts/ThemeContext";
import { handlers } from "../app/utils/msw-handlers";

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

// Set up custom render function with providers
const customRender = (ui, options = {}) => {
  const Wrapper = ({ children }) => (
    <IncidentProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </IncidentProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Set up MSW server
const server = setupServer(...handlers);

// Export everything
export { customRender as render, server, rest };
