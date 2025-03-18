import { useReducer, useCallback, useState } from 'react';
import { validateImageFile } from '../../utils/formValidation';

const initialState = {
  data: null,
  name: null,
  type: null,
  error: "",
  preview: null,
};

// File state reducer
const fileReducer = (state, action) => {
  switch (action.type) {
    case "SET_FILE":
      return {
        ...state,
        data: action.payload.data,
        name: action.payload.name,
        type: action.payload.type,
        preview: action.payload.preview || null,
        error: "",
      };
    case "CLEAR_FILE":
      // Revoke object URL to prevent memory leaks
      if (state.preview && typeof state.preview === 'string' && state.preview.startsWith('blob:')) {
        URL.revokeObjectURL(state.preview);
      }
      return initialState;
    case "SET_ERROR":
      // Revoke object URL to prevent memory leaks
      if (state.preview && typeof state.preview === 'string' && state.preview.startsWith('blob:')) {
        URL.revokeObjectURL(state.preview);
      }
      return {
        ...initialState,
        error: action.payload,
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
 * @param {Function} options.onFileLoaded - Callback when file is loaded
 * @returns {Object} File state and handlers
 */
export const useFileUpload = ({ 
  validationOptions = {}, 
  setFormErrors,
  onFileLoaded
} = {}) => {
  const [fileState, dispatchFile] = useReducer(fileReducer, initialState);
  const [isProcessing, setIsProcessing] = useState(false);

  // Process file after validation
  const processFile = useCallback(async (file) => {
    if (!file) return;
    
    setIsProcessing(true);
    
    try {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const fileData = event.target.result;
          let preview = null;
          
          // Create preview URL for images
          if (file.type.startsWith('image/')) {
            preview = URL.createObjectURL(file);
          }
          
          dispatchFile({
            type: "SET_FILE",
            payload: {
              data: fileData,
              name: file.name,
              type: file.type,
              preview
            }
          });
          
          if (setFormErrors) {
            setFormErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.file;
              return newErrors;
            });
          }
          
          if (onFileLoaded) {
            onFileLoaded({
              data: fileData,
              name: file.name,
              type: file.type,
              size: file.size,
              preview
            });
          }
        } catch (error) {
          console.error("Error processing file data:", error);
          
          dispatchFile({
            type: "SET_ERROR",
            payload: "Error processing file. Please try again."
          });
          
          if (setFormErrors) {
            setFormErrors((prev) => ({
              ...prev,
              file: "Error processing file. Please try again."
            }));
          }
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.onerror = () => {
        console.error("FileReader error");
        
        dispatchFile({
          type: "SET_ERROR",
          payload: "Error reading file. The file may be corrupted."
        });
        
        if (setFormErrors) {
          setFormErrors((prev) => ({
            ...prev,
            file: "Error reading file. The file may be corrupted."
          }));
        }
        
        setIsProcessing(false);
      };
      
      // Read file as data URL for base64 encoding
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File processing error:", error);
      
      dispatchFile({
        type: "SET_ERROR",
        payload: "Error processing file. Please try again."
      });
      
      if (setFormErrors) {
        setFormErrors((prev) => ({
          ...prev,
          file: "Error processing file. Please try again."
        }));
      }
      
      setIsProcessing(false);
    }
  }, [setFormErrors, onFileLoaded]);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    
    // Clear existing file state
    dispatchFile({ type: "CLEAR_FILE" });
    
    if (!file) return;
    
    try {
      // File type validation - basic check before full validation
      if (!file.type.startsWith('image/')) {
        const errorMessage = `File type not supported: ${file.type || 'unknown'}. Only images are allowed.`;
        
        dispatchFile({ 
          type: "SET_ERROR", 
          payload: errorMessage 
        });
        
        if (setFormErrors) {
          setFormErrors(prev => ({ 
            ...prev, 
            file: errorMessage 
          }));
        }
        
        return;
      }
      
      // File size validation - basic check before full validation
      const maxSizeInBytes = (validationOptions.maxSizeInMB || 2) * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const errorMessage = `File size (${fileSizeMB}MB) exceeds the limit of ${validationOptions.maxSizeInMB || 2}MB.`;
        
        dispatchFile({ 
          type: "SET_ERROR", 
          payload: errorMessage 
        });
        
        if (setFormErrors) {
          setFormErrors(prev => ({ 
            ...prev, 
            file: errorMessage 
          }));
        }
        
        return;
      }
      
      // Filename validation for potentially problematic characters
      const invalidCharsRegex = /[<>:"/\\|?*\x00-\x1F]/g;
      if (invalidCharsRegex.test(file.name)) {
        const errorMessage = `Filename contains invalid characters. Please rename the file before uploading.`;
        
        dispatchFile({ 
          type: "SET_ERROR", 
          payload: errorMessage 
        });
        
        if (setFormErrors) {
          setFormErrors(prev => ({ 
            ...prev, 
            file: errorMessage 
          }));
        }
        
        return;
      }
      
      // Comprehensive image validation
      const validationResult = await validateImageFile(file, validationOptions);
      
      if (!validationResult.isValid) {
        dispatchFile({ 
          type: "SET_ERROR", 
          payload: validationResult.errorMessage 
        });
        
        if (setFormErrors) {
          setFormErrors(prev => ({ 
            ...prev, 
            file: validationResult.errorMessage 
          }));
        }
        
        return;
      }
      
      // Process the valid file
      processFile(file);
    } catch (error) {
      console.error("File validation error:", error);
      
      const errorMessage = "Error validating file. Please try again.";
      
      dispatchFile({ 
        type: "SET_ERROR", 
        payload: errorMessage 
      });
      
      if (setFormErrors) {
        setFormErrors(prev => ({ 
          ...prev, 
          file: errorMessage 
        }));
      }
    }
  }, [validationOptions, setFormErrors, processFile]);

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
    isProcessing,
  };
};

export default useFileUpload;
