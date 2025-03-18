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
import { ApiErrorMessage } from "../ui/errors";
import { ERROR_TYPES } from "../../utils/api/errors/errorHandling";
import formStyles from "./FormStyles.module.css";
import {
  TextField,
  TextArea,
  SelectField,
  DateField,
  FileField,
  FormButtons,
  FormErrorMessage,
  FormRow,
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

const AddIncidentForm = ({
  onClose,
  apiError: externalApiError,
  onRetry: externalRetry,
  onDismiss: externalDismiss,
  onError,
}) => {
  const { setIncidents } = useIncidents();
  const [showSeverityInfo, setShowSeverityInfo] = useState(false);
  const [internalApiError, setInternalApiError] = useState(null);

  // Use external error if provided, otherwise use internal
  const apiError = externalApiError || internalApiError;

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

    if (
      data.artifactType === "code" &&
      (!data.artifactContent?.trim() ||
        !data.artifactContent.includes("<html>"))
    ) {
      errors.artifactContent =
        "HTML code is required when Artifact Type is set to Code. Remember to add a <html> tag.";
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

  const handleDateChange = (e) => {
    const formattedDate = formatDateInput(e.target.value);
    setFieldValue("incident_date", formattedDate);
  };

  const handleArtifactTypeChange = (e) => {
    const { value } = e.target;

    handleChange(e);

    // Clear API error when making changes
    setInternalApiError(null);

    if (value !== "image") {
      clearFile();

      // Remove the file error by creating a new error object without the file property
      updateErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.file;
        return newErrors;
      });
    }

    if (value !== "code") {
      // Remove the artifactContent error
      updateErrors((prevErrors) => {
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

  const handleRetry = () => {
    if (externalApiError && externalRetry) {
      externalRetry();
    } else {
      setInternalApiError(null);
      submitForm(new Event("submit"));
    }
  };

  const handleDismiss = () => {
    if (externalApiError && externalDismiss) {
      externalDismiss();
    } else {
      setInternalApiError(null);
    }
  };

  async function handleSubmit(data) {
    try {
      setInternalApiError(null);

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

      // Handle standardized error object
      if (error.type) {
        if (onError) {
          onError(error);
        } else {
          setInternalApiError(error);
        }
        return { error: error.message };
      }

      // Legacy error handling - convert to standardized errors
      let standardizedError = null;

      if (
        error.message.includes("file") ||
        error.message.includes("image") ||
        error.message.includes("upload")
      ) {
        updateErrors((prevErrors) => ({
          ...prevErrors,
          file: `Artifact error: ${error.message}`,
        }));
      } else if (error.status === 413) {
        standardizedError = {
          type: ERROR_TYPES.FILE_TOO_LARGE,
          message: "File is too large. Maximum size is 2MB.",
        };
      } else if (error.status === 401 || error.status === 403) {
        standardizedError = {
          type: ERROR_TYPES.PERMISSION_DENIED,
          message:
            "You don't have permission to perform this action. Please log in again.",
        };
      } else if (error.status === 400) {
        standardizedError = {
          type: ERROR_TYPES.VALIDATION_ERROR,
          message:
            "Invalid data submitted. Please check the form and try again.",
        };
      } else {
        standardizedError = {
          type: ERROR_TYPES.UNKNOWN_ERROR,
          message: error.message || "Failed to add incident. Please try again.",
        };
      }

      if (standardizedError) {
        if (onError) {
          onError(standardizedError);
        } else {
          setInternalApiError(standardizedError);
        }
      }

      return {
        error: error.message || "Failed to add incident. Please try again.",
      };
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
      {apiError && (
        <ApiErrorMessage
          error={apiError}
          onRetry={handleRetry}
          onDismiss={handleDismiss}
        />
      )}

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
          helperText="HTML max dimensions: 863x768. Anything larger and the page layout may break."
        />
      )}

      {formData.artifactType === "image" && (
        <FileField
          id="file"
          name="file"
          label="Upload Image"
          onChange={handleFileChange}
          accept="image/*"
          error={formErrors.file || fileState.error}
          helperText="Max: 863x768, 2MB"
        />
      )}

      <FormButtons
        onCancel={onClose}
        isSubmitting={isSubmitting}
        submitLabel="Add Incident"
        loadingLabel="Adding..."
      />
    </form>
  );
};

export default AddIncidentForm;
