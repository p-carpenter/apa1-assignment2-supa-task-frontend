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

  const toggleExpand = () => {
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);
    if (onExpand) {
      onExpand(newExpandedState);
    }
  };

  useEffect(() => {
    const adjustIfScrollbarsAppear = () => {
      if (iframeRef.current) {
        try {
          const iframe = iframeRef.current;
          iframe.setAttribute("scrolling", "no");

          iframe.onload = () => {
            try {
              const iframeDoc =
                iframe.contentDocument || iframe.contentWindow.document;
              const iframeBody = iframeDoc.body;

              iframeDoc.body.addEventListener("click", (e) => {
                e.preventDefault();
                toggleExpand();
              });

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
  }, [artifact]);

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
            <div className="artifact-code-overlay" onClick={toggleExpand}></div>

            <iframe
              ref={iframeRef}
              className="artifact-code artifact-code-full-height"
              srcDoc={artifact.artifactContent}
              title={artifact.name || title || "Code artifact"}
              sandbox="allow-scripts allow-same-origin"
              frameBorder="0"
              scrolling="no"
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

  return (
    <div
      id={containerId}
      ref={containerRef}
      className={containerClasses}
      style={{}}
      onClick={toggleExpand}
    >
      <div ref={contentRef} className="artifact-content">
        {renderArtifactContent()}
      </div>
    </div>
  );
};

export default ArtifactRenderer;
