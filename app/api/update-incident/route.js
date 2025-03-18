import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/apiUtils";

export const PUT = createEndpointHandler(async (req) => {
  const { id, update, fileData, fileName, fileType } = await req.json();

  if (!id) {
    return new Response(JSON.stringify({ error: "Incident ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const payload = { id, update };

  if (update.artifactType === "image" && fileData) {
    payload.fileData = fileData;
    payload.fileName = fileName;
    payload.fileType = fileType;
  }

  console.log("🛠 Updating incident:", JSON.stringify(payload, null, 2));

  const data = await fetchFromSupabase("tech-incidents", "PUT", payload);
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
