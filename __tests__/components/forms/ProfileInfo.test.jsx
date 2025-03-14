import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useAuth } from "@/app/contexts/AuthContext";
import ProfileInfo from "@/app/profile/ProfileInfo";

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/app/components/ui/buttons", () => ({
  Button: ({ className, label, href, onClick }) => (
    <button className={className} onClick={onClick} data-href={href}>
      {label}
    </button>
  ),
}));

jest.mock("@/app/utils/auth/authUtils", () => ({
  getProtectedData: jest.fn(),
  addProtectedData: jest.fn(),
}));

describe("ProfileInfo Component", () => {
  const mockLogout = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders user profile information correctly", () => {
    const mockUser = {
      id: "user123",
      displayName: "TestUser",
      email: "test@example.com",
    };

    useAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });

    render(<ProfileInfo />);

    expect(screen.getByText("USER PROFILE")).toBeInTheDocument();
    expect(
      screen.getByText("Access level: Registered Member")
    ).toBeInTheDocument();
    expect(screen.getByText("Username:")).toBeInTheDocument();
    expect(screen.getByText("TestUser")).toBeInTheDocument();
    expect(screen.getByText("Email:")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("User ID:")).toBeInTheDocument();
    expect(screen.getByText("user123")).toBeInTheDocument();
    expect(screen.getByText("VIEW CATALOG")).toBeInTheDocument();
    expect(screen.getByText("SIGN OUT")).toBeInTheDocument();
  });

  test("uses email as username when displayName is not available", () => {
    const mockUser = {
      id: "user123",
      email: "test@example.com",
    };

    useAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });

    render(<ProfileInfo />);

    expect(screen.getByText("test")).toBeInTheDocument();
  });

  test('uses "Guest" as username when both displayName and email are not available', () => {
    const mockUser = {
      id: "user123",
    };

    useAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });

    render(<ProfileInfo />);

    expect(screen.getByText("Guest")).toBeInTheDocument();
  });

  test('calls logout function when "SIGN OUT" button is clicked', async () => {
    const mockUser = {
      id: "user123",
      displayName: "TestUser",
      email: "test@example.com",
    };

    useAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });

    render(<ProfileInfo />);

    const logoutButton = screen.getByText("SIGN OUT");
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  test("handles logout errors gracefully", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const mockLogoutWithError = jest.fn(() =>
      Promise.reject(new Error("Logout failed"))
    );
    const mockUser = {
      id: "user123",
      displayName: "TestUser",
      email: "test@example.com",
    };

    useAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogoutWithError,
    });

    render(<ProfileInfo />);

    const logoutButton = screen.getByText("SIGN OUT");
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogoutWithError).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Logout error:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test("returns null when user is not available", () => {
    useAuth.mockReturnValue({
      user: null,
      logout: mockLogout,
    });

    const { container } = render(<ProfileInfo />);

    expect(container).toBeEmptyDOMElement();
  });

  test("VIEW CATALOG button has correct href attribute", () => {
    const mockUser = {
      id: "user123",
      displayName: "TestUser",
      email: "test@example.com",
    };

    useAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });

    render(<ProfileInfo />);

    const catalogButton = screen.getByText("VIEW CATALOG");
    expect(catalogButton).toHaveAttribute("data-href", "/catalog");
  });

  test("handles user with empty email correctly", () => {
    const mockUser = {
      id: "user123",
      email: "",
    };

    useAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });

    render(<ProfileInfo />);

    expect(screen.getByText("Guest")).toBeInTheDocument();
  });

  test("has the correct CSS classes for styling", () => {
    const mockUser = {
      id: "user123",
      displayName: "TestUser",
      email: "test@example.com",
    };

    useAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });

    const { container } = render(<ProfileInfo />);

    expect(container.querySelector(".auth-form-container")).toBeInTheDocument();
    expect(container.querySelector(".profile-container")).toBeInTheDocument();
    expect(container.querySelector(".auth-header")).toBeInTheDocument();
    expect(container.querySelector(".auth-title")).toBeInTheDocument();
    expect(container.querySelector(".auth-subtitle")).toBeInTheDocument();
    expect(container.querySelector(".profile-info")).toBeInTheDocument();
    expect(container.querySelectorAll(".profile-row").length).toBe(3);
    expect(container.querySelectorAll(".profile-label").length).toBe(3);
    expect(container.querySelectorAll(".profile-value").length).toBe(2);
    expect(container.querySelector(".profile-id")).toBeInTheDocument();
    expect(container.querySelector(".button-container")).toBeInTheDocument();
    expect(container.querySelector(".auth-button")).toBeInTheDocument();
    expect(container.querySelector(".logout-button")).toBeInTheDocument();
  });

  test("provides accessible information for screen readers", () => {
    const mockUser = {
      id: "user123",
      displayName: "TestUser",
      email: "test@example.com",
    };

    useAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });

    render(<ProfileInfo />);

    expect(
      screen.getByRole("heading", { name: "USER PROFILE" })
    ).toBeInTheDocument();

    expect(screen.getByText("VIEW CATALOG")).toBeInTheDocument();
    expect(screen.getByText("SIGN OUT")).toBeInTheDocument();
  });
});
