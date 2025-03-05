import React from 'react';

const InfoModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="info-overlay" onClick={onClose}>
      <div className="info-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="close-modal"
          onClick={onClose}
        >
          ×
        </button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default InfoModal;
