import React, { useState, useEffect, useReducer, useCallback } from "react";
import { useIncidents } from "../../contexts/IncidentContext";
import useForm from "../../hooks/forms/useForm";
import {
  validateMinLength,
  validateDateString,
  validateImageFile,
  formatDateInput,
  convertDateForStorage,
} from "../../utils/formValidation";
import { handleUpdateIncident } from "../../catalog/crudHandlers";
import { SeverityInfo } from "../ui/shared";
import formStyles from "./FormStyles.module.css";
import buttonStyles from "@/app/components/ui/buttons/Button.module.css";

const categories = [
  "Software",
  "Hardware",
  "Infrastructure",
  "Security",
  "Human Error",
  "External Factor",
];

const severityOptions = ["Low", "Moderate", "High", "Critical"];

// File state reducer
const fileReducer = (state, action) => {
  switch (action.type) {
    case "SET_FILE":
      return {
        ...state,
        data: action.payload.data,
        name: action.payload.name,
        type: action.payload.type,
        error: "",
      };
    case "CLEAR_FILE":
      return {
        data: null,
        name: null,
        type: null,
        error: "",
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        data: null,
        name: null,
        type: null,
      };
    default:
      return state;
  }
};

// Helper function to format date from YYYY-MM-DD to DD-MM-YYYY
const formatDateForDisplay = (dateString) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

const EditIncidentForm = ({ incident, onClose, onNext }) => {
  const { setIncidents } = useIncidents();
  const [showSeverityInfo, setShowSeverityInfo] = useState(false);

  // Use the fileReducer to manage file state
  const [fileState, dispatchFile] = useReducer(fileReducer, {
    data: null,
    name: null,
    type: null,
    error: "",
  });

  // Initial form values
  const getInitialFormValues = useCallback(() => {
    if (!incident) {
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

    return {
      name: incident.name || "",
      incident_date: formatDateForDisplay(incident.incident_date),
      category: incident.category || "Software",
      severity: incident.severity || "Low",
      description: incident.description || "",
      artifactType: incident.artifactType || "none",
      artifactContent: incident.artifactContent || "",
    };
  }, [incident]);

  // Form validation function
  const validateForm = useCallback(
    (data, fieldName = null) => {
      let errors = {};

      // If a specific field is provided, only validate that field
      if (fieldName) {
        switch (fieldName) {
          case "name":
            const nameValidation = validateMinLength(
              data.name,
              3,
              "Incident Name"
            );
            if (!nameValidation.isValid)
              errors.name = nameValidation.errorMessage;
            break;

          case "description":
            const descValidation = validateMinLength(
              data.description,
              10,
              "Description"
            );
            if (!descValidation.isValid)
              errors.description = descValidation.errorMessage;
            break;

          case "incident_date":
            const dateValidation = validateDateString(data.incident_date);
            if (!dateValidation.isValid)
              errors.incident_date = dateValidation.errorMessage;
            break;

          case "artifactContent":
            if (data.artifactType === "code" && !data.artifactContent?.trim()) {
              errors.artifactContent =
                "HTML Code is required when Artifact Type is set to Code.";
            }
            break;
        }
        return errors;
      }

      // Otherwise, validate all fields
      // Name validation
      const nameValidation = validateMinLength(data.name, 3, "Incident Name");
      if (!nameValidation.isValid) errors.name = nameValidation.errorMessage;

      // Date validation
      const dateValidation = validateDateString(data.incident_date);
      if (!dateValidation.isValid)
        errors.incident_date = dateValidation.errorMessage;

      // Description validation
      const descValidation = validateMinLength(
        data.description,
        10,
        "Description"
      );
      if (!descValidation.isValid)
        errors.description = descValidation.errorMessage;

      // Artifact validation
      if (data.artifactType === "code" && !data.artifactContent?.trim()) {
        errors.artifactContent =
          "HTML Code is required when Artifact Type is set to Code.";
      }

      // Only validate file if a new file is being uploaded
      if (data.artifactType === "image" && fileState.data && fileState.error) {
        errors.file = fileState.error;
      }

      return errors;
    },
    [fileState.data, fileState.error]
  );

  // Initialize the form using our custom hook
  const {
    formData,
    formErrors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit: submitForm,
    setErrors,
    setValues,
  } = useForm(getInitialFormValues(), validateForm, handleSubmit);

  // Update form values when incident changes
  useEffect(() => {
    setValues(getInitialFormValues());
    dispatchFile({ type: "CLEAR_FILE" });
  }, [incident, getInitialFormValues, setValues]);

  // Date change handler
  const handleDateChange = (e) => {
    const formattedDate = formatDateInput(e.target.value);

    const syntheticEvent = {
      target: {
        name: "incident_date",
        value: formattedDate,
      },
    };

    handleChange(syntheticEvent);
  };

  // File change handler with validation
  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      dispatchFile({ type: "CLEAR_FILE" });
      return;
    }

    try {
      // Validate the file
      const fileValidation = await validateImageFile(file);

      if (!fileValidation.isValid) {
        dispatchFile({
          type: "SET_ERROR",
          payload: fileValidation.errorMessage,
        });
        setErrors((prev) => ({
          ...prev,
          file: fileValidation.errorMessage,
        }));
        return;
      }

      // Read the file
      const reader = new FileReader();
      reader.onload = (event) => {
        dispatchFile({
          type: "SET_FILE",
          payload: {
            data: event.target.result,
            name: file.name,
            type: file.type,
          },
        });

        // Clear the file error if validation passed
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.file;
          return newErrors;
        });
      };

      reader.onerror = () => {
        dispatchFile({
          type: "SET_ERROR",
          payload: "Error reading file. Please try again.",
        });
        setErrors((prev) => ({
          ...prev,
          file: "Error reading file. Please try again.",
        }));
      };

      reader.readAsDataURL(file);
    } catch (error) {
      dispatchFile({
        type: "SET_ERROR",
        payload: "Error processing file. Please try again.",
      });
      setErrors((prev) => ({
        ...prev,
        file: "Error processing file. Please try again.",
      }));
    }
  };

  // Custom handler for artifactType changes
  const handleArtifactTypeChange = (e) => {
    const { value } = e.target;

    // First handle the normal field change
    handleChange(e);

    // Clear errors based on the new artifact type
    if (value !== "image") {
      dispatchFile({ type: "CLEAR_FILE" });
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.file;
        return newErrors;
      });
    }

    if (value !== "code") {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.artifactContent;
        return newErrors;
      });
    }
  };

  // Toggle severity info panel
  const toggleSeverityInfo = (e) => {
    e.preventDefault();
    setShowSeverityInfo(!showSeverityInfo);
  };

  // Handler for the form submission
  async function handleSubmit(data) {
    try {
      // Convert the date format from DD-MM-YYYY to YYYY-MM-DD for storage
      const storageFormattedData = {
        ...data,
        incident_date: data.incident_date
          ? convertDateForStorage(data.incident_date)
          : "",
      };

      const payload = {
        id: incident.id,
        update: storageFormattedData,
      };

      // Add file data if present
      if (data.artifactType === "image" && fileState.data) {
        payload.fileData = fileState.data;
        payload.fileName = fileState.name;
        payload.fileType = fileState.type;
      }

      const result = await handleUpdateIncident(payload);

      if (typeof result === "string") {
        throw new Error(result);
      }

      // Update incidents and close or continue
      setIncidents(result);

      if (onNext) {
        onNext();
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Error updating incident:", error);
      const errorMsg =
        error.message || "Failed to update incident. Please try again.";

      // Handle file-specific errors
      if (
        errorMsg.includes("file") ||
        errorMsg.includes("image") ||
        errorMsg.includes("upload")
      ) {
        dispatchFile({
          type: "SET_ERROR",
          payload: `Artifact error: ${errorMsg}`,
        });
        return { error: errorMsg };
      } else {
        return { error: errorMsg };
      }
    }
  }

  return (
    <form className={formStyles.form} onSubmit={submitForm} noValidate>
      {submitError && (
        <div className={formStyles.formErrorMessage}>{submitError}</div>
      )}

      <div className={formStyles.formGroup}>
        <label className={formStyles.formLabel} htmlFor="name">
          Incident Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className={`${formStyles.formInput} ${formErrors.name ? formStyles.inputError : ""}`}
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Morris Worm, Y2K Bug"
        />
        {formErrors.name && (
          <div className={formStyles.formError}>{formErrors.name}</div>
        )}
      </div>

      <div className={formStyles.formRow}>
        <div className={`${formStyles.formGroup} ${formStyles.thirdWidth}`}>
          <label className={formStyles.formLabel} htmlFor="incident_date">
            Date *
          </label>
          <input
            id="incident_date"
            name="incident_date"
            type="text"
            className={`${formStyles.formInput} ${formErrors.incident_date ? formStyles.inputError : ""}`}
            value={formData.incident_date}
            onChange={handleDateChange}
            placeholder="DD-MM-YYYY"
            maxLength="10"
          />
          {formErrors.incident_date && (
            <div className={formStyles.formError}>
              {formErrors.incident_date}
            </div>
          )}
          <small className={formStyles.helperText}>
            Year must be between 1980-2029
          </small>
        </div>

        <div className={`${formStyles.formGroup} ${formStyles.thirdWidth}`}>
          <label className={formStyles.formLabel} htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            className={formStyles.formSelect}
            value={formData.category}
            onChange={handleChange}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className={`${formStyles.formGroup} ${formStyles.thirdWidth}`}>
          <label className={formStyles.formLabel} htmlFor="severity">
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
          </label>
          <select
            id="severity"
            name="severity"
            className={formStyles.formSelect}
            value={formData.severity}
            onChange={handleChange}
          >
            {severityOptions.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showSeverityInfo && <SeverityInfo onClose={toggleSeverityInfo} />}

      <div className={formStyles.formGroup}>
        <label className={formStyles.formLabel} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className={`${formStyles.formTextarea} ${formErrors.description ? formStyles.inputError : ""}`}
          value={formData.description}
          onChange={handleChange}
          placeholder="Provide a description of the incident..."
        />
        {formErrors.description && (
          <div className={formStyles.formError}>{formErrors.description}</div>
        )}
      </div>

      <div className={formStyles.formRow}>
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="artifactType">
            Artifact Type
          </label>
          <select
            id="artifactType"
            name="artifactType"
            className={formStyles.formSelect}
            value={formData.artifactType}
            onChange={handleArtifactTypeChange}
          >
            <option value="none">None</option>
            <option value="code">Code (HTML)</option>
            <option value="image">Image</option>
          </select>
        </div>
      </div>

      {formData.artifactType === "code" && (
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="artifactContent">
            HTML Code
          </label>
          <textarea
            id="artifactContent"
            name="artifactContent"
            className={`${styles.formTextarea} ${formErrors.artifactContent ? styles.inputError : ""}`}
            value={formData.artifactContent}
            onChange={handleChange}
            placeholder="Enter HTML code here..."
          />
          <small className={formStyles.helperText}>
            HTML max dimensions: 863x768. Anything larger and the page layout
            may break.
          </small>
          {formErrors.artifactContent && (
            <div className={formStyles.formError}>
              {formErrors.artifactContent}
            </div>
          )}
        </div>
      )}

      {formData.artifactType === "image" && (
        <div
          style={{
            marginBottom: "10px",
            display: "flex",
            alignItems: "flex-start",
            gap: "15px",
          }}
        >
          <div style={{ flex: "1" }}>
            <label className={formStyles.formLabel} htmlFor="file">
              Upload New Image
            </label>
            <input
              id="file"
              name="file"
              type="file"
              className={`${formStyles.formInput} ${formErrors.file || fileState.error ? styles.inputError : ""}`}
              accept="image/*"
              onChange={handleFileChange}
            />
            <small className={formStyles.helperText}>Max: 863x768, 2MB</small>
            {(formErrors.file || fileState.error) && (
              <div className={styles.formError}>
                {formErrors.file || fileState.error}
              </div>
            )}
          </div>

          {incident?.artifactContent && (
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
          )}
        </div>
      )}

      <div className={formStyles.formButtons}>
        <button
          type="button"
          className={`${buttonStyles.button} ${buttonStyles.primary}`}
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`${buttonStyles.button} ${buttonStyles.primary} ${isSubmitting ? buttonStyles.loading : ""}`}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : onNext
              ? "Save & Continue"
              : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default EditIncidentForm;
