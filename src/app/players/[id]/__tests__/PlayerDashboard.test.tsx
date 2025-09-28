// src/app/players/[id]/__tests__/PlayerDashboard.test.tsx
import { render, screen } from '@testing-library/react';

// Mock environment variables before any imports
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock the supabase client module with a simple mock
jest.mock('../../../api/DatabaseApi/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Now import everything
import PlayerDashboard from '../page';
import { supabase } from '../../../api/DatabaseApi/supabaseClient';

// Cast to mocked version
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

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

describe('PlayerDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Data Loading', () => {
    beforeEach(() => {
      // Mock successful response chain
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockPlayer,
        error: null,
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      
      (mockSupabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
    });

    it('renders player information correctly', async () => {
      const params = Promise.resolve({ id: '123' });
      render(await PlayerDashboard({ params }));

      // Check hero section
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('#23 · Point Guard')).toBeInTheDocument();
      
      // Check initials
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('displays all basic stats correctly', async () => {
      const params = Promise.resolve({ id: '123' });
      render(await PlayerDashboard({ params }));

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
      render(await PlayerDashboard({ params }));

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
      render(await PlayerDashboard({ params }));

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
      render(await PlayerDashboard({ params }));

      const bgImage = screen.getByAltText('Basketball');
      expect(bgImage).toBeInTheDocument();
      expect(bgImage).toHaveAttribute('src', '/bgr.jpg');
    });

    it('applies correct CSS classes for layout', async () => {
      const params = Promise.resolve({ id: '123' });
      const { container } = render(await PlayerDashboard({ params }));

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
    it('displays error message when player not found', async () => {
      // Mock error response chain
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Player not found in database' },
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      
      (mockSupabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const params = Promise.resolve({ id: 'invalid-id' });
      render(await PlayerDashboard({ params }));

      expect(screen.getByText('Player not found')).toBeInTheDocument();
      expect(screen.getByText('Player not found in database')).toBeInTheDocument();
    });

    it('displays generic error when no data and no error', async () => {
      // Mock empty response chain
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      
      (mockSupabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const params = Promise.resolve({ id: 'invalid-id' });
      render(await PlayerDashboard({ params }));

      expect(screen.getByText('Player not found')).toBeInTheDocument();
      // Should not show error message when error is null
      expect(screen.queryByText(/Player not found in database/i)).not.toBeInTheDocument();
    });
  });

  describe('Database Query', () => {
    it('calls supabase with correct parameters', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockPlayer,
        error: null,
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      
      (mockSupabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const params = Promise.resolve({ id: '123' });
      await PlayerDashboard({ params });

      // Verify database calls
      expect(mockSupabase.from).toHaveBeenCalledWith('players');
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('player_id'));
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('first_name'));
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('last_name'));
    });

    it('queries with correct player ID', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockPlayer,
        error: null,
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      
      (mockSupabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const params = Promise.resolve({ id: 'player-456' });
      await PlayerDashboard({ params });

      expect(mockEq).toHaveBeenCalledWith('player_id', 'player-456');
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

      const mockSingle = jest.fn().mockResolvedValue({
        data: playerWithZeros,
        error: null,
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      
      (mockSupabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const params = Promise.resolve({ id: '123' });
      render(await PlayerDashboard({ params }));

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

      const mockSingle = jest.fn().mockResolvedValue({
        data: playerWithShortName,
        error: null,
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      
      (mockSupabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const params = Promise.resolve({ id: '123' });
      render(await PlayerDashboard({ params }));

      expect(screen.getByText('A B')).toBeInTheDocument();
      expect(screen.getByText('AB')).toBeInTheDocument(); // initials
    });
  });

  describe('Responsive Design Classes', () => {
    it('applies responsive grid classes', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockPlayer,
        error: null,
      });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      
      (mockSupabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const params = Promise.resolve({ id: '123' });
      const { container } = render(await PlayerDashboard({ params }));

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
});