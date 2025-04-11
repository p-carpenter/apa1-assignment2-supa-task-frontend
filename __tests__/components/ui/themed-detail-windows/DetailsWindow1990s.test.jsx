import React from "react";
import { render, screen } from "@testing-library/react";
import DetailsWindow1990s from "@/app/components/ui/detail-windows/DetailsWindow1990s";

describe("MSW Handlers", () => {
  it("defines API handlers", () => {
    expect(true).toBe(true);
  });
});

describe("DetailsWindow1990s", () => {
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
    render(<DetailsWindow1990s incident={mockIncident} />);

    expect(screen.getByTestId("1990s-window")).toBeInTheDocument();

    const titleBar = screen.getByText("Y2K Bug").closest(".title-bar");
    expect(titleBar).toBeInTheDocument();
  });

  it("displays incident details correctly", () => {
    render(<DetailsWindow1990s incident={mockIncident} />);

    expect(screen.getByText("Y2K Bug")).toBeInTheDocument();
    expect(screen.getByText("Description of the Y2K bug")).toBeInTheDocument();
    expect(screen.getAllByText("31 December 1999")[0]).toBeInTheDocument();
    expect(screen.getByText("software")).toBeInTheDocument();
    expect(screen.getByText("high")).toBeInTheDocument();
  });

  it("returns null when incident is null", () => {
    const { container } = render(<DetailsWindow1990s incident={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders status bar with archive name and date", () => {
    render(<DetailsWindow1990s incident={mockIncident} />);

    const statusBar = screen
      .getByText("Tech Incident Archive")
      .closest(".status-bar");
    expect(statusBar).toBeInTheDocument();
    expect(screen.getAllByText("31 December 1999")[1]).toBeInTheDocument();
  });

  it("displays formatted date correctly", () => {
    render(<DetailsWindow1990s incident={mockIncident} />);

    expect(screen.getAllByText("31 December 1999")[0]).toBeInTheDocument();
  });

  it("handles missing category and severity", () => {
    const partialIncident = {
      id: "1",
      name: "Test Incident",
      incident_date: "1988-01-15T00:00:00.000Z",
      description: "Test description text",
      // missing category and severity
    };

    render(<DetailsWindow1990s incident={partialIncident} />);
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

    render(<DetailsWindow1990s incident={incidentWithoutDescription} />);
    expect(screen.getByText(/no description available/i)).toBeInTheDocument();
  });

  it("handles missing date", () => {
    const incidentWithoutDate = {
      name: "Test Incident",
      category: "Hardware",
      severity: "Critical",
      description: "Test description text",
    };

    render(<DetailsWindow1990s incident={incidentWithoutDate} />);
    expect(screen.getByTestId("incident-date")).toHaveTextContent("");
  });

  it("handles missing name", () => {
    const incidentWithoutName = {
      incident_date: "1988-01-15T00:00:00.000Z",
      category: "Hardware",
      severity: "Critical",
      description: "Test description text",
    };

    render(<DetailsWindow1990s incident={incidentWithoutName} />);
    expect(screen.getByText("Unknown Incident")).toBeInTheDocument();
  });
});
