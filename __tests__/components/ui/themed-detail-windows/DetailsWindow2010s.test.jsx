import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import DetailsWindow2010s from "@/app/components/ui/detail-windows/DetailsWindow2010s";
import styles from "@/app/components/ui/detail-windows/DetailsWindow2010s.module.css";
import { SEVERITY_STYLES } from "@/app/utils/styling/getIncidentMetadataStyles";

describe("DetailsWindow2010s", () => {
  const mockIncident = {
    id: "1",
    name: "Facebook Data Breach",
    description: "Massive user data exposure affecting millions",
    incident_date: "2018-09-28T00:00:00.000Z",
    category: "Security",
    severity: "High",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders with Material Design styling", () => {
    render(<DetailsWindow2010s incident={mockIncident} />);
    expect(screen.getByTestId("2010s-window")).toBeInTheDocument();
  });

  it("displays incident details correctly", () => {
    render(<DetailsWindow2010s incident={mockIncident} />);

    expect(screen.getByText("Facebook Data Breach")).toBeInTheDocument();
    expect(
      screen.getByText("Massive user data exposure affecting millions")
    ).toBeInTheDocument();
    expect(screen.getByText("Security")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("handles missing category and severity", () => {
    const partialIncident = {
      id: "1",
      name: "Test Incident",
      incident_date: "1988-01-15T00:00:00.000Z",
      description: "Test description text",
      // missing category and severity
    };

    render(<DetailsWindow2010s incident={partialIncident} />);
    // Check that "Unknown" is displayed for missing fields
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

    render(<DetailsWindow2010s incident={incidentWithoutDescription} />);
    expect(screen.getByText(/no description available/i)).toBeInTheDocument();
  });

  it("handles missing date", () => {
    const incidentWithoutDate = {
      name: "Test Incident",
      category: "Hardware",
      severity: "Critical",
      description: "Test description text",
    };

    render(<DetailsWindow2010s incident={incidentWithoutDate} />);
    expect(screen.getByTestId("incident-date")).toHaveTextContent("");
  });

  it("handles missing name", () => {
    const incidentWithoutName = {
      incident_date: "1988-01-15T00:00:00.000Z",
      category: "Hardware",
      severity: "Critical",
      description: "Test description text",
    };

    render(<DetailsWindow2010s incident={incidentWithoutName} />);
    expect(screen.getByText("Unknown Incident")).toBeInTheDocument();
  });

  it("displays formatted date correctly", () => {
    render(<DetailsWindow2010s incident={mockIncident} />);

    expect(screen.getByText("28 September 2018")).toBeInTheDocument();
  });

  it("returns null when incident is null", () => {
    const { container } = render(<DetailsWindow2010s incident={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("applies the correct styles for different severities", () => {
    const severities = ["Critical", "High", "Moderate", "Low"];

    severities.forEach((severity) => {
      const expectedSeverityStyle =
        SEVERITY_STYLES[severity.toLowerCase()]?.light ||
        SEVERITY_STYLES.unknown.light;
      const testIncident = { ...mockIncident, severity };

      const { unmount } = render(
        <DetailsWindow2010s incident={testIncident} />
      );

      const headerArea = screen
        .getByTestId("2010s-window")
        .querySelector(`.${styles.headerArea}`);
      expect(headerArea).toHaveStyle(expectedSeverityStyle);

      unmount();
    });
  });

  it("displays different categories correctly", () => {
    const categories = [
      "Security",
      "Hardware",
      "Software",
      "Infrastructure",
      "External Factors",
      "Human Error",
    ];

    categories.forEach((category) => {
      const { unmount } = render(
        <DetailsWindow2010s incident={{ ...mockIncident, category }} />
      );

      const categoryTag = screen.getByTestId("category-tag");
      expect(categoryTag).toHaveTextContent(category);

      unmount();
    });
  });

  it("displays different severities correctly", () => {
    const severities = ["Critical", "High", "Moderate", "Low"];

    severities.forEach((severity) => {
      const { unmount } = render(
        <DetailsWindow2010s incident={{ ...mockIncident, severity }} />
      );

      const severityTag = screen.getByTestId("severity-tag");
      expect(severityTag).toHaveTextContent(severity);

      unmount();
    });
  });
});
