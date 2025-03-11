
export const getPaddingSizeForArtifact = (incident) => {
  if (!incident) return "auto";

  
  if (incident.artifactType === "image") {
    
    if (incident.preferredHeight) {
      if (incident.preferredHeight < 150) return "xl";
      if (incident.preferredHeight < 250) return "large";
      if (incident.preferredHeight < 400) return "medium";
    }

    
    if (incident.width < 300 || incident.height < 200) return "large";
  }

  
  

  
  return "auto";
};
