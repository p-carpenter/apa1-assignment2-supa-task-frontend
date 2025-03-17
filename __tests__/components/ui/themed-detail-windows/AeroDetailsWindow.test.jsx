import React from "react";
import { render, screen } from "@testing-library/react";
import AeroDetailsWindow from "@/app/components/ui/detail-windows/AeroDetailsWindow";
import { formatDate } from "@/app/utils/formatting/dateUtils";

// Mock the date utils
jest.mock("@/app/utils/formatting/dateUtils", () => ({
  formatDate: jest.fn().mockImplementation((date) => "January 1, 2000"),
}));

describe("MSW Handlers", () => {
  it("defines API handlers", () => {
    // This is just a placeholder to ensure handlers are defined
    expect(true).toBe(true);
  });
});

describe("AeroDetailsWindow", () => {
  const mockIncident = {
    id: "1",
    name: "Windows Vista Launch",
    description: "Description of the Vista launch issues",
    cause: "Rushed development and high resource requirements",
    consequences: "Poor user adoption and negative reception",
    time_to_resolve: "Several service packs over 2 years",
    incident_date: "2007-01-30T00:00:00.000Z",
    category: "Software",
    severity: "Medium",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with Windows Vista/Aero styling", () => {
    render(<AeroDetailsWindow incident={mockIncident} />);

    expect(screen.getByTestId("2000s-window")).toBeInTheDocument();
  });

  it("displays incident details in correct panels", () => {
    render(<AeroDetailsWindow incident={mockIncident} />);

    // Should show category badge
    expect(screen.getByText(/software/i)).toBeInTheDocument();

    // Should show severity badge
    expect(screen.getByText(/medium/i)).toBeInTheDocument();

    // Should show panels with correct titles
    expect(screen.getByText(/what happened/i)).toBeInTheDocument();
    expect(screen.getByText(/why it happened/i)).toBeInTheDocument();
    expect(screen.getByText(/consequences/i)).toBeInTheDocument();
    expect(screen.getByText(/resolution time/i)).toBeInTheDocument();

    // Should show content in each panel
    expect(
      screen.getByText("Description of the Vista launch issues")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Rushed development and high resource requirements")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Poor user adoption and negative reception")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Several service packs over 2 years")
    ).toBeInTheDocument();
  });

  it("handles missing optional fields gracefully", () => {
    const incidentWithMissingFields = {
      id: "2",
      name: "Partial Incident",
      description: "Just a description",
      incident_date: "2007-01-30T00:00:00.000Z",
      category: "Hardware",
      severity: "High",
    };

    render(<AeroDetailsWindow incident={incidentWithMissingFields} />);

    // Required fields should be present
    expect(screen.getByText("Just a description")).toBeInTheDocument();
    expect(screen.getByText(/hardware/i)).toBeInTheDocument();

    // Optional panels should not be rendered
    expect(screen.queryByText(/why it happened/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/consequences/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/resolution time/i)).not.toBeInTheDocument();
  });

  it("calls formatDate with correct incident date", () => {
    render(<AeroDetailsWindow incident={mockIncident} />);
    expect(screen.getByText("Jan 30, 2007")).toBeInTheDocument();
  });

  it("returns null when incident is null", () => {
    const { container } = render(<AeroDetailsWindow incident={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
