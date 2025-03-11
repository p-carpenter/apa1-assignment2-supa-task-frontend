/**
 * Formats HTML code for display with basic syntax highlighting
 * @param {string} html - The HTML content to format
 * @returns {string} - Formatted HTML string with syntax highlighting
 */
export function formatHtmlForDisplay(html) {
  if (!html) return "";

  let formattedHtml = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  formattedHtml = formattedHtml
    // HTML tags
    .replace(
      /&lt;(\/?)(.*?)(\s.*?)?&gt;/g,
      '<span style="color:#0000BB">&lt;$1$2$3&gt;</span>'
    )
    // Attributes
    .replace(
      /(\s+)([a-zA-Z-_:]+)=(&quot;.*?&quot;)/g,
      '$1<span style="color:#008800">$2</span>=<span style="color:#DD0000">$3</span>'
    );

  return formattedHtml;
}

/**
 * Detects if content is HTML and returns appropriate data attributes
 * @param {string} content - The content to check
 * @returns {Object} - Data attributes to apply to the container
 */
export function getContentTypeAttributes(content) {
  const attributes = {};

  if (
    content &&
    typeof content === "string" &&
    (content.trim().startsWith("<!DOCTYPE") ||
      content.trim().startsWith("<html") ||
      (content.includes("<") && content.includes(">")))
  ) {
    attributes["data-type"] = "html";
  }

  return attributes;
}

/**
 * Prepares code artifact content for display
 * @param {string} content - The code content
 * @returns {string} - Prepared content
 */
export function prepareCodeContent(content) {
  if (!content) return "";

  if (
    content.trim().startsWith("<!DOCTYPE") ||
    content.trim().startsWith("<html") ||
    (content.includes("<") && content.includes(">"))
  ) {
    return formatHtmlForDisplay(content);
  }

  return content;
}
