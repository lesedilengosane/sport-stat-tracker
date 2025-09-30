import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import UserProfile from "../page";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../../api/DatabaseApi/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Import after mocking
const { useAuth } = require("../../../context/AuthContext");
const { supabase } = require("../../../api/DatabaseApi/supabaseClient");

// Mock fetch globally
global.fetch = jest.fn();

describe("UserProfile Component", () => {
  const mockPush = jest.fn();
  const mockUser = { id: "auth-user-123" };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: mockUser } },
    });
  });

  describe("Loading State", () => {
    it("should display loading message initially", () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      render(<UserProfile />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("User Info Display - Player Role", () => {
    it("should display player user info correctly", async () => {
      const mockUserInfo = {
        exists: true,
        user_id: "user-123",
        first_name: "John",
        last_name: "Doe",
        role: "Player",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserInfo,
      });

      render(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      expect(screen.getByText("Player")).toBeInTheDocument();
      expect(screen.queryByText("Create Team")).not.toBeInTheDocument();
    });
  });

  describe("User Info Display - Coach Role", () => {
    it("should display coach info without team", async () => {
      const mockUserInfo = {
        exists: true,
        user_id: "coach-123",
        first_name: "Mike",
        last_name: "Smith",
        role: "Coach",
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUserInfo,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ team_id: null, team_name: null }),
        });

      render(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText("Mike Smith")).toBeInTheDocument();
      });

      expect(screen.getByText("Coach")).toBeInTheDocument();
      expect(screen.getByText("No team assigned")).toBeInTheDocument();
      expect(screen.getByText("Create Team")).toBeInTheDocument();
      expect(screen.queryByText("Go to Coach Dashboard")).not.toBeInTheDocument();
    });

    it("should display coach info with team", async () => {
      const mockUserInfo = {
        exists: true,
        user_id: "coach-123",
        first_name: "Mike",
        last_name: "Smith",
        role: "Coach",
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUserInfo,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ team_id: "team-456", team_name: "Lakers" }),
        });

      render(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText("Mike Smith")).toBeInTheDocument();
      });

      expect(screen.getByText("Lakers")).toBeInTheDocument();
      expect(screen.getByText("Go to Coach Dashboard")).toBeInTheDocument();
    });
  });

  describe("Create Team Modal", () => {
    beforeEach(async () => {
      const mockUserInfo = {
        exists: true,
        user_id: "coach-123",
        first_name: "Mike",
        last_name: "Smith",
        role: "Coach",
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUserInfo,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ team_id: null, team_name: null }),
        });
    });

    it("should open create team modal when button clicked", async () => {
      render(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText("Create Team")).toBeInTheDocument();
      });

      const createButton = screen.getByText("Create Team");
      fireEvent.click(createButton);

      expect(screen.getByText("Create Your Team")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter team name")).toBeInTheDocument();
    });

    it("should handle team creation successfully", async () => {
      render(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText("Create Team")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Create Team"));

      const teamNameInput = screen.getByPlaceholderText("Enter team name");
      await userEvent.type(teamNameInput, "Warriors");

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ team_id: "team-789", team_name: "Warriors" }),
        });

      const submitButton = screen.getByRole("button", { name: /create team/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/coach/create-team",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              team_name: "Warriors",
              coach_id: "coach-123",
            }),
          })
        );
      });
    });

    it("should disable create button when team name is empty", async () => {
      render(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText("Create Team")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Create Team"));

      const submitButton = screen.getByRole("button", { name: /create team/i });
      expect(submitButton).toBeDisabled();
    });

    it("should handle team creation error", async () => {
      const alertMock = jest.spyOn(window, "alert").mockImplementation();

      render(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText("Create Team")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Create Team"));

      const teamNameInput = screen.getByPlaceholderText("Enter team name");
      await userEvent.type(teamNameInput, "Warriors");

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Team already exists" }),
      });

      const submitButton = screen.getByRole("button", { name: /create team/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalled();
      });

      alertMock.mockRestore();
    });
  });

  describe("Navigation", () => {
    it("should navigate to coach dashboard when button clicked", async () => {
      const mockUserInfo = {
        exists: true,
        user_id: "coach-123",
        first_name: "Mike",
        last_name: "Smith",
        role: "Coach",
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUserInfo,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ team_id: "team-456", team_name: "Lakers" }),
        });

      render(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText("Go to Coach Dashboard")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Go to Coach Dashboard"));
      expect(mockPush).toHaveBeenCalledWith("/coach");
    });
  });

  describe("Error Handling", () => {
    it("should handle no session error", async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: null },
      });

      render(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText("No user info found.")).toBeInTheDocument();
      });
    });

    it("should handle fetch user info error", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      render(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText("No user info found.")).toBeInTheDocument();
      });
    });

    it("should handle non-existent user", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ exists: false }),
      });

      render(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText("No user info found.")).toBeInTheDocument();
      });
    });
  });

  describe("Animation States", () => {
    it("should initialize with animation timers", async () => {
      jest.useFakeTimers();

      const mockUserInfo = {
        exists: true,
        user_id: "user-123",
        first_name: "John",
        last_name: "Doe",
        role: "Player",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserInfo,
      });

      render(<UserProfile />);

      jest.advanceTimersByTime(500);
      jest.advanceTimersByTime(1400);

      jest.useRealTimers();
    });
  });
});