import { screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "@/app/page";
import { render } from "@/app/utils/testing/test-utils";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => "/",
}));

jest.mock("next/link", () => {
  return ({ href, children, className, onClick }) => {
    return (
      <a
        href={href}
        className={className}
        onClick={onClick}
        data-testid="mock-link"
      >
        {children}
      </a>
    );
  };
});

jest.mock("@/app/contexts/AuthContext", () => {
  const originalModule = jest.requireActual("@/app/contexts/AuthContext");

  return {
    ...originalModule,
    useAuth: jest.fn().mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
    }),
  };
});

describe("Homepage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders basic page elements correctly", async () => {
    render(<Home />);

    expect(screen.getByText("TECH INCIDENTS DATABASE")).toBeInTheDocument();
    expect(
      screen.getByText("Database loaded successfully.")
    ).toBeInTheDocument();
    expect(screen.getByText("EXPLORE ARCHIVE")).toBeInTheDocument();

    const infoLink = screen.getByText("What is the Tech Incidents Archive?");
    expect(infoLink).toBeInTheDocument();
  });

  it("shows 'guest' in command prompt when unauthenticated", async () => {
    const { useAuth } = require("@/app/contexts/AuthContext");
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getAllByText(/guest@archive:~\$/)[0]).toBeInTheDocument();
    });

    expect(screen.getByText("Access level: PUBLIC")).toBeInTheDocument();
    expect(
      screen.getByText("YOU MAY EXAMINE THE ARTIFACTS")
    ).toBeInTheDocument();
  });

  it("shows display name in command prompt when authenticated", async () => {
    const { useAuth } = require("@/app/contexts/AuthContext");
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { email: "test@example.com", displayName: "TestUser" },
      loading: false,
    });

    render(<Home />);

    await waitFor(() => {
      expect(
        screen.getAllByText(/TestUser@archive:~\$/)[0]
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Access level: MEMBER")).toBeInTheDocument();
    expect(
      screen.getByText("YOU MAY EXAMINE AND CONTRIBUTE TO THE ARTIFACTS")
    ).toBeInTheDocument();
  });

  it("displays loading state during authentication check", async () => {
    const { useAuth } = require("@/app/contexts/AuthContext");
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: true,
    });

    render(<Home />);

    expect(screen.getByText("Verifying credentials...")).toBeInTheDocument();
  });

  it("opens info modal when 'What is' link is clicked", async () => {
    render(<Home />);

    const learnMoreButton = screen.getByText(
      "What is the Tech Incidents Archive?"
    );
    fireEvent.click(learnMoreButton);

    expect(
      screen.getByText(/The Tech Incidents Archive is a digital museum/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Y2K Bug/)).toBeInTheDocument();

    const closeButton = screen.getByText("Close");
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByText(/The Tech Incidents Archive is a digital museum/)
      ).not.toBeInTheDocument();
    });
  });

  it("changes donation button text when clicked", async () => {
    render(<Home />);

    const dismissButton = screen.getByText("Maybe Later");
    fireEvent.click(dismissButton);

    expect(screen.getByText("Donate £100")).toBeInTheDocument();
    expect(screen.getByText("Donate £100").className).toContain(
      "donate big-donate"
    );
  });

  it("navigates to gallery when 'EXPLORE ARCHIVE' button is clicked", () => {
    render(<Home />);

    const exploreButton = screen.getByText("EXPLORE ARCHIVE");
    const exploreLink = exploreButton.closest("a");

    expect(exploreLink).toHaveAttribute("href", "/gallery");
  });
});
