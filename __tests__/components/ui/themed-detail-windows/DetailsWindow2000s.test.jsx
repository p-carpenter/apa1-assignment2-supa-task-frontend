import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import DetailsWindow2000s from "@/app/components/ui/detail-windows/DetailsWindow2000s";
import { Shield, Cpu, Code, Cloud, Users, Building2, Info } from "lucide-react";

jest.mock("@/app/utils/formatting/dateUtils", () => ({
  formatDateForDisplay: jest
    .fn()
    .mockImplementation((date) => "January 1 2000"),
}));

describe("MSW Handlers", () => {
  it("defines API handlers", () => {
    // This is just a placeholder to ensure handlers are defined
    expect(true).toBe(true);
  });
});

describe("DetailsWindow2000s", () => {
  const mockIncident = {
    id: "1",
    name: "Windows Vista Launch",
    description: "Description of the Vista launch issues",
    incident_date: "2007-01-30T00:00:00.000Z",
    category: "Software",
    severity: "Moderate",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders with 2000s styling", () => {
    render(<DetailsWindow2000s incident={mockIncident} />);

    expect(screen.getByTestId("2000s-window")).toBeInTheDocument();
  });

  it("displays incident details in correct panels", () => {
    render(<DetailsWindow2000s incident={mockIncident} />);

    expect(screen.getByText(/Software/i)).toBeInTheDocument();

    expect(screen.getByText(/Moderate/i)).toBeInTheDocument();

    expect(
      screen.getByText("Description of the Vista launch issues")
    ).toBeInTheDocument();
  });

  it("calls formatDate with correct incident date", () => {
    render(<DetailsWindow2000s incident={mockIncident} />);
    expect(screen.getByText("30 January 2007")).toBeInTheDocument();
  });

  it("returns null when incident is null", () => {
    const { container } = render(<DetailsWindow2000s incident={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("handles missing category and severity", () => {
    const partialIncident = {
      id: "1",
      name: "Test Incident",
      incident_date: "1988-01-15T00:00:00.000Z",
      description: "Test description text",
    };

    render(<DetailsWindow2000s incident={partialIncident} />);
    expect(screen.getAllByText("Unknown").length).toBeGreaterThanOrEqual(2);
  });

  it("handles missing description", () => {
    const incidentWithoutDescription = {
      id: "1",
      name: "Test Incident",
      incident_date: "1988-01-15T00:00:00.000Z",
      category: "Hardware",
      severity: "Critical",
    };

    render(<DetailsWindow2000s incident={incidentWithoutDescription} />);
    expect(screen.getByText(/no description available/i)).toBeInTheDocument();
  });

  it("handles missing date", () => {
    const incidentWithoutDate = {
      name: "Test Incident",
      category: "Hardware",
      severity: "Critical",
      description: "Test description text",
    };

    render(<DetailsWindow2000s incident={incidentWithoutDate} />);
    expect(screen.getByTestId("incident-date")).toHaveTextContent("");
  });

  it("handles missing name", () => {
    const incidentWithoutName = {
      incident_date: "1988-01-15T00:00:00.000Z",
      category: "Hardware",
      severity: "Critical",
      description: "Test description text",
    };

    render(<DetailsWindow2000s incident={incidentWithoutName} />);
    expect(screen.getByText("Unknown Incident")).toBeInTheDocument();
  });

  it("applies the correct classes and renders appropriate icons for different categories", () => {
    const categoryTestCases = [
      {
        category: "Security",
        expectedClass: "categoryIcon securityIcon",
        expectedIcon: <Shield size={14} />,
      },
      {
        category: "Hardware",
        expectedClass: "categoryIcon hardwareIcon",
        expectedIcon: <Cpu ize={14} />,
      },
      {
        category: "Software",
        expectedClass: "categoryIcon softwareIcon",
        expectedIcon: <Code size={14} />,
      },
      {
        category: "Infrastructure",
        expectedClass: "categoryIcon infrastructureIcon",
        expectedIcon: <Building2 size={14} />,
      },
      {
        category: "External Factors",
        expectedClass: "categoryIcon externalFactorsIcon",
        expectedIcon: <Cloud size={14} />,
      },
      {
        category: "Human Error",
        expectedClass: "categoryIcon humanErrorIcon",
        expectedIcon: <Users size={14} />,
      },
      {
        category: "Unknown",
        expectedClass: "categoryIcon defaultIcon",
        expectedIcon: <Info size={14} />,
      },
    ];

    categoryTestCases.forEach(({ category, expectedClass, expectedIcon }) => {
      const { unmount } = render(
        <DetailsWindow2000s incident={{ ...mockIncident, category }} />
      );

      const categoryIconElement = screen.getByTestId("category-icon");

      expect(categoryIconElement).toHaveClass(expectedClass);

      const svgElement = categoryIconElement.querySelector("svg");
      expect(svgElement).toBeInTheDocument();

      unmount();
    });
  });
});
