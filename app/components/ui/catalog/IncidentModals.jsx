import React, { useState } from "react";
import Modal from "../modals/Modal";
import AddIncidentForm from "../../forms/AddIncidentForm";
import EditIncidentForm from "../../forms/EditIncidentForm";
import { ERROR_TYPES } from "../../../utils/api/errors/errorHandling";

/**
 * Component for incident-related modals (add/edit)
 *
 * @param {Object} props - Component props
 * @param {boolean} props.showAddModal - Whether to show add modal
 * @param {Function} props.closeAddModal - Function to close add modal
 * @param {boolean} props.showEditModal - Whether to show edit modal
 * @param {Function} props.closeEditModal - Function to close edit modal
 * @param {Array} props.selectedIncidents - Selected incidents for editing
 * @param {number} props.currentEditIndex - Current index in edit sequence
 * @param {Function} props.moveToNextEdit - Function to move to next incident in edit sequence
 * @returns {React.ReactElement} Modal components
 */
const IncidentModals = ({
  showAddModal,
  closeAddModal,
  showEditModal,
  closeEditModal,
  selectedIncidents,
  currentEditIndex,
  moveToNextEdit,
}) => {
  const [addFormApiError, setAddFormApiError] = useState(null);

  const handleAddFormRetry = () => {
    setAddFormApiError(null);
    // The form will handle the retry internally
  };

  const handleAddFormDismiss = () => {
    setAddFormApiError(null);
  };

  const [editFormApiError, setEditFormApiError] = useState(null);

  const handleEditFormRetry = () => {
    setEditFormApiError(null);
  };

  const handleEditFormDismiss = () => {
    setEditFormApiError(null);
  };

  const handleFormError = (error, setErrorFn) => {
    if (error.type) {
      setErrorFn(error);
    } else {
      setErrorFn({
        type: ERROR_TYPES.UNKNOWN_ERROR,
        message: error.message || "An error occurred",
      });
    }
  };

  return (
    <>
      {/* Add New Incident Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={closeAddModal}
          title="Add New Technical Incident"
          size="large"
        >
          <AddIncidentForm
            onClose={closeAddModal}
            apiError={addFormApiError}
            onRetry={handleAddFormRetry}
            onDismiss={handleAddFormDismiss}
            onError={(error) => handleFormError(error, setAddFormApiError)}
          />
        </Modal>
      )}

      {/* Edit Incident Modal */}
      {showEditModal && selectedIncidents.length > 0 && (
        <Modal
          isOpen={showEditModal}
          onClose={closeEditModal}
          title={`Edit Incident (${currentEditIndex + 1}/${selectedIncidents.length})`}
          size="large"
        >
          <EditIncidentForm
            incident={selectedIncidents[currentEditIndex]}
            onClose={closeEditModal}
            onNext={moveToNextEdit}
            apiError={editFormApiError}
            onRetry={handleEditFormRetry}
            onDismiss={handleEditFormDismiss}
            onError={(error) => handleFormError(error, setEditFormApiError)}
          />
        </Modal>
      )}
    </>
  );
};

export default IncidentModals;
