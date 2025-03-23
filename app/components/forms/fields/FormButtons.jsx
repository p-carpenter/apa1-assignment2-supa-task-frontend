import React from "react";
import buttonStyles from "@/app/components/ui/buttons/Button.module.css";
import authStyles from "../Auth.module.css";
import formStyles from "../FormStyles.module.css";

/**
 * Form buttons component that handles both auth-style and standard buttons
 */
const FormButtons = ({
  isSubmitting,
  submitLabel = "Submit",
  loadingLabel,
  useAuthStyle = false,
  className = "",
  testId,
  onClose,
  showCancelButton = false,
}) => {
  const buttonClass = useAuthStyle
    ? `${authStyles.authButton} ${authStyles.authSubmit}`
    : `${buttonStyles.button} ${buttonStyles.primary}`;

  return (
    <div className={`${formStyles.formButtons} ${className}`}>
      {showCancelButton && (
        <button
          className={buttonClass}
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      )}

      <button
        type="submit"
        className={`${buttonClass} ${isSubmitting && !useAuthStyle ? buttonStyles.loading : ""}`}
        disabled={isSubmitting}
        data-testid={testId}
      >
        {isSubmitting ? (
          useAuthStyle ? (
            <>
              <span className={authStyles.authLoading}></span>
              {loadingLabel || "PROCESSING..."}
            </>
          ) : (
            loadingLabel || `${submitLabel}...`
          )
        ) : (
          submitLabel
        )}
      </button>
    </div>
  );
};

export default FormButtons;
