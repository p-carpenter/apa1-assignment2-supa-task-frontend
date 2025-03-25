import { server } from "../../app/utils/testing/test-utils";
import { http, HttpResponse } from "msw";
import { DELETE, OPTIONS } from "@/app/api/delete-incident/route";

process.env.SUPABASE_URL = "https://test-supabase-url.com";
process.env.SUPABASE_ANON_KEY = "test-anon-key";

describe("delete-incident API route", () => {
  // Track request payloads for assertion
  let lastRequestPayload = null;

  beforeEach(() => {
    lastRequestPayload = null;

    server.use(
      http.delete(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        async ({ request }) => {
          const body = await request.json();
          lastRequestPayload = body;
          const ids = body.ids || [];
          return HttpResponse.json(
            {
              deletedIds: ids,
            },
            { status: 200 }
          );
        }
      )
    );
  });

  // Test OPTIONS method
  it("responds correctly to OPTIONS request", async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeDefined();
    expect(response.headers.get("Access-Control-Allow-Methods")).toBeDefined();
    expect(response.headers.get("Access-Control-Allow-Headers")).toBeDefined();
  });

  // Basic cases

  it("successfully deletes a single incident by id", async () => {
    const mockRequest = {
      json: () => Promise.resolve({ ids: ["123"] }),
      method: "DELETE",
    };

    const response = await DELETE(mockRequest);
    expect(response instanceof Response).toBe(true);

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.deletedIds).toContain("123");
    expect(data.timestamp).toBeDefined();
  });

  it("successfully deletes multiple incidents by ids array", async () => {
    const deleteData = {
      ids: ["123", "456"],
    };

    const mockRequest = {
      json: () => Promise.resolve(deleteData),
      method: "DELETE",
    };

    const response = await DELETE(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.deletedIds).toEqual(["123", "456"]);

    // Verify the correct payload was sent to Supabase
    expect(lastRequestPayload).toEqual({ ids: ["123", "456"] });
  });

  // Edge cases - Input validation - with status code 400

  it("returns 400 status for empty ids", async () => {
    const mockRequest = {
      json: () => Promise.resolve({ ids: [] }),
      method: "DELETE",
    };

    const response = await DELETE(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("No valid incident IDs provided");
    expect(data.timestamp).toBeDefined();
  });

  it("returns 400 status for non-array ids parameter", async () => {
    const mockRequest = {
      json: () => Promise.resolve({ ids: "123" }), // String instead of array
      method: "DELETE",
    };

    const response = await DELETE(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("No valid incident IDs provided");
    expect(data.timestamp).toBeDefined();
  });

  it("returns 400 status for missing ids parameter", async () => {
    const mockRequest = {
      json: () => Promise.resolve({}), // No ids parameter
      method: "DELETE",
    };

    const response = await DELETE(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("No valid incident IDs provided");
    expect(data.timestamp).toBeDefined();
  });

  it("returns 400 status for null ids parameter", async () => {
    const mockRequest = {
      json: () => Promise.resolve({ ids: null }),
      method: "DELETE",
    };

    const response = await DELETE(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("No valid incident IDs provided");
    expect(data.timestamp).toBeDefined();
  });

  // Error handling cases

  it("handles errors from Supabase", async () => {
    server.use(
      http.delete(
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
      json: () => Promise.resolve({ ids: ["123"] }),
      method: "DELETE",
    };

    const response = await DELETE(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBeDefined();
    expect(data.type).toBeDefined();
  });

  it("handles specific Supabase error status codes", async () => {
    // Test 403 forbidden response
    server.use(
      http.delete(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        () => {
          return HttpResponse.json(
            { error: "Forbidden access" },
            { status: 403 }
          );
        }
      )
    );

    const mockRequest = {
      json: () => Promise.resolve({ ids: ["123"] }),
      method: "DELETE",
    };

    const response = await DELETE(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.message).toBeDefined();
    expect(data.type).toBeDefined();
  });

  it("handles general exceptions", async () => {
    const mockRequest = {
      json: () => Promise.reject(new Error("JSON parsing error")),
      method: "DELETE",
    };

    const response = await DELETE(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBeDefined();
    expect(data.type).toBeDefined();
  });

  // Performance test

  it("handles large deletion requests", async () => {
    // Generate 100 IDs for a bulk delete test
    const largeIdArray = Array.from({ length: 100 }, (_, i) => `id${i}`);

    const mockRequest = {
      json: () => Promise.resolve({ ids: largeIdArray }),
      method: "DELETE",
    };

    const response = await DELETE(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.deletedIds.length).toBe(100);

    // Verify all IDs were correctly passed to Supabase
    expect(lastRequestPayload.ids.length).toBe(100);
    expect(lastRequestPayload.ids).toEqual(largeIdArray);
  });

  // Content type and headers test

  it("includes correct CORS headers in response", async () => {
    const mockRequest = {
      json: () => Promise.resolve({ ids: ["123"] }),
      method: "DELETE",
    };

    const response = await DELETE(mockRequest);

    // Check that CORS headers are included
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeDefined();
  });

  // Partial success handling

  it("handles partial success scenarios", async () => {
    // Mock Supabase to return only some IDs as successfully deleted
    server.use(
      http.delete(
        `${process.env.SUPABASE_URL}/functions/v1/tech-incidents`,
        async ({ request }) => {
          const body = await request.json();
          const ids = body.ids || [];

          // Simulate only half of the IDs being successfully deleted
          const successfulIds = ids.filter((_, index) => index % 2 === 0);

          return HttpResponse.json(
            {
              deletedIds: successfulIds,
              partialSuccess: true,
            },
            { status: 207 } // 207 Multi-Status
          );
        }
      )
    );

    const mockRequest = {
      json: () => Promise.resolve({ ids: ["123", "456", "789", "abc"] }),
      method: "DELETE",
    };

    const response = await DELETE(mockRequest);
    const data = await response.json();

    // The implementation should forward the response from Supabase
    expect(data.data.deletedIds.length).toBe(2);
    expect(data.data.partialSuccess).toBe(true);
  });
});
