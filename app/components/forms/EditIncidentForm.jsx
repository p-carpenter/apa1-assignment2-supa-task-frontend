import React from "react";
import BaseIncidentForm from "./BaseIncidentForm";

/**
 * Edit Incident Form - UI-only wrapper around BaseIncidentForm
 */
const EditIncidentForm = ({
  formData,
  formErrors,
  isSubmitting,
  handleChange,
  handleSubmit,
  handleDateChange,
  handleArtifactTypeChange,
  fileState,
  handleFileChange,
  showSeverityInfo,
  toggleSeverityInfo,
  apiError,
  onRetry,
  onDismiss,
  onClose,
  onNext,
  incident,
}) => {
  return (
    <BaseIncidentForm
      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      handleDateChange={handleDateChange}
      handleArtifactTypeChange={handleArtifactTypeChange}
      fileState={fileState}
      handleFileChange={handleFileChange}
      showSeverityInfo={showSeverityInfo}
      toggleSeverityInfo={toggleSeverityInfo}
      apiError={apiError}
      onRetry={onRetry}
      onDismiss={onDismiss}
      onClose={onClose}
      submitLabel={onNext ? "Save & Continue" : "Save Changes"}
      loadingLabel="Saving..."
      isEditMode={true}
      incident={incident}
    />
  );
};

export default EditIncidentForm;
