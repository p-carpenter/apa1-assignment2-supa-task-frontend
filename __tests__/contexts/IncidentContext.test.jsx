import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { IncidentProvider, useIncidents } from "@/app/contexts/IncidentContext";
import "jest-extended";
import { server } from "@/app/utils/testing/test-utils";
import { HttpResponse, http } from "msw";

process.env.SUPABASE_URL = "https://test-supabase-url.com";
process.env.SUPABASE_ANON_KEY = "test-anon-key";

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

const TestComponent = () => {
  const {
    incidents,
    isLoading,
    error,
    selectedIncidents,
    setSelectedIncidents,
    displayedIncident,
    setDisplayedIncident,
    currentIncidentIndex,
    setCurrentIncidentIndex,
    currentDecade,
    setCurrentDecade,
    currentYear,
    setCurrentYear,
    incidentsByDecade,
    handleIncidentNavigation,
    navigateToRoot,
    fetchIncidents,
  } = useIncidents();

  // Handle null incidents gracefully
  const incidentsLength = Array.isArray(incidents) ? incidents.length : 0;
  const selectedLength = Array.isArray(selectedIncidents)
    ? selectedIncidents.length
    : 0;

  return (
    <div>
      <div data-testid="incidents-count">{incidentsLength}</div>
      <div data-testid="selected-count">{selectedLength}</div>
      <div data-testid="current-decade">{currentDecade || "none"}</div>
      <div data-testid="current-year">{currentYear || "none"}</div>
      <div data-testid="current-index">{currentIncidentIndex}</div>
      <div data-testid="displayed-name">
        {displayedIncident?.name || "none"}
      </div>
      <div data-testid="loading-state">{isLoading ? "loading" : "loaded"}</div>
      <div data-testid="error-state">{error || "none"}</div>

      <div data-testid="decades-list">
        {Object.keys(incidentsByDecade).join(",")}
      </div>

      <button
        data-testid="select-incident"
        onClick={() =>
          incidents &&
          incidents.length > 0 &&
          setSelectedIncidents([incidents[0]])
        }
      >
        Select First Incident
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

      <button data-testid="navigate-root" onClick={navigateToRoot}>
        Navigate to Root
      </button>

      <button
        data-testid="set-displayed"
        onClick={() =>
          incidents &&
          incidents.length > 2 &&
          setDisplayedIncident(incidents[2])
        }
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

      <button data-testid="fetch-incidents" onClick={fetchIncidents}>
        Fetch Incidents
      </button>

      <ul data-testid="incident-list">
        {Array.isArray(incidents) &&
          incidents.map((incident, index) => (
            <li key={incident.id || `incident-${index}`}>{incident.name}</li>
          ))}
      </ul>
    </div>
  );
};

describe("IncidentContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset sessionStorage mock before each test
    jest
      .spyOn(window.sessionStorage.__proto__, "getItem")
      .mockImplementation(() => null);
    jest
      .spyOn(window.sessionStorage.__proto__, "setItem")
      .mockImplementation(() => {});

    // Reset MSW server handlers
    server.use(
      http.get("/api/fetch-incidents", () => {
        return HttpResponse.json({
          data: mockIncidents,
        });
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Initialization", () => {
    it("provides initial state values with passed incidents", async () => {
      render(
        <IncidentProvider incidents={mockIncidents}>
          <TestComponent />
        </IncidentProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      expect(screen.getByTestId("incidents-count")).toHaveTextContent("5");
      expect(screen.getByTestId("selected-count")).toHaveTextContent("0");
      expect(screen.getByTestId("current-decade")).toHaveTextContent("none");
      expect(screen.getByTestId("current-year")).toHaveTextContent("none");
      expect(screen.getByTestId("current-index")).toHaveTextContent("0");
      expect(screen.getByTestId("displayed-name")).toHaveTextContent("none");
    });

    it("correctly organizes incidents by decade", async () => {
      render(
        <IncidentProvider incidents={mockIncidents}>
          <TestComponent />
        </IncidentProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      expect(screen.getByTestId("decades-list")).toHaveTextContent(
        "1980,1990,2000,2010,2020"
      );
    });

    it("loads incidents from session storage when API fails to fetch", async () => {
      const sessionStorageData = [
        {
          id: "session-1",
          name: "Session Incident",
          incident_date: "2020-05-01T00:00:00.000Z",
        },
      ];

      server.use(
        http.get("/api/fetch-incidents", () => {
          return new HttpResponse(JSON.stringify({ data: [] }), {
            status: 500,
          });
        })
      );

      jest
        .spyOn(window.sessionStorage.__proto__, "getItem")
        .mockImplementation((key) => {
          if (key === "incidents") {
            return JSON.stringify(sessionStorageData);
          }
          return null;
        });

      render(
        <IncidentProvider incidents={[]}>
          <TestComponent />
        </IncidentProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      // Verify the session storage data is displayed
      expect(screen.getByTestId("incidents-count")).toHaveTextContent("1");
      expect(screen.getByTestId("incident-list")).toHaveTextContent(
        "Session Incident"
      );
    });

    it("handles empty initial incidents gracefully", async () => {
      server.use(
        http.get("/api/fetch-incidents", () => {
          return new HttpResponse(JSON.stringify({ data: [] }), {
            status: 200,
          });
        })
      );

      jest
        .spyOn(window.sessionStorage.__proto__, "getItem")
        .mockReturnValue(null);

      render(
        <IncidentProvider incidents={[]}>
          <TestComponent />
        </IncidentProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      expect(screen.getByTestId("incidents-count")).toHaveTextContent("0");
    });

    it("handles invalid session storage data", async () => {
      server.use(
        http.get("/api/fetch-incidents", () => {
          return HttpResponse.json({
            data: [],
          });
        })
      );

      const getItemSpy = jest.spyOn(window.sessionStorage.__proto__, "getItem");
      getItemSpy.mockImplementation(() => "invalid-json");

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <IncidentProvider incidents={[]}>
          <TestComponent />
        </IncidentProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      // Should handle gracefully and not crash
      expect(screen.getByTestId("incidents-count")).toHaveTextContent("0");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error parsing session storage data:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Selection State", () => {
    it("selects an incident correctly", async () => {
      render(
        <IncidentProvider incidents={mockIncidents}>
          <TestComponent />
        </IncidentProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      fireEvent.click(screen.getByTestId("select-incident"));

      expect(screen.getByTestId("selected-count")).toHaveTextContent("1");
    });

    it("sets displayed incident correctly", async () => {
      render(
        <IncidentProvider incidents={mockIncidents}>
          <TestComponent />
        </IncidentProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      fireEvent.click(screen.getByTestId("set-displayed"));

      expect(screen.getByTestId("displayed-name")).toHaveTextContent(
        "Windows Vista Launch"
      );
    });

    it("sets current incident index correctly", async () => {
      render(
        <IncidentProvider incidents={mockIncidents}>
          <TestComponent />
        </IncidentProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      fireEvent.click(screen.getByTestId("set-index"));

      expect(screen.getByTestId("current-index")).toHaveTextContent("2");
    });
  });

  describe("Navigation", () => {
    it("navigates to next incident correctly", async () => {
      render(
        <IncidentProvider incidents={mockIncidents}>
          <TestComponent />
        </IncidentProvider>
      );

      // Wait for initialization to complete
      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      // First, navigate to a specific incident
      fireEvent.click(screen.getByTestId("set-index"));
      expect(screen.getByTestId("current-index")).toHaveTextContent("2");

      // Then navigate to next incident
      fireEvent.click(screen.getByTestId("navigate-next"));

      expect(screen.getByTestId("current-index")).toHaveTextContent("3");
      expect(screen.getByTestId("displayed-name")).toHaveTextContent(
        "Facebook Data Breach"
      );
    });

    it("navigates to previous incident correctly", async () => {
      render(
        <IncidentProvider incidents={mockIncidents}>
          <TestComponent />
        </IncidentProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      fireEvent.click(screen.getByTestId("set-index"));
      expect(screen.getByTestId("current-index")).toHaveTextContent("2");

      fireEvent.click(screen.getByTestId("navigate-prev"));

      expect(screen.getByTestId("current-index")).toHaveTextContent("1");
      expect(screen.getByTestId("displayed-name")).toHaveTextContent(
        "Morris Worm"
      );
    });

    it("handles navigation beyond limits gracefully", async () => {
      // Mock console.warn to prevent test logs from getting cluttered
      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      render(
        <IncidentProvider incidents={mockIncidents}>
          <TestComponent />
        </IncidentProvider>
      );

      // Wait for initialization to complete
      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      // Try to navigate before first incident
      fireEvent.click(screen.getByTestId("navigate-prev"));

      // Should not change and should warn
      expect(screen.getByTestId("current-index")).toHaveTextContent("0");
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockClear();

      // Navigate to the last incident
      for (let i = 0; i < mockIncidents.length - 1; i++) {
        fireEvent.click(screen.getByTestId("navigate-next"));
      }

      // Try to navigate past the last incident
      fireEvent.click(screen.getByTestId("navigate-next"));

      // Should not change and should warn
      expect(screen.getByTestId("current-index")).toHaveTextContent("4");
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it("navigates to root correctly", async () => {
      render(
        <IncidentProvider incidents={mockIncidents}>
          <TestComponent />
        </IncidentProvider>
      );

      // Wait for initialization to complete
      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      // Set up some state first
      fireEvent.click(screen.getByTestId("set-decade"));
      fireEvent.click(screen.getByTestId("set-year"));
      fireEvent.click(screen.getByTestId("select-incident"));

      // Verify state was set
      expect(screen.getByTestId("current-decade")).toHaveTextContent("1980");
      expect(screen.getByTestId("current-year")).toHaveTextContent("1988");
      expect(screen.getByTestId("selected-count")).toHaveTextContent("1");

      // Navigate to root
      fireEvent.click(screen.getByTestId("navigate-root"));

      // All state should be reset
      expect(screen.getByTestId("current-decade")).toHaveTextContent("none");
      expect(screen.getByTestId("current-year")).toHaveTextContent("none");
      expect(screen.getByTestId("selected-count")).toHaveTextContent("0");
    });

    it("sets decade and year correctly", async () => {
      render(
        <IncidentProvider incidents={mockIncidents}>
          <TestComponent />
        </IncidentProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      fireEvent.click(screen.getByTestId("set-decade"));
      expect(screen.getByTestId("current-decade")).toHaveTextContent("1980");

      fireEvent.click(screen.getByTestId("set-year"));
      expect(screen.getByTestId("current-year")).toHaveTextContent("1988");
    });

    it("updates decade automatically during incident navigation", async () => {
      render(
        <IncidentProvider incidents={mockIncidents}>
          <TestComponent />
        </IncidentProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      fireEvent.click(screen.getByTestId("navigate-next"));

      expect(screen.getByTestId("current-decade")).toHaveTextContent("1980");

      fireEvent.click(screen.getByTestId("navigate-prev"));

      expect(screen.getByTestId("current-decade")).toHaveTextContent("1990");
    });
  });

  describe("API and Error Handling", () => {
    it("throws error when hook is used outside provider", () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const BadComponent = () => {
        let errorMessage = "";
        try {
          useIncidents();
        } catch (error) {
          errorMessage = error.message;
        }
        return <div data-testid="error-message">{errorMessage}</div>;
      };

      render(<BadComponent />);

      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "useIncidents must be used within an IncidentProvider"
      );

      consoleErrorSpy.mockRestore();
    });

    it("fetches incidents successfully", async () => {
      server.use(
        http.get("/api/fetch-incidents", () => {
          return HttpResponse.json({
            data: [
              {
                id: "api-1",
                name: "API Incident",
                incident_date: "2023-01-01T00:00:00.000Z",
              },
            ],
          });
        })
      );

      render(
        <IncidentProvider incidents={[]}>
          <TestComponent />
        </IncidentProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      expect(screen.getByTestId("incidents-count")).toHaveTextContent("1");
      expect(screen.getByTestId("incident-list")).toHaveTextContent(
        "API Incident"
      );
    });

    it("tests api changes are saved to session storage", async () => {
      const apiData = [
        {
          id: "api-1",
          name: "API Incident",
          incident_date: "2023-01-01T00:00:00.000Z",
        },
      ];

      server.use(
        http.get("/api/fetch-incidents", () => {
          return HttpResponse.json({ data: apiData });
        })
      );

      const setItemSpy = jest.spyOn(window.sessionStorage.__proto__, "setItem");

      render(
        <IncidentProvider incidents={[]}>
          <TestComponent />
        </IncidentProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      expect(setItemSpy).toHaveBeenCalled();

      // Extract arguments of the call for better verification
      const calls = setItemSpy.mock.calls;
      const hasIncidentsSave = calls.some(
        (call) =>
          call[0] === "incidents" &&
          call[1] !== undefined &&
          call[1].includes("API Incident")
      );
      expect(hasIncidentsSave).toBe(true);
    });

    it("handles API error correctly", async () => {
      server.use(
        http.get("/api/fetch-incidents", () => {
          return HttpResponse.json({ error: "Server error" }, { status: 500 });
        })
      );

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <IncidentProvider incidents={[]}>
          <TestComponent />
        </IncidentProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("prioritizes API data over session storage", async () => {
      const sessionData = [
        {
          id: "session-1",
          name: "Session Incident",
          incident_date: "2020-01-01T00:00:00.000Z",
        },
      ];
      jest
        .spyOn(window.sessionStorage.__proto__, "getItem")
        .mockImplementation(() => JSON.stringify(sessionData));

      const apiData = [
        {
          id: "api-1",
          name: "API Incident",
          incident_date: "2023-01-01T00:00:00.000Z",
        },
      ];
      server.use(
        http.get("/api/fetch-incidents", () => {
          return HttpResponse.json({ data: apiData });
        })
      );

      render(
        <IncidentProvider incidents={[]}>
          <TestComponent />
        </IncidentProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      expect(screen.getByTestId("incident-list")).toHaveTextContent(
        "API Incident"
      );
      expect(screen.getByTestId("incident-list")).not.toHaveTextContent(
        "Session Incident"
      );
    });

    it("handles malformed API response correctly", async () => {
      server.use(
        http.get("/api/fetch-incidents", () => {
          return HttpResponse.json({
            data: "not an array",
          });
        })
      );

      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      render(
        <IncidentProvider incidents={[]}>
          <TestComponent />
        </IncidentProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "No incidents found in API response."
      );

      consoleWarnSpy.mockRestore();
    });

    it("catches session storage quota errors gracefully", async () => {
      server.use(
        http.get("/api/fetch-incidents", () => {
          return HttpResponse.json({
            data: mockIncidents,
          });
        })
      );

      const setItemSpy = jest
        .spyOn(window.sessionStorage.__proto__, "setItem")
        .mockImplementation(() => {
          throw new Error("QuotaExceededError");
        });

      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      render(
        <IncidentProvider incidents={[]}>
          <TestComponent />
        </IncidentProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      expect(consoleWarnSpy).toHaveBeenCalled();
      const warningCall = consoleWarnSpy.mock.calls.find(
        (call) => call[0] === "Failed to save incidents to session storage:"
      );
      expect(warningCall).toBeDefined();

      consoleWarnSpy.mockRestore();
    });
  });

  // Edge cases
  describe("Edge Cases", () => {
    it("handles incidents with invalid dates appropriately", async () => {
      const incidentsWithInvalidDates = [
        {
          id: "1",
          name: "Invalid Date Incident",
          incident_date: "not-a-date",
        },
      ];

      // Override the server mock for this test only to ensure we're using our test data
      server.use(
        http.get("/api/fetch-incidents", () => {
          return new HttpResponse(JSON.stringify({ data: [] }), {
            status: 500,
          });
        })
      );

      // Mock console.error to catch errors
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <IncidentProvider incidents={incidentsWithInvalidDates}>
          <TestComponent />
        </IncidentProvider>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      // Should still display the incident correctly
      expect(screen.getByTestId("incidents-count")).toHaveTextContent("1");

      // Try to navigate to the incident with invalid date
      fireEvent.click(screen.getByTestId("navigate-next"));

      // Should log error about invalid date
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("handles navigation with empty incidents array", async () => {
      // Set up with empty array
      server.use(
        http.get("/api/fetch-incidents", () => {
          return HttpResponse.json({ data: [] });
        })
      );

      // Mock console.warn to capture warning
      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      render(
        <IncidentProvider>
          <TestComponent />
        </IncidentProvider>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      // Try to navigate with empty array
      fireEvent.click(screen.getByTestId("navigate-next"));

      // Should warn but not crash
      expect(consoleWarnSpy).toHaveBeenCalled();
      const emptyWarning = consoleWarnSpy.mock.calls.find(
        (call) =>
          typeof call[0] === "string" && call[0].includes("empty or invalid")
      );
      expect(emptyWarning).toBeDefined();

      consoleWarnSpy.mockRestore();
    });

    it("calculates decades correctly from various years", async () => {
      const mixedDecadesIncidents = [
        { id: "1", name: "Y2K", incident_date: "2000-01-01T00:00:00.000Z" },
        { id: "2", name: "80s", incident_date: "1985-01-01T00:00:00.000Z" },
        { id: "3", name: "90s", incident_date: "1999-12-31T00:00:00.000Z" },
        { id: "4", name: "2010s", incident_date: "2019-01-01T00:00:00.000Z" },
      ];

      render(
        <IncidentProvider incidents={mixedDecadesIncidents}>
          <TestComponent />
        </IncidentProvider>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toHaveTextContent("loaded");
      });

      // Should have all the correct decades
      expect(screen.getByTestId("decades-list")).toHaveTextContent(
        "1980,1990,2000,2010"
      );
    });
  });
});
