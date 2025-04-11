import { ERROR_TYPES } from "../utils/errors/errorTypes";

/**
 * Fetch all incidents from the API
 *
 * @returns {Promise<Array>} Array of incidents
 */
export const fetchIncidents = async () => {
  try {
    const response = await fetch("/api/fetch-incidents", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("Failed to parse response from server");
    }

    if (!response.ok) {
      throw data;
    }

    return data;
  } catch (error) {
    console.error("Error fetching incidents:", error);
    throw error;
  }
};

/**
 * Handler for adding a new incident
 *
 * @param {Object} payload - Data for the new incident
 * @returns {Promise<Array|string>} Updated incidents array or error message
 */
export const handleAddNewIncident = async (payload) => {
  try {
    const response = await fetch("/api/new-incident", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("Failed to parse response from server");
    }

    if (!response.ok) {
      throw data;
    }

    return data;
  } catch (error) {
    console.error("Error adding incident:", error);

    if (error.type === ERROR_TYPES.FILE_TOO_LARGE) {
      throw error;
    }

    throw error;
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

    const response = await fetch("/api/update-incident", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("Failed to parse response from server");
    }

    if (!response.ok) {
      throw data;
    }

    return data;
  } catch (error) {
    console.error("Error updating incident:", error);
    throw error;
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

    const response = await fetch("/api/delete-incident", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ids: idArray }),
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("Failed to parse response from server");
    }

    if (!response.ok) {
      throw data;
    }

    return data;
  } catch (error) {
    console.error("Error deleting incidents:", error);
    throw error;
  }
};
