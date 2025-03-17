import { server } from "../../app/utils/testing/test-utils";
import { GET } from "@/app/api/fetch-incidents/route";
import { http, HttpResponse } from "msw";

process.env.SUPABASE_URL = "https://test-supabase-url.com";
process.env.SUPABASE_ANON_KEY = "test-anon-key";

describe("fetch-incidents API route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("successfully fetches incidents", async () => {
    const mockIncidents = [
      { id: "1", name: "Y2K Bug", category: "software" },
      { id: "2", name: "Morris Worm", category: "security" },
    ];

    server.use(
      http.get(
        "https://test-supabase-url.com/functions/v1/tech-incidents",
        () => {
          return HttpResponse.json({
            incidents: mockIncidents,
            success: true,
          });
        }
      )
    );

    const mockRequest = {
      method: "GET",
    };

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.incidents).toEqual(mockIncidents);
  });

  it("handles errors from Supabase", async () => {
    server.use(
      http.get(
        "https://test-supabase-url.com/functions/v1/tech-incidents",
        () => {
          return new HttpResponse(JSON.stringify({ error: "Database error" }), {
            status: 500,
          });
        }
      )
    );

    const mockRequest = {
      method: "GET",
    };

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain("Supabase error");
  });

  it("handles network errors", async () => {
    server.use(
      http.get(
        "https://test-supabase-url.com/functions/v1/tech-incidents",
        () => {
          return HttpResponse.error();
        }
      )
    );

    const mockRequest = {
      method: "GET",
    };

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain("Failed to fetch");
  });
});
