import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IncidentModals from "@/app/components/ui/catalog/IncidentModals";
import * as crudHandlers from "@/app/catalog/crudHandlers";
import { formatDateInput } from "@/app/utils/formatting/dateUtils";
import { hasErrorMessage } from "@/app/utils/errors/errorService";

jest.mock("@/app/contexts/IncidentContext", () => ({
  useIncidents: jest.fn(),
}));

jest.mock("@/app/catalog/crudHandlers", () => ({
  handleAddNewIncident: jest.fn(),
  handleUpdateIncident: jest.fn(),
}));

jest.mock("@/app/utils/formatting/dateUtils", () => ({
  formatDateInput: jest.fn((input) => (input ? "01-01-2022" : "")),
  formatDateForDisplay: jest.fn(),
  parseDate: jest.fn(() => new Date("2022-01-01")),
}));

jest.mock("@/app/utils/errors/errorService", () => ({
  processApiError: jest.fn((error) => ({
    message: error.message,
    type: "error",
  })),
  isValidError: jest.fn(() => true),
  hasErrorMessage: jest.fn((error) => !!error.message),
  getErrorMessage: jest.fn((error) => error.message || "Unknown error"),
}));

global.FileReader = class {
  constructor() {
    this.result = "data:image/png;base64,mockbase64data";
  }
  readAsDataURL() {
    setTimeout(() => {
      this.onload({ target: { result: this.result } });
    }, 0);
  }
};

global.Image = class {
  constructor() {
    setTimeout(() => {
      this.width = 800;
      this.height = 600;
      if (this.onload) this.onload();
    });
  }
};

describe("IncidentModals", () => {
  const mockSetIncidents = jest.fn();
  const mockSelectedIncidents = [
    {
      id: "incident-1",
      name: "Test Incident 1",
      incident_date: "2022-01-01",
      category: "Software",
      severity: "Moderate",
      description: "Test description 1",
      artifactType: "none",
      artifactContent: "",
    },
    {
      id: "incident-2",
      name: "Test Incident 2",
      incident_date: "2022-02-01",
      category: "Hardware",
      severity: "High",
      description: "Test description 2",
      artifactType: "code",
      artifactContent: "<div>Test HTML</div>",
    },
  ];

  const defaultProps = {
    showAddModal: false,
    closeAddModal: jest.fn(),
    showEditModal: false,
    closeEditModal: jest.fn(),
    selectedIncidents: mockSelectedIncidents,
    currentEditIndex: 0,
    moveToNextEdit: jest.fn(),
  };

  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    require("@/app/contexts/IncidentContext").useIncidents.mockReturnValue({
      incidents: mockSelectedIncidents,
      setIncidents: mockSetIncidents,
    });

    crudHandlers.handleAddNewIncident.mockResolvedValue({
      data: [
        ...mockSelectedIncidents,
        { id: "new-incident", name: "New Incident" },
      ],
    });
    crudHandlers.handleUpdateIncident.mockResolvedValue({
      data: [...mockSelectedIncidents],
    });
  });

  describe("Add Incident Modal", () => {
    it("renders add incident modal when showAddModal is true", () => {
      render(<IncidentModals {...defaultProps} showAddModal={true} />);

      expect(
        screen.getByText("Add New Technical Incident")
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/incident name/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /add incident/i })
      ).toBeInTheDocument();
    });

    it("doesn't render add incident modal when showAddModal is false", () => {
      render(<IncidentModals {...defaultProps} />);

      expect(
        screen.queryByText("Add New Technical Incident")
      ).not.toBeInTheDocument();
    });

    it("calls closeAddModal when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<IncidentModals {...defaultProps} showAddModal={true} />);

      const cancelButton = screen.getByRole("button", { name: "Close modal" });
      await user.click(cancelButton);

      expect(defaultProps.closeAddModal).toHaveBeenCalled();
    });

    it("validates form inputs before submission", async () => {
      const user = userEvent.setup();
      render(<IncidentModals {...defaultProps} showAddModal={true} />);

      const submitButton = screen.getByRole("button", {
        name: /add incident/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/incident name is required/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/date is required/i)).toBeInTheDocument();
        expect(
          screen.getByText(/description is required/i)
        ).toBeInTheDocument();
      });

      expect(crudHandlers.handleAddNewIncident).not.toHaveBeenCalled();
    });

    it("shows severity info popup when ? button is clicked", async () => {
      const user = userEvent.setup();
      render(<IncidentModals {...defaultProps} showAddModal={true} />);

      const infoButton = screen.getByTitle("View severity level descriptions");
      await user.click(infoButton);

      expect(screen.getByText(/localized impact/i)).toBeInTheDocument();
    });

    it("submits form with valid data", async () => {
      const user = userEvent.setup();
      render(<IncidentModals {...defaultProps} showAddModal={true} />);

      await user.type(
        screen.getByLabelText(/incident name/i),
        "New Test Incident"
      );
      await user.type(screen.getByLabelText(/date/i), "01-01-2022");
      await user.type(
        screen.getByLabelText(/description/i),
        "This is a test description for the new incident"
      );

      const submitButton = screen.getByRole("button", {
        name: /add incident/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(crudHandlers.handleAddNewIncident).toHaveBeenCalledWith(
          expect.objectContaining({
            addition: expect.objectContaining({
              name: "New Test Incident",
              incident_date: expect.any(String),
              description: "This is a test description for the new incident",
            }),
          })
        );
      });

      expect(mockSetIncidents).toHaveBeenCalled();
      expect(defaultProps.closeAddModal).toHaveBeenCalled();
    });

    it("displays API error when submission fails", async () => {
      crudHandlers.handleAddNewIncident.mockRejectedValue(
        new Error("Failed to add incident")
      );

      const user = userEvent.setup();
      render(<IncidentModals {...defaultProps} showAddModal={true} />);

      await user.type(
        screen.getByLabelText(/incident name/i),
        "New Test Incident"
      );
      await user.type(screen.getByLabelText(/date/i), "01-01-2022");
      await user.type(
        screen.getByLabelText(/description/i),
        "This is a test description for the new incident"
      );

      const submitButton = screen.getByRole("button", {
        name: /add incident/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(crudHandlers.handleAddNewIncident).toHaveBeenCalled();

        expect(defaultProps.closeAddModal).not.toHaveBeenCalled();
      });
    });

    it("changes form fields when artifact type is changed to code", async () => {
      const user = userEvent.setup();
      render(<IncidentModals {...defaultProps} showAddModal={true} />);

      expect(screen.queryByLabelText(/html code/i)).not.toBeInTheDocument();

      await user.selectOptions(screen.getByLabelText(/artifact type/i), "code");

      expect(screen.getByLabelText(/html code/i)).toBeInTheDocument();
    });

    it("changes form fields when artifact type is changed to image", async () => {
      const user = userEvent.setup();
      render(<IncidentModals {...defaultProps} showAddModal={true} />);

      expect(screen.queryByLabelText(/upload image/i)).not.toBeInTheDocument();

      await user.selectOptions(
        screen.getByLabelText(/artifact type/i),
        "image"
      );

      expect(screen.getByLabelText(/upload image/i)).toBeInTheDocument();
    });

    it("handles file upload errors", async () => {
      const user = userEvent.setup();
      render(<IncidentModals {...defaultProps} showAddModal={true} />);

      await user.selectOptions(
        screen.getByLabelText(/artifact type/i),
        "image"
      );

      crudHandlers.handleAddNewIncident.mockRejectedValue(
        new Error("Failed to upload image file")
      );

      const file = new File(["dummy content"], "test.png", {
        type: "image/png",
      });
      const fileInput = screen.getByLabelText(/upload image/i);
      await user.upload(fileInput, file);

      await user.type(
        screen.getByLabelText(/incident name/i),
        "New Test Incident"
      );
      await user.type(screen.getByLabelText(/date/i), "01-01-2022");
      await user.type(
        screen.getByLabelText(/description/i),
        "This is a test description for the new incident"
      );

      const submitButton = screen.getByRole("button", {
        name: /add incident/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/artifact error: failed to upload image file/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Edit Incident Modal", () => {
    it("renders edit incident modal when showEditModal is true", () => {
      render(<IncidentModals {...defaultProps} showEditModal={true} />);

      expect(screen.getByText("Edit Incident (1/2)")).toBeInTheDocument();
      expect(screen.getByLabelText(/incident name/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /save & continue/i })
      ).toBeInTheDocument();
    });

    it("doesn't render edit incident modal when showEditModal is false", () => {
      render(<IncidentModals {...defaultProps} />);

      expect(screen.queryByText("Edit Incident")).not.toBeInTheDocument();
    });

    it("calls closeEditModal when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<IncidentModals {...defaultProps} showEditModal={true} />);

      const cancelButton = screen.getByRole("button", { name: "Close modal" });
      await user.click(cancelButton);

      expect(defaultProps.closeEditModal).toHaveBeenCalled();
    });

    it("loads initial form data from the selected incident", () => {
      render(<IncidentModals {...defaultProps} showEditModal={true} />);

      expect(screen.getByLabelText(/incident name/i)).toHaveValue(
        "Test Incident 1"
      );
      expect(screen.getByLabelText(/description/i)).toHaveValue(
        "Test description 1"
      );
    });

    it("changes save button text based on currentEditIndex", () => {
      render(
        <IncidentModals
          {...defaultProps}
          showEditModal={true}
          currentEditIndex={0}
        />
      );
      expect(
        screen.getByRole("button", { name: /save & continue/i })
      ).toBeInTheDocument();

      render(
        <IncidentModals
          {...defaultProps}
          showEditModal={true}
          currentEditIndex={1}
        />
      );
      expect(
        screen.getByRole("button", { name: /save changes/i })
      ).toBeInTheDocument();
    });

    it("submits form with valid data", async () => {
      const user = userEvent.setup();
      render(<IncidentModals {...defaultProps} showEditModal={true} />);

      await user.clear(screen.getByLabelText(/incident name/i));
      await user.type(
        screen.getByLabelText(/incident name/i),
        "Updated Test Incident"
      );

      const submitButton = screen.getByRole("button", {
        name: /save & continue/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(crudHandlers.handleUpdateIncident).toHaveBeenCalledWith(
          expect.objectContaining({
            id: "incident-1",
            update: expect.objectContaining({
              name: "Updated Test Incident",
            }),
          })
        );
      });

      expect(mockSetIncidents).toHaveBeenCalled();
      expect(defaultProps.moveToNextEdit).toHaveBeenCalled();
    });

    it("displays API error when submission fails", async () => {
      crudHandlers.handleUpdateIncident.mockRejectedValue(
        new Error("Failed to update incident")
      );

      const user = userEvent.setup();
      render(<IncidentModals {...defaultProps} showEditModal={true} />);

      const submitButton = screen.getByRole("button", {
        name: /save & continue/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(crudHandlers.handleUpdateIncident).toHaveBeenCalled();

        expect(defaultProps.moveToNextEdit).not.toHaveBeenCalled();
      });
    });

    it("validates form inputs before submission", async () => {
      const user = userEvent.setup();
      render(<IncidentModals {...defaultProps} showEditModal={true} />);

      await user.clear(screen.getByLabelText(/incident name/i));
      await user.clear(screen.getByLabelText(/description/i));

      const submitButton = screen.getByRole("button", {
        name: /save & continue/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/incident name is required/i)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/description is required/i)
        ).toBeInTheDocument();
      });

      expect(crudHandlers.handleUpdateIncident).not.toHaveBeenCalled();
    });

    it("handles artifact type changes", async () => {
      const user = userEvent.setup();

      render(
        <IncidentModals
          {...defaultProps}
          showEditModal={true}
          currentEditIndex={1}
        />
      );

      expect(screen.getByLabelText(/html code/i)).toBeInTheDocument();

      await user.selectOptions(
        screen.getByLabelText(/artifact type/i),
        "image"
      );

      expect(screen.getByLabelText(/upload new image/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/html code/i)).not.toBeInTheDocument();

      await user.selectOptions(screen.getByLabelText(/artifact type/i), "none");

      expect(
        screen.queryByLabelText(/upload new image/i)
      ).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/html code/i)).not.toBeInTheDocument();
    });

    it("validates code artifact content", async () => {
      const user = userEvent.setup();
      render(
        <IncidentModals
          {...defaultProps}
          showEditModal={true}
          currentEditIndex={1}
        />
      );

      await user.clear(screen.getByLabelText(/html code/i));

      const submitButton = screen.getByRole("button", {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            /html code is required when artifact type is set to code/i
          )
        ).toBeInTheDocument();
      });

      expect(crudHandlers.handleUpdateIncident).not.toHaveBeenCalled();
    });

    it("handles file upload in edit mode", async () => {
      const user = userEvent.setup();

      const imageIncident = {
        ...mockSelectedIncidents[0],
        artifactType: "image",
        artifactContent: "data:image/png;base64,existingImage",
      };

      const customProps = {
        ...defaultProps,
        selectedIncidents: [imageIncident],
        showEditModal: true,
      };

      global.FileReader = class {
        constructor() {
          this.result = "data:image/png;base64,newImageData";
          this.readAsDataURL = jest.fn((file) => {
            setTimeout(() => {
              if (this.onload) this.onload({ target: { result: this.result } });
            }, 0);
          });
        }
      };

      render(<IncidentModals {...customProps} />);

      const file = new File(
        [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])],
        "test.png",
        { type: "image/png" }
      );
      const fileInput = screen.getByLabelText(/upload new image/i);
      await user.upload(fileInput, file);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const submitButton = screen.getByRole("button", { name: /save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(crudHandlers.handleUpdateIncident).toHaveBeenCalled();
      });
    });

    it("handles switching between edit incident items", async () => {
      const { rerender } = render(
        <IncidentModals
          {...defaultProps}
          showEditModal={true}
          currentEditIndex={0}
        />
      );

      expect(screen.getByLabelText(/incident name/i)).toHaveValue(
        "Test Incident 1"
      );

      rerender(
        <IncidentModals
          {...defaultProps}
          showEditModal={true}
          currentEditIndex={1}
        />
      );

      expect(screen.getByLabelText(/incident name/i)).toHaveValue(
        "Test Incident 2"
      );
      expect(screen.getByLabelText(/html code/i)).toHaveValue(
        "<div>Test HTML</div>"
      );
    });

    it("handles file upload errors in edit mode", async () => {
      const user = userEvent.setup();

      const imageIncident = {
        ...mockSelectedIncidents[0],
        artifactType: "image",
        artifactContent: "data:image/png;base64,existingImage",
      };

      const customProps = {
        ...defaultProps,
        selectedIncidents: [imageIncident],
        showEditModal: true,
      };

      crudHandlers.handleUpdateIncident.mockRejectedValue(
        new Error("Failed to upload image file")
      );

      render(<IncidentModals {...customProps} />);

      const file = new File(["dummy content"], "test.png", {
        type: "image/png",
      });
      const fileInput = screen.getByLabelText(/upload new image/i);
      await user.upload(fileInput, file);

      const submitButton = screen.getByRole("button", { name: /save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/artifact error: failed to upload image file/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Common modal behaviors", () => {
    it("resets form state when modals are closed", async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <IncidentModals {...defaultProps} showAddModal={true} />
      );

      await user.type(
        screen.getByLabelText(/incident name/i),
        "Test form reset"
      );

      await user.click(screen.getByRole("button", { name: "Close modal" }));

      rerender(<IncidentModals {...defaultProps} showAddModal={true} />);

      expect(screen.getByLabelText(/incident name/i)).toHaveValue("");

      rerender(
        <IncidentModals
          {...defaultProps}
          showAddModal={false}
          showEditModal={true}
        />
      );

      await user.clear(screen.getByLabelText(/incident name/i));
      await user.type(screen.getByLabelText(/incident name/i), "Modified name");

      await user.click(screen.getByRole("button", { name: "Close modal" }));

      rerender(
        <IncidentModals
          {...defaultProps}
          showAddModal={false}
          showEditModal={true}
        />
      );

      expect(screen.getByLabelText(/incident name/i)).toHaveValue(
        "Test Incident 1"
      );
    });

    it("handles date formatting correctly", async () => {
      const user = userEvent.setup();

      render(<IncidentModals {...defaultProps} showAddModal={true} />);

      const dateInput = screen.getByLabelText(/date/i);
      await user.type(dateInput, "01012022");

      expect(formatDateInput).toHaveBeenCalled();

      render(<IncidentModals {...defaultProps} showEditModal={true} />);

      expect(screen.getByLabelText(/date/i)).toHaveValue("01-01-2022");
    });

    it("disables submit buttons during form submission", async () => {
      crudHandlers.handleAddNewIncident.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve({ data: [] }), 100))
      );

      const user = userEvent.setup();
      render(<IncidentModals {...defaultProps} showAddModal={true} />);

      await user.type(screen.getByLabelText(/incident name/i), "Test Incident");
      await user.type(screen.getByLabelText(/date/i), "01-01-2022");
      await user.type(
        screen.getByLabelText(/description/i),
        "This is a test description"
      );

      await user.click(screen.getByRole("button", { name: /add incident/i }));

      expect(screen.getByRole("button", { name: /adding/i })).toBeDisabled();
    });
  });
});
