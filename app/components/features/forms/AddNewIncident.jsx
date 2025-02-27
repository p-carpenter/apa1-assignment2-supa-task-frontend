import React, { useState } from "react";
import { Button, Dropdown } from "@react95/core";
import TitleBar from "@/app/components/ui/win95/Win95TitleBar.jsx";

const AddNewIncident = ({ onSubmit, onClose }) => {
  const [error, setError] = useState("");
  const [htmlError, setHtmlError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    incident_date: "",
    category: "",
    severity: "",
    description: "",
    cause: "",
    consequences: "",
    time_to_resolve: "",
    artifactType: "",
    artifactContent: "",
  });
  const [fileData, setFileData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Code language validation
    if (name === "artifactContent" && formData.artifactType === "code") {
      setHtmlError("");

      if (value && !value.trim().toLowerCase().includes("<html")) {
        setHtmlError("HTML must include <html> tag");
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // For preview purposes
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileData({
        preview: e.target.result,
        file: file,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset previous errors
    setError("");
    setHtmlError("");

    // Validate required fields - Check each field more precisely
    const requiredFields = {
      name: "Name",
      incident_date: "Incident Date",
      category: "Category",
      severity: "Severity",
      description: "Description",
      cause: "Cause",
      consequences: "Consequences",
      time_to_resolve: "Time to resolve",
    };

    const missingFields = [];

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field] || formData[field].trim() === "") {
        missingFields.push(label);
      }
    });

    if (missingFields.length > 0) {
      setError(`Required fields missing: ${missingFields.join(", ")}`);
      return;
    }

    // Validate code language if code artifact is selected
    if (formData.artifactType === "code") {
      if (
        !formData.artifactContent ||
        !formData.artifactContent.trim().toLowerCase().includes("<html>")
      ) {
        setHtmlError("HTML must include <html> tag");
        return;
      }
    }

    // Create FormData for submission
    const data = new FormData();

    data.append("name", formData.name);

    // Format date in GB format (DD/MM/YYYY)
    const dateObj = new Date(formData.incident_date);
    const formattedDate = dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    data.append("incident_date", formattedDate);
    data.append("category", formData.category);
    data.append("severity", formData.severity.toLowerCase());
    data.append("description", formData.description);
    data.append("cause", formData.cause);
    data.append("consequences", formData.consequences);
    data.append("time_to_resolve", formData.time_to_resolve);

    // Only append artifact data if a type is selected
    if (formData.artifactType && formData.artifactType !== "None") {
      data.append("artifactType", formData.artifactType);

      if (formData.artifactType === "code") {
        data.append("artifactContent", formData.artifactContent || "");
      } else if (formData.artifactType === "image" && fileData?.file) {
        data.append("file", fileData.file);
      }
    } else {
      data.append("artifactType", "");
    }

    const submissionError = await onSubmit(data);
    if (submissionError) {
      setError(submissionError);
    } else {
      onClose(); // Close form after successful submission
    }
  };

  return (
    <div
      className="new-incident-window absolute bg-win95gray border-2 border-win95border shadow-win95"
      style={{ width: "500px", maxHeight: "90vh", overflow: "auto" }}
    >
      <TitleBar title="New Incident" onClose={onClose} />

      <form onSubmit={handleSubmit} className="p-2">
        {/* Show an error message if fields are missing */}
        {error && (
          <p className="text-red-600 text-sm mb-2 p-1 bg-white border border-red-500">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="block text-sm mb-1">Name:</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-1 border border-gray-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Incident Date:</label>
            <input
              type="date"
              name="incident_date"
              value={formData.incident_date}
              onChange={handleChange}
              className="w-full p-1 border border-gray-400 text-sm"
              // Set GB date format for the input
              lang="en-GB"
              placeholder="DD/MM/YYYY"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="block text-sm mb-1">Category:</label>
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-1 border border-gray-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Severity:</label>
            <Dropdown
              options={["Low", "Medium", "High", "Critical"]}
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div className="mb-2">
          <label className="block text-sm mb-1">Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-1 border border-gray-400 text-sm"
            rows="2"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="block text-sm mb-1">Cause:</label>
            <textarea
              name="cause"
              value={formData.cause}
              onChange={handleChange}
              className="w-full p-1 border border-gray-400 text-sm"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Consequences:</label>
            <textarea
              name="consequences"
              value={formData.consequences}
              onChange={handleChange}
              className="w-full p-1 border border-gray-400 text-sm"
              rows="2"
            />
          </div>
        </div>

        <div className="mb-2">
          <label className="block text-sm mb-1">Time to resolve:</label>
          <input
            name="time_to_resolve"
            value={formData.time_to_resolve}
            onChange={handleChange}
            className="w-full p-1 border border-gray-400 text-sm"
          />
        </div>

        <div className="mb-2">
          <label className="block text-sm mb-1">Artifact (Optional):</label>
          <Dropdown
            options={["None", "image", "code"]}
            name="artifactType"
            value={formData.artifactType || ""}
            onChange={(e) => {
              // Reset artifact fields when changing type
              if (
                e.target.value === "None" ||
                e.target.value !== formData.artifactType
              ) {
                setFormData((prev) => ({
                  ...prev,
                  artifactContent: "",
                  artifactType: e.target.value,
                }));
                setFileData(null);
                setHtmlError("");
              } else {
                handleChange(e);
              }
            }}
            style={{ width: "100%" }}
          />
        </div>

        {formData.artifactType === "image" && (
          <div className="mb-2 border p-1 bg-gray-100">
            <label className="block text-sm mb-1">Upload Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm"
            />
            {fileData?.preview && (
              <div className="mt-2">
                <p className="text-sm">Preview:</p>
                <img
                  src={fileData.preview}
                  alt="Preview"
                  className="max-w-full max-h-24 mt-1"
                />
              </div>
            )}
          </div>
        )}

        {formData.artifactType === "code" && (
          <div className="mb-2 border p-1 bg-gray-100">
            <label className="block text-sm mb-1">HTML Code:</label>
            <textarea
              name="artifactContent"
              value={formData.artifactContent || ""}
              onChange={handleChange}
              className="w-full p-1 font-mono text-xs"
              rows="4"
              placeholder="<html>
<head><style>/* CSS here */</style></head>
<body><!-- HTML here -->
<script>// JavaScript here</script>
</body>
</html>"
            />
            {htmlError && (
              <p className="text-red-600 text-xs mt-1">{htmlError}</p>
            )}
            <p className="text-xs text-gray-600 mt-1">
              Must include &lt;html&gt; tag. Add CSS in &lt;style&gt; and
              JavaScript in &lt;script&gt; tags.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4 p-2 border-t border-win95border">
          <Button
            onClick={onClose}
            style={{ fontSize: "12px", padding: "2px 8px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            style={{ fontSize: "12px", padding: "2px 8px" }}
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddNewIncident;
