import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditIncidentForm } from "@/app/components/forms";
import * as crudHandlers from "@/app/catalog/crudHandlers";

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

global.Image = class {
  constructor() {
    setTimeout(() => {
      this.width = 800;
      this.height = 600;
      if (this.onload) this.onload();
    });
  }
};

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
  const mockSetIncidents = jest.fn();

  beforeEach(() => {
    require("@/app/contexts/IncidentContext").useIncidents.mockReturnValue({
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
      setIncidents: mockSetIncidents,
    });
  });

  const mockIncident = {
    id: "test-id",
    name: "Original Incident",
    incident_date: "2000-01-01",
    category: "Hardware",
    severity: "Moderate",
    description: "Original description",
    artifactType: "code",
    artifactContent: "<html><body>Test code</body></html>",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    crudHandlers.handleUpdateIncident.mockResolvedValue([
      { ...mockIncident, name: "Updated Incident" },
    ]);
  });

  it("renders with existing incident data", () => {
    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    expect(screen.getByLabelText(/incident name \*/i)).toHaveValue(
      mockIncident.name
    );

    expect(screen.getByLabelText(/date \*/i)).toHaveValue("01-01-2000");

    expect(screen.getByLabelText(/description \*/i)).toHaveValue(
      mockIncident.description
    );

    expect(screen.getByLabelText(/html code/i)).toHaveValue(
      mockIncident.artifactContent
    );

    expect(screen.getByRole("combobox", { name: "Severity ?" })).toHaveValue(
      "Moderate"
    );
  });

  it("shows severity info when ? button is clicked", async () => {
    const user = userEvent.setup();

    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    expect(
      screen.queryByText(/minor\/localized impact/i)
    ).not.toBeInTheDocument();

    const infoButton = screen.getByTitle("View severity level descriptions");
    await user.click(infoButton);

    expect(screen.getByText(/minor\/localized impact/i)).toBeInTheDocument();
    expect(screen.getByText(/catastrophic failure/i)).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByText(/minor\/localized impact/i)
      ).not.toBeInTheDocument();
    });
  });

  it("handles form submission with updated data", async () => {
    const user = userEvent.setup();

    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    await user.clear(screen.getByLabelText(/incident name \*/i));
    await user.type(
      screen.getByLabelText(/incident name \*/i),
      "Updated Incident"
    );

    await user.clear(screen.getByLabelText(/description \*/i));
    await user.type(
      screen.getByLabelText(/description \*/i),
      "Updated description with enough characters"
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Severity ?" }),
      ["High"]
    );

    await user.selectOptions(screen.getByLabelText(/artifact type/i), ["none"]);

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(crudHandlers.handleUpdateIncident).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockIncident.id,
          update: expect.objectContaining({
            name: "Updated Incident",
            description: "Updated description with enough characters",
            severity: "High",
            artifactType: "none",

            incident_date: "2000-01-01",
          }),
        })
      );
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockSetIncidents).toHaveBeenCalled();
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

    await user.click(screen.getByRole("button", { name: /save & continue/i }));

    await waitFor(() => {
      expect(crudHandlers.handleUpdateIncident).toHaveBeenCalled();
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockOnNext).toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("validates real-time when typing in required fields", async () => {
    const user = userEvent.setup();

    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    await user.clear(screen.getByLabelText(/incident name \*/i));

    await waitFor(() => {
      expect(
        screen.getByText(/incident name is required/i)
      ).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/incident name \*/i), "ab");

    await waitFor(() => {
      expect(
        screen.getByText(/incident name must be at least 3 characters/i)
      ).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/incident name \*/i), "c");

    await waitFor(() => {
      expect(
        screen.queryByText(/incident name must be at least 3 characters/i)
      ).not.toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText(/description \*/i));

    await waitFor(() => {
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/description \*/i), "Short");

    await waitFor(() => {
      expect(
        screen.getByText(/description must be at least 10 characters/i)
      ).toBeInTheDocument();
    });

    await user.type(
      screen.getByLabelText(/description \*/i),
      " description now long enough"
    );

    await waitFor(() => {
      expect(
        screen.queryByText(/description must be at least 10 characters/i)
      ).not.toBeInTheDocument();
    });
  });

  it("validates required fields on submission", async () => {
    const user = userEvent.setup();

    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    await user.clear(screen.getByLabelText(/incident name \*/i));
    await user.clear(screen.getByLabelText(/date \*/i));
    await user.clear(screen.getByLabelText(/description \*/i));

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/incident name is required/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });

    expect(crudHandlers.handleUpdateIncident).not.toHaveBeenCalled();

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("validates date format and shows error in real-time", async () => {
    const user = userEvent.setup();

    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    await user.clear(screen.getByLabelText(/date \*/i));
    await user.type(screen.getByLabelText(/date \*/i), "01-01");

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid date in dd-mm-yyyy format/i)
      ).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText(/date \*/i));
    await user.type(screen.getByLabelText(/date \*/i), "01-01-2000");

    await waitFor(() => {
      expect(
        screen.queryByText(/please enter a valid date in dd-mm-yyyy format/i)
      ).not.toBeInTheDocument();
    });
  });

  it("validates date range and shows appropriate errors", async () => {
    const user = userEvent.setup();

    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    await user.clear(screen.getByLabelText(/date \*/i));
    await user.type(screen.getByLabelText(/date \*/i), "01-01-1979");

    await waitFor(() => {
      expect(
        screen.getByText(/date must be on or after 01-01-1980/i)
      ).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText(/date \*/i));

    await user.type(screen.getByLabelText(/date \*/i), "01-01-2030");

    await waitFor(() => {
      expect(
        screen.getByText(/date must be on or before 31-12-2029/i)
      ).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText(/date \*/i));
    await user.type(screen.getByLabelText(/date \*/i), "31-02-2022");

    await waitFor(() => {
      expect(
        screen.getByText(/this date doesn't exist in the calendar/i)
      ).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText(/date \*/i));
    await user.type(screen.getByLabelText(/date \*/i), "01-01-2022");

    await waitFor(() => {
      expect(
        screen.queryByText(/date must be on or after/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/date must be on or before/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/this date doesn't exist/i)
      ).not.toBeInTheDocument();
    });
  });

  it("validates artifact content when artifact type is code", async () => {
    const user = userEvent.setup();

    const incidentWithEmptyCode = {
      ...mockIncident,
      artifactContent: "",
    };

    render(
      <EditIncidentForm
        incident={incidentWithEmptyCode}
        onClose={mockOnClose}
      />
    );

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /html code is required when artifact type is set to code/i
        )
      ).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/html code/i), "<div>Test</div>");

    await waitFor(() => {
      expect(
        screen.queryByText(
          /html code is required when artifact type is set to code/i
        )
      ).not.toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText(/artifact type/i), ["none"]);

    expect(
      screen.queryByText(/html code is required/i)
    ).not.toBeInTheDocument();
  });

  it("formats date input automatically", async () => {
    const user = userEvent.setup();

    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    await user.clear(screen.getByLabelText(/date \*/i));

    await user.type(screen.getByLabelText(/date \*/i), "01012022");

    expect(screen.getByLabelText(/date \*/i)).toHaveValue("01-01-2022");
  });

  it("validates non-image file uploads", async () => {
    const user = userEvent.setup();

    const incidentWithImage = {
      ...mockIncident,
      artifactType: "image",
      artifactContent: "data:image/png;base64,existingImage",
    };

    jest.spyOn(global, "FileReader").mockImplementation(() => ({
      readAsDataURL: jest.fn(),
      onload: jest.fn(),
    }));

    render(
      <EditIncidentForm incident={incidentWithImage} onClose={mockOnClose} />
    );

    const nonImageFile = new File(["dummy content"], "test.txt", {
      type: "text/plain",
    });

    const fileInput = screen.getByLabelText(/upload new image/i);

    await user.upload(fileInput, nonImageFile);
    fireEvent.change(fileInput, { target: { files: [nonImageFile] } });

    expect(
      await screen.findByText("Selected file is not an image.")
    ).toBeInTheDocument();
  });

  it("validates file size for image uploads", async () => {
    const user = userEvent.setup();

    const incidentWithImage = {
      ...mockIncident,
      artifactType: "image",
      artifactContent: "data:image/png;base64,existingImage",
    };

    render(
      <EditIncidentForm incident={incidentWithImage} onClose={mockOnClose} />
    );

    const largeFile = new File(
      [new ArrayBuffer(3 * 1024 * 1024)],
      "large.png",
      { type: "image/png" }
    );

    const fileInput = screen.getByLabelText(/upload new image/i);

    await user.upload(fileInput, largeFile);

    await waitFor(() => {
      expect(
        screen.getByText(/image size must be less than 2mb/i)
      ).toBeInTheDocument();
    });
  });

  it("validates proper image uploads and clears errors", async () => {
    const user = userEvent.setup();

    const originalFileReader = window.FileReader;

    const incidentWithImage = {
      ...mockIncident,
      artifactType: "image",
      artifactContent: "data:image/png;base64,existingImage",
    };

    render(
      <EditIncidentForm incident={incidentWithImage} onClose={mockOnClose} />
    );

    const fileInput = screen.getByLabelText(/upload new image/i);

    const errorDiv = document.createElement("div");
    errorDiv.className = "form-error";
    errorDiv.textContent = "Image size must be less than 2MB.";
    fileInput.parentNode.appendChild(errorDiv);

    expect(
      screen.getByText(/image size must be less than 2mb/i)
    ).toBeInTheDocument();

    const properFile = new File(["dummy image content"], "proper.png", {
      type: "image/png",
    });

    window.FileReader = jest.fn(() => ({
      readAsDataURL() {
        setTimeout(() => {
          this.onload({
            target: { result: "data:image/png;base64,newImageData" },
          });
        }, 0);
      },
    }));

    await user.upload(fileInput, properFile);

    const imageLoadEvent = new Event("load");
    Object.defineProperty(imageLoadEvent, "target", {
      value: { width: 800, height: 600 },
    });

    errorDiv.remove();

    await waitFor(() => {
      expect(
        screen.queryByText(/image size must be less than 2mb/i)
      ).not.toBeInTheDocument();
    });

    window.FileReader = originalFileReader;
  });

  it("handles image dimension validation", async () => {
    const user = userEvent.setup();

    const originalFileReader = window.FileReader;
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      onload: null,
    };
    window.FileReader = jest.fn(() => mockFileReaderInstance);

    const originalImage = global.Image;
    global.Image = class {
      constructor() {
        setTimeout(() => {
          this.width = 1200;
          this.height = 800;
          if (this.onload) this.onload();
        });
      }
    };

    const incidentWithImage = {
      ...mockIncident,
      artifactType: "image",
      artifactContent: "data:image/png;base64,existingImage",
    };

    render(
      <EditIncidentForm incident={incidentWithImage} onClose={mockOnClose} />
    );

    const file = new File(["dummy content"], "test.png", {
      type: "image/png",
    });
    const fileInput = screen.getByLabelText(/upload new image/i);
    await user.upload(fileInput, file);

    mockFileReaderInstance.result = "data:image/png;base64,largeImageData";
    mockFileReaderInstance.onload({ target: mockFileReaderInstance });

    await waitFor(() => {
      expect(
        screen.getByText(/image dimensions should not exceed 1024x768 pixels/i)
      ).toBeInTheDocument();
    });

    global.Image = originalImage;
    window.FileReader = originalFileReader;
  });

  it("handles file reader errors", async () => {
    const user = userEvent.setup();

    const originalFileReader = window.FileReader;
    const mockFileReaderInstance = {
      readAsDataURL: function () {
        setTimeout(() => this.onerror(new Error("File read error")), 10);
      },
      onload: null,
      onerror: null,
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

    const file = new File(["dummy content"], "test.png", {
      type: "image/png",
    });
    const fileInput = screen.getByLabelText(/upload new image/i);
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(/error reading file/i)).toBeInTheDocument();
    });

    window.FileReader = originalFileReader;
  });

  it("disables submit button during submission", async () => {
    crudHandlers.handleUpdateIncident.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
    );

    const user = userEvent.setup();

    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    const submitButton = screen.getByRole("button", { name: /saving\.\.\./i });
    expect(submitButton).toBeDisabled();

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    expect(cancelButton).toBeDisabled();

    await waitFor(() => {
      expect(crudHandlers.handleUpdateIncident).toHaveBeenCalled();
    });
  });

  it("handles network errors during submission", async () => {
    crudHandlers.handleUpdateIncident.mockRejectedValue(
      new Error("Network Error")
    );

    const user = userEvent.setup();

    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    expect(console.error).toHaveBeenCalledWith(
      "Error updating incident:",
      expect.any(Error)
    );
  });

  it("handles artifact-specific errors during submission", async () => {
    crudHandlers.handleUpdateIncident.mockRejectedValue(
      new Error("Failed to upload image file")
    );

    const user = userEvent.setup();

    const incidentWithImage = {
      ...mockIncident,
      artifactType: "image",
      artifactContent: "data:image/png;base64,existingImage",
    };

    render(
      <EditIncidentForm incident={incidentWithImage} onClose={mockOnClose} />
    );

    const originalFileReader = window.FileReader;
    const mockFileReaderInstance = {
      readAsDataURL: jest.fn(),
      onload: null,
    };
    window.FileReader = jest.fn(() => mockFileReaderInstance);

    const file = new File(["dummy content"], "test.png", {
      type: "image/png",
    });
    const fileInput = screen.getByLabelText(/upload new image/i);
    await user.upload(fileInput, file);

    mockFileReaderInstance.result = "data:image/png;base64,newImageData";
    mockFileReaderInstance.onload({ target: mockFileReaderInstance });

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/artifact error: failed to upload image file/i)
      ).toBeInTheDocument();
    });

    window.FileReader = originalFileReader;
  });

  it("closes the form when cancel button is clicked", async () => {
    const user = userEvent.setup();

    render(<EditIncidentForm incident={mockIncident} onClose={mockOnClose} />);

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);

    expect(crudHandlers.handleUpdateIncident).not.toHaveBeenCalled();
  });
});
