import { rest } from "msw";

export const handlers = [
  // GET all incidents from Supabase Edge Function
  rest.get("https://test-supabase-url.com/functions/v1/fetch-incidents", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
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
      ])
    );
  }),

  // POST new incident to Supabase Edge Function
  rest.post("https://test-supabase-url.com/functions/v1/tech-incidents", (req, res, ctx) => {
    const { addition } = req.body;
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        incident: {
          id: "new-123",
          ...addition
        }
      })
    );
  }),

  // PUT update incident to Supabase Edge Function
  rest.put("https://test-supabase-url.com/functions/v1/tech-incidents", (req, res, ctx) => {
    const { id, update } = req.body;
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        incident: {
          id,
          ...update
        }
      })
    );
  }),

  // DELETE incident from Supabase Edge Function
  rest.delete("https://test-supabase-url.com/functions/v1/fetch-incidents", (req, res, ctx) => {
    const { ids } = req.body;
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        deletedIds: ids
      })
    );
  }),

  // API route handlers
  rest.post("/api/new-incident", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        incident: {
          id: "new-123",
          ...req.body.addition
        }
      })
    );
  }),

  rest.put("/api/update-incident", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        incident: {
          id: req.body.id,
          ...req.body.update
        }
      })
    );
  }),
  
  rest.delete("/api/delete-incident", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        deletedIds: req.body.ids
      })
    );
  }),

  // Auth API handlers
  rest.post("/api/auth/signin", (req, res, ctx) => {
    const { email } = req.body;
    
    return res(
      ctx.status(200),
      ctx.json({
        user: { id: "user-123", email },
        session: { token: "mock-token" }
      })
    );
  }),

  rest.post("/api/auth/signup", (req, res, ctx) => {
    const { email } = req.body;
    
    return res(
      ctx.status(200),
      ctx.json({
        user: { id: "user-456", email },
        session: { token: "mock-token" }
      })
    );
  }),

  rest.post("/api/auth/signout", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ success: true })
    );
  }),

  rest.get("/api/auth/user", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: { id: "user-123", email: "test@example.com" },
        session: { token: "mock-token" }
      })
    );
  }),

  // Add handlers for protected routes
  rest.get("/api/auth/protected", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ data: "Protected data" })
    );
  }),

  rest.post("/api/auth/protected", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ success: true })
    );
  }),

  // API fallback for unexpected routes
  rest.all("*", (req, res, ctx) => {
    console.warn(`No handler for ${req.method} ${req.url.toString()}`);
    return res(
      ctx.status(404),
      ctx.json({ error: "Not found" })
    );
  })
];
