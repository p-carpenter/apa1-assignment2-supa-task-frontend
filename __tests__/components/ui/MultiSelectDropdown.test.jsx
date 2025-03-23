import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MultiSelectDropdown from "@/app/components/ui/filters/MultiSelectDropdown";
import styles from "@/app/components/ui/filters/Filters.module.css";

/**
 * Test suite for the MultiSelectDropdown component
 * 
 * Tests focus on the critical state management and interaction behaviors,
 * especially related to the "All" selection logic that is central to
 * maintaining consistent filter states.
 */
describe("MultiSelectDropdown", () => {
  const options = ["Option 1", "Option 2", "Option 3"];
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the dropdown with options", () => {
    // Test initial render state without expanding dropdown
    render(
      <MultiSelectDropdown
        items={options}
        selectedItems={[]}
        onSelectionChange={mockOnChange}
        label="Test Dropdown"
      />
    );

    expect(screen.getByText("Test Dropdown")).toBeInTheDocument();
    expect(screen.getByText("0 selected")).toBeInTheDocument();
  });

  it("opens the dropdown when clicked", () => {
    // Verify dropdown visibility state changes after interaction
    render(
      <MultiSelectDropdown
        items={options}
        selectedItems={[]}
        onSelectionChange={mockOnChange}
        label="Test Dropdown"
      />
    );

    const dropdownHeader = screen.getByTestId("dropdown-header");
    fireEvent.click(dropdownHeader);

    expect(screen.getByText("All")).toBeInTheDocument();
    options.forEach((option) => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it("calls onSelectionChange when an option is selected", () => {
    render(
      <MultiSelectDropdown
        items={options}
        selectedItems={[]}
        onSelectionChange={mockOnChange}
        label="Test Dropdown"
      />
    );

    const dropdownHeader = screen.getByTestId("dropdown-header");
    fireEvent.click(dropdownHeader);

    const option = screen.getByText("Option 1");
    fireEvent.click(option);

    expect(mockOnChange).toHaveBeenCalledWith(["Option 1"]);
  });
  
  it("selects 'All' when all items are deselected", () => {
    // Tests that removing the last selected item defaults to "All"
    render(
      <MultiSelectDropdown
        items={options}
        selectedItems={["Option 1"]}
        onSelectionChange={mockOnChange}
        label="Test Dropdown"
      />
    );

    const dropdownHeader = screen.getByTestId("dropdown-header");
    fireEvent.click(dropdownHeader);

    const option = screen.getByText("Option 1");
    fireEvent.click(option);

    expect(mockOnChange).toHaveBeenCalledWith(["all"]);
  });
  
  it("removes 'All' when selecting specific items", () => {
    // Tests transition from "All" selection to specific filters
    render(
      <MultiSelectDropdown
        items={options}
        selectedItems={["all"]}
        onSelectionChange={mockOnChange}
        label="Test Dropdown"
      />
    );

    const dropdownHeader = screen.getByTestId("dropdown-header");
    fireEvent.click(dropdownHeader);

    const option = screen.getByText("Option 2");
    fireEvent.click(option);

    expect(mockOnChange).toHaveBeenCalledWith(["Option 2"]);
  });

  it("displays selected options with active class", () => {
    // Verifies visual distinction of selected items for user feedback
    render(
      <MultiSelectDropdown
        items={options}
        selectedItems={["Option 2"]}
        onSelectionChange={mockOnChange}
        label="Test Dropdown"
      />
    );

    const dropdownHeader = screen.getByTestId("dropdown-header");
    fireEvent.click(dropdownHeader);

    const selectedOption = screen.getByText("Option 2");
    expect(selectedOption).toHaveClass(styles.selected);
  });

  it("removes option when clicked if already selected", () => {
    // Tests toggle behavior - selected items should be removed when clicked again
    render(
      <MultiSelectDropdown
        items={options}
        selectedItems={["Option 1"]}
        onSelectionChange={mockOnChange}
        label="Test Dropdown"
      />
    );

    const dropdownHeader = screen.getByTestId("dropdown-header");
    fireEvent.click(dropdownHeader);

    const option = screen.getByText("Option 1");
    fireEvent.click(option);

    expect(mockOnChange).toHaveBeenCalledWith(["all"]);
  });

  it("closes dropdown when clicking outside", () => {
    // Ensures proper cleanup of UI state when user clicks elsewhere on the page
    render(
      <div>
        <MultiSelectDropdown
          items={options}
          selectedItems={[]}
          onSelectionChange={mockOnChange}
          label="Test Dropdown"
        />
        <div data-testid="outside">Outside Element</div>
      </div>
    );

    const dropdownHeader = screen.getByTestId("dropdown-header");
    fireEvent.click(dropdownHeader);

    expect(screen.getByText("All")).toBeInTheDocument();

    const outside = screen.getByTestId("outside");
    fireEvent.mouseDown(outside);

    expect(screen.queryByText("All")).not.toBeInTheDocument();
  });
});
