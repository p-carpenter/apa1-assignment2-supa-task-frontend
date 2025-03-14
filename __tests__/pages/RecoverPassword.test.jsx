import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/app/utils/testing/test-utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import ResetPasswordPage from "@/app/reset_password/page";
import ConfirmResetPage from "@/app/reset_password/confirm/page";

// Mock the Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn().mockImplementation(param => {
      if (param === 'token') return null;
      return null;
    }),
    has: jest.fn().mockReturnValue(false)
  }))
}));

// Mock the auth context
jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn()
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    hash: '',
    pathname: '/reset_password',
    assign: jest.fn()
  },
  writable: true
});

describe('Password Recovery Flow Tests', () => {
  // Setup common mocks
  const mockRouter = {
    push: jest.fn()
  };
  
  const mockAuthContext = {
    isAuthenticated: false,
    loading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
    useAuth.mockReturnValue(mockAuthContext);
    
    // Set up additional MSW handlers specific to password recovery
    server.use(
      // Password reset request handler
      http.post("/api/auth/password-recovery", async ({ request }) => {
        const body = await request.json();
        
        if (!body.email) {
          return new HttpResponse(JSON.stringify({ error: "Email is required" }), { 
            status: 400 
          });
        }
        
        return HttpResponse.json({ 
          message: "Password reset instructions sent" 
        });
      }),
      
      // Password reset confirmation handler
      http.post("/api/auth/password-recovery/confirm", async ({ request }) => {
        const body = await request.json();
        
        if (!body.email || !body.password || !body.token) {
          return new HttpResponse(JSON.stringify({ 
            error: "Email, password, and token are required" 
          }), { 
            status: 400 
          });
        }
        
        return HttpResponse.json({ 
          message: "Password has been reset successfully" 
        });
      })
    );
  });

  describe('Password Reset Request Page', () => {
    test('renders the password reset request form', () => {
      render(<ResetPasswordPage />);
      
      expect(screen.getByText('PASSWORD RECOVERY')).toBeInTheDocument();
      expect(screen.getByText('RECOVER ACCESS')).toBeInTheDocument();
      expect(screen.getByLabelText(/EMAIL/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /SEND RESET LINK/i })).toBeInTheDocument();
    });

    test('redirects to profile if already authenticated', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false
      });
      
      render(<ResetPasswordPage />);
      
      expect(mockRouter.push).toHaveBeenCalledWith('/profile');
    });

    test('validates email input', async () => {
      render(<ResetPasswordPage />);
      
      const emailInput = screen.getByLabelText(/EMAIL/i);
      const submitButton = screen.getByRole('button', { name: /SEND RESET LINK/i });
      
      // Test empty email
      fireEvent.change(emailInput, { target: { value: '' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      });
      
      // Test invalid email format
      fireEvent.change(emailInput, { target: { value: 'invalidemail' } });
      
      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    test('submits the form successfully', async () => {
      render(<ResetPasswordPage />);
      
      const emailInput = screen.getByLabelText(/EMAIL/i);
      const submitButton = screen.getByRole('button', { name: /SEND RESET LINK/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Password reset instructions have been sent/i)).toBeInTheDocument();
      });
    });

    test('shows error message on failed request', async () => {
      // Override the handler for just this test
      server.use(
        http.post("/api/auth/password-recovery", () => {
          return new HttpResponse(JSON.stringify({ error: "Failed to send reset email" }), { 
            status: 500 
          });
        })
      );
      
      render(<ResetPasswordPage />);
      
      const emailInput = screen.getByLabelText(/EMAIL/i);
      const submitButton = screen.getByRole('button', { name: /SEND RESET LINK/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to send reset email/i)).toBeInTheDocument();
      });
    });
  });

  describe('Password Reset Confirmation Page', () => {
    beforeEach(() => {
      // Mock hash-based token for confirm page
      window.location.hash = '#access_token=test-token';
      
      // Mock window.location.hash property
      Object.defineProperty(window, 'location', {
        value: {
          hash: '#access_token=test-token',
          pathname: '/reset_password/confirm',
        },
        writable: true,
      });
      
      // Create a global.crypto.subtle mock since it's used in the component
      Object.defineProperty(global, 'crypto', {
        value: {
          subtle: {
            digest: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
          },
        },
      });
    });

    test('renders the password reset confirmation form', async () => {
      render(<ConfirmResetPage />);
      
      // Wait for the component to process the hash
      await waitFor(() => {
        expect(screen.getByLabelText(/EMAIL/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/NEW PASSWORD/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/CONFIRM PASSWORD/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /RESET PASSWORD/i })).toBeInTheDocument();
      });
    });

    test('validates all fields', async () => {
      render(<ConfirmResetPage />);
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /RESET PASSWORD/i });
        fireEvent.click(submitButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
      });
    });

    test('validates password requirements', async () => {
      render(<ConfirmResetPage />);
      
      await waitFor(() => {
        const emailInput = screen.getByLabelText(/EMAIL/i);
        const passwordInput = screen.getByLabelText(/NEW PASSWORD/i);
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'weak' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
      });
      
      await waitFor(() => {
        const passwordInput = screen.getByLabelText(/NEW PASSWORD/i);
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Password must contain at least one uppercase letter/i)).toBeInTheDocument();
      });
    });

    test('validates passwords match', async () => {
      render(<ConfirmResetPage />);
      
      await waitFor(() => {
        const emailInput = screen.getByLabelText(/EMAIL/i);
        const passwordInput = screen.getByLabelText(/NEW PASSWORD/i);
        const confirmPasswordInput = screen.getByLabelText(/CONFIRM PASSWORD/i);
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123!' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
      });
    });

    test('submits the form successfully', async () => {
      render(<ConfirmResetPage />);
      
      await waitFor(() => {
        const emailInput = screen.getByLabelText(/EMAIL/i);
        const passwordInput = screen.getByLabelText(/NEW PASSWORD/i);
        const confirmPasswordInput = screen.getByLabelText(/CONFIRM PASSWORD/i);
        const submitButton = screen.getByRole('button', { name: /RESET PASSWORD/i });
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPassword123!' } });
        fireEvent.click(submitButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Your password has been successfully reset/i)).toBeInTheDocument();
      });
    });

    test('shows error message on failed password reset', async () => {
      // Override the handler for just this test
      server.use(
        http.post("/api/auth/password-recovery/confirm", () => {
          return new HttpResponse(JSON.stringify({ error: "Invalid token" }), { 
            status: 401 
          });
        })
      );
      
      render(<ConfirmResetPage />);
      
      await waitFor(() => {
        const emailInput = screen.getByLabelText(/EMAIL/i);
        const passwordInput = screen.getByLabelText(/NEW PASSWORD/i);
        const confirmPasswordInput = screen.getByLabelText(/CONFIRM PASSWORD/i);
        const submitButton = screen.getByRole('button', { name: /RESET PASSWORD/i });
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPassword123!' } });
        fireEvent.click(submitButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Invalid token/i)).toBeInTheDocument();
      });
    });
  });
});
