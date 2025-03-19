import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/app/contexts/AuthContext";
import { handlers } from "../../app/utils/testing/msw-handlers";
import { server } from "../../app/utils/testing/test-utils";
import { USER_KEY, TOKEN_KEY } from "@/app/utils/auth/client";
import { http, HttpResponse } from "msw";

// Mock window.localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Create a test component that uses the auth context
const TestComponent = () => {
  const { user, isAuthenticated, login, logout, register, error, loading } =
    useAuth();

  const handleLogin = async () => {
    try {
      await login({ email: "test@example.com", password: "password123" });
    } catch (err) {
      // Error is captured by the context
    }
  };

  const handleRegister = async () => {
    try {
      await register({
        email: "new@example.com",
        password: "password123",
        displayName: "User",
      });
    } catch (err) {
      // Error is captured by the context
    }
  };

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? "Authenticated" : "Not authenticated"}
      </div>
      <div data-testid="user-email">{user?.email || "No user"}</div>
      <div data-testid="error-message">{error || "No error"}</div>
      <div data-testid="loading-status">
        {loading ? "Loading" : "Not loading"}
      </div>
      <button data-testid="login-button" onClick={handleLogin}>
        Login
      </button>
      <button data-testid="register-button" onClick={handleRegister}>
        Register
      </button>
      <button data-testid="logout-button" onClick={logout}>
        Logout
      </button>
      <button data-testid="check-auth-button" onClick={() => {}}>
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

describe("AuthContext Provider", () => {
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

  it("initially has no authenticated user", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "Not authenticated"
    );
    expect(screen.getByTestId("user-email")).toHaveTextContent("No user");
  });

  it("loads user from localStorage on mount", async () => {
    // Setup localStorage with a user
    localStorageMock.setItem(
      USER_KEY,
      JSON.stringify({ email: "saved@example.com" })
    );
    localStorageMock.setItem(TOKEN_KEY, "fake-token");

    // Override the default handler for this test to return saved@example.com
    server.use(
      http.get("/api/auth/user", () => {
        return HttpResponse.json({
          user: { email: "saved@example.com" },
          session: { access_token: "fake-token" },
        });
      })
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for authenticated state
    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "Not loading"
      );
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Authenticated"
      );
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "saved@example.com"
      );
    });
  });

  it("handles login successfully", async () => {
    // Override the default handler for this test
    server.use(
      http.post("/api/auth/signin", () => {
        return HttpResponse.json({
          user: { id: "user-123", email: "test@example.com" },
          session: { access_token: "mock_auth_token" },
        });
      })
    );

    // First make sure auth is empty
    server.use(
      http.get("/api/auth/user", () => {
        return HttpResponse.json({ user: null, session: null });
      })
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "Not loading"
      );
    });

    // Initially not authenticated
    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "Not authenticated"
    );

    localStorageMock.setItem.mockClear();

    // Click login button
    fireEvent.click(screen.getByTestId("login-button"));

    // Wait for authenticated state
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Authenticated"
      );
      console.log("All setItem calls:", localStorageMock.setItem.mock.calls);
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "test@example.com"
      );
    });

    // Check localStorage was updated with correct values
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "auth_token",
      "mock_auth_token"
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "auth_user",
      JSON.stringify({ id: "user-123", email: "test@example.com" })
    );
  });

  it("handles login failure", async () => {
    // Override the default handler for this test
    server.use(
      http.post("/api/auth/signin", () => {
        return new HttpResponse(
          JSON.stringify({ error: "Invalid credentials" }),
          { status: 401 }
        );
      }),
      http.get("/api/auth/user", () => {
        return HttpResponse.json({ user: null, session: null });
      })
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "Not loading"
      );
    });

    // Click login button
    fireEvent.click(screen.getByTestId("login-button"));

    // Wait for error message - with a longer timeout
    await waitFor(
      () => {
        expect(screen.getByTestId("error-message")).not.toHaveTextContent(
          "No error"
        );
        expect(screen.getByTestId("auth-status")).toHaveTextContent(
          "Not authenticated"
        );
      },
      { timeout: 3000 }
    );
  });

  it("handles registration successfully", async () => {
    // Override the default handler for this test
    server.use(
      http.post("/api/auth/signup", () => {
        return HttpResponse.json({
          user: { id: "user-456", email: "new@example.com" },
          session: { access_token: "new-token" },
        });
      }),
      http.get("/api/auth/user", () => {
        return HttpResponse.json({ user: null, session: null });
      })
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "Not loading"
      );
    });

    // Clear localStorage mocks
    localStorageMock.setItem.mockClear();

    // Click register button
    fireEvent.click(screen.getByTestId("register-button"));

    // Wait for authenticated state after registration
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Authenticated"
      );
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "new@example.com"
      );
    });

    // Check localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      TOKEN_KEY,
      "new-token"
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      USER_KEY,
      JSON.stringify({ id: "user-456", email: "new@example.com" })
    );
  });

  it("handles logout correctly", async () => {
    // Setup with authenticated user
    server.use(
      http.get("/api/auth/user", () => {
        return HttpResponse.json({
          user: { id: "user-123", email: "test@example.com" },
          session: { access_token: "fake-token" },
        });
      })
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for authenticated state
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Authenticated"
      );
    });

    // Reset localStorage mocks
    localStorageMock.removeItem.mockClear();

    // Click logout button
    fireEvent.click(screen.getByTestId("logout-button"));

    // Check we're logged out
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Not authenticated"
      );
      expect(screen.getByTestId("user-email")).toHaveTextContent("No user");
    });

    // Check localStorage items were removed
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(USER_KEY);
  });

  it("handles network errors during login", async () => {
    // Override the default handler for this test
    server.use(
      http.post("/api/auth/signin", () => {
        return HttpResponse.error();
      }),
      http.get("/api/auth/user", () => {
        return HttpResponse.json({ user: null, session: null });
      })
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "Not loading"
      );
    });

    // Click login button
    fireEvent.click(screen.getByTestId("login-button"));

    // Wait for error message with a longer timeout
    await waitFor(
      () => {
        expect(screen.getByTestId("error-message")).not.toHaveTextContent(
          "No error"
        );
      },
      { timeout: 3000 }
    );
  });
});
