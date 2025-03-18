// app/components/ui/artifacts/ArtifactRenderer.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useIframe } from "@/app/hooks/ui";
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
  const { iframeRef, dimensions } = useIframe({
    maxWidth,
    maxHeight,
    minHeight,
    preferredHeight: artifact?.preferredHeight || 500,
    content: artifact?.artifactContent,
  });

  const [needsPadding, setNeedsPadding] = useState(false);
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  // Memoized function to detect if padding is needed
  const detectPaddingNeeds = useCallback(() => {
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
  }, [artifact, paddingSize]);

  useEffect(() => {
    detectPaddingNeeds();
  }, [artifact, dimensions, detectPaddingNeeds]);

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

  // Get the CSS class for artifact type
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

  // Check for transparent style in className string
  const isTransparent =
    className.includes("artifact_transparent") ||
    className.includes("artifact-transparent");

  // Build CSS classes string
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
  // Custom comparison function to determine if a re-render is needed
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
