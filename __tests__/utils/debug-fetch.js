/**
 * Wraps the global fetch to add detailed logging.
 * This helps debug "Failed to fetch" errors.
 */
export function setupDebugFetch() {
  const originalFetch = global.fetch;

  global.fetch = async function debugFetch(url, options) {
    console.log(`[DEBUG] Fetch request to: ${url}`);
    console.log("[DEBUG] Fetch options:", options);

    try {
      const response = await originalFetch(url, options);
      console.log(`[DEBUG] Fetch response status: ${response.status}`);
      return response;
    } catch (error) {
      console.error(`[DEBUG] Fetch error: ${error.message}`);
      console.error(error);
      throw error;
    }
  };

  return function cleanup() {
    global.fetch = originalFetch;
  };
}
