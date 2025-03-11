import { fetchIncidents } from "@/app/utils/api/fetch-incidents";

// Mock fetch
global.fetch = jest.fn();

describe("Tech Incidents API", () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  it("fetches incidents successfully", async () => {
    const mockIncidents = [
      { id: "1", name: "Y2K Bug", category: "software" },
      { id: "2", name: "Morris Worm", category: "security" }
    ];

    // Set up the mock response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ incidents: mockIncidents, success: true })
    });

    const result = await fetchIncidents();
    
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ incidents: mockIncidents, success: true });
  });

  it("handles fetch errors", async () => {
    // Mock a network error
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await fetchIncidents();
    
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ 
      success: false, 
      error: "Failed to fetch incidents: Network error" 
    });
  });
});
