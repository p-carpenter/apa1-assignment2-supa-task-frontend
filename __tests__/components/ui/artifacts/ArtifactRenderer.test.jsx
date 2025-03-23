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

  it("sets iframe scrolling attribute to 'auto'", () => {
    const codeMock = {
      id: "2",
      name: "Test Code",
      artifactType: "code",
      artifactContent: "<html><body>Test HTML</body></html>",
    };

    render(<ArtifactRenderer artifact={codeMock} />);

    const iframe = screen.getByTitle("Test Code");
    expect(iframe).toHaveAttribute("scrolling", "auto");
  });

  it("adjusts iframe height based on content", async () => {
    const codeMock = {
      id: "2",
      name: "Test Code",
      artifactType: "code",
      artifactContent:
        "<html><body style='height: 500px; margin: 0;'>Test Content</body></html>",
    };

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

    const { container } = render(<ArtifactRenderer artifact={codeMock} />);

    const iframe = screen.getByTitle("Test Code");

    Object.defineProperty(iframe, "contentDocument", {
      value: mockContentDocument,
      writable: true,
    });

    Object.defineProperty(iframe, "contentWindow", {
      value: { document: mockContentDocument },
      writable: true,
    });

    await act(async () => {
      iframe.onload();
    });

    expect(iframe.style.height).toBe("500px");
    expect(iframe.style.width).toBe("800px");
  });

  it("handles large iframe content appropriately", async () => {
    const codeMock = {
      id: "3",
      name: "Large Code Example",
      artifactType: "code",
      artifactContent:
        "<html><body style='height: 2000px; width: 1000px; margin: 0;'>Large Content</body></html>",
    };

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

    render(
      <ArtifactRenderer artifact={codeMock} maxWidth={900} maxHeight={1500} />
    );

    const iframe = screen.getByTitle("Large Code Example");

    Object.defineProperty(iframe, "contentDocument", {
      value: mockContentDocument,
      writable: true,
    });

    Object.defineProperty(iframe, "contentWindow", {
      value: { document: mockContentDocument },
      writable: true,
    });

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

    render(<ArtifactRenderer artifact={codeMock} />);

    const iframe = screen.getByTitle("Error Test");

    Object.defineProperty(iframe, "contentDocument", {
      get: () => {
        throw new Error("Cannot access contentDocument");
      },
    });

    await act(async () => {
      iframe.onload();
    });

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
    expect(iframe).toHaveClass("codeFullHeight");
  });
});

describe("ArtifactRenderer image resizing", () => {
  const renderWithImageLoaded = async (props, imgDimensions) => {
    const { container } = render(<ArtifactRenderer {...props} />);

    const img = screen.getByAltText(props.artifact.name);

    Object.defineProperty(img, "complete", { value: true });

    Object.defineProperty(img, "naturalWidth", {
      value: imgDimensions.naturalWidth,
    });

    Object.defineProperty(img, "naturalHeight", {
      value: imgDimensions.naturalHeight,
    });

    fireEvent.load(img);

    await waitFor(() => {});
    return { container, img };
  };

  it("resizes small images to scale up when scaleUpSmallImages is true", async () => {
    const smallImageMock = {
      id: "1",
      name: "Small Image",
      artifactType: "image",
      artifactContent: "/small-image.jpg",
    };

    // Default ideal dimensions from component are 863x650
    const { img } = await renderWithImageLoaded(
      {
        artifact: smallImageMock,
        scaleUpSmallImages: true,
        idealWidth: 863,
        idealHeight: 650,
      },
      { naturalWidth: 150, naturalHeight: 200 }
    );

    await waitFor(() => {
      expect(img.style.width).toBe("487.5px");
      expect(img.style.height).toBe("650px");
    });
  });

  it("does not scale up small images when scaleUpSmallImages is false", async () => {
    const smallImageMock = {
      id: "2",
      name: "Small Image",
      artifactType: "image",
      artifactContent: "/small-image.jpg",
    };

    const { img } = await renderWithImageLoaded(
      {
        artifact: smallImageMock,
        scaleUpSmallImages: false,
        idealWidth: 863,
        idealHeight: 650,
      },
      { naturalWidth: 200, naturalHeight: 150 }
    );

    // Small images should keep their original size when scaling is disabled
    await waitFor(() => {
      expect(img.style.width).toBe("200px");
      expect(img.style.height).toBe("150px");
    });
  });

  it("scales down large images to fit within maxWidth and maxHeight", async () => {
    const largeImageMock = {
      id: "3",
      name: "Large Image",
      artifactType: "image",
      artifactContent: "/large-image.jpg",
    };

    const { img } = await renderWithImageLoaded(
      {
        artifact: largeImageMock,
        maxWidth: 800,
        maxHeight: 600,
      },
      { naturalWidth: 1600, naturalHeight: 900 }
    );

    await waitFor(() => {
      expect(img.style.width).toBe("800px");
      expect(img.style.height).toBe("450px");
    });
  });

  it("scales down very tall images based on height constraint", async () => {
    const tallImageMock = {
      id: "4",
      name: "Tall Image",
      artifactType: "image",
      artifactContent: "/tall-image.jpg",
    };

    const { img } = await renderWithImageLoaded(
      {
        artifact: tallImageMock,
        maxWidth: 800,
        maxHeight: 600,
      },
      { naturalWidth: 500, naturalHeight: 1200 }
    );

    await waitFor(() => {
      expect(img.style.width).toBe("250px");
      expect(img.style.height).toBe("600px");
    });
  });

  it("maintains original dimensions for images near ideal size", async () => {
    const idealSizeImageMock = {
      id: "5",
      name: "Ideal Size Image",
      artifactType: "image",
      artifactContent: "/ideal-size-image.jpg",
    };

    const { img } = await renderWithImageLoaded(
      {
        artifact: idealSizeImageMock,
        idealWidth: 863,
        idealHeight: 650,
      },
      { naturalWidth: 820, naturalHeight: 630 }
    );

    // Should maintain original dimensions as they're within 10% of ideal
    await waitFor(() => {
      expect(img.style.width).toBe("820px");
      expect(img.style.height).toBe("630px");
    });
  });

  it("handles images between min and max size without resizing", async () => {
    const mediumImageMock = {
      id: "6",
      name: "Medium Image",
      artifactType: "image",
      artifactContent: "/medium-image.jpg",
    };

    const { img } = await renderWithImageLoaded(
      {
        artifact: mediumImageMock,
        maxWidth: 1000,
        maxHeight: 800,
        idealWidth: 863,
        idealHeight: 650,
        scaleUpSmallImages: false,
      },
      { naturalWidth: 700, naturalHeight: 500 }
    );

    // Since the image is smaller than max dimensions but larger than what would trigger scaling up,
    // it should maintain original dimensions
    await waitFor(() => {
      expect(img.style.width).toBe("700px");
      expect(img.style.height).toBe("500px");
    });
  });
});
