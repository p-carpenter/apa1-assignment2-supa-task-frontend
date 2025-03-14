import { http, HttpResponse, delay } from "msw";

export const handlers = [
  // GET all incidents from Supabase Edge Function
  http.get("https://test-supabase-url.com/functions/v1/tech-incidents", () => {
    return HttpResponse.json([
      {
        id: "1",
        name: "Mock Incident 1",
        category: "Software",
        severity: "3",
        incident_date: "2000-01-01",
        description: "Mock description 1",
      },
      {
        id: "2",
        name: "Mock Incident 2",
        category: "Hardware",
        severity: "4",
        incident_date: "1990-05-15",
        description: "Mock description 2",
      },
    ]);
  }),

  // POST new incident to Supabase Edge Function
  http.post(
    "https://test-supabase-url.com/functions/v1/tech-incidents",
    async ({ request }) => {
      const { addition } = await request.json();

      return HttpResponse.json({
        success: true,
        incident: {
          id: "new-123",
          ...addition,
        },
      });
    }
  ),

  // PUT update incident to Supabase Edge Function
  http.put(
    "https://test-supabase-url.com/functions/v1/tech-incidents",
    async ({ request }) => {
      const { id, update } = await request.json();

      return HttpResponse.json({
        success: true,
        incident: {
          id,
          ...update,
        },
      });
    }
  ),

  // DELETE incident from Supabase Edge Function
  http.delete(
    "https://test-supabase-url.com/functions/v1/tech-incidents",
    async ({ request }) => {
      try {
        const body = await request.json();
        let idsToDelete = [];

        if (body.id) {
          idsToDelete = [body.id];
        } else if (body.ids) {
          idsToDelete = body.ids;
        }

        console.log("MSW handler for DELETE received ids:", idsToDelete);

        return HttpResponse.json({
          success: true,
          deletedIds: idsToDelete,
        });
      } catch (error) {
        console.error("MSW handler for DELETE error:", error);
        return new HttpResponse(
          JSON.stringify({ error: "MSW parsing error" }),
          { status: 500 }
        );
      }
    }
  ),

  http.post(
    "https://test-supabase-url.com/functions/v1/password-recovery",
    async ({ request }) => {
      return HttpResponse.json({
        message: "Password reset request processed by Supabase",
      });
    }
  ),

  http.post(
    "https://test-supabase-url.com/functions/v1/password-recovery/confirm",
    async ({ request }) => {
      return HttpResponse.json({
        message: "Password reset confirmation processed by Supabase",
      });
    }
  ),

  // API route handlers
  http.post("/api/new-incident", async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      success: true,
      incident: {
        ...body.addition,
      },
    });
  }),

  http.put("/api/update-incident", async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      success: true,
      incident: {
        id: body.id,
        ...body.update,
      },
    });
  }),

  http.delete("/api/delete-incident", async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      success: true,
      deletedIds: body.ids,
    });
  }),

  // Auth API handlers
  http.post("/api/auth/signin", async ({ request }) => {
    const { email } = await request.json();

    return HttpResponse.json({
      user: { id: "user-123", email },
      session: { token: "mock-token" },
    });
  }),

  http.post("/api/auth/signup", async ({ request }) => {
    const { email } = await request.json();

    return HttpResponse.json({
      user: { id: "user-456", email },
      session: { token: "mock-token" },
    });
  }),

  http.post("/api/auth/signout", () => {
    return HttpResponse.json({ success: true });
  }),

  http.get("/api/auth/user", ({}) => {
    return HttpResponse.json({
      user: { id: "user-123", email: "test@example.com" },
      session: { token: "mock-token" },
    });
  }),

  // Password recovery API handlers
  http.post("/api/auth/password-recovery", async ({ request }) => {
    const body = await request.json();

    if (!body.email) {
      return new HttpResponse(JSON.stringify({ error: "Email is required" }), {
        status: 400,
      });
    }

    return HttpResponse.json({
      message: "Password reset instructions sent",
    });
  }),

  http.post("/api/auth/password-recovery/confirm", async ({ request }) => {
    const body = await request.json();

    if (!body.email || !body.password || !body.token) {
      return new HttpResponse(
        JSON.stringify({
          error: "Email, password, and token are required",
        }),
        {
          status: 400,
        }
      );
    }

    return HttpResponse.json({
      message: "Password has been reset successfully",
    });
  }),

  // Add handlers for protected routes
  http.get("/api/auth/protected", () => {
    return HttpResponse.json({ data: "Protected data" });
  }),

  http.post("/api/auth/protected", () => {
    return HttpResponse.json({ success: true });
  }),

  // API fallback for unexpected routes
  http.all("*", ({ request }) => {
    console.warn(`No handler for ${request.method} ${request.url}`);
    return new HttpResponse(JSON.stringify({ error: "Not found" }), {
      status: 404,
    });
  }),
];
