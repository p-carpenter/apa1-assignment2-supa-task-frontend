import React from "react";
import { render, screen } from "@testing-library/react";
import MacintoshDetailsWindow from "@/app/components/ui/decades/MacintoshDetailsWindow";

describe("MacintoshDetailsWindow", () => {
  const mockIncident = {
    id: "1",
    name: "Test Incident",
    incident_date: "1988-01-15",
    category: "Hardware",
    severity: "Critical",
    description: "Test description text",
    cause: "Test cause text",
    consequences: "Test consequences text",
    time_to_resolve: "48 hours",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the window with incident details", () => {
    render(<MacintoshDetailsWindow incident={mockIncident} />);

    // Check title bar
    expect(screen.getByText("Test Incident")).toBeInTheDocument();

    // Check metadata fields
    expect(screen.getByText("Hardware")).toBeInTheDocument();
    expect(screen.getByText("Critical")).toBeInTheDocument();
    expect(screen.getByText("Jan 15, 1988")).toBeInTheDocument();

    // Check content sections
    expect(screen.getByText("What Happened")).toBeInTheDocument();
    expect(screen.getByText("Test description text")).toBeInTheDocument();

    expect(screen.getByText("Why It Happened")).toBeInTheDocument();
    expect(screen.getByText("Test cause text")).toBeInTheDocument();

    expect(screen.getByText("Consequences")).toBeInTheDocument();
    expect(screen.getByText("Test consequences text")).toBeInTheDocument();

    expect(screen.getByText("Resolution Time")).toBeInTheDocument();
    expect(screen.getByText("48 hours")).toBeInTheDocument();
  });

  it("calls formatDate with correct incident date", () => {
    render(<MacintoshDetailsWindow incident={mockIncident} />);
    expect(screen.getByText("Jan 15, 1988")).toBeInTheDocument();
  });

  it("handles missing optional fields gracefully", () => {
    const partialIncident = {
      id: "2",
      name: "Partial Incident",
      incident_date: "1986-05-20",
      category: "Software",
      severity: "Moderate",
      description: "Partial description",
      // Missing cause, consequences, and time_to_resolve
    };

    render(<MacintoshDetailsWindow incident={partialIncident} />);

    // Check that required fields are present
    expect(screen.getByText("Partial Incident")).toBeInTheDocument();
    expect(screen.getByText("Software")).toBeInTheDocument();
    expect(screen.getByText("Moderate")).toBeInTheDocument();
    expect(screen.getByText("Partial description")).toBeInTheDocument();

    // Check that optional sections are not rendered
    expect(screen.queryByText("Why It Happened")).not.toBeInTheDocument();
    expect(screen.queryByText("Consequences")).not.toBeInTheDocument();
    expect(screen.queryByText("Resolution Time")).not.toBeInTheDocument();
  });

  it("returns null when no incident is provided", () => {
    const { container } = render(<MacintoshDetailsWindow incident={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
