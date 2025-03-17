import React, { useState, useEffect, useRef } from "react";
import "./ArtifactRenderer.css";

const ArtifactRenderer = ({
  artifact,
  maxWidth = 863,
  maxHeight = 768,
  minHeight = 0,
  title,
  className = "",
  containerId = "artifact-container",
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
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const adjustIfScrollbarsAppear = () => {
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
              scrolling="auto"
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
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div id={containerId} ref={containerRef} className={containerClasses}>
      <div ref={contentRef} className="artifact-content">
        {renderArtifactContent()}
      </div>
    </div>
  );
};

export default ArtifactRenderer;
