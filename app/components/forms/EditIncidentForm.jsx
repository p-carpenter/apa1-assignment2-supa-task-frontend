import React, { useState, useEffect } from "react";
import { useIncidents } from "../../contexts/IncidentContext";
import { handleUpdateIncident } from "../../catalog/crudHandlers";

const EditIncidentForm = ({ incident, onClose, onNext }) => {
  const { setIncidents } = useIncidents();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [showSeverityInfo, setShowSeverityInfo] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    incident_date: "",
    category: "Software",
    severity: "Low",
    description: "",
    artifactType: "none",
    artifactContent: "",
  });
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    if (incident) {
      let displayDate = "";
      if (incident.incident_date) {
        const date = new Date(incident.incident_date);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        displayDate = `${day}-${month}-${year}`;
      }

      setFormData({
        name: incident.name || "",
        incident_date: displayDate,
        category: incident.category || "Software",
        severity: incident.severity || "Low",
        description: incident.description || "",
        artifactType: incident.artifactType || "none",
        artifactContent: incident.artifactContent || "",
      });

      setFormErrors({});
      setFileError("");
    }
  }, [incident]);

  const categories = [
    "Software",
    "Hardware",
    "Infrastructure",
    "Security",
    "Human Error",
    "External Factor",
  ];

  const severityOptions = ["Low", "Moderate", "High", "Critical"];

  const validateFields = () => {
    let errors = {};

    if (!formData.name.trim()) {
      errors.name = "Incident Name is required.";
    } else if (formData.name.trim().length < 3) {
      errors.name = "Incident Name must be at least 3 characters.";
    }

    if (!formData.incident_date.trim()) {
      errors.incident_date = "Date is required.";
    } else {
      const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
      if (!dateRegex.test(formData.incident_date)) {
        errors.incident_date =
          "Please enter a valid date in DD-MM-YYYY format.";
      } else {
        const match = formData.incident_date.match(dateRegex);
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const year = parseInt(match[3], 10);
        const inputDate = new Date(year, month, day);

        if (
          inputDate.getFullYear() !== year ||
          inputDate.getMonth() !== month ||
          inputDate.getDate() !== day
        ) {
          errors.incident_date = "This date doesn't exist in the calendar.";
        } else {
          const minDate = new Date(1980, 0, 1);
          const maxDate = new Date(2029, 11, 31);

          if (inputDate < minDate) {
            errors.incident_date = "Date must be on or after 01-01-1980.";
          } else if (inputDate > maxDate) {
            errors.incident_date = "Date must be on or before 31-12-2029.";
          }
        }
      }
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required.";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters.";
    }

    if (formData.artifactType === "code" && !formData.artifactContent.trim()) {
      errors.artifactContent =
        "HTML Code is required when Artifact Type is set to Code.";
    }

    if (formData.artifactType === "image" && fileData && fileError) {
      errors.file = fileError;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case "name":
        if (!value.trim()) {
          error = "Incident Name is required.";
        } else if (value.trim().length < 3) {
          error = "Incident Name must be at least 3 characters.";
        }
        break;

      case "description":
        if (!value.trim()) {
          error = "Description is required.";
        } else if (value.trim().length < 10) {
          error = "Description must be at least 10 characters.";
        }
        break;

      case "incident_date":
        if (!value.trim()) {
          error = "Date is required.";
        } else {
          const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
          if (!dateRegex.test(value)) {
            error = "Please enter a valid date in DD-MM-YYYY format.";
          } else {
            const match = value.match(dateRegex);
            const day = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1;
            const year = parseInt(match[3], 10);
            const inputDate = new Date(year, month, day);

            if (
              inputDate.getFullYear() !== year ||
              inputDate.getMonth() !== month ||
              inputDate.getDate() !== day
            ) {
              error = "This date doesn't exist in the calendar.";
            } else {
              const minDate = new Date(1980, 0, 1);
              const maxDate = new Date(2029, 11, 31);

              if (inputDate < minDate) {
                error = "Date must be on or after 01-01-1980.";
              } else if (inputDate > maxDate) {
                error = "Date must be on or before 31-12-2029.";
              }
            }
          }
        }
        break;

      case "artifactContent":
        if (formData.artifactType === "code" && !value.trim()) {
          error = "HTML Code is required when Artifact Type is set to Code.";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (["name", "description", "artifactContent"].includes(name)) {
      const error = validateField(name, value);

      setFormErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }

    if (name === "artifactType") {
      if (value !== "image") {
        setFileError("");
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.file;
          return newErrors;
        });
      }

      if (value !== "code") {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.artifactContent;
          return newErrors;
        });
      }
    }
  };

  const handleDateChange = (e) => {
    const input = e.target.value;

    let formattedDate = input;

    const digits = input.replace(/\D/g, "");

    if (digits.length <= 2) {
      formattedDate = digits;
    } else if (digits.length <= 4) {
      formattedDate = `${digits.substring(0, 2)}-${digits.substring(2)}`;
    } else if (digits.length <= 8) {
      formattedDate = `${digits.substring(0, 2)}-${digits.substring(2, 4)}-${digits.substring(4, 8)}`;
    }

    setFormData((prev) => ({
      ...prev,
      incident_date: formattedDate,
    }));

    const error = validateField("incident_date", formattedDate);
    setFormErrors((prev) => ({
      ...prev,
      incident_date: error,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError("");

    if (!file) {
      setFileData(null);
      setFileName(null);
      setFileType(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFileError("Selected file is not an image.");
      setFileData(null);
      setFileName(null);
      setFileType(null);
      setFormErrors((prev) => ({
        ...prev,
        file: "Selected file is not an image.",
      }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFileError("Image size must be less than 2MB.");
      setFileData(null);
      setFileName(null);
      setFileType(null);
      setFormErrors((prev) => ({
        ...prev,
        file: "Image size must be less than 2MB.",
      }));
      return;
    }

    setFileName(file.name);
    setFileType(file.type);

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileData(event.target.result);

      const img = new Image();
      img.onload = function () {
        if (this.width > 863 || this.height > 768) {
          setFileError("Image dimensions should not exceed 863x768 pixels.");
          setFormErrors((prev) => ({
            ...prev,
            file: "Image dimensions should not exceed 863x768 pixels.",
          }));
        } else {
          setFormErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.file;
            return newErrors;
          });
        }
      };
      img.src = event.target.result;
    };

    reader.onerror = () => {
      setFileError("Error reading file. Please try again.");
      setFormErrors((prev) => ({
        ...prev,
        file: "Error reading file. Please try again.",
      }));
    };

    reader.readAsDataURL(file);
  };

  const toggleSeverityInfo = (e) => {
    e.preventDefault();
    setShowSeverityInfo(!showSeverityInfo);
  };

  const hasError = (fieldName) => {
    return formErrors[fieldName] ? true : false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    if (!validateFields()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const [inputDay, inputMonth, inputYear] =
        formData.incident_date.split("-");
      const storageDate = `${inputYear}-${inputMonth}-${inputDay}`;

      const storageFormattedData = {
        ...formData,
        incident_date: storageDate,
      };

      const payload = {
        id: incident.id,
        update: storageFormattedData,
      };

      if (formData.artifactType === "image" && fileData) {
        payload.fileData = fileData;
        payload.fileName = fileName;
        payload.fileType = fileType;
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
        setFileError(`Artifact error: ${errorMsg}`);
      } else {
        setErrorMessage(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="modal-form" onSubmit={handleSubmit} noValidate>
      {errorMessage && <div className="form-error-message">{errorMessage}</div>}

      <div className="form-group" style={{ marginBottom: "10px" }}>
        <label className="form-label" htmlFor="name">
          Incident Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className={`form-input ${hasError("name") ? "input-error" : ""}`}
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Morris Worm, Y2K Bug"
        />
        {formErrors.name && <div className="form-error">{formErrors.name}</div>}
      </div>

      <div className="form-row">
        <div
          className="form-group"
          style={{ marginBottom: "10px", width: "30%" }}
        >
          <label className="form-label" htmlFor="incident_date">
            Date *
          </label>
          <input
            id="incident_date"
            name="incident_date"
            type="text"
            className={`form-input ${hasError("incident_date") ? "input-error" : ""}`}
            value={formData.incident_date}
            onChange={handleDateChange}
            placeholder="DD-MM-YYYY"
            maxLength="10"
            style={{ width: "100%" }}
          />
          {formErrors.incident_date && (
            <div className="form-error">{formErrors.incident_date}</div>
          )}
          <small style={{ fontSize: "0.7rem", color: "#666" }}>
            Year must be between 1980-2029
          </small>
        </div>

        <div
          className="form-group"
          style={{ marginBottom: "10px", width: "35%" }}
        >
          <label className="form-label" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            className="form-select"
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

        <div
          className="form-group"
          style={{ marginBottom: "10px", width: "35%" }}
        >
          <label className="form-label" htmlFor="severity">
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
            >
              ?
            </button>
          </label>
          <select
            id="severity"
            name="severity"
            className="form-select"
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

      {showSeverityInfo && (
        <div
          style={{
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            backgroundColor: "#f9f9f9",
            fontSize: "0.8rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
            }}
          >
            <strong>Severity</strong>
            <button
              onClick={toggleSeverityInfo}
              style={{
                background: "none",
                border: "none",
                color: "#666",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              Close
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "5px",
            }}
          >
            <div style={{ fontWeight: "bold" }}>Low:</div>
            <div>
              Minor/localized impact, quickly resolved, little disruption.
            </div>

            <div style={{ fontWeight: "bold" }}>Moderate:</div>
            <div>Noticeable disruption, but limited in scale or duration.</div>

            <div style={{ fontWeight: "bold" }}>High:</div>
            <div>Widespread impact, major disruptions, difficult recovery.</div>

            <div style={{ fontWeight: "bold" }}>Critical:</div>
            <div>Catastrophic failure with long-term consequences.</div>
          </div>
        </div>
      )}

      <div className="form-group" style={{ marginBottom: "10px" }}>
        <label className="form-label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className={`form-textarea ${hasError("description") ? "input-error" : ""}`}
          style={{ height: "70px" }}
          value={formData.description}
          onChange={handleChange}
          placeholder="Provide a description of the incident..."
        />
        {formErrors.description && (
          <div className="form-error">{formErrors.description}</div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group" style={{ marginBottom: "10px" }}>
          <label className="form-label" htmlFor="artifactType">
            Artifact Type
          </label>
          <select
            id="artifactType"
            name="artifactType"
            className="form-select"
            value={formData.artifactType}
            onChange={handleChange}
          >
            <option value="none">None</option>
            <option value="code">Code (HTML)</option>
            <option value="image">Image</option>
          </select>
        </div>
      </div>

      {formData.artifactType === "code" && (
        <div className="form-group" style={{ marginBottom: "10px" }}>
          <label className="form-label" htmlFor="artifactContent">
            HTML Code
          </label>
          <textarea
            id="artifactContent"
            name="artifactContent"
            className={`form-textarea ${hasError("artifactContent") ? "input-error" : ""}`}
            style={{ height: "80px" }}
            value={formData.artifactContent}
            onChange={handleChange}
            placeholder="Enter HTML code here..."
          />
          <small style={{ fontSize: "0.7rem", color: "#666" }}>
            HTML max dimensions: 863x768. Anything larger and the page layout
            may break.
          </small>
          {formErrors.artifactContent && (
            <div className="form-error">{formErrors.artifactContent}</div>
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
            <label className="form-label" htmlFor="file">
              Upload New Image
            </label>
            <input
              id="file"
              name="file"
              type="file"
              className={`form-input ${hasError("file") || fileError ? "input-error" : ""}`}
              accept="image/*"
              onChange={handleFileChange}
            />
            <small style={{ fontSize: "0.7rem", color: "#666" }}>
              Max: 863x768, 2MB
            </small>
            {(formErrors.file || fileError) && (
              <div className="form-error">{formErrors.file || fileError}</div>
            )}
          </div>

          {incident.artifactContent && (
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

      <div className="form-buttons">
        <button
          type="button"
          className="form-button-cancel"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="form-button-submit"
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
