import React from "react";
import styles from "./Modal.module.css";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  size = "medium", // small, medium, large
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const sizeClass =
    size === "small"
      ? styles.modalSm
      : size === "large"
        ? styles.modalLg
        : styles.modalMd;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${sizeClass} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            className={styles.closeModal}
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        )}
        {title && <h2 className={styles.modalTitle}>{title}</h2>}
        <div className={styles.modalContent}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
