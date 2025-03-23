jest.mock("@/app/gallery/GalleryNavigator", () => {
  return jest.fn(() => (
    <div data-testid="gallery-page-content">Gallery Page Content</div>
  ));
});
import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, useSearchParams } from "next/navigation";
import GalleryPage from "@/app/gallery/page";
import GalleryPageContent from "@/app/gallery/GalleryNavigator";
import GalleryNavButtons from "@/app/gallery/GalleryNavButtons";
import GalleryDisplay from "@/app/gallery/GalleryDisplay";
import { useIncidents } from "@/app/contexts/IncidentContext";
import { useTheme } from "@/app/contexts/ThemeContext";
import * as slugUtils from "@/app/utils/navigation/slugUtils";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("@/app/contexts/IncidentContext", () => ({
  useIncidents: jest.fn(),
}));

jest.mock("@/app/contexts/ThemeContext", () => ({
  useTheme: jest.fn(),
}));

jest.mock("@/app/utils/navigation/slugUtils", () => ({
  findIncidentBySlug: jest.fn(),
  generateSlug: jest.fn(),
  getIncidentIndexBySlug: jest.fn(),
}));

const slugUtils = require("@/app/utils/navigation/slugUtils");

jest.mock("@/app/gallery/GalleryDisplay", () => {
  return ({ incident, isLoading, onClose, onNavigate }) => (
    <div data-testid="gallery-display">
      <h2 data-testid="incident-name">{incident?.name || "No Incident"}</h2>
      <span data-testid="loading-status">
        {isLoading ? "Loading" : "Loaded"}
      </span>
      <button onClick={onClose} data-testid="close-button">
        Close
      </button>
      <button onClick={() => onNavigate(0)} data-testid="navigate-0">
        Navigate to 0
      </button>
      <button onClick={() => onNavigate(1)} data-testid="navigate-1">
        Navigate to 1
      </button>
    </div>
  );
});

jest.mock("@/app/gallery/GalleryNavButtons", () => {
  return ({
    onPreviousClick,
    onNextClick,
    incidentYears,
    currentIncidentYear,
    onYearClick,
    incidentCounts,
    currentIncidentIndexInYear,
  }) => (
    <div data-testid="gallery-nav-buttons">
      <button onClick={onPreviousClick} data-testid="prev-button">
        Previous
      </button>
      <button onClick={onNextClick} data-testid="next-button">
        Next
      </button>
      <div data-testid="year-buttons">
        {incidentYears &&
          incidentYears.map((year) => (
            <button
              key={year}
              onClick={() => onYearClick(year)}
              data-testid={`year-${year}`}
              data-current={year === currentIncidentYear ? "true" : "false"}
            >
              {year} {incidentCounts[year] > 0 && `(${incidentCounts[year]})`}
              {year === currentIncidentYear && (
                <span data-testid="current-index">
                  {currentIncidentIndexInYear + 1}
                </span>
              )}
            </button>
          ))}
      </div>
    </div>
  );
});

jest.mock("@/app/components/ui/artifacts", () => ({
  ArtifactRenderer: jest.fn(({ artifact }) => (
    <div data-testid="artifact-renderer">
      <span data-testid="artifact-name">{artifact.name}</span>
    </div>
  )),
}));

jest.mock("@/app/gallery/GalleryDisplaySkeleton", () => {
  return jest.fn(() => (
    <div data-testid="gallery-skeleton">Loading Skeleton</div>
  ));
});

const mockIncidents = [
  {
    id: "1",
    name: "Test Incident 1",
    description: "This is a test incident",
    category: "Security",
    severity: "High",
    incident_date: "2020-01-01",
  },
  {
    id: "2",
    name: "Test Incident 2",
    description: "This is another test incident",
    category: "Hardware",
    severity: "Moderate",
    incident_date: "2021-02-15",
  },
  {
    id: "3",
    name: "Test Incident 3",
    description: "From a different year",
    category: "Software",
    severity: "Low",
    incident_date: "2022-03-20",
  },
  {
    id: "4",
    name: "Test Incident 4",
    description: "Also from 2022",
    category: "Software",
    severity: "Medium",
    incident_date: "2022-07-15",
  },
];

const setupDefaultMocks = () => {
  jest.clearAllMocks();

  const pushMock = jest.fn();
  useRouter.mockReturnValue({
    push: pushMock,
  });

  const mockSearchParams = {
    get: jest.fn().mockReturnValue(null),
  };
  useSearchParams.mockReturnValue(mockSearchParams);

  slugUtils.findIncidentBySlug.mockImplementation((incidents, slug) => {
    if (slug === "test-incident-1") return mockIncidents[0];
    if (slug === "test-incident-2") return mockIncidents[1];
    if (slug === "test-incident-3") return mockIncidents[2];
    if (slug === "test-incident-4") return mockIncidents[3];
    return null;
  });

  slugUtils.generateSlug.mockImplementation((name) => {
    return name.toLowerCase().replace(/\s+/g, "-");
  });

  slugUtils.getIncidentIndexBySlug.mockImplementation((incidents, slug) => {
    return mockIncidents.findIndex(
      (inc) => slugUtils.generateSlug(inc.name) === slug
    );
  });

  useTheme.mockReturnValue({
    theme: "default",
    IncidentDetailsWindows: ({ incident }) => (
      <div data-testid="incident-details">
        <h3 data-testid="incident-title">{incident.name}</h3>
        <p data-testid="incident-description">{incident.description}</p>
      </div>
    ),
  });

  useIncidents.mockReturnValue({
    incidents: mockIncidents,
    filteredIncidents: mockIncidents,
    setDisplayedIncident: jest.fn(),
    setCurrentIncidentIndex: jest.fn(),
    currentDecade: null,
    setCurrentDecade: jest.fn(),
    activeFilter: null,
    searchQuery: "",
    displayedIncident: null,
    isLoading: false,
  });

  Object.defineProperty(window, "history", {
    writable: true,
    value: {
      pushState: jest.fn(),
      replaceState: jest.fn(),
    },
  });

  jest.unmock("@/app/gallery/GalleryNavigator");
};

describe("Gallery Page", () => {
  beforeEach(() => {
    setupDefaultMocks();
  });

  describe("Main Gallery page", () => {
    it("renders the GalleryPageContent component", () => {
      jest.mock("@/app/gallery/GalleryNavigator", () => {
        return jest.fn(() => (
          <div data-testid="gallery-page-content">Gallery Page Content</div>
        ));
      });

      render(<GalleryPage />);
      expect(screen.getByTestId("gallery-page-content")).toBeInTheDocument();
    });
  });

  describe("GalleryPageContent", () => {
    beforeEach(() => {
      jest.unmock("@/app/gallery/GalleryNavigator");

      const slugUtils = require("@/app/utils/navigation/slugUtils");

      slugUtils.findIncidentBySlug.mockImplementation((incidents, slug) => {
        if (slug === "test-incident-1") return mockIncidents[0];
        if (slug === "test-incident-2") return mockIncidents[1];
        if (slug === "test-incident-3") return mockIncidents[2];
        if (slug === "test-incident-4") return mockIncidents[3];
        return null;
      });

      slugUtils.generateSlug.mockImplementation((name) => {
        return name.toLowerCase().replace(/\s+/g, "-");
      });
    });

    it("initializes correctly without a slug parameter", async () => {
      useSearchParams().get.mockReturnValue(null);

      const { default: GalleryPageContent } = jest.requireActual(
        "@/app/gallery/GalleryNavigator"
      );

      render(<GalleryPageContent />);

      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalledWith(
          { path: `/gallery?incident=test-incident-1` },
          "",
          `/gallery?incident=test-incident-1`
        );
      });

      expect(screen.getByTestId("gallery-display")).toBeInTheDocument();
    });

    it("loads correct incident when slug is provided in URL", async () => {
      useSearchParams().get.mockReturnValue("test-incident-2");

      const setDisplayedIncidentMock = jest.fn();
      useIncidents.mockReturnValue({
        ...useIncidents(),
        setDisplayedIncident: setDisplayedIncidentMock,
      });

      const { default: GalleryPageContent } = jest.requireActual(
        "@/app/gallery/GalleryNavigator"
      );

      render(<GalleryPageContent />);

      await waitFor(() => {
        expect(setDisplayedIncidentMock).toHaveBeenCalledWith(mockIncidents[1]);
      });

      expect(screen.getByTestId("incident-name").textContent).toBe(
        "Test Incident 2"
      );
    });

    it("handles incident year navigation", async () => {
      const setDisplayedIncidentMock = jest.fn();
      useIncidents.mockReturnValue({
        ...useIncidents(),
        setDisplayedIncident: setDisplayedIncidentMock,
      });

      useSearchParams().get.mockReturnValue("test-incident-1");

      const { default: GalleryPageContent } = jest.requireActual(
        "@/app/gallery/GalleryNavigator"
      );

      render(<GalleryPageContent />);

      const yearButton = screen.getByTestId("year-2022");
      await userEvent.click(yearButton);

      expect(window.history.pushState).toHaveBeenCalled();
      expect(setDisplayedIncidentMock).toHaveBeenCalledWith(
        expect.objectContaining({ id: "3" })
      );
    });

    it("handles navigation to next incident", async () => {
      const setDisplayedIncidentMock = jest.fn();
      useIncidents.mockReturnValue({
        ...useIncidents(),
        setDisplayedIncident: setDisplayedIncidentMock,
      });

      useSearchParams().get.mockReturnValue("test-incident-1");

      const { default: GalleryPageContent } = jest.requireActual(
        "@/app/gallery/GalleryNavigator"
      );

      render(<GalleryPageContent />);

      const nextButton = screen.getByTestId("next-button");
      await userEvent.click(nextButton);

      expect(window.history.pushState).toHaveBeenCalled();
      expect(setDisplayedIncidentMock).toHaveBeenCalledWith(
        expect.objectContaining({ id: "2" })
      );
    });

    it("handles navigation to previous incident", async () => {
      const setDisplayedIncidentMock = jest.fn();
      useIncidents.mockReturnValue({
        ...useIncidents(),
        setDisplayedIncident: setDisplayedIncidentMock,
      });

      useSearchParams().get.mockReturnValue("test-incident-2");

      const { default: GalleryPageContent } = jest.requireActual(
        "@/app/gallery/GalleryNavigator"
      );

      render(<GalleryPageContent />);

      const prevButton = screen.getByTestId("prev-button");
      await userEvent.click(prevButton);

      expect(window.history.pushState).toHaveBeenCalled();
      expect(setDisplayedIncidentMock).toHaveBeenCalledWith(
        expect.objectContaining({ id: "1" })
      );
    });

    it("redirects to catalog when close button is clicked", async () => {
      const pushMock = jest.fn();
      useRouter.mockReturnValue({
        push: pushMock,
      });

      const { default: GalleryPageContent } = jest.requireActual(
        "@/app/gallery/GalleryNavigator"
      );

      render(<GalleryPageContent />);

      const closeButton = screen.getByTestId("close-button");
      await userEvent.click(closeButton);

      expect(pushMock).toHaveBeenCalledWith("/catalog?reset=true");
    });

    it("sets decade based on incident date", async () => {
      useSearchParams().get.mockReturnValue("test-incident-1");

      const setCurrentDecadeMock = jest.fn();
      useIncidents.mockReturnValue({
        ...useIncidents(),
        setCurrentDecade: setCurrentDecadeMock,
        displayedIncident: mockIncidents[0],
      });

      const { default: GalleryPageContent } = jest.requireActual(
        "@/app/gallery/GalleryNavigator"
      );

      render(<GalleryPageContent />);

      await waitFor(() => {
        expect(setCurrentDecadeMock).toHaveBeenCalledWith(2020);
      });
    });

    it("handles empty incidents array", async () => {
      useIncidents.mockReturnValue({
        ...useIncidents(),
        incidents: [],
        filteredIncidents: [],
      });

      const { default: GalleryPageContent } = jest.requireActual(
        "@/app/gallery/GalleryNavigator"
      );

      render(<GalleryPageContent />);

      expect(screen.getByTestId("loading-status").textContent).toBe("Loading");
    });

    it("handles filtered incidents", async () => {
      const filteredIncidents = [mockIncidents[2], mockIncidents[3]];
      useIncidents.mockReturnValue({
        ...useIncidents(),
        activeFilter: "Software",
        filteredIncidents,
      });

      useSearchParams().get.mockReturnValue("test-incident-3");

      const { default: GalleryPageContent } = jest.requireActual(
        "@/app/gallery/GalleryNavigator"
      );

      render(<GalleryPageContent />);

      expect(screen.queryByTestId("year-2020")).not.toBeInTheDocument();
      expect(screen.queryByTestId("year-2021")).not.toBeInTheDocument();
      expect(screen.getByTestId("year-2022")).toBeInTheDocument();

      expect(screen.getByTestId("incident-name").textContent).toBe(
        "Test Incident 3"
      );
    });

    it("handles cross-year navigation (next year)", async () => {
      useSearchParams().get.mockReturnValue("test-incident-1");

      const { default: GalleryPageContent } = jest.requireActual(
        "@/app/gallery/GalleryNavigator"
      );

      render(<GalleryPageContent />);

      const nextButton = screen.getByTestId("next-button");

      await userEvent.click(nextButton);

      expect(window.history.pushState).toHaveBeenCalled();
    });

    it("handles circular navigation (last to first)", async () => {
      useSearchParams().get.mockReturnValue("test-incident-4");

      const { default: GalleryPageContent } = jest.requireActual(
        "@/app/gallery/GalleryNavigator"
      );

      render(<GalleryPageContent />);

      const nextButton = screen.getByTestId("next-button");
      await userEvent.click(nextButton);

      expect(window.history.pushState).toHaveBeenCalled();
    });

    it("handles multiple incidents in the same year", async () => {
      useSearchParams().get.mockReturnValue("test-incident-3");

      const { default: GalleryPageContent } = jest.requireActual(
        "@/app/gallery/GalleryNavigator"
      );

      render(<GalleryPageContent />);

      expect(screen.getByTestId("incident-name").textContent).toBe(
        "Test Incident 3"
      );

      const nextButton = screen.getByTestId("next-button");
      await userEvent.click(nextButton);

      expect(window.history.pushState).toHaveBeenCalled();
    });

    it("handles direct navigation via index", async () => {
      useSearchParams().get.mockReturnValue("test-incident-1");

      const { default: GalleryPageContent } = jest.requireActual(
        "@/app/gallery/GalleryNavigator"
      );

      render(<GalleryPageContent />);

      const navigateButton = screen.getByTestId("navigate-1");
      await userEvent.click(navigateButton);

      expect(window.history.pushState).toHaveBeenCalled();
    });

    it("handles search queries", async () => {
      const filteredIncidents = [mockIncidents[0]];
      useIncidents.mockReturnValue({
        ...useIncidents(),
        searchQuery: "Security",
        filteredIncidents,
      });

      useSearchParams().get.mockReturnValue("test-incident-1");

      const { default: GalleryPageContent } = jest.requireActual(
        "@/app/gallery/GalleryNavigator"
      );

      render(<GalleryPageContent />);

      expect(screen.queryByTestId("year-2021")).not.toBeInTheDocument();
      expect(screen.queryByTestId("year-2022")).not.toBeInTheDocument();
      expect(screen.getByTestId("year-2020")).toBeInTheDocument();
    });

    it("handles invalid incident dates", async () => {
      const invalidDateIncident = {
        ...mockIncidents[0],
        incident_date: "invalid-date",
      };

      useIncidents.mockReturnValue({
        ...useIncidents(),
        incidents: [invalidDateIncident, ...mockIncidents.slice(1)],
        filteredIncidents: [invalidDateIncident, ...mockIncidents.slice(1)],
      });

      const originalConsoleError = console.error;
      console.error = jest.fn();

      useSearchParams().get.mockReturnValue("test-incident-1");

      const { default: GalleryPageContent } = jest.requireActual(
        "@/app/gallery/GalleryNavigator"
      );

      render(<GalleryPageContent />);

      expect(screen.getByTestId("gallery-display")).toBeInTheDocument();

      console.error = originalConsoleError;
    });
  });

  describe("GalleryNavButtons", () => {
    const mockProps = {
      onPreviousClick: jest.fn(),
      onNextClick: jest.fn(),
      incidentYears: [2020, 2021, 2022],
      currentIncidentYear: 2021,
      onYearClick: jest.fn(),
      incidentCounts: { 2020: 1, 2021: 1, 2022: 2 },
      currentIncidentIndexInYear: 0,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("renders navigation buttons and year timeline", () => {
      render(<GalleryNavButtons {...mockProps} />);

      expect(screen.getByTestId("prev-button")).toBeInTheDocument();
      expect(screen.getByTestId("next-button")).toBeInTheDocument();
      expect(screen.getByTestId("year-2020")).toBeInTheDocument();
      expect(screen.getByTestId("year-2021")).toBeInTheDocument();
      expect(screen.getByTestId("year-2022")).toBeInTheDocument();
    });

    it("calls navigation callbacks when buttons are clicked", async () => {
      render(<GalleryNavButtons {...mockProps} />);

      await userEvent.click(screen.getByTestId("prev-button"));
      expect(mockProps.onPreviousClick).toHaveBeenCalled();

      await userEvent.click(screen.getByTestId("next-button"));
      expect(mockProps.onNextClick).toHaveBeenCalled();
    });

    it("calls onYearClick when a year button is clicked", async () => {
      render(<GalleryNavButtons {...mockProps} />);

      await userEvent.click(screen.getByTestId("year-2020"));

      expect(mockProps.onYearClick).toHaveBeenCalled();
      expect(mockProps.onYearClick).toHaveBeenCalledWith(2020);
    });

    it("highlights the current year", () => {
      render(<GalleryNavButtons {...mockProps} />);

      expect(screen.getByTestId("year-2021")).toHaveAttribute(
        "data-current",
        "true"
      );
      expect(screen.getByTestId("year-2020")).toHaveAttribute(
        "data-current",
        "false"
      );
    });

    it("displays incident count for years with multiple incidents", () => {
      render(<GalleryNavButtons {...mockProps} />);

      expect(screen.getByTestId("year-2022").textContent).toContain("(2)");
    });

    it("shows current incident index for the active year", () => {
      render(<GalleryNavButtons {...mockProps} />);

      const currentIndex = screen.getByTestId("current-index");
      expect(currentIndex.textContent).toBe("1");
    });

    it("handles no incident years", () => {
      render(
        <GalleryNavButtons
          {...mockProps}
          incidentYears={[]}
          incidentCounts={{}}
        />
      );

      expect(screen.queryByTestId("year-2020")).not.toBeInTheDocument();
      expect(screen.getByTestId("prev-button")).toBeInTheDocument();
      expect(screen.getByTestId("next-button")).toBeInTheDocument();
    });

    it("clicking current year cycles through incidents", async () => {
      const onYearClickMock = jest.fn();

      render(
        <GalleryNavButtons
          {...mockProps}
          currentIncidentYear={2022}
          currentIncidentIndexInYear={0}
          onYearClick={onYearClickMock}
        />
      );

      await userEvent.click(screen.getByTestId("year-2022"));

      expect(onYearClickMock).toHaveBeenCalled();
      expect(onYearClickMock).toHaveBeenCalledWith(2022);
    });
  });

  describe("GalleryDisplay", () => {
    it("renders loading skeleton when isLoading is true", () => {
      render(<GalleryDisplay incident={mockIncidents[0]} isLoading={true} />);
      expect(screen.getByTestId("loading-status").textContent).toBe("Loading");
    });

    it("returns null when no incident is provided", () => {
      render(<GalleryDisplay incident={null} isLoading={false} />);
      expect(screen.getByTestId("incident-name").textContent).toBe(
        "No Incident"
      );
    });
  });
});
