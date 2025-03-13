import { server } from "../test-utils";
import { http, HttpResponse } from "msw";
import { POST } from "@/app/api/new-incident/route";

// Mock the corsHeaders object that's used in the route
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // testing
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

describe("new-incident API route", () => {
  it("successfully creates a new incident", async () => {
    // Set up a specific response for this test
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/tech-incidents",
        () => {
          return HttpResponse.json({
            success: true,
            incident: {
              id: 123,
              name: "New Test Incident",
              description: "This is a new test incident",
              category: "software",
              severity: "medium",
            },
          });
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

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.incident).toEqual(
      expect.objectContaining({
        id: 123,
        name: "New Test Incident",
      })
    );
  });

  it("handles image artifact with file data", async () => {
    // Set up a specific response for image uploads
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/tech-incidents",
        () => {
          return HttpResponse.json({
            success: true,
            incident: {
              id: "new-456",
              name: "Image Incident",
            },
          });
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
        fileData: "base64data...",
        fileType: "image/png",
        fileName: "test-image.png",
      },
    };

    const mockRequest = {
      json: () => Promise.resolve(incidentData),
      method: "POST",
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.incident.name).toBe("Image Incident");
  });

  it("handles errors from Supabase", async () => {
    // Mock a failed response
    server.use(
      http.post(
        "https://test-supabase-url.com/functions/v1/tech-incidents",
        () => {
          return new HttpResponse("Database error", { status: 500 });
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
    expect(data.error).toContain("Supabase error");
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
    expect(data.error).toBe("JSON parsing error");
  });
});
