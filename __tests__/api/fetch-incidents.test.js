import { server } from "../../app/utils/testing/test-utils";
import { GET, OPTIONS } from "@/app/api/fetch-incidents/route";
import { http, HttpResponse } from "msw";

process.env.SUPABASE_URL = "https://test-supabase-url.com";
process.env.SUPABASE_ANON_KEY = "test-anon-key";

describe("fetch-incidents API route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test OPTIONS method
  it("responds correctly to OPTIONS request", async () => {
    const response = await OPTIONS();
    
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeDefined();
    expect(response.headers.get("Access-Control-Allow-Methods")).toBeDefined();
    expect(response.headers.get("Access-Control-Allow-Headers")).toBeDefined();
  });

  // Basic successful cases
  it("successfully fetches incidents as array", async () => {
    const mockIncidents = [
      { id: "1", name: "Y2K Bug", category: "software" },
      { id: "2", name: "Morris Worm", category: "security" },
    ];

    server.use(
      http.get(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json(mockIncidents);
        }
      )
    );

    const mockRequest = { method: "GET" };
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual(mockIncidents);
    expect(data.timestamp).toBeDefined();
  });

  it("handles empty array response", async () => {
    server.use(
      http.get(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json([]);
        }
      )
    );

    const mockRequest = { method: "GET" };
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
  });

  // Edge case: non-array response
  it("handles non-array response from Supabase with 200 status", async () => {
    server.use(
      http.get(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json({ 
            message: "This is not an array response"
          });
        }
      )
    );

    const mockRequest = { method: "GET" };
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
    expect(data.warning).toContain("Invalid response format");
  });

  it("handles null response from Supabase with 200 status", async () => {
    server.use(
      http.get(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json(null);
        }
      )
    );

    const mockRequest = { method: "GET" };
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
    expect(data.warning).toBeDefined();
  });

  // Error handling
  it("handles HTTP errors from Supabase", async () => {
    server.use(
      http.get(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json(
            { error: "Database error" },
            { status: 500 }
          );
        }
      )
    );

    const mockRequest = { method: "GET" };
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBeDefined();
    expect(data.type).toBeDefined();
  });

  it("handles unauthorized errors (401) from Supabase", async () => {
    server.use(
      http.get(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
          );
        }
      )
    );

    const mockRequest = { method: "GET" };
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBeDefined();
    expect(data.type).toBeDefined();
  });

  it("handles forbidden errors (403) from Supabase", async () => {
    server.use(
      http.get(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json(
            { error: "Forbidden" },
            { status: 403 }
          );
        }
      )
    );

    const mockRequest = { method: "GET" };
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.message).toBeDefined();
    expect(data.type).toBeDefined();
  });

  it("handles not found errors (404) from Supabase", async () => {
    server.use(
      http.get(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json(
            { error: "Not found" },
            { status: 404 }
          );
        }
      )
    );

    const mockRequest = { method: "GET" };
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBeDefined();
    expect(data.type).toBeDefined();
  });

  it("handles network errors", async () => {
    server.use(
      http.get(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.error();
        }
      )
    );

    const mockRequest = { method: "GET" };
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBeDefined();
    expect(data.type).toBeDefined();
  });

  // Request error test
  it("handles request errors", async () => {
    // Mock a fetch implementation that throws an error
    server.use(
      http.get(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          throw new Error("Request failed");
        }
      )
    );

    const mockRequest = { method: "GET" };
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBeDefined();
    expect(data.type).toBeDefined();
  });
  
  // Response structure tests
  it("includes timestamp in successful responses", async () => {
    server.use(
      http.get(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json([{ id: "1", name: "Test Incident" }]);
        }
      )
    );

    const mockRequest = { method: "GET" };
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.timestamp).toBeDefined();
    expect(new Date(data.timestamp)).toBeInstanceOf(Date);
  });

  it("includes timestamp in error responses", async () => {
    server.use(
      http.get(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json(
            { error: "Server error" },
            { status: 500 }
          );
        }
      )
    );

    const mockRequest = { method: "GET" };
    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.timestamp).toBeDefined();
    expect(new Date(data.timestamp)).toBeInstanceOf(Date);
  });

  // CORS Headers tests
  it("includes CORS headers in all responses", async () => {
    server.use(
      http.get(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json([{ id: "1", name: "Test Incident" }]);
        }
      )
    );

    const mockRequest = { method: "GET" };
    const response = await GET(mockRequest);

    expect(response.headers.get("Access-Control-Allow-Origin")).toBeDefined();
    expect(response.headers.get("Access-Control-Allow-Methods")).toBeDefined();
    expect(response.headers.get("Access-Control-Allow-Headers")).toBeDefined();
  });
});
