import React, { useState, useEffect } from "react";
import { useIncidents } from "../../../contexts/IncidentContext";
import { handleUpdateIncident } from "../../../catalog/crudHandlers";

const EditIncidentForm = ({ incident, onClose, onNext }) => {
  const { setIncidents } = useIncidents();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSeverityInfo, setShowSeverityInfo] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    incident_date: "",
    category: "Software",
    severity: "Low",
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

  useEffect(() => {
    if (incident) {
      // Convert from ISO date to DD-MM-YYYY format
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
        cause: incident.cause || "",
        consequences: incident.consequences || "",
        time_to_resolve: incident.time_to_resolve || "",
        artifactType: incident.artifactType || "none",
        artifactContent: incident.artifactContent || "",
      });
    }
  }, [incident]);

  const categories = [
    "Software",
    "Hardware",
    "Network",
    "Security",
    "Human Error",
    "External Factor",
    "Design Flaw",
  ];

  const severityOptions = ["Low", "Moderate", "High", "Critical"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setFileType(file.type);

      const reader = new FileReader();
      reader.onload = (event) => {
        setFileData(event.target.result);
      };
      reader.readAsDataURL(file);
    }
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

  const toggleSeverityInfo = (e) => {
    e.preventDefault();
    setShowSeverityInfo(!showSeverityInfo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (!formData.name || !formData.incident_date || !formData.description) {
        throw new Error(
          "Please fill in all required fields: Name, Date, and Description."
        );
      }

      // Validate date format (DD-MM-YYYY)
      const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
      if (!dateRegex.test(formData.incident_date)) {
        throw new Error("Please enter a valid date in DD-MM-YYYY format.");
      }

      // Check if date is valid
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
        throw new Error("This date doesn't exist in the calendar.");
      }

      // Check date range
      const minDate = new Date(1980, 0, 1);
      const maxDate = new Date(2029, 11, 31);
      if (inputDate < minDate) {
        throw new Error("Date must be on or after 01-01-1980.");
      } else if (inputDate > maxDate) {
        throw new Error("Date must be on or before 31-12-2029.");
      }

      // Convert date from DD-MM-YYYY to YYYY-MM-DD for storage
      const [inputDay, inputMonth, inputYear] =
        formData.incident_date.split("-");
      const storageDate = `${inputYear}-${inputMonth}-${inputDay}`;

      // Create a copy of the form data with the properly formatted date for storage
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
      setErrorMessage(
        error.message || "Failed to update incident. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="modal-form" onSubmit={handleSubmit}>
      {errorMessage && <div className="form-error-message">{errorMessage}</div>}

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
              className="form-input"
              accept="image/*"
              onChange={handleFileChange}
            />
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
