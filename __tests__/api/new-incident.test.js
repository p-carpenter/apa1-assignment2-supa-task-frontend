import { server } from "../../app/utils/testing/test-utils";
import { http, HttpResponse } from "msw";
import { POST, OPTIONS } from "@/app/api/new-incident/route";
import { CORS_HEADERS } from "@/app/utils/auth/config";

process.env.SUPABASE_URL = "https://test-supabase-url.com";
process.env.SUPABASE_ANON_KEY = "test-anon-key";

describe("new-incident API route", () => {
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

  // Basic successful scenario
  it("successfully creates a new incident", async () => {
    const mockIncident = {
      id: "123",
      name: "New Test Incident",
      description: "This is a new test incident",
      category: "software",
      severity: "moderate",
    };

    server.use(
      http.post(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json(mockIncident);
        }
      )
    );

    const incidentData = {
      addition: {
        name: "New Test Incident",
        description: "This is a new test incident",
        category: "software",
        severity: "moderate",
        incident_date: "05-05-2023",
      },
    };

    const mockRequest = {
      json: () => Promise.resolve(incidentData),
      method: "POST",
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(201); // Note the correct status code is 201
    expect(data.data).toEqual(mockIncident);
    expect(data.timestamp).toBeDefined();
  });

  // Testing image upload scenarios
  it("handles image artifact properly", async () => {
    const mockIncident = {
      id: "456",
      name: "Image Incident",
      artifactType: "image",
    };

    server.use(
      http.post(
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
      addition: {
        name: "Image Incident",
        description: "Test with image",
        category: "hardware",
        severity: "low",
        artifactType: "image",
      },
      fileData: "base64encodedimagedata", // This should be moved to the root in the implementation
      fileType: "image/png",
      fileName: "test-image.png",
    };

    const mockRequest = {
      json: () => Promise.resolve(incidentData),
      method: "POST",
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data).toEqual(mockIncident);
  });

  // Edge case for large file sizes
  it("rejects excessively large image files", async () => {
    // Create a large base64 string (larger than 5MB)
    const largeBase64 = "a".repeat(7 * 1024 * 1024); // Approx 7MB when converted

    const incidentData = {
      addition: {
        name: "Large Image Incident",
        description: "Test with large image",
        category: "hardware",
        severity: "low",
        artifactType: "image",
      },
      fileData: largeBase64,
      fileType: "image/png",
      fileName: "large-image.png",
    };

    const mockRequest = {
      json: () => Promise.resolve(incidentData),
      method: "POST",
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    // The implementation uses 413 status code for file size limit errors
    expect(response.status).toBe(413);
    expect(data.message).toBeDefined();
  });

  // Validation tests
  it("requires incident data with a name", async () => {
    // Missing addition object entirely
    const mockRequest1 = {
      json: () => Promise.resolve({}),
      method: "POST",
    };

    const response1 = await POST(mockRequest1);
    const data1 = await response1.json();

    // The implementation uses 400 status code for missing required fields
    expect(response1.status).toBe(400);
    expect(data1.message).toBeDefined();

    // Addition object exists but no name property
    const mockRequest2 = {
      json: () =>
        Promise.resolve({ addition: { description: "No name here" } }),
      method: "POST",
    };

    const response2 = await POST(mockRequest2);
    const data2 = await response2.json();

    expect(response2.status).toBe(400);
    expect(data2.message).toBeDefined();
  });

  // Testing different HTTP error status codes
  it("handles HTTP errors from Supabase", async () => {
    server.use(
      http.post(
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
      json: () =>
        Promise.resolve({
          addition: {
            name: "Error Incident",
            description: "This will cause an error",
          },
        }),
      method: "POST",
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBeDefined();
    expect(data.type).toBeDefined();
  });

  it("handles unauthorized errors (401) from Supabase", async () => {
    server.use(
      http.post(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      )
    );

    const mockRequest = {
      json: () =>
        Promise.resolve({
          addition: {
            name: "Unauthorized Incident",
          },
        }),
      method: "POST",
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBeDefined();
    expect(data.type).toBeDefined();
  });

  it("handles forbidden errors (403) from Supabase", async () => {
    server.use(
      http.post(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      )
    );

    const mockRequest = {
      json: () =>
        Promise.resolve({
          addition: {
            name: "Forbidden Incident",
          },
        }),
      method: "POST",
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.message).toBeDefined();
    expect(data.type).toBeDefined();
  });

  it("handles general exceptions", async () => {
    // Force an exception in JSON parsing
    const mockRequest = {
      json: () => Promise.reject(new Error("JSON parsing error")),
      method: "POST",
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBeDefined();
    expect(data.type).toBeDefined();
  });

  // Response structure tests
  it("includes timestamp in all responses", async () => {
    // Success case
    server.use(
      http.post(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json({
            id: "timestamp-test",
            name: "Timestamp Test",
          });
        }
      )
    );

    const mockRequest = {
      json: () =>
        Promise.resolve({
          addition: {
            name: "Timestamp Test",
          },
        }),
      method: "POST",
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.timestamp).toBeDefined();
    expect(new Date(data.timestamp)).toBeInstanceOf(Date);

    // Error case also has timestamp
    server.use(
      http.post(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json({ error: "Test error" }, { status: 500 });
        }
      )
    );

    const errorRequest = {
      json: () =>
        Promise.resolve({
          addition: {
            name: "Timestamp Error Test",
          },
        }),
      method: "POST",
    };

    const errorResponse = await POST(errorRequest);
    const errorData = await errorResponse.json();

    expect(errorResponse.status).toBe(500);
    expect(errorData.timestamp).toBeDefined();
    expect(new Date(errorData.timestamp)).toBeInstanceOf(Date);
  });

  // CORS Headers tests
  it("includes CORS headers in all responses", async () => {
    server.use(
      http.post(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json({ id: "cors-test", name: "CORS Test" });
        }
      )
    );

    const mockRequest = {
      json: () =>
        Promise.resolve({
          addition: {
            name: "CORS Test",
          },
        }),
      method: "POST",
    };

    const response = await POST(mockRequest);

    expect(response.headers.get("Access-Control-Allow-Origin")).toBeDefined();
    expect(response.headers.get("Access-Control-Allow-Methods")).toBeDefined();
    expect(response.headers.get("Access-Control-Allow-Headers")).toBeDefined();
  });
});
