import React from 'react';

const MuseumInfo = ({ 
  title = "INCIDENT ARCHIVE", 
  description, 
  contributionNote 
}) => {
  const defaultDescription = "This historical collection documents significant technological failures that have shaped computing safety protocols and standards. Each case study represents lessons learned through technological crisis.";
  
  const defaultContributionNote = "Registered members can submit and edit documentation for technical incidents.";

  return (
    <div className="console-section museum-info">
      <div className="museum-header">{title}</div>
      <div className="museum-description">
        {description || defaultDescription}
      </div>
      <div className="contribution-note">
        <strong>Contribute to the Archive:</strong> {contributionNote || defaultContributionNote}
      </div>
    </div>
  );
};

export default MuseumInfo;
