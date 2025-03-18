import React from "react";
import styles from "@/app/Homepage.module.css";

const InfoModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.infoOverlay} onClick={onClose}>
      <div className={styles.infoModal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeModal}
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default InfoModal;
