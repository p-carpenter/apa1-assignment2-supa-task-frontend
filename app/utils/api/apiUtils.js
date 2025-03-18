/**
 * Common API utilities for handling requests and responses
 */

/**
 * Fetch with standardized error handling
 *
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - The response data
 * @throws {Error} - If the response is not ok
 */
export const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // Try to parse error message from response
      const errorData = await response.json().catch(() => ({
        error: `Error: ${response.status} ${response.statusText}`,
      }));
      
      throw new Error(errorData.error || errorData.message || `Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error (${url}):`, error.message);
    throw error;
  }
};

/**
 * Create a standard API endpoint handler with CORS and error handling
 *
 * @param {Function} handler - The API route handler function
 * @returns {Function} - The wrapped handler with error and CORS handling
 */
export const createEndpointHandler = (handler) => async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    return await handler(req, corsHeaders);
  } catch (error) {
    console.error(`Handler error:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal Server Error",
        timestamp: new Date().toISOString(),
      }),
      { 
        status: error.status || 500, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
};

/**
 * Parse form data for API requests
 * 
 * @param {Object} formData - Form data to format
 * @returns {Object} - Formatted data for API
 */
export const formatApiRequestData = (formData) => {
  // Process dates
  const processedData = { ...formData };
  
  // Handle date formatting if needed
  if (formData.incident_date && formData.incident_date.includes('-')) {
    // Check if we need to convert DD-MM-YYYY to YYYY-MM-DD
    const dateParts = formData.incident_date.split('-');
    if (dateParts[0].length === 2 && dateParts[2].length === 4) {
      processedData.incident_date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    }
  }
  
  return processedData;
};
