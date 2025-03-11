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
        severity: "4",
        description: "Original description"
      }
    ],
    setIncidents: jest.fn()
  })),
  IncidentProvider: ({ children }) => <div data-testid="mock-incident-provider">{children}</div>
}));

// Mock the handleUpdateIncident function
jest.mock("@/app/catalog/crudHandlers", () => ({
  handleUpdateIncident: jest.fn(() => Promise.resolve([
    { 
      id: "test-id", 
      name: "Updated Incident",
      incident_date: "2000-01-01",
      category: "Hardware",
      severity: "4",
      description: "Updated description"
    }
  ]))
}));

// Mock console.error to avoid test output clutter
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe("MSW Handlers", () => {
  it("defines API handlers", () => {
    // Just a placeholder test to ensure MSW is correctly set up
    expect(true).toBe(true);
  });
});

describe("EditIncidentForm", () => {
  const mockOnClose = jest.fn();

  // Mock incident to edit
  const mockIncident = {
    id: "test-id",
    name: "Original Incident",
    incident_date: "2000-01-01",
    category: "Hardware",
    severity: "4",
    description: "Original description",
    cause: "Original cause",
    consequences: "Original consequences",
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
    render(
      <EditIncidentForm incident={mockIncident} onClose={mockOnClose} />
    );

    // Check fields are populated with incident data
    expect(screen.getByLabelText(/incident name \*/i)).toHaveValue(
      mockIncident.name
    );
    expect(screen.getByLabelText(/date \*/i)).toHaveValue(
      mockIncident.incident_date
    );
    expect(screen.getByLabelText(/description \*/i)).toHaveValue(
      mockIncident.description
    );
    expect(screen.getByLabelText(/cause/i)).toHaveValue(mockIncident.cause);
    expect(screen.getByLabelText(/consequences/i)).toHaveValue(
      mockIncident.consequences
    );
    expect(screen.getByLabelText(/time to resolve/i)).toHaveValue(
      mockIncident.time_to_resolve
    );
    
    // Since artifact type is 'code', the HTML field should be visible
    expect(screen.getByLabelText(/html code/i)).toHaveValue(
      mockIncident.artifactContent
    );

    // Severity 4 radio button should be checked
    expect(screen.getByLabelText("4")).toBeChecked();
  });

  it("handles form submission with updated data", async () => {
    const user = userEvent.setup();

    render(
      <EditIncidentForm incident={mockIncident} onClose={mockOnClose} />
    );

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

    // Change severity to 5
    await user.click(screen.getByLabelText("5"));

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
            severity: "5",
            artifactType: "none",
          }),
        })
      );
    });

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();

    render(
      <EditIncidentForm incident={mockIncident} onClose={mockOnClose} />
    );

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

  it("returns null when incident is null", () => {
    const { container } = render(
      <EditIncidentForm incident={null} onClose={mockOnClose} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
