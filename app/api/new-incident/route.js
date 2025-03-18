import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/apiUtils";

export const POST = createEndpointHandler(async (req) => {
  const requestData = await req.json();
  const incidentData = requestData.addition;

  // Convert date format (DD-MM-YYYY → YYYY-MM-DD)
  if (incidentData.incident_date) {
    const parts = incidentData.incident_date.split("-");
    if (parts.length === 3) {
      incidentData.incident_date = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  const payload = { addition: incidentData };

  // Include file data if applicable
  if (incidentData.artifactType === "image" && requestData.fileData) {
    payload.fileData = requestData.fileData;
    payload.fileName = requestData.fileName;
    payload.fileType = requestData.fileType;
  }

  console.log(
    "📤 Sending new incident to Supabase:",
    JSON.stringify(payload, null, 2)
  );

  const data = await fetchFromSupabase("tech-incidents", "POST", payload);
  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
});
