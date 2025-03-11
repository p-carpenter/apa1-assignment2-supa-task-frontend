import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/app/contexts/AuthContext";
import { handlers } from "../__mocks__/handlers";
import { setupServer } from "msw/node";

// Setup MSW server
const server = setupServer(...handlers);

// Mock window.localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Create a test component that uses the auth context
const TestComponent = () => {
  const { 
    user, 
    isAuthenticated, 
    login, 
    logout, 
    register, 
    error, 
    loading,
    checkAuth 
  } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? "Authenticated" : "Not authenticated"}
      </div>
      <div data-testid="user-email">{user?.email || "No user"}</div>
      <div data-testid="error-message">{error || "No error"}</div>
      <div data-testid="loading-status">{loading ? "Loading" : "Not loading"}</div>
      <button 
        data-testid="login-button" 
        onClick={() => login("test@example.com", "password123")}
      >
        Login
      </button>
      <button 
        data-testid="register-button" 
        onClick={() => register("new@example.com", "password123", "User")}
      >
        Register
      </button>
      <button data-testid="logout-button" onClick={logout}>
        Logout
      </button>
      <button data-testid="check-auth-button" onClick={checkAuth}>
        Check Auth
      </button>
    </div>
  );
};

describe("MSW Handlers", () => {
  it("defines API handlers", () => {
    expect(handlers.length).toBeGreaterThan(0);
  });
});

describe("AuthContext", () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("initially has no authenticated user", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth-status")).toHaveTextContent("Not authenticated");
    expect(screen.getByTestId("user-email")).toHaveTextContent("No user");
  });

  it("loads user from localStorage on mount", async () => {
    // Setup localStorage with a user
    localStorageMock.setItem("user", JSON.stringify({ email: "saved@example.com" }));
    localStorageMock.setItem("token", "fake-token");

    // Mock successful token validation
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Authenticated");
      expect(screen.getByTestId("user-email")).toHaveTextContent("saved@example.com");
    });
  });

  it("handles login successfully", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: true, 
        user: { email: "test@example.com" }, 
        token: "fake-token" 
      }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially not authenticated
    expect(screen.getByTestId("auth-status")).toHaveTextContent("Not authenticated");

    // Click login button
    fireEvent.click(screen.getByTestId("login-button"));

    // Wait for authenticated state
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Authenticated");
      expect(screen.getByTestId("user-email")).toHaveTextContent("test@example.com");
    });

    // Check localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith("token", "fake-token");
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "user", 
      JSON.stringify({ email: "test@example.com" })
    );
  });

  it("handles login failure", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: false, 
        error: "Invalid credentials" 
      }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Click login button
    fireEvent.click(screen.getByTestId("login-button"));

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent("Invalid credentials");
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Not authenticated");
    });
  });

  it("handles registration successfully", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: true, 
        user: { email: "new@example.com" }, 
        token: "new-token" 
      }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Click register button
    fireEvent.click(screen.getByTestId("register-button"));

    // Wait for authenticated state after registration
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Authenticated");
      expect(screen.getByTestId("user-email")).toHaveTextContent("new@example.com");
    });

    // Check localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith("token", "new-token");
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "user", 
      JSON.stringify({ email: "new@example.com" })
    );
  });

  it("handles logout correctly", async () => {
    // Setup with authenticated user
    localStorageMock.setItem("user", JSON.stringify({ email: "test@example.com" }));
    localStorageMock.setItem("token", "fake-token");

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for authenticated state
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Authenticated");
    });

    // Click logout button
    fireEvent.click(screen.getByTestId("logout-button"));

    // Check we're logged out
    expect(screen.getByTestId("auth-status")).toHaveTextContent("Not authenticated");
    expect(screen.getByTestId("user-email")).toHaveTextContent("No user");

    // Check localStorage items were removed
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("user");
  });
});

it("handles network errors during login", async () => {
  global.fetch.mockRejectedValueOnce(new Error("Network error"));

  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  // Click login button
  fireEvent.click(screen.getByTestId("login-button"));

  // Wait for error message
  await waitFor(() => {
    expect(screen.getByTestId("error-message")).toHaveTextContent("Network error");
  });
});

it("handles expired tokens correctly", async () => {
  // Setup with expired token
  localStorageMock.setItem("user", JSON.stringify({ email: "test@example.com" }));
  localStorageMock.setItem("token", "expired-token");

  // First API call for token validation fails
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ success: false, error: "Token expired" }),
  });

  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  // Wait for not authenticated state
  await waitFor(() => {
    expect(screen.getByTestId("auth-status")).toHaveTextContent("Not authenticated");
  });

  // Check localStorage items were removed due to invalid token
  expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
  expect(localStorageMock.removeItem).toHaveBeenCalledWith("user");
});
