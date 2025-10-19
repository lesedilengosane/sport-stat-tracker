import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FanDashboard from '../page';

// Mock Next.js Image component - fixed to avoid attribute warnings
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // Remove Next.js specific props that aren't valid HTML attributes
    const { fill, priority, ...rest } = props;
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...rest} />;
  },
}));

// Mock components
jest.mock('../../../components/header/header', () => ({
  DashboardHeader: ({ placeholder }: { placeholder: string }) => (
    <div data-testid="dashboard-header">{placeholder}</div>
  ),
}));

jest.mock('../../../components/sideNav/fanSideNav', () => ({
  FanSideNav: ({ activeTab, onTabChange }: any) => (
    <div data-testid="fan-side-nav">
      <button onClick={() => onTabChange('overview')}>Overview</button>
      <button onClick={() => onTabChange('players')}>Players</button>
      <button onClick={() => onTabChange('upcoming-games')}>Upcoming Games</button>
      <button onClick={() => onTabChange('standings')}>Standings</button>
      <button onClick={() => onTabChange('teams')}>Teams</button>
      <span data-testid="active-tab">{activeTab}</span>
    </div>
  ),
}));

jest.mock('../../../components/fanComponents/SeasonHighlights', () => ({
  SeasonHighlights: ({ highlights }: any) => (
    <div data-testid="season-highlights">{JSON.stringify(highlights)}</div>
  ),
}));

jest.mock('../../../components/fanComponents/TopScorers', () => ({
  TopScorers: ({ players }: any) => (
    <div data-testid="top-scorers">{players?.length || 0} players</div>
  ),
}));

jest.mock('../../../components/fanComponents/GameSchedule', () => ({
  GameSchedule: ({ games, compact }: any) => (
    <div data-testid="game-schedule">
      {games?.length || 0} games {compact ? '(compact)' : ''}
    </div>
  ),
}));

jest.mock('../../../components/fanComponents/leagueStanding', () => ({
  LeagueStandings: ({ standings, compact }: any) => (
    <div data-testid="league-standings">
      {standings?.length || 0} teams {compact ? '(compact)' : ''}
    </div>
  ),
}));

jest.mock('../../../components/fanComponents/PlayerCards', () => ({
  __esModule: true,
  default: () => <div data-testid="player-cards">Player Cards</div>,
}));

jest.mock('../../../components/fanComponents/TeamCards', () => ({
  __esModule: true,
  default: () => <div data-testid="team-cards">Team Cards</div>,
}));

jest.mock('../../../components/games-grid', () => ({
  GamesGrid: ({ games }: any) => (
    <div data-testid="games-grid">{games?.length || 0} games</div>
  ),
}));

jest.mock('../../../components/Loading-Card/game-card-skeleton', () => ({
  GameCardSkeleton: () => <div data-testid="game-card-skeleton">Loading...</div>,
}));

// Mock fetch globally
global.fetch = jest.fn();

const mockDashboardData = {
  season_highlights: {
    total_games: 20,
    wins: 15,
    losses: 5,
  },
  top_scorers: [
    { player_id: '1', name: 'John Doe', points: 25 },
    { player_id: '2', name: 'Jane Smith', points: 22 },
  ],
  upcoming_games: [
    { match_id: '1', home_team: 'Team A', away_team: 'Team B', date: '2025-01-01' },
    { match_id: '2', home_team: 'Team C', away_team: 'Team D', date: '2025-01-02' },
  ],
  league_standings: [
    { team_id: '1', name: 'Team A', wins: 10, losses: 2 },
    { team_id: '2', name: 'Team B', wins: 8, losses: 4 },
  ],
};

describe('FanDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders dashboard with background and header', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDashboardData,
      });

      render(<FanDashboard />);

      // Check for background image
      const backgroundImage = screen.getByAltText('Background');
      expect(backgroundImage).toBeInTheDocument();
      expect(backgroundImage).toHaveAttribute('src', '/background/ballBG.jpeg');

      // Check for header
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
      expect(screen.getByText('Search players and teams...')).toBeInTheDocument();

      // Check for side nav
      expect(screen.getByTestId('fan-side-nav')).toBeInTheDocument();
    });

    it('renders with overview tab active by default', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDashboardData,
      });

      render(<FanDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('active-tab')).toHaveTextContent('overview');
      });
    });

    it('fetches dashboard data on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDashboardData,
      });

      render(<FanDashboard />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/fan');
      });
    });
  });

  describe('Data Loading States', () => {
    it('displays loading state initially', () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<FanDashboard />);

      // Overview tab should render but with no data
      expect(screen.getByTestId('fan-side-nav')).toBeInTheDocument();
    });

    it('does not display error on overview tab when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      render(<FanDashboard />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Error is set internally but not displayed on overview tab
      // Component just shows nothing since data is null
      expect(screen.queryByText(/Failed to fetch dashboard data/i)).not.toBeInTheDocument();
    });

    it('handles network error without displaying on overview', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<FanDashboard />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Error is set but not displayed on overview tab
      expect(screen.queryByText(/Network error/i)).not.toBeInTheDocument();
    });
  });

  describe('Overview Tab', () => {
    it('renders all overview components with data', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDashboardData,
      });

      render(<FanDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('season-highlights')).toBeInTheDocument();
        expect(screen.getByTestId('game-schedule')).toBeInTheDocument();
        expect(screen.getByTestId('top-scorers')).toBeInTheDocument();
        expect(screen.getByTestId('league-standings')).toBeInTheDocument();
      });
    });

    it('passes correct data to child components', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDashboardData,
      });

      render(<FanDashboard />);

      await waitFor(() => {
        const topScorers = screen.getByTestId('top-scorers');
        expect(topScorers).toHaveTextContent('2 players');

        const gameSchedule = screen.getByTestId('game-schedule');
        expect(gameSchedule).toHaveTextContent('2 games (compact)');

        const leagueStandings = screen.getByTestId('league-standings');
        expect(leagueStandings).toHaveTextContent('2 teams (compact)');
      });
    });
  });

  describe('Tab Navigation', () => {
    it('switches to players tab when clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDashboardData,
      });

      const user = userEvent.setup();
      render(<FanDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('season-highlights')).toBeInTheDocument();
      });

      const playersButton = screen.getByRole('button', { name: /players/i });
      await user.click(playersButton);

      await waitFor(() => {
        expect(screen.getByTestId('player-cards')).toBeInTheDocument();
        expect(screen.queryByTestId('season-highlights')).not.toBeInTheDocument();
      });
    });

    it('switches to upcoming games tab when clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDashboardData,
      });

      const user = userEvent.setup();
      render(<FanDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('season-highlights')).toBeInTheDocument();
      });

      const upcomingGamesButton = screen.getByRole('button', { name: /upcoming games/i });
      await user.click(upcomingGamesButton);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
        expect(screen.getByTestId('games-grid')).toHaveTextContent('2 games');
      });
    });

    it('switches to standings tab when clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDashboardData,
      });

      const user = userEvent.setup();
      render(<FanDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('season-highlights')).toBeInTheDocument();
      });

      const standingsButton = screen.getByRole('button', { name: /standings/i });
      await user.click(standingsButton);

      await waitFor(() => {
        const standings = screen.getAllByTestId('league-standings');
        expect(standings[0]).toBeInTheDocument();
        // Should not be compact on standings tab
        expect(standings[0]).not.toHaveTextContent('(compact)');
      });
    });

    it('switches to teams tab when clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDashboardData,
      });

      const user = userEvent.setup();
      render(<FanDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('season-highlights')).toBeInTheDocument();
      });

      const teamsButton = screen.getByRole('button', { name: /teams/i });
      await user.click(teamsButton);

      await waitFor(() => {
        expect(screen.getByTestId('team-cards')).toBeInTheDocument();
      });
    });

    it('switches back to overview tab', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDashboardData,
      });

      const user = userEvent.setup();
      render(<FanDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('season-highlights')).toBeInTheDocument();
      });

      // Go to players tab
      const playersButton = screen.getByRole('button', { name: /players/i });
      await user.click(playersButton);

      await waitFor(() => {
        expect(screen.getByTestId('player-cards')).toBeInTheDocument();
      });

      // Go back to overview
      const overviewButton = screen.getByRole('button', { name: /overview/i });
      await user.click(overviewButton);

      await waitFor(() => {
        expect(screen.getByTestId('season-highlights')).toBeInTheDocument();
        expect(screen.queryByTestId('player-cards')).not.toBeInTheDocument();
      });
    });
  });

  describe('Upcoming Games Tab', () => {
    it('shows loading skeletons while fetching data', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const user = userEvent.setup();
      render(<FanDashboard />);

      const upcomingGamesButton = screen.getByRole('button', { name: /upcoming games/i });
      await user.click(upcomingGamesButton);

      // Should show 12 skeleton loaders
      const skeletons = screen.getAllByTestId('game-card-skeleton');
      expect(skeletons).toHaveLength(12);
    });

    it('displays error in upcoming games tab', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      const user = userEvent.setup();
      render(<FanDashboard />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const upcomingGamesButton = screen.getByRole('button', { name: /upcoming games/i });
      await user.click(upcomingGamesButton);

      // Error should be visible in upcoming games tab
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch dashboard data')).toBeInTheDocument();
      });
    });

    it('renders games grid when data is loaded', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDashboardData,
      });

      const user = userEvent.setup();
      render(<FanDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('season-highlights')).toBeInTheDocument();
      });

      const upcomingGamesButton = screen.getByRole('button', { name: /upcoming games/i });
      await user.click(upcomingGamesButton);

      await waitFor(() => {
        expect(screen.getByTestId('games-grid')).toBeInTheDocument();
        expect(screen.getByTestId('games-grid')).toHaveTextContent('2 games');
      });
    });
  });

  describe('Data Handling', () => {
    it('handles empty data gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          season_highlights: null,
          top_scorers: [],
          upcoming_games: [],
          league_standings: [],
        }),
      });

      render(<FanDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('top-scorers')).toHaveTextContent('0 players');
        expect(screen.getByTestId('game-schedule')).toHaveTextContent('0 games');
        expect(screen.getByTestId('league-standings')).toHaveTextContent('0 teams');
      });
    });

    it('handles null data response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => null,
      });

      render(<FanDashboard />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Should not crash, components should handle null data
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('applies correct CSS classes for layout', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDashboardData,
      });

      const { container } = render(<FanDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('season-highlights')).toBeInTheDocument();
      });

      // Check for main container classes
      const mainDiv = container.querySelector('.min-h-screen');
      expect(mainDiv).toBeInTheDocument();

      // Check for backdrop blur on background
      const backdrop = container.querySelector('.backdrop-blur-lg');
      expect(backdrop).toBeInTheDocument();
    });

    it('has sticky header', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDashboardData,
      });

      const { container } = render(<FanDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('season-highlights')).toBeInTheDocument();
      });

      const stickyHeader = container.querySelector('.sticky');
      expect(stickyHeader).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('maintains state across tab switches', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDashboardData,
      });

      const user = userEvent.setup();
      render(<FanDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('season-highlights')).toBeInTheDocument();
      });

      // Switch to players and back
      await user.click(screen.getByRole('button', { name: /players/i }));
      await waitFor(() => {
        expect(screen.getByTestId('player-cards')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /overview/i }));
      await waitFor(() => {
        expect(screen.getByTestId('season-highlights')).toBeInTheDocument();
      });

      // Data should still be there (only fetched once)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('does not refetch data on tab change', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDashboardData,
      });

      const user = userEvent.setup();
      render(<FanDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('season-highlights')).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Switch tabs multiple times
      await user.click(screen.getByRole('button', { name: /players/i }));
      await user.click(screen.getByRole('button', { name: /standings/i }));
      await user.click(screen.getByRole('button', { name: /teams/i }));
      await user.click(screen.getByRole('button', { name: /overview/i }));

      // Should still only have fetched once
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});