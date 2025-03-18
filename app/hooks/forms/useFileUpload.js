import { useReducer, useCallback } from 'react';
import { validateImageFile } from '../../utils/formValidation';

// File state reducer
const fileReducer = (state, action) => {
  switch (action.type) {
    case "SET_FILE":
      return {
        ...state,
        data: action.payload.data,
        name: action.payload.name,
        type: action.payload.type,
        error: "",
      };
    case "CLEAR_FILE":
      return {
        data: null,
        name: null,
        type: null,
        error: "",
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        data: null,
        name: null,
        type: null,
      };
    default:
      return state;
  }
};

/**
 * Custom hook for handling file uploads with validation
 * 
 * @param {Object} options - Configuration options
 * @param {Object} options.validationOptions - Options to pass to validateImageFile
 * @param {Function} options.setFormErrors - Function to update form errors
 * @returns {Object} File state and handlers
 */
export const useFileUpload = ({ validationOptions = {}, setFormErrors } = {}) => {
  const [fileState, dispatchFile] = useReducer(fileReducer, {
    data: null,
    name: null,
    type: null,
    error: "",
  });

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files[0];

    if (!file) {
      dispatchFile({ type: "CLEAR_FILE" });
      if (setFormErrors) {
        setFormErrors((prev) => ({
          ...prev,
          file: "An image file is required when Artifact Type is set to Image.",
        }));
      }
      return;
    }

    try {
      // Validate the file
      const fileValidation = await validateImageFile(file, validationOptions);

      if (!fileValidation.isValid) {
        dispatchFile({
          type: "SET_ERROR",
          payload: fileValidation.errorMessage,
        });
        if (setFormErrors) {
          setFormErrors((prev) => ({
            ...prev,
            file: fileValidation.errorMessage,
          }));
        }
        return;
      }

      // Read the file
      const reader = new FileReader();
      reader.onload = (event) => {
        dispatchFile({
          type: "SET_FILE",
          payload: {
            data: event.target.result,
            name: file.name,
            type: file.type,
          },
        });

        // Clear the file error if validation passed
        if (setFormErrors) {
          setFormErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.file;
            return newErrors;
          });
        }
      };

      reader.onerror = () => {
        const errorMsg = "Error reading file. Please try again.";
        dispatchFile({
          type: "SET_ERROR",
          payload: errorMsg,
        });
        if (setFormErrors) {
          setFormErrors((prev) => ({
            ...prev,
            file: errorMsg,
          }));
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      const errorMsg = "Error processing file. Please try again.";
      dispatchFile({
        type: "SET_ERROR",
        payload: errorMsg,
      });
      if (setFormErrors) {
        setFormErrors((prev) => ({
          ...prev,
          file: errorMsg,
        }));
      }
    }
  }, [setFormErrors, validationOptions]);

  const clearFile = useCallback(() => {
    dispatchFile({ type: "CLEAR_FILE" });
    if (setFormErrors) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.file;
        return newErrors;
      });
    }
  }, [setFormErrors]);

  return {
    fileState,
    handleFileChange,
    clearFile,
    dispatchFile,
  };
};

export default useFileUpload;
