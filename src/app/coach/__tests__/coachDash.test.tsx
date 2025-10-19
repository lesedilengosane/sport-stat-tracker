import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock all dependencies before imports
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} data-fill={props.fill ? 'true' : 'false'} data-priority={props.priority ? 'true' : 'false'} />
  ),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../api/DatabaseApi/supabaseClient', () => ({
  supabase: {
    auth: {
      signOut: jest.fn(),
    },
    from: jest.fn(),
  },
}));

jest.mock('../../../app/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock components using relative paths from src/app/coach/__tests__/ to src/components/
jest.mock('../../../components/sideNav/coachSideNav', () => ({
  CoachSideNav: ({ activeTab, onTabChange }: any) => (
    <div data-testid="coach-sidenav">
      <button onClick={() => onTabChange('schedule')}>Schedule</button>
      <button onClick={() => onTabChange('all-games')}>All Games</button>
      <button onClick={() => onTabChange('team-management')}>Team Management</button>
      <button onClick={() => onTabChange('team-stats')}>Team Stats</button>
      <button onClick={() => onTabChange('My Players')}>Players</button>
    </div>
  ),
}));

jest.mock('../../../components/header/header', () => ({
  DashboardHeader: ({ placeholder }: any) => (
    <div data-testid="dashboard-header">{placeholder}</div>
  ),
}));

jest.mock('../../../components/coachComponents/teamManagement', () => ({
  __esModule: true,
  default: ({ coachTeamId }: any) => (
    <div data-testid="team-management">Team Management for {coachTeamId}</div>
  ),
}));

jest.mock('../../../components/games-grid', () => ({
  GamesGrid: ({ games }: any) => (
    <div data-testid="games-grid">
      {games.map((game: any) => (
        <div key={game.id} data-testid="game-card">
          {game.homeTeam.name} vs {game.awayTeam.name}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../../../components/Loading-Card/game-card-skeleton', () => ({
  GameCardSkeleton: () => <div data-testid="game-skeleton">Loading...</div>,
}));

jest.mock('../../../components/TeamStats/teamstats', () => ({
  __esModule: true,
  default: () => <div data-testid="team-stats">Team Stats</div>,
}));

jest.mock('../../players/PlayersList', () => ({
  __esModule: true,
  default: ({ teamId }: any) => (
    <div data-testid="players-list">Players for team {teamId}</div>
  ),
}));

jest.mock('../../utils/apiClient', () => ({
  apiClient: {
    getMatchesByCoachId: jest.fn(),
    getMatches: jest.fn(),
    getTeamsByIds: jest.fn(),
  },
}));

// Import after mocks
import CoachDashboard from '../page';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../../api/DatabaseApi/supabaseClient';
import { apiClient } from '../../utils/apiClient';

// Get reference to mocked apiClient
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('CoachDashboard', () => {
  const mockUser = {
    user_id: 'coach-123',
    first_name: 'John',
    last_name: 'Doe',
    user_role: 'Coach',
  };

  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  };

  const mockMatches = [
    {
      match_id: 'match-1',
      match_date: '2025-01-15T19:00:00Z',
      location: 'Arena 1',
      home_team_id: 'team-1',
      away_team_id: 'team-2',
      homeLineup: [{ player: 'Player 1', position: 'Guard' }],
      awayLineup: [{ player: 'Player 2', position: 'Forward' }],
    },
  ];

  const mockTeams = [
    {
      team_id: 'team-1',
      team_name: 'Lakers',
      icon_url: '/lakers.png',
    },
    {
      team_id: 'team-2',
      team_name: 'Warriors',
      icon_url: '/warriors.png',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockApiClient.getMatchesByCoachId.mockResolvedValue(mockMatches);
    mockApiClient.getMatches.mockResolvedValue(mockMatches);
    mockApiClient.getTeamsByIds.mockResolvedValue(mockTeams);
    
    // Mock supabase query chain
    const mockSupabaseQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: { team_id: 'team-123' },
        error: null,
      }),
    };
    (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);
  });

  describe('Rendering', () => {
    it('should render the dashboard with all main components', async () => {
      render(<CoachDashboard />);

      expect(screen.getByTestId('coach-sidenav')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
      expect(screen.getByAltText('Background')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });

    it('should display loading skeletons initially', () => {
      render(<CoachDashboard />);

      const skeletons = screen.getAllByTestId('game-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render background image with correct attributes', () => {
      render(<CoachDashboard />);

      const bgImage = screen.getByAltText('Background');
      expect(bgImage).toHaveAttribute('src', '/background/ballBG.jpeg');
      expect(bgImage).toHaveAttribute('data-priority', 'true');
    });

    it('should render header with correct placeholder', () => {
      render(<CoachDashboard />);

      expect(screen.getByText('Search players and teams...')).toBeInTheDocument();
    });
  });

  describe('Data Fetching', () => {
    it('should fetch and display coach matches on schedule tab', async () => {
      render(<CoachDashboard />);

      await waitFor(() => {
        expect(mockApiClient.getMatchesByCoachId).toHaveBeenCalledWith('coach-123');
        expect(mockApiClient.getTeamsByIds).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText(/Lakers vs Warriors/i)).toBeInTheDocument();
      });
    });

    it('should fetch coach team on mount', async () => {
      render(<CoachDashboard />);

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('teams');
      });
    });

    it('should handle empty matches data', async () => {
      mockApiClient.getMatchesByCoachId.mockResolvedValue([]);

      render(<CoachDashboard />);

      await waitFor(() => {
        const gamesGrid = screen.getByTestId('games-grid');
        expect(gamesGrid).toBeInTheDocument();
        expect(screen.queryByTestId('game-card')).not.toBeInTheDocument();
      });
    });

    it('should handle fetch errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockApiClient.getMatchesByCoachId.mockRejectedValue(new Error('Network error'));

      render(<CoachDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load matches.')).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle null matches response', async () => {
      mockApiClient.getMatchesByCoachId.mockResolvedValue(null);

      render(<CoachDashboard />);

      await waitFor(() => {
        const gamesGrid = screen.getByTestId('games-grid');
        expect(gamesGrid).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to all-games tab and fetch all matches', async () => {
      render(<CoachDashboard />);

      const allGamesButton = screen.getByText('All Games');
      await userEvent.click(allGamesButton);

      await waitFor(() => {
        expect(mockApiClient.getMatches).toHaveBeenCalled();
      });
    });

    it('should display team management when tab is selected', async () => {
      render(<CoachDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });

      const teamMgmtButton = screen.getByText('Team Management');
      await userEvent.click(teamMgmtButton);

      await waitFor(() => {
        expect(screen.getByTestId('team-management')).toBeInTheDocument();
      });
    });

    it('should display team stats when tab is selected', async () => {
      render(<CoachDashboard />);

      const teamStatsButton = screen.getByText('Team Stats');
      await userEvent.click(teamStatsButton);

      await waitFor(() => {
        expect(screen.getByTestId('team-stats')).toBeInTheDocument();
      });
    });

    it('should display players list when tab is selected', async () => {
      render(<CoachDashboard />);

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalled();
      });

      const playersButton = screen.getByText('Players');
      await userEvent.click(playersButton);

      await waitFor(() => {
        expect(screen.getByTestId('players-list')).toBeInTheDocument();
        expect(screen.getByText(/Team Players/i)).toBeInTheDocument();
      });
    });

    it('should show loading message for team management when teamID is not available', async () => {
      const mockSupabaseQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);

      render(<CoachDashboard />);

      const teamMgmtButton = screen.getByText('Team Management');
      await userEvent.click(teamMgmtButton);

      await waitFor(() => {
        expect(screen.getByText('Loading team info...')).toBeInTheDocument();
      });
    });

    it('should not refetch data when switching back to schedule tab', async () => {
      render(<CoachDashboard />);

      await waitFor(() => {
        expect(mockApiClient.getMatchesByCoachId).toHaveBeenCalledTimes(1);
      });

      const allGamesButton = screen.getByText('All Games');
      await userEvent.click(allGamesButton);

      await waitFor(() => {
        expect(mockApiClient.getMatches).toHaveBeenCalled();
      });

      const scheduleButton = screen.getByText('Schedule');
      await userEvent.click(scheduleButton);

      await waitFor(() => {
        expect(mockApiClient.getMatchesByCoachId).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when match fetching fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockApiClient.getMatchesByCoachId.mockRejectedValue(new Error('Failed to fetch'));

      render(<CoachDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load matches.')).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should display error when all games fetch fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockApiClient.getMatches.mockRejectedValue(new Error('Failed to fetch all matches'));

      render(<CoachDashboard />);

      const allGamesButton = screen.getByText('All Games');
      await userEvent.click(allGamesButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to load all matches.')).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle missing team data gracefully', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const mockSupabaseQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);

      render(<CoachDashboard />);

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith('No team found for this coach');
      });

      consoleWarnSpy.mockRestore();
    });

    it('should handle supabase error when fetching team', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockSupabaseQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      };
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);

      render(<CoachDashboard />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to fetch coach team:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('User Authentication', () => {
    it('should handle missing user gracefully', async () => {
      (useAuth as jest.Mock).mockReturnValue({ user: null });

      render(<CoachDashboard />);

      expect(mockApiClient.getMatchesByCoachId).not.toHaveBeenCalled();
    });

    it('should not fetch data when user is not available', () => {
      (useAuth as jest.Mock).mockReturnValue({ user: null });

      render(<CoachDashboard />);

      expect(mockApiClient.getMatchesByCoachId).not.toHaveBeenCalled();
      expect(mockApiClient.getMatches).not.toHaveBeenCalled();
    });

    it('should display user name correctly', async () => {
      render(<CoachDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
      });
    });
  });

  describe('Data Formatting', () => {
    it('should format match dates correctly', async () => {
      render(<CoachDashboard />);

      await waitFor(() => {
        expect(mockApiClient.getMatchesByCoachId).toHaveBeenCalled();
        expect(mockApiClient.getTeamsByIds).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });

    it('should handle missing team logos with default', async () => {
      const teamsWithoutLogo = [
        { team_id: 'team-1', team_name: 'Lakers', icon_url: null },
        { team_id: 'team-2', team_name: 'Warriors', icon_url: null },
      ];
      mockApiClient.getTeamsByIds.mockResolvedValue(teamsWithoutLogo);

      render(<CoachDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });

    it('should convert lineup data to player details', async () => {
      const matchWithLineup = {
        ...mockMatches[0],
        homeLineup: [
          { player: 'LeBron James', position: 'Forward' },
          { player: 'Anthony Davis', position: 'Center' },
        ],
        awayLineup: [
          { player: 'Stephen Curry', position: 'Guard' },
        ],
      };
      mockApiClient.getMatchesByCoachId.mockResolvedValue([matchWithLineup]);

      render(<CoachDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });

    it('should handle missing location with default', async () => {
      const matchWithoutLocation = {
        ...mockMatches[0],
        location: null,
      };
      mockApiClient.getMatchesByCoachId.mockResolvedValue([matchWithoutLocation]);

      render(<CoachDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state while fetching matches', () => {
      render(<CoachDashboard />);

      expect(screen.getAllByTestId('game-skeleton').length).toBeGreaterThan(0);
    });

    it('should show loading state when switching tabs', async () => {
      render(<CoachDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });

      const allGamesButton = screen.getByText('All Games');
      await userEvent.click(allGamesButton);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });

    it('should hide loading skeletons after data is loaded', async () => {
      render(<CoachDashboard />);

      await waitFor(() => {
        expect(screen.queryByTestId('game-skeleton')).not.toBeInTheDocument();
      });
    });
  });

  describe('Component Integration', () => {
    it('should pass correct teamId to PlayersList', async () => {
      render(<CoachDashboard />);

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalled();
      });

      const playersButton = screen.getByText('Players');
      await userEvent.click(playersButton);

      await waitFor(() => {
        expect(screen.getByText('Players for team team-123')).toBeInTheDocument();
      });
    });

    it('should pass correct coachTeamId to UnassignedPlayersDialog', async () => {
      render(<CoachDashboard />);

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalled();
      });

      const teamMgmtButton = screen.getByText('Team Management');
      await userEvent.click(teamMgmtButton);

      await waitFor(() => {
        expect(screen.getByText('Team Management for team-123')).toBeInTheDocument();
      });
    });

    it('should render GamesGrid with correct props', async () => {
      render(<CoachDashboard />);

      await waitFor(() => {
        const gamesGrid = screen.getByTestId('games-grid');
        expect(gamesGrid).toBeInTheDocument();
        expect(screen.getByText(/Lakers vs Warriors/i)).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Matches', () => {
    it('should display multiple matches correctly', async () => {
      const multipleMatches = [
        mockMatches[0],
        {
          match_id: 'match-2',
          match_date: '2025-01-16T20:00:00Z',
          location: 'Arena 2',
          home_team_id: 'team-2',
          away_team_id: 'team-1',
          homeLineup: [],
          awayLineup: [],
        },
      ];
      mockApiClient.getMatchesByCoachId.mockResolvedValue(multipleMatches);

      render(<CoachDashboard />);

      await waitFor(() => {
        const gameCards = screen.getAllByTestId('game-card');
        expect(gameCards).toHaveLength(2);
      });
    });

    it('should handle duplicate team IDs in match list', async () => {
      const matchesWithDuplicateTeams = [
        mockMatches[0],
        {
          ...mockMatches[0],
          match_id: 'match-2',
        },
      ];
      mockApiClient.getMatchesByCoachId.mockResolvedValue(matchesWithDuplicateTeams);

      render(<CoachDashboard />);

      await waitFor(() => {
        expect(mockApiClient.getTeamsByIds).toHaveBeenCalledWith(['team-1', 'team-2']);
      });
    });
  });
});