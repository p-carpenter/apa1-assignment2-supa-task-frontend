import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/app/utils/testing/test-utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import ResetPasswordPage from "@/app/reset_password/page";
import ConfirmResetPage from "@/app/reset_password/confirm/page";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn().mockImplementation((param) => {
      if (param === "token") return "test-token";
      return null;
    }),
    has: jest.fn().mockReturnValue(true),
  })),
}));

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const originalWindowLocation = window.location;

describe("Password Recovery Flow Tests", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockAuthContext = {
    isAuthenticated: false,
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
    useAuth.mockReturnValue(mockAuthContext);

    Object.defineProperty(window, "location", {
      value: { ...originalWindowLocation },
      writable: true,
    });

    server.use(
      http.post("/api/auth/password-recovery", async () => {
        return HttpResponse.json({
          message: "Password reset instructions sent",
        });
      }),

      http.post("/api/auth/password-recovery/confirm", async ({ request }) => {
        const body = await request.json();
        console.log(
          "Received reset confirmation request with token:",
          body.token
        );

        if (!body.email || !body.password || !body.token) {
          return new HttpResponse(
            JSON.stringify({
              error: "Email, password, and token are required",
            }),
            {
              status: 400,
            }
          );
        }

        return HttpResponse.json({
          message: "Password has been reset successfully",
        });
      })
    );
  });

  describe("Password Reset Request Page", () => {
    it("renders the password reset request form", () => {
      render(<ResetPasswordPage />);

      expect(
        screen.getByRole("button", { name: /SEND RESET LINK/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/EMAIL/i)).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /RECOVER ACCESS/i })
      ).toBeInTheDocument();
    });

    it("redirects to profile if already authenticated", () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
      });

      render(<ResetPasswordPage />);

      expect(mockRouter.push).toHaveBeenCalledWith("/profile");
    });

    it("validates email input", async () => {
      render(<ResetPasswordPage />);

      const emailInput = screen.getByLabelText(/EMAIL/i);
      const submitButton = screen.getByRole("button", {
        name: /SEND RESET LINK/i,
      });

      fireEvent.change(emailInput, { target: { value: "" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/Email is required/i)).toBeInTheDocument();
      });

      fireEvent.change(emailInput, { target: { value: "invalidemail" } });

      await waitFor(() => {
        expect(
          screen.queryByText(/Please enter a valid email address/i)
        ).toBeInTheDocument();
      });
    });

    it("submits the form successfully", async () => {
      render(<ResetPasswordPage />);

      const emailInput = screen.getByLabelText(/EMAIL/i);
      const submitButton = screen.getByTestId("reset-password-button");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const successElements = screen
          .getAllByRole("generic", {
            name: "",
            hidden: false,
          })
          .filter((el) => el.className.includes("auth-success"));

        expect(successElements.length).toBeGreaterThan(0);
      });
    });

    it("shows error message on failed request", async () => {
      server.use(
        http.post("/api/auth/password-recovery", () => {
          return new HttpResponse(
            JSON.stringify({ error: "Failed to send reset email" }),
            {
              status: 500,
            }
          );
        })
      );

      render(<ResetPasswordPage />);

      const emailInput = screen.getByLabelText(/EMAIL/i);
      const submitButton = screen.getByRole("button", {
        name: /SEND RESET LINK/i,
      });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorElements = screen
          .getAllByRole("generic", {
            name: "",
            hidden: false,
          })
          .filter((el) => el.className.includes("auth-error"));

        expect(errorElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Password Reset Confirmation Page", () => {
    beforeEach(() => {
      Object.defineProperty(window, "location", {
        value: {
          ...originalWindowLocation,
          hash: "#access_token=test-token",
          pathname: "/reset_password/confirm",
          assign: jest.fn(),
        },
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, "crypto", {
        value: {
          subtle: {
            digest: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
          },
        },
      });
    });

    it("renders the password reset confirmation form", async () => {
      render(<ConfirmResetPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/EMAIL/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/NEW PASSWORD/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/CONFIRM PASSWORD/i)).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /RESET PASSWORD/i })
        ).toBeInTheDocument();
      });
    });

    it("validates all fields", async () => {
      render(<ConfirmResetPage />);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: /RESET PASSWORD/i,
        });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        const errorElements = screen
          .getAllByRole("generic", {
            name: "",
            hidden: false,
          })
          .filter((el) => el.classList.contains("form-error"));

        expect(errorElements.length).toBeGreaterThan(0);
      });
    });

    it("validates password requirements", async () => {
      render(<ConfirmResetPage />);

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/EMAIL/i);
        const passwordInput = screen.getByLabelText(/NEW PASSWORD/i);

        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "weak" } });
      });

      await waitFor(() => {
        const passwordErrorElement = screen
          .getAllByRole("generic", {
            name: "",
            hidden: false,
          })
          .filter(
            (el) =>
              el.classList.contains("form-error") &&
              el.previousElementSibling &&
              el.previousElementSibling.id === "password"
          );

        expect(passwordErrorElement.length).toBeGreaterThan(0);
      });
    });

    it("validates passwords match", async () => {
      render(<ConfirmResetPage />);

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/EMAIL/i);
        const passwordInput = screen.getByLabelText(/NEW PASSWORD/i);
        const confirmPasswordInput = screen.getByLabelText(/CONFIRM PASSWORD/i);

        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, {
          target: { value: "StrongPassword123!" },
        });
        fireEvent.change(confirmPasswordInput, {
          target: { value: "DifferentPassword123!" },
        });
      });

      await waitFor(() => {
        const confirmPasswordErrorElement = screen
          .getAllByRole("generic", {
            name: "",
            hidden: false,
          })
          .filter(
            (el) =>
              el.classList.contains("form-error") &&
              el.previousElementSibling &&
              el.previousElementSibling.id === "confirmPassword"
          );

        expect(confirmPasswordErrorElement.length).toBeGreaterThan(0);
      });
    });

    it("submits the form successfully", async () => {
      console.log("Starting form submission test");
      render(<ConfirmResetPage />);

      await waitFor(() => {
        console.log("Form rendered, filling out fields");
        const emailInput = screen.getByLabelText(/EMAIL/i);
        const passwordInput = screen.getByLabelText(/NEW PASSWORD/i);
        const confirmPasswordInput = screen.getByLabelText(/CONFIRM PASSWORD/i);
        const submitButton = screen.getByTestId("confirm-reset-button");

        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, {
          target: { value: "StrongPassword123!" },
        });
        fireEvent.change(confirmPasswordInput, {
          target: { value: "StrongPassword123!" },
        });

        console.log("Fields filled, clicking submit button");
        fireEvent.click(submitButton);
      });

      console.log("Waiting for success message");

      await waitFor(
        () => {
          const successElements = screen
            .getAllByRole("generic", {
              name: "",
              hidden: false,
            })
            .filter((el) => el.className.includes("auth-success"));

          console.log(`Found ${successElements.length} success elements`);
          expect(successElements.length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );
    });

    it("shows error message on failed password reset", async () => {
      server.use(
        http.post("/api/auth/password-recovery/confirm", () => {
          return new HttpResponse(JSON.stringify({ error: "Invalid token" }), {
            status: 401,
          });
        })
      );

      render(<ConfirmResetPage />);

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/EMAIL/i);
        const passwordInput = screen.getByLabelText(/NEW PASSWORD/i);
        const confirmPasswordInput = screen.getByLabelText(/CONFIRM PASSWORD/i);
        const submitButton = screen.getByRole("button", {
          name: /RESET PASSWORD/i,
        });

        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, {
          target: { value: "StrongPassword123!" },
        });
        fireEvent.change(confirmPasswordInput, {
          target: { value: "StrongPassword123!" },
        });
        fireEvent.click(submitButton);
      });

      await waitFor(
        () => {
          const errorElements = screen
            .getAllByRole("generic", {
              name: "",
              hidden: false,
            })
            .filter((el) => el.className.includes("auth-error"));

          expect(errorElements.length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );
    });
  });
});
