// __tests__/contexts/ThemeContext.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/app/contexts/ThemeContext";
import { getPaddingSizeForArtifact } from "@/app/utils/artifactUtils";
import { useIncidents } from "@/app/contexts/IncidentContext";

// Mock IncidentContext
jest.mock("@/app/contexts/IncidentContext", () => ({
  useIncidents: jest.fn(),
}));
jest.mock("@/app/contexts/ThemeContext");
jest.mock("@/app/components/ui/decades/MacintoshDetailsWindow", () => () => (
  <div data-testid="macintosh-window">Macintosh Window</div>
));
jest.mock("@/app/components/ui/decades/Win98DetailsWindow", () => () => (
  <div data-testid="win98-window">Win98 Window</div>
));
jest.mock("@/app/components/ui/decades/AeroDetailsWindow", () => () => (
  <div data-testid="aero-window">Aero Window</div>
));
jest.mock("@/app/components/ui/decades/MaterialDetailsWindow", () => () => (
  <div data-testid="material-window">Material Window</div>
));
jest.mock("@/app/components/ui/decades/GlassmorphicDetailsWindow", () => () => (
  <div data-testid="glassmorphic-window">Glassmorphic Window</div>
));

// Test component that consumes ThemeContext
export const TestComponent = () => {
  const { decade, decadeConfig, IncidentDetailsWindows, artifactWidth } =
    useTheme();

  return (
    <div>
      <div data-testid="decade">{decade}</div>
      <div data-testid="frame-type">{decadeConfig.frameType}</div>
      <div data-testid="artifact-width">{artifactWidth}</div>
      <div data-testid="max-height">{decadeConfig.maxHeight}</div>
      <div data-testid="padding">{decadeConfig.contentPadding}</div>
      <IncidentDetailsWindows />
    </div>
  );
};

describe("ThemeContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation
    useIncidents.mockReturnValue({ currentDecade: 1990 });
  });

  it("provides default theme values for 1990s decade", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("decade")).toHaveTextContent("1990");
    expect(screen.getByTestId("frame-type")).toHaveTextContent("win95");
    expect(screen.getByTestId("max-height")).toHaveTextContent("640");
    expect(screen.getByTestId("padding")).toHaveTextContent("small");
    expect(screen.getByTestId("win98-window")).toBeInTheDocument();
    expect(screen.getByTestId("artifact-width")).toHaveTextContent("863");
  });

  it("provides values for 1980s decade", () => {
    useIncidents.mockReturnValue({ currentDecade: 1980 });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("decade")).toHaveTextContent("1980");
    expect(screen.getByTestId("frame-type")).toHaveTextContent("dos");
    expect(screen.getByTestId("max-height")).toHaveTextContent("600");
    expect(screen.getByTestId("padding")).toHaveTextContent("medium");
    expect(screen.getByTestId("macintosh-window")).toBeInTheDocument();
  });

  it("provides values for 2000s decade", () => {
    useIncidents.mockReturnValue({ currentDecade: 2000 });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("decade")).toHaveTextContent("2000");
    expect(screen.getByTestId("frame-type")).toHaveTextContent("geocities");
    expect(screen.getByTestId("max-height")).toHaveTextContent("680");
    expect(screen.getByTestId("padding")).toHaveTextContent("medium");
    expect(screen.getByTestId("aero-window")).toBeInTheDocument();
  });

  it("provides values for 2010s decade", () => {
    useIncidents.mockReturnValue({ currentDecade: 2010 });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("decade")).toHaveTextContent("2010");
    expect(screen.getByTestId("frame-type")).toHaveTextContent("android");
    expect(screen.getByTestId("max-height")).toHaveTextContent("690");
    expect(screen.getByTestId("padding")).toHaveTextContent("small");
    expect(screen.getByTestId("material-window")).toBeInTheDocument();
  });

  it("provides values for 2020s decade", () => {
    useIncidents.mockReturnValue({ currentDecade: 2020 });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("decade")).toHaveTextContent("2020");
    expect(screen.getByTestId("frame-type")).toHaveTextContent("zoom");
    expect(screen.getByTestId("max-height")).toHaveTextContent("700");
    expect(screen.getByTestId("padding")).toHaveTextContent("small");
    expect(screen.getByTestId("glassmorphic-window")).toBeInTheDocument();
  });

  it("handles invalid decade by using 1990s as default", () => {
    useIncidents.mockReturnValue({ currentDecade: 9999 });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("decade")).toHaveTextContent("1990");
    expect(screen.getByTestId("frame-type")).toHaveTextContent("win95");
    expect(screen.getByTestId("max-height")).toHaveTextContent("640");
    expect(screen.getByTestId("win98-window")).toBeInTheDocument();
  });

  it("handles null or undefined currentDecade by using 1990s as default", () => {
    useIncidents.mockReturnValue({ currentDecade: null });

    render(
      <ThemeProvider decade={null}>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("decade")).toHaveTextContent("1990");
    expect(screen.getByTestId("frame-type")).toHaveTextContent("win95");

    // Test undefined as well
    useIncidents.mockReturnValue({ currentDecade: undefined });

    render(
      <ThemeProvider decade={undefined}>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("decade")).toHaveTextContent("1990");
  });

  it("passes incident prop to IncidentDetailsWindow component", () => {
    // call macintosh mock component (ES6 module)
    const MacintoshMock = require("@/app/components/ui/decades/MacintoshDetailsWindow");
    useIncidents.mockReturnValue({ currentDecade: 1980 });

    render(
      <ThemeProvider decade={1980}>
        <TestComponent />
      </ThemeProvider>
    );

    expect(MacintoshMock).toHaveBeenCalledWith(
      expect.objectContaining({
        incident: { name: "Test Incident" },
      }),
      expect.anything()
    );
  });

  // Separate tests for the getPaddingSizeForArtifact utility function
  describe("getPaddingSizeForArtifact", () => {
    it("returns 'auto' for null artifacts", () => {
      expect(getPaddingSizeForArtifact(null)).toBe("auto");
    });

    it("returns 'auto' for undefined artifacts", () => {
      expect(getPaddingSizeForArtifact(undefined)).toBe("auto");
    });

    it("returns 'large' for small images", () => {
      expect(
        getPaddingSizeForArtifact({
          artifactType: "image",
          width: 200,
          height: 150,
        })
      ).toBe("large");

      // Test at the boundary
      expect(
        getPaddingSizeForArtifact({
          artifactType: "image",
          width: 299,
          height: 199,
        })
      ).toBe("large");
    });

    it("returns 'auto' for standard size images", () => {
      expect(
        getPaddingSizeForArtifact({
          artifactType: "image",
          width: 300,
          height: 200,
        })
      ).toBe("auto");
    });

    it("returns 'xl' for images with very small preferred height", () => {
      expect(
        getPaddingSizeForArtifact({
          artifactType: "image",
          preferredHeight: 100,
        })
      ).toBe("xl");

      // Test at the boundary
      expect(
        getPaddingSizeForArtifact({
          artifactType: "image",
          preferredHeight: 149,
        })
      ).toBe("xl");
    });

    it("returns 'large' for images with small preferred height", () => {
      expect(
        getPaddingSizeForArtifact({
          artifactType: "image",
          preferredHeight: 150,
        })
      ).toBe("large");

      // Test at the boundary
      expect(
        getPaddingSizeForArtifact({
          artifactType: "image",
          preferredHeight: 249,
        })
      ).toBe("large");
    });

    it("returns 'medium' for images with medium preferred height", () => {
      expect(
        getPaddingSizeForArtifact({
          artifactType: "image",
          preferredHeight: 250,
        })
      ).toBe("medium");

      // Test at the boundary
      expect(
        getPaddingSizeForArtifact({
          artifactType: "image",
          preferredHeight: 399,
        })
      ).toBe("medium");
    });

    it("returns 'auto' for images with large preferred height", () => {
      expect(
        getPaddingSizeForArtifact({
          artifactType: "image",
          preferredHeight: 400,
        })
      ).toBe("auto");

      expect(
        getPaddingSizeForArtifact({
          artifactType: "image",
          preferredHeight: 500,
        })
      ).toBe("auto");
    });

    it("returns 'auto' for code artifacts regardless of size", () => {
      expect(getPaddingSizeForArtifact({ artifactType: "code" })).toBe("auto");

      // Even with additional properties
      expect(
        getPaddingSizeForArtifact({
          artifactType: "code",
          width: 100,
          height: 100,
        })
      ).toBe("auto");
    });

    it("prioritizes preferredHeight over width/height for sizing", () => {
      // When preferredHeight says "xl" but dimensions say "large"
      expect(
        getPaddingSizeForArtifact({
          artifactType: "image",
          preferredHeight: 100,
          width: 500,
          height: 400,
        })
      ).toBe("xl");

      // When preferredHeight says "auto" but dimensions say "large"
      expect(
        getPaddingSizeForArtifact({
          artifactType: "image",
          preferredHeight: 500,
          width: 200,
          height: 150,
        })
      ).toBe("auto");
    });

    it("handles artifacts with unknown types", () => {
      expect(
        getPaddingSizeForArtifact({
          artifactType: "unknown-type",
        })
      ).toBe("auto");
    });

    it("handles artifacts with no type specified", () => {
      expect(
        getPaddingSizeForArtifact({
          width: 300,
          height: 200,
        })
      ).toBe("auto");
    });
  });
});
