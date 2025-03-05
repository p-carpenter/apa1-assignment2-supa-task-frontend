import React from 'react';

const CatalogHeader = ({ title, subtitle, showGlitch = true }) => {
  return (
    <>
      <h1 className="archive-title">
        {showGlitch ? (
          <span className="title-glitch" data-text={title}>
            {title}
          </span>
        ) : (
          title
        )}
        <span className="cursor"></span>
      </h1>
      {subtitle && <h2 className="archive-subtitle">{subtitle}</h2>}
    </>
  );
};

export default CatalogHeader;
