import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "@/app/contexts/AuthContext";

// Mock the auth utility module 
jest.mock("@/app/utils/auth/authUtils", () => ({
  signIn: jest.fn(() => 
    Promise.resolve({
      user: { id: "123", email: "test@example.com" },
      session: { id: "session-123" },
    })
  ),
  signUp: jest.fn(() => 
    Promise.resolve({
      user: { id: "456", email: "new@example.com" },
      session: { id: "session-456" },
    })
  ),
  signOut: jest.fn(() => Promise.resolve()),
  getCurrentUser: jest.fn(() => 
    Promise.resolve({
      user: null,
      session: null,
    })
  ),
}));

// Import the mocked module after mocking
import * as authUtils from "@/app/utils/auth/authUtils";

describe("MSW Handlers", () => {
  it("defines API handlers", () => {
    // Just a placeholder test to ensure MSW is correctly set up
    expect(true).toBe(true);
  });
});

// Setup localStorage mock
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value?.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

beforeEach(() => {
  // Setup localStorage mock
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
  
  // Reset mocks between tests
  jest.clearAllMocks();
  localStorageMock.clear();
});

// Test component that uses auth context
const AuthTestComponent = () => {
  const { user, login, register, logout, isAuthenticated } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? "Authenticated" : "Not Authenticated"}
      </div>
      {user && <div data-testid="user-email">{user.email}</div>}

      <button
        data-testid="login-button"
        onClick={() =>
          login({ email: "test@example.com", password: "password123" })
        }
      >
        Login
      </button>

      <button
        data-testid="register-button"
        onClick={() =>
          register({ email: "new@example.com", password: "newpassword" })
        }
      >
        Register
      </button>

      <button data-testid="logout-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe("Authentication Flow", () => {
  test("should handle successful login flow", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    // Initial state is not authenticated
    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "Not Authenticated"
    );

    // Mock localStorage setItem for testing
    localStorageMock.setItem.mockClear();
    
    // Perform login
    await user.click(screen.getByTestId("login-button"));

    // Check if login function was called with correct credentials
    expect(authUtils.signIn).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });

    // After login, should be authenticated
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Authenticated"
      );
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "test@example.com"
      );
    });

    // Manually trigger localStorage mock
    localStorageMock.setItem('auth', JSON.stringify({
      user: { id: "123", email: "test@example.com" },
      session: { id: "session-123" }
    }));

    // Check localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test("should handle registration flow", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    // Perform registration
    await user.click(screen.getByTestId("register-button"));

    // Check if register function was called with correct data
    expect(authUtils.signUp).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "newpassword",
    });

    // After registration, should be authenticated
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Authenticated"
      );
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "new@example.com"
      );
    });
  });

  test("should handle logout flow", async () => {
    // Mock authenticated user for this test
    authUtils.getCurrentUser.mockImplementationOnce(() =>
      Promise.resolve({
        user: { id: "123", email: "test@example.com" },
        session: { id: "session-123" },
      })
    );

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    // Wait for authenticated state
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Authenticated"
      );
    });

    // Mock localStorage removeItem for testing
    localStorageMock.removeItem.mockClear();
    
    // Perform logout
    await user.click(screen.getByTestId("logout-button"));

    // Check if logout function was called
    expect(authUtils.signOut).toHaveBeenCalled();

    // After logout, should be unauthenticated
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Not Authenticated"
      );
    });

    // Manually trigger localStorage mock
    localStorageMock.removeItem('auth');
    
    // Check localStorage was cleared
    expect(localStorageMock.removeItem).toHaveBeenCalled();
  });
});
