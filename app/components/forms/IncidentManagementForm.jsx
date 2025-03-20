import React from "react";
import { ApiErrorMessage } from "../ui/errors";
import { SeverityInfo } from "../ui/shared";
import formStyles from "./FormStyles.module.css";
import {
  TextField,
  TextArea,
  SelectField,
  DateField,
  FileField,
  FormButtons,
  FormRow,
} from "./fields";

// Constants for reuse
const categories = [
  "Software",
  "Hardware",
  "Infrastructure",
  "Security",
  "Human Error",
  "External Factor",
];

const severityOptions = ["Low", "Moderate", "High", "Critical"];

// Component to display severity info button
const SeverityLabel = ({ toggleSeverityInfo }) => (
  <>
    Severity
    <button
      onClick={toggleSeverityInfo}
      style={{
        marginLeft: "5px",
        background: "none",
        border: "none",
        color: "#666",
        fontSize: "0.8rem",
        padding: "0 3px",
        cursor: "pointer",
        fontWeight: "bold",
        borderRadius: "50%",
      }}
      title="View severity level descriptions"
      type="button"
    >
      ?
    </button>
  </>
);

const IncidentManagementForm = ({
  // Form state
  formData,
  formErrors,
  isSubmitting,

  // Form handlers
  handleChange,
  handleSubmit,
  handleDateChange,
  handleArtifactTypeChange,

  // File state and handlers
  fileState,
  handleFileChange,

  // Severity info state and handler
  showSeverityInfo,
  toggleSeverityInfo,

  // Error handling
  apiError,

  // UI customization
  onClose,
  submitLabel,
  loadingLabel,

  // Edit mode specific props
  isEditMode = false,
  incident = null,
}) => {
  return (
    <form className={formStyles.form} onSubmit={handleSubmit} noValidate>
      {apiError && <ApiErrorMessage error={apiError} />}

      <TextField
        id="name"
        name="name"
        label="Incident Name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g., Morris Worm, Y2K Bug"
        error={formErrors.name}
        required
      />

      <FormRow>
        <DateField
          id="incident_date"
          name="incident_date"
          label="Date"
          value={formData.incident_date}
          onChange={handleDateChange}
          placeholder="DD-MM-YYYY"
          maxLength="10"
          error={formErrors.incident_date}
          required
          className={formStyles.thirdWidth}
          helperText="Year must be between 1980-2029"
        />

        <SelectField
          id="category"
          name="category"
          label="Category"
          value={formData.category}
          onChange={handleChange}
          options={categories}
          className={formStyles.thirdWidth}
        />

        <SelectField
          id="severity"
          name="severity"
          label={<SeverityLabel toggleSeverityInfo={toggleSeverityInfo} />}
          value={formData.severity}
          onChange={handleChange}
          options={severityOptions}
          className={formStyles.thirdWidth}
        />
      </FormRow>

      {showSeverityInfo && <SeverityInfo onClose={toggleSeverityInfo} />}

      <TextArea
        id="description"
        name="description"
        label="Description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Provide a description of the incident..."
        error={formErrors.description}
      />

      <SelectField
        id="artifactType"
        name="artifactType"
        label="Artifact Type"
        value={formData.artifactType}
        onChange={handleArtifactTypeChange}
        options={[
          { value: "none", label: "None" },
          { value: "code", label: "Code (HTML)" },
          { value: "image", label: "Image" },
        ]}
      />

      {formData.artifactType === "code" && (
        <TextArea
          id="artifactContent"
          name="artifactContent"
          label="HTML Code"
          value={formData.artifactContent}
          onChange={handleChange}
          placeholder="Enter HTML code here..."
          error={formErrors.artifactContent}
          helperText="HTML max individual dimensions: 863px (width), 768px (height). Anything larger and the page layout may break."
        />
      )}

      {formData.artifactType === "image" &&
      isEditMode &&
      incident?.artifactContent ? (
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="file">
            Upload New Image
          </label>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: "1" }}>
              <FileField
                id="file"
                name="file"
                onChange={handleFileChange}
                accept="image/*"
                error={formErrors.file || fileState.error}
                helperText="Max file size: 5MB"
                hideLabel
              />
            </div>

            <div style={{ flex: "1", textAlign: "center" }}>
              <small
                style={{
                  fontSize: "0.75rem",
                  color: "#666",
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                Current image
              </small>
              <img
                src={incident.artifactContent}
                alt="Current artifact"
                style={{
                  maxHeight: "80px",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        formData.artifactType === "image" && (
          <FileField
            id="file"
            name="file"
            label="Upload Image"
            onChange={handleFileChange}
            accept="image/*"
            error={formErrors.file || fileState.error}
            helperText="Max file size: 5MB"
          />
        )
      )}

      <FormButtons
        onCancel={onClose}
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        loadingLabel={loadingLabel}
      />
    </form>
  );
};

export default IncidentManagementForm;
