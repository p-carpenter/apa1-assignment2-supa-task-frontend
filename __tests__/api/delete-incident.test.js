import { server, rest } from "../test-utils";
import { DELETE } from "@/app/api/delete-incident/route";

// Mock the corsHeaders object that's used in the route
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins for testing
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

describe("delete-incident API route", () => {
  it("successfully deletes a single incident by id", async () => {
    // Set up a specific response for this test
    server.use(
      rest.delete("https://test-supabase-url.com/functions/v1/fetch-incidents", (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            success: true,
            deletedIds: ["123"]
          })
        );
      })
    );

    const deleteData = {
      id: "123"
    };

    const mockRequest = {
      json: () => Promise.resolve(deleteData),
      method: "DELETE",
    };

    const response = await DELETE(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.deletedIds).toEqual(["123"]);
  });

  it("successfully deletes multiple incidents by ids array", async () => {
    // Set up a specific response for multiple deletions
    server.use(
      rest.delete("https://test-supabase-url.com/functions/v1/fetch-incidents", (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            success: true,
            deletedIds: ["123", "456"]
          })
        );
      })
    );
    
    const deleteData = {
      ids: ["123", "456"]
    };

    const mockRequest = {
      json: () => Promise.resolve(deleteData),
      method: "DELETE",
    };

    const response = await DELETE(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.deletedIds).toEqual(["123", "456"]);
  });

  it("returns error for empty ids", async () => {
    const mockRequest = {
      json: () => Promise.resolve({ ids: [] }), // Empty ids array
      method: "DELETE",
    };

    const response = await DELETE(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("No valid incident IDs provided");
  });

  it("handles errors from Supabase", async () => {
    // Mock a failed response
    server.use(
      rest.delete("https://test-supabase-url.com/functions/v1/fetch-incidents", (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.text("Database error")
        );
      })
    );

    const mockRequest = {
      json: () => Promise.resolve({ id: "123" }),
      method: "DELETE",
    };

    const response = await DELETE(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain("Supabase error");
  });

  it("handles general exceptions", async () => {
    // Force an exception in JSON parsing
    const mockRequest = {
      json: () => Promise.reject(new Error("JSON parsing error")),
      method: "DELETE",
    };

    const response = await DELETE(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("JSON parsing error");
  });
});
