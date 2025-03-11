import React, { useState } from "react";
import { useIncidents } from "../../../contexts/IncidentContext";
import { handleAddNewIncident } from "../../../catalog/crudHandlers";

const AddIncidentForm = ({ onClose }) => {
  const { setIncidents } = useIncidents();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    incident_date: "",
    category: "Software",
    severity: "3",
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
    "Network",
    "Security",
    "Human Error",
    "External Factor",
    "Design Flaw",
  ];

  const validateFields = () => {
    let errors = {};
    if (!formData.name) errors.name = "Incident Name is required.";
    if (!formData.incident_date) errors.incident_date = "Date is required.";
    if (!formData.description) errors.description = "Description is required.";

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.incident_date)) {
      errors.incident_date = "Please enter a valid date in YYYY-MM-DD format.";
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
      const payload = {
        addition: formData,
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

  return (
    <form className="modal-form" onSubmit={handleSubmit}>
      {errorMessage && <div className="form-error-message">{errorMessage}</div>}
      {Object.values(formErrors).map((error, index) => (
        <div key={index} className="form-error-message">
          {error}
        </div>
      ))}

      <div className="form-group">
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
        <div className="form-group">
          <label className="form-label" htmlFor="incident_date">
            Date *
          </label>
          <input
            id="incident_date"
            name="incident_date"
            type="date"
            className="form-input"
            value={formData.incident_date}
            onChange={handleChange}
            required
            placeholder="YYYY-MM-DD"
          />
        </div>
        {formErrors.incident_date && (
          <div className="form-error">{formErrors.incident_date}</div>
        )}
      </div>

      <div className="form-group">
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
        <div className="form-helper-text">Max dimensions: 1024x768</div>
      </div>

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
