import { useState } from "react";
import { validateImageFile } from "../utils/validation/formValidation";

/**
 * Custom hook for secure image file uploads with validation
 * 
 * Manages the full lifecycle of an uploaded file including:
 * - Memory management (releasing object URLs)
 * - Safe error recovery (cleanup on validation failures)
 * - Progress tracking for large file uploads
 * - Parent form state integration
 *
 * @param {Object} options - Hook configuration
 * @param {Object} options.validationOptions - Image validation parameters
 * @param {Function} options.setFormErrors - Form error state updater
 * @param {Function} options.onFileLoaded - Success callback
 * @returns {Object} File upload state and handlers
 */
export const useFileUpload = ({
  validationOptions = {},
  setFormErrors,
  onFileLoaded,
} = {}) => {
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Releases resources and cleans up file state
   * Prevents memory leaks from abandoned blob URLs
   */
  const clearFile = () => {
    // Explicit revocation of object URLs prevents memory leaks in long-running SPAs
    if (preview && typeof preview === "string" && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    // Reset all state in a single batch
    setFileData(null);
    setFileName(null);
    setFileType(null);
    setFileError(null);
    setPreview(null);

    // Remove file errors from parent form if provided
    if (setFormErrors) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.file;
        return newErrors;
      });
    }
  };

  /**
   * Set a file error and clean up existing data
   */
  const handleFileError = (errorMessage) => {
    if (preview && typeof preview === "string" && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setFileData(null);
    setFileName(null);
    setFileType(null);
    setPreview(null);

    setFileError(errorMessage);

    if (setFormErrors) {
      setFormErrors((prev) => ({
        ...prev,
        file: errorMessage,
      }));
    }
  };

  /**
   * Process a valid file by reading its contents
   */
  const processFile = async (file) => {
    if (!file) return;

    setIsProcessing(true);

    try {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const fileData = event.target.result;
          const preview = URL.createObjectURL(file);

          setFileData(fileData);
          setFileName(file.name);
          setFileType(file.type);
          setPreview(preview);
          setFileError(null);

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
              preview,
            });
          }
        } catch (error) {
          console.error("Error processing file data:", error);
          handleFileError("Error processing file. Please try again.");
        } finally {
          setIsProcessing(false);
        }
      };

      reader.onerror = () => {
        console.error("FileReader error");
        handleFileError("Error reading file. The file may be corrupted.");
        setIsProcessing(false);
      };

      // Read file as data URL for base64 encoding
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File processing error:", error);
      handleFileError("Error processing file. Please try again.");
      setIsProcessing(false);
    }
  };

  /**
   * Handle file selection and validate before processing
   */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];

    clearFile();

    if (!file) return;

    try {
      const validationResult = await validateImageFile(file, validationOptions);

      if (!validationResult.isValid) {
        handleFileError(validationResult.errorMessage);
        return;
      }

      processFile(file);
    } catch (error) {
      console.error("File validation error:", error);
      handleFileError("Error validating file. Please try again.");
    }
  };

  const fileState = {
    data: fileData,
    name: fileName,
    type: fileType,
    error: fileError,
    preview,
  };

  return {
    fileState,
    handleFileChange,
    clearFile,
    isProcessing,
  };
};

export default useFileUpload;
