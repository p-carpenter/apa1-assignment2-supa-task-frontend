import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchFilter from "@/app/components/ui/filters/SearchFilter";

describe("SearchFilter", () => {
  it("renders search input field correctly", () => {
    const handleSearch = jest.fn();
    render(<SearchFilter searchQuery="" setSearchQuery={handleSearch} />);

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("calls setSearchQuery when typing in the search field", () => {
    const handleSearch = jest.fn();
    render(<SearchFilter searchQuery="" setSearchQuery={handleSearch} />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "test query" } });

    expect(handleSearch).toHaveBeenCalledWith("test query");
  });

  it("displays the clear button when search query is not empty", () => {
    const handleSearch = jest.fn();
    render(<SearchFilter searchQuery="test" setSearchQuery={handleSearch} />);

    const clearButton = screen.getByLabelText(/clear search/i);
    expect(clearButton).toBeInTheDocument();
  });

  it("clears search query when clicking the clear button", () => {
    const handleSearch = jest.fn();
    render(<SearchFilter searchQuery="test" setSearchQuery={handleSearch} />);

    const clearButton = screen.getByLabelText(/clear search/i);
    fireEvent.click(clearButton);

    expect(handleSearch).toHaveBeenCalledWith("");
  });
});
