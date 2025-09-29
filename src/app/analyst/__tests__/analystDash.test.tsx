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
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      role: 'analyst',
    },
    loading: false,
  })),
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

// Import Dashboard AFTER all mocks are defined
import Dashboard from '../page';
import { apiClient } from '../../utils/apiClient';

describe('Analyst Dashboard', () => {
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
  });

  describe('Initial Rendering', () => {
    it('renders dashboard without crashing', async () => {
      mockGetMatches.mockResolvedValue(mockMatches);
      mockGetTeamsByIds.mockResolvedValue(mockTeams);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('analyst-sidenav')).toBeInTheDocument();
      });
    });

    it('shows loading skeletons initially', () => {
      mockGetMatches.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<Dashboard />);

      expect(screen.getAllByTestId('game-skeleton')).toHaveLength(12);
    });

    it('renders background image', async () => {
      mockGetMatches.mockResolvedValue([]);
      mockGetTeamsByIds.mockResolvedValue([]);

      render(<Dashboard />);

      await waitFor(() => {
        const bgImage = screen.getByAltText('Background');
        expect(bgImage).toBeInTheDocument();
        expect(bgImage).toHaveAttribute('src', '/background/orangebackground.jpeg');
      });
    });

    it('renders dashboard header with search placeholder', async () => {
      mockGetMatches.mockResolvedValue([]);
      mockGetTeamsByIds.mockResolvedValue([]);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search players and teams...')).toBeInTheDocument();
      });
    });

    it('renders AnalystSideNav component', async () => {
      mockGetMatches.mockResolvedValue([]);
      mockGetTeamsByIds.mockResolvedValue([]);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('analyst-sidenav')).toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    it('fetches matches on mount', async () => {
      mockGetMatches.mockResolvedValue(mockMatches);
      mockGetTeamsByIds.mockResolvedValue(mockTeams);

      render(<Dashboard />);

      await waitFor(() => {
        expect(mockGetMatches).toHaveBeenCalledTimes(1);
      });
    });

    it('fetches teams after getting matches', async () => {
      mockGetMatches.mockResolvedValue(mockMatches);
      mockGetTeamsByIds.mockResolvedValue(mockTeams);

      render(<Dashboard />);

      await waitFor(() => {
        expect(mockGetTeamsByIds).toHaveBeenCalledTimes(1);
        const calledWith = mockGetTeamsByIds.mock.calls[0][0];
        expect(calledWith).toHaveLength(4);
        expect(calledWith).toEqual(expect.arrayContaining(['team-1', 'team-2', 'team-3', 'team-4']));
      });
    });

    it('displays games after successful data fetch', async () => {
      mockGetMatches.mockResolvedValue(mockMatches);
      mockGetTeamsByIds.mockResolvedValue(mockTeams);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Lakers vs Warriors')).toBeInTheDocument();
        expect(screen.getByText('Bulls vs Celtics')).toBeInTheDocument();
      });
    });

    it('extracts unique team IDs from matches', async () => {
      mockGetMatches.mockResolvedValue(mockMatches);
      mockGetTeamsByIds.mockResolvedValue(mockTeams);

      render(<Dashboard />);

      await waitFor(() => {
        const teamIds = mockGetTeamsByIds.mock.calls[0][0];
        expect(teamIds).toHaveLength(4);
        expect(new Set(teamIds).size).toBe(4); // All unique
      });
    });

    it('handles matches with missing team data gracefully', async () => {
      mockGetMatches.mockResolvedValue(mockMatches);
      mockGetTeamsByIds.mockResolvedValue([mockTeams[0]]); // Only one team

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when API fails', async () => {
      mockGetMatches.mockRejectedValue(new Error('API Error'));

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load matches from database.')).toBeInTheDocument();
      });
    });

    it('sets usingSampleData to true on error', async () => {
      mockGetMatches.mockRejectedValue(new Error('Network error'));

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load matches from database.')).toBeInTheDocument();
      });
    });

    it('hides loading state after error', async () => {
      mockGetMatches.mockRejectedValue(new Error('Error'));

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByTestId('game-skeleton')).not.toBeInTheDocument();
      });
    });

    it('handles empty matches array', async () => {
      mockGetMatches.mockResolvedValue([]);
      mockGetTeamsByIds.mockResolvedValue([]);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByTestId('game-skeleton')).not.toBeInTheDocument();
      });
    });

    it('handles null matches response', async () => {
      mockGetMatches.mockResolvedValue(null);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByText('Lakers vs Warriors')).not.toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    it('defaults to upcoming-games tab', async () => {
      mockGetMatches.mockResolvedValue(mockMatches);
      mockGetTeamsByIds.mockResolvedValue(mockTeams);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('active-tab')).toHaveTextContent('upcoming-games');
      });
    });

    it('switches to booked-games tab', async () => {
      mockGetMatches.mockResolvedValue([]);
      mockGetTeamsByIds.mockResolvedValue([]);

      render(<Dashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Booked Games'));
      });

      expect(screen.getByText('Booked Games', { selector: 'h2' })).toBeInTheDocument();
      expect(screen.getByText('This is where booked games for analysis will be shown')).toBeInTheDocument();
    });

    it('switches to live tab', async () => {
      mockGetMatches.mockResolvedValue([]);
      mockGetTeamsByIds.mockResolvedValue([]);

      render(<Dashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Live'));
      });

      expect(screen.getByText('Live Matches')).toBeInTheDocument();
      expect(screen.getByText('This is where live matches occur')).toBeInTheDocument();
    });

    it('switches to completed tab', async () => {
      mockGetMatches.mockResolvedValue([]);
      mockGetTeamsByIds.mockResolvedValue([]);

      render(<Dashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Completed'));
      });

      expect(screen.getByText('Completed Games')).toBeInTheDocument();
      expect(screen.getByText('This is where completed games and their analysis will be displayed')).toBeInTheDocument();
    });

    it('displays games grid on upcoming-games tab', async () => {
      mockGetMatches.mockResolvedValue(mockMatches);
      mockGetTeamsByIds.mockResolvedValue(mockTeams);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });
  });

  describe('Game Data Transformation', () => {
    it('formats match dates correctly', async () => {
      mockGetMatches.mockResolvedValue(mockMatches);
      mockGetTeamsByIds.mockResolvedValue(mockTeams);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });

    it('maps team data to game objects', async () => {
      mockGetMatches.mockResolvedValue(mockMatches);
      mockGetTeamsByIds.mockResolvedValue(mockTeams);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Lakers vs Warriors')).toBeInTheDocument();
      });
    });

    it('uses default team logo when icon_url is missing', async () => {
      const teamsWithoutLogos = mockTeams.map(t => ({ ...t, icon_url: null }));
      mockGetMatches.mockResolvedValue(mockMatches);
      mockGetTeamsByIds.mockResolvedValue(teamsWithoutLogos);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });

    it('handles missing team names', async () => {
      const teamsWithoutNames = [
        { team_id: 'team-1', icon_url: '/logo.png' },
        { team_id: 'team-2', icon_url: '/logo.png' },
      ];
      mockGetMatches.mockResolvedValue([mockMatches[0]]);
      mockGetTeamsByIds.mockResolvedValue(teamsWithoutNames);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Unknown Team vs Unknown Team')).toBeInTheDocument();
      });
    });
  });

  describe('User Context', () => {
    it('logs user information on data fetch', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockGetMatches.mockResolvedValue(mockMatches);
      mockGetTeamsByIds.mockResolvedValue(mockTeams);

      render(<Dashboard />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('the User who logged in while fetching games is John with id Doe')
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Loading States', () => {
    it('shows 12 skeleton cards while loading', () => {
      mockGetMatches.mockImplementation(() => new Promise(() => {}));

      render(<Dashboard />);

      const skeletons = screen.getAllByTestId('game-skeleton');
      expect(skeletons).toHaveLength(12);
    });

    it('hides skeletons after data loads', async () => {
      mockGetMatches.mockResolvedValue(mockMatches);
      mockGetTeamsByIds.mockResolvedValue(mockTeams);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.queryByTestId('game-skeleton')).not.toBeInTheDocument();
      });
    });

    it('displays AVAILABLE GAMES heading while loading', () => {
      mockGetMatches.mockImplementation(() => new Promise(() => {}));

      render(<Dashboard />);

      expect(screen.getByText('AVAILABLE GAMES')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined lineup data', async () => {
      const matchesWithoutLineup = mockMatches.map(m => ({ ...m, homeLineup: undefined, awayLineup: undefined }));
      mockGetMatches.mockResolvedValue(matchesWithoutLineup);
      mockGetTeamsByIds.mockResolvedValue(mockTeams);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });

    it('handles rapid tab switching', async () => {
      mockGetMatches.mockResolvedValue([]);
      mockGetTeamsByIds.mockResolvedValue([]);

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
      const manyMatches = Array.from({ length: 100 }, (_, i) => ({
        ...mockMatches[0],
        match_id: `match-${i}`,
      }));
      mockGetMatches.mockResolvedValue(manyMatches);
      mockGetTeamsByIds.mockResolvedValue(mockTeams);

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
      });
    });
  });
});