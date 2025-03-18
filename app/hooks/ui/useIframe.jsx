import { useRef, useState, useEffect, useCallback } from "react";

/**
 * A custom hook for managing iframe dimensions and content
 *
 * @param {Object} options - Configuration options
 * @param {number} options.maxWidth - Maximum width of iframe
 * @param {number} options.maxHeight - Maximum height of iframe
 * @param {number} options.minHeight - Minimum height of iframe
 * @param {number} options.preferredHeight - Preferred initial height
 * @param {string} options.content - Content to display in iframe
 * @returns {Object} - Iframe ref and dimensions state
 */
const useIframe = ({
  maxWidth = 863,
  maxHeight = 768,
  minHeight = 0,
  preferredHeight = 500,
  content = null,
}) => {
  const [dimensions, setDimensions] = useState({
    width: maxWidth,
    height: Math.min(maxHeight, Math.max(minHeight, preferredHeight)),
  });

  const iframeRef = useRef(null);

  const adjustDimensions = useCallback(() => {
    if (iframeRef.current) {
      try {
        const iframe = iframeRef.current;
        iframe.setAttribute("scrolling", "auto");

        iframe.onload = () => {
          try {
            const iframeDoc =
              iframe.contentDocument || iframe.contentWindow.document;
            const iframeBody = iframeDoc.body;

            const contentHeight = Math.max(
              iframeBody.scrollHeight,
              iframeBody.offsetHeight,
              iframeBody.clientHeight
            );

            const contentWidth = Math.max(
              iframeBody.scrollWidth,
              iframeBody.offsetWidth,
              iframeBody.clientWidth
            );

            if (contentHeight > 0 && contentWidth > 0) {
              iframe.style.height = `${contentHeight}px`;
              iframe.style.width = `${contentWidth}px`;

              setDimensions({
                width: contentWidth,
                height: contentHeight,
              });
            }
          } catch (err) {
            console.warn("Could not adjust iframe dimensions:", err);
          }
        };
      } catch (err) {
        console.warn("Could not access iframe:", err);
      }
    }
  }, []);

  useEffect(() => {
    adjustDimensions();
  }, [content, adjustDimensions]);

  return {
    iframeRef,
    dimensions,
    adjustDimensions,
  };
};

export default useIframe;
