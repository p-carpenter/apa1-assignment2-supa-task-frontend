import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IncidentManagementForm from "@/app/components/forms/IncidentManagementForm";

jest.mock("@/app/components/ui/errors/ErrorMessage.jsx", () => ({
  ApiErrorMessage: ({ error }) => (
    <div data-testid="api-error">{error?.message || "Error occurred"}</div>
  ),
}));

jest.mock("@/app/components/ui/shared", () => ({
  SeverityInfo: ({ onClose }) => (
    <div data-testid="severity-info">
      <p>Severity level descriptions</p>
      <p>Low - Minor/localized impact</p>
      <p>Critical - Catastrophic failure</p>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe("IncidentManagementForm", () => {
  const mockProps = {
    // Form state
    formData: {
      name: "",
      incident_date: "",
      category: "Software",
      severity: "Moderate",
      description: "",
      artifactType: "none",
      artifactContent: "",
    },
    formErrors: {},
    isSubmitting: false,

    // Form handlers
    handleChange: jest.fn(),
    handleSubmit: jest.fn((e) => e.preventDefault()),
    handleDateChange: jest.fn(),
    handleArtifactTypeChange: jest.fn(),

    // File state and handlers
    fileState: {
      data: null,
      name: "",
      type: "",
      error: null,
    },
    handleFileChange: jest.fn(),

    // Severity info state and handler
    showSeverityInfo: false,
    toggleSeverityInfo: jest.fn(),

    // Error handling
    apiError: null,

    // UI customization
    onClose: jest.fn(),
    submitLabel: "Add Incident",
    loadingLabel: "Adding...",

    // Edit mode specific props
    isEditMode: false,
    incident: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields correctly", () => {
    render(<IncidentManagementForm {...mockProps} />);

    expect(screen.getByLabelText(/incident name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByText(/severity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/artifact type/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add incident/i })
    ).toBeInTheDocument();
  });

  it("displays severity info when shown", () => {
    const propsWithSeverityInfo = {
      ...mockProps,
      showSeverityInfo: true,
    };

    render(<IncidentManagementForm {...propsWithSeverityInfo} />);

    expect(screen.getByTestId("severity-info")).toBeInTheDocument();
    expect(
      screen.getByText(/severity level descriptions/i)
    ).toBeInTheDocument();
  });

  it("handles form submission", () => {
    render(<IncidentManagementForm {...mockProps} />);

    const form = screen.getByTestId("form");
    fireEvent.submit(form);

    expect(mockProps.handleSubmit).toHaveBeenCalled();
  });

  it("calls handleChange when inputs change", async () => {
    const user = userEvent.setup();
    render(<IncidentManagementForm {...mockProps} />);

    const nameInput = screen.getByLabelText(/incident name/i);
    await user.type(nameInput, "Test Incident");

    expect(mockProps.handleChange).toHaveBeenCalled();
  });

  it("calls handleDateChange when date input changes", async () => {
    const user = userEvent.setup();
    render(<IncidentManagementForm {...mockProps} />);

    const dateInput = screen.getByLabelText(/date/i);
    await user.type(dateInput, "01-01-2022");

    expect(mockProps.handleDateChange).toHaveBeenCalled();
  });

  it("calls handleArtifactTypeChange when artifact type changes", async () => {
    const user = userEvent.setup();
    render(<IncidentManagementForm {...mockProps} />);

    const artifactTypeSelect = screen.getByLabelText(/artifact type/i);
    await user.selectOptions(artifactTypeSelect, "code");

    expect(mockProps.handleArtifactTypeChange).toHaveBeenCalled();
  });

  it("calls toggleSeverityInfo when severity info button is clicked", async () => {
    const user = userEvent.setup();
    render(<IncidentManagementForm {...mockProps} />);

    const infoButton = screen.getByTitle("View severity level descriptions");
    await user.click(infoButton);

    expect(mockProps.toggleSeverityInfo).toHaveBeenCalled();
  });

  it("displays form errors when provided", () => {
    const propsWithErrors = {
      ...mockProps,
      formErrors: {
        name: "Incident name is required",
        incident_date: "Date is required",
        description: "Description is required",
      },
    };

    render(<IncidentManagementForm {...propsWithErrors} />);

    expect(screen.getByText("Incident name is required")).toBeInTheDocument();
    expect(screen.getByText("Date is required")).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toBeInTheDocument();
  });

  it("displays API error when provided", () => {
    const propsWithApiError = {
      ...mockProps,
      apiError: {
        message: "Failed to add incident",
      },
    };

    render(<IncidentManagementForm {...propsWithApiError} />);

    expect(screen.getByTestId("api-error")).toBeInTheDocument();
    expect(screen.getByText("Failed to add incident")).toBeInTheDocument();
  });

  it("disables form elements when isSubmitting is true", () => {
    const propsWhileSubmitting = {
      ...mockProps,
      isSubmitting: true,
    };

    render(<IncidentManagementForm {...propsWhileSubmitting} />);

    const nameInput = screen.getByLabelText(/incident name/i);
    const dateInput = screen.getByLabelText(/date/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    expect(nameInput).toBeDisabled();
    expect(dateInput).toBeDisabled();
    expect(descriptionInput).toBeDisabled();
  });

  it("renders HTML code textarea when artifact type is code", () => {
    const propsWithCodeArtifact = {
      ...mockProps,
      formData: {
        ...mockProps.formData,
        artifactType: "code",
      },
    };

    render(<IncidentManagementForm {...propsWithCodeArtifact} />);

    expect(screen.getByLabelText(/html code/i)).toBeInTheDocument();
  });

  it("renders file upload when artifact type is image", () => {
    const propsWithImageArtifact = {
      ...mockProps,
      formData: {
        ...mockProps.formData,
        artifactType: "image",
      },
    };

    render(<IncidentManagementForm {...propsWithImageArtifact} />);

    expect(screen.getByLabelText(/upload image/i)).toBeInTheDocument();
  });

  it("shows current image preview in edit mode with image artifact", () => {
    const propsEditModeWithImage = {
      ...mockProps,
      isEditMode: true,
      formData: {
        ...mockProps.formData,
        artifactType: "image",
      },
      incident: {
        id: "test-id",
        name: "Test Incident",
        artifactContent: "data:image/png;base64,testImageData",
      },
    };

    render(<IncidentManagementForm {...propsEditModeWithImage} />);

    expect(screen.getByText(/current image/i)).toBeInTheDocument();
    expect(screen.getByAltText(/current artifact/i)).toBeInTheDocument();
    expect(screen.getByAltText(/current artifact/i)).toHaveAttribute(
      "src",
      "data:image/png;base64,testImageData"
    );
  });

  it("calls handleFileChange when file is uploaded", async () => {
    const user = userEvent.setup();
    const propsWithImageArtifact = {
      ...mockProps,
      formData: {
        ...mockProps.formData,
        artifactType: "image",
      },
    };

    render(<IncidentManagementForm {...propsWithImageArtifact} />);

    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    const fileInput = screen.getByLabelText(/upload image/i);

    await user.upload(fileInput, file);

    expect(mockProps.handleFileChange).toHaveBeenCalled();
  });

  it("displays file error when provided", () => {
    const propsWithFileError = {
      ...mockProps,
      formData: {
        ...mockProps.formData,
        artifactType: "image",
      },
      fileState: {
        ...mockProps.fileState,
        error: "File size too large",
      },
    };

    render(<IncidentManagementForm {...propsWithFileError} />);

    expect(screen.getByText("File size too large")).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();

    const onCloseMock = jest.fn();

    render(<IncidentManagementForm {...mockProps} onClose={onCloseMock} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(onCloseMock).toHaveBeenCalled();
  });

  it("updates submit button text based on props", () => {
    const propsWithCustomLabels = {
      ...mockProps,
      submitLabel: "Custom Submit",
      loadingLabel: "Custom Loading...",
    };

    render(<IncidentManagementForm {...propsWithCustomLabels} />);

    expect(
      screen.getByRole("button", { name: /custom submit/i })
    ).toBeInTheDocument();

    const propsWithCustomLabelsLoading = {
      ...propsWithCustomLabels,
      isSubmitting: true,
    };

    render(<IncidentManagementForm {...propsWithCustomLabelsLoading} />);

    expect(
      screen.getByRole("button", { name: /custom loading/i })
    ).toBeInTheDocument();
  });
});
