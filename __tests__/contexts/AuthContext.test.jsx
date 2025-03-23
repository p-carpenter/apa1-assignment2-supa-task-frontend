import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/app/contexts/AuthContext";
import { handlers } from "../../app/utils/testing/msw-handlers";
import { server } from "../../app/utils/testing/test-utils";
import { http, HttpResponse } from "msw";

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

export const USER_KEY = "auth_user";
export const TOKEN_KEY = "auth_token";

const TestComponent = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    refreshUser,
  } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn({ email: "test@example.com", password: "password123" });
    } catch (err) {}
  };

  const handleSignUp = async () => {
    try {
      await signUp({
        email: "new@example.com",
        password: "password123",
        displayName: "User",
      });
    } catch (err) {}
  };

  const handleRefresh = async () => {
    try {
      await refreshUser();
    } catch (err) {}
  };

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? "Authenticated" : "Not authenticated"}
      </div>
      <div data-testid="user-email">{user?.email || "No user"}</div>
      <div data-testid="error-message">{error?.message || "No error"}</div>
      <div data-testid="loading-status">
        {isLoading ? "Loading" : "Not loading"}
      </div>
      <button data-testid="login-button" onClick={handleLogin}>
        Login
      </button>
      <button data-testid="signup-button" onClick={handleSignUp}>
        SignUp
      </button>
      <button data-testid="logout-button" onClick={signOut}>
        Logout
      </button>
      <button data-testid="refresh-button" onClick={handleRefresh}>
        Refresh
      </button>
    </div>
  );
};

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

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "Not loading"
      );
    });

    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "Not authenticated"
    );
    expect(screen.getByTestId("user-email")).toHaveTextContent("No user");
  });

  it("loads user from localStorage on mount", async () => {
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
    server.use(
      http.post("/api/auth/signin", () => {
        return HttpResponse.json({
          user: { id: "user-123", email: "test@example.com" },
          session: { access_token: "mock_auth_token" },
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

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "Not loading"
      );
    });

    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "Not authenticated"
    );

    fireEvent.click(screen.getByTestId("login-button"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Authenticated"
      );
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "test@example.com"
      );
    });
  });

  it("handles login failure", async () => {
    server.use(
      http.post("/api/auth/signin", () => {
        return new HttpResponse(
          JSON.stringify({
            error: "Invalid credentials",
            type: "invalid_credentials",
          }),
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

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "Not loading"
      );
    });

    fireEvent.click(screen.getByTestId("login-button"));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).not.toHaveTextContent(
        "No error"
      );
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Not authenticated"
      );
    });
  });

  it("handles signup successfully", async () => {
    server.use(
      http.post("/api/auth/signup", () => {
        return HttpResponse.json({
          user: { id: "user-456", email: "new@example.com" },
          session: null,
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

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "Not loading"
      );
    });

    fireEvent.click(screen.getByTestId("signup-button"));

    await waitFor(() => {
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "new@example.com"
      );
    });
  });

  it("handles logout correctly", async () => {
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

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Authenticated"
      );
    });

    server.use(
      http.post("/api/auth/signout", () => {
        return HttpResponse.json({ success: true });
      })
    );

    fireEvent.click(screen.getByTestId("logout-button"));

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Not authenticated"
      );
      expect(screen.getByTestId("user-email")).toHaveTextContent("No user");
    });
  });

  it("handles network errors during login", async () => {
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

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "Not loading"
      );
    });

    fireEvent.click(screen.getByTestId("login-button"));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).not.toHaveTextContent(
        "No error"
      );
    });
  });

  it("handles session refresh correctly", async () => {
    server.use(
      http.get("/api/auth/user", () => {
        return HttpResponse.json({
          user: { id: "user-123", email: "initial@example.com" },
          session: { access_token: "initial-token" },
        });
      })
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "initial@example.com"
      );
    });

    server.use(
      http.get("/api/auth/user", () => {
        return HttpResponse.json({
          user: { id: "user-123", email: "refreshed@example.com" },
          session: { access_token: "refreshed-token" },
        });
      })
    );

    fireEvent.click(screen.getByTestId("refresh-button"));

    await waitFor(() => {
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "refreshed@example.com"
      );
    });
  });

  it("handles invalid user data from server gracefully", async () => {
    server.use(
      http.get("/api/auth/user", () => {
        return HttpResponse.json({ malformed: true });
      })
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "Not loading"
      );
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "Not authenticated"
      );
    });
  });

  it("passes initialUser and initialSession props correctly", async () => {
    const initialUser = { id: "initial-id", email: "initial@example.com" };
    const initialSession = { access_token: "initial-session-token" };

    server.use(
      http.get("/api/auth/user", () => {
        return HttpResponse.json({
          user: initialUser,
          session: initialSession,
        });
      })
    );

    render(
      <AuthProvider initialUser={initialUser} initialSession={initialSession}>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth-status")).toHaveTextContent(
      "Authenticated"
    );
    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "initial@example.com"
    );
  });
});
