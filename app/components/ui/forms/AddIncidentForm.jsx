import React, { useState } from "react";
import { useIncidents } from "../../../contexts/IncidentContext";
import { handleAddNewIncident } from "../../../catalog/crudHandlers";

const AddIncidentForm = ({ onClose }) => {
  const { setIncidents } = useIncidents();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [showSeverityInfo, setShowSeverityInfo] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    incident_date: "",
    category: "Software",
    severity: "Moderate", // Changed default from "3" to "Moderate"
    description: "",
    cause: "",
    consequences: "",
    time_to_resolve: "",
    artifactType: "none",
    artifactContent: "",
  });
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [fileType, setFileType] = useState(null);

  const categories = [
    "Software",
    "Hardware",
    "Infrastructure",
    "Security",
    "Human Error",
    "External Factor",
  ];

  const severityOptions = ["Low", "Moderate", "High", "Critical"];

  // Function to convert YYYY-MM-DD to DD-MM-YYYY for display
  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}-${month}-${year}`;
  };

  // Function to convert DD-MM-YYYY to YYYY-MM-DD for internal use
  const formatDateForStorage = (displayDate) => {
    if (!displayDate) return "";
    const [day, month, year] = displayDate.split("-");
    return `${year}-${month}-${day}`;
  };

  const validateFields = () => {
    let errors = {};
    if (!formData.name) errors.name = "Incident Name is required.";
    if (!formData.incident_date) errors.incident_date = "Date is required.";
    if (!formData.description) errors.description = "Description is required.";

    // Enhanced date validation for DD-MM-YYYY format
    const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
    if (formData.incident_date) {
      if (!dateRegex.test(formData.incident_date)) {
        errors.incident_date =
          "Please enter a valid date in DD-MM-YYYY format.";
      } else {
        // Parse the date string
        const match = formData.incident_date.match(dateRegex);
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // Months are 0-indexed in JS Date
        const year = parseInt(match[3], 10);
        const inputDate = new Date(year, month, day);

        // Check if date is valid (e.g., not Feb 30)
        if (
          inputDate.getFullYear() !== year ||
          inputDate.getMonth() !== month ||
          inputDate.getDate() !== day
        ) {
          errors.incident_date = "This date doesn't exist in the calendar.";
        }
        // Check date range (1980-01-01 to 2029-12-31)
        else {
          const minDate = new Date(1980, 0, 1); // Jan 1, 1980
          const maxDate = new Date(2029, 11, 31); // Dec 31, 2029

          if (inputDate < minDate) {
            errors.incident_date = "Date must be on or after 01-01-1980.";
          } else if (inputDate > maxDate) {
            errors.incident_date = "Date must be on or before 31-12-2029.";
          }
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Special handler for the date field to enforce DD-MM-YYYY format
  const handleDateChange = (e) => {
    const input = e.target.value;

    // Allow typing with hyphens automatically added
    let formattedDate = input;

    // Remove any non-digit characters
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
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setFileType(file.type);

      const reader = new FileReader();
      reader.onload = (event) => {
        setFileData(event.target.result); // Base64 string
      };
      reader.readAsDataURL(file);
    }
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
      // Convert the date format from DD-MM-YYYY to YYYY-MM-DD for storage
      const storageFormattedData = { ...formData };
      if (formData.incident_date) {
        const [day, month, year] = formData.incident_date.split("-");
        storageFormattedData.incident_date = `${year}-${month}-${day}`;
      }

      const payload = {
        addition: storageFormattedData,
      };

      if (formData.artifactType === "image" && fileData) {
        payload.fileData = fileData;
        payload.fileName = fileName;
        payload.fileType = fileType;
      }

      const result = await handleAddNewIncident(payload);

      if (typeof result === "string") {
        throw new Error(result);
      }

      setIncidents(result);
      onClose();
    } catch (error) {
      console.error("Error adding incident:", error);
      setErrorMessage(
        error.message || "Failed to add incident. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSeverityInfo = (e) => {
    e.preventDefault();
    setShowSeverityInfo(!showSeverityInfo);
  };

  return (
    <form className="modal-form" onSubmit={handleSubmit}>
      {errorMessage && <div className="form-error-message">{errorMessage}</div>}
      {Object.values(formErrors).map((error, index) => (
        <div key={index} className="form-error-message">
          {error}
        </div>
      ))}

      <div className="form-group" style={{ marginBottom: "10px" }}>
        <label className="form-label" htmlFor="name">
          Incident Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className="form-input"
          value={formData.name}
          onChange={handleChange}
          required
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
            className="form-input"
            value={formData.incident_date}
            onChange={handleDateChange}
            required
            placeholder="DD-MM-YYYY"
            maxLength="10"
            style={{ width: "100%" }}
          />
          {formErrors.incident_date && (
            <div className="form-error">{formErrors.incident_date}</div>
          )}
          <small style={{ fontSize: "0.7rem", color: "#666" }}>1980-2029</small>
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
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          className="form-textarea"
          style={{ height: "50px" }} // Reduced from 60px
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="Provide a brief description of the incident..."
        />
        {formErrors.description && (
          <div className="form-error">{formErrors.description}</div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group" style={{ marginBottom: "10px" }}>
          <label className="form-label" htmlFor="cause">
            Cause
          </label>
          <input
            id="cause"
            name="cause"
            type="text"
            className="form-input"
            value={formData.cause}
            onChange={handleChange}
            placeholder="What caused this incident?"
          />
        </div>

        <div className="form-group" style={{ marginBottom: "10px" }}>
          <label className="form-label" htmlFor="consequences">
            Impact
          </label>
          <input
            id="consequences"
            name="consequences"
            type="text"
            className="form-input"
            value={formData.consequences}
            onChange={handleChange}
            placeholder="What were the consequences?"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group" style={{ marginBottom: "10px" }}>
          <label className="form-label" htmlFor="time_to_resolve">
            Time to Resolve
          </label>
          <input
            id="time_to_resolve"
            name="time_to_resolve"
            type="text"
            className="form-input"
            value={formData.time_to_resolve}
            onChange={handleChange}
            placeholder="e.g., 2 days"
          />
        </div>

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
            className="form-textarea"
            style={{ height: "80px" }}
            value={formData.artifactContent}
            onChange={handleChange}
            placeholder="Enter HTML code here..."
          />
        </div>
      )}

      {formData.artifactType === "image" && (
        <div className="form-group" style={{ marginBottom: "10px" }}>
          <label className="form-label" htmlFor="file">
            Upload Image
          </label>
          <input
            id="file"
            name="file"
            type="file"
            className="form-input"
            accept="image/*"
            onChange={handleFileChange}
          />
          <small style={{ fontSize: "0.7rem", color: "#666" }}>
            Max: 1024x768
          </small>
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
          {isSubmitting ? "Adding..." : "Add Incident"}
        </button>
      </div>
    </form>
  );
};

export default AddIncidentForm;
