import {
  createEndpointHandler,
  fetchFromSupabase,
} from "@/app/utils/api/apiUtils";

export const PUT = createEndpointHandler(async (req) => {
  try {
    const requestData = await req.json();
    
    if (!requestData.id) {
      return new Response(
        JSON.stringify({ error: "Incident ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    if (!requestData.update || Object.keys(requestData.update).length === 0) {
      return new Response(
        JSON.stringify({ error: "No update data provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const { id, update, fileData, fileName, fileType } = requestData;
    
    // Date format conversion
    if (update.incident_date) {
      const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
      if (dateRegex.test(update.incident_date)) {
        const parts = update.incident_date.split("-");
        update.incident_date = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else {
        // Try to handle other formats
        const parts = update.incident_date.split("-");
        if (parts.length === 3) {
          const yearCandidate = parts.find(p => p.length === 4);
          if (yearCandidate) {
            const yearIndex = parts.indexOf(yearCandidate);
            if (yearIndex === 0) {
              // Already in YYYY-MM-DD format
            } else if (yearIndex === 2) {
              // DD-MM-YYYY format
              update.incident_date = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          }
        }
      }
    }
    
    const payload = { id, update };
    
    // Include file data if applicable
    if (update.artifactType === "image" && fileData) {
      payload.fileData = fileData;
      payload.fileName = fileName || "unknown.jpg";
      payload.fileType = fileType || "image/jpeg";
      
      // File size check for base64 data
      if (typeof payload.fileData === 'string') {
        const base64Size = payload.fileData.length * 0.75; // approximate size
        if (base64Size > 5 * 1024 * 1024) { // 5MB limit
          return new Response(
            JSON.stringify({ error: "File size exceeds 5MB limit" }),
            { status: 413, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    }

    console.log(`🛠 Updating incident ${id}`);
    
    const data = await fetchFromSupabase("tech-incidents", "PUT", payload);
    
    if (!data) {
      return new Response(
        JSON.stringify({ error: "Update succeeded but no data returned" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Update incident error:", error);
    
    if (error.status === 404) {
      return new Response(
        JSON.stringify({ error: "Incident not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    if (error.status === 403) {
      return new Response(
        JSON.stringify({ error: "You don't have permission to update this incident" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    
    if (error.status === 413) {
      return new Response(
        JSON.stringify({ error: "File too large" }),
        { status: 413, headers: { "Content-Type": "application/json" } }
      );
    }
    
    if (error.status === 400) {
      return new Response(
        JSON.stringify({ error: error.message || "Invalid update data" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Failed to update incident" }),
      { status: error.status || 500, headers: { "Content-Type": "application/json" } }
    );
  }
});