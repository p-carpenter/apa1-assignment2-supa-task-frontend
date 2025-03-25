import React from "react";
import styles from "./Modal.module.css";

/**
 * Renders a customisable modal dialog with configurable size and close behaviour
 * Includes backdrop overlay with click-to-close functionality and optional title
 *
 * @param {boolean} props.isOpen - Controls whether the modal is displayed
 * @param {Function} props.onClose - Handler function called when modal is closed
 * @param {string} [props.title] - Optional title text to display at the top of the modal
 * @param {ReactNode} props.children - Content to display within the modal body
 * @param {string} [props.className=""] - Additional CSS classes to apply to the modal
 * @param {string} [props.size="medium"] - Size of the modal: "small", "medium", or "large"
 * @param {boolean} [props.showCloseButton=true] - Whether to show the close button in the corner
 */
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
