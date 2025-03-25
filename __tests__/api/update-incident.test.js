import { server } from "../../app/utils/testing/test-utils";
import { http, HttpResponse } from "msw";
import { PUT, OPTIONS } from "@/app/api/update-incident/route";
import { CORS_HEADERS } from "@/app/utils/auth/config";

process.env.SUPABASE_URL = "https://test-supabase-url.com";
process.env.SUPABASE_ANON_KEY = "test-anon-key";

describe("update-incident API route", () => {
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

  // Basic success scenario
  it("successfully updates an incident", async () => {
    const mockIncident = {
      id: "123",
      name: "Updated Incident",
      description: "This is an updated incident",
      category: "software",
      severity: "moderate",
    };

    server.use(
      http.put(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json(mockIncident);
        }
      )
    );

    const incidentData = {
      id: "123",
      update: {
        name: "Updated Incident",
        description: "This is an updated incident",
        category: "software",
        severity: "moderate",
      },
    };

    const mockRequest = {
      json: () => Promise.resolve(incidentData),
      method: "PUT",
    };

    const response = await PUT(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual(mockIncident);
    expect(data.timestamp).toBeDefined();
  });

  it("handles date format conversion for incident_date", async () => {
    const mockIncident = {
      id: "123",
      name: "Updated Incident",
      incident_date: "2023-05-15T00:00:00.000",
    };

    server.use(
      http.put(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json(mockIncident);
        }
      )
    );

    const incidentData = {
      id: "123",
      update: {
        name: "Updated Incident",
        incident_date: "2023-05-15", // Simple date format
      },
    };

    const mockRequest = {
      json: () => Promise.resolve(incidentData),
      method: "PUT",
    };

    const response = await PUT(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual(mockIncident);
    expect(data.timestamp).toBeDefined();
  });

  // Validation tests
  it("returns 400 error when no id provided", async () => {
    const mockRequest = {
      json: () => Promise.resolve({ update: { name: "No ID Provided" } }), // Missing id
      method: "PUT",
    };

    const response = await PUT(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBeDefined();
  });

  it("returns 400 error when no update data provided", async () => {
    const mockRequest = {
      json: () => Promise.resolve({ id: "123" }), // Missing update data
      method: "PUT",
    };

    const response = await PUT(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBeDefined();
  });

  // File size validation
  it("rejects excessively large image files with 413 status", async () => {
    // Create a large base64 string (larger than 5MB)
    const largeBase64 = "a".repeat(7 * 1024 * 1024); // Approx 7MB when converted

    const incidentData = {
      id: "123",
      update: {
        name: "Large Image Update",
        artifactType: "image",
      },
      fileData: largeBase64,
      fileType: "image/png",
      fileName: "large-image.png",
    };

    const mockRequest = {
      json: () => Promise.resolve(incidentData),
      method: "PUT",
    };

    const response = await PUT(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(413);
    expect(data.message).toBeDefined();
  });

  // Error handling tests
  it("handles API errors from Supabase", async () => {
    server.use(
      http.put(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json(
            { error: "Database error" },
            { status: 500 }
          );
        }
      )
    );

    const mockRequest = {
      json: () => Promise.resolve({ id: "123", update: { name: "Test" } }),
      method: "PUT",
    };

    const response = await PUT(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBeDefined();
    expect(data.type).toBeDefined();
  });

  it("handles unauthorized errors (401) from Supabase", async () => {
    server.use(
      http.put(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      )
    );

    const mockRequest = {
      json: () => Promise.resolve({ id: "123", update: { name: "Test" } }),
      method: "PUT",
    };

    const response = await PUT(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBeDefined();
    expect(data.type).toBeDefined();
  });

  it("handles image updates with file data", async () => {
    const mockIncident = {
      id: "123",
      name: "Updated Incident with Image",
      artifactType: "image",
    };

    server.use(
      http.put(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        async ({ request }) => {
          // Verify that payload contains image data
          const payload = await request.json();
          expect(payload.fileData).toBeDefined();
          expect(payload.fileName).toBe("test-image.png");

          return HttpResponse.json(mockIncident);
        }
      )
    );

    const incidentData = {
      id: "123",
      update: {
        name: "Updated Incident with Image",
        artifactType: "image",
      },
      fileData: "base64encodedimagedata",
      fileType: "image/png",
      fileName: "test-image.png",
    };

    const mockRequest = {
      json: () => Promise.resolve(incidentData),
      method: "PUT",
    };

    const response = await PUT(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual(mockIncident);
    expect(data.timestamp).toBeDefined();
  });

  // JSON parsing errors
  it("handles exceptions during processing", async () => {
    const mockRequest = {
      json: () => Promise.reject(new Error("JSON parsing error")),
      method: "PUT",
    };

    const response = await PUT(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBeDefined();
    expect(data.type).toBeDefined();
  });

  // Response structure tests
  it("includes timestamp in all responses", async () => {
    // Success case
    server.use(
      http.put(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json({ id: "123", name: "Timestamp Test" });
        }
      )
    );

    const mockRequest = {
      json: () =>
        Promise.resolve({
          id: "123",
          update: {
            name: "Timestamp Test",
          },
        }),
      method: "PUT",
    };

    const response = await PUT(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.timestamp).toBeDefined();
    expect(new Date(data.timestamp)).toBeInstanceOf(Date);

    // Error response timestamp
    server.use(
      http.put(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json({ error: "Test error" }, { status: 500 });
        }
      )
    );

    const errorRequest = {
      json: () =>
        Promise.resolve({
          id: "123",
          update: {
            name: "Error Test",
          },
        }),
      method: "PUT",
    };

    const errorResponse = await PUT(errorRequest);
    const errorData = await errorResponse.json();

    expect(errorResponse.status).toBe(500);
    expect(errorData.timestamp).toBeDefined();
    expect(new Date(errorData.timestamp)).toBeInstanceOf(Date);
  });

  // CORS Headers tests
  it("includes CORS headers in all responses", async () => {
    server.use(
      http.put(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json({ id: "123", name: "CORS Test" });
        }
      )
    );

    const mockRequest = {
      json: () =>
        Promise.resolve({
          id: "123",
          update: {
            name: "CORS Test",
          },
        }),
      method: "PUT",
    };

    const response = await PUT(mockRequest);

    expect(response.headers.get("Access-Control-Allow-Origin")).toBeDefined();
    expect(response.headers.get("Access-Control-Allow-Methods")).toBeDefined();
    expect(response.headers.get("Access-Control-Allow-Headers")).toBeDefined();
  });
});
