import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import PlayerDashboard from '../page';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, priority, ...rest } = props;
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...rest} />;
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Award: () => <div data-testid="award-icon">Award</div>,
  TrendingUp: () => <div data-testid="trending-icon">TrendingUp</div>,
  Target: () => <div data-testid="target-icon">Target</div>,
  Activity: () => <div data-testid="activity-icon">Activity</div>,
}));

// Mock the use hook from React
jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    use: jest.fn((promise: any) => {
      // For testing, we'll throw the promise and let Suspense handle it
      // But since we don't have Suspense in tests, we'll unwrap it synchronously
      if (promise && typeof promise.then === 'function') {
        throw promise;
      }
      return promise;
    }),
  };
});

// Mock fetch globally
global.fetch = jest.fn();

const mockPlayerData = {
  player_id: '123',
  team_id: 'team-1',
  first_name: 'John',
  last_name: 'Doe',
  position: 'Point Guard',
  jersey_number: 23,
  turnovers: 45,
  fouls: 32,
  points: 1250,
  assists: 340,
  rebounds: 180,
  blocks: 25,
  twoPointsMade: 320,
  twoPointsAttempted: 600,
  threePointsMade: 150,
  threePointsAttempted: 400,
  freeThrowsMade: 210,
  freeThrowsAttempted: 250,
  matches_played: 50,
  steals: 60,
  image: '/players/john-doe.jpg',
};

// Helper to render with resolved params
const renderPlayerDashboard = async (id: string) => {
  const React = require('react');
  React.use.mockImplementation(() => ({ id }));
  return render(<PlayerDashboard params={Promise.resolve({ id })} />);
};

describe('PlayerDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const React = require('react');
    React.use.mockImplementation((promise: any) => {
      if (promise && typeof promise.then === 'function') {
        // Synchronously return the resolved value for testing
        return { id: '123' };
      }
      return promise;
    });
  });

  describe('Loading State', () => {
    it('displays loading state while fetching player data', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      await act(async () => {
        await renderPlayerDashboard('123');
      });

      // Check for loading animation
      const loadingElement = document.querySelector('.animate-pulse');
      expect(loadingElement).toBeInTheDocument();
    });

    it('renders background during loading', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      await act(async () => {
        await renderPlayerDashboard('123');
      });

      const backgroundImage = screen.getByAltText('Background');
      expect(backgroundImage).toBeInTheDocument();
      expect(backgroundImage).toHaveAttribute('src', '/background/ballBG.jpeg');
    });
  });

  describe('Error State', () => {
    it('displays error message when fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch player'));

      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        expect(screen.getByText('Player not found')).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch player')).toBeInTheDocument();
      });
    });

    it('displays error when player is not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => null,
      });

      await act(async () => {
        await renderPlayerDashboard('999');
      });

      await waitFor(() => {
        const errorMessages = screen.getAllByText('Player not found');
        expect(errorMessages.length).toBeGreaterThan(0);
        expect(errorMessages[0]).toBeInTheDocument();
      });
    });

    it('displays error when API returns not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        expect(screen.getByText('Player not found')).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch player')).toBeInTheDocument();
      });
    });
  });

  describe('Successful Data Loading', () => {
    it('fetches player data with correct ID', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayerData,
      });

      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/players/123');
      });
    });

    it('displays player name correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayerData,
      });

      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('displays player position and games played', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayerData,
      });

      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        expect(screen.getByText('Point Guard')).toBeInTheDocument();
        expect(screen.getByText('50 Games Played')).toBeInTheDocument();
      });
    });

    it('displays jersey number', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayerData,
      });

      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        expect(screen.getByText('#23')).toBeInTheDocument();
      });
    });

    it('displays player image with correct src', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayerData,
      });

      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        const playerImage = screen.getByAltText('John Doe');
        expect(playerImage).toBeInTheDocument();
        expect(playerImage).toHaveAttribute('src', '/players/john-doe.jpg');
      });
    });

    it('displays placeholder image when no image provided', async () => {
      const playerWithoutImage = { ...mockPlayerData, image: '' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => playerWithoutImage,
      });

      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        const playerImage = screen.getByAltText('John Doe');
        expect(playerImage).toHaveAttribute('src', expect.stringContaining('placeholder'));
      });
    });
  });

  describe('Quick Stats Display', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayerData,
      });
    });

    it('displays points correctly', async () => {
      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        const pointsElements = screen.getAllByText('1250');
        expect(pointsElements.length).toBeGreaterThan(0);
        expect(screen.getAllByText('Points')[0]).toBeInTheDocument();
      });
    });

    it('displays assists correctly', async () => {
      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        const assistsElements = screen.getAllByText('340');
        expect(assistsElements.length).toBeGreaterThan(0);
        expect(screen.getAllByText('Assists')[0]).toBeInTheDocument();
      });
    });

    it('displays rebounds correctly', async () => {
      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        const reboundsElements = screen.getAllByText('180');
        expect(reboundsElements.length).toBeGreaterThan(0);
        expect(screen.getAllByText('Rebounds')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Additional Stats Display', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayerData,
      });
    });

    it('displays blocks stat', async () => {
      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        expect(screen.getByText('Blocks')).toBeInTheDocument();
        expect(screen.getByText('25')).toBeInTheDocument();
      });
    });

    it('displays steals stat', async () => {
      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        expect(screen.getByText('Steals')).toBeInTheDocument();
        expect(screen.getByText('60')).toBeInTheDocument();
      });
    });

    it('displays turnovers stat', async () => {
      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        expect(screen.getByText('Turnovers')).toBeInTheDocument();
        expect(screen.getByText('45')).toBeInTheDocument();
      });
    });

    it('displays fouls stat', async () => {
      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        expect(screen.getByText('Fouls')).toBeInTheDocument();
        expect(screen.getByText('32')).toBeInTheDocument();
      });
    });
  });

  describe('Shooting Statistics', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayerData,
      });
    });

    it('displays 2-point shooting stats', async () => {
      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        expect(screen.getByText('2-Point Shots')).toBeInTheDocument();
        expect(screen.getByText('320/600')).toBeInTheDocument();
        expect(screen.getByText('53.3%')).toBeInTheDocument();
      });
    });

    it('displays 3-point shooting stats', async () => {
      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        expect(screen.getByText('3-Point Shots')).toBeInTheDocument();
        expect(screen.getByText('150/400')).toBeInTheDocument();
        expect(screen.getByText('37.5%')).toBeInTheDocument();
      });
    });

    it('displays free throw stats', async () => {
      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        expect(screen.getByText('Free Throws')).toBeInTheDocument();
        expect(screen.getByText('210/250')).toBeInTheDocument();
        expect(screen.getByText('84.0%')).toBeInTheDocument();
      });
    });

    it('handles zero attempts correctly', async () => {
      const playerWithZeroAttempts = {
        ...mockPlayerData,
        twoPointsAttempted: 0,
        twoPointsMade: 0,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => playerWithZeroAttempts,
      });

      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        expect(screen.getByText('0/0')).toBeInTheDocument();
        const zeroPercents = screen.getAllByText('0%');
        expect(zeroPercents.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Layout and Styling', () => {
    it('renders all icon components', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayerData,
      });

      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        expect(screen.getByTestId('award-icon')).toBeInTheDocument();
        expect(screen.getByTestId('trending-icon')).toBeInTheDocument();
        expect(screen.getAllByTestId('target-icon').length).toBeGreaterThan(0);
        expect(screen.getByTestId('activity-icon')).toBeInTheDocument();
      });
    });

    it('applies correct CSS classes for glassmorphism', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayerData,
      });

      let container;
      await act(async () => {
        const result = await renderPlayerDashboard('123');
        container = result.container;
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Check for backdrop blur classes
      const backdropElements = container!.querySelectorAll('.backdrop-blur-md');
      expect(backdropElements.length).toBeGreaterThan(0);

      // Check for border classes
      const borderElements = container!.querySelectorAll('[class*="border-white"]');
      expect(borderElements.length).toBeGreaterThan(0);
    });

    it('has responsive grid layouts', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayerData,
      });

      let container;
      await act(async () => {
        const result = await renderPlayerDashboard('123');
        container = result.container;
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Check for grid classes
      const gridElements = container!.querySelectorAll('[class*="grid"]');
      expect(gridElements.length).toBeGreaterThan(0);
    });
  });

  describe('Component Integration', () => {
    it('displays all sections when data loads successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayerData,
      });

      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        // Player info section
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        
        // Quick stats section
        expect(screen.getAllByText('Points')[0]).toBeInTheDocument();
        
        // Additional stats section
        expect(screen.getByText('Blocks')).toBeInTheDocument();
        
        // Shooting statistics section
        expect(screen.getByText('Shooting Statistics')).toBeInTheDocument();
      });
    });

    it('only fetches data once on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayerData,
      });

      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('fetches with different player ID', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayerData,
      });

      const React = require('react');
      React.use.mockImplementation(() => ({ id: '456' }));

      await act(async () => {
        await renderPlayerDashboard('456');
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/players/456');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles player with minimal stats', async () => {
      const minimalPlayer = {
        ...mockPlayerData,
        points: 0,
        assists: 0,
        rebounds: 0,
        blocks: 0,
        steals: 0,
        turnovers: 0,
        fouls: 0,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => minimalPlayer,
      });

      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        // Should display zeros without crashing
        const zeroElements = screen.getAllByText('0');
        expect(zeroElements.length).toBeGreaterThan(0);
      });
    });

    it('handles long player names', async () => {
      const longNamePlayer = {
        ...mockPlayerData,
        first_name: 'Christopher',
        last_name: 'Weatherspoon-Johnson',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => longNamePlayer,
      });

      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        expect(screen.getByText('Christopher Weatherspoon-Johnson')).toBeInTheDocument();
      });
    });

    it('handles three-digit jersey numbers', async () => {
      const highJerseyPlayer = {
        ...mockPlayerData,
        jersey_number: 100,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => highJerseyPlayer,
      });

      await act(async () => {
        await renderPlayerDashboard('123');
      });

      await waitFor(() => {
        expect(screen.getByText('#100')).toBeInTheDocument();
      });
    });
  });
});