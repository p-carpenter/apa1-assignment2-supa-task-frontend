import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import ArtifactRenderer from "@/app/components/ui/artifacts/ArtifactRenderer";

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock console.warn and console.log to avoid cluttering test output
console.warn = jest.fn();
console.log = jest.fn();

describe("ArtifactRenderer", () => {
  // Mock global objects
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock ResizeObserver
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  it("renders image artifact correctly", () => {
    const imageMock = {
      id: "1",
      name: "Test Image",
      artifactType: "image",
      artifactContent: "/test-image.jpg",
      width: 800,
      height: 600,
    };

    render(<ArtifactRenderer artifact={imageMock} />);

    const image = screen.getByAltText("Test Image");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/test-image.jpg");
  });

  it("renders code artifact correctly", () => {
    const codeMock = {
      id: "2",
      name: "Test Code",
      artifactType: "code",
      artifactContent: "<html><body>Test HTML</body></html>",
    };

    render(<ArtifactRenderer artifact={codeMock} />);

    const iframe = screen.getByTitle("Test Code");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "srcDoc",
      "<html><body>Test HTML</body></html>"
    );
  });

  it("handles null artifact gracefully", () => {
    render(<ArtifactRenderer artifact={null} />);

    expect(screen.getByText("No artifact available")).toBeInTheDocument();
  });

  it("applies correct padding class based on paddingSize prop", () => {
    const imageMock = {
      id: "1",
      artifactType: "image",
      artifactContent: "/test-image.jpg",
    };

    const { container, rerender } = render(
      <ArtifactRenderer artifact={imageMock} paddingSize="small" />
    );

    expect(container.firstChild).toHaveClass("artifact-padding-small");

    // Test another padding size
    rerender(<ArtifactRenderer artifact={imageMock} paddingSize="large" />);
    expect(container.firstChild).toHaveClass("artifact-padding-large");
  });

  it("toggles expanded state on click", () => {
    const mockArtifact = {
      id: "1",
      artifactType: "image",
      artifactContent: "/test-image.jpg",
    };

    const { container } = render(<ArtifactRenderer artifact={mockArtifact} />);

    // Initially not expanded
    expect(container.firstChild).not.toHaveClass("artifact-expanded");

    // Click to expand
    fireEvent.click(container.firstChild);
    expect(container.firstChild).toHaveClass("artifact-expanded");

    // Click again to collapse
    fireEvent.click(container.firstChild);
    expect(container.firstChild).not.toHaveClass("artifact-expanded");
  });

  it("calls onExpand callback when expanded state changes", () => {
    const mockArtifact = {
      id: "1",
      artifactType: "image",
      artifactContent: "/test-image.jpg",
    };

    const onExpandMock = jest.fn();

    const { container } = render(
      <ArtifactRenderer artifact={mockArtifact} onExpand={onExpandMock} />
    );

    // Click to expand
    fireEvent.click(container.firstChild);
    expect(onExpandMock).toHaveBeenCalledWith(true);

    // Click to collapse
    fireEvent.click(container.firstChild);
    expect(onExpandMock).toHaveBeenCalledWith(false);
  });

  // New tests for iframe height handling
  it("sets iframe scrolling attribute to 'no'", () => {
    const codeMock = {
      id: "2",
      name: "Test Code",
      artifactType: "code",
      artifactContent: "<html><body>Test HTML</body></html>",
    };

    render(<ArtifactRenderer artifact={codeMock} />);

    const iframe = screen.getByTitle("Test Code");
    expect(iframe).toHaveAttribute("scrolling", "no");
  });

  it("adjusts iframe height based on content", async () => {
    // Create a code artifact mock
    const codeMock = {
      id: "2",
      name: "Test Code",
      artifactType: "code",
      artifactContent:
        "<html><body style='height: 500px; margin: 0;'>Test Content</body></html>",
    };

    // Mock iframe contentDocument
    const mockContentDocument = {
      body: {
        scrollHeight: 500,
        offsetHeight: 500,
        clientHeight: 500,
        scrollWidth: 800,
        offsetWidth: 800,
        clientWidth: 800,
        addEventListener: jest.fn(),
      },
    };

    // Render component
    const { container } = render(<ArtifactRenderer artifact={codeMock} />);

    // Get the iframe element
    const iframe = screen.getByTitle("Test Code");

    // Mock iframe properties and methods
    Object.defineProperty(iframe, "contentDocument", {
      value: mockContentDocument,
      writable: true,
    });

    Object.defineProperty(iframe, "contentWindow", {
      value: { document: mockContentDocument },
      writable: true,
    });

    // Simulate iframe onload event
    await act(async () => {
      iframe.onload();
    });

    // Check if iframe style was updated
    expect(iframe.style.height).toBe("500px");
    expect(iframe.style.width).toBe("800px");
  });

  it("handles large iframe content appropriately", async () => {
    // Create a code artifact with large content
    const codeMock = {
      id: "3",
      name: "Large Code Example",
      artifactType: "code",
      artifactContent:
        "<html><body style='height: 2000px; width: 1000px; margin: 0;'>Large Content</body></html>",
    };

    // Mock iframe contentDocument with large dimensions
    const mockContentDocument = {
      body: {
        scrollHeight: 2000,
        offsetHeight: 2000,
        clientHeight: 2000,
        scrollWidth: 1000,
        offsetWidth: 1000,
        clientWidth: 1000,
        addEventListener: jest.fn(),
      },
    };

    // Render component
    render(
      <ArtifactRenderer artifact={codeMock} maxWidth={900} maxHeight={1500} />
    );

    // Get the iframe element
    const iframe = screen.getByTitle("Large Code Example");

    // Mock iframe properties
    Object.defineProperty(iframe, "contentDocument", {
      value: mockContentDocument,
      writable: true,
    });

    Object.defineProperty(iframe, "contentWindow", {
      value: { document: mockContentDocument },
      writable: true,
    });

    // Simulate iframe onload event
    await act(async () => {
      iframe.onload();
    });

    // Even with maxHeight set to 1500, the iframe should be sized to content
    expect(iframe.style.height).toBe("2000px");
    // Width should respect the content width
    expect(iframe.style.width).toBe("1000px");
  });

  it("handles iframe load errors gracefully", async () => {
    const codeMock = {
      id: "4",
      name: "Error Test",
      artifactType: "code",
      artifactContent: "<html><body>Test Content</body></html>",
    };

    // Render component
    render(<ArtifactRenderer artifact={codeMock} />);

    // Get the iframe element
    const iframe = screen.getByTitle("Error Test");

    // Mock iframe to throw an error when trying to access contentDocument
    Object.defineProperty(iframe, "contentDocument", {
      get: () => {
        throw new Error("Cannot access contentDocument");
      },
    });

    // Simulate iframe onload event
    await act(async () => {
      iframe.onload();
    });

    // Should have called console.warn
    expect(console.warn).toHaveBeenCalled();
  });

  it("applies 'artifact-code-full-height' class to code artifacts", () => {
    const codeMock = {
      id: "5",
      name: "Full Height Test",
      artifactType: "code",
      artifactContent: "<html><body>Test Content</body></html>",
    };

    render(<ArtifactRenderer artifact={codeMock} />);

    const iframe = screen.getByTitle("Full Height Test");
    expect(iframe).toHaveClass("artifact-code-full-height");
  });

  it("detects small images and adds padding class automatically", async () => {
    const smallImageMock = {
      id: "6",
      name: "Small Image",
      artifactType: "image",
      artifactContent: "/small-image.jpg",
      width: 200,
      height: 150,
    };

    // Create a test helper to allow controlling img.complete and naturalDimensions
    const renderWithImageLoaded = async (props) => {
      const { container } = render(<ArtifactRenderer {...props} />);

      // Find image and mock its properties
      const img = screen.getByAltText("Small Image");

      // Set image properties
      Object.defineProperty(img, "complete", { value: true });
      Object.defineProperty(img, "naturalWidth", { value: 200 });
      Object.defineProperty(img, "naturalHeight", { value: 150 });

      // Trigger load event
      fireEvent.load(img);

      // Wait for state updates
      await waitFor(() => {});

      return { container, img };
    };

    // Render with auto padding size
    const { container } = await renderWithImageLoaded({
      artifact: smallImageMock,
      paddingSize: "auto",
    });

    // Mock container dimensions for padding calculations
    const containerElement = container.firstChild;
    Object.defineProperty(containerElement, "clientWidth", { value: 800 });
    Object.defineProperty(containerElement, "clientHeight", { value: 600 });

    // Force re-render of padding detection
    await act(async () => {
      // Get image and re-trigger load to force padding recalculation
      const img = screen.getByAltText("Small Image");
      fireEvent.load(img);
    });

    // Allow effect hooks to run
    await waitFor(() => {});

    // Small images should get padding with auto detection
    expect(container.firstChild).toHaveClass("artifact-with-padding");
  });

  it("obeys explicit padding size settings", async () => {
    const imageMock = {
      id: "7",
      name: "Padding Test",
      artifactType: "image",
      artifactContent: "/test-image.jpg",
      width: 800,
      height: 600,
    };

    // Render with explicit padding size
    const { container } = render(
      <ArtifactRenderer artifact={imageMock} paddingSize="xl" />
    );

    // Should have explicit padding class regardless of image size
    expect(container.firstChild).toHaveClass("artifact-padding-xl");

    // Wait for all effects to complete
    await waitFor(() => {});

    // Should not have automatic padding class
    expect(container.firstChild).not.toHaveClass("artifact-with-padding");
  });

  //   // Key test for iframe height
  //   it("adjusts iframe height based on actual content height", async () => {
  //     // Create test with large iframe content
  //     const largeCodeArtifact = {
  //       id: "large",
  //       name: "Large Document",
  //       artifactType: "code",
  //       artifactContent:
  //         "<html><body style='height: 2000px;'>Large content</body></html>",
  //     };

  //     render(<ArtifactRenderer artifact={largeCodeArtifact} maxHeight={500} />);

  //     // Get the iframe
  //     const iframe = screen.getByTitle("Large Document");

  //     // Mock contentDocument
  //     Object.defineProperty(iframe, "contentDocument", {
  //       value: {
  //         body: {
  //           scrollHeight: 2000,
  //           offsetHeight: 2000,
  //           clientHeight: 2000,
  //           addEventListener: jest.fn(),
  //         },
  //       },
  //     });

  //     // Trigger onload
  //     await act(async () => {
  //       iframe.onload();
  //     });

  //     // Check iframe is adjusted to full content height despite maxHeight
  //     expect(iframe.style.height).toBe("2000px");
  //   });
});
