import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddIncidentForm } from "@/app/components/forms";
import { IncidentProvider, useIncidents } from "@/app/contexts/IncidentContext";
import * as crudHandlers from "@/app/catalog/crudHandlers";

jest.mock("@/app/catalog/crudHandlers", () => ({
  handleAddNewIncident: jest.fn(),
}));

jest.mock("@/app/contexts/IncidentContext", () => {
  const original = jest.requireActual("@/app/contexts/IncidentContext");
  return {
    ...original,
    useIncidents: jest.fn(),
  };
});

global.FileReader = class {
  constructor() {
    this.result = "data:image/png;base64,mockbase64data";
  }
  readAsDataURL() {
    this.onload({ target: { result: this.result } });
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

  beforeEach(() => {
    jest.clearAllMocks();

    useIncidents.mockReturnValue({
      incidents: [],
      setIncidents: mockSetIncidents,
    });

    crudHandlers.handleAddNewIncident.mockResolvedValue([
      { id: "new-id", name: "Test Incident" },
    ]);
  });

  it("renders all form fields correctly", () => {
    render(<AddIncidentForm onClose={mockOnClose} />);

    expect(screen.getByLabelText(/incident name \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Severity ?" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/impact/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cause/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time to resolve/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/artifact type/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add incident/i })
    ).toBeInTheDocument();
  });

  it("validates required fields and displays errors", async () => {
    const user = userEvent.setup();

    render(<AddIncidentForm onClose={mockOnClose} />);

    await user.click(screen.getByRole("button", { name: /add incident/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/incident name is required/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });
  });

  it("validates input fields in real-time", async () => {
    const user = userEvent.setup();

    render(<AddIncidentForm onClose={mockOnClose} />);

    await user.type(screen.getByLabelText(/incident name \*/i), "ab");

    await waitFor(() => {
      expect(
        screen.getByText(/incident name must be at least 3 characters/i)
      ).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/description \*/i), "Short");

    await waitFor(() => {
      expect(
        screen.getByText(/description must be at least 10 characters/i)
      ).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText(/incident name \*/i));
    await user.type(screen.getByLabelText(/incident name \*/i), "Valid Name");

    await user.clear(screen.getByLabelText(/description \*/i));
    await user.type(
      screen.getByLabelText(/description \*/i),
      "This is a valid description"
    );

    await waitFor(() => {
      expect(
        screen.queryByText(/incident name must be at least 3 characters/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/description must be at least 10 characters/i)
      ).not.toBeInTheDocument();
    });
  });

  it("validates date format and range", async () => {
    const user = userEvent.setup();

    render(<AddIncidentForm onClose={mockOnClose} />);

    await user.type(screen.getByLabelText(/date \*/i), "2022/01/01");

    await waitFor(() => {
      expect(
        // outputted as 20-22-0101 in the input field
        screen.getByText(/this date doesn't exist in the calendar/i)
      ).toBeInTheDocument();
    });

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
        screen.queryByText(/please enter a valid date in dd-mm-yyyy format/i)
      ).not.toBeInTheDocument();
    });
  });

  it("validates artifact content when artifact type is code", async () => {
    const user = userEvent.setup();

    render(<AddIncidentForm onClose={mockOnClose} />);

    await user.type(
      screen.getByLabelText(/incident name \*/i),
      "Test Incident"
    );
    await user.type(screen.getByLabelText(/date \*/i), "01-01-2022");
    await user.type(
      screen.getByLabelText(/description \*/i),
      "This is a valid description"
    );

    await user.selectOptions(screen.getByLabelText(/artifact type/i), "code");

    await user.click(screen.getByRole("button", { name: /add incident/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /html code is required when artifact type is set to code/i
        )
      ).toBeInTheDocument();
    });

    await user.type(
      screen.getByLabelText(/html code/i),
      "<div>Sample HTML</div>"
    );

    await waitFor(() => {
      expect(
        screen.queryByText(
          /html code is required when artifact type is set to code/i
        )
      ).not.toBeInTheDocument();
    });
  });

  it("validates file upload when artifact type is image", async () => {
    const user = userEvent.setup();

    render(<AddIncidentForm onClose={mockOnClose} />);

    await user.type(
      screen.getByLabelText(/incident name \*/i),
      "Test Incident"
    );
    await user.type(screen.getByLabelText(/date \*/i), "01-01-2022");
    await user.type(
      screen.getByLabelText(/description \*/i),
      "This is a valid description"
    );

    await user.selectOptions(screen.getByLabelText(/artifact type/i), "image");

    await user.click(screen.getByRole("button", { name: /add incident/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /an image file is required when artifact type is set to image/i
        )
      ).toBeInTheDocument();
    });

    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    const fileInput = screen.getByLabelText(/upload image/i);

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(
        screen.queryByText(
          /an image file is required when artifact type is set to image/i
        )
      ).not.toBeInTheDocument();
    });
  });

  it("handles form submission with correct values", async () => {
    const user = userEvent.setup();

    render(<AddIncidentForm onClose={mockOnClose} />);

    await user.type(
      screen.getByLabelText(/incident name \*/i),
      "Test Incident"
    );
    await user.type(screen.getByLabelText(/date \*/i), "01-01-2022");
    await user.type(
      screen.getByLabelText(/description \*/i),
      "Test description that is long enough"
    );
    await user.type(screen.getByLabelText(/cause/i), "Test cause");
    await user.type(screen.getByLabelText(/impact/i), "Test impact");
    await user.type(screen.getByLabelText(/time to resolve/i), "2 days");

    await user.click(screen.getByRole("button", { name: /add incident/i }));

    await waitFor(() => {
      expect(crudHandlers.handleAddNewIncident).toHaveBeenCalledWith({
        addition: expect.objectContaining({
          name: "Test Incident",
          incident_date: "2022-01-01",
          description: "Test description that is long enough",
          category: "Software",
          cause: "Test cause",
          consequences: "Test impact",
          severity: "Moderate",
          time_to_resolve: "2 days",
          artifactType: "none",
          artifactContent: "",
        }),
      });
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockSetIncidents).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("displays error message when submission fails", async () => {
    crudHandlers.handleAddNewIncident.mockRejectedValue(
      new Error("Server error")
    );
    const user = userEvent.setup();

    render(<AddIncidentForm onClose={mockOnClose} />);

    await user.type(
      screen.getByLabelText(/incident name \*/i),
      "Test Incident"
    );
    await user.type(screen.getByLabelText(/date \*/i), "01-01-2022");
    await user.type(
      screen.getByLabelText(/description \*/i),
      "Test description that is long enough"
    );

    await user.click(screen.getByRole("button", { name: /add incident/i }));

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });

  it("displays artifact-specific error when file upload fails", async () => {
    crudHandlers.handleAddNewIncident.mockRejectedValue(
      new Error("Failed to upload image file")
    );
    const user = userEvent.setup();

    render(<AddIncidentForm onClose={mockOnClose} />);

    await user.type(
      screen.getByLabelText(/incident name \*/i),
      "Test Incident"
    );
    await user.type(screen.getByLabelText(/date \*/i), "01-01-2022");
    await user.type(
      screen.getByLabelText(/description \*/i),
      "Test description that is long enough"
    );

    await user.selectOptions(screen.getByLabelText(/artifact type/i), "image");

    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    const fileInput = screen.getByLabelText(/upload image/i);
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: /add incident/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/artifact error: failed to upload image file/i)
      ).toBeInTheDocument();
    });
  });

  it("disables submit button during submission", async () => {
    crudHandlers.handleAddNewIncident.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
    );

    const user = userEvent.setup();

    render(<AddIncidentForm onClose={mockOnClose} />);

    await user.type(
      screen.getByLabelText(/incident name \*/i),
      "Test Incident"
    );
    await user.type(screen.getByLabelText(/date \*/i), "01-01-2022");
    await user.type(
      screen.getByLabelText(/description \*/i),
      "Test description that is long enough"
    );

    await user.click(screen.getByRole("button", { name: /add incident/i }));

    expect(screen.getByRole("button", { name: /adding/i })).toBeDisabled();
  });

  it("clears field errors when switching artifact types", async () => {
    const user = userEvent.setup();

    render(<AddIncidentForm onClose={mockOnClose} />);

    await user.selectOptions(screen.getByLabelText(/artifact type/i), "code");

    await user.click(screen.getByRole("button", { name: /add incident/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /html code is required when artifact type is set to code/i
        )
      ).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText(/artifact type/i), "none");

    await waitFor(() => {
      expect(
        screen.queryByText(
          /html code is required when artifact type is set to code/i
        )
      ).not.toBeInTheDocument();
    });
  });
});
