import React, { useState } from 'react';
import { useIncidents } from '../../../contexts/IncidentContext';
import { handleAddNewIncident } from '../../../catalog/crudHandlers';

const AddIncidentForm = ({ onClose }) => {
  const { setIncidents } = useIncidents();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    incident_date: '',
    category: 'Software',
    severity: '3',
    description: '',
    cause: '',
    consequences: '',
    time_to_resolve: '',
    artifactType: 'none',
    artifactContent: ''
  });

  const categories = [
    'Software', 
    'Hardware', 
    'Network', 
    'Security', 
    'Human Error',
    'External Factor',
    'Design Flaw'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Validate required fields
      if (!formData.name || !formData.incident_date || !formData.description) {
        throw new Error('Please fill in all required fields: Name, Date, and Description.');
      }

      // Date validation
      if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.incident_date)) {
        throw new Error('Please enter a valid date in YYYY-MM-DD format.');
      }

      const result = await handleAddNewIncident(formData);
      
      if (typeof result === 'string') {
        // Error returned as string
        throw new Error(result);
      }
      
      // If we got here, the operation was successful
      setIncidents(result);
      onClose();
      
    } catch (error) {
      console.error('Error adding incident:', error);
      setErrorMessage(error.message || 'Failed to add incident. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="modal-form" onSubmit={handleSubmit}>
      {errorMessage && (
        <div className="form-error-message">{errorMessage}</div>
      )}
      
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
        
        <div className="form-group">
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
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">Severity Level</label>
        <div className="form-radio-group">
          {[1, 2, 3, 4, 5].map(level => (
            <div key={level} className="form-radio-item">
              <input
                type="radio"
                id={`severity-${level}`}
                name="severity"
                value={level.toString()}
                checked={formData.severity === level.toString()}
                onChange={handleChange}
              />
              <label className="form-radio-label" htmlFor={`severity-${level}`}>
                {level}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label" htmlFor="description">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          className="form-textarea"
          style={{ height: "80px" }}
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="Provide a brief description of the incident..."
        />
      </div>
      
      <div className="form-group">
        <label className="form-label" htmlFor="consequences">
          Consequences
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
      
      <div className="form-row">
        <div className="form-group">
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
        
        <div className="form-group">
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
            placeholder="e.g., 2 days, 3 weeks"
          />
        </div>
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
      </div>
      
      {formData.artifactType === 'code' && (
        <div className="form-group">
          <label className="form-label" htmlFor="artifactContent">
            HTML Code
          </label>
          <textarea
            id="artifactContent"
            name="artifactContent"
            className="form-textarea"
            style={{ height: "100px" }}
            value={formData.artifactContent}
            onChange={handleChange}
            placeholder="Enter HTML code for the artifact..."
          />
        </div>
      )}
      
      {formData.artifactType === 'image' && (
        <div className="form-group">
          <label className="form-label" htmlFor="file">
            Upload Image
          </label>
          <input
            id="file"
            name="file"
            type="file"
            className="form-input"
            accept="image/*"
            onChange={(e) => {
              // Handle file upload here if needed
              console.log("File selected:", e.target.files[0]);
            }}
          />
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
          {isSubmitting ? 'Adding...' : 'Add Incident'}
        </button>
      </div>
    </form>
  );
};

export default AddIncidentForm;