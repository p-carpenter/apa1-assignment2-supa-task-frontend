import React from "react";
import layoutStyles from "../../layouts/Layout.module.css";
import styles from "../../../catalog/Catalog.module.css";

/**
 * Admin controls for catalog management
 *
 * @param {Object} props - Component props
 * @param {boolean} props.selectionMode - Whether selection mode is active
 * @param {Function} props.toggleSelectionMode - Function to toggle selection mode
 * @param {Function} props.handleAddNew - Function to handle adding new incident
 * @param {Function} props.handleDelete - Function to handle deleting incidents
 * @param {Function} props.handleEdit - Function to handle editing incidents
 * @param {boolean} props.isLoading - Whether data is loading
 * @param {boolean} props.hasFilteredIncidents - Whether there are incidents to select
 * @param {Array} props.selectedIncidents - Array of selected incidents
 * @param {boolean} props.isDeleting - Whether delete operation is in progress
 */
const AdminControls = ({
  selectionMode,
  toggleSelectionMode,
  handleAddNew,
  handleDelete,
  handleEdit,
  isLoading,
  hasFilteredIncidents,
  selectedIncidents,
  isDeleting,
}) => {
  return (
    <div className={styles.adminControls}>
      {!selectionMode ? (
        <>
          <button
            className={`${layoutStyles.homeButton} ${styles.adminButton}`}
            data-testid="add-incident-button"
            id="add-incident"
            onClick={handleAddNew}
            disabled={isLoading}
          >
            Add New
          </button>
          <button
            className={`${layoutStyles.homeButton} ${styles.adminButton}`}
            id="select-incident"
            onClick={toggleSelectionMode}
            disabled={isLoading || !hasFilteredIncidents}
          >
            Select
          </button>
        </>
      ) : (
        <>
          <button
            className={`${layoutStyles.homeButton} ${styles.adminButton}`}
            id="cancel-selection"
            onClick={toggleSelectionMode}
          >
            Cancel
          </button>
          <button
            className={`${layoutStyles.homeButton} ${styles.adminButton} ${selectedIncidents.length === 0 ? styles.disabled : ""}`}
            onClick={handleDelete}
            disabled={isDeleting || selectedIncidents.length === 0}
            id="delete-incident"
          >
            {`Delete (${selectedIncidents.length})`}
          </button>
          <button
            className={`${layoutStyles.homeButton} ${styles.adminButton} ${selectedIncidents.length === 0 ? styles.disabled : ""}`}
            onClick={handleEdit}
            disabled={selectedIncidents.length === 0}
            id="edit-incident"
          >
            {`Edit (${selectedIncidents.length})`}
          </button>
        </>
      )}
    </div>
  );
};

export default AdminControls;
