import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import DetailsWindow1980s from "@/app/components/ui/detail-windows/DetailsWindow1980s";
import styles from "@/app/components/ui/detail-windows/DetailsWindow1980s.module.css";

describe("DetailsWindow1980s", () => {
  const mockIncident = {
    id: "1",
    name: "Test Incident",
    incident_date: "1988-01-15 00:00:00+00",
    category: "Hardware",
    severity: "Critical",
    description: "Test description text",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    cleanup();
  });

  it("renders the window with incident details", () => {
    render(<DetailsWindow1980s incident={mockIncident} />);

    // Check title bar
    expect(screen.getByText("Test Incident")).toBeInTheDocument();
    expect(screen.getByText("Test description text")).toBeInTheDocument();

    // Check metadata fields
    expect(screen.getByText("Hardware")).toBeInTheDocument();
    expect(screen.getByText("Critical")).toBeInTheDocument();
    expect(screen.getByText("15 January 1988")).toBeInTheDocument();
  });

  it("displays formatted date correctly", () => {
    render(<DetailsWindow1980s incident={mockIncident} />);
    expect(screen.getByText("15 January 1988")).toBeInTheDocument();
  });

  it("returns null when no incident is provided", () => {
    const { container } = render(<DetailsWindow1980s incident={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("handles missing category and severity", () => {
    const partialIncident = {
      id: "1",
      name: "Test Incident",
      incident_date: "1988-01-15 00:00:00+00",
      description: "Test description text",
    };

    render(<DetailsWindow1980s incident={partialIncident} />);
    expect(screen.getAllByText("Unknown").length).toBeGreaterThanOrEqual(2);
  });

  it("handles missing description", () => {
    const incidentWithoutDescription = {
      id: "1",
      name: "Test Incident",
      incident_date: "1988-01-15 00:00:00+00",
      category: "Hardware",
      severity: "Critical",
    };

    render(<DetailsWindow1980s incident={incidentWithoutDescription} />);
    expect(screen.getByText(/no description available/i)).toBeInTheDocument();
  });

  it("handles missing date", () => {
    const incidentWithoutDate = {
      name: "Test Incident",
      category: "Hardware",
      severity: "Critical",
      description: "Test description text",
    };

    render(<DetailsWindow1980s incident={incidentWithoutDate} />);
    expect(screen.getByTestId("incident-date")).toHaveTextContent("");
  });

  it("handles missing name", () => {
    const incidentWithoutName = {
      incident_date: "1988-01-15 00:00:00+00",
      category: "Hardware",
      severity: "Critical",
      description: "Test description text",
    };

    render(<DetailsWindow1980s incident={incidentWithoutName} />);
    expect(screen.getByText("Unknown Incident")).toBeInTheDocument();
  });

  it("applies the correct CSS classes for styling", () => {
    const { container } = render(
      <DetailsWindow1980s incident={mockIncident} />
    );

    // Check main container classes
    expect(container.querySelector(".apple-macintosh")).toBeInTheDocument();
    expect(container.querySelector(".window")).toBeInTheDocument();

    // Check title bar
    expect(container.querySelector(".title-bar")).toBeInTheDocument();
    expect(container.querySelector(".title")).toBeInTheDocument();

    // Check content area classes
    expect(container.querySelector(".standard-dialog")).toBeInTheDocument();
    expect(
      container.querySelector(`.${styles.window_pane}`)
    ).toBeInTheDocument();
    expect(
      container.querySelector(`.${styles.sectionContainer}`)
    ).toBeInTheDocument();
  });

  it("handles invalid date formats gracefully", () => {
    const badDateIncident = {
      ...mockIncident,
      incident_date: "invalid-date-format",
    };

    render(<DetailsWindow1980s incident={badDateIncident} />);

    expect(screen.getByTestId("incident-date")).toHaveTextContent("");
  });
});
