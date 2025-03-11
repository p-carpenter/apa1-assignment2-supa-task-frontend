import { server, rest } from "../test-utils";
import { PUT } from "@/app/api/update-incident/route";

// Mock the corsHeaders object that's used in the route
const corsHeaders = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

describe("update-incident API route", () => {
  it("successfully updates an incident", async () => {
    // Set up a specific response for this test
    server.use(
      rest.put("https://test-supabase-url.com/functions/v1/tech-incidents", (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            success: true,
            incident: {
              id: "123",
              name: "Updated Incident",
              description: "This is an updated incident",
              category: "software",
              severity: "medium"
            }
          })
        );
      })
    );

    const incidentData = {
      id: "123",
      update: {
        name: "Updated Incident",
        description: "This is an updated incident",
        category: "software",
        severity: "medium"
      }
    };

    const mockRequest = {
      json: () => Promise.resolve(incidentData),
      method: "PUT",
    };

    const response = await PUT(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.incident).toEqual(expect.objectContaining({
      id: "123", 
      name: "Updated Incident",
    }));
  });

  it("handles date format conversion for incident_date", async () => {
    // Set up a specific response for this test
    server.use(
      rest.put("https://test-supabase-url.com/functions/v1/tech-incidents", (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            success: true,
            incident: {
              id: "123",
              name: "Updated Incident",
              incident_date: "2023-05-15T00:00:00.000Z"
            }
          })
        );
      })
    );
    
    const incidentData = {
      id: "123",
      update: {
        name: "Updated Incident",
        incident_date: "2023-05-15", // Simple date format
      }
    };

    const mockRequest = {
      json: () => Promise.resolve(incidentData),
      method: "PUT",
    };

    const response = await PUT(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("returns error when no id provided", async () => {
    const mockRequest = {
      json: () => Promise.resolve({ update: { name: "No ID Provided" } }), // Missing id
      method: "PUT",
    };

    const response = await PUT(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Incident ID is required");
  });

  it("handles API errors from Supabase", async () => {
    // Mock a failed response
    server.use(
      rest.put("https://test-supabase-url.com/functions/v1/tech-incidents", (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.text("Database error")
        );
      })
    );

    const mockRequest = {
      json: () => Promise.resolve({ id: "123", update: { name: "Test" } }),
      method: "PUT",
    };

    const response = await PUT(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain("Supabase error");
  });

  it("handles image updates with file data", async () => {
    // Set up a specific response for image updates
    server.use(
      rest.put("https://test-supabase-url.com/functions/v1/tech-incidents", (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            success: true,
            incident: {
              id: "123",
              name: "Updated Incident with Image",
              artifactType: "image"
            }
          })
        );
      })
    );
    
    const incidentData = {
      id: "123",
      update: {
        name: "Updated Incident with Image",
        artifactType: "image"
      },
      fileData: "base64data...",
      fileType: "image/png",
      fileName: "test-image.png"
    };

    const mockRequest = {
      json: () => Promise.resolve(incidentData),
      method: "PUT",
    };

    const response = await PUT(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.incident.name).toBe("Updated Incident with Image");
  });

  it("handles exceptions during processing", async () => {
    // Force an exception in JSON parsing
    const mockRequest = {
      json: () => Promise.reject(new Error("JSON parsing error")),
      method: "PUT",
    };

    const response = await PUT(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("JSON parsing error");
  });
});
