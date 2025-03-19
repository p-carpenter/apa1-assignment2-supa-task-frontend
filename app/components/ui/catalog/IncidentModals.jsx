import React, { useState } from "react";
import Modal from "../modals/Modal";
import BaseIncidentForm from "../../forms/BaseIncidentForm";
import { useIncidents } from "../../../contexts/IncidentContext";
import useForm from "../../../hooks/forms/useForm";
import useFileUpload from "../../../hooks/forms/useFileUpload";
import {
  validateIncidentForm,
  formatDateInput,
  formatDateForDisplay,
  parseDate,
} from "../../../utils/formValidation";
import {
  handleAddNewIncident,
  handleUpdateIncident,
} from "../../../catalog/crudHandlers";
import { handleApiError } from "../../../utils/api/errors/errorHandling";

/**
 * Component for incident-related modals (add/edit) with form logic
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
  const { setIncidents } = useIncidents();

  // ===== Add Form State and Handlers =====
  const [addFormApiError, setAddFormApiError] = useState(null);
  const [addFormShowSeverityInfo, setAddFormShowSeverityInfo] = useState(false);

  // Add form setup with useForm hook
  const {
    formData: addFormData,
    formErrors: addFormErrors,
    isSubmitting: isAddFormSubmitting,
    handleChange: handleAddFormChange,
    handleSubmit: submitAddForm,
    setErrors: setAddFormErrors,
    setFieldValue: setAddFormFieldValue,
  } = useForm(
    {
      name: "",
      incident_date: "",
      category: "Software",
      severity: "Moderate",
      description: "",
      artifactType: "none",
      artifactContent: "",
    },
    validateIncidentForm,
    handleAddFormSubmit
  );

  // File upload for add form
  const {
    fileState: addFileState,
    handleFileChange: handleAddFileChange,
    clearFile: clearAddFile,
  } = useFileUpload({
    validationOptions: {
      maxSizeInMB: 2,
      maxWidth: 863,
      maxHeight: 768,
    },
    setFormErrors: setAddFormErrors,
  });

  // Error handler for add form
  const updateAddFormErrors = (modifyFn) => {
    const currentErrors = { ...addFormErrors };
    const updatedErrors = modifyFn(currentErrors);
    setAddFormErrors(updatedErrors);
  };

  // Date change handler for add form
  const handleAddFormDateChange = (e) => {
    const formattedDate = formatDateInput(e.target.value);
    setAddFormFieldValue("incident_date", formattedDate);
  };

  // Artifact type change handler for add form
  const handleAddFormArtifactTypeChange = (e) => {
    const { value } = e.target;
    handleAddFormChange(e);
    setAddFormApiError(null);

    if (value !== "image") {
      clearAddFile();
      updateAddFormErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.file;
        return newErrors;
      });
    }

    if (value !== "code") {
      updateAddFormErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.artifactContent;
        return newErrors;
      });
    }
  };

  // Toggle severity info for add form
  const toggleAddFormSeverityInfo = (e) => {
    e.preventDefault();
    setAddFormShowSeverityInfo(!addFormShowSeverityInfo);
  };

  // Submit handler for add form
  async function handleAddFormSubmit(data) {
    try {
      setAddFormApiError(null);

      const storageFormattedData = {
        ...data,
        incident_date: data.incident_date
          ? parseDate(data.incident_date)?.toISOString()
          : "",
      };

      const payload = {
        addition: storageFormattedData,
      };

      if (data.artifactType === "image" && addFileState.data) {
        payload.fileData = addFileState.data;
        payload.fileName = addFileState.name;
        payload.fileType = addFileState.type;
      }

      const result = await handleAddNewIncident(payload);

      if (typeof result === "string") {
        throw new Error(result);
      }

      setIncidents(result);
      closeAddModal();
    } catch (error) {
      console.error("Error adding incident:", error);

      // Use standardized error handling
      const standardError = handleApiError(error, {
        defaultMessage: "Failed to add incident. Please try again.",
      });

      // Special handling for file/image errors
      if (
        error.message.includes("file") ||
        error.message.includes("image") ||
        error.message.includes("upload")
      ) {
        updateAddFormErrors((prevErrors) => ({
          ...prevErrors,
          file: `Artifact error: ${error.message}`,
        }));
      } else {
        setAddFormApiError(standardError);
      }

      return { error: standardError.message };
    }
  }

  // Retry and dismiss handlers for add form
  const handleAddFormRetry = () => {
    setAddFormApiError(null);
    submitAddForm(new Event("submit"));
  };

  const handleAddFormDismiss = () => {
    setAddFormApiError(null);
  };

  // ===== Edit Form State and Handlers =====
  const [editFormApiError, setEditFormApiError] = useState(null);
  const [editFormShowSeverityInfo, setEditFormShowSeverityInfo] =
    useState(false);

  // Get initial form values for edit form
  const getInitialEditFormValues = () => {
    if (!selectedIncidents || !selectedIncidents[currentEditIndex]) {
      return {
        name: "",
        incident_date: "",
        category: "Software",
        severity: "Low",
        description: "",
        artifactType: "none",
        artifactContent: "",
      };
    }

    const incident = selectedIncidents[currentEditIndex];
    return {
      name: incident.name || "",
      incident_date: formatDateForDisplay(incident.incident_date) || "",
      category: incident.category || "Software",
      severity: incident.severity || "Low",
      description: incident.description || "",
      artifactType: incident.artifactType || "none",
      artifactContent: incident.artifactContent || "",
    };
  };

  // Edit form setup with useForm hook
  const {
    formData: editFormData,
    formErrors: editFormErrors,
    isSubmitting: isEditFormSubmitting,
    handleChange: handleEditFormChange,
    handleSubmit: submitEditForm,
    setErrors: setEditFormErrors,
    setFieldValue: setEditFormFieldValue,
    setValues: setEditFormValues,
  } = useForm(
    getInitialEditFormValues(),
    validateIncidentForm,
    handleEditFormSubmit
  );

  // File upload for edit form
  const {
    fileState: editFileState,
    handleFileChange: handleEditFileChange,
    clearFile: clearEditFile,
  } = useFileUpload({
    validationOptions: {
      maxSizeInMB: 2,
      maxWidth: 863,
      maxHeight: 768,
    },
    setFormErrors: setEditFormErrors,
  });

  // Error handler for edit form
  const updateEditFormErrors = (modifyFn) => {
    const currentErrors = { ...editFormErrors };
    const updatedErrors = modifyFn(currentErrors);
    setEditFormErrors(updatedErrors);
  };

  // Reset form values when currentEditIndex changes
  React.useEffect(() => {
    if (showEditModal && selectedIncidents && selectedIncidents.length > 0) {
      setEditFormValues(getInitialEditFormValues());
      clearEditFile();
      setEditFormApiError(null);
    }
  }, [currentEditIndex, showEditModal, selectedIncidents]);

  // Date change handler for edit form
  const handleEditFormDateChange = (e) => {
    const formattedDate = formatDateInput(e.target.value);
    setEditFormFieldValue("incident_date", formattedDate);
  };

  // Artifact type change handler for edit form
  const handleEditFormArtifactTypeChange = (e) => {
    const { value } = e.target;
    handleEditFormChange(e);
    setEditFormApiError(null);

    if (value !== "image") {
      clearEditFile();
      updateEditFormErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.file;
        return newErrors;
      });
    }

    if (value !== "code") {
      updateEditFormErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.artifactContent;
        return newErrors;
      });
    }
  };

  // Toggle severity info for edit form
  const toggleEditFormSeverityInfo = (e) => {
    e.preventDefault();
    setEditFormShowSeverityInfo(!editFormShowSeverityInfo);
  };

  // Submit handler for edit form
  async function handleEditFormSubmit(data) {
    try {
      setEditFormApiError(null);

      const currentIncident = selectedIncidents[currentEditIndex];

      const storageFormattedData = {
        ...data,
        incident_date: data.incident_date
          ? parseDate(data.incident_date)?.toISOString()
          : "",
      };

      const payload = {
        id: currentIncident.id,
        update: storageFormattedData,
      };

      if (data.artifactType === "image" && editFileState.data) {
        payload.fileData = editFileState.data;
        payload.fileName = editFileState.name;
        payload.fileType = editFileState.type;
      }

      const result = await handleUpdateIncident(payload);

      if (typeof result === "string") {
        throw new Error(result);
      }

      setIncidents(result);
      moveToNextEdit();
    } catch (error) {
      console.error("Error updating incident:", error);

      // Use standardized error handling
      const standardError = handleApiError(error, {
        defaultMessage: "Failed to update incident. Please try again.",
      });

      // Special handling for file/image errors
      if (
        error.message.includes("file") ||
        error.message.includes("image") ||
        error.message.includes("upload")
      ) {
        updateEditFormErrors((prevErrors) => ({
          ...prevErrors,
          file: `Artifact error: ${error.message}`,
        }));
      } else {
        setEditFormApiError(standardError);
      }

      return { error: standardError.message };
    }
  }

  // Retry and dismiss handlers for edit form
  const handleEditFormRetry = () => {
    setEditFormApiError(null);
    submitEditForm(new Event("submit"));
  };

  const handleEditFormDismiss = () => {
    setEditFormApiError(null);
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
          <BaseIncidentForm
            // Form state
            formData={addFormData}
            formErrors={addFormErrors}
            isSubmitting={isAddFormSubmitting}
            // Form handlers
            handleChange={handleAddFormChange}
            handleSubmit={submitAddForm}
            handleDateChange={handleAddFormDateChange}
            handleArtifactTypeChange={handleAddFormArtifactTypeChange}
            // File state and handlers
            fileState={addFileState}
            handleFileChange={handleAddFileChange}
            // Severity info state and handler
            showSeverityInfo={addFormShowSeverityInfo}
            toggleSeverityInfo={toggleAddFormSeverityInfo}
            // Error handling
            apiError={addFormApiError}
            onRetry={handleAddFormRetry}
            onDismiss={handleAddFormDismiss}
            // UI customization
            onClose={closeAddModal}
            submitLabel="Add Incident"
            loadingLabel="Adding..."
            // Edit mode specific props
            isEditMode={false}
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
          <BaseIncidentForm
            // Form state
            formData={editFormData}
            formErrors={editFormErrors}
            isSubmitting={isEditFormSubmitting}
            // Form handlers
            handleChange={handleEditFormChange}
            handleSubmit={submitEditForm}
            handleDateChange={handleEditFormDateChange}
            handleArtifactTypeChange={handleEditFormArtifactTypeChange}
            // File state and handlers
            fileState={editFileState}
            handleFileChange={handleEditFileChange}
            // Severity info state and handler
            showSeverityInfo={editFormShowSeverityInfo}
            toggleSeverityInfo={toggleEditFormSeverityInfo}
            // Error handling
            apiError={editFormApiError}
            onRetry={handleEditFormRetry}
            onDismiss={handleEditFormDismiss}
            // UI customization
            onClose={closeEditModal}
            submitLabel={`Save ${currentEditIndex === selectedIncidents.length - 1 ? "Changes" : "& Continue"}`}
            loadingLabel="Saving..."
            // Edit mode specific props
            isEditMode={true}
            incident={selectedIncidents[currentEditIndex]}
          />
        </Modal>
      )}
    </>
  );
};

export default IncidentModals;
