2; // __tests__/utils/validation/formValidation.test.js
import {
  validateDateString,
  validateMinLength,
  validateImageFile,
  validateEmail,
  validatePassword,
  validateHtmlContent,
  createFormValidator,
  validateIncidentForm,
  validateAuthForm,
  validateResetPasswordForm,
} from "@/app/utils/validation/formValidation";

// Mock the formatting functions used in validateDateString
jest.mock("@/app/utils/formatting/dateUtils", () => ({
  formatDateForDisplay: (date) => {
    // Simple mock implementation that returns DD-MM-YYYY
    return date.toISOString().split("T")[0].split("-").reverse().join("-");
  },
  parseDate: (dateString) => {
    // Simple mock implementation that returns a Date or null for invalid dates
    try {
      const [day, month, year] = dateString.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return null;
      }

      // Check if the components match (to handle invalid dates like 31-02-2022)
      if (
        date.getUTCDate() !== day ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCFullYear() !== year
      ) {
        return null;
      }

      return date;
    } catch (error) {
      return null;
    }
  },
}));

describe("Form Validation Utilities", () => {
  describe("validateDateString", () => {
    it("validates correct date format", () => {
      const result = validateDateString("01-05-2022");
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBe("");
    });

    it("rejects empty date string", () => {
      const result = validateDateString("");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Date is required.");
    });

    it("rejects invalid date format", () => {
      const result = validateDateString("2022-05-01"); // Wrong format, should be DD-MM-YYYY
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        "Please enter a valid date in DD-MM-YYYY format."
      );
    });

    it("rejects non-existent dates", () => {
      const result = validateDateString("31-02-2022"); // February 31st doesn't exist
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        "This date doesn't exist in the calendar."
      );
    });

    it("enforces minimum date", () => {
      const minDate = new Date(Date.UTC(2000, 0, 1));
      const result = validateDateString("01-01-1999", { minDate });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("Date must be on or after");
    });

    it("enforces maximum date", () => {
      const maxDate = new Date(Date.UTC(2023, 11, 31));
      const result = validateDateString("01-01-2024", { maxDate });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain("Date must be on or before");
    });

    it("accepts valid date within bounds", () => {
      const minDate = new Date(Date.UTC(2000, 0, 1));
      const maxDate = new Date(Date.UTC(2025, 11, 31));
      const result = validateDateString("15-06-2022", { minDate, maxDate });
      expect(result.isValid).toBe(true);
    });
  });

  describe("validateMinLength", () => {
    it("validates string with sufficient length", () => {
      const result = validateMinLength("Test String", 5, "Test Field");
      expect(result.isValid).toBe(true);
    });

    it("rejects empty string", () => {
      const result = validateMinLength("", 5, "Test Field");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Test Field is required.");
    });

    it("rejects string shorter than minimum length", () => {
      const result = validateMinLength("Test", 5, "Test Field");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        "Test Field must be at least 5 characters."
      );
    });

    it("handles strings with only whitespace", () => {
      const result = validateMinLength("   ", 5, "Test Field");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Test Field is required.");
    });

    it("trims whitespace when checking length", () => {
      const result = validateMinLength("  Test  ", 5, "Test Field");
      expect(result.isValid).toBe(false); // After trimming, "Test" is 4 chars
    });
  });

  describe("validateImageFile", () => {
    it("validates image files", () => {
      const file = {
        type: "image/jpeg",
        size: 1024 * 1024, // 1MB
      };
      const result = validateImageFile(file);
      expect(result.isValid).toBe(true);
    });

    it("rejects missing files", () => {
      const result = validateImageFile(null);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("An image file is required.");
    });

    it("rejects non-image files", () => {
      const file = {
        type: "text/plain",
        size: 1024,
      };
      const result = validateImageFile(file);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Selected file is not an image.");
    });

    it("rejects files exceeding size limit", () => {
      const file = {
        type: "image/png",
        size: 6 * 1024 * 1024, // 6MB
      };
      const result = validateImageFile(file, { maxSizeInMB: 5 });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Image size must be less than 5MB.");
    });

    it("accepts files within custom size limit", () => {
      const file = {
        type: "image/png",
        size: 3 * 1024 * 1024, // 3MB
      };
      const result = validateImageFile(file, { maxSizeInMB: 10 });
      expect(result.isValid).toBe(true);
    });

    it("validates different image MIME types", () => {
      const imageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ];

      imageTypes.forEach((type) => {
        const file = {
          type,
          size: 1024 * 1024,
        };
        const result = validateImageFile(file);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("validateEmail", () => {
    it("validates correct email format", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.com",
        "a@b.c",
      ];

      validEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
      });
    });

    it("rejects empty email", () => {
      const result = validateEmail("");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Email is required.");
    });

    it("rejects invalid email formats", () => {
      const invalidEmails = [
        "test@",
        "@example.com",
        "test.example.com",
        "test@example",
        "test@.com",
        "test @example.com",
        "test@ example.com",
      ];

      invalidEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toBe("Please enter a valid email address.");
      });
    });
  });

  describe("validatePassword", () => {
    it("validates password with default requirements", () => {
      // Default requirements: min 8 chars, uppercase, numbers, special chars
      const result = validatePassword("Password123!");
      expect(result.isValid).toBe(true);
    });

    it("rejects empty password", () => {
      const result = validatePassword("");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Password is required.");
    });

    it("enforces minimum length", () => {
      const result = validatePassword("Pass1!", {}, { minLength: 10 });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        "Password must be at least 10 characters."
      );
    });

    it("enforces uppercase requirement", () => {
      const result = validatePassword("password123!");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        "Password must include at least one uppercase letter."
      );
    });

    it("enforces number requirement", () => {
      const result = validatePassword("Password!");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        "Password must include at least one number."
      );
    });

    it("enforces special character requirement", () => {
      const result = validatePassword("Password123");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        "Password must include at least one special character."
      );
    });

    it("validates with custom requirements", () => {
      const options = {
        minLength: 6,
        requireUppercase: false,
        requireNumbers: false,
        requireSpecial: false,
      };

      const result = validatePassword("simple", {}, options);
      expect(result.isValid).toBe(true);
    });

    it("validates matching passwords when confirmation is required", () => {
      const data = {
        password: "Password123!",
        confirmPassword: "Password123!",
      };

      const options = {
        requirePasswordConfirmation: true,
      };

      const result = validatePassword(data.password, data, options);
      expect(result.isValid).toBe(true);
    });

    it("rejects non-matching passwords when confirmation is required", () => {
      const data = {
        password: "Password123!",
        confirmPassword: "DifferentPassword123!",
      };

      const options = {
        requirePasswordConfirmation: true,
      };

      const result = validatePassword(data.password, data, options);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Passwords do not match.");
    });
  });

  describe("validateHtmlContent", () => {
    it("validates HTML content with <html> tag", () => {
      const html = "<html><body><h1>Test</h1></body></html>";
      const result = validateHtmlContent(html);
      expect(result.isValid).toBe(true);
    });

    it("rejects empty HTML content", () => {
      const result = validateHtmlContent("");
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        "HTML Code is required when Artifact Type is set to Code."
      );
    });

    it("enforces <html> tag requirement", () => {
      const html = "<div>Just a div without html tag</div>";
      const result = validateHtmlContent(html, true);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        "HTML code should include a <html> tag."
      );
    });

    it("accepts HTML without <html> tag when not required", () => {
      const html = "<div>Just a div without html tag</div>";
      const result = validateHtmlContent(html, false);
      expect(result.isValid).toBe(true);
    });
  });

  describe("createFormValidator", () => {
    it("creates a validator function based on schema", () => {
      const schema = {
        name: {
          type: "text",
          minLength: 3,
          label: "Name",
          required: true,
        },
        email: {
          type: "email",
          required: true,
        },
      };

      const validator = createFormValidator(schema);
      expect(typeof validator).toBe("function");
    });

    it("validates all fields against schema", () => {
      const schema = {
        name: {
          type: "text",
          minLength: 3,
          label: "Name",
          required: true,
        },
        email: {
          type: "email",
          required: true,
        },
      };

      const validator = createFormValidator(schema);

      // Invalid data
      const invalidData = {
        name: "Jo", // Too short
        email: "not-an-email",
      };

      const errors = validator(invalidData);
      expect(errors.name).toBeDefined();
      expect(errors.email).toBeDefined();

      // Valid data
      const validData = {
        name: "John Doe",
        email: "john@example.com",
      };

      const validErrors = validator(validData);
      expect(Object.keys(validErrors).length).toBe(0);
    });

    it("validates a single field when field name is provided", () => {
      const schema = {
        name: {
          type: "text",
          minLength: 3,
          label: "Name",
          required: true,
        },
        email: {
          type: "email",
          required: true,
        },
      };

      const validator = createFormValidator(schema);

      const data = {
        name: "Jo", // Too short
        email: "john@example.com", // Valid
      };

      const nameErrors = validator(data, "name");
      expect(nameErrors.name).toBeDefined();
      expect(nameErrors.email).toBeUndefined();
    });

    it("handles conditional validation based on other fields", () => {
      const schema = {
        artifactType: {
          type: "text",
          required: true,
        },
        artifactContent: {
          type: "html",
          required: true,
          conditional: (data) => data.artifactType === "code",
        },
      };

      const validator = createFormValidator(schema);

      // When condition is met
      const dataWithCode = {
        artifactType: "code",
        artifactContent: "",
      };

      const errorsWithCode = validator(dataWithCode);
      expect(errorsWithCode.artifactContent).toBeDefined();

      // When condition is not met
      const dataWithImage = {
        artifactType: "image",
        artifactContent: "",
      };

      const errorsWithImage = validator(dataWithImage);
      expect(errorsWithImage.artifactContent).toBeUndefined();
    });

    it("skips validation for non-required empty fields", () => {
      const schema = {
        name: {
          type: "text",
          minLength: 3,
          required: true,
        },
        bio: {
          type: "text",
          minLength: 10,
          required: false,
        },
      };

      const validator = createFormValidator(schema);

      const data = {
        name: "John",
        bio: "", // Empty but not required
      };

      const errors = validator(data);
      expect(errors.name).toBeUndefined();
      expect(errors.bio).toBeUndefined();
    });
  });

  describe("Form Schema Validators", () => {
    describe("validateIncidentForm", () => {
      it("validates valid incident form data", () => {
        const validData = {
          name: "Test Incident",
          incident_date: "01-01-2022",
          description:
            "This is a test incident description that is long enough.",
          artifactType: "none", // No artifact, so no artifact validation needed
        };

        const errors = validateIncidentForm(validData);
        expect(Object.keys(errors).length).toBe(0);
      });

      it("validates code artifact when type is code", () => {
        const data = {
          name: "Test Incident",
          incident_date: "01-01-2022",
          description:
            "This is a test incident description that is long enough.",
          artifactType: "code",
          artifactContent: "", // Missing code
        };

        const errors = validateIncidentForm(data);
        expect(errors.artifactContent).toBeDefined();
      });

      it("validates image artifact when type is image", () => {
        const data = {
          name: "Test Incident",
          incident_date: "01-01-2022",
          description:
            "This is a test incident description that is long enough.",
          artifactType: "image",
          artifactContent: true,
          id: "test-id", // Editing mode
          fileState: { data: null }, // Missing image
        };

        const errors = validateIncidentForm(data);
        expect(errors.file).toBeDefined();
      });
    });

    describe("validateAuthForm", () => {
      it("validates valid auth form data", () => {
        const validData = {
          email: "test@example.com",
          password: "Password123!",
        };

        const errors = validateAuthForm(validData);
        expect(Object.keys(errors).length).toBe(0);
      });

      it("validates auth form with password confirmation", () => {
        const validData = {
          email: "test@example.com",
          password: "Password123!",
          confirmPassword: "Password123!",
        };

        const errors = validateAuthForm(validData);
        expect(Object.keys(errors).length).toBe(0);
      });

      it("rejects invalid auth form data", () => {
        const invalidData = {
          email: "invalid-email",
          password: "weak",
        };

        const errors = validateAuthForm(invalidData);
        expect(errors.email).toBeDefined();
        expect(errors.password).toBeDefined();
      });
    });

    describe("validateResetPasswordForm", () => {
      it("validates valid reset password form data", () => {
        const validData = {
          email: "test@example.com",
        };

        const errors = validateResetPasswordForm(validData);
        expect(Object.keys(errors).length).toBe(0);
      });

      it("rejects invalid reset password form data", () => {
        const invalidData = {
          email: "invalid-email",
        };

        const errors = validateResetPasswordForm(invalidData);
        expect(errors.email).toBeDefined();
      });
    });
  });
});
