import React from "react";
import { render, screen } from "@testing-library/react";
import GlassmorphicDetailsWindow from "@/app/components/ui/decades/GlassmorphicDetailsWindow";
import { formatDate } from "@/app/utils/formatting/dateUtils";

// Mock the date utils
jest.mock("@/app/utils/formatting/dateUtils", () => ({
  formatDate: jest.fn().mockImplementation((date) => "December 5, 2022"),
}));

describe("GlassmorphicDetailsWindow", () => {
  const mockIncident = {
    id: "1",
    name: "Cryptocurrency Crash",
    description: "Major cryptocurrency value collapse",
    cause: "Market speculation and regulatory concerns",
    consequences: "Billions in lost value",
    time_to_resolve: "Ongoing",
    incident_date: "2022-05-12T00:00:00.000Z",
    category: "Crypto",
    severity: "High",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with glassmorphic styling (2020s theme)", () => {
    render(<GlassmorphicDetailsWindow incident={mockIncident} />);

    expect(screen.getByTestId("2020s-window")).toBeInTheDocument();
  });

  it("displays incident details correctly", () => {
    render(<GlassmorphicDetailsWindow incident={mockIncident} />);

    expect(screen.getByText("Cryptocurrency Crash")).toBeInTheDocument();
    expect(
      screen.getByText("Major cryptocurrency value collapse")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Market speculation and regulatory concerns")
    ).toBeInTheDocument();
    expect(screen.getByText("Billions in lost value")).toBeInTheDocument();
    expect(screen.getByText("Ongoing")).toBeInTheDocument();
    expect(screen.getByText("Crypto")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("displays formatted date correctly", () => {
    render(<GlassmorphicDetailsWindow incident={mockIncident} />);

    expect(screen.getByText("May 12, 2022")).toBeInTheDocument();
  });

  it("handles missing optional fields gracefully", () => {
    const incidentWithMissingFields = {
      id: "2",
      name: "Partial Incident",
      description: "Just a description",
      incident_date: "2022-01-30T00:00:00.000Z",
      category: "Software",
      severity: "Moderate",
    };

    render(<GlassmorphicDetailsWindow incident={incidentWithMissingFields} />);

    // Required fields should be present
    expect(screen.getByText("Partial Incident")).toBeInTheDocument();
    expect(screen.getByText("Just a description")).toBeInTheDocument();

    // Optional sections should not be present
    expect(screen.queryByText("Why It Happened")).not.toBeInTheDocument();
    expect(screen.queryByText("Consequences")).not.toBeInTheDocument();
    expect(screen.queryByText("Resolution Time")).not.toBeInTheDocument();
  });

  it("applies the appropriate severity styling", () => {
    render(<GlassmorphicDetailsWindow incident={mockIncident} />);

    // Check that severity indicator has appropriate class
    const severityIndicator = screen.getByTestId("severity-indicator");
    expect(severityIndicator).toHaveClass("severity_high");
  });

  it("returns null when incident is null", () => {
    const { container } = render(<GlassmorphicDetailsWindow incident={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
