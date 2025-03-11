import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/app/contexts/AuthContext";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import * as authUtils from "@/app/utils/auth/authUtils";

// Mock the auth utilities and next navigation
jest.mock("@/app/utils/auth/authUtils");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
}));

// Test component that consumes auth context
const TestAuthConsumer = () => {
  const { user } = useAuth();
  return (
    <div data-testid="auth-content">
      {user ? `Authenticated as ${user.email}` : "Not authenticated"}
    </div>
  );
};

describe("ProtectedRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup localStorage mock
    localStorage.clear();
  });

  it("redirects unauthenticated users to login page", async () => {
    // Mock unauthenticated user
    authUtils.getCurrentUser.mockResolvedValue({
      user: null,
      session: null,
    });

    const router = require("next/navigation").useRouter();

    render(
      <AuthProvider>
        <ProtectedRoute>
          <TestAuthConsumer />
        </ProtectedRoute>
      </AuthProvider>
    );

    // Should show loading initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Should redirect to login
    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/login");
    });

    // Protected content should not be rendered
    expect(screen.queryByTestId("auth-content")).not.toBeInTheDocument();
  });

  it("renders children for authenticated users", async () => {
    // Mock authenticated user
    const mockUser = { id: "123", email: "test@example.com" };
    authUtils.getCurrentUser.mockResolvedValue({
      user: mockUser,
      session: { id: "session-123" },
    });

    render(
      <AuthProvider>
        <ProtectedRoute>
          <TestAuthConsumer />
        </ProtectedRoute>
      </AuthProvider>
    );

    // Should show loading initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Should render protected content
    await waitFor(() => {
      expect(screen.getByTestId("auth-content")).toBeInTheDocument();
      expect(
        screen.getByText(/authenticated as test@example.com/i)
      ).toBeInTheDocument();
    });
  });

  it("handles auth loading state correctly", async () => {
    // Create a delayed auth response
    authUtils.getCurrentUser.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              user: { id: "123", email: "test@example.com" },
              session: { id: "session-123" },
            });
          }, 100);
        })
    );

    render(
      <AuthProvider>
        <ProtectedRoute>
          <TestAuthConsumer />
        </ProtectedRoute>
      </AuthProvider>
    );

    // Should show loading initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // After loading completes, should show protected content
    await waitFor(() => {
      expect(screen.getByTestId("auth-content")).toBeInTheDocument();
    });
  });
});
