import React, { useState } from "react";

const AddNewIncident = ({ onSubmit, onClose }) => {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    incident_date: "",
    category: "",
    severity: "",
    description: "",
    cause: "",
    consequences: "",
    time_to_resolve: "",
  });

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.incident_date ||
      !formData.category ||
      !formData.severity ||
      !formData.description ||
      !formData.cause ||
      !formData.consequences ||
      !formData.time_to_resolve
    ) {
      setError("All fields are required");
      return;
    }

    // Format the data to match what the Edge Function expects
    const formattedData = {
      name: formData.name,
      incident_date: new Date(formData.incident_date).toISOString(),
      category: formData.category,
      severity: formData.severity.toLowerCase(),
      description: formData.description,
      cause: formData.cause,
      consequences: formData.consequences,
      time_to_resolve: formData.time_to_resolve,
    };

    const error = await onSubmit(formattedData);
    if (error) {
      setError(error);
    } else {
      onClose(); // Close form after successful submission
    }
  };

  return (
    <div className="new-incident-window absolute items-center justify-center bg-win95gray w-[30vw] h-[auto] border-2 border-win95border shadow-win95">
      <div className="explorer-window-bar">
        <div className="folder-name">
          <p>Add new incident</p>
        </div>
        <div className="window-buttons">
          <div id="close-button"></div>
          <div id="max-button"></div>
        </div>
      </div>

      <div className="incident-content-container">
        <div className="p-4">
          {/* Show an error message if fields are missing */}
          {error && <p style={{ color: "red" }}>{error}</p>}

          <p>Name:</p>
          <textarea name="name" value={formData.name} onChange={handleChange} />

          <p>Incident Date:</p>
          <textarea
            type="datetime-local"
            name="incident_date"
            value={formData.incident_date}
            onChange={handleChange}
          />

          <p>Category:</p>
          <textarea
            name="category"
            value={formData.category}
            onChange={handleChange}
          />

          <p>Severity:</p>
          <textarea
            name="severity"
            value={formData.severity}
            onChange={handleChange}
          />

          <p>Description:</p>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          <p>Cause:</p>
          <textarea
            name="cause"
            value={formData.cause}
            onChange={handleChange}
          />

          <p>Consequences:</p>
          <textarea
            name="consequences"
            value={formData.consequences}
            onChange={handleChange}
          />

          <p>Time to resolve:</p>
          <textarea
            name="time_to_resolve"
            value={formData.time_to_resolve}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="popup-button-container">
        <button className="popup-button" onClick={() => onClose()}>
          Close
        </button>
        <button className="popup-button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default AddNewIncident;
