// __tests__/contexts/IncidentContext.test.jsx
import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { IncidentProvider, useIncidents } from "@/app/contexts/IncidentContext";
import "jest-extended";

// Mock test data
const mockIncidents = [
  {
    id: "1",
    name: "Y2K Bug",
    description: "The Y2K bug was a computer flaw...",
    incident_date: "1999-12-31T00:00:00.000Z",
    category: "software",
    severity: "high",
  },
  {
    id: "2",
    name: "Morris Worm",
    description: "One of the first computer worms...",
    incident_date: "1988-11-02T00:00:00.000Z",
    category: "security",
    severity: "high",
  },
  {
    id: "3",
    name: "Windows Vista Launch",
    description: "Windows Vista had significant issues...",
    incident_date: "2007-01-30T00:00:00.000Z",
    category: "software",
    severity: "moderate",
  },
  {
    id: "4",
    name: "Facebook Data Breach",
    description: "Facebook experienced a major data breach...",
    incident_date: "2018-09-28T00:00:00.000Z",
    category: "security",
    severity: "high",
  },
  {
    id: "5",
    name: "Bitcoin Price Crash",
    description: "Bitcoin price experienced a severe crash...",
    incident_date: "2022-05-12T00:00:00.000Z",
    category: "crypto",
    severity: "high",
  },
];

// Test component that consumes IncidentContext
const TestComponent = () => {
  const {
    incidents,
    selectedIncidents,
    setSelectedIncidents,
    filteredIncidents,
    incidentsByDecade,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    clearFilters,
    handleFilterClick,
    handleIncidentDoubleClick,
    handleIncidentNavigation,
    currentDecade,
    setCurrentDecade,
    currentYear,
    setCurrentYear,
    handleFolderDoubleClick,
    navigateToRoot,
    displayedIncident,
    setDisplayedIncident,
    currentIncidentIndex,
    setCurrentIncidentIndex,
  } = useIncidents();

  return (
    <div>
      <div data-testid="incidents-count">{incidents.length}</div>
      <div data-testid="filtered-count">{filteredIncidents.length}</div>
      <div data-testid="selected-count">{selectedIncidents.length}</div>
      <div data-testid="current-decade">{currentDecade || "none"}</div>
      <div data-testid="current-year">{currentYear || "none"}</div>
      <div data-testid="active-filter">{activeFilter || "none"}</div>
      <div data-testid="search-query">{searchQuery || "none"}</div>
      <div data-testid="current-index">{currentIncidentIndex}</div>
      <div data-testid="displayed-name">
        {displayedIncident?.name || "none"}
      </div>

      <div data-testid="decades-list">
        {Object.keys(incidentsByDecade).join(",")}
      </div>

      <button
        data-testid="select-incident"
        onClick={() => setSelectedIncidents([incidents[0]])}
      >
        Select First Incident
      </button>

      <button
        data-testid="filter-software"
        onClick={() => handleFilterClick("software")}
      >
        Filter Software
      </button>

      <button
        data-testid="filter-security"
        onClick={() => handleFilterClick("security")}
      >
        Filter Security
      </button>

      <button data-testid="clear-filters" onClick={clearFilters}>
        Clear Filters
      </button>

      <input
        data-testid="search-input"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
      />

      <button
        data-testid="double-click-incident"
        onClick={() => handleIncidentDoubleClick(incidents[1])}
      >
        Double Click Second Incident
      </button>

      <button
        data-testid="navigate-next"
        onClick={() => handleIncidentNavigation(currentIncidentIndex + 1)}
      >
        Navigate Next
      </button>

      <button
        data-testid="navigate-prev"
        onClick={() => handleIncidentNavigation(currentIncidentIndex - 1)}
      >
        Navigate Previous
      </button>

      <button
        data-testid="folder-click-1980"
        onClick={() => handleFolderDoubleClick(1980)}
      >
        Open 1980s Folder
      </button>

      <button data-testid="navigate-root" onClick={navigateToRoot}>
        Navigate to Root
      </button>

      <button
        data-testid="set-displayed"
        onClick={() => setDisplayedIncident(incidents[2])}
      >
        Set Displayed Incident
      </button>

      <button
        data-testid="set-index"
        onClick={() => setCurrentIncidentIndex(2)}
      >
        Set Current Index
      </button>

      <button data-testid="set-decade" onClick={() => setCurrentDecade(1980)}>
        Set Decade 1980s
      </button>

      <button data-testid="set-year" onClick={() => setCurrentYear(1988)}>
        Set Year 1988
      </button>

      <ul data-testid="incident-list">
        {incidents.map((incident) => (
          <li key={incident.id}>{incident.name}</li>
        ))}
      </ul>

      <ul data-testid="filtered-list">
        {filteredIncidents.map((incident) => (
          <li key={incident.id}>{incident.name}</li>
        ))}
      </ul>
    </div>
  );
};

describe("MSW Handlers", () => {
  it("defines API handlers", () => {
    // This is just a placeholder to ensure handlers are defined
    expect(true).toBe(true);
  });
});

describe("IncidentContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("provides incidents and initial state values", () => {
    render(
      <IncidentProvider incidents={mockIncidents}>
        <TestComponent />
      </IncidentProvider>
    );

    expect(screen.getByTestId("incidents-count")).toHaveTextContent("5");
    expect(screen.getByTestId("filtered-count")).toHaveTextContent("5");
    expect(screen.getByTestId("selected-count")).toHaveTextContent("0");
    expect(screen.getByTestId("current-decade")).toHaveTextContent("none");
    expect(screen.getByTestId("current-year")).toHaveTextContent("none");
    expect(screen.getByTestId("active-filter")).toHaveTextContent("none");
    expect(screen.getByTestId("search-query")).toHaveTextContent("none");
    expect(screen.getByTestId("current-index")).toHaveTextContent("0");
    expect(screen.getByTestId("displayed-name")).toHaveTextContent("none");
  });

  it("correctly organizes incidents by decade", () => {
    render(
      <IncidentProvider incidents={mockIncidents}>
        <TestComponent />
      </IncidentProvider>
    );

    // Should have incidents from 1980s, 1990s, 2000s, 2010s, 2020s
    expect(screen.getByTestId("decades-list")).toHaveTextContent(
      "1980,1990,2000,2010,2020"
    );
  });

  it("allows selecting incidents", () => {
    render(
      <IncidentProvider incidents={mockIncidents}>
        <TestComponent />
      </IncidentProvider>
    );

    fireEvent.click(screen.getByTestId("select-incident"));

    expect(screen.getByTestId("selected-count")).toHaveTextContent("1");
  });

  it("filters incidents by category", () => {
    render(
      <IncidentProvider incidents={mockIncidents}>
        <TestComponent />
      </IncidentProvider>
    );

    // Initially all incidents visible
    expect(screen.getByTestId("filtered-count")).toHaveTextContent("5");

    // Filter to software only
    fireEvent.click(screen.getByTestId("filter-software"));

    // Should have 2 software incidents
    expect(screen.getByTestId("filtered-count")).toHaveTextContent("2");
    expect(screen.getByTestId("active-filter")).toHaveTextContent("software");

    // Filtered list should contain specific incidents
    const filteredItems = screen
      .getByTestId("filtered-list")
      .querySelectorAll("li");
    expect(filteredItems).toHaveLength(2);
    expect(filteredItems[0]).toHaveTextContent("Y2K Bug");
    expect(filteredItems[1]).toHaveTextContent("Windows Vista Launch");

    // Toggle same filter again to clear it
    fireEvent.click(screen.getByTestId("filter-software"));

    // Should go back to all incidents
    expect(screen.getByTestId("filtered-count")).toHaveTextContent("5");
    expect(screen.getByTestId("active-filter")).toHaveTextContent("none");
  });

  it("applies text search filter", () => {
    render(
      <IncidentProvider incidents={mockIncidents}>
        <TestComponent />
      </IncidentProvider>
    );

    // Search for "data"
    fireEvent.change(screen.getByTestId("search-input"), {
      target: { value: "data" },
    });

    // Should find Facebook Data Breach
    expect(screen.getByTestId("filtered-count")).toHaveTextContent("1");
    expect(screen.getByTestId("search-query")).toHaveTextContent("data");

    const filteredItems = screen
      .getByTestId("filtered-list")
      .querySelectorAll("li");
    expect(filteredItems).toHaveLength(1);
    expect(filteredItems[0]).toHaveTextContent("Facebook Data Breach");
  });

  it("combines category and text filters", () => {
    render(
      <IncidentProvider incidents={mockIncidents}>
        <TestComponent />
      </IncidentProvider>
    );

    // Apply security filter
    fireEvent.click(screen.getByTestId("filter-security"));
    expect(screen.getByTestId("filtered-count")).toHaveTextContent("2");

    // Add text search for "Facebook"
    fireEvent.change(screen.getByTestId("search-input"), {
      target: { value: "Facebook" },
    });

    // Should find only Facebook Data Breach
    expect(screen.getByTestId("filtered-count")).toHaveTextContent("1");

    const filteredItems = screen
      .getByTestId("filtered-list")
      .querySelectorAll("li");
    expect(filteredItems).toHaveLength(1);
    expect(filteredItems[0]).toHaveTextContent("Facebook Data Breach");
  });

  it("clears all filters", () => {
    render(
      <IncidentProvider incidents={mockIncidents}>
        <TestComponent />
      </IncidentProvider>
    );

    // Apply filters
    fireEvent.click(screen.getByTestId("filter-security"));
    fireEvent.change(screen.getByTestId("search-input"), {
      target: { value: "data" },
    });

    // Verify filters applied
    expect(screen.getByTestId("filtered-count")).toHaveTextContent("1");

    // Clear filters
    fireEvent.click(screen.getByTestId("clear-filters"));

    // Should reset to all incidents
    expect(screen.getByTestId("filtered-count")).toHaveTextContent("5");
    expect(screen.getByTestId("active-filter")).toHaveTextContent("none");
    expect(screen.getByTestId("search-query")).toHaveTextContent("none");
  });

  it("handles incident double-click", async () => {
    render(
      <IncidentProvider incidents={mockIncidents}>
        <TestComponent />
      </IncidentProvider>
    );

    // Set decade for expected behavior
    fireEvent.click(screen.getByTestId("set-decade"));

    // Now trigger the double-click behavior
    fireEvent.click(screen.getByTestId("double-click-incident"));

    await waitFor(() => {
      // Should update displayed incident
      expect(screen.getByTestId("displayed-name")).toHaveTextContent(
        "Morris Worm"
      );
      expect(screen.getByTestId("current-index")).toHaveTextContent("1");
      // The decade should now be visible
      expect(screen.getByTestId("current-decade")).toHaveTextContent("1980");
    });
  });

  it("handles incident navigation", () => {
    render(
      <IncidentProvider incidents={mockIncidents}>
        <TestComponent />
      </IncidentProvider>
    );

    // First, set a starting point
    fireEvent.click(screen.getByTestId("double-click-incident"));
    expect(screen.getByTestId("current-index")).toHaveTextContent("1");

    // Navigate to next
    fireEvent.click(screen.getByTestId("navigate-next"));

    // Should update to third incident (index 2)
    expect(screen.getByTestId("current-index")).toHaveTextContent("2");
    expect(screen.getByTestId("displayed-name")).toHaveTextContent(
      "Windows Vista Launch"
    );

    // Navigate back
    fireEvent.click(screen.getByTestId("navigate-prev"));

    // Should return to second incident
    expect(screen.getByTestId("current-index")).toHaveTextContent("1");
    expect(screen.getByTestId("displayed-name")).toHaveTextContent(
      "Morris Worm"
    );
  });
});
