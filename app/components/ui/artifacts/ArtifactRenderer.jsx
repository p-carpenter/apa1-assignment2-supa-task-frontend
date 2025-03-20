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
  idealWidth = 863,
  idealHeight = 650,
  scaleUpSmallImages = true,
}) => {
  const [iframeDimensions, setIframeDimensions] = useState({
    width: maxWidth,
    height: Math.min(maxHeight, Math.max(minHeight || 500)),
  });

  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const imageRef = useRef(null);


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

    if (iframe.contentDocument?.readyState === "complete") {
      handleLoad();
    }
  }, [artifact, maxWidth, maxHeight, minHeight]);


  const handleImageLoad = (e) => {
    if (!imageRef.current) return;

    const img = imageRef.current;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    const aspectRatio = naturalWidth / naturalHeight;

    const isNearIdealWidth =
      Math.abs(naturalWidth - idealWidth) < idealWidth * 0.1;
    const isNearIdealHeight =
      Math.abs(naturalHeight - idealHeight) < idealHeight * 0.1;

    // If image is already near ideal size, keep original dimensions
    if (isNearIdealWidth && isNearIdealHeight) {
      setImageDimensions({
        width: naturalWidth,
        height: naturalHeight,
      });
      return;
    }

    // Image is larger than max dimensions
    if (naturalWidth > maxWidth || naturalHeight > maxHeight) {
      // Determine which dimension is the constraint
      if (naturalWidth / maxWidth > naturalHeight / maxHeight) {
        // Width is the constraint
        const newWidth = maxWidth;
        const newHeight = newWidth / aspectRatio;
        setImageDimensions({
          width: newWidth,
          height: newHeight,
        });
      } else {
        // Height is the constraint
        const newHeight = maxHeight;
        const newWidth = newHeight * aspectRatio;
        setImageDimensions({
          width: newWidth,
          height: newHeight,
        });
      }
      return;
    }

    // Image is smaller than ideal dimensions
    if (
      scaleUpSmallImages &&
      naturalWidth < idealWidth &&
      naturalHeight < idealHeight
    ) {
      const scaleToWidth = idealWidth / naturalWidth;
      const scaleToHeight = idealHeight / naturalHeight;

      const scaleFactor = Math.min(scaleToWidth, scaleToHeight);

      const newWidth = naturalWidth * scaleFactor;
      const newHeight = naturalHeight * scaleFactor;

      if (newWidth <= maxWidth && newHeight <= maxHeight) {
        setImageDimensions({
          width: newWidth,
          height: newHeight,
        });
        return;
      }
    }

    // Image is between min and max size
    setImageDimensions({
      width: naturalWidth,
      height: naturalHeight,
    });
  };

  const renderArtifactContent = () => {
    if (!artifact) return <div>No artifact available</div>;

    switch (artifact.artifactType) {
      case "image":
        return (
          <div className={styles.imageContainer}>
            <img
              ref={imageRef}
              src={artifact.artifactContent}
              alt={artifact.name || title || "Artifact image"}
              className={styles.image}
              style={{
                width: imageDimensions.width
                  ? `${imageDimensions.width}px`
                  : "auto",
                height: imageDimensions.height
                  ? `${imageDimensions.height}px`
                  : "auto",
              }}
              onLoad={handleImageLoad}
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
    className.includes("artifactTransparent") ||
    className.includes("artifact-transparent");

  const containerClasses = [
    styles.renderer,
    getArtifactTypeClass(),
    isTransparent
      ? artifact?.artifactType === "image"
        ? styles.transparentImage
        : styles.transparent
      : "",
    className,
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
