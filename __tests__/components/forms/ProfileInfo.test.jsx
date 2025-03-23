import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useAuth } from "@/app/contexts/AuthContext";
import ProfileInfo from "@/app/profile/ProfileInfo";

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/app/components/ui/buttons", () => ({
  Button: ({ children, onClick, className, label, href, disabled, icon }) => (
    <button
      onClick={onClick}
      className={className}
      data-href={href}
      disabled={disabled}
      data-icon={icon}
    >
      {children || label}
    </button>
  ),
}));

jest.mock("@/app/utils/auth/client/index.js", () => ({
  getProtectedData: jest.fn(),
  addProtectedData: jest.fn(),
}));

describe("ProfileInfo Component", () => {
  const mockSignOut = jest.fn(() => Promise.resolve());
  const mockHandleResetPassword = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    jest.clearAllMocks();

    useAuth.mockReturnValue({
      user: {
        id: "user123",
        email: "test@example.com",
        displayName: "TestUser",
      },
      signOut: mockSignOut,
      handleResetPassword: mockHandleResetPassword,
    });
  });

  it("renders user profile information correctly", () => {
    const mockUser = {
      id: "user123",
      displayName: "TestUser",
      email: "test@example.com",
    };

    useAuth.mockReturnValue({
      user: mockUser,
      signOut: mockSignOut,
      handleResetPassword: mockHandleResetPassword,
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
    expect(screen.getByText("RESET PASSWORD")).toBeInTheDocument();
    expect(screen.getByText("SIGN OUT")).toBeInTheDocument();
  });

  it("uses email as username when displayName is not available", () => {
    const mockUser = {
      id: "user123",
      email: "test@example.com",
    };

    useAuth.mockReturnValue({
      user: mockUser,
      signOut: mockSignOut,
      handleResetPassword: mockHandleResetPassword,
    });

    render(<ProfileInfo />);

    expect(screen.getByText("test")).toBeInTheDocument();
  });

  it('uses "Guest" as username when both displayName and email are not available', () => {
    const mockUser = {
      id: "user123",
    };

    useAuth.mockReturnValue({
      user: mockUser,
      signOut: mockSignOut,
      handleResetPassword: mockHandleResetPassword,
    });

    render(<ProfileInfo />);

    expect(screen.getByText("Guest")).toBeInTheDocument();
  });

  it('calls signOut function when "SIGN OUT" button is clicked', async () => {
    render(<ProfileInfo />);

    const logoutButton = screen.getByText("SIGN OUT");
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });

  it("handles logout errors gracefully", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const mockSignOutWithError = jest.fn(() =>
      Promise.reject(new Error("Logout failed"))
    );

    useAuth.mockReturnValue({
      user: {
        id: "user123",
        displayName: "TestUser",
        email: "test@example.com",
      },
      signOut: mockSignOutWithError,
      handleResetPassword: mockHandleResetPassword,
    });

    render(<ProfileInfo />);

    const logoutButton = screen.getByText("SIGN OUT");
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockSignOutWithError).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Logout error:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("returns null when user is not available", () => {
    useAuth.mockReturnValue({
      user: null,
      signOut: mockSignOut,
      handleResetPassword: mockHandleResetPassword,
    });

    const { container } = render(<ProfileInfo />);

    expect(container).toBeEmptyDOMElement();
  });

  it("VIEW CATALOG button has correct href attribute", () => {
    render(<ProfileInfo />);

    const catalogButton = screen.getByText("VIEW CATALOG");
    expect(catalogButton).toHaveAttribute("data-href", "/catalog");
  });

  it("handles user with empty email correctly", () => {
    const mockUser = {
      id: "user123",
      email: "",
    };

    useAuth.mockReturnValue({
      user: mockUser,
      signOut: mockSignOut,
      handleResetPassword: mockHandleResetPassword,
    });

    render(<ProfileInfo />);

    expect(screen.getByText("Guest")).toBeInTheDocument();
  });

  it("calls handleResetPassword function when RESET PASSWORD button is clicked", async () => {
    render(<ProfileInfo />);

    const resetButton = screen.getByText("RESET PASSWORD");
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(mockHandleResetPassword).toHaveBeenCalledTimes(1);
      expect(mockHandleResetPassword).toHaveBeenCalledWith("test@example.com");
    });
  });

  it("displays loading state while processing password reset", async () => {
    const delayedResetMock = jest.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    useAuth.mockReturnValue({
      user: {
        id: "user123",
        displayName: "TestUser",
        email: "test@example.com",
      },
      signOut: mockSignOut,
      handleResetPassword: delayedResetMock,
    });

    render(<ProfileInfo />);

    const resetButton = screen.getByText("RESET PASSWORD");
    fireEvent.click(resetButton);

    expect(await screen.findByText("SENDING...")).toBeInTheDocument();
  });

  it("displays success message after password reset", async () => {
    render(<ProfileInfo />);

    const resetButton = screen.getByText("RESET PASSWORD");
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(
        screen.getByText("Password reset instructions sent to your email")
      ).toBeInTheDocument();
    });
  });

  it("handles password reset errors gracefully", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockResetWithError = jest.fn(() =>
      Promise.reject(new Error("Reset failed"))
    );

    useAuth.mockReturnValue({
      user: {
        id: "user123",
        displayName: "TestUser",
        email: "test@example.com",
      },
      signOut: mockSignOut,
      handleResetPassword: mockResetWithError,
    });

    render(<ProfileInfo />);

    const resetButton = screen.getByText("RESET PASSWORD");
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(mockResetWithError).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Password reset error:",
        expect.any(Error)
      );
      expect(screen.getByText("Reset failed")).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it("uses custom error message when reset error has no message", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const errorWithoutMessage = new Error();
    delete errorWithoutMessage.message;

    const mockResetWithEmptyError = jest.fn(() =>
      Promise.reject(errorWithoutMessage)
    );

    useAuth.mockReturnValue({
      user: {
        id: "user123",
        displayName: "TestUser",
        email: "test@example.com",
      },
      signOut: mockSignOut,
      handleResetPassword: mockResetWithEmptyError,
    });

    render(<ProfileInfo />);

    const resetButton = screen.getByText("RESET PASSWORD");
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to send reset instructions")
      ).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it("has the correct CSS classes for styling", () => {
    const { container } = render(<ProfileInfo />);

    expect(container.querySelector(`.profileContainer`)).toBeInTheDocument();

    expect(container.querySelector(`.profileInfo`)).toBeInTheDocument();
    expect(container.querySelectorAll(`.profileRow`).length).toBe(3);
    expect(container.querySelectorAll(`.profileLabel`).length).toBe(3);
    expect(container.querySelectorAll(`.profileValue`).length).toBe(2);
    expect(container.querySelector(`.profileId`)).toBeInTheDocument();

    expect(container.querySelector(`.buttonContainer`)).toBeInTheDocument();
    expect(container.querySelector(`.logoutButton`)).toBeInTheDocument();
  });

  it("provides accessible information for screen readers", () => {
    render(<ProfileInfo />);

    expect(
      screen.getByRole("heading", { name: "USER PROFILE" })
    ).toBeInTheDocument();

    expect(screen.getByText("VIEW CATALOG")).toBeInTheDocument();
    expect(screen.getByText("RESET PASSWORD")).toBeInTheDocument();
    expect(screen.getByText("SIGN OUT")).toBeInTheDocument();
  });
});
