import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { server } from "@/app/utils/testing/test-utils";
import SignUpPage from "@/app/signup/page";
import LoginPage from "@/app/login/page";
import ProfilePage from "@/app/profile/page";
import { useRouter, useSearchParams } from "next/navigation";
import { ERROR_TYPES } from "@/app/utils/errors/errorTypes";

// Mock Next.js router and searchParams
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store = {
    "auth-session": JSON.stringify({
      access_token: "expired-token",
      refresh_token: "expired-refresh-token",
    }),
  };

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
});

// Mock AuthContext
jest.mock("@/app/contexts/AuthContext", () => {
  const originalModule = jest.requireActual("@/app/contexts/AuthContext");

  return {
    ...originalModule,
    useAuth: jest.fn().mockReturnValue({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      refreshUser: jest.fn(),
      handleResetPassword: jest.fn(),
    }),
  };
});

// Set up environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test-supabase-url.com";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

describe("Authentication Flow Integration", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset router mock
    useRouter.mockReturnValue({
      push: mockPush,
    });

    // Reset search params mock
    useSearchParams.mockReturnValue({
      get: jest.fn(),
    });

    // Reset session storage
    Object.keys(mockSessionStorage).forEach((key) => {
      mockSessionStorage[key].mockClear();
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("Complete authentication flow: signup → login → view profile → logout", async () => {
    const user = userEvent.setup();
    const testUser = {
      id: "test-user-id",
      email: "test@example.com",
      password: "Password123!",
    };

    // 1. SIGNUP PROCESS
    const mockSignUp = jest.fn().mockResolvedValue({
      user: {
        id: testUser.id,
        email: testUser.email,
      },
      session: {
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
      },
    });

    server.use(
      http.post("/api/auth/signup", () => {
        return HttpResponse.json({
          user: {
            id: testUser.id,
            email: testUser.email,
          },
          session: {
            access_token: "test-access-token",
            refresh_token: "test-refresh-token",
          },
        });
      })
    );

    require("@/app/contexts/AuthContext").useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      session: null,
      isLoading: false,
      loading: false,
      signUp: mockSignUp,
    });

    render(<SignUpPage />);

    await user.type(screen.getByTestId("email-field"), testUser.email);
    await user.type(screen.getByTestId("password-field"), testUser.password);
    await user.type(
      screen.getByTestId("confirmPassword-field"),
      testUser.password
    );

    await user.click(screen.getByRole("button", { name: /CREATE ACCOUNT/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: testUser.email,
        password: testUser.password,
        displayName: testUser.email.split("@")[0],
      });
    });

    mockPush.mockClear();

    cleanup();

    // 2. LOGIN PROCESS
    const mockSignIn = jest.fn().mockResolvedValue({
      user: {
        id: testUser.id,
        email: testUser.email,
      },
      session: {
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
      },
    });

    server.use(
      http.post("/api/auth/signin", () => {
        return HttpResponse.json({
          user: {
            id: testUser.id,
            email: testUser.email,
          },
          session: {
            access_token: "test-access-token",
            refresh_token: "test-refresh-token",
          },
        });
      }),

      http.get("/api/auth/user", () => {
        return HttpResponse.json({
          user: {
            id: testUser.id,
            email: testUser.email,
          },
          session: {
            access_token: "test-access-token",
            refresh_token: "test-refresh-token",
          },
        });
      })
    );

    require("@/app/contexts/AuthContext").useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      session: null,
      isLoading: false,
      loading: false,
      signIn: mockSignIn,
    });

    render(<LoginPage />);

    await user.type(screen.getByTestId("email-field"), testUser.email);
    await user.type(screen.getByTestId("password-field"), testUser.password);

    await user.click(screen.getByRole("button", { name: /LOGIN/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: testUser.email,
        password: testUser.password,
      });
    });

    mockPush.mockClear();
    cleanup();

    // 3. PROFILE VIEW PROCESS
    const mockSignOut = jest.fn().mockResolvedValue({
      success: true,
    });

    server.use(
      http.post("/api/auth/signout", () => {
        return HttpResponse.json({
          success: true,
        });
      })
    );

    require("@/app/contexts/AuthContext").useAuth.mockReturnValue({
      user: {
        id: testUser.id,
        email: testUser.email,
      },
      session: {
        access_token: "test-access-token",
      },
      isAuthenticated: true,
      isLoading: false,
      loading: false,
      signOut: mockSignOut,
      handleResetPassword: jest.fn().mockResolvedValue({
        success: true,
      }),
    });

    render(<ProfilePage />);

    // Verify profile page is loaded with user info
    await waitFor(() => {
      expect(screen.getAllByText(/USER PROFILE/i)[0]).toBeInTheDocument();
    });

    expect(screen.getByText(testUser.email)).toBeInTheDocument();
    expect(screen.getByText(testUser.id)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /SIGN OUT/i }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it("Handles signup failure correctly", async () => {
    const user = userEvent.setup();

    const mockSignUp = jest.fn().mockRejectedValue({
      type: ERROR_TYPES.ALREADY_EXISTS,
      message: "Email already in use",
      error: "Email already in use",
    });

    // Mock server response for signup error
    server.use(
      http.post("/api/auth/signup", () => {
        return HttpResponse.json(
          {
            error: "Email already in use",
            type: ERROR_TYPES.ALREADY_EXISTS,
          },
          { status: 409 }
        );
      })
    );

    require("@/app/contexts/AuthContext").useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      session: null,
      isLoading: false,
      loading: false,
      signUp: mockSignUp,
    });

    render(<SignUpPage />);

    await user.type(screen.getByTestId("email-field"), "existing@example.com");
    await user.type(screen.getByTestId("password-field"), "Password123!");
    await user.type(
      screen.getByTestId("confirmPassword-field"),
      "Password123!"
    );

    await user.click(screen.getByRole("button", { name: /CREATE ACCOUNT/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "existing@example.com",
        password: "Password123!",
        displayName: "existing",
      });
    });

    // Verify no redirect occurred
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("Handles session expiration and redirects to login", async () => {
    const mockRefreshUser = jest.fn().mockRejectedValue({
      type: ERROR_TYPES.SESSION_NOT_FOUND,
      message: "User session has expired",
      error: "User session has expired",
    });

    const mockSignOut = jest.fn().mockResolvedValue({
      success: true,
    });

    server.use(
      http.get("/api/auth/user", () => {
        return HttpResponse.json(
          {
            error: "User session has expired",
            type: ERROR_TYPES.SESSION_NOT_FOUND,
          },
          { status: 401 }
        );
      })
    );

    require("@/app/contexts/AuthContext").useAuth.mockReturnValue({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      loading: false,
      refreshUser: mockRefreshUser,
      signOut: mockSignOut,
    });

    // Set up location.pathname mock
    Object.defineProperty(window, "location", {
      value: { pathname: "/profile" },
      writable: true,
    });

    // Setup useSearchParams to return the current path
    useSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue("/profile"),
    });

    render(<ProfilePage />);

    // Verify redirect to login page with redirect parameter
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("/login?from=%2Fprofile")
      );
    });
  });
});
