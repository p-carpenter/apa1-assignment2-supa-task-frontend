import React from "react";
import Modal from "../modals/Modal";
import AddIncidentForm from "../../forms/AddIncidentForm";
import EditIncidentForm from "../../forms/EditIncidentForm";

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
          <AddIncidentForm onClose={closeAddModal} />
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
          />
        </Modal>
      )}
    </>
  );
};

export default IncidentModals;
