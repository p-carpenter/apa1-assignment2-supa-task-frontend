import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SortControls from "@/app/components/ui/filters/SortControls";

describe("SortControls", () => {
  const mockOnSortChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders sort options correctly", () => {
    render(
      <SortControls sortOrder="year-desc" onSortChange={mockOnSortChange} />
    );

    expect(screen.getByText("SORT")).toBeInTheDocument();

    // Get the select element
    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toBeInTheDocument();

    // Check options exist
    expect(screen.getByText("Newest")).toBeInTheDocument();
    expect(screen.getByText("Oldest")).toBeInTheDocument();
    expect(screen.getByText("A-Z")).toBeInTheDocument();
    expect(screen.getByText("Z-A")).toBeInTheDocument();
    expect(screen.getByText("Severity ↓")).toBeInTheDocument();
    expect(screen.getByText("Severity ↑")).toBeInTheDocument();
  });

  it("calls onSortChange when selecting a different sort option", () => {
    render(
      <SortControls sortOrder="year-desc" onSortChange={mockOnSortChange} />
    );

    // Select element
    const selectElement = screen.getByRole("combobox");

    // Change the selection
    fireEvent.change(selectElement, { target: { value: "year-asc" } });

    expect(mockOnSortChange).toHaveBeenCalledWith("year-asc");
  });

  it("highlights the currently selected sort option", () => {
    render(
      <SortControls sortOrder="year-desc" onSortChange={mockOnSortChange} />
    );

    // Get the select element
    const selectElement = screen.getByRole("combobox");

    // Check that the correct option is selected
    expect(selectElement.value).toBe("year-desc");
  });
});
