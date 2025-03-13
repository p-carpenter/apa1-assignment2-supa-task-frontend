import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "@/app/contexts/ThemeContext";
import { IncidentProvider } from "@/app/contexts/IncidentContext";
import { useIncidents } from "@/app/contexts/IncidentContext";
import { useTheme } from "@/app/contexts/ThemeContext";
import { getPaddingSizeForArtifact } from "@/app/utils/artifactUtils";

jest.mock("@/app/contexts/IncidentContext", () => ({
  useIncidents: jest.fn(),
}));

jest.mock("@/app/contexts/ThemeContext");

jest.mock("@/app/components/ui/decades/MacintoshDetailsWindow", () => () => (
  <div data-testid="1980s-window">1980s Window</div>
));
jest.mock("@/app/components/ui/decades/Win98DetailsWindow", () => () => (
  <div data-testid="1990s-window">1990s Window</div>
));
jest.mock("@/app/components/ui/decades/AeroDetailsWindow", () => () => (
  <div data-testid="2000s-window">2000s Window</div>
));
jest.mock("@/app/components/ui/decades/MaterialDetailsWindow", () => () => (
  <div data-testid="2010s-window">2010s Window</div>
));
jest.mock("@/app/components/ui/decades/GlassmorphicDetailsWindow", () => () => (
  <div data-testid="2020s-window">2020s Window</div>
));

// Test component that consumes ThemeContext
export const TestComponent = ({ incident }) => {
  const { decade, IncidentDetailsWindows, artifactWidth } = useTheme();

  return (
    <div>
      <div data-testid="decade">{decade}</div>
      <div data-testid="artifact-width">{artifactWidth}</div>
      <IncidentDetailsWindows incident={incident} />
    </div>
  );
};

describe("ThemeContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useIncidents.mockReturnValue({ currentDecade: 1990 });
  });

  it("provides default theme values for 1990s decade", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("decade")).toHaveTextContent("1990");
    expect(screen.getByTestId("1990s-window")).toBeInTheDocument();
  });

  it("provides values for 1980s decade", () => {
    useIncidents.mockReturnValueOnce({
      currentDecade: 1980,
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("decade")).toHaveTextContent("1980");
    expect(screen.getByTestId("1980s-window")).toBeInTheDocument();
  });

  it("provides values for 2000s decade", () => {
    useIncidents.mockReturnValueOnce({ currentDecade: 2000 });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("decade")).toHaveTextContent("2000");
    expect(screen.getByTestId("2000s-window")).toBeInTheDocument();
  });

  it("provides values for 2010s decade", () => {
    useIncidents.mockReturnValueOnce({ currentDecade: 2010 });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("decade")).toHaveTextContent("2010");
    expect(screen.getByTestId("2010s-window")).toBeInTheDocument();
  });

  it("provides values for 2020s decade", () => {
    useIncidents.mockReturnValueOnce({ currentDecade: 2020 });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("decade")).toHaveTextContent("2020");
    expect(screen.getByTestId("2020s-window")).toBeInTheDocument();
  });

  it("handles invalid decade by using 1990s as default", () => {
    useIncidents.mockReturnValueOnce({ currentDecade: 9999 });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("decade")).toHaveTextContent("1990");
    expect(screen.getByTestId("1990s-window")).toBeInTheDocument();
  });

  it("displays the correct incident data inside the 1980s window", () => {
    useIncidents.mockReturnValueOnce({ currentDecade: 1980 });

    const mockIncident = {
      name: "Test Incident",
      description: "An issue in the 80s.",
    };

    render(
      <ThemeProvider>
        <TestComponent incident={mockIncident} />
      </ThemeProvider>
    );

    expect(screen.getByTestId("1980s-window")).toBeInTheDocument();
    expect(screen.getByText("Title: Test Incident")).toBeInTheDocument();
    expect(
      screen.getByText("Description: An issue in the 80s.")
    ).toBeInTheDocument();
  });

  // Invalid decades should be prevented by form validation, but just in case...
  it("renders the 1990s window when given an invalid decade", () => {
    useIncidents.mockReturnValueOnce({ currentDecade: 9999 });

    render(
      <ThemeProvider>
        <TestComponent
          incident={{
            name: "Test Incident",
            description: "An issue in the 80s.",
          }}
        />
      </ThemeProvider>
    );

    expect(screen.getByTestId("1990s-window")).toBeInTheDocument();
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
