import { useReducer } from 'react';
import { validateImageFile } from "../../utils/formValidation";

// File state reducer
const fileReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FILE':
      return { 
        ...state, 
        data: action.payload.data,
        name: action.payload.name,
        type: action.payload.type,
        error: "" 
      };
    case 'CLEAR_FILE':
      return { 
        data: null, 
        name: null, 
        type: null, 
        error: "" 
      };
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload,
        data: null,
        name: null,
        type: null
      };
    default:
      return state;
  }
};

/**
 * Custom hook for managing file state in forms
 * 
 * @param {Function} setErrors - Function to update errors in the parent form
 * @returns {Object} File state and handler functions
 */
const useFileReducer = (setErrors) => {
  // Initialize file state using reducer
  const [fileState, dispatchFile] = useReducer(fileReducer, {
    data: null,
    name: null,
    type: null,
    error: ""
  });

  // Handle file selection and validation
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      dispatchFile({ type: 'CLEAR_FILE' });
      setErrors && setErrors((prev) => ({
        ...prev,
        file: "A file is required."
      }));
      return;
    }

    try {
      // Validate the file
      const fileValidation = await validateImageFile(file);
      
      if (!fileValidation.isValid) {
        dispatchFile({ type: 'SET_ERROR', payload: fileValidation.errorMessage });
        setErrors && setErrors((prev) => ({
          ...prev,
          file: fileValidation.errorMessage
        }));
        return;
      }

      // Read the file
      const reader = new FileReader();
      reader.onload = (event) => {
        dispatchFile({ 
          type: 'SET_FILE', 
          payload: {
            data: event.target.result,
            name: file.name,
            type: file.type
          }
        });
        
        // Clear the file error if validation passed
        setErrors && setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.file;
          return newErrors;
        });
      };

      reader.onerror = () => {
        dispatchFile({ type: 'SET_ERROR', payload: "Error reading file. Please try again." });
        setErrors && setErrors((prev) => ({
          ...prev,
          file: "Error reading file. Please try again."
        }));
      };

      reader.readAsDataURL(file);
    } catch (error) {
      dispatchFile({ type: 'SET_ERROR', payload: "Error processing file. Please try again." });
      setErrors && setErrors((prev) => ({
        ...prev,
        file: "Error processing file. Please try again."
      }));
    }
  };

  // Clear the current file
  const clearFile = () => {
    dispatchFile({ type: 'CLEAR_FILE' });
    // Also clear any file errors
    setErrors && setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.file;
      return newErrors;
    });
  };

  return {
    fileState,
    handleFileChange,
    clearFile,
    dispatchFile
  };
};

export default useFileReducer;