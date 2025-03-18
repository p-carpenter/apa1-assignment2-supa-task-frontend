import React, { useState, useEffect, useCallback } from "react";
import { useIncidents } from "../../contexts/IncidentContext";
import useForm from "../../hooks/forms/useForm";
import useFileUpload from "../../hooks/forms/useFileUpload";
import {
  validateMinLength,
  validateDateString,
  formatDateInput,
  convertDateForStorage,
} from "../../utils/formValidation";
import { handleUpdateIncident } from "../../catalog/crudHandlers";
import { SeverityInfo } from "../ui/shared";
import formStyles from "./FormStyles.module.css";
import {
  TextField,
  TextArea,
  SelectField,
  DateField,
  FileField,
  FormButtons,
  FormErrorMessage,
  FormRow
} from "./fields";

const categories = [
  "Software",
  "Hardware",
  "Infrastructure",
  "Security",
  "Human Error",
  "External Factor",
];

const severityOptions = ["Low", "Moderate", "High", "Critical"];

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

  const validateForm = useCallback((data, fieldName = null) => {
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

    return errors;
  }, []);

  const {
    formData,
    formErrors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit: submitForm,
    setErrors,
    setValues,
    setFieldValue,
  } = useForm(getInitialFormValues(), validateForm, handleSubmit);

  // Custom error handler to modify specific errors
  const updateErrors = (modifyFn) => {
    // Get the current form errors
    const currentErrors = { ...formErrors };
    // Apply the modification function
    const updatedErrors = modifyFn(currentErrors);
    // Set the updated errors
    setErrors(updatedErrors);
  };

  const { fileState, handleFileChange, clearFile } = useFileUpload({
    validationOptions: {
      maxSizeInMB: 2,
      maxWidth: 863,
      maxHeight: 768,
    },
    setFormErrors: setErrors,
  });

  useEffect(() => {
    setValues(getInitialFormValues());
    clearFile();
  }, [incident, getInitialFormValues, setValues, clearFile]);

  const handleDateChange = (e) => {
    const formattedDate = formatDateInput(e.target.value);
    setFieldValue("incident_date", formattedDate);
  };

  const handleArtifactTypeChange = (e) => {
    const { value } = e.target;

    handleChange(e);

    if (value !== "image") {
      clearFile();
      
      // Remove the file error by creating a new error object without the file property
      updateErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors.file;
        return newErrors;
      });
    }

    if (value !== "code") {
      // Remove the artifactContent error
      updateErrors(prevErrors => {
        const newErrors = { ...prevErrors };
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
        id: incident.id,
        update: storageFormattedData,
      };

      if (data.artifactType === "image" && fileState.data) {
        payload.fileData = fileState.data;
        payload.fileName = fileState.name;
        payload.fileType = fileState.type;
      }

      const result = await handleUpdateIncident(payload);

      if (typeof result === "string") {
        throw new Error(result);
      }

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

      if (
        errorMsg.includes("file") ||
        errorMsg.includes("image") ||
        errorMsg.includes("upload")
      ) {
        updateErrors(prevErrors => ({
          ...prevErrors,
          file: `Artifact error: ${errorMsg}`,
        }));
        return { error: errorMsg };
      } else {
        return { error: errorMsg };
      }
    }
  }

  // Create a custom severity label with question mark button
  const SeverityLabel = () => (
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

  return (
    <form className={formStyles.form} onSubmit={submitForm} noValidate>
      <FormErrorMessage message={submitError} />

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
          label={<SeverityLabel />}
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
          { value: "image", label: "Image" }
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
          helperText="HTML max dimensions: 863x768. Anything larger and the page layout may break."
        />
      )}

      {formData.artifactType === "image" && (
        <div className={formStyles.formGroup}>
          <label className={formStyles.formLabel} htmlFor="file">
            Upload New Image
          </label>
          <div style={{
            display: "flex",
            gap: "1rem",
            alignItems: "flex-start"
          }}>
            <div style={{ flex: "1" }}>
              <FileField
                id="file"
                name="file"
                onChange={handleFileChange}
                accept="image/*"
                error={formErrors.file || fileState.error}
                helperText="Max: 863x768, 2MB"
                hideLabel
              />
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
        </div>
      )}

      <FormButtons
        onCancel={onClose}
        isSubmitting={isSubmitting}
        submitLabel={onNext ? "Save & Continue" : "Save Changes"}
        loadingLabel="Saving..."
      />
    </form>
  );
};

export default EditIncidentForm;