import React, { useMemo, useState, useEffect, useRef } from "react";
import ArtifactRenderer from "@/app/components/ui/artifacts/ArtifactRenderer";
import { useTheme } from "@/app/contexts/ThemeContext";
import styles from "./GalleryExhibit.module.css";
import "/public/css-reskins/systemcss/systemcss.css";
import "/public/css-reskins/98css/style.css";

const getGridGapClass = (artifact) => {
  if (!artifact) return styles.gap_medium;
  return styles.gap_medium;
};

const GalleryExhibit = ({ incident }) => {
  if (!incident) return null;

  const { getPaddingSizeForArtifact, IncidentDetailsWindows } = useTheme();
  const [artifactSize, setArtifactSize] = useState("normal");
  const artifactRef = useRef(null);

  // Debug state to track measurements
  const [debugInfo, setDebugInfo] = useState({});

  const paddingSize = useMemo(() => {
    return getPaddingSizeForArtifact(incident);
  }, [incident, getPaddingSizeForArtifact]);

  const gridGapClass = useMemo(() => {
    return getGridGapClass(incident);
  }, [incident]);

  const hasArtifactContent = useMemo(() => {
    return incident && incident.artifactType && incident.artifactContent;
  }, [incident]);

  // Determine section position class based on artifact size
  const artifactSectionClass = useMemo(() => {
    if (artifactSize === "small") return styles.artifact_small;
    if (artifactSize === "tiny") return styles.artifact_tiny;
    return "";
  }, [artifactSize]);

  // Measure and analyze the artifact after rendering
  useEffect(() => {
    // Default to normal size
    setArtifactSize("normal");
    setDebugInfo({});

    if (!incident?.artifactType || !artifactRef.current) {
      // If no iframe is found, default to normal size
      setArtifactSize("small");
    }

    const container = artifactRef.current;
    const info = {
      artifactType: incident.artifactType,
      containerWidth: container.offsetWidth,
      containerHeight: container.offsetHeight,
    };

    if (incident.artifactType === "image") {
      const img = container.querySelector("img");
      if (img) {
        const checkImageSize = () => {
          if (!img.complete) return;
          info.imgWidth = img.naturalWidth;
          info.imgHeight = img.naturalHeight;
          info.complete = img.complete;
          setDebugInfo(info);

          if (info.imgWidth < 450 || info.imgHeight < 350) {
            setArtifactSize("small");
          }
          if (info.imgWidth < 150 || info.imgHeight < 100) {
            setArtifactSize("tiny");
          }
        };

        checkImageSize();
        if (!img.complete) {
          img.addEventListener("load", checkImageSize, { once: true });
        }
      }
    }
    else if (incident.artifactType === "code") {
      const iframe = container.querySelector("iframe");

      if (iframe) {
        const checkIframeSize = () => {
          info.iframeWidth = iframe.width || iframe.offsetWidth;
          info.iframeHeight = iframe.height || iframe.offsetHeight;

          try {
            const iframeDoc =
              iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              info.contentWidth = iframeDoc.body.scrollWidth;
              info.contentHeight = iframeDoc.body.scrollHeight;
              info.contentDocAvailable = true;
            }
          } catch (e) {
            info.contentDocError = e.message;
          }

          if (info.iframeWidth && info.iframeHeight) {
            if (info.iframeWidth > 600 && info.iframeHeight > 300) {
              setArtifactSize("normal");
            }
            else if (info.iframeWidth < 300 || info.iframeHeight < 200) {
              setArtifactSize("small");
            }
            if (info.iframeWidth < 250 || info.iframeHeight < 150) {
              setArtifactSize("tiny");
            }
          }

        };

        // Initial check
        setTimeout(checkIframeSize, 100);

        iframe.addEventListener(
          "load",
          () => {
            // Measure again after iframe loads
            setTimeout(checkIframeSize, 100);
          },
          { once: true }
        );
      }
    }
  }, [incident?.id, incident?.artifactType]);

  return (
    <div className={styles.container}>
      <div className={styles.window}>
        {/* Background image */}
        <img
          src="/wall.jpg"
          className={styles.background_image}
          alt="Background"
        />
        <div className={styles.main_content}>
          <div className={`${styles.incident_wrapper} ${gridGapClass}`}>
            <div
              className={`${styles.artifact_section} ${artifactSectionClass}`}
            >
              <div className={styles.artifact_container} ref={artifactRef}>
                <ArtifactRenderer
                  artifact={incident}
                  className={styles.artifact_transparent}
                  paddingSize={paddingSize}
                  maxWidth={hasArtifactContent ? undefined : 600}
                  maxHeight={undefined}
                />

              </div>
              <div className={styles.pedestal}>
                <img
                  src="/pedestal.png"
                  className={styles.pedestal_image}
                  alt="Pedestal"
                />
              </div>
            </div>

            {/* Details section with decade-specific component */}
            <div className={styles.details_section}>
              <div
                className={styles.details_window}
                style={{
                  padding: 0,
                  background: "transparent",
                  border: "none",
                  filter: "drop-shadow(0px 10px 12px rgba(0, 0, 0, 0.4))",
                }}
              >
                <IncidentDetailsWindows incident={incident} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryExhibit;
