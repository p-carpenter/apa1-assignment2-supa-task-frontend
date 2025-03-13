import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditIncidentForm from "@/app/components/ui/forms/EditIncidentForm";
import * as crudHandlers from "@/app/catalog/crudHandlers";

// Mock the IncidentContext
jest.mock("@/app/contexts/IncidentContext", () => ({
  useIncidents: jest.fn(() => ({
    incidents: [
      {
        id: "test-id",
        name: "Original Incident",
        incident_date: "2000-01-01",
        category: "Hardware",
        severity: "Moderate",
        description: "Original description",
      },
    ],
    setIncidents: jest.fn(),
  })),
  IncidentProvider: ({ children }) => (
    <div data-testid="mock-incident-provider">{children}</div>
  ),
}));

// Mock the handleUpdateIncident function
jest.mock("@/app/catalog/crudHandlers", () => ({
  handleUpdateIncident: jest.fn(() =>
    Promise.resolve([
      {
        id: "test-id",
        name: "Updated Incident",
        incident_date: "2000-01-01",
        category: "Hardware",
        severity: "Moderate",
        description: "Updated description",
      },
    ])
  ),
}));

// Mock console.error to avoid test output clutter
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe("EditIncidentForm", () => {
  const mockOnClose = jest.fn();
  const mockOnNext = jest.fn();

  // Mock incident to edit (with ISO date format)
  const mockIncident = {
    id: "test-id",
    name: "Original Incident",
    incident_date: "2000-01-01", // ISO format in the database
    category: "Hardware",
    severity: "Moderate",
    description: "Original description",
    cause: "Original cause",
    consequences: "Original impact",
    time_to_resolve: "2 weeks",
    artifactType: "code",
    artifactContent: "<html><body>Test code</body></html>",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock return value
    crudHandlers.handleUpdateIncident.mockResolvedValue([
      { ...mockIncident, name: "Updated Incident" },
    ]);
  });

  it("renders with existing incident data", () => {
    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    // Check fields are populated with incident data
    expect(screen.getByLabelText(/incident name \*/i)).toHaveValue(
      mockIncident.name
    );

    // Date should be converted from ISO (YYYY-MM-DD) to DD-MM-YYYY format
    expect(screen.getByLabelText(/date \*/i)).toHaveValue("01-01-2000");

    expect(screen.getByLabelText(/description \*/i)).toHaveValue(
      mockIncident.description
    );
    expect(screen.getByLabelText(/cause/i)).toHaveValue(mockIncident.cause);
    expect(screen.getByLabelText(/impact/i)).toHaveValue(
      mockIncident.consequences
    );
    expect(screen.getByLabelText(/time to resolve/i)).toHaveValue(
      mockIncident.time_to_resolve
    );

    // Since artifact type is 'code', the HTML field should be visible
    expect(screen.getByLabelText(/html code/i)).toHaveValue(
      mockIncident.artifactContent
    );

    // Check severity dropdown value
    expect(screen.getByLabelText(/severity/i)).toHaveValue("Moderate");
  });

  it("shows severity info when ? button is clicked", async () => {
    const user = userEvent.setup();

    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    // Initially, severity info should not be visible
    expect(
      screen.queryByText(/minor\/localized impact/i)
    ).not.toBeInTheDocument();

    // Click the ? button near severity
    const infoButton = screen.getByTitle("View severity level descriptions");
    await user.click(infoButton);

    // Now severity info should be visible
    expect(screen.getByText(/minor\/localized impact/i)).toBeInTheDocument();
    expect(screen.getByText(/catastrophic failure/i)).toBeInTheDocument();

    // Click the close button
    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    // Severity info should be hidden again
    await waitFor(() => {
      expect(
        screen.queryByText(/minor\/localized impact/i)
      ).not.toBeInTheDocument();
    });
  });

  it("handles form submission with updated data", async () => {
    const user = userEvent.setup();

    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    // Update some fields
    await user.clear(screen.getByLabelText(/incident name \*/i));
    await user.type(
      screen.getByLabelText(/incident name \*/i),
      "Updated Incident"
    );

    await user.clear(screen.getByLabelText(/description \*/i));
    await user.type(
      screen.getByLabelText(/description \*/i),
      "Updated description"
    );

    // Change severity to High
    await user.selectOptions(screen.getByLabelText(/severity/i), ["High"]);

    // Change artifact type to 'none'
    await user.selectOptions(screen.getByLabelText(/artifact type/i), ["none"]);

    // Submit the form
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    // Check if handleUpdateIncident was called with correct data
    await waitFor(() => {
      expect(crudHandlers.handleUpdateIncident).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockIncident.id,
          update: expect.objectContaining({
            name: "Updated Incident",
            description: "Updated description",
            severity: "High",
            artifactType: "none",
            // Date should be converted back to YYYY-MM-DD format
            incident_date: "2000-01-01",
          }),
        })
      );
    });

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onNext instead of onClose when provided", async () => {
    const user = userEvent.setup();

    render(
      <EditIncidentForm
        incident={mockIncident}
        onClose={mockOnClose}
        onNext={mockOnNext}
      />
    );

    // Fill in required fields
    await user.clear(screen.getByLabelText(/incident name \*/i));
    await user.type(
      screen.getByLabelText(/incident name \*/i),
      "Updated Incident"
    );

    // Submit the form
    // Button should say "Save & Continue" when onNext is provided
    await user.click(screen.getByRole("button", { name: /save & continue/i }));

    // Check if handleUpdateIncident was called
    await waitFor(() => {
      expect(crudHandlers.handleUpdateIncident).toHaveBeenCalled();
    });

    // onNext should be called instead of onClose
    expect(mockOnNext).toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();

    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    // Clear required fields
    await user.clear(screen.getByLabelText(/incident name \*/i));
    await user.clear(screen.getByLabelText(/date \*/i));
    await user.clear(screen.getByLabelText(/description \*/i));

    // Submit the form
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    // Should show error message
    await waitFor(() => {
      expect(
        screen.getByText(/please fill in all required fields/i)
      ).toBeInTheDocument();
    });

    // handleUpdateIncident should not be called
    expect(crudHandlers.handleUpdateIncident).not.toHaveBeenCalled();

    // onClose should not be called
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("validates date format", async () => {
    const user = userEvent.setup();

    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    // Clear and enter invalid date format
    await user.clear(screen.getByLabelText(/date \*/i));
    await user.type(screen.getByLabelText(/date \*/i), "2000/01/01");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    // Should show error message about date format
    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid date in DD-MM-YYYY format/i)
      ).toBeInTheDocument();
    });

    // handleUpdateIncident should not be called
    expect(crudHandlers.handleUpdateIncident).not.toHaveBeenCalled();
  });

  it("validates date range", async () => {
    const user = userEvent.setup();

    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    // Test date before minimum allowed (1980-01-01)
    await user.clear(screen.getByLabelText(/date \*/i));
    await user.type(screen.getByLabelText(/date \*/i), "01-01-1979");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    // Should show error message about date range
    await waitFor(() => {
      expect(
        screen.getByText(/date must be on or after 01-01-1980/i)
      ).toBeInTheDocument();
    });

    // Clear date field
    await user.clear(screen.getByLabelText(/date \*/i));

    // Test date after maximum allowed (2029-12-31)
    await user.type(screen.getByLabelText(/date \*/i), "01-01-2030");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    // Should show error message about date range
    await waitFor(() => {
      expect(
        screen.getByText(/date must be on or before 31-12-2029/i)
      ).toBeInTheDocument();
    });
  });

  it("formats date input automatically", async () => {
    const user = userEvent.setup();

    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    // Clear date field
    await user.clear(screen.getByLabelText(/date \*/i));

    // Type digits without hyphens
    await user.type(screen.getByLabelText(/date \*/i), "01012022");

    // Should format with hyphens automatically
    expect(screen.getByLabelText(/date \*/i)).toHaveValue("01-01-2022");
  });

  it("handles image upload for artifacts", async () => {
    const user = userEvent.setup();

    // Mock FileReader API
    const originalFileReader = window.FileReader;
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      onload: null,
    };
    window.FileReader = jest.fn(() => mockFileReaderInstance);

    const incidentWithImage = {
      ...mockIncident,
      artifactType: "image",
      artifactContent: "data:image/png;base64,existingImage",
    };

    render(
      <EditIncidentForm incident={incidentWithImage} onClose={mockOnClose} />
    );

    // Image type should be selected
    expect(screen.getByLabelText(/artifact type/i)).toHaveValue("image");

    // Current image should be visible
    expect(screen.getByAltText(/current artifact/i)).toBeInTheDocument();
    expect(screen.getByAltText(/current artifact/i)).toHaveAttribute(
      "src",
      "data:image/png;base64,existingImage"
    );

    // Upload a new image
    const file = new File(["dummy content"], "new-image.png", {
      type: "image/png",
    });
    const fileInput = screen.getByLabelText(/upload new image/i);

    await user.upload(fileInput, file);

    // Simulate FileReader onload event
    mockFileReaderInstance.result = "data:image/png;base64,newImageData";
    mockFileReaderInstance.onload({ target: mockFileReaderInstance });

    // Submit the form
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    // handleUpdateIncident should be called with file data
    await waitFor(() => {
      expect(crudHandlers.handleUpdateIncident).toHaveBeenCalledWith(
        expect.objectContaining({
          id: incidentWithImage.id,
          update: expect.any(Object),
          fileData: "data:image/png;base64,newImageData",
          fileName: "new-image.png",
          fileType: "image/png",
        })
      );
    });

    // Restore original FileReader
    window.FileReader = originalFileReader;
  });

  it("disables submit button during submission", async () => {
    // Mock a delay in the API call
    crudHandlers.handleUpdateIncident.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
    );

    const user = userEvent.setup();

    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    // Submit the form
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    // Button should be disabled and show "Saving..." text
    const submitButton = screen.getByRole("button", { name: /saving\.\.\./i });
    expect(submitButton).toBeDisabled();

    // Cancel button should also be disabled during submission
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    expect(cancelButton).toBeDisabled();

    // Wait for submission to complete
    await waitFor(() => {
      expect(crudHandlers.handleUpdateIncident).toHaveBeenCalled();
    });
  });

  it("handles network errors during submission", async () => {
    // Mock network error
    crudHandlers.handleUpdateIncident.mockRejectedValue(
      new Error("Network Error")
    );

    const user = userEvent.setup();

    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    // Submit the form
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    // Check console.error was called with the error
    expect(console.error).toHaveBeenCalledWith(
      "Error updating incident:",
      expect.any(Error)
    );
  });

  it("closes the form when cancel button is clicked", async () => {
    const user = userEvent.setup();

    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    // Click cancel button
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    // onClose should be called
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // handleUpdateIncident should not be called
    expect(crudHandlers.handleUpdateIncident).not.toHaveBeenCalled();
  });
});
