import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MaterialDetailsWindow from "@/app/components/ui/decades/MaterialDetailsWindow";
import { formatDate } from "@/app/utils/formatting/dateUtils";

// Mock the date utils
jest.mock("@/app/utils/formatting/dateUtils", () => ({
  formatDate: jest.fn().mockImplementation((date) => "January 1, 2015"),
}));

describe("MaterialDetailsWindow", () => {
  const mockIncident = {
    id: "1",
    name: "Facebook Data Breach",
    description: "Massive user data exposure affecting millions",
    cause: "Security vulnerability in the View As feature",
    consequences: "Exposed personal data of 50M+ users",
    time_to_resolve: "Several months of investigation",
    incident_date: "2018-09-28T00:00:00.000Z",
    category: "Security",
    severity: "High",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with Material Design styling (2010s)", () => {
    render(<MaterialDetailsWindow incident={mockIncident} />);

    // Check for Material Design UI elements
    expect(screen.getByTestId("material_card")).toBeInTheDocument();
    expect(screen.getByTestId("metadata_bar")).toBeInTheDocument();

    // Material Design uses elevation and specific color schemes
    const materialCard = screen.getByTestId("material_card");
    expect(materialCard).toHaveClass("elevation-2");
  });

  it("displays incident details correctly in card sections", () => {
    render(<MaterialDetailsWindow incident={mockIncident} />);

    expect(screen.getByText("Facebook Data Breach")).toBeInTheDocument();
    expect(
      screen.getByText("Massive user data exposure affecting millions")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Security vulnerability in the View As feature")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Exposed personal data of 50M+ users")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Several months of investigation")
    ).toBeInTheDocument();
  });

  // TODO: I don't want this, need to change or delete this test.
  it("uses appropriate Material UI chip elements for category and severity", () => {
    render(<MaterialDetailsWindow incident={mockIncident} />);

    // Check chips are present
    const categoryChip = screen.getByTestId("category-chip");
    const severityChip = screen.getByTestId("severity-chip");

    expect(categoryChip).toHaveTextContent("Security");
    expect(severityChip).toHaveTextContent("High");

    // High severity should have appropriate color class
    // todo: this isnt in the component, need to figure it out
    // expect(severityChip).toHaveClass("chip-high");
  });

  // TODO:     // I don't want this, need to change or delete this test.
  it("expands and collapses detail sections when clicking expand buttons", () => {
    render(<MaterialDetailsWindow incident={mockIncident} />);

    expect(screen.getByTestId("description-content")).not.toHaveClass(
      "expanded"
    );

    // Click expand button
    const expandButton = screen.getByTestId("expand-description");
    fireEvent.click(expandButton);

    // Section should be expanded
    expect(screen.getByTestId("description-content")).toHaveClass("expanded");

    // Click again to collapse
    fireEvent.click(expandButton);

    // Section should be collapsed again
    expect(screen.getByTestId("description-content")).not.toHaveClass(
      "expanded"
    );
  });

  it("handles missing optional fields gracefully", () => {
    const incidentWithMissingFields = {
      id: "2",
      name: "Partial Incident",
      description: "Just a description",
      incident_date: "2015-01-30T00:00:00.000Z",
      category: "Network",
      severity: "Low",
    };

    render(<MaterialDetailsWindow incident={incidentWithMissingFields} />);

    // Required fields should be present
    expect(screen.getByText("Partial Incident")).toBeInTheDocument();
    expect(screen.getByText("Just a description")).toBeInTheDocument();

    // Optional sections should be hidden or show a placeholder
    expect(screen.queryByTestId("cause-section")).not.toBeInTheDocument();
    // Or if showing empty sections:
    // expect(screen.getByTestId("cause-section")).toHaveTextContent("No information available");
  });

  it("displays formatted date correctly", () => {
    render(<MaterialDetailsWindow incident={mockIncident} />);

    expect(formatDate).toHaveBeenCalledWith(mockIncident.incident_date);
    expect(screen.getByText("January 1, 2015")).toBeInTheDocument();
  });

  it("returns null when incident is null", () => {
    const { container } = render(<MaterialDetailsWindow incident={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
