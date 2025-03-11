import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddIncidentForm from "@/app/components/ui/forms/AddIncidentForm";
import { IncidentProvider } from "@/app/contexts/IncidentContext";
import * as crudHandlers from "@/app/catalog/crudHandlers";

// Mock the handleAddNewIncident function
jest.mock("@/app/catalog/crudHandlers", () => ({
  handleAddNewIncident: jest.fn(),
}));

// Mock console.error to avoid test output clutter
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe("AddIncidentForm", () => {
  const mockOnClose = jest.fn();
  const mockSetIncidents = jest.fn();

  // Setup mock IncidentContext
  const mockIncidentContext = {
    incidents: [],
    setIncidents: mockSetIncidents,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default success response from handleAddNewIncident
    crudHandlers.handleAddNewIncident.mockResolvedValue([
      { id: "new-id", name: "Test Incident" },
    ]);
  });

  it("renders all form fields correctly", () => {
    render(
      <IncidentProvider value={mockIncidentContext}>
        <AddIncidentForm onClose={mockOnClose} />
      </IncidentProvider>
    );

    // Check required fields are present
    expect(screen.getByLabelText(/incident name \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description \*/i)).toBeInTheDocument();

    // Check optional fields are present
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/severity level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/consequences/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cause/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time to resolve/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/artifact type/i)).toBeInTheDocument();

    // Check buttons
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add incident/i })
    ).toBeInTheDocument();
  });

  it("initially shows default values", () => {
    render(
      <IncidentProvider value={mockIncidentContext}>
        <AddIncidentForm onClose={mockOnClose} />
      </IncidentProvider>
    );

    // Check default values
    expect(screen.getByLabelText(/incident name \*/i)).toHaveValue("");
    expect(screen.getByLabelText(/date \*/i)).toHaveValue("");
    expect(screen.getByLabelText(/description \*/i)).toHaveValue("");

    // Dropdown defaults
    expect(screen.getByLabelText(/category/i)).toHaveValue("Software");
    expect(screen.getByLabelText(/artifact type/i)).toHaveValue("none");

    // Radio button default (severity 3)
    expect(screen.getByLabelText("3")).toBeChecked();
  });

  it("conditionally shows different fields based on artifact type selection", async () => {
    const user = userEvent.setup();

    render(
      <IncidentProvider value={mockIncidentContext}>
        <AddIncidentForm onClose={mockOnClose} />
      </IncidentProvider>
    );

    // Initially, no artifact-specific fields should be visible
    expect(screen.queryByLabelText(/html code/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/upload image/i)).not.toBeInTheDocument();

    // Select 'code' artifact type
    await user.selectOptions(screen.getByLabelText(/artifact type/i), ["code"]);

    // Now HTML code field should be visible
    expect(screen.getByLabelText(/html code/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/upload image/i)).not.toBeInTheDocument();

    // Select 'image' artifact type
    await user.selectOptions(screen.getByLabelText(/artifact type/i), [
      "image",
    ]);

    // Now upload image field should be visible
    expect(screen.queryByLabelText(/html code/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/upload image/i)).toBeInTheDocument();
  });

  it("handles form submission with required fields", async () => {
    const user = userEvent.setup();

    render(
      <IncidentProvider value={mockIncidentContext}>
        <AddIncidentForm onClose={mockOnClose} />
      </IncidentProvider>
    );

    // Fill in required fields
    await user.type(
      screen.getByLabelText(/incident name \*/i),
      "Test Incident"
    );
    await user.type(screen.getByLabelText(/date \*/i), "01/01/2022");
    await user.type(
      screen.getByLabelText(/description \*/i),
      "Test description"
    );

    // Submit the form
    await user.click(screen.getByRole("button", { name: /add incident/i }));

    // Check if handleAddNewIncident was called with correct data
    await waitFor(() => {
      expect(crudHandlers.handleAddNewIncident).toHaveBeenCalledWith({
        addition: expect.objectContaining({
          name: "Test Incident",
          incident_date: "2022-01-01",
          description: "Test description",
          category: "Software",
          severity: "3",
        }),
      });
    });

    // Check if setIncidents was called with the result
    expect(mockSetIncidents).toHaveBeenCalled();

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();

    render(
      <IncidentProvider value={mockIncidentContext}>
        <AddIncidentForm onClose={mockOnClose} />
      </IncidentProvider>
    );

    // Submit without filling required fields
    await user.click(screen.getByRole("button", { name: /add incident/i }));

    // Should show error message
    await waitFor(() => {
      expect(
        screen.getByText(/please fill in this field./i)
      ).toBeInTheDocument();
    });

    // handleAddNewIncident should not be called
    expect(crudHandlers.handleAddNewIncident).not.toHaveBeenCalled();

    // onClose should not be called
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("validates date format", async () => {
    const user = userEvent.setup();

    render(
      <IncidentProvider value={mockIncidentContext}>
        <AddIncidentForm onClose={mockOnClose} />
      </IncidentProvider>
    );

    // Fill required fields with invalid date
    await user.type(
      screen.getByLabelText(/incident name \*/i),
      "Test Incident"
    );
    await user.type(screen.getByLabelText(/date \*/i), "01/01/2022"); // Wrong format
    await user.type(
      screen.getByLabelText(/description \*/i),
      "Test description"
    );

    // Submit the form
    await user.click(screen.getByRole("button", { name: /add incident/i }));

    // Should show error message about date format
    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid date in yyyy-mm-dd format/i)
      ).toBeInTheDocument();
    });

    // handleAddNewIncident should not be called
    expect(crudHandlers.handleAddNewIncident).not.toHaveBeenCalled();
  });

  it("handles error from handleAddNewIncident", async () => {
    // Mock API error
    crudHandlers.handleAddNewIncident.mockResolvedValue("API Error");

    const user = userEvent.setup();

    render(
      <IncidentProvider value={mockIncidentContext}>
        <AddIncidentForm onClose={mockOnClose} />
      </IncidentProvider>
    );

    // Fill in required fields
    await user.type(
      screen.getByLabelText(/incident name \*/i),
      "Test Incident"
    );
    await user.type(screen.getByLabelText(/date \*/i), "2022-01-01");
    await user.type(
      screen.getByLabelText(/description \*/i),
      "Test description"
    );

    // Submit the form
    await user.click(screen.getByRole("button", { name: /add incident/i }));

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/api error/i)).toBeInTheDocument();
    });

    // handleAddNewIncident should be called
    expect(crudHandlers.handleAddNewIncident).toHaveBeenCalled();

    // But onClose should not be called because of error
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("handles network errors during submission", async () => {
    // Mock network error
    crudHandlers.handleAddNewIncident.mockRejectedValue(
      new Error("Network Error")
    );

    const user = userEvent.setup();

    render(
      <IncidentProvider value={mockIncidentContext}>
        <AddIncidentForm onClose={mockOnClose} />
      </IncidentProvider>
    );

    // Fill in required fields
    await user.type(
      screen.getByLabelText(/incident name \*/i),
      "Test Incident"
    );
    await user.type(screen.getByLabelText(/date \*/i), "2022-01-01");
    await user.type(
      screen.getByLabelText(/description \*/i),
      "Test description"
    );

    // Submit the form
    await user.click(screen.getByRole("button", { name: /add incident/i }));

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    // Check console.error was called with the error
    expect(console.error).toHaveBeenCalledWith(
      "Error adding incident:",
      expect.any(Error)
    );
  });

  it("handles file upload for image artifacts", async () => {
    const user = userEvent.setup();

    // Mock FileReader API
    const originalFileReader = window.FileReader;
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      onload: null,
    };
    window.FileReader = jest.fn(() => mockFileReaderInstance);

    render(
      <IncidentProvider value={mockIncidentContext}>
        <AddIncidentForm onClose={mockOnClose} />
      </IncidentProvider>
    );

    // Fill in required fields
    await user.type(
      screen.getByLabelText(/incident name \*/i),
      "Test Incident"
    );
    await user.type(screen.getByLabelText(/date \*/i), "2022-01-01");
    await user.type(
      screen.getByLabelText(/description \*/i),
      "Test description"
    );

    // Select 'image' artifact type
    await user.selectOptions(screen.getByLabelText(/artifact type/i), [
      "image",
    ]);

    // Upload an image
    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    const fileInput = screen.getByLabelText(/upload image/i);

    await user.upload(fileInput, file);

    // Simulate FileReader onload event
    waitFor(() => {
      mockFileReaderInstance.result = "data:image/png;base64,dummybase64";
      mockFileReaderInstance.onload({ target: mockFileReaderInstance });
    });

    // Submit the form
    await user.click(screen.getByRole("button", { name: /add incident/i }));

    // handleAddNewIncident should be called with file data
    await waitFor(() => {
      expect(crudHandlers.handleAddNewIncident).toHaveBeenCalledWith(
        expect.objectContaining({
          addition: expect.any(Object),
          fileData: "data:image/png;base64,dummybase64",
          fileName: "test.png",
          fileType: "image/png",
        })
      );
    });

    // Restore original FileReader
    window.FileReader = originalFileReader;
  });

  it("disables submit button during submission", async () => {
    // Mock a delay in the API call
    crudHandlers.handleAddNewIncident.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
    );

    const user = userEvent.setup();

    render(
      <IncidentProvider value={mockIncidentContext}>
        <AddIncidentForm onClose={mockOnClose} />
      </IncidentProvider>
    );

    // Fill in required fields
    await user.type(
      screen.getByLabelText(/incident name \*/i),
      "Test Incident"
    );
    await user.type(screen.getByLabelText(/date \*/i), "2022-01-01");
    await user.type(
      screen.getByLabelText(/description \*/i),
      "Test description"
    );

    // Submit the form
    await user.click(screen.getByRole("button", { name: /add incident/i }));

    // Button should be disabled and show "Adding..." text
    const submitButton = screen.getByRole("button", { name: /adding\.\.\./i });
    expect(submitButton).toBeDisabled();

    // Cancel button should also be disabled during submission
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    expect(cancelButton).toBeDisabled();

    // Wait for submission to complete
    await waitFor(() => {
      expect(crudHandlers.handleAddNewIncident).toHaveBeenCalled();
    });
  });

  it("closes the form when cancel button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <IncidentProvider value={mockIncidentContext}>
        <AddIncidentForm onClose={mockOnClose} />
      </IncidentProvider>
    );

    // Click cancel button
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    // onClose should be called
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // handleAddNewIncident should not be called
    expect(crudHandlers.handleAddNewIncident).not.toHaveBeenCalled();
  });
});
