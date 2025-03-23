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

  it("navigates to register page when 'Contribute to the Archive' link is clicked when unauthenticated", () => {
    const { useAuth } = require("@/app/contexts/AuthContext");
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: { email: "test@example.com", displayName: "TestUser" },
      loading: false,
    });
    render(<Home />);

    const registerLink = screen.getByText("Contribute to the Archive");
    const registerElement = registerLink.closest("a");

    fireEvent.click(registerElement);

    expect(registerElement).toHaveAttribute("href", "/signup");
  });

  it("navigates to catalog page when 'Contribute to the Archive' link is clicked when authenticated", () => {
    const { useAuth } = require("@/app/contexts/AuthContext");
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { email: "test@example.com", displayName: "TestUser" },
      loading: false,
    });
    render(<Home />);

    const catalogLink = screen.getByText("Contribute to the Archive");
    const catalogElement = catalogLink.closest("a");

    fireEvent.click(catalogElement);

    expect(catalogElement).toHaveAttribute("href", "/catalog");
  });

  it("navigates to gallery when 'EXPLORE ARCHIVE' button is clicked", () => {
    render(<Home />);

    const exploreButton = screen.getByText("EXPLORE ARCHIVE");
    const exploreLink = exploreButton.closest("a");

    expect(exploreLink).toHaveAttribute("href", "/gallery");
  });
});
