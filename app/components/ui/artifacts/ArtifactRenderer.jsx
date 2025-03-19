import React, { useState, useEffect, useRef } from "react";
import styles from "./ArtifactRenderer.module.css";

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
  const [iframeDimensions, setIframeDimensions] = useState({
    width: maxWidth,
    height: Math.min(
      maxHeight,
      Math.max(minHeight, artifact?.preferredHeight || 500)
    ),
  });

  const iframeRef = useRef(null);
  const [needsPadding, setNeedsPadding] = useState(false);
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  // Handle iframe dimensions adjustment
  useEffect(() => {
    if (!iframeRef.current || artifact?.artifactType !== "code") return;

    const iframe = iframeRef.current;
    iframe.setAttribute("scrolling", "auto");

    const handleLoad = () => {
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

          setIframeDimensions({
            width: contentWidth,
            height: contentHeight,
          });
        }
      } catch (err) {
        console.warn("Could not adjust iframe dimensions:", err);
      }
    };

    iframe.onload = handleLoad;

    // Try to adjust dimensions if content was already loaded
    if (iframe.contentDocument?.readyState === "complete") {
      handleLoad();
    }
  }, [artifact, maxWidth, maxHeight, minHeight]);

  // Calculate padding based on content size
  useEffect(() => {
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
  }, [artifact, iframeDimensions, paddingSize]);

  const renderArtifactContent = () => {
    if (!artifact) return <div>No artifact available</div>;

    switch (artifact.artifactType) {
      case "image":
        return (
          <div className={styles.imageContainer}>
            <img
              src={artifact.artifactContent}
              alt={artifact.name || title || "Artifact image"}
              className={styles.image}
            />
          </div>
        );

      case "code":
        return (
          <div className={styles.codeContainer}>
            <iframe
              ref={iframeRef}
              className={styles.codeFullHeight}
              srcDoc={artifact.artifactContent}
              title={artifact.name || title || "Code artifact"}
              sandbox="allow-scripts allow-same-origin"
              frameBorder="0"
              scrolling="auto"
            />
          </div>
        );

      default:
        return <div className={styles.empty}>No visualization available</div>;
    }
  };

  const getPaddingClass = () => {
    if (paddingSize === "auto") {
      return needsPadding ? styles.withPadding : "";
    }

    switch (paddingSize) {
      case "xs":
        return styles.paddingXs;
      case "small":
        return styles.paddingSmall;
      case "medium":
        return styles.paddingMedium;
      case "large":
        return styles.paddingLarge;
      case "xl":
        return styles.paddingXl;
      default:
        return "";
    }
  };

  const getArtifactTypeClass = () => {
    if (!artifact?.artifactType) return "";

    switch (artifact.artifactType) {
      case "image":
        return styles.typeImage;
      case "code":
        return styles.typeCode;
      default:
        return "";
    }
  };

  const isTransparent =
    className.includes("artifact_transparent") ||
    className.includes("artifact-transparent");

  const containerClasses = [
    styles.renderer,
    getArtifactTypeClass(),
    getPaddingClass(),
    isTransparent
      ? artifact?.artifactType === "image"
        ? styles.transparentImage
        : styles.transparent
      : "",
    className, // keep original classes for backward compatibility
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div id={containerId} ref={containerRef} className={containerClasses}>
      <div ref={contentRef} className={styles.content}>
        {renderArtifactContent()}
      </div>
    </div>
  );
};

export default React.memo(ArtifactRenderer, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.artifact?.id === nextProps.artifact?.id &&
    prevProps.artifact?.artifactContent ===
      nextProps.artifact?.artifactContent &&
    prevProps.maxWidth === nextProps.maxWidth &&
    prevProps.maxHeight === nextProps.maxHeight &&
    prevProps.className === nextProps.className &&
    prevProps.paddingSize === nextProps.paddingSize
  );
});
