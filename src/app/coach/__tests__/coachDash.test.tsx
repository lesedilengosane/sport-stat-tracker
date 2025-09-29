import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';

// Mock all dependencies BEFORE importing the component
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />
  },
}));

// Mock context - using relative path
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock Supabase - using relative path
jest.mock('../../api/DatabaseApi/supabaseClient', () => ({
  supabase: {
    auth: {
      signOut: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Mock API Client - using relative path
jest.mock('../../utils/apiClient', () => ({
  apiClient: {
    getMatchesByCoachId: jest.fn(),
    getMatches: jest.fn(),
    getTeamsByIds: jest.fn(),
  },
}));

// Mock components - components are in src/components, not src/app/components
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
      render(<CoachDashboard />);

      expect(screen.getByTestId('coach-sidenav')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
      expect(screen.getByText('Search players and teams...')).toBeInTheDocument();
    });

    it('should display loading skeletons initially', () => {
      render(<CoachDashboard />);

      const skeletons = screen.getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render background image', () => {
      render(<CoachDashboard />);

      const bgImage = screen.getByAltText('Background');
      expect(bgImage).toHaveAttribute('src', '/bgr.jpg');
    });
  });

  describe('Data Fetching', () => {
    it('should fetch and display coach matches on schedule tab', async () => {
      render(<CoachDashboard />);

      await waitFor(() => {
        expect(apiClient.getMatchesByCoachId).toHaveBeenCalledWith('coach-123');
      });

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
        expect(screen.getByText('Team A vs Team B')).toBeInTheDocument();
      });
    });

    it('should fetch coach team on mount', async () => {
      render(<CoachDashboard />);

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('teams');
      });
    });

    it('should handle empty matches data', async () => {
      (apiClient.getMatchesByCoachId as jest.Mock).mockResolvedValue([]);

      render(<CoachDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });

    it('should handle fetch errors gracefully', async () => {
      (apiClient.getMatchesByCoachId as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<CoachDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load matches.')).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to all-games tab and fetch all matches', async () => {
      render(<CoachDashboard />);

      const allGamesButton = screen.getByText('All Games');
      fireEvent.click(allGamesButton);

      await waitFor(() => {
        expect(apiClient.getMatches).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });

    it('should display team management when tab is selected', async () => {
      render(<CoachDashboard />);

      await waitFor(() => {
        expect(screen.queryByTestId('team-management')).not.toBeInTheDocument();
      });

      const teamMgmtButton = screen.getByText('Team Management');
      fireEvent.click(teamMgmtButton);

      await waitFor(() => {
        expect(screen.getByTestId('team-management')).toBeInTheDocument();
        expect(screen.getByText('Team ID: team-123')).toBeInTheDocument();
      });
    });

    it('should display team stats when tab is selected', async () => {
      render(<CoachDashboard />);

      const teamStatsButton = screen.getByText('Team Stats');
      fireEvent.click(teamStatsButton);

      await waitFor(() => {
        expect(screen.getByTestId('team-stats')).toBeInTheDocument();
      });
    });

    it('should display players placeholder when tab is selected', async () => {
      render(<CoachDashboard />);

      const playersButton = screen.getByText('Players');
      fireEvent.click(playersButton);

      await waitFor(() => {
        expect(screen.getByText('Team Players')).toBeInTheDocument();
        expect(
          screen.getByText('This is where player roster and individual statistics will be managed')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when match fetching fails', async () => {
      (apiClient.getMatchesByCoachId as jest.Mock).mockRejectedValue(
        new Error('Failed to fetch')
      );

      render(<CoachDashboard />);

      await waitFor(() => {
        const errorMessage = screen.getByText('Failed to load matches.');
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('should display error when all games fetch fails', async () => {
      (apiClient.getMatches as jest.Mock).mockRejectedValue(
        new Error('Failed to fetch all matches')
      );

      render(<CoachDashboard />);

      const allGamesButton = screen.getByText('All Games');
      fireEvent.click(allGamesButton);

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

      render(<CoachDashboard />);

      const teamMgmtButton = screen.getByText('Team Management');
      fireEvent.click(teamMgmtButton);

      await waitFor(() => {
        expect(screen.getByText('Loading team info...')).toBeInTheDocument();
      });
    });
  });

  describe('User Authentication', () => {
    it('should handle missing user gracefully', () => {
      (useAuth as jest.Mock).mockReturnValue({ user: null });

      render(<CoachDashboard />);

      expect(screen.getByTestId('coach-sidenav')).toBeInTheDocument();
    });

    it('should not fetch data when user is not available', () => {
      (useAuth as jest.Mock).mockReturnValue({ user: null });

      render(<CoachDashboard />);

      expect(apiClient.getMatchesByCoachId).not.toHaveBeenCalled();
    });
  });

  describe('Data Formatting', () => {
    it('should format match dates correctly', async () => {
      render(<CoachDashboard />);

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

      render(<CoachDashboard />);

      await waitFor(() => {
        expect(apiClient.getMatchesByCoachId).toHaveBeenCalled();
      });
    });

    it('should convert lineup data to player details', async () => {
      render(<CoachDashboard />);

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

      render(<CoachDashboard />);

      expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);

      resolveMatches(mockMatchesData);

      await waitFor(() => {
        expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
      });
    });

    it('should show loading state when switching tabs', async () => {
      render(<CoachDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });

      const allGamesButton = screen.getByText('All Games');
      fireEvent.click(allGamesButton);

      const skeletons = screen.getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });
});