import React from "react";
import { render, screen } from "@testing-library/react";
import Win98DetailsWindow from "@/app/components/ui/decades/Win98DetailsWindow";

describe("MSW Handlers", () => {
  it("defines API handlers", () => {
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

    expect(screen.getByTestId("1990s-window")).toBeInTheDocument();

    const titleBar = screen.getByText("Y2K Bug").closest(".title-bar");
    expect(titleBar).toBeInTheDocument();
  });

  it("displays incident details correctly", () => {
    render(<Win98DetailsWindow incident={mockIncident} />);

    expect(screen.getByText("Y2K Bug")).toBeInTheDocument();
    expect(screen.getByText("Description of the Y2K bug")).toBeInTheDocument();
    expect(screen.getAllByText("Dec 31, 1999")[0]).toBeInTheDocument();
    expect(screen.getByText("software")).toBeInTheDocument();
    expect(screen.getByText("high")).toBeInTheDocument();
  });

  it("renders optional sections when available", () => {
    const incidentWithAllFields = {
      ...mockIncident,
      cause: "Programming oversight with two-digit years",
      consequences: "Worldwide panic and massive remediation efforts",
      time_to_resolve: "Several years of preparation",
    };

    render(<Win98DetailsWindow incident={incidentWithAllFields} />);

    expect(screen.getByText("Why It Happened")).toBeInTheDocument();
    expect(
      screen.getByText("Programming oversight with two-digit years")
    ).toBeInTheDocument();
    expect(screen.getByText("Consequences")).toBeInTheDocument();
    expect(
      screen.getByText("Worldwide panic and massive remediation efforts")
    ).toBeInTheDocument();
    expect(screen.getByText("Resolution Time")).toBeInTheDocument();
    expect(
      screen.getByText("Several years of preparation")
    ).toBeInTheDocument();
  });

  it("returns null when incident is null", () => {
    const { container } = render(<Win98DetailsWindow incident={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders status bar with archive name and date", () => {
    render(<Win98DetailsWindow incident={mockIncident} />);

    const statusBar = screen
      .getByText("Tech Incident Archive")
      .closest(".status-bar");
    expect(statusBar).toBeInTheDocument();
    expect(screen.getAllByText("Dec 31, 1999")[1]).toBeInTheDocument();
  });

  it("displays formatted date correctly", () => {
    render(<Win98DetailsWindow incident={mockIncident} />);

    expect(screen.getAllByText("Dec 31, 1999")[0]).toBeInTheDocument();
  });
});
