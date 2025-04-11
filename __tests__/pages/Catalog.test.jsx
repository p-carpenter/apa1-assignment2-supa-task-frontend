import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Catalog from "../../app/catalog/page";
import { useIncidents } from "../../app/contexts/IncidentContext";
import { useAuth } from "../../app/contexts/AuthContext";
import { handleDeleteIncidents } from "../../app/catalog/crudHandlers";

jest.mock("../../app/contexts/IncidentContext");
jest.mock("../../app/contexts/AuthContext");
jest.mock("../../app/catalog/crudHandlers");
jest.mock("../../app/components/ui/console", () => ({
  ConsoleWindow: ({ children, statusItems }) => (
    <div data-testid="console-window">
      <div data-testid="status-items">
        {statusItems.map((item, index) => (
          <div key={index} data-testid={`status-item-${index}`}>
            {typeof item === "string" ? item : item.text}
          </div>
        ))}
      </div>
      {children}
    </div>
  ),
  ConsoleSection: ({ children, command }) => (
    <div data-testid="console-section" data-command={command}>
      {children}
    </div>
  ),
  CommandOutput: ({ children, title, subtitle }) => (
    <div
      data-testid="command-output"
      data-title={title}
      data-subtitle={subtitle}
    >
      {children}
    </div>
  ),
}));

jest.mock("../../app/components/ui/filters", () => ({
  CatalogFilters: ({
    searchQuery,
    onSearchChange,
    selectedYears,
    yearsAvailable,
    onYearChange,
    selectedCategories,
    categories,
    onCategoryChange,
    sortOrder,
    onSortChange,
  }) => (
    <div data-testid="catalog-filters">
      <input
        data-testid="search-input"
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <select
        data-testid="year-filter"
        value={selectedYears[0]}
        onChange={(e) => onYearChange([e.target.value])}
      >
        <option value="all">All Years</option>
        {yearsAvailable.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
      <select
        data-testid="category-filter"
        value={selectedCategories[0]}
        onChange={(e) => onCategoryChange([e.target.value])}
      >
        <option value="all">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <select
        data-testid="sort-order"
        value={sortOrder}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="year-desc">Newest First</option>
        <option value="year-asc">Oldest First</option>
        <option value="name-asc">Name (A-Z)</option>
        <option value="name-desc">Name (Z-A)</option>
      </select>
    </div>
  ),
}));

jest.mock("../../app/components/ui/catalog/IncidentGrid", () => {
  return function MockedIncidentGrid({
    incidents,
    isLoading,
    onIncidentSelect,
    selectionMode,
    selectedIncidents,
  }) {
    return (
      <div data-testid="incident-grid">
        {isLoading ? (
          <div data-testid="loading-state">Loading...</div>
        ) : incidents.length === 0 ? (
          <div data-testid="empty-state">No incidents found.</div>
        ) : (
          <ul data-testid="incidents-list">
            {incidents.map((incident) => (
              <li
                key={incident.id}
                data-testid={`incident-${incident.id}`}
                data-selected={selectedIncidents.some(
                  (inc) => inc.id === incident.id
                )}
                onClick={(e) => onIncidentSelect(incident, e)}
              >
                {incident.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
});

jest.mock("../../app/components/ui/catalog/AdminControls", () => {
  return function MockedAdminControls({
    selectionMode,
    toggleSelectionMode,
    handleAddNew,
    handleDelete,
    handleEdit,
    selectedIncidents,
  }) {
    return (
      <div data-testid="admin-controls">
        {!selectionMode ? (
          <>
            <button data-testid="add-incident-button" onClick={handleAddNew}>
              Add New
            </button>
            <button
              data-testid="select-mode-button"
              onClick={toggleSelectionMode}
            >
              Select
            </button>
          </>
        ) : (
          <>
            <button
              data-testid="cancel-selection-button"
              onClick={toggleSelectionMode}
            >
              Cancel
            </button>
            <button
              data-testid="delete-button"
              onClick={handleDelete}
              disabled={selectedIncidents.length === 0}
            >
              Delete ({selectedIncidents.length})
            </button>
            <button
              data-testid="edit-button"
              onClick={handleEdit}
              disabled={selectedIncidents.length === 0}
            >
              Edit ({selectedIncidents.length})
            </button>
          </>
        )}
      </div>
    );
  };
});

jest.mock("../../app/components/ui/catalog/IncidentModals", () => {
  return function MockedIncidentModals({
    showAddModal,
    closeAddModal,
    showEditModal,
    closeEditModal,
  }) {
    return (
      <div data-testid="incident-modals">
        {showAddModal && (
          <div data-testid="add-modal">
            <button onClick={closeAddModal}>Close</button>
          </div>
        )}
        {showEditModal && (
          <div data-testid="edit-modal">
            <button onClick={closeEditModal}>Close</button>
          </div>
        )}
      </div>
    );
  };
});

const originalConfirm = window.confirm;
const mockConfirm = jest.fn();

const mockIncidents = [
  {
    id: "1",
    name: "Database Failure",
    category: "Database",
    severity: "High",
    incident_date: "2022-01-15T00:00:00.000Z",
    description: "Description 1",
  },
  {
    id: "2",
    name: "Network Outage",
    category: "Network",
    severity: "Critical",
    incident_date: "2023-05-20T00:00:00.000Z",
    description: "Description 2",
  },
  {
    id: "3",
    name: "Software Bug",
    category: "Software",
    severity: "Moderate",
    incident_date: "2021-11-10T00:00:00.000Z",
    description: "Description 3",
  },
  {
    id: "4",
    name: "Security Breach",
    category: "Security",
    severity: "Critical",
    incident_date: "2022-08-30T00:00:00.000Z",
    description: "Description 4",
  },
];

describe("Catalog Page", () => {
  beforeEach(() => {
    window.confirm = mockConfirm;

    useIncidents.mockReturnValue({
      incidents: mockIncidents,
      setIncidents: jest.fn(),
      setDisplayedIncident: jest.fn(),
      setCurrentIncidentIndex: jest.fn(),
      isLoading: false,
    });

    useAuth.mockReturnValue({
      isAuthenticated: true,
    });

    handleDeleteIncidents.mockResolvedValue({
      data: mockIncidents.slice(0, 3),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    window.confirm = originalConfirm;
  });

  it("renders the catalog with incidents", () => {
    render(<Catalog />);

    // Verify console window and status items render correctly
    expect(screen.getByTestId("console-window")).toBeInTheDocument();
    expect(screen.getByTestId("status-item-0")).toHaveTextContent(
      "TECH INCIDENTS DATABASE"
    );
    expect(screen.getByTestId("status-item-1")).toHaveTextContent(
      "CATALOG VIEW"
    );
    expect(screen.getByTestId("status-item-2")).toHaveTextContent(
      "4 RECORDS RETRIEVED"
    );

    const incidentItems = screen.getAllByTestId(/^incident-\d+$/);
    expect(incidentItems).toHaveLength(mockIncidents.length);
  });

  it("shows loading state when incidents are loading", () => {
    // Mock loading state
    useIncidents.mockReturnValue({
      incidents: [],
      setIncidents: jest.fn(),
      setDisplayedIncident: jest.fn(),
      setCurrentIncidentIndex: jest.fn(),
      isLoading: true,
    });

    render(<Catalog />);

    expect(screen.getByTestId("loading-state")).toBeInTheDocument();
  });

  it("shows empty state when no incidents match filters", async () => {
    useIncidents.mockReturnValue({
      incidents: [],
      setIncidents: jest.fn(),
      setDisplayedIncident: jest.fn(),
      setCurrentIncidentIndex: jest.fn(),
      isLoading: false,
    });

    render(<Catalog />);

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("filters incidents based on search query", async () => {
    render(<Catalog />);

    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "Network" } });

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Only the Network incident should be shown
    const incidentsList = screen.getByTestId("incidents-list");
    expect(within(incidentsList).getAllByTestId(/incident-/)).toHaveLength(1);
    expect(within(incidentsList).getByTestId("incident-2")).toBeInTheDocument();
  });

  it("filters incidents based on year selection", () => {
    render(<Catalog />);

    const yearFilter = screen.getByTestId("year-filter");
    fireEvent.change(yearFilter, { target: { value: "2022" } });

    // Only 2022 incidents should be shown (2 incidents)
    const incidentsList = screen.getByTestId("incidents-list");
    expect(within(incidentsList).getAllByTestId(/incident-/)).toHaveLength(2);
  });

  it("filters incidents based on category selection", () => {
    render(<Catalog />);

    const categoryFilter = screen.getByTestId("category-filter");
    fireEvent.change(categoryFilter, { target: { value: "Database" } });

    // Only Database incidents should be shown (1 incident)
    const incidentsList = screen.getByTestId("incidents-list");
    expect(within(incidentsList).getAllByTestId(/incident-/)).toHaveLength(1);
    expect(within(incidentsList).getByTestId("incident-1")).toBeInTheDocument();
  });

  test("sorts incidents based on sort order selection", () => {
    render(<Catalog />);

    const sortOrder = screen.getByTestId("sort-order");

    fireEvent.change(sortOrder, { target: { value: "name-asc" } });

    const incidents = screen.getAllByTestId(/^incident-\d+$/);

    // Verify order: Database, Network, Security, Software
    expect(incidents[0]).toHaveTextContent("Database Failure");
    expect(incidents[1]).toHaveTextContent("Network Outage");
    expect(incidents[2]).toHaveTextContent("Security Breach");
    expect(incidents[3]).toHaveTextContent("Software Bug");
  });

  it("toggles selection mode and selects incidents", async () => {
    render(<Catalog />);

    // Enter selection mode
    const selectButton = screen.getByTestId("select-mode-button");
    fireEvent.click(selectButton);

    // Selection mode controls should be visible
    expect(screen.getByTestId("cancel-selection-button")).toBeInTheDocument();
    expect(screen.getByTestId("delete-button")).toBeInTheDocument();
    expect(screen.getByTestId("edit-button")).toBeInTheDocument();

    // Edit and delete buttons should be disabled initially
    expect(screen.getByTestId("delete-button")).toBeDisabled();
    expect(screen.getByTestId("edit-button")).toBeDisabled();

    // Select an incident
    const incident = screen.getByTestId("incident-1");
    fireEvent.click(incident);

    // Buttons should be enabled after selection
    expect(screen.getByTestId("delete-button")).not.toBeDisabled();
    expect(screen.getByTestId("edit-button")).not.toBeDisabled();

    // Delete button should show count
    expect(screen.getByTestId("delete-button")).toHaveTextContent("Delete (1)");
  });

  it("opens add modal when Add New button is clicked", () => {
    render(<Catalog />);

    const addButton = screen.getByTestId("add-incident-button");
    fireEvent.click(addButton);

    expect(screen.getByTestId("add-modal")).toBeInTheDocument();
  });

  it("opens edit modal when Edit button is clicked with selected incidents", () => {
    render(<Catalog />);

    // Enter selection mode
    const selectButton = screen.getByTestId("select-mode-button");
    fireEvent.click(selectButton);

    // Select an incident
    const incident = screen.getByTestId("incident-1");
    fireEvent.click(incident);

    // Click edit button
    const editButton = screen.getByTestId("edit-button");
    fireEvent.click(editButton);

    expect(screen.getByTestId("edit-modal")).toBeInTheDocument();
  });

  it("deletes selected incidents after confirmation", async () => {
    mockConfirm.mockReturnValue(true);

    const setIncidentsMock = jest.fn();
    useIncidents.mockReturnValue({
      incidents: mockIncidents,
      setIncidents: setIncidentsMock,
      setDisplayedIncident: jest.fn(),
      setCurrentIncidentIndex: jest.fn(),
      isLoading: false,
    });

    render(<Catalog />);

    // Enter selection mode
    const selectButton = screen.getByTestId("select-mode-button");
    fireEvent.click(selectButton);

    // Select an incident
    const incident = screen.getByTestId("incident-1");
    fireEvent.click(incident);

    // Click delete button
    const deleteButton = screen.getByTestId("delete-button");
    fireEvent.click(deleteButton);

    // Verify confirmation was shown
    expect(mockConfirm).toHaveBeenCalledWith(
      "Are you sure you want to delete 1 incident(s)?"
    );

    // Wait for delete to complete
    await waitFor(() => {
      expect(handleDeleteIncidents).toHaveBeenCalled();
      expect(setIncidentsMock).toHaveBeenCalledWith(expect.any(Array));
    });
  });

  it("does not delete incidents when confirmation is canceled", async () => {
    mockConfirm.mockReturnValue(false);

    const setIncidentsMock = jest.fn();
    useIncidents.mockReturnValue({
      incidents: mockIncidents,
      setIncidents: setIncidentsMock,
      setDisplayedIncident: jest.fn(),
      setCurrentIncidentIndex: jest.fn(),
      isLoading: false,
    });

    render(<Catalog />);

    // Enter selection mode
    const selectButton = screen.getByTestId("select-mode-button");
    fireEvent.click(selectButton);

    // Select an incident
    const incident = screen.getByTestId("incident-1");
    fireEvent.click(incident);

    // Click delete button
    const deleteButton = screen.getByTestId("delete-button");
    fireEvent.click(deleteButton);

    // Verify confirmation was shown
    expect(mockConfirm).toHaveBeenCalled();

    // Delete function should not be called
    expect(handleDeleteIncidents).not.toHaveBeenCalled();
    expect(setIncidentsMock).not.toHaveBeenCalled();
  });

  it("handles incident selection for display", () => {
    const setDisplayedIncidentMock = jest.fn();
    const setCurrentIncidentIndexMock = jest.fn();

    useIncidents.mockReturnValue({
      incidents: mockIncidents,
      setIncidents: jest.fn(),
      setDisplayedIncident: setDisplayedIncidentMock,
      setCurrentIncidentIndex: setCurrentIncidentIndexMock,
      isLoading: false,
    });

    render(<Catalog />);

    // Click on an incident in normal mode (not selection mode)
    const incident = screen.getByTestId("incident-2");
    fireEvent.click(incident);

    // Should set displayed incident and index
    expect(setDisplayedIncidentMock).toHaveBeenCalledWith(mockIncidents[1]);
    expect(setCurrentIncidentIndexMock).toHaveBeenCalledWith(1);
  });

  it("handles error during delete operation", async () => {
    // Mock window.alert
    const mockAlert = jest.fn();
    window.alert = mockAlert;

    // Mock a failed delete operation
    handleDeleteIncidents.mockRejectedValue(new Error("Delete failed"));

    mockConfirm.mockReturnValue(true);

    render(<Catalog />);

    // Enter selection mode
    const selectButton = screen.getByTestId("select-mode-button");
    fireEvent.click(selectButton);

    // Select an incident
    const incident = screen.getByTestId("incident-1");
    fireEvent.click(incident);

    // Click delete button
    const deleteButton = screen.getByTestId("delete-button");
    fireEvent.click(deleteButton);

    // Wait for delete to fail
    await waitFor(() => {
      expect(handleDeleteIncidents).toHaveBeenCalled();
      expect(mockAlert).toHaveBeenCalledWith("Error: Delete failed");
    });

    // Clean up
    window.alert = jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("handles delete with invalid response data", async () => {
    // Mock window.alert
    const mockAlert = jest.fn();
    window.alert = mockAlert;

    // Mock a delete operation with invalid response
    handleDeleteIncidents.mockResolvedValue({ status: "success" }); // Missing data array

    mockConfirm.mockReturnValue(true);

    const setIncidentsMock = jest.fn();
    useIncidents.mockReturnValue({
      incidents: mockIncidents,
      setIncidents: setIncidentsMock,
      setDisplayedIncident: jest.fn(),
      setCurrentIncidentIndex: jest.fn(),
      isLoading: false,
    });

    render(<Catalog />);

    // Enter selection mode
    const selectButton = screen.getByTestId("select-mode-button");
    fireEvent.click(selectButton);

    // Select an incident
    const incident = screen.getByTestId("incident-1");
    fireEvent.click(incident);

    // Click delete button
    const deleteButton = screen.getByTestId("delete-button");
    fireEvent.click(deleteButton);

    // Wait for delete to complete with invalid response
    await waitFor(() => {
      expect(handleDeleteIncidents).toHaveBeenCalled();
      expect(mockAlert).toHaveBeenCalledWith(
        "An error occurred while deleting incidents"
      );
      expect(setIncidentsMock).not.toHaveBeenCalled();
    });

    // Clean up
    window.alert = jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("delete button is disabled with no selection", () => {
    render(<Catalog />);

    const selectButton = screen.getByTestId("select-mode-button");
    fireEvent.click(selectButton);

    // click Edit button without selecting any incidents
    const deleteButton = screen.getByTestId("delete-button");
    fireEvent.click(deleteButton);

    expect(deleteButton).toBeDisabled();
  });

  it("edit button is disabled with no selection", () => {
    render(<Catalog />);

    const selectButton = screen.getByTestId("select-mode-button");
    fireEvent.click(selectButton);

    // click Edit button without selecting any incidents
    const editButton = screen.getByTestId("edit-button");
    fireEvent.click(editButton);

    expect(editButton).toBeDisabled();
  });

  it("admin controls are not shown when user is not authenticated", () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
    });

    render(<Catalog />);

    expect(screen.queryByTestId("admin-controls")).not.toBeInTheDocument();
  });

  it("closes modals when close functions are called", () => {
    render(<Catalog />);

    const addButton = screen.getByTestId("add-incident-button");
    fireEvent.click(addButton);

    expect(screen.getByTestId("add-modal")).toBeInTheDocument();

    const closeButton = within(screen.getByTestId("add-modal")).getByText(
      "Close"
    );
    fireEvent.click(closeButton);

    expect(screen.queryByTestId("add-modal")).not.toBeInTheDocument();
  });

  it("cancels selection mode", () => {
    render(<Catalog />);

    const selectButton = screen.getByTestId("select-mode-button");
    fireEvent.click(selectButton);

    expect(screen.getByTestId("cancel-selection-button")).toBeInTheDocument();

    const cancelButton = screen.getByTestId("cancel-selection-button");
    fireEvent.click(cancelButton);

    // Regular controls should be visible again
    expect(screen.getByTestId("add-incident-button")).toBeInTheDocument();
    expect(screen.getByTestId("select-mode-button")).toBeInTheDocument();
  });
});
