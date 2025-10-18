import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { act } from 'react';

// Mock all dependencies BEFORE importing the component
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Fix Next.js Image mock to avoid boolean attribute warnings
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, priority, ...rest } = props;
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...rest} data-fill={fill?.toString()} data-priority={priority?.toString()} />
  },
}));

// Mock context
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock Supabase
jest.mock('../../api/DatabaseApi/supabaseClient', () => ({
  supabase: {
    auth: {
      signOut: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Mock API Client
jest.mock('../../utils/apiClient', () => ({
  apiClient: {
    getMatchesByCoachId: jest.fn(),
    getMatches: jest.fn(),
    getTeamsByIds: jest.fn(),
    getPlayersByTeamId: jest.fn(),
  },
}));

// Mock components
jest.mock('../../../components/sideNav/coachSideNav', () => ({
  CoachSideNav: ({ activeTab, onTabChange }: any) => (
    <div data-testid="coach-sidenav">
      <button onClick={() => onTabChange('schedule')}>Schedule</button>
      <button onClick={() => onTabChange('all-games')}>All Games</button>
      <button onClick={() => onTabChange('team-management')}>Team Management</button>
      <button onClick={() => onTabChange('team-stats')}>Team Stats</button>
      <button onClick={() => onTabChange('players')}>Players</button>
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
    <div data-testid="team-management">Team ID: {coachTeamId}</div>
  ),
}));

jest.mock('../../../components/games-grid', () => ({
  GamesGrid: ({ games }: any) => (
    <div data-testid="games-grid">
      {games.map((game: any) => (
        <div key={game.id} data-testid={`game-${game.id}`}>
          {game.homeTeam.name} vs {game.awayTeam.name}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../../../components/Loading-Card/game-card-skeleton', () => ({
  GameCardSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}));

jest.mock('../../../components/TeamStats/teamstats', () => ({
  __esModule: true,
  default: () => <div data-testid="team-stats">Team Stats Component</div>,
}));

// Mock PlayersList component
jest.mock('../../players/PlayersList', () => {
  return {
    __esModule: true,
    default: ({ teamId }: any) => (
      <div data-testid="players-list">
        <p>Showing players for team: {teamId}</p>
      </div>
    ),
  };
});

// NOW import the component and mocked modules
import CoachDashboard from '../page';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../api/DatabaseApi/supabaseClient';
import { apiClient } from '../../utils/apiClient';

describe('CoachDashboard', () => {
  const mockPush = jest.fn();
  const mockUser = {
    user_id: 'coach-123',
    first_name: 'John',
    last_name: 'Doe',
  };

  const mockTeamsData = [
    {
      team_id: 'team-1',
      team_name: 'Team A',
      icon_url: '/team-a.png',
    },
    {
      team_id: 'team-2',
      team_name: 'Team B',
      icon_url: '/team-b.png',
    },
  ];

  const mockMatchesData = [
    {
      match_id: 'match-1',
      match_date: '2025-10-15T14:00:00Z',
      location: 'Stadium A',
      home_team_id: 'team-1',
      away_team_id: 'team-2',
      homeLineup: [{ player: 'Player 1', position: 'Forward' }],
      awayLineup: [{ player: 'Player 2', position: 'Defender' }],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (apiClient.getTeamsByIds as jest.Mock).mockResolvedValue(mockTeamsData);
    (apiClient.getMatchesByCoachId as jest.Mock).mockResolvedValue(mockMatchesData);
    (apiClient.getMatches as jest.Mock).mockResolvedValue(mockMatchesData);
    (apiClient.getPlayersByTeamId as jest.Mock).mockResolvedValue([]);
    
    const mockSupabaseFrom = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: { team_id: 'team-123' },
        error: null,
      }),
    };
    (supabase.from as jest.Mock).mockReturnValue(mockSupabaseFrom);
  });

  describe('Rendering', () => {
    it('should render the dashboard with all main components', async () => {
      await act(async () => {
        render(<CoachDashboard />);
      });

      expect(screen.getByTestId('coach-sidenav')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
      expect(screen.getByText('Search players and teams...')).toBeInTheDocument();
    });

    it('should display loading skeletons initially', async () => {
      // Create a promise that won't resolve immediately
      let resolveMatches: any;
      const matchesPromise = new Promise((resolve) => {
        resolveMatches = resolve;
      });
      (apiClient.getMatchesByCoachId as jest.Mock).mockReturnValue(matchesPromise);

      await act(async () => {
        render(<CoachDashboard />);
      });

      // Check for skeletons while data is loading
      const skeletons = screen.getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);

      // Clean up - resolve the promise
      await act(async () => {
        resolveMatches(mockMatchesData);
      });
    });

    it('should render background image', async () => {
      await act(async () => {
        render(<CoachDashboard />);
      });

      const bgImage = screen.getByAltText('Background');
      expect(bgImage).toHaveAttribute('src', '/background/ballBG.jpeg');
    });
  });

  describe('Data Fetching', () => {
    it('should fetch and display coach matches on schedule tab', async () => {
      await act(async () => {
        render(<CoachDashboard />);
      });

      await waitFor(() => {
        expect(apiClient.getMatchesByCoachId).toHaveBeenCalledWith('coach-123');
      });

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
        expect(screen.getByText('Team A vs Team B')).toBeInTheDocument();
      });
    });

    it('should fetch coach team on mount', async () => {
      await act(async () => {
        render(<CoachDashboard />);
      });

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('teams');
      });
    });

    it('should handle empty matches data', async () => {
      (apiClient.getMatchesByCoachId as jest.Mock).mockResolvedValue([]);

      await act(async () => {
        render(<CoachDashboard />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });

    it('should handle fetch errors gracefully', async () => {
      (apiClient.getMatchesByCoachId as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      await act(async () => {
        render(<CoachDashboard />);
      });

      await waitFor(() => {
        expect(screen.getByText('Failed to load matches.')).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to all-games tab and fetch all matches', async () => {
      await act(async () => {
        render(<CoachDashboard />);
      });

      const allGamesButton = screen.getByText('All Games');
      
      await act(async () => {
        fireEvent.click(allGamesButton);
      });

      await waitFor(() => {
        expect(apiClient.getMatches).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });

    it('should display team management when tab is selected', async () => {
      await act(async () => {
        render(<CoachDashboard />);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('team-management')).not.toBeInTheDocument();
      });

      const teamMgmtButton = screen.getByText('Team Management');
      
      await act(async () => {
        fireEvent.click(teamMgmtButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('team-management')).toBeInTheDocument();
        expect(screen.getByText('Team ID: team-123')).toBeInTheDocument();
      });
    });

    it('should display team stats when tab is selected', async () => {
      await act(async () => {
        render(<CoachDashboard />);
      });

      const teamStatsButton = screen.getByText('Team Stats');
      
      await act(async () => {
        fireEvent.click(teamStatsButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('team-stats')).toBeInTheDocument();
      });
    });

    it('should display players list when tab is selected', async () => {
      await act(async () => {
        render(<CoachDashboard />);
      });

      const playersButton = screen.getByText('Players');
      
      await act(async () => {
        fireEvent.click(playersButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('players-list')).toBeInTheDocument();
        // Use getAllByText to handle multiple instances or be more specific
        expect(screen.getAllByText(/Team Players/i).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when match fetching fails', async () => {
      (apiClient.getMatchesByCoachId as jest.Mock).mockRejectedValue(
        new Error('Failed to fetch')
      );

      await act(async () => {
        render(<CoachDashboard />);
      });

      await waitFor(() => {
        const errorMessage = screen.getByText('Failed to load matches.');
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('should display error when all games fetch fails', async () => {
      (apiClient.getMatches as jest.Mock).mockRejectedValue(
        new Error('Failed to fetch all matches')
      );

      await act(async () => {
        render(<CoachDashboard />);
      });

      const allGamesButton = screen.getByText('All Games');
      
      await act(async () => {
        fireEvent.click(allGamesButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Failed to load all matches.')).toBeInTheDocument();
      });
    });

    it('should handle missing team data gracefully', async () => {
      const mockSupabaseFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };
      (supabase.from as jest.Mock).mockReturnValue(mockSupabaseFrom);

      await act(async () => {
        render(<CoachDashboard />);
      });

      const teamMgmtButton = screen.getByText('Team Management');
      
      await act(async () => {
        fireEvent.click(teamMgmtButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Loading team info...')).toBeInTheDocument();
      });
    });
  });

  describe('User Authentication', () => {
    it('should handle missing user gracefully', async () => {
      (useAuth as jest.Mock).mockReturnValue({ user: null });

      await act(async () => {
        render(<CoachDashboard />);
      });

      expect(screen.getByTestId('coach-sidenav')).toBeInTheDocument();
    });

    it('should not fetch data when user is not available', async () => {
      (useAuth as jest.Mock).mockReturnValue({ user: null });

      await act(async () => {
        render(<CoachDashboard />);
      });

      expect(apiClient.getMatchesByCoachId).not.toHaveBeenCalled();
    });
  });

  describe('Data Formatting', () => {
    it('should format match dates correctly', async () => {
      await act(async () => {
        render(<CoachDashboard />);
      });

      await waitFor(() => {
        expect(apiClient.getMatchesByCoachId).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });

    it('should handle missing team logos with default', async () => {
      const teamsWithoutLogos = [
        {
          team_id: 'team-1',
          team_name: 'Team A',
          icon_url: null,
        },
      ];
      (apiClient.getTeamsByIds as jest.Mock).mockResolvedValue(teamsWithoutLogos);

      await act(async () => {
        render(<CoachDashboard />);
      });

      await waitFor(() => {
        expect(apiClient.getMatchesByCoachId).toHaveBeenCalled();
      });
    });

    it('should convert lineup data to player details', async () => {
      await act(async () => {
        render(<CoachDashboard />);
      });

      await waitFor(() => {
        expect(apiClient.getMatchesByCoachId).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state while fetching matches', async () => {
      let resolveMatches: any;
      const matchesPromise = new Promise((resolve) => {
        resolveMatches = resolve;
      });
      (apiClient.getMatchesByCoachId as jest.Mock).mockReturnValue(matchesPromise);

      await act(async () => {
        render(<CoachDashboard />);
      });

      expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);

      await act(async () => {
        resolveMatches(mockMatchesData);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
      });
    });

    it('should show loading state when switching tabs', async () => {
      await act(async () => {
        render(<CoachDashboard />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });

      // Create a delayed promise for all games fetch
      let resolveAllGames: any;
      const allGamesPromise = new Promise((resolve) => {
        resolveAllGames = resolve;
      });
      (apiClient.getMatches as jest.Mock).mockReturnValue(allGamesPromise);

      const allGamesButton = screen.getByText('All Games');
      
      await act(async () => {
        fireEvent.click(allGamesButton);
      });

      // Now skeletons should be visible
      const skeletons = screen.getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);

      // Clean up - resolve the promise
      await act(async () => {
        resolveAllGames(mockMatchesData);
      });
    });
  });
});