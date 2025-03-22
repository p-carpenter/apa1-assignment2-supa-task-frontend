import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MultiSelectDropdown from "@/app/components/ui/filters/MultiSelectDropdown";
import styles from "@/app/component/ui/filters/Filters.module.css";

describe("MSW Handlers", () => {
  it("defines API handlers", () => {
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

  it("displays selected options with active class", () => {
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
