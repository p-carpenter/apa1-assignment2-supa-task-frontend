import React from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className = '',
  size = 'medium',  // small, medium, large
  showCloseButton = true 
}) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    small: 'modal-sm',
    medium: 'modal-md',
    large: 'modal-lg'
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal ${sizeClasses[size]} ${className}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            className="close-modal"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        )}
        {title && <h2 className="modal-title">{title}</h2>}
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;