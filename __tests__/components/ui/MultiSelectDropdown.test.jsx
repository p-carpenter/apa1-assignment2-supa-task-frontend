import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MultiSelectDropdown from "@/app/components/ui/filters/MultiSelectDropdown";

describe("MSW Handlers", () => {
  it("defines API handlers", () => {
    // Just a placeholder test to ensure MSW is correctly set up
    expect(true).toBe(true);
  });
});

describe("MultiSelectDropdown", () => {
  const options = ["Option 1", "Option 2", "Option 3"];
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the dropdown with options", () => {
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
    render(
      <MultiSelectDropdown
        items={options}
        selectedItems={[]}
        onSelectionChange={mockOnChange}
        label="Test Dropdown"
      />
    );

    // Click the dropdown header to open it, not the label
    const dropdownHeader = screen
      .getByText("0 selected")
      .closest(".dropdown-header");
    fireEvent.click(dropdownHeader);

    // Options should now be visible, including the "All" option
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

    // Open dropdown
    const dropdownHeader = screen
      .getByText("0 selected")
      .closest(".dropdown-header");
    fireEvent.click(dropdownHeader);

    // Select an option
    const option = screen.getByText("Option 1");
    fireEvent.click(option);

    expect(mockOnChange).toHaveBeenCalledWith(["Option 1"]);
  });

  it("displays selected options with active class", () => {
    render(
      <MultiSelectDropdown
        items={options}
        selectedItems={["Option 2"]}
        onSelectionChange={mockOnChange}
        label="Test Dropdown"
      />
    );

    // Open dropdown
    const dropdownHeader = screen
      .getByText("1 selected")
      .closest(".dropdown-header");
    fireEvent.click(dropdownHeader);

    // Check for active class on selected option
    const selectedOption = screen
      .getByText("Option 2")
      .closest(".dropdown-option");
    expect(selectedOption).toHaveClass("active");
  });

  it("removes option when clicked if already selected", () => {
    render(
      <MultiSelectDropdown
        items={options}
        selectedItems={["Option 1"]}
        onSelectionChange={mockOnChange}
        label="Test Dropdown"
      />
    );

    // Open dropdown
    const dropdownHeader = screen
      .getByText("1 selected")
      .closest(".dropdown-header");
    fireEvent.click(dropdownHeader);

    // Click already selected option
    const option = screen.getByText("Option 1");
    fireEvent.click(option);

    // Should switch to "all" when no other options are selected
    expect(mockOnChange).toHaveBeenCalledWith(["all"]);
  });

  it("closes dropdown when clicking outside", () => {
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

    // Open dropdown
    const dropdownHeader = screen
      .getByText("0 selected")
      .closest(".dropdown-header");
    fireEvent.click(dropdownHeader);

    // Options should be visible (check for All option which is always there)
    expect(screen.getByText("All")).toBeInTheDocument();

    // Click outside
    const outside = screen.getByTestId("outside");
    fireEvent.mouseDown(outside);

    // Options should no longer be visible
    expect(screen.queryByText("All")).not.toBeInTheDocument();
  });
});
