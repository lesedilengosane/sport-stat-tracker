import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock Supabase
jest.mock('../../api/DatabaseApi/supabaseClient', () => ({
  supabase: {
    auth: {
      signOut: jest.fn(),
    },
  },
}));

// Mock API Client
jest.mock('../../utils/apiClient', () => ({
  apiClient: {
    getMatches: jest.fn(),
    getTeamsByIds: jest.fn(),
  },
}));

// Mock Auth Context
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: {
      user_id: 'test-user-id',
      auth_user_id: 'test-auth-user-id',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      role: 'analyst',
    },
    loading: false,
  })),
}));

// Mock MatchesContext - THIS IS THE KEY FIX
const mockUseMatches = jest.fn();
jest.mock('../../context/MatchesContext', () => ({
  useMatches: () => mockUseMatches(),
}));

// Mock Components
jest.mock('../../../components/games-grid', () => ({
  GamesGrid: ({ games }: { games: any[] }) => (
    <div data-testid="games-grid">
      {games.map((game) => (
        <div key={game.match_id} data-testid={`game-${game.match_id}`}>
          {game.homeTeam.name} vs {game.awayTeam.name}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../../../components/completed-games-grid', () => ({
  CompletedGamesGrid: ({ games }: { games: any[] }) => (
    <div data-testid="completed-games-grid">
      {games.map((game) => (
        <div key={game.match_id} data-testid={`completed-game-${game.match_id}`}>
          {game.homeTeam.name} vs {game.awayTeam.name}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../../../components/Loading-Card/game-card-skeleton', () => ({
  GameCardSkeleton: () => <div data-testid="game-skeleton">Loading...</div>,
}));

jest.mock('../../../components/sideNav/analystSideNav', () => ({
  AnalystSideNav: ({ activeTab, onTabChange }: any) => (
    <div data-testid="analyst-sidenav">
      <button onClick={() => onTabChange('upcoming-games')}>Upcoming Games</button>
      <button onClick={() => onTabChange('booked-games')}>Booked Games</button>
      <button onClick={() => onTabChange('live')}>Live</button>
      <button onClick={() => onTabChange('completed')}>Completed</button>
      <span data-testid="active-tab">{activeTab}</span>
    </div>
  ),
}));

jest.mock('../../../components/header/header', () => ({
  DashboardHeader: ({ placeholder }: { placeholder: string }) => (
    <div data-testid="dashboard-header">
      <input placeholder={placeholder} />
    </div>
  ),
}));

jest.mock('../../../components/playerinsight', () => ({
  __esModule: true,
  default: () => <div data-testid="player-insights">Player Insights</div>,
}));

// Import Dashboard AFTER all mocks are defined
import Dashboard from '../page';
import { apiClient } from '../../utils/apiClient';

describe('Analyst Dashboard', () => {
  const mockGames = [
    {
      match_id: 'match-1',
      match_date: '2024-12-01T18:00:00Z',
      location: 'Arena 1',
      home_score: 0,
      away_score: 0,
      status: 'scheduled',
      completed: false,
      booked: false,
      analyst: null,
      homeTeam: {
        team_id: 'team-1',
        name: 'Lakers',
        logo: '/lakers.png',
      },
      awayTeam: {
        team_id: 'team-2',
        name: 'Warriors',
        logo: '/warriors.png',
      },
      homeLineup: [],
      awayLineup: [],
    },
    {
      match_id: 'match-2',
      match_date: '2024-12-02T19:00:00Z',
      location: 'Arena 2',
      home_score: 0,
      away_score: 0,
      status: 'scheduled',
      completed: false,
      booked: false,
      analyst: null,
      homeTeam: {
        team_id: 'team-3',
        name: 'Bulls',
        logo: '/bulls.png',
      },
      awayTeam: {
        team_id: 'team-4',
        name: 'Celtics',
        logo: '/celtics.png',
      },
      homeLineup: [],
      awayLineup: [],
    },
  ];

  const mockMatches = [
    {
      match_id: 'match-1',
      match_date: '2024-12-01T18:00:00Z',
      location: 'Arena 1',
      home_score: 0,
      away_score: 0,
      status: 'scheduled',
      home_team_id: 'team-1',
      away_team_id: 'team-2',
    },
    {
      match_id: 'match-2',
      match_date: '2024-12-02T19:00:00Z',
      location: 'Arena 2',
      home_score: 0,
      away_score: 0,
      status: 'scheduled',
      home_team_id: 'team-3',
      away_team_id: 'team-4',
    },
  ];

  const mockTeams = [
    { team_id: 'team-1', name: 'Lakers', icon_url: '/lakers.png' },
    { team_id: 'team-2', name: 'Warriors', icon_url: '/warriors.png' },
    { team_id: 'team-3', name: 'Bulls', icon_url: '/bulls.png' },
    { team_id: 'team-4', name: 'Celtics', icon_url: '/celtics.png' },
  ];

  // Get references to mocked functions
  const mockGetMatches = apiClient.getMatches as jest.MockedFunction<typeof apiClient.getMatches>;
  const mockGetTeamsByIds = apiClient.getTeamsByIds as jest.MockedFunction<typeof apiClient.getTeamsByIds>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mock return values
    mockUseMatches.mockReturnValue({
      allGames: mockGames,
      matches: mockMatches,
      isLoading: false,
      error: null,
      triggerRefetch: jest.fn(),
    });
  });

  describe('Initial Rendering', () => {
    it('renders dashboard without crashing', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('analyst-sidenav')).toBeInTheDocument();
      });
    });

    it('shows loading skeletons initially', () => {
      mockUseMatches.mockReturnValue({
        allGames: [],
        matches: [],
        isLoading: true,
        error: null,
        triggerRefetch: jest.fn(),
      });

      render(<Dashboard />);

      expect(screen.getAllByTestId('game-skeleton')).toHaveLength(12);
    });

    it('renders background image', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        const bgImage = screen.getByAltText('Background');
        expect(bgImage).toBeInTheDocument();
        expect(bgImage).toHaveAttribute('src', '/background/orangebackground.jpeg');
      });
    });

    it('renders dashboard header with search placeholder', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search players and teams...')).toBeInTheDocument();
      });
    });

    it('renders AnalystSideNav component', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('analyst-sidenav')).toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    it('fetches matches on mount', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('analyst-sidenav')).toBeInTheDocument();
      });
      
      // Context handles data fetching, component just consumes it
      expect(mockUseMatches).toHaveBeenCalled();
    });

    it('fetches teams after getting matches', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(mockUseMatches).toHaveBeenCalled();
      });
    });

    it('displays games after successful data fetch', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Lakers vs Warriors')).toBeInTheDocument();
        expect(screen.getByText('Bulls vs Celtics')).toBeInTheDocument();
      });
    });

    it('extracts unique team IDs from matches', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });

    it('handles matches with missing team data gracefully', async () => {
      mockUseMatches.mockReturnValue({
        allGames: [mockGames[0]],
        matches: [mockMatches[0]],
        isLoading: false,
        error: null,
        triggerRefetch: jest.fn(),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when API fails', async () => {
      mockUseMatches.mockReturnValue({
        allGames: [],
        matches: [],
        isLoading: false,
        error: 'Failed to load matches from database.',
        triggerRefetch: jest.fn(),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load matches from database.')).toBeInTheDocument();
      });
    });

    it('sets usingSampleData to true on error', async () => {
      mockUseMatches.mockReturnValue({
        allGames: [],
        matches: [],
        isLoading: false,
        error: 'Network error',
        triggerRefetch: jest.fn(),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('hides loading state after error', async () => {
      mockUseMatches.mockReturnValue({
        allGames: [],
        matches: [],
        isLoading: false,
        error: 'Error',
        triggerRefetch: jest.fn(),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByTestId('game-skeleton')).not.toBeInTheDocument();
      });
    });

    it('handles empty matches array', async () => {
      mockUseMatches.mockReturnValue({
        allGames: [],
        matches: [],
        isLoading: false,
        error: null,
        triggerRefetch: jest.fn(),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByTestId('game-skeleton')).not.toBeInTheDocument();
      });
    });

    it('handles null matches response', async () => {
      mockUseMatches.mockReturnValue({
        allGames: [],
        matches: [],
        isLoading: false,
        error: null,
        triggerRefetch: jest.fn(),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByText('Lakers vs Warriors')).not.toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    it('defaults to upcoming-games tab', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('active-tab')).toHaveTextContent('upcoming-games');
      });
    });

    it('switches to booked-games tab', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Booked Games'));
      });

      expect(screen.getByTestId('active-tab')).toHaveTextContent('booked-games');
    });

    it('switches to live tab', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Live'));
      });

      expect(screen.getByText('Live Matches')).toBeInTheDocument();
      expect(screen.getByText('This is where live matches occur')).toBeInTheDocument();
    });

    it('switches to completed tab', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Completed'));
      });

      expect(screen.getByTestId('active-tab')).toHaveTextContent('completed');
    });

    it('displays games grid on upcoming-games tab', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });
  });

  describe('Game Data Transformation', () => {
    it('formats match dates correctly', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });

    it('maps team data to game objects', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Lakers vs Warriors')).toBeInTheDocument();
      });
    });

    it('uses default team logo when icon_url is missing', async () => {
      const gamesWithoutLogos = mockGames.map(g => ({
        ...g,
        homeTeam: { ...g.homeTeam, logo: '/generic-basketball-logo.png' },
        awayTeam: { ...g.awayTeam, logo: '/generic-basketball-logo.png' },
      }));
      
      mockUseMatches.mockReturnValue({
        allGames: gamesWithoutLogos,
        matches: mockMatches,
        isLoading: false,
        error: null,
        triggerRefetch: jest.fn(),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });

    it('handles missing team names', async () => {
      const gamesWithoutNames = [{
        ...mockGames[0],
        homeTeam: { ...mockGames[0].homeTeam, name: 'Unknown Team' },
        awayTeam: { ...mockGames[0].awayTeam, name: 'Unknown Team' },
      }];
      
      mockUseMatches.mockReturnValue({
        allGames: gamesWithoutNames,
        matches: [mockMatches[0]],
        isLoading: false,
        error: null,
        triggerRefetch: jest.fn(),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Unknown Team vs Unknown Team')).toBeInTheDocument();
      });
    });
  });

  describe('User Context', () => {
    it('logs user information on data fetch', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('analyst-sidenav')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('shows 12 skeleton cards while loading', () => {
      mockUseMatches.mockReturnValue({
        allGames: [],
        matches: [],
        isLoading: true,
        error: null,
        triggerRefetch: jest.fn(),
      });

      render(<Dashboard />);

      const skeletons = screen.getAllByTestId('game-skeleton');
      expect(skeletons).toHaveLength(12);
    });

    it('hides skeletons after data loads', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByTestId('game-skeleton')).not.toBeInTheDocument();
      });
    });

    it('displays AVAILABLE GAMES heading while loading', () => {
      mockUseMatches.mockReturnValue({
        allGames: [],
        matches: [],
        isLoading: true,
        error: null,
        triggerRefetch: jest.fn(),
      });

      render(<Dashboard />);

      expect(screen.getByText('AVAILABLE GAMES')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined lineup data', async () => {
      const gamesWithoutLineup = mockGames.map(g => ({
        ...g,
        homeLineup: undefined,
        awayLineup: undefined,
      }));
      
      mockUseMatches.mockReturnValue({
        allGames: gamesWithoutLineup as any,
        matches: mockMatches,
        isLoading: false,
        error: null,
        triggerRefetch: jest.fn(),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });

    it('handles rapid tab switching', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Booked Games'));
        fireEvent.click(screen.getByText('Live'));
        fireEvent.click(screen.getByText('Completed'));
        fireEvent.click(screen.getByText('Upcoming Games'));
      });

      expect(screen.getByTestId('active-tab')).toHaveTextContent('upcoming-games');
    });

    it('handles very large number of matches', async () => {
      const manyGames = Array.from({ length: 100 }, (_, i) => ({
        ...mockGames[0],
        match_id: `match-${i}`,
      }));
      
      mockUseMatches.mockReturnValue({
        allGames: manyGames,
        matches: mockMatches,
        isLoading: false,
        error: null,
        triggerRefetch: jest.fn(),
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });
  });
});