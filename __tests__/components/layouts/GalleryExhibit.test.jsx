import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import GalleryExhibit from "@/app/components/layouts/GalleryExhibit";
import { ThemeProvider } from "@/app/contexts/ThemeContext";
import { IncidentProvider } from "@/app/contexts/IncidentContext";

// Mock the theme context to provide the necessary functions and components
jest.mock("@/app/contexts/ThemeContext", () => {
  const originalModule = jest.requireActual("@/app/contexts/ThemeContext");

  // Mock component for Details Window
  const MockDetailsWindow = ({ incident }) => (
    <div data-testid="mock-details-window">
      <h2>{incident.name}</h2>
      <p>{incident.description}</p>
    </div>
  );

  return {
    ...originalModule,
    useTheme: jest.fn(() => ({
      getPaddingSizeForArtifact: () => "medium",
      IncidentDetailsWindows: MockDetailsWindow,
    })),
    ThemeProvider: ({ children }) => (
      <div data-testid="theme-provider">{children}</div>
    ),
  };
});

// Mock ArtifactRenderer component
jest.mock("@/app/components/ui/artifacts/ArtifactRenderer", () => {
  return function MockArtifactRenderer({ artifact, className, paddingSize }) {
    return (
      <div data-testid="mock-artifact-renderer" className={className}>
        <div>Artifact Type: {artifact?.artifactType || "none"}</div>
        <div>Padding Size: {paddingSize}</div>
        {!artifact?.artifactType && <div>No artifact available</div>}
        {artifact?.artifactType === "image" && (
          <img
            src={artifact.artifactContent}
            alt="Artifact"
            width={artifact.width || 300}
            height={artifact.height || 200}
          />
        )}
        {artifact?.artifactType === "code" && (
          <iframe
            title="Code Artifact"
            srcDoc={artifact.artifactContent}
            width="500"
            height="300"
          />
        )}
      </div>
    );
  };
});

// Mock console.log to avoid cluttering tests
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});
afterAll(() => {
  console.log = originalConsoleLog;
});

// Store original getBoundingClientRect for cleanup
const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

describe("GalleryExhibit", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 500,
      height: 400,
      top: 0,
      left: 0,
      bottom: 400,
      right: 500,
    }));
  });

  afterEach(() => {
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  // Define test cases
  const testCases = [
    {
      name: "with image artifact",
      incident: {
        id: "1",
        name: "Test Incident",
        description: "Test description",
        incident_date: "2000-01-01",
        category: "Software",
        severity: "High",
        artifactType: "image",
        artifactContent: "/test-image.jpg",
        width: 800,
        height: 600,
      },
    },
    {
      name: "with code artifact",
      incident: {
        id: "2",
        name: "Code Incident",
        description: "Code description",
        incident_date: "2010-05-15",
        category: "Security",
        severity: "Medium",
        artifactType: "code",
        artifactContent: "<html><body>Test code</body></html>",
      },
    },
    {
      name: "without artifact",
      incident: {
        id: "3",
        name: "No Artifact Incident",
        description: "No artifact description",
        incident_date: "2020-12-31",
        category: "Hardware",
        severity: "Low",
      },
    },
  ];

  testCases.forEach(({ name, incident }) => {
    it(`renders correctly ${name}`, () => {
      render(
        <IncidentProvider>
          <GalleryExhibit incident={incident} />
        </IncidentProvider>
      );

      // Check main structure
      expect(screen.getByTestId("mock-artifact-renderer")).toBeInTheDocument();
      expect(screen.getByTestId("mock-details-window")).toBeInTheDocument();

      // Check incident details are passed correctly
      expect(screen.getByText(incident.name)).toBeInTheDocument();
      expect(screen.getByText(incident.description)).toBeInTheDocument();

      // Check if artifact info is passed
      if (incident.artifactType) {
        expect(
          screen.getByText(`Artifact Type: ${incident.artifactType}`)
        ).toBeInTheDocument();
      } else {
        expect(screen.getByText("Artifact Type: none")).toBeInTheDocument();
      }

      // Check pedestal image
      expect(screen.getByAltText("Pedestal")).toBeInTheDocument();

      // Check background image
      expect(screen.getByAltText("Background")).toBeInTheDocument();
    });
  });

  it("returns null when incident is null", () => {
    const { container } = render(
      <IncidentProvider>
        <GalleryExhibit incident={null} />
      </IncidentProvider>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("passes correct paddingSize to ArtifactRenderer", () => {
    const incident = {
      id: "1",
      name: "Test Incident",
      artifactType: "image",
      artifactContent: "/test-image.jpg",
    };

    render(
      <IncidentProvider>
        <GalleryExhibit incident={incident} />
      </IncidentProvider>
    );

    // Check padding size is passed from theme provider
    expect(screen.getByText("Padding Size: medium")).toBeInTheDocument();
  });
});
