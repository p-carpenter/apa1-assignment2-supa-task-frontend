import { screen, fireEvent, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import Catalog from "@/app/catalog/page";
import { mockIncidents, render, server } from "@/app/utils/testing/test-utils";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/catalog",
  useSearchParams: () => ({
    get: jest.fn(),
    toString: jest.fn(),
  }),
}));

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

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Catalog Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders catalog page basic elements correctly", async () => {
    render(<Catalog />);

    expect(screen.getByText("TECH INCIDENTS DATABASE")).toBeInTheDocument();
    expect(screen.getByText("CATALOG VIEW")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Found incidents/)).toBeInTheDocument();
    });
  });

  it("displays incidents in the grid", async () => {
    render(<Catalog />);

    await waitFor(() => {
      expect(screen.getByText("Mock Incident 1")).toBeInTheDocument();
      expect(screen.getByText("Mock Incident 2")).toBeInTheDocument();
    });
  });

  it("shows 'guest' prompt when user is not authenticated", async () => {
    const { useAuth } = require("@/app/contexts/AuthContext");
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
    });

    render(<Catalog />);

    await waitFor(() => {
      expect(screen.getByText(/guest@archive:~\$/)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText("Add New")).not.toBeInTheDocument();
      expect(screen.queryByText("Select")).not.toBeInTheDocument();
    });
  });

  it("shows display name in command prompt when authenticated", async () => {
    const { useAuth } = require("@/app/contexts/AuthContext");
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { email: "test@example.com", displayName: "TestUser" },
      loading: false,
    });

    render(<Catalog />);

    await waitFor(() => {
      expect(screen.getByText(/TestUser@archive:~\$/)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Add New")).toBeInTheDocument();
      expect(screen.getByText("Select")).toBeInTheDocument();
    });
  });

  it("filters incidents when search query is entered", async () => {
    render(<Catalog />);

    await waitFor(() => {
      expect(screen.getByText("Mock Incident 1")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search incidents/i);
    fireEvent.change(searchInput, { target: { value: "Hardware" } });

    await waitFor(() => {
      expect(screen.getByText("Mock Incident 2")).toBeInTheDocument();

      expect(screen.queryByText("Mock Incident 1")).not.toBeInTheDocument();
    });
  });

  it("allows incident selection when authenticated", async () => {
    const { useAuth } = require("@/app/contexts/AuthContext");
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { email: "test@example.com", displayName: "TestUser" },
      loading: false,
    });

    render(<Catalog />);

    await waitFor(() => {
      expect(screen.getByText("Select")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Select"));

    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText(/Delete \(0\)/)).toBeInTheDocument();
      expect(screen.getByText(/Edit \(0\)/)).toBeInTheDocument();
    });

    const incidentElements = screen.getAllByText(/Mock Incident/);
    fireEvent.click(incidentElements[0]);

    await waitFor(() => {
      expect(screen.getByText(/Delete \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Edit \(1\)/)).toBeInTheDocument();
    });
  });

  it("opens Add Incident modal when Add New button is clicked", async () => {
    const { useAuth } = require("@/app/contexts/AuthContext");
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { email: "test@example.com", displayName: "TestUser" },
      loading: false,
    });

    render(<Catalog />);

    await waitFor(() => {
      expect(screen.getByText("Add New")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Add New"));

    await waitFor(() => {
      expect(
        screen.getByText("Add New Technical Incident")
      ).toBeInTheDocument();
    });
  });

  it("toggles selection mode correctly", async () => {
    const { useAuth } = require("@/app/contexts/AuthContext");
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { email: "test@example.com", displayName: "TestUser" },
      loading: false,
    });

    render(<Catalog />);

    await waitFor(() => {
      expect(screen.getByText("Select")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Select"));

    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Cancel"));

    await waitFor(() => {
      expect(screen.getByText("Select")).toBeInTheDocument();
    });
  });

  it("sorts incidents when sort order is changed", async () => {
    render(<Catalog />);

    await waitFor(() => {
      expect(screen.getByText("Mock Incident 1")).toBeInTheDocument();
    });

    const sortDropdown = screen.getByRole("combobox");

    fireEvent.change(sortDropdown, { target: { value: "name-asc" } });

    await waitFor(() => {
      expect(screen.getByText("Mock Incident 1")).toBeInTheDocument();
      expect(screen.getByText("Mock Incident 2")).toBeInTheDocument();
    });
  });
});
