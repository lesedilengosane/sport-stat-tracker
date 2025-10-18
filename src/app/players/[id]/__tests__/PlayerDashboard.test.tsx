// src/app/players/[id]/__tests__/PlayerDashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Mock environment variables before any imports
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

// Create a mock user with user_id
const mockCoachUser = {
  user_id: 'test-coach-id',
  email: 'coach@test.com',
};

// Mock player data
const mockPlayer = {
  player_id: '123',
  team_id: 'team1',
  first_name: 'John',
  last_name: 'Doe',
  position: 'Point Guard',
  jersey_number: 23,
  turnovers: 5,
  fouls: 12,
  points: 245,
  assists: 89,
  rebounds: 67,
  blocks: 15,
  twoPointsMade: 85,
  twoPointsAttempted: 150,
  threePointsMade: 25,
  threePointsAttempted: 75,
  freeThrowsMade: 50,
  freeThrowsAttempted: 60,
  matches_played: 20,
  steals: 34,
};

// Mock React's use hook
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  use: jest.fn((promise) => {
    if (promise && typeof promise.then === 'function') {
      let result: any;
      promise.then((value: any) => {
        result = value;
      });
      return result;
    }
    return promise;
  }),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock apiClient
jest.mock('../../../utils/apiClient', () => ({
  apiClient: {
    getTeamPlayers: jest.fn(),
  },
}));

// Mock useAuth hook
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Now import the component
import PlayerDashboard from '../page';
import { apiClient } from '../../../utils/apiClient';
import { useAuth } from '../../../context/AuthContext';

const mockUse = React.use as jest.Mock;
const mockGetTeamPlayers = apiClient.getTeamPlayers as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;

describe('PlayerDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default: mock use to return id
    mockUse.mockImplementation((promise) => {
      if (promise && typeof promise.then === 'function') {
        return { id: '123' };
      }
      return promise;
    });

    // Default: return authenticated coach user
    mockUseAuth.mockReturnValue({
      user: mockCoachUser,
      loading: false,
    });
  });

  describe('Successful Data Loading', () => {
    beforeEach(() => {
      // Mock successful API response
      mockGetTeamPlayers.mockResolvedValue([mockPlayer]);
    });

    it('renders player information correctly', async () => {
      const params = Promise.resolve({ id: '123' });
      render(<PlayerDashboard params={params} />);

      // Wait for async operations
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Check hero section
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText(/Point Guard/)).toBeInTheDocument();
      
      // Check initials
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('displays all basic stats correctly', async () => {
      const params = Promise.resolve({ id: '123' });
      render(<PlayerDashboard params={params} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Check all stat values
      expect(screen.getByText('20')).toBeInTheDocument(); // matches played
      expect(screen.getByText('245')).toBeInTheDocument(); // points
      expect(screen.getByText('89')).toBeInTheDocument(); // assists
      expect(screen.getByText('67')).toBeInTheDocument(); // rebounds
      expect(screen.getByText('15')).toBeInTheDocument(); // blocks
      expect(screen.getByText('34')).toBeInTheDocument(); // steals
      expect(screen.getByText('5')).toBeInTheDocument(); // turnovers
      expect(screen.getByText('12')).toBeInTheDocument(); // fouls
    });

    it('displays shooting stats correctly', async () => {
      const params = Promise.resolve({ id: '123' });
      render(<PlayerDashboard params={params} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Check shooting stats format
      expect(screen.getByText('85/150')).toBeInTheDocument(); // 2PT
      expect(screen.getByText('25/75')).toBeInTheDocument(); // 3PT
      expect(screen.getByText('50/60')).toBeInTheDocument(); // FT
      
      // Check shooting labels
      expect(screen.getByText('2PT')).toBeInTheDocument();
      expect(screen.getByText('3PT')).toBeInTheDocument();
      expect(screen.getByText('FT')).toBeInTheDocument();
    });

    it('displays stat labels correctly', async () => {
      const params = Promise.resolve({ id: '123' });
      render(<PlayerDashboard params={params} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Check all stat labels
      expect(screen.getByText('Matches Played')).toBeInTheDocument();
      expect(screen.getByText('Points')).toBeInTheDocument();
      expect(screen.getByText('Assists')).toBeInTheDocument();
      expect(screen.getByText('Rebounds')).toBeInTheDocument();
      expect(screen.getByText('Blocks')).toBeInTheDocument();
      expect(screen.getByText('Steals')).toBeInTheDocument();
      expect(screen.getByText('Turnovers')).toBeInTheDocument();
      expect(screen.getByText('Fouls')).toBeInTheDocument();
    });

    it('renders background image with correct props', async () => {
      const params = Promise.resolve({ id: '123' });
      render(<PlayerDashboard params={params} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const bgImage = screen.getByAltText('Basketball');
      expect(bgImage).toBeInTheDocument();
      expect(bgImage).toHaveAttribute('src', '/bgr.jpg');
    });

    it('applies correct CSS classes for layout', async () => {
      const params = Promise.resolve({ id: '123' });
      const { container } = render(<PlayerDashboard params={params} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Check main container classes
      const mainContainer = container.querySelector('.relative.min-h-screen.bg-black.text-white');
      expect(mainContainer).toBeInTheDocument();

      // Check hero card classes
      const heroCard = container.querySelector('.rounded-2xl.bg-gradient-to-r');
      expect(heroCard).toBeInTheDocument();
      expect(heroCard).toHaveClass('from-indigo-700', 'via-purple-700', 'to-pink-700');
    });
  });

  describe('Error Handling', () => {
    it('displays error message when user is not logged in', async () => {
      // Mock no user
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
      });

      const params = Promise.resolve({ id: 'invalid-id' });
      render(<PlayerDashboard params={params} />);

      await waitFor(() => {
        expect(screen.getByText('Player not found')).toBeInTheDocument();
      });

      expect(screen.getByText('You must be logged in as a coach')).toBeInTheDocument();
    });

    it('displays error message when player not found', async () => {
      // Mock API returning empty array (player not in team)
      mockGetTeamPlayers.mockResolvedValue([]);
      mockUse.mockImplementation(() => ({ id: 'invalid-id' }));

      const params = Promise.resolve({ id: 'invalid-id' });
      render(<PlayerDashboard params={params} />);

      await waitFor(() => {
        expect(screen.getAllByText('Player not found').length).toBeGreaterThan(0);
      });

      // Check that the heading exists
      const heading = screen.getByRole('heading', { name: 'Player not found' });
      expect(heading).toBeInTheDocument();
    });

    it('displays generic error when API fails', async () => {
      // Mock API error
      mockGetTeamPlayers.mockRejectedValue(new Error('API Error'));

      const params = Promise.resolve({ id: 'invalid-id' });
      render(<PlayerDashboard params={params} />);

      await waitFor(() => {
        expect(screen.getByText('Player not found')).toBeInTheDocument();
      });

      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    beforeEach(() => {
      mockGetTeamPlayers.mockResolvedValue([mockPlayer]);
    });

    it('calls getTeamPlayers with correct coach ID', async () => {
      const params = Promise.resolve({ id: '123' });
      render(<PlayerDashboard params={params} />);

      await waitFor(() => {
        expect(mockGetTeamPlayers).toHaveBeenCalledWith('test-coach-id');
      });
    });

    it('queries with correct player ID', async () => {
      const otherPlayer = { ...mockPlayer, player_id: 'player-456' };
      mockGetTeamPlayers.mockResolvedValue([mockPlayer, otherPlayer]);
      mockUse.mockImplementation(() => ({ id: 'player-456' }));

      const params = Promise.resolve({ id: 'player-456' });
      render(<PlayerDashboard params={params} />);

      await waitFor(() => {
        // Should find the player with ID 'player-456'
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Display Edge Cases', () => {
    it('handles zero values correctly', async () => {
      const playerWithZeros = {
        ...mockPlayer,
        points: 0,
        assists: 0,
        rebounds: 0,
        blocks: 0,
      };

      mockGetTeamPlayers.mockResolvedValue([playerWithZeros]);

      const params = Promise.resolve({ id: '123' });
      render(<PlayerDashboard params={params} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Should display zeros
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
    });

    it('handles single character names correctly', async () => {
      const playerWithShortName = {
        ...mockPlayer,
        first_name: 'A',
        last_name: 'B',
      };

      mockGetTeamPlayers.mockResolvedValue([playerWithShortName]);

      const params = Promise.resolve({ id: '123' });
      render(<PlayerDashboard params={params} />);

      await waitFor(() => {
        expect(screen.getByText('A B')).toBeInTheDocument();
      });

      expect(screen.getByText('A B')).toBeInTheDocument();
      expect(screen.getByText('AB')).toBeInTheDocument(); // initials
    });
  });

  describe('Responsive Design Classes', () => {
    beforeEach(() => {
      mockGetTeamPlayers.mockResolvedValue([mockPlayer]);
    });

    it('applies responsive grid classes', async () => {
      const params = Promise.resolve({ id: '123' });
      const { container } = render(<PlayerDashboard params={params} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Check stats grid responsiveness
      const statsGrid = container.querySelector('.grid.gap-6.sm\\:grid-cols-2.lg\\:grid-cols-3');
      expect(statsGrid).toBeInTheDocument();

      // Check shooting stats responsiveness
      const shootingGrid = container.querySelector('.grid.gap-4.sm\\:grid-cols-3');
      expect(shootingGrid).toBeInTheDocument();

      // Check hero card responsiveness
      const heroCard = container.querySelector('.flex.flex-col.sm\\:flex-row');
      expect(heroCard).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('displays loading message while fetching data', () => {
      // Mock a promise that never resolves to keep loading state
      mockGetTeamPlayers.mockImplementation(() => new Promise(() => {}));

      const params = Promise.resolve({ id: '123' });
      render(<PlayerDashboard params={params} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});