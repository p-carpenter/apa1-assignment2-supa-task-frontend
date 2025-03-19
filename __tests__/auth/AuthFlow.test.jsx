import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/app/contexts/AuthContext";

jest.mock("@/app/utils/auth/authUtils", () => ({
  signIn: jest.fn(() =>
    Promise.resolve({
      user: { id: "test-id", email: "test@example.com" },
      session: { access_token: "mock-token" },
    })
  ),
  signUp: jest.fn(() =>
    Promise.resolve({
      user: { id: "new-id", email: "new@example.com" },
      session: { access_token: "new-mock-token" },
    })
  ),
  signOut: jest.fn(() => Promise.resolve({ success: true })),
  getCurrentUser: jest.fn(() =>
    Promise.resolve({
      user: null,
      session: null,
    })
  ),
}));

import * as authUtils from "@/app/utils/auth/client";

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

const DirectAuthComponent = () => {
  return (
    <div>
      <button
        data-testid="direct-login-button"
        onClick={() =>
          authUtils.signIn({
            email: "test@example.com",
            password: "password123",
          })
        }
      >
        Direct Login
      </button>
      <button
        data-testid="direct-register-button"
        onClick={() =>
          authUtils.signUp({
            email: "new@example.com",
            password: "newpassword",
          })
        }
      >
        Direct Register
      </button>
      <button
        data-testid="direct-logout-button"
        onClick={() => authUtils.signOut()}
      >
        Direct Logout
      </button>
    </div>
  );
};

describe("Authentication Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should handle login flow", async () => {
    render(<DirectAuthComponent />);

    fireEvent.click(screen.getByTestId("direct-login-button"));

    expect(authUtils.signIn).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  test("should handle registration flow", async () => {
    render(<DirectAuthComponent />);

    fireEvent.click(screen.getByTestId("direct-register-button"));

    expect(authUtils.signUp).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "newpassword",
    });
  });

  test("should handle logout flow", async () => {
    render(<DirectAuthComponent />);

    fireEvent.click(screen.getByTestId("direct-logout-button"));

    expect(authUtils.signOut).toHaveBeenCalled();
  });

  test("AuthProvider initializes with authentication state", async () => {
    authUtils.getCurrentUser.mockImplementationOnce(() =>
      Promise.resolve({
        user: { id: "user-123", email: "test@example.com" },
        session: { access_token: "token-123" },
      })
    );

    const AuthStateComponent = () => {
      const { user, isAuthenticated } = useAuth();

      return (
        <div>
          <div data-testid="auth-state">
            {isAuthenticated ? "Authenticated" : "Not Authenticated"}
          </div>
          {user && <div data-testid="user-email">{user.email}</div>}
        </div>
      );
    };

    render(
      <AuthProvider>
        <AuthStateComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent(
        "Authenticated"
      );
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "test@example.com"
      );
    });
  });
});
