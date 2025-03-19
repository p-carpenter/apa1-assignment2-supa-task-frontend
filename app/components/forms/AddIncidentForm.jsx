import React from "react";
import BaseIncidentForm from "./BaseIncidentForm";

/**
 * Add Incident Form - UI-only wrapper around BaseIncidentForm
 */
const AddIncidentForm = ({
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
      submitLabel="Add Incident"
      loadingLabel="Adding..."
      isEditMode={false}
    />
  );
};

export default AddIncidentForm;
