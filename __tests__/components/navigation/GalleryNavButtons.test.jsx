import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import GalleryNavButtons from "@/app/gallery/GalleryNavButtons";

jest.mock("next/link", () => {
  return ({ href, children, className }) => (
    <a href={href} className={className}>
      {children}
    </a>
  );
});

describe("GalleryNavButtons", () => {
  const mockProps = {
    onPreviousClick: jest.fn(),
    onNextClick: jest.fn(),
    incidentYears: [1989, 1995, 2001, 2010, 2018, 2022],
    currentIncidentYear: 2001,
    onYearClick: jest.fn(),
    incidentCounts: { 1989: 1, 1995: 2, 2001: 3, 2010: 1, 2018: 4, 2022: 1 },
    currentIncidentIndexInYear: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders navigation buttons and timeline", () => {
    render(<GalleryNavButtons {...mockProps} />);

    expect(screen.getByLabelText("Previous artifact")).toBeInTheDocument();
    expect(screen.getByLabelText("Next artifact")).toBeInTheDocument();

    const yearButtons = screen.getAllByRole("button", { name: /\d{4}/ });
    expect(yearButtons).toHaveLength(mockProps.incidentYears.length);

    const catalogButton = screen.getByRole("link", { name: "Catalog" });
    expect(catalogButton).toBeInTheDocument();
    expect(catalogButton).toHaveAttribute("href", "/catalog");
  });

  it("highlights the current year in the timeline", () => {
    render(<GalleryNavButtons {...mockProps} />);

    const currentYearButton = screen.getByRole("button", { name: /2001/ });
    expect(currentYearButton).toHaveClass("activeYearButton");
  });

  it("displays incident count indicators for years with multiple incidents", () => {
    render(<GalleryNavButtons {...mockProps} />);

    expect(screen.getByText(/1\/3/)).toBeInTheDocument();
  });

  it("cycles through incidents within the same year when clicked", () => {
    render(
      <GalleryNavButtons
        {...mockProps}
        currentIncidentYear={2001}
        currentIncidentIndexInYear={1}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /2001/ }));
    expect(mockProps.onYearClick).toHaveBeenCalledWith(2001, 2);
  });

  it("wraps around to the first incident when reaching the last in a year", () => {
    render(
      <GalleryNavButtons
        {...mockProps}
        currentIncidentYear={2001}
        currentIncidentIndexInYear={2}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /2001/ }));
    expect(mockProps.onYearClick).toHaveBeenCalledWith(2001, 0);
  });

  it("centers the current year in the timeline with correct transform", () => {
    render(<GalleryNavButtons {...mockProps} />);

    const timelineInner = screen.getByTestId("timeline-inner");
    expect(timelineInner).toHaveStyle("transform: translateX(0px)");
  });

  it("navigates to previous and next years correctly", () => {
    render(<GalleryNavButtons {...mockProps} />);

    fireEvent.click(screen.getByRole("button", { name: /1995/ }));
    expect(mockProps.onYearClick).toHaveBeenCalledWith(1995, 0);

    mockProps.onYearClick.mockClear();

    fireEvent.click(screen.getByRole("button", { name: /2010/ }));
    expect(mockProps.onYearClick).toHaveBeenCalledWith(2010, 0);
  });

  it("prevents interaction while animating for the same year but allows different years", async () => {
    const { rerender } = render(<GalleryNavButtons {...mockProps} />);

    rerender(<GalleryNavButtons {...mockProps} currentIncidentYear={2010} />);

    fireEvent.click(screen.getByRole("button", { name: /2010/ }));
    expect(mockProps.onYearClick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /1995/ }));
    expect(mockProps.onYearClick).toHaveBeenCalledWith(1995, 0);

    mockProps.onYearClick.mockClear();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    fireEvent.click(screen.getByRole("button", { name: /2010/ }));
    expect(mockProps.onYearClick).toHaveBeenCalledWith(2010, 0);
  });

  it("displays 'No years available' when there are no incidents", () => {
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
});
