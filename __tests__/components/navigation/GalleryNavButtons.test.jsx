import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import GalleryNavButtons from "@/app/components/ui/gallery-navigation/GalleryNavButtons";

// Mock next/link
jest.mock("next/link", () => {
  return ({ href, children, className }) => {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

describe("GalleryNavButtons", () => {
  const mockProps = {
    onPreviousClick: jest.fn(),
    onNextClick: jest.fn(),
    incidentYears: [1989, 1995, 2001, 2010, 2018, 2022],
    currentIncidentYear: 2001,
    onYearClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders navigation buttons and timeline", () => {
    render(<GalleryNavButtons {...mockProps} />);

    // Check for prev/next buttons
    const prevButton = screen.getByRole("button", {
      label: "Previous artifact",
    });
    const nextButton = screen.getByRole("button", {
      label: "Next artifact",
    });
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();

    // Check for year buttons in timeline
    const yearButtons = screen.getAllByRole("button", { name: /\d{4}/ });
    expect(yearButtons).toHaveLength(mockProps.incidentYears.length);

    // Check for catalog button
    const catalogButton = screen.getByRole("a", { name: "Catalog" });
    expect(catalogButton).toBeInTheDocument();
    expect(catalogButton).toHaveAttribute("href", "/catalog");
  });

  it("highlights current year in the timeline", () => {
    render(<GalleryNavButtons {...mockProps} />);

    // Find all year buttons
    const yearButtons = screen.getAllByRole("button", { name: /\d{4}/ });

    // Find the button with the current year
    const currentYearButton = screen.getByRole("button", { name: "2001" });

    // Check if it has the active class
    expect(currentYearButton).toHaveClass("year-button--active");

    // Other year buttons should not have the active class
    const otherYearButtons = yearButtons.filter(
      (button) => button.textContent !== "2001"
    );
    otherYearButtons.forEach((button) => {
      expect(button).not.toHaveClass("year-button--active");
    });
  });

  it("calls onPreviousClick when previous button is clicked", () => {
    render(<GalleryNavButtons {...mockProps} />);

    const prevButton = screen.getByRole("button", {
      label: "Previous artifact",
    });
    fireEvent.click(prevButton);

    expect(mockProps.onPreviousClick).toHaveBeenCalledTimes(1);
  });

  it("calls onNextClick when next button is clicked", () => {
    render(<GalleryNavButtons {...mockProps} />);

    const nextButton = screen.getByRole("button", { label: "Next artifact" });
    fireEvent.click(nextButton);

    expect(mockProps.onNextClick).toHaveBeenCalledTimes(1);
  });

  it("calls onYearClick with correct year when a year button is clicked", () => {
    render(<GalleryNavButtons {...mockProps} />);

    // Click a different year than the current one
    const yearButton = screen.getByRole("button", { name: "2010" });
    fireEvent.click(yearButton);

    expect(mockProps.onYearClick).toHaveBeenCalledWith(2010);
  });

  it("doesn't call onYearClick when clicking the current year", () => {
    render(<GalleryNavButtons {...mockProps} />);

    // Click the current year button
    const currentYearButton = screen.getByRole("button", { name: "2001" });
    fireEvent.click(currentYearButton);

    expect(mockProps.onYearClick).not.toHaveBeenCalled();
  });

  it("centers current year in the timeline with appropriate transform", () => {
    render(<GalleryNavButtons {...mockProps} />);

    // The inner timeline should have a transform style
    const timelineInner = screen.getByClassName("timeline-inner");

    // Check that a transform is applied (the exact value depends on your implementation)
    expect(timelineInner).toHaveStyle("transform: translateX(-60px)");
    // Note: You may need to adjust this expected value based on your actual calculateTransform logic
  });

  it("handles animation state when changing years", async () => {
    const { rerender } = render(<GalleryNavButtons {...mockProps} />);

    // Initially not animating
    expect(screen.queryByClassName("animating")).not.toBeInTheDocument();

    // Change the current year to trigger animation
    rerender(<GalleryNavButtons {...mockProps} currentIncidentYear={2010} />);

    // Should now be animating
    const timelineInner = screen.getByClassName("timeline-inner");
    expect(timelineInner).toHaveStyle("transform: translateX(-120px)");

    // Animation should finish after the timeout
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });
  });

  it("displays 'No years available' when incidentYears is empty", () => {
    render(
      <GalleryNavButtons
        {...mockProps}
        incidentYears={[]}
        currentIncidentYear={null}
      />
    );

    expect(screen.getByText("No years available")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /\d{4}/ })
    ).not.toBeInTheDocument();
  });

  it("prevents navigation during animation", async () => {
    const { rerender } = render(<GalleryNavButtons {...mockProps} />);

    // Change the current year to trigger animation
    rerender(<GalleryNavButtons {...mockProps} currentIncidentYear={2010} />);

    // Try to click a year button during animation
    const yearButton = screen.getByRole("button", { name: "1995" });
    fireEvent.click(yearButton);

    // onYearClick should not be called while animating
    expect(mockProps.onYearClick).not.toHaveBeenCalled();

    // Wait for animation to finish
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    // Now clicking should work
    fireEvent.click(yearButton);
    expect(mockProps.onYearClick).toHaveBeenCalledWith(1995);
  });

  it("navigates to adjacent years when clicking years in the timeline", () => {
    render(<GalleryNavButtons {...mockProps} />);

    // Get the prev button and click it
    const prevButton = screen.getByRole("button", {
      label: "1995",
    });
    fireEvent.click(prevButton);

    // Since we have year navigation, it should call onYearClick with the previous year
    // TODO: THIS NEEDS TO BE TESTED DIFFERENTLY - WE ARE CALLING YEARS NOT PREV/NEXT BUTTONS
    // The currentIncidentYear is 2001, so the previous should be 1995
    expect(mockProps.onYearClick).toHaveBeenCalledWith(1995);

    // Reset mock
    mockProps.onYearClick.mockClear();

    // Get the next button and click it
    const nextButton = screen.getByRole("button", {
      label: "2010",
    });
    fireEvent.click(nextButton);

    // Should call onYearClick with the next year (2010)
    expect(mockProps.onYearClick).toHaveBeenCalledWith(2010);
  });
});
