import React, { useState, useEffect, useRef } from "react";
import "./ArtifactRenderer.css";

const ArtifactRenderer = ({
  artifact,
  maxWidth = 863,
  maxHeight = 2000,
  minHeight = 0,
  title,
  className = "",
  containerId = "artifact-container",
  onExpand = null,
  paddingSize = "auto",
}) => {
  const [dimensions, setDimensions] = useState({
    width: maxWidth,
    height: Math.min(
      maxHeight,
      Math.max(minHeight, artifact?.preferredHeight || 500)
    ),
  });
  const [needsPadding, setNeedsPadding] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const iframeRef = useRef(null);
  const expandTimerRef = useRef(null);

  // Function to handle expanding/collapsing the artifact
  const toggleExpand = () => {
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);

    // If expanded, add a class to the body to prevent scrolling
    if (newExpandedState) {
      document.body.classList.add("artifact-modal-open");
    } else {
      document.body.classList.remove("artifact-modal-open");
    }

    if (onExpand) {
      onExpand(newExpandedState);
    }
  };

  // Close on escape key - improved for working with iframes and content interaction
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && expanded) {
        toggleExpand();
      }
    };

    // Add event listener to the document
    document.addEventListener("keydown", handleEscape);

    // Also add the event listener to iframe documents if they exist
    if (iframeRef.current) {
      try {
        const iframeDoc =
          iframeRef.current.contentDocument ||
          (iframeRef.current.contentWindow &&
            iframeRef.current.contentWindow.document);

        if (iframeDoc) {
          iframeDoc.addEventListener("keydown", handleEscape);
        }
      } catch (err) {
        console.warn("Could not add ESC handler to iframe:", err);
      }
    }

    return () => {
      // Clean up event listeners
      document.removeEventListener("keydown", handleEscape);

      // Clean up iframe event listeners
      if (iframeRef.current) {
        try {
          const iframeDoc =
            iframeRef.current.contentDocument ||
            (iframeRef.current.contentWindow &&
              iframeRef.current.contentWindow.document);

          if (iframeDoc) {
            iframeDoc.removeEventListener("keydown", handleEscape);
          }
        } catch (err) {
          // Silently fail if we can't access the iframe
        }
      }

      // Clean up body class if component unmounts while expanded
      document.body.classList.remove("artifact-modal-open");
    };
  }, [expanded]);

  useEffect(() => {
    const adjustIfScrollbarsAppear = () => {
      if (iframeRef.current) {
        try {
          const iframe = iframeRef.current;
          iframe.setAttribute("scrolling", "auto"); // Always allow scrolling

          iframe.onload = () => {
            try {
              const iframeDoc =
                iframe.contentDocument || iframe.contentWindow.document;
              const iframeBody = iframeDoc.body;

              // Add smart click handling to the iframe
              setupSmartClickHandler(iframeDoc);

              // Add ESC key handler to iframe document
              const handleIframeEscape = (e) => {
                if (e.key === "Escape" && expanded) {
                  toggleExpand();
                }
              };

              // Clean up previous event listeners
              iframeDoc.removeEventListener("keydown", handleIframeEscape);

              // Add new one
              iframeDoc.addEventListener("keydown", handleIframeEscape);

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
    };

    adjustIfScrollbarsAppear();
  }, [artifact, expanded]);

  // Setup smart click handling for iframe content
  const setupSmartClickHandler = (doc) => {
    if (!doc) return;

    const handleMouseDown = (e) => {
      // If already expanded, no need for special handling
      if (expanded) return;

      // Check if the click target is an interactive element
      const target = e.target;
      const isInteractive =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "OPTION" ||
        target.tagName === "LABEL" ||
        target.hasAttribute("onclick") ||
        (target.parentElement &&
          (target.parentElement.tagName === "BUTTON" ||
            target.parentElement.tagName === "A"));

      if (isInteractive) {
        // For interactive elements, clear any pending expand timer
        if (expandTimerRef.current) {
          clearTimeout(expandTimerRef.current);
          expandTimerRef.current = null;
        }
        return; // Allow the click to proceed normally
      }

      // For non-interactive elements, set up an expand timer
      if (expandTimerRef.current) {
        clearTimeout(expandTimerRef.current);
      }

      // Schedule the expansion
      expandTimerRef.current = setTimeout(() => {
        toggleExpand();
        expandTimerRef.current = null;
      }, 50);
    };

    const handleMouseUp = () => {
      // If the mouse up happens very quickly after mouse down, cancel expansion
      if (expandTimerRef.current) {
        clearTimeout(expandTimerRef.current);
        expandTimerRef.current = null;
      }
    };

    // Clean up previous event listeners
    doc.removeEventListener("mousedown", handleMouseDown);
    doc.removeEventListener("mouseup", handleMouseUp);

    // Add new listeners
    doc.addEventListener("mousedown", handleMouseDown);
    doc.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    // Setup smart click handling for image containers
    const setupImageClickHandler = () => {
      if (!contentRef.current) return;

      const imageContainer = contentRef.current.querySelector(
        ".artifact-image-container"
      );
      if (!imageContainer) return;

      const handleImageClick = (e) => {
        if (!expanded) {
          toggleExpand();
        }
      };

      imageContainer.addEventListener("click", handleImageClick);

      return () => {
        imageContainer.removeEventListener("click", handleImageClick);
      };
    };

    const cleanup = setupImageClickHandler();
    return () => {
      if (cleanup) cleanup();
    };
  }, [artifact, expanded]);

  useEffect(() => {
    const detectPaddingNeeds = () => {
      if (!containerRef.current || !contentRef.current) return;

      if (paddingSize !== "auto") {
        setNeedsPadding(false);
        return;
      }

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      if (
        artifact?.artifactType === "image" &&
        contentRef.current.querySelector("img")
      ) {
        const img = contentRef.current.querySelector("img");
        if (img.complete) {
          const needsExtraPadding =
            img.naturalWidth < containerWidth * 0.7 &&
            img.naturalHeight < containerHeight * 0.7;
          setNeedsPadding(needsExtraPadding);
        } else {
          img.addEventListener(
            "load",
            () => {
              const needsExtraPadding =
                img.naturalWidth < containerWidth * 0.7 &&
                img.naturalHeight < containerHeight * 0.7;
              setNeedsPadding(needsExtraPadding);
            },
            { once: true }
          );
        }
      }
    };

    detectPaddingNeeds();
  }, [artifact, dimensions, paddingSize]);

  useEffect(() => {
    const calculateDimensions = () => {
      if (!containerRef.current) return;

      let newWidth = maxWidth;

      let newHeight = 600;

      if (
        artifact?.artifactType === "image" &&
        containerRef.current.querySelector("img")
      ) {
        const img = containerRef.current.querySelector("img");
        if (img.complete) {
          const aspectRatio = img.naturalWidth / img.naturalHeight;

          if (img.naturalWidth > maxWidth) {
            newHeight = maxWidth / aspectRatio;
          } else {
            newWidth = img.naturalWidth;
            newHeight = img.naturalHeight;
          }
        }
      }

      if (minHeight > 0) {
        newHeight = Math.max(minHeight, newHeight);
      }

      if (maxHeight > 0) {
        newHeight = Math.min(maxHeight, newHeight);
      }

      setDimensions({ width: newWidth, height: newHeight });
    };

    calculateDimensions();
    window.addEventListener("resize", calculateDimensions);

    return () => window.removeEventListener("resize", calculateDimensions);
  }, [artifact, maxWidth, maxHeight, minHeight]);

  const renderArtifactContent = () => {
    if (!artifact) return <div>No artifact available</div>;

    switch (artifact.artifactType) {
      case "image":
        return (
          <div className="artifact-image-container">
            <img
              src={artifact.artifactContent}
              alt={artifact.name || title || "Artifact image"}
              className="artifact-image"
              onLoad={() => {
                if (containerRef.current) {
                  const img = containerRef.current.querySelector("img");
                  if (img) {
                    const aspectRatio = img.naturalWidth / img.naturalHeight;
                    let newHeight;

                    if (img.naturalWidth > maxWidth) {
                      newHeight = maxWidth / aspectRatio;
                    } else {
                      newHeight = img.naturalHeight;
                    }

                    if (minHeight > 0) {
                      newHeight = Math.max(minHeight, newHeight);
                    }
                    if (maxHeight > 0) {
                      newHeight = Math.min(maxHeight, newHeight);
                    }

                    setDimensions({ width: maxWidth, height: newHeight });

                    if (paddingSize === "auto") {
                      const needsExtraPadding =
                        img.naturalWidth <
                          containerRef.current.clientWidth * 0.7 &&
                        img.naturalHeight <
                          containerRef.current.clientHeight * 0.7;
                      setNeedsPadding(needsExtraPadding);
                    }
                  }
                }
              }}
            />
          </div>
        );

      case "code":
        return (
          <div className="artifact-code-container">
            <iframe
              ref={iframeRef}
              className="artifact-code artifact-code-full-height"
              srcDoc={artifact.artifactContent}
              title={artifact.name || title || "Code artifact"}
              sandbox="allow-scripts allow-same-origin"
              frameBorder="0"
              scrolling="auto" // Always allow scrolling
            />
          </div>
        );

      default:
        return <div className="artifact-empty">No visualization available</div>;
    }
  };

  const getPaddingClass = () => {
    if (paddingSize === "auto") {
      return needsPadding ? "artifact-with-padding" : "";
    }

    switch (paddingSize) {
      case "xs":
        return "artifact-padding-xs";
      case "small":
        return "artifact-padding-small";
      case "medium":
        return "artifact-padding-medium";
      case "large":
        return "artifact-padding-large";
      case "xl":
        return "artifact-padding-xl";
      default:
        return "";
    }
  };

  const containerClasses = [
    "artifact-renderer",
    className,
    `artifact-type-${artifact?.artifactType || "none"}`,
    getPaddingClass(),
    expanded ? "artifact-expanded" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Handle special key events for entire artifact container
  const handleKeyDown = (e) => {
    if (e.key === "Escape" && expanded) {
      toggleExpand();
    }
  };

  return (
    <>
      {/* Render dark overlay behind the artifact when expanded */}
      {expanded && (
        <div className="artifact-overlay" onClick={toggleExpand}></div>
      )}

      <div
        id={containerId}
        ref={containerRef}
        className={containerClasses}
        tabIndex={expanded ? 0 : -1} // Make container focusable when expanded
        onKeyDown={handleKeyDown} // Listen for ESC on the container too
      >
        <div ref={contentRef} className="artifact-content">
          {renderArtifactContent()}
        </div>

        {/* Close button only visible when expanded */}
        {expanded && (
          <button
            className="artifact-close-btn"
            onClick={toggleExpand}
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>
    </>
  );
};

export default ArtifactRenderer;
