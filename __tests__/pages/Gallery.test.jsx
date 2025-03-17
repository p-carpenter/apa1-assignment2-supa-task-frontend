import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, useSearchParams } from "next/navigation";
import GalleryPage from "@/app/gallery/page";
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

jest.mock("@/app/components/layouts/GalleryExhibit", () => {
  return function MockGalleryExhibit({ incident, onClose }) {
    return (
      <div data-testid="gallery-exhibit">
        <h2>{incident?.name || "No Incident"}</h2>
        <button onClick={onClose} data-testid="close-button">
          Close
        </button>
      </div>
    );
  };
});

jest.mock("@/app/components/ui/gallery-navigation/GalleryNavButtons", () => {
  return function MockGalleryNavButtons({
    onPreviousClick,
    onNextClick,
    incidentYears,
    onYearClick,
  }) {
    return (
      <div data-testid="nav-buttons">
        <button onClick={onPreviousClick} data-testid="prev-button">
          Previous
        </button>
        <button onClick={onNextClick} data-testid="next-button">
          Next
        </button>
        {incidentYears &&
          incidentYears.map((year) => (
            <button
              key={year}
              onClick={() => onYearClick(year)}
              data-testid={`year-${year}`}
            >
              {year}
            </button>
          ))}
      </div>
    );
  };
});

jest.mock("@/app/utils/navigation/slugUtils", () => ({
  findIncidentBySlug: jest.fn(),
  generateSlug: jest.fn(),
}));

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
];

describe("Gallery Page", () => {
  beforeEach(() => {
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
      return null;
    });
    slugUtils.generateSlug.mockImplementation((name) => {
      return name.toLowerCase().replace(/\s+/g, "-");
    });

    useTheme.mockReturnValue({
      theme: "default",
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
  });

  test("initializes correctly without a slug parameter", async () => {
    useSearchParams().get.mockReturnValue(null);

    render(<GalleryPage />);

    await waitFor(() => {
      expect(window.history.replaceState).toHaveBeenCalledWith(
        { path: `/gallery?incident=test-incident-1` },
        "",
        `/gallery?incident=test-incident-1`
      );
    });
  });

  test("loads correct incident when slug is provided in URL", async () => {
    useSearchParams().get.mockReturnValue("test-incident-2");

    const setDisplayedIncidentMock = jest.fn();
    useIncidents.mockReturnValue({
      ...useIncidents(),
      setDisplayedIncident: setDisplayedIncidentMock,
    });

    render(<GalleryPage />);

    await waitFor(() => {
      expect(setDisplayedIncidentMock).toHaveBeenCalledWith(mockIncidents[1]);
    });
  });

  test("handles incident year navigation", async () => {
    const incidentsByYear = {
      2020: [mockIncidents[0]],
      2021: [mockIncidents[1]],
      2022: [mockIncidents[2]],
    };

    const setDisplayedIncidentMock = jest.fn();
    useIncidents.mockReturnValue({
      incidents: mockIncidents,
      filteredIncidents: mockIncidents,
      setDisplayedIncident: setDisplayedIncidentMock,
      setCurrentIncidentIndex: jest.fn(),
      currentDecade: null,
      setCurrentDecade: jest.fn(),
      activeFilter: null,
      searchQuery: "",
      displayedIncident: mockIncidents[0],
      isLoading: false,
    });

    useSearchParams().get.mockReturnValue("test-incident-1");

    render(<GalleryPage />);

    const yearButton = screen.getByTestId("year-2022");

    await userEvent.click(yearButton);

    expect(window.history.pushState).toHaveBeenCalled();

    expect(setDisplayedIncidentMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "3" })
    );
  });

  test("handles navigation to next incident", async () => {
    useSearchParams().get.mockReturnValue("test-incident-1");

    render(<GalleryPage />);

    const nextButton = screen.getByTestId("next-button");
    await userEvent.click(nextButton);

    expect(window.history.pushState).toHaveBeenCalled();
  });

  test("handles navigation to previous incident", async () => {
    useSearchParams().get.mockReturnValue("test-incident-2");

    render(<GalleryPage />);

    const prevButton = screen.getByTestId("prev-button");
    await userEvent.click(prevButton);

    expect(window.history.pushState).toHaveBeenCalled();
  });

  test("redirects to catalog when close button is clicked", async () => {
    const pushMock = jest.fn();
    useRouter.mockReturnValue({
      push: pushMock,
    });

    render(<GalleryPage />);

    const closeButton = screen.getByTestId("close-button");
    await userEvent.click(closeButton);

    expect(pushMock).toHaveBeenCalledWith("/catalog?reset=true");
  });

  test("sets decade based on incident date", async () => {
    useSearchParams().get.mockReturnValue("test-incident-1");

    const setCurrentDecadeMock = jest.fn();
    useIncidents.mockReturnValue({
      ...useIncidents(),
      setCurrentDecade: setCurrentDecadeMock,
      displayedIncident: mockIncidents[0],
    });

    render(<GalleryPage />);

    await waitFor(() => {
      expect(setCurrentDecadeMock).toHaveBeenCalledWith(2020);
    });
  });
});
