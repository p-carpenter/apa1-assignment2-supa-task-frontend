/**
 * CRUD operations for incident management
 */
import { fetchWithErrorHandling } from "../utils/api/apiUtils";

/**
 * Fetch all incidents from the API
 *
 * @returns {Promise<Array>} Array of incidents
 */
export const fetchIncidents = async () => {
  return fetchWithErrorHandling("/api/fetch-incidents");
};

/**
 * Handler for adding a new incident
 *
 * @param {Object} payload - Data for the new incident
 * @returns {Promise<Array|string>} Updated incidents array or error message
 */
export const handleAddNewIncident = async (payload) => {
  try {
    return await fetchWithErrorHandling("/api/new-incident", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Error adding incident:", error);
    return error.message || "Failed to create incident";
  }
};

/**
 * Handler for updating an existing incident
 *
 * @param {Object} payload - Update data with incident ID
 * @returns {Promise<Array|string>} Updated incidents array or error message
 */
export const handleUpdateIncident = async (payload) => {
  try {
    if (!payload.id) {
      throw new Error("No incident to update");
    }

    return await fetchWithErrorHandling("/api/update-incident", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Error updating incident:", error);
    return error.message || "Failed to update incident";
  }
};

/**
 * Handler for deleting multiple incidents
 *
 * @param {Array} selectedIncidents - Incidents to delete
 * @returns {Promise<Array|string>} Updated incidents array or error message
 */
export const handleDeleteIncidents = async (selectedIncidents) => {
  try {
    if (!selectedIncidents?.length) {
      throw new Error("No incidents selected for deletion");
    }

    const idArray = selectedIncidents.map((inc) => inc.id);

    return await fetchWithErrorHandling("/api/delete-incident", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: idArray }),
    });
  } catch (error) {
    console.error("Error deleting incidents:", error);
    return error.message || "Failed to delete incidents";
  }
};
