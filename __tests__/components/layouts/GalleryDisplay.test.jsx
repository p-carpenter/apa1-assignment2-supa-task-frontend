import React from "react";
import { render, screen } from "@testing-library/react";
import GalleryDisplay from "@/app/gallery/GalleryDisplay";
import { useTheme } from "@/app/contexts/ThemeContext";

jest.mock("@/app/contexts/ThemeContext", () => ({
  useTheme: jest.fn(),
}));

jest.mock("@/app/components/ui/artifacts", () => ({
  ArtifactRenderer: jest.fn(({ artifact }) => (
    <div data-testid="artifact-renderer">
      <div data-testid="artifact-name">{artifact.name}</div>
      <div data-testid="artifact-description">{artifact.description}</div>
    </div>
  )),
}));

jest.mock("@/app/gallery/GalleryDisplaySkeleton", () => {
  return jest.fn(() => (
    <div data-testid="gallery-skeleton">Loading Skeleton</div>
  ));
});

jest.mock(
  "./GalleryDisplay.module.css",
  () => ({
    container: "container-class",
    window: "window-class",
    mainContent: "main-content-class",
    artifactSection: "artifact-section-class",
    artifactContainer: "artifact-container-class",
    artifactTransparent: "artifact-transparent-class",
    pedestal: "pedestal-class",
    pedestalImage: "pedestal-image-class",
    detailsSection: "details-section-class",
    detailsWindow: "details-window-class",
  }),
  { virtual: true }
);

const mockIncident = {
  id: "1",
  name: "Test Incident",
  description: "This is a test incident",
  category: "Security",
  severity: "High",
  incident_date: "2022-01-01",
};

describe("GalleryDisplay", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useTheme.mockReturnValue({
      theme: "default",
      IncidentDetailsWindows: ({ incident }) => (
        <div data-testid="incident-details">
          <h3 data-testid="incident-title">{incident.name}</h3>
          <p data-testid="incident-description">{incident.description}</p>
        </div>
      ),
    });
  });

  it("renders loading skeleton when isLoading is true", () => {
    render(<GalleryDisplay incident={mockIncident} isLoading={true} />);

    expect(screen.getByTestId("gallery-skeleton")).toBeInTheDocument();

    expect(screen.queryByTestId("artifact-renderer")).not.toBeInTheDocument();
    expect(screen.queryByTestId("incident-details")).not.toBeInTheDocument();
  });

  it("returns null when no incident is provided", () => {
    const { container } = render(
      <GalleryDisplay incident={null} isLoading={false} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders incident details correctly", () => {
    render(<GalleryDisplay incident={mockIncident} isLoading={false} />);

    expect(screen.getByTestId("artifact-renderer")).toBeInTheDocument();
    expect(screen.getByTestId("artifact-name").textContent).toBe(
      "Test Incident"
    );
    expect(screen.getByTestId("artifact-description").textContent).toBe(
      "This is a test incident"
    );

    expect(screen.getByTestId("incident-details")).toBeInTheDocument();
    expect(screen.getByTestId("incident-title").textContent).toBe(
      "Test Incident"
    );
    expect(screen.getByTestId("incident-description").textContent).toBe(
      "This is a test incident"
    );

    expect(screen.getByAltText("Pedestal")).toBeInTheDocument();
  });

  it("renders with different themes", () => {
    useTheme.mockReturnValue({
      theme: "windows98",
      IncidentDetailsWindows: ({ incident }) => (
        <div data-testid="win98-incident-details">
          <h3>{incident.name}</h3>
          <p>{incident.description}</p>
        </div>
      ),
    });

    render(<GalleryDisplay incident={mockIncident} isLoading={false} />);

    expect(screen.getByTestId("win98-incident-details")).toBeInTheDocument();
  });

  it("handles incidents with missing properties", () => {
    const incompleteIncident = {
      id: "2",
      name: "Incomplete Incident",
    };

    render(<GalleryDisplay incident={incompleteIncident} isLoading={false} />);

    expect(screen.getByTestId("artifact-renderer")).toBeInTheDocument();
    expect(screen.getByTestId("incident-details")).toBeInTheDocument();
    expect(screen.getByTestId("incident-title").textContent).toBe(
      "Incomplete Incident"
    );
  });
});
