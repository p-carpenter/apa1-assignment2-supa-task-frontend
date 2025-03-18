import React, { useState } from "react";
import { useIncidents } from "../../contexts/IncidentContext";
import useForm from "../../hooks/forms/useForm";
import useFileUpload from "../../hooks/forms/useFileUpload";
import {
  validateMinLength,
  validateDateString,
  formatDateInput,
  convertDateForStorage,
} from "../../utils/formValidation";
import { handleAddNewIncident } from "../../catalog/crudHandlers";
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

const AddIncidentForm = ({ onClose }) => {
  const { setIncidents } = useIncidents();
  const [showSeverityInfo, setShowSeverityInfo] = useState(false);

  const validateForm = (data, fieldName = null) => {
    let errors = {};

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

    const nameValidation = validateMinLength(data.name, 3, "Incident Name");
    if (!nameValidation.isValid) errors.name = nameValidation.errorMessage;

    const dateValidation = validateDateString(data.incident_date);
    if (!dateValidation.isValid)
      errors.incident_date = dateValidation.errorMessage;

    const descValidation = validateMinLength(
      data.description,
      10,
      "Description"
    );
    if (!descValidation.isValid)
      errors.description = descValidation.errorMessage;

    if (data.artifactType === "code" && !data.artifactContent?.trim()) {
      errors.artifactContent =
        "HTML Code is required when Artifact Type is set to Code.";
    }

    if (data.artifactType === "image" && !fileState.data) {
      errors.file =
        "An image file is required when Artifact Type is set to Image.";
    }

    return errors;
  };

  const {
    formData,
    formErrors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit: submitForm,
    setErrors,
    setFieldValue,
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
    validateForm,
    handleSubmit
  );

  const { fileState, handleFileChange, clearFile } = useFileUpload({
    validationOptions: {
      maxSizeInMB: 2,
      maxWidth: 863,
      maxHeight: 768,
    },
    setFormErrors: setErrors,
  });

  const handleDateChange = (e) => {
    const formattedDate = formatDateInput(e.target.value);
    setFieldValue("incident_date", formattedDate);
  };

  const handleArtifactTypeChange = (e) => {
    const { value } = e.target;

    handleChange(e);

    if (value !== "image") {
      clearFile();
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

  const toggleSeverityInfo = (e) => {
    e.preventDefault();
    setShowSeverityInfo(!showSeverityInfo);
  };

  async function handleSubmit(data) {
    try {
      const storageFormattedData = {
        ...data,
        incident_date: data.incident_date
          ? convertDateForStorage(data.incident_date)
          : "",
      };

      const payload = {
        addition: storageFormattedData,
      };

      if (data.artifactType === "image" && fileState.data) {
        payload.fileData = fileState.data;
        payload.fileName = fileState.name;
        payload.fileType = fileState.type;
      }

      const result = await handleAddNewIncident(payload);

      if (typeof result === "string") {
        throw new Error(result);
      }

      setIncidents(result);
      onClose();
    } catch (error) {
      console.error("Error adding incident:", error);
      const errorMsg =
        error.message || "Failed to add incident. Please try again.";

      if (
        errorMsg.includes("file") ||
        errorMsg.includes("image") ||
        errorMsg.includes("upload")
      ) {
        setErrors((prev) => ({
          ...prev,
          file: `Artifact error: ${errorMsg}`,
        }));
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
            className={`${formStyles.formTextarea} ${formErrors.artifactContent ? formStyles.inputError : ""}`}
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
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="file">
            Upload Image
          </label>
          <input
            id="file"
            name="file"
            type="file"
            className={`${formStyles.formInput} ${formErrors.file || fileState.error ? formStyles.inputError : ""}`}
            accept="image/*"
            onChange={handleFileChange}
          />
          <small className={formStyles.helperText}>Max: 863x768, 2MB</small>
          {(formErrors.file || fileState.error) && (
            <div className={formStyles.formError}>
              {formErrors.file || fileState.error}
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
          {isSubmitting ? "Adding..." : "Add Incident"}
        </button>
      </div>
    </form>
  );
};

export default AddIncidentForm;
