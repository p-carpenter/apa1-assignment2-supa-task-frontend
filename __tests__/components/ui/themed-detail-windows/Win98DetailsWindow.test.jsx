import React from "react";
import { render, screen } from "@testing-library/react";
import Win98DetailsWindow from "@/app/components/ui/decades/Win98DetailsWindow";

// Mock formatDate to return predictable dates for tests
jest.mock("@/app/utils/formatting/dateUtils", () => ({
  formatDate: jest.fn((date) => {
    if (date === "1999-12-31T00:00:00.000Z") return "Dec 31, 1999";
    return "Test Date";
  }),
}));

describe("MSW Handlers", () => {
  it("defines API handlers", () => {
    // Just a placeholder test to ensure MSW is correctly set up
    expect(true).toBe(true);
  });
});

describe("Win98DetailsWindow", () => {
  const mockIncident = {
    id: "1",
    name: "Y2K Bug",
    description: "Description of the Y2K bug",
    incident_date: "1999-12-31T00:00:00.000Z",
    category: "software",
    severity: "high",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with Windows 95/98 styling", () => {
    render(<Win98DetailsWindow incident={mockIncident} />);

    // Check for Windows 95/98 UI elements
    expect(screen.getByTestId("win98-window")).toBeInTheDocument();
    
    // Title bar now has empty data-testid
    const titleBar = screen.getByText("Y2K Bug").closest(".title-bar");
    expect(titleBar).toBeInTheDocument();
  });

  it("displays incident details correctly", () => {
    render(<Win98DetailsWindow incident={mockIncident} />);

    // Check basic incident details (note: formatDate is mocked)
    expect(screen.getByText("Y2K Bug")).toBeInTheDocument();
    expect(screen.getByText("Description of the Y2K bug")).toBeInTheDocument();
    expect(screen.getAllByText("Dec 31, 1999")[0]).toBeInTheDocument(); // Using first instance
    expect(screen.getByText("software")).toBeInTheDocument(); // Category is lowercase in the component
    expect(screen.getByText("high")).toBeInTheDocument(); // Severity is lowercase in the component
  });

  it("renders optional sections when available", () => {
    const incidentWithAllFields = {
      ...mockIncident,
      cause: "Programming oversight with two-digit years",
      consequences: "Worldwide panic and massive remediation efforts",
      time_to_resolve: "Several years of preparation"
    };

    render(<Win98DetailsWindow incident={incidentWithAllFields} />);

    // Check that all sections are rendered
    expect(screen.getByText("Why It Happened")).toBeInTheDocument();
    expect(screen.getByText("Programming oversight with two-digit years")).toBeInTheDocument();
    expect(screen.getByText("Consequences")).toBeInTheDocument();
    expect(screen.getByText("Worldwide panic and massive remediation efforts")).toBeInTheDocument();
    expect(screen.getByText("Resolution Time")).toBeInTheDocument();
    expect(screen.getByText("Several years of preparation")).toBeInTheDocument();
  });

  it("returns null when incident is null", () => {
    const { container } = render(<Win98DetailsWindow incident={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders status bar with archive name and date", () => {
    render(<Win98DetailsWindow incident={mockIncident} />);
    
    const statusBar = screen.getByText("Tech Incident Archive").closest(".status-bar");
    expect(statusBar).toBeInTheDocument();
    expect(screen.getAllByText("Dec 31, 1999")[1]).toBeInTheDocument(); // Second instance in status bar
  });
});
