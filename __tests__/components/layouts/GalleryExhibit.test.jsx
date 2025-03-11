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

    // Mock element dimensions - MOVED OUTSIDE OF HOOKS
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 500,
      height: 400,
      top: 0,
      left: 0,
      bottom: 400,
      right: 500,
    }));
  });

  // Clean up after tests - MOVED OUTSIDE OF NESTED FUNCTION
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

  it("adjusts artifact section size for small images", async () => {
    // Mock a small image
    const smallImageIncident = {
      id: "4",
      name: "Small Image",
      description: "Small image test",
      artifactType: "image",
      artifactContent: "/small-image.jpg",
      width: 200,
      height: 150,
    };

    // Store original Image
    const originalImage = window.Image;
    
    // Mock the complete and naturalWidth/Height properties
    window.Image = class MockImage {
      constructor() {
        setTimeout(() => {
          this.onload && this.onload();
        }, 50);
        this.complete = true;
        this.naturalWidth = 200;
        this.naturalHeight = 150;
      }
    };

    render(
      <IncidentProvider>
        <GalleryExhibit incident={smallImageIncident} />
      </IncidentProvider>
    );

    // Wait for useEffect to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Check if artifact section has small class
    const artifactSection = document.querySelector(".artifact_small");
    expect(artifactSection).toBeInTheDocument();

    // Restore original Image
    window.Image = originalImage;
  });

  it("adjusts artifact section size for tiny images", async () => {
    // Mock a tiny image
    const tinyImageIncident = {
      id: "5",
      name: "Tiny Image",
      description: "Tiny image test",
      artifactType: "image",
      artifactContent: "/tiny-image.jpg",
      width: 100,
      height: 75,
    };

    // Store original Image
    const originalImage = window.Image;
    
    // Mock the complete and naturalWidth/Height properties
    window.Image = class MockImage {
      constructor() {
        setTimeout(() => {
          this.onload && this.onload();
        }, 50);
        this.complete = true;
        this.naturalWidth = 100;
        this.naturalHeight = 75;
      }
    };

    render(
      <IncidentProvider>
        <GalleryExhibit incident={tinyImageIncident} />
      </IncidentProvider>
    );

    // Wait for useEffect to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Check if artifact section has tiny class
    const artifactSection = document.querySelector(".artifact_tiny");
    expect(artifactSection).toBeInTheDocument();

    // Restore original Image - MOVED THIS INSIDE THE TEST
    window.Image = originalImage;
  });

  it("adjusts artifact section size for code artifacts", async () => {
    // Mock a small code artifact
    const smallCodeIncident = {
      id: "6",
      name: "Small Code",
      description: "Small code test",
      artifactType: "code",
      artifactContent: "<html><body>Small code</body></html>",
    };

    // Mock iframe properties
    const iframe = document.createElement("iframe");
    Object.defineProperty(iframe, "contentDocument", {
      value: {
        body: {
          scrollHeight: 150,
          scrollWidth: 250,
          offsetHeight: 150,
          offsetWidth: 250,
          clientHeight: 150,
          clientWidth: 250,
          addEventListener: jest.fn(),
        },
      },
      configurable: true,
    });

    // Store original querySelector
    const originalQuerySelector = Element.prototype.querySelector;
    
    // Mock querySelector to return our mock iframe
    Element.prototype.querySelector = jest.fn(() => iframe);

    render(
      <IncidentProvider>
        <GalleryExhibit incident={smallCodeIncident} />
      </IncidentProvider>
    );

    // Trigger iframe onload handler
    act(() => {
      const iframeElement = document.createElement("iframe");
      iframeElement.contentDocument = iframe.contentDocument;
      iframeElement.contentWindow = { document: iframe.contentDocument };
      const mockOnload = { current: null };
      Object.defineProperty(iframeElement, "onload", {
        get: () => mockOnload.current,
        set: (fn) => {
          mockOnload.current = fn;
        },
      });
      document.body.appendChild(iframeElement);
      if (mockOnload.current) mockOnload.current();
    });

    // Wait for timeouts in useEffect
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    // Check debug info was updated with iframe dimensions
    expect(console.log).toHaveBeenCalledWith(
      "Artifact dimensions:",
      expect.objectContaining({
        iframeWidth: expect.any(Number),
        iframeHeight: expect.any(Number),
      })
    );

    // Restore original querySelector
    Element.prototype.querySelector = originalQuerySelector;
  });

  it("handles load errors gracefully in checkImageSize", async () => {
    const incident = {
      id: "7",
      name: "Error Handling Test",
      description: "Testing error handling",
      artifactType: "image",
      artifactContent: "/broken-image.jpg",
    };

    // Store original Image
    const originalImage = window.Image;
    
    // Mock an image that fails to load
    window.Image = class MockImage {
      constructor() {
        setTimeout(() => {
          this.onerror && this.onerror(new Error("Failed to load image"));
        }, 50);
        this.complete = false;
      }
    };

    render(
      <IncidentProvider>
        <GalleryExhibit incident={incident} />
      </IncidentProvider>
    );

    // Wait for useEffect to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Despite error, component should still be rendered
    expect(screen.getByTestId("mock-artifact-renderer")).toBeInTheDocument();
    expect(screen.getByTestId("mock-details-window")).toBeInTheDocument();

    // Restore original Image
    window.Image = originalImage;
  });

  it("handles error in checkIframeSize", async () => {
    const incident = {
      id: "8",
      name: "Iframe Error Test",
      description: "Testing iframe error handling",
      artifactType: "code",
      artifactContent: "<html><body>Error test</body></html>",
    };

    // Store original querySelector
    const originalQuerySelector = Element.prototype.querySelector;
    
    // Mock an iframe that throws error when trying to access contentDocument
    const iframe = document.createElement("iframe");
    Object.defineProperty(iframe, "contentDocument", {
      get: () => {
        throw new Error("Cannot access contentDocument");
      },
      configurable: true,
    });

    // Mock querySelector to return our mock iframe
    Element.prototype.querySelector = jest.fn(() => iframe);

    render(
      <IncidentProvider>
        <GalleryExhibit incident={incident} />
      </IncidentProvider>
    );

    // Trigger iframe onload handler
    act(() => {
      const iframeElement = document.createElement("iframe");
      Object.defineProperty(iframeElement, "contentDocument", {
        get: () => {
          throw new Error("Cannot access contentDocument");
        },
      });
      const mockOnload = { current: null };
      Object.defineProperty(iframeElement, "onload", {
        get: () => mockOnload.current,
        set: (fn) => {
          mockOnload.current = fn;
        },
      });
      document.body.appendChild(iframeElement);
      if (mockOnload.current) mockOnload.current();
    });

    // Wait for timeouts in useEffect
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    // Debug info should be updated with error
    expect(console.log).toHaveBeenCalledWith(
      "Artifact dimensions:",
      expect.objectContaining({
        artifactType: "code",
      })
    );

    // Component should still render without crashing
    expect(screen.getByTestId("mock-artifact-renderer")).toBeInTheDocument();

    // Restore original querySelector
    Element.prototype.querySelector = originalQuerySelector;
  });
});
