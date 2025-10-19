import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TeamStats, { TeamStatsData } from "../teamstats";
import { supabase } from "../../../app/api/DatabaseApi/supabaseClient";

// Mock the child components
jest.mock("../TeamDetails", () => {
  return function MockTeamDetails({ teamName, numPlayers }: any) {
    return (
      <div data-testid="team-details">
        <span data-testid="team-name">{teamName}</span>
        <span data-testid="num-players">{numPlayers}</span>
      </div>
    );
  };
});

jest.mock("../TeamSummary", () => {
  return function MockTeamSummary({ lastFiveGames }: any) {
    return (
      <div data-testid="team-summary">
        {lastFiveGames.length > 0 ? "Has games" : "No games"}
      </div>
    );
  };
});

jest.mock("../PlayerStats", () => {
  return function MockPlayerStats({ playerStats }: any) {
    return (
      <div data-testid="player-stats">
        {playerStats.length > 0 ? "Has players" : "No players"}
      </div>
    );
  };
});

// Mock Supabase client
jest.mock("../../../app/api/DatabaseApi/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

describe("TeamStats Component", () => {
  const mockTeamStatsData: TeamStatsData = {
    team_id: "team-123",
    team_name: "Manchester United",
    num_players: 25,
    last_5_matches: [
      { match_id: 1, result: "W" },
      { match_id: 2, result: "L" },
    ],
    player_stats: [
      { player_id: 1, name: "John Doe", goals: 10 },
      { player_id: 2, name: "Jane Smith", goals: 8 },
    ],
  };

  const mockSession = {
    user: { id: "user-123" },
    access_token: "mock-token",
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    global.fetch = jest.fn();

    // Default mock for Supabase session
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render the component structure", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTeamStatsData,
      });

      render(<TeamStats />);

      await waitFor(() => {
        expect(screen.getByTestId("team-details")).toBeInTheDocument();
        expect(screen.getByTestId("team-summary")).toBeInTheDocument();
        expect(screen.getByTestId("player-stats")).toBeInTheDocument();
      });
    });

    it("should render with default 'Unknown Team' when no data", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => null,
      });

      render(<TeamStats />);

      await waitFor(() => {
        expect(screen.getByTestId("team-name")).toHaveTextContent("Unknown Team");
      });
    });

    it("should render with '-' for numPlayers when no data", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => null,
      });

      render(<TeamStats />);

      await waitFor(() => {
        expect(screen.getByTestId("num-players")).toHaveTextContent("-");
      });
    });
  });

  describe("Data Fetching", () => {
    it("should fetch team stats on mount", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTeamStatsData,
      });

      render(<TeamStats authUserId="user-123" teamId="team-123" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/TeamStats",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              auth_user_id: "user-123",
              team_id: "team-123",
            }),
          })
        );
      });
    });

    it("should fetch session from Supabase", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTeamStatsData,
      });

      render(<TeamStats />);

      await waitFor(() => {
        expect(supabase.auth.getSession).toHaveBeenCalled();
      });
    });

    it("should use Supabase session user id in fetch request", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTeamStatsData,
      });

      render(<TeamStats teamId="team-456" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/TeamStats",
          expect.objectContaining({
            body: JSON.stringify({
              auth_user_id: "user-123",
              team_id: "team-456",
            }),
          })
        );
      });
    });

    it("should update state with fetched data", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTeamStatsData,
      });

      render(<TeamStats />);

      await waitFor(() => {
        expect(screen.getByTestId("team-name")).toHaveTextContent(
          "Manchester United"
        );
        expect(screen.getByTestId("num-players")).toHaveTextContent("25");
      });
    });

    it("should handle fetch errors gracefully", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      render(<TeamStats />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error fetching team stats:",
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it("should render default values on fetch error", async () => {
      jest.spyOn(console, "error").mockImplementation(() => {});
      
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      render(<TeamStats />);

      await waitFor(() => {
        expect(screen.getByTestId("team-name")).toHaveTextContent("Unknown Team");
        expect(screen.getByTestId("num-players")).toHaveTextContent("-");
      });
    });
  });

  describe("Props Handling", () => {
    it("should refetch data when authUserId changes", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTeamStatsData,
      });

      const { rerender } = render(<TeamStats authUserId="user-123" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      rerender(<TeamStats authUserId="user-456" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it("should refetch data when teamId changes", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTeamStatsData,
      });

      const { rerender } = render(<TeamStats teamId="team-123" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      rerender(<TeamStats teamId="team-456" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it("should work without authUserId prop", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTeamStatsData,
      });

      render(<TeamStats teamId="team-123" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/TeamStats",
          expect.objectContaining({
            body: JSON.stringify({
              auth_user_id: "user-123",
              team_id: "team-123",
            }),
          })
        );
      });
    });

    it("should work without teamId prop", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTeamStatsData,
      });

      render(<TeamStats authUserId="user-789" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/TeamStats",
          expect.objectContaining({
            body: JSON.stringify({
              auth_user_id: "user-123",
              team_id: undefined,
            }),
          })
        );
      });
    });
  });

  describe("Child Component Integration", () => {
    it("should pass correct props to TeamDetails", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTeamStatsData,
      });

      render(<TeamStats />);

      await waitFor(() => {
        expect(screen.getByTestId("team-name")).toHaveTextContent(
          "Manchester United"
        );
        expect(screen.getByTestId("num-players")).toHaveTextContent("25");
      });
    });

    it("should pass lastFiveGames to TeamSummary", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTeamStatsData,
      });

      render(<TeamStats />);

      await waitFor(() => {
        expect(screen.getByTestId("team-summary")).toHaveTextContent("Has games");
      });
    });

    it("should pass empty array to TeamSummary when no data", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => null,
      });

      render(<TeamStats />);

      await waitFor(() => {
        expect(screen.getByTestId("team-summary")).toHaveTextContent("No games");
      });
    });

    it("should pass playerStats to PlayerStats", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTeamStatsData,
      });

      render(<TeamStats />);

      await waitFor(() => {
        expect(screen.getByTestId("player-stats")).toHaveTextContent(
          "Has players"
        );
      });
    });

    it("should pass empty array to PlayerStats when no data", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => null,
      });

      render(<TeamStats />);

      await waitFor(() => {
        expect(screen.getByTestId("player-stats")).toHaveTextContent(
          "No players"
        );
      });
    });
  });

  describe("Loading State", () => {
    it("should set loading to true initially", async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => mockTeamStatsData,
                }),
              100
            );
          })
      );

      render(<TeamStats />);

      // Component should render immediately even while loading
      expect(screen.getByTestId("team-details")).toBeInTheDocument();
    });

    it("should set loading to false after successful fetch", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTeamStatsData,
      });

      render(<TeamStats />);

      await waitFor(() => {
        expect(screen.getByTestId("team-name")).toHaveTextContent(
          "Manchester United"
        );
      });
    });

    it("should set loading to false after fetch error", async () => {
      jest.spyOn(console, "error").mockImplementation(() => {});
      
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      render(<TeamStats />);

      await waitFor(() => {
        expect(screen.getByTestId("team-name")).toHaveTextContent("Unknown Team");
      });
    });
  });

  describe("Supabase Session Handling", () => {
    it("should handle null session", async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTeamStatsData,
      });

      render(<TeamStats />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/TeamStats",
          expect.objectContaining({
            body: JSON.stringify({
              auth_user_id: undefined,
              team_id: undefined,
            }),
          })
        );
      });
    });

    it("should handle session error", async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: "Session error" },
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTeamStatsData,
      });

      render(<TeamStats />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe("Component Structure", () => {
    it("should render with correct class names", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTeamStatsData,
      });

      const { container } = render(<TeamStats />);

      await waitFor(() => {
        expect(container.querySelector(".team-stats-root")).toBeInTheDocument();
        expect(container.querySelector(".team-summary")).toBeInTheDocument();
        expect(container.querySelector(".player-stats")).toBeInTheDocument();
      });
    });

    it("should have correct element ids", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTeamStatsData,
      });

      render(<TeamStats />);

      await waitFor(() => {
        expect(screen.getByTestId("team-summary").closest("#team-summary")).toBeInTheDocument();
        expect(screen.getByTestId("player-stats").closest("#player-stats")).toBeInTheDocument();
      });
    });
  });
});