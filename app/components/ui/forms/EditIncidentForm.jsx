import React, { useState, useEffect } from 'react';
import { useIncidents } from '../../../contexts/IncidentContext';
import { handleUpdateIncident } from '../../../catalog/crudHandlers';

const EditIncidentForm = ({ incident, onClose, onNext }) => {
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
    const [fileData, setFileData] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [fileType, setFileType] = useState(null);

  
  useEffect(() => {
    if (incident) {
      const incidentDate = incident.incident_date 
        ? new Date(incident.incident_date).toISOString().split('T')[0]
        : '';
        
      setFormData({
        name: incident.name || '',
        incident_date: incidentDate,
        category: incident.category || 'Software',
        severity: incident.severity ? incident.severity.toString() : '3',
        description: incident.description || '',
        cause: incident.cause || '',
        consequences: incident.consequences || '',
        time_to_resolve: incident.time_to_resolve || '',
        artifactType: incident.artifactType || 'none',
        artifactContent: incident.artifactContent || ''
      });
    }
  }, [incident]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      
      if (!formData.name || !formData.incident_date || !formData.description) {
        throw new Error('Please fill in all required fields: Name, Date, and Description.');
      }

      
      if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.incident_date)) {
        throw new Error('Please enter a valid date in YYYY-MM-DD format.');
      }

    const payload = {
        id: incident.id,
        update: formData,
    }

    if (formData.artifactType === 'image' && fileData) {
        payload.fileData = fileData;
        payload.fileName = fileName;
        payload.fileType = fileType;
    }

    const result = await handleUpdateIncident(payload);
      
      if (typeof result === 'string') {
        
        throw new Error(result);
      }
      
      
      setIncidents(result);
      
      if (onNext) {
        onNext();
      } else {
        onClose();
      }
      
    } catch (error) {
      console.error('Error updating incident:', error);
      setErrorMessage(error.message || 'Failed to update incident. Please try again.');
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
          {incident.artifactContent && (
            <div className="current-image-preview">
              <p>Current image:</p>
              <img 
                src={incident.artifactContent} 
                alt="Current artifact" 
                style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px' }} 
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
          {isSubmitting ? 'Saving...' : onNext ? 'Save & Continue' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default EditIncidentForm;