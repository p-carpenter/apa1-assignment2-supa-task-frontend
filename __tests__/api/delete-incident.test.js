import { server } from "../../app/utils/testing/test-utils";
import { http, HttpResponse } from "msw";
import { DELETE } from "@/app/api/delete-incident/route";

process.env.SUPABASE_URL = "https://test-supabase-url.com";
process.env.SUPABASE_ANON_KEY = "test-anon-key";

describe("delete-incident API route", () => {
  beforeEach(() => {
    server.use(
      http.delete(process.env.SUPABASE_URL, async ({ request }) => {
        const body = await request.json();
        const ids = body.ids || [];
        return HttpResponse.json(
          {
            success: true,
            deletedIds: ids,
          },
          { status: 200 }
        );
      })
    );
  });

  it("successfully deletes a single incident by id", async () => {
    const mockRequest = {
      json: () => Promise.resolve({ id: "123" }),
      method: "DELETE",
    };

    const response = await DELETE(mockRequest);

    expect(response instanceof Response).toBe(true);

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.deletedIds).toContain("123");
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
    expect(data.deletedIds).toEqual(["123", "456"]);
  });

  it("returns error for empty ids", async () => {
    const mockRequest = {
      json: () => Promise.resolve({ ids: [] }),
      method: "DELETE",
    };

    const response = await DELETE(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("No valid incident IDs provided");
  });

  it("handles errors from Supabase", async () => {
    server.use(
      http.delete(
        "https://test-supabase-url.com/functions/v1/tech-incidents",
        () => {
          return HttpResponse.json(
            { error: "Database error" },
            { status: 500 }
          );
        }
      )
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
