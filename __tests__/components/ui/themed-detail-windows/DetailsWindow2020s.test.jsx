import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import DetailsWindow2020s from "@/app/components/ui/detail-windows/DetailsWindow2020s";
import { fireEvent } from "@testing-library/react";
import {
  CATEGORY_STYLES,
  SEVERITY_STYLES,
} from "@/app/utils/styling/getIncidentMetadataStyles";

jest.mock("@/app/utils/formatting/dateUtils", () => ({
  formatDateForDisplay: jest
    .fn()
    .mockImplementation((date) => "5 December 2022"),
}));

describe("DetailsWindow2020s", () => {
  const mockIncident = {
    id: "1",
    name: "Cryptocurrency Crash",
    description: "Major cryptocurrency value collapse",
    incident_date: "2022-05-12T00:00:00.000Z",
    category: "External Factors",
    severity: "High",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    cleanup();
  });

  it("renders with 2020s styling", () => {
    render(<DetailsWindow2020s incident={mockIncident} />);

    expect(screen.getByTestId("2020s-window")).toBeInTheDocument();
    expect(screen.getByTestId("2020s-window")).toHaveClass("darkMode");
  });

  it("displays incident details correctly", () => {
    render(<DetailsWindow2020s incident={mockIncident} />);

    expect(screen.getByText("Cryptocurrency Crash")).toBeInTheDocument();
    expect(
      screen.getByText("Major cryptocurrency value collapse")
    ).toBeInTheDocument();
    expect(screen.getByText("External Factors")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("displays formatted date correctly", () => {
    render(<DetailsWindow2020s incident={mockIncident} />);

    expect(screen.getByText("12 May 2022")).toBeInTheDocument();
  });

  it("returns null when incident is null", () => {
    const { container } = render(<DetailsWindow2020s incident={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("toggles light mode when the button is clicked", () => {
    render(<DetailsWindow2020s incident={mockIncident} />);
    const darkModeButton = screen.getByLabelText(/Switch to light mode/i);

    fireEvent.click(darkModeButton);

    expect(screen.getByTestId("2020s-window")).not.toHaveClass("darkMode");
    expect(screen.getByTestId("2020s-window")).toHaveStyle({
      background: expect.stringMatching("rgba(255, 255, 255, 0.7)"),
    });

    fireEvent.click(darkModeButton);
    expect(screen.getByTestId("2020s-window")).toHaveClass("darkMode");
    expect(screen.getByTestId("2020s-window")).toHaveStyle({
      background: expect.stringMatching("rgba(24, 24, 27, 0.7)"),
    });
  });

  it("applies correct colour theme according to user system preference", () => {
    const darkMediaQueryList = {
      matches: true,
      media: "(prefers-color-scheme: dark)",
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    window.matchMedia = jest.fn().mockReturnValue(darkMediaQueryList);

    const { unmount } = render(<DetailsWindow2020s incident={mockIncident} />);

    expect(screen.getByTestId("2020s-window")).toHaveClass("darkMode");
    expect(window.matchMedia).toHaveBeenCalledWith(
      "(prefers-color-scheme: dark)"
    );

    unmount();

    const lightMediaQueryList = {
      matches: false,
      media: "(prefers-color-scheme: dark)",
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    window.matchMedia = jest.fn().mockReturnValue(lightMediaQueryList);

    render(<DetailsWindow2020s incident={mockIncident} />);

    expect(screen.getByTestId("2020s-window")).toHaveClass("darkMode");
    expect(window.matchMedia).toHaveBeenCalledWith(
      "(prefers-color-scheme: dark)"
    );
  });

  it("applies the correct styles for different severities in light mode", () => {
    const severities = ["Critical", "High", "Moderate", "Low", "Unknown"];

    severities.forEach((severity) => {
      const severityKey = severity.toLowerCase();

      const expectedBackgroundColor = (
        SEVERITY_STYLES[severityKey] || SEVERITY_STYLES.unknown
      ).light.backgroundColor;

      const { unmount } = render(
        <DetailsWindow2020s incident={{ ...mockIncident, severity }} />
      );

      const toggleButton = screen.getByRole("button", {
        name: /Switch to light mode/i,
      });
      fireEvent.click(toggleButton);

      const severityIndicator = screen
        .getByTestId("severity-indicator")
        .closest("div");

      expect(severityIndicator).toHaveStyle(
        `background-color: ${expectedBackgroundColor}`
      );

      unmount();
    });
  });

  it("applies the correct styles for different severities in dark mode", () => {
    const severities = ["Critical", "High", "Moderate", "Low", "Unknown"];

    const darkMediaQueryList = {
      matches: true,
      media: "(prefers-color-scheme: dark)",
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    window.matchMedia = jest.fn().mockReturnValue(darkMediaQueryList);

    severities.forEach((severity) => {
      const severityKey = severity.toLowerCase();

      const expectedBackgroundColor = (
        SEVERITY_STYLES[severityKey] || SEVERITY_STYLES.unknown
      ).dark.backgroundColor;

      const { unmount } = render(
        <DetailsWindow2020s incident={{ ...mockIncident, severity }} />
      );

      const severityIndicator = screen
        .getByTestId("severity-indicator")
        .closest("div");

      expect(severityIndicator).toHaveStyle(
        `background-color: ${expectedBackgroundColor}`
      );

      unmount();
    });
  });

  it("applies the correct styles for different categories in light mode", () => {
    const categories = [
      "Security",
      "Hardware",
      "Software",
      "Infrastructure",
      "External Factors",
      "Human Error",
      "Unknown",
    ];

    categories.forEach((category) => {
      const categoryKey = category.toLowerCase().replace(/\s+/g, "");

      const expectedBackgroundColor = (
        CATEGORY_STYLES[categoryKey] || CATEGORY_STYLES.unknown
      ).light.backgroundColor;

      const { unmount } = render(
        <DetailsWindow2020s incident={{ ...mockIncident, category }} />
      );

      const toggleButton = screen.getByRole("button", {
        name: /Switch to light mode/i,
      });
      fireEvent.click(toggleButton);

      const categoryPill = screen.getByText(category).closest("div");

      expect(categoryPill).toHaveStyle(
        `background-color: ${expectedBackgroundColor}`
      );

      unmount();
    });
  });

  it("applies the correct styles for different categories in dark mode", () => {
    const categories = [
      "Security",
      "Hardware",
      "Software",
      "Infrastructure",
      "External Factors",
      "Human Error",
      "Unknown",
    ];

    const darkMediaQueryList = {
      matches: true,
      media: "(prefers-color-scheme: dark)",
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    window.matchMedia = jest.fn().mockReturnValue(darkMediaQueryList);

    categories.forEach((category) => {
      const categoryKey = category.toLowerCase().replace(/\s+/g, "");

      const expectedBackgroundColor = (
        CATEGORY_STYLES[categoryKey] || CATEGORY_STYLES.unknown
      ).dark.backgroundColor;

      const { unmount } = render(
        <DetailsWindow2020s incident={{ ...mockIncident, category }} />
      );

      const categoryPill = screen.getByText(category).closest("div");

      expect(categoryPill).toHaveStyle(
        `background-color: ${expectedBackgroundColor}`
      );

      unmount();
    });
  });

  it("handles missing category and severity", () => {
    const partialIncident = {
      id: "1",
      name: "Test Incident",
      incident_date: "1988-01-15T00:00:00.000Z",
      description: "Test description text",
      // missing category and severity
    };

    render(<DetailsWindow2020s incident={partialIncident} />);
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

    render(<DetailsWindow2020s incident={incidentWithoutDescription} />);
    expect(screen.getByText(/no description available/i)).toBeInTheDocument();
  });

  it("handles missing date", () => {
    const incidentWithoutDate = {
      name: "Test Incident",
      category: "Hardware",
      severity: "Critical",
      description: "Test description text",
    };

    render(<DetailsWindow2020s incident={incidentWithoutDate} />);
    expect(screen.getByTestId("incident-date")).toHaveTextContent("");
  });

  it("handles missing name", () => {
    const incidentWithoutName = {
      incident_date: "1988-01-15T00:00:00.000Z",
      category: "Hardware",
      severity: "Critical",
      description: "Test description text",
    };

    render(<DetailsWindow2020s incident={incidentWithoutName} />);
    expect(screen.getByText("Unknown Incident")).toBeInTheDocument();
  });
});
