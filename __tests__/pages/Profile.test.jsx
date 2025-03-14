import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import ProfilePage from "@/app/profile/page";
import { useAuth } from "@/app/contexts/AuthContext";

// Mock the Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock the auth context
jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Mock the UI components since they're tested separately
jest.mock("@/app/components/ui", () => ({
  ConsoleWindow: ({ children, title, statusItems }) => (
    <div data-testid="console-window" data-title={title}>
      {children}
      <div data-testid="status-bar">
        {statusItems.map((item, index) => (
          <span key={index} data-testid="status-item">
            {typeof item === "string" ? item : item.text}
          </span>
        ))}
      </div>
    </div>
  ),
  ConsoleSection: ({ children }) => (
    <div data-testid="console-section">{children}</div>
  ),
  CommandOutput: ({ children, title }) => (
    <div data-testid="command-output" data-title={title}>
      {children}
    </div>
  ),
  CatalogHeader: () => <div data-testid="catalog-header">Catalog Header</div>,
}));

// Mock the button component
jest.mock("@/app/components/ui/buttons", () => ({
  Button: ({ children }) => <button>{children}</button>,
}));

// Mock the ProfileInfo component
jest.mock("@/app/components/forms", () => ({
  ProfileInfo: () => (
    <div data-testid="profile-info">Profile Info Component</div>
  ),
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default auth context mock
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: {
        email: "test@example.com",
        displayName: "TestUser",
      },
    });

    // Default router mock
    useRouter.mockReturnValue({
      push: jest.fn(),
    });
  });

  test("redirects to login if not authenticated", async () => {
    // Set auth state to not authenticated
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null,
    });

    const pushMock = jest.fn();
    useRouter.mockReturnValue({
      push: pushMock,
    });

    render(<ProfilePage />);

    // Verify redirect
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login");
    });
  });

  test("displays loading state when authentication is in progress", () => {
    // Set auth state to loading
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
      user: null,
    });

    render(<ProfilePage />);

    // Verify loading state
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders profile interface when authenticated", () => {
    render(<ProfilePage />);

    // Verify structure
    expect(screen.getByTestId("console-window")).toBeInTheDocument();
    expect(screen.getByTestId("console-section")).toBeInTheDocument();
    expect(screen.getByTestId("command-output")).toBeInTheDocument();
    expect(screen.getByTestId("profile-info")).toBeInTheDocument();

    // Verify welcome text
    expect(
      screen.getByText("Welcome back to the Tech Incidents Archive.")
    ).toBeInTheDocument();
  });

  test("displays username from displayName in status bar", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: {
        email: "test@example.com",
        displayName: "TestUser",
      },
    });

    render(<ProfilePage />);

    const statusItems = screen.getAllByTestId("status-item");
    expect(statusItems[2].textContent).toBe("USER: TestUser");
  });

  test("displays username from email when displayName is missing", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: {
        email: "another@example.com",
        displayName: null,
      },
    });

    render(<ProfilePage />);

    const statusItems = screen.getAllByTestId("status-item");
    expect(statusItems[2].textContent).toBe("USER: another");
  });
});
