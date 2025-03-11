// __tests__/hooks/useWindowDimensions.test.jsx
import { renderHook, act } from "@testing-library/react-hooks";
import useWindowDimensions from "@/app/hooks/useWindowDimensions";

describe("useWindowDimensions", () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  afterEach(() => {
    // Restore original dimensions
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });

    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });

    // Cleanup event listeners
    window.dispatchEvent(new Event("resize"));
  });

  it("returns the correct initial dimensions", () => {
    // Set test dimensions
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useWindowDimensions());

    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
  });

  it("updates dimensions on window resize", () => {
    // Start with initial dimensions
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useWindowDimensions());

    // Change dimensions
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 800,
    });

    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 600,
    });

    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    // Check updated dimensions
    expect(result.current.width).toBe(800);
    expect(result.current.height).toBe(600);
  });

  it("calculates isMobile correctly based on breakpoint", () => {
    // Mobile width
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 480,
    });

    const { result } = renderHook(() => useWindowDimensions());
    expect(result.current.isMobile).toBe(true);

    // Desktop width
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current.isMobile).toBe(false);
  });

  it("calculates isTablet correctly based on breakpoint", () => {
    // Tablet width
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useWindowDimensions());

    // Trigger resize event to ensure hook updates
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current.isTablet).toBe(true);
    expect(result.current.isMobile).toBe(false);
  });

  it("cleans up resize event listener on unmount", () => {
    // Spy on addEventListener and removeEventListener
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useWindowDimensions());

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );

    // Cleanup
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
