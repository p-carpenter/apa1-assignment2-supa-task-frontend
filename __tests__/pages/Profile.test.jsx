import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import ProfilePage from "@/app/profile/page";
import { useAuth } from "@/app/contexts/AuthContext";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/app/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/app/profile/ProfileInfo", () => ({
  __esModule: true,
  default: () => <div data-testid="profile-info">Profile Info Component</div>,
}));

jest.mock("@/app/components/ui/console", () => ({
  ConsoleWindow: ({ children, title, statusItems }) => (
    <div className="consoleWindow">
      <div className="terminalHeader">
        <div className="terminalTitle">{title}</div>
        <div className="authControls">
          <a className="authButton login" href="/profile">
            Profile: {statusItems[2].text.split(': ')[1]}
          </a>
          <button className="authButton signup">Log Out</button>
        </div>
      </div>
      <div className="consoleContent">{children}</div>
      <div className="consoleFooter">
        {statusItems.map((item, index) => (
          <div key={index} className="statusItem " data-testid="status-item">
            {typeof item === "string" ? item : item.text}
          </div>
        ))}
      </div>
    </div>
  ),
  ConsoleSection: ({ children, command }) => (
    <div className="consoleSection" data-testid="console-section">
      <div className="commandLine">
        <span className="prompt">TestUser@archive:~$</span>
        <span className="command">security</span>
        <span className="parameter">--profile</span>
      </div>
      <h1 className="title">USER PROFILE</h1>
      {children}
    </div>
  ),
  CommandOutput: ({ children, title, showLoadingBar }) => (
    <div className="commandOutput" data-testid="command-output">
      {showLoadingBar && (
        <div className="loadingBar">
          <div className="loadingProgress" />
        </div>
      )}
      {children}
    </div>
  ),
}));

// Mock the button component
jest.mock("@/app/components/ui/buttons", () => ({
  Button: ({ children }) => <button>{children}</button>,
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default auth context mock
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: {
        email: "test@example.com",
        displayName: "TestUser",
      },
    });

    // Default router mock
    useRouter.mockReturnValue({
      push: jest.fn(),
    });
  });

  it("redirects to login if not authenticated", async () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null,
    });

    const pushMock = jest.fn();
    useRouter.mockReturnValue({
      push: pushMock,
    });

    render(<ProfilePage />);

    // Verify redirect
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalled();
    });
  });

  it("displays loading state when authentication is in progress", () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
      user: null,
    });

    render(<ProfilePage />);

    expect(screen.getByText("Authenticating...")).toBeInTheDocument();
  });

  it("renders profile interface when authenticated", () => {
    render(<ProfilePage />);

    expect(screen.getByTestId("console-section")).toBeInTheDocument();
    expect(screen.getByTestId("command-output")).toBeInTheDocument();
    
    expect(
      screen.getByText("Welcome back to the Tech Incidents Archive.")
    ).toBeInTheDocument();
  });

  it("displays username from displayName in status bar", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: {
        email: "test@example.com",
        displayName: "TestUser",
      },
    });

    render(<ProfilePage />);

    const statusItem = screen.getByText("USER: TestUser");
    expect(statusItem).toBeInTheDocument();
  });

  it("displays username from email when displayName is missing", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: {
        email: "another@example.com",
        displayName: null,
      },
    });

    render(<ProfilePage />);

    const statusItem = screen.getByText("USER: another");
    expect(statusItem).toBeInTheDocument();
  });
});
