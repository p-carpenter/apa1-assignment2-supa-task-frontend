import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import SignupPage from "@/app/signup/page";
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
  ConsoleSection: ({ children, command }) => (
    <div data-testid="console-section" data-command={command}>
      {children}
    </div>
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

// Mock the SignupForm component
jest.mock("@/app/components/forms", () => ({
  SignupForm: () => <div data-testid="signup-form">Signup Form Component</div>,
}));

describe("SignupPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default auth context mock
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
    });

    // Default router mock
    useRouter.mockReturnValue({
      push: jest.fn(),
    });
  });

  test("redirects to profile if already authenticated", async () => {
    // Set auth state to authenticated
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
    });

    const pushMock = jest.fn();
    useRouter.mockReturnValue({
      push: pushMock,
    });

    render(<SignupPage />);

    // Verify redirect
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/profile");
    });
  });

  test("does not redirect during authentication loading", () => {
    // Set auth state to loading
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
    });

    const pushMock = jest.fn();
    useRouter.mockReturnValue({
      push: pushMock,
    });

    render(<SignupPage />);

    // Verify no redirect
    expect(pushMock).not.toHaveBeenCalled();
  });

  test("renders signup interface when not authenticated", () => {
    render(<SignupPage />);

    // Verify structure
    expect(screen.getByTestId("console-window")).toBeInTheDocument();
    expect(screen.getByTestId("console-section")).toBeInTheDocument();
    expect(screen.getByTestId("command-output")).toBeInTheDocument();
    expect(screen.getByTestId("signup-form")).toBeInTheDocument();

    // Verify registration text
    expect(
      screen.getByText(
        "Create a new account to become a member of the Archive and contribute."
      )
    ).toBeInTheDocument();
  });

  test("displays correct status items", () => {
    render(<SignupPage />);

    const statusItems = screen.getAllByTestId("status-item");
    expect(statusItems[0].textContent).toBe("TECH INCIDENTS ARCHIVE");
    expect(statusItems[1].textContent).toBe("USER REGISTRATION");
    expect(statusItems[2].textContent).toBe("NEW ACCOUNT CREATION");
  });

  test("uses correct command in console section", () => {
    render(<SignupPage />);

    expect(screen.getByTestId("console-section")).toHaveAttribute(
      "data-command",
      "security --register"
    );
  });
});
