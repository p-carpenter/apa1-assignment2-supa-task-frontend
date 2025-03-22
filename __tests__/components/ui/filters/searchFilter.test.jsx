import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchFilter from "@/app/components/ui/filters/SearchFilter";

describe("SearchFilter", () => {
  it("renders search input field correctly", () => {
    const handleSearch = jest.fn();
    render(<SearchFilter searchQuery="" onSearchChange={handleSearch} />);

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("calls onSearchChange when typing in the search field", () => {
    const handleSearch = jest.fn();
    render(<SearchFilter searchQuery="" onSearchChange={handleSearch} />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "test query" } });

    expect(handleSearch).toHaveBeenCalledWith("test query");
  });

  it("searches result after 100ms timeout", async () => {
    jest.useFakeTimers();
    const handleSearch = jest.fn();
    render(<SearchFilter searchQuery="" onSearchChange={handleSearch} />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "test query" } });

    jest.advanceTimersByTime(100);

    expect(handleSearch).toHaveBeenCalledWith("test query");
  }
);

});
