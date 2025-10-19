// __tests__/PlayerCards.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import PlayerCards from '../PlayerCards';

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill, className }: any) => (
    <img
      src={src}
      alt={alt}
      data-fill={fill}
      className={className}
      data-testid="player-image"
    />
  ),
}));

// Mock Button component
jest.mock('../../ui/button', () => ({
  Button: ({ children, onClick, variant, className }: any) => (
    <button
      onClick={onClick}
      data-variant={variant}
      className={className}
      data-testid="see-details-button"
    >
      {children}
    </button>
  ),
}));

// Mock fetch
global.fetch = jest.fn();

describe('PlayerCards', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  };

  const mockPlayers = [
    {
      id: 'player-1',
      first_name: 'LeBron',
      last_name: 'James',
      position: 'SF',
      avatar_url: '/avatars/lebron.jpg',
      jersey_number: 23,
      team_id: 'team-1',
    },
    {
      id: 'player-2',
      first_name: 'Stephen',
      last_name: 'Curry',
      position: 'PG',
      avatar_url: '/avatars/curry.jpg',
      jersey_number: 30,
      team_id: 'team-2',
    },
    {
      id: 'player-3',
      first_name: 'Kevin',
      last_name: 'Durant',
      position: 'PF',
      avatar_url: '/avatars/durant.jpg',
      jersey_number: 35,
      team_id: 'team-3',
    },
  ];

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading message initially', () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<PlayerCards />);

      expect(screen.getByText('Loading players...')).toBeInTheDocument();
    });

    it('should apply loading message styling', () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<PlayerCards />);

      const loadingMessage = screen.getByText('Loading players...');
      expect(loadingMessage).toHaveClass('text-center');
      expect(loadingMessage).toHaveClass('text-black');
    });
  });

  describe('Successful Data Fetching', () => {
    it('should fetch players on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayers,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/players');
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });

    it('should display page title', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayers,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        expect(screen.getByText('Players')).toBeInTheDocument();
      });
    });

    it('should render all player cards', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayers,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        expect(screen.getByText('LeBron James')).toBeInTheDocument();
        expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
        expect(screen.getByText('Kevin Durant')).toBeInTheDocument();
      });
    });

    it('should display player names correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayers,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        expect(screen.getByText('LeBron James')).toBeInTheDocument();
      });
    });

    it('should display player positions', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayers,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        expect(screen.getByText('SF')).toBeInTheDocument();
        expect(screen.getByText('PG')).toBeInTheDocument();
        expect(screen.getByText('PF')).toBeInTheDocument();
      });
    });

    it('should display jersey numbers', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayers,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        expect(screen.getByText('#23')).toBeInTheDocument();
        expect(screen.getByText('#30')).toBeInTheDocument();
        expect(screen.getByText('#35')).toBeInTheDocument();
      });
    });

    it('should render player images with correct src', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayers,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        const images = screen.getAllByTestId('player-image');
        expect(images[0]).toHaveAttribute('src', '/avatars/lebron.jpg');
        expect(images[1]).toHaveAttribute('src', '/avatars/curry.jpg');
        expect(images[2]).toHaveAttribute('src', '/avatars/durant.jpg');
      });
    });

    it('should render player images with correct alt text', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayers,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        expect(screen.getByAltText('LeBron James')).toBeInTheDocument();
        expect(screen.getByAltText('Stephen Curry')).toBeInTheDocument();
        expect(screen.getByAltText('Kevin Durant')).toBeInTheDocument();
      });
    });

    it('should use placeholder image when avatar_url is missing', async () => {
      const playersWithoutAvatar = [
        {
          id: 'player-1',
          first_name: 'John',
          last_name: 'Doe',
          position: 'SG',
          avatar_url: '',
          jersey_number: 10,
          team_id: 'team-1',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => playersWithoutAvatar,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        const image = screen.getByTestId('player-image');
        expect(image).toHaveAttribute(
          'src',
          '/placeholder.svg?height=400&width=300'
        );
      });
    });

    it('should display "See Details" buttons for all players', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayers,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        const buttons = screen.getAllByText('See Details');
        expect(buttons).toHaveLength(3);
      });
    });

    it('should display POS and NO. labels', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayers,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        const posLabels = screen.getAllByText('POS');
        const noLabels = screen.getAllByText('NO.');
        expect(posLabels.length).toBeGreaterThan(0);
        expect(noLabels.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to player details when "See Details" is clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayers,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        expect(screen.getByText('LeBron James')).toBeInTheDocument();
      });

      const buttons = screen.getAllByTestId('see-details-button');
      fireEvent.click(buttons[0]);

      expect(mockPush).toHaveBeenCalledWith('/player/player-1');
    });

    it('should navigate to correct player page for each player', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayers,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
      });

      const buttons = screen.getAllByTestId('see-details-button');
      
      fireEvent.click(buttons[0]);
      expect(mockPush).toHaveBeenCalledWith('/player/player-1');

      fireEvent.click(buttons[1]);
      expect(mockPush).toHaveBeenCalledWith('/player/player-2');

      fireEvent.click(buttons[2]);
      expect(mockPush).toHaveBeenCalledWith('/player/player-3');
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch error gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<PlayerCards />);

      await waitFor(() => {
        expect(screen.queryByText('Loading players...')).not.toBeInTheDocument();
      });

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('should handle non-ok response', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        expect(screen.queryByText('Loading players...')).not.toBeInTheDocument();
      });

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('should render empty grid when no players', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const { container } = render(<PlayerCards />);

      await waitFor(() => {
        expect(screen.queryByText('Loading players...')).not.toBeInTheDocument();
      });

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid?.children.length).toBe(0);
    });
  });

  describe('UI Structure and Styling', () => {
    it('should render grid layout', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayers,
      });

      const { container } = render(<PlayerCards />);

      await waitFor(() => {
        const grid = container.querySelector('.grid');
        expect(grid).toHaveClass('grid-cols-2');
        expect(grid).toHaveClass('md:grid-cols-3');
        expect(grid).toHaveClass('lg:grid-cols-4');
        expect(grid).toHaveClass('xl:grid-cols-5');
      });
    });

    it('should apply correct styling to title', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayers,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        const title = screen.getByText('Players');
        expect(title).toHaveClass('text-3xl');
        expect(title).toHaveClass('font-bold');
        expect(title).toHaveClass('text-black');
      });
    });

    it('should apply hover effects to player cards', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayers,
      });

      const { container } = render(<PlayerCards />);

      await waitFor(() => {
        const cards = container.querySelectorAll('.group');
        expect(cards[0]).toHaveClass('hover:scale-105');
      });
    });

    it('should render player info section', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayers,
      });

      const { container } = render(<PlayerCards />);

      await waitFor(() => {
        const infoSections = container.querySelectorAll('.bg-black\\/10');
        expect(infoSections.length).toBeGreaterThan(0);
      });
    });

    it('should apply line-clamp to player names', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlayers,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        const nameElement = screen.getByText('LeBron James');
        expect(nameElement).toHaveClass('line-clamp-1');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle single player', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [mockPlayers[0]],
      });

      render(<PlayerCards />);

      await waitFor(() => {
        expect(screen.getByText('LeBron James')).toBeInTheDocument();
        expect(screen.queryByText('Stephen Curry')).not.toBeInTheDocument();
      });
    });

    it('should handle very long player names', async () => {
      const longNamePlayer = [
        {
          id: 'player-1',
          first_name: 'Alexander Christopher',
          last_name: 'Montgomery-Wellington III',
          position: 'C',
          avatar_url: '/avatar.jpg',
          jersey_number: 99,
          team_id: 'team-1',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => longNamePlayer,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        expect(
          screen.getByText('Alexander Christopher Montgomery-Wellington III')
        ).toBeInTheDocument();
      });
    });

    it('should handle jersey number 0', async () => {
      const playerWithZero = [
        {
          id: 'player-1',
          first_name: 'Russell',
          last_name: 'Westbrook',
          position: 'PG',
          avatar_url: '/russ.jpg',
          jersey_number: 0,
          team_id: 'team-1',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => playerWithZero,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        expect(screen.getByText('#0')).toBeInTheDocument();
      });
    });

    it('should handle special characters in names', async () => {
      const specialCharPlayer = [
        {
          id: 'player-1',
          first_name: "Luka",
          last_name: "Dončić",
          position: 'PG',
          avatar_url: '/luka.jpg',
          jersey_number: 77,
          team_id: 'team-1',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => specialCharPlayer,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        expect(screen.getByText('Luka Dončić')).toBeInTheDocument();
      });
    });

    it('should handle large number of players', async () => {
      const manyPlayers = Array(50)
        .fill(null)
        .map((_, i) => ({
          id: `player-${i}`,
          first_name: `Player`,
          last_name: `${i}`,
          position: 'PG',
          avatar_url: `/avatar${i}.jpg`,
          jersey_number: i,
          team_id: `team-${i}`,
        }));

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => manyPlayers,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        const buttons = screen.getAllByText('See Details');
        expect(buttons).toHaveLength(50);
      });
    });

    it('should handle different position abbreviations', async () => {
      const variousPositions = [
        { ...mockPlayers[0], position: 'PG' },
        { ...mockPlayers[1], position: 'SG' },
        { ...mockPlayers[2], position: 'SF' },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => variousPositions,
      });

      render(<PlayerCards />);

      await waitFor(() => {
        expect(screen.getByText('PG')).toBeInTheDocument();
        expect(screen.getByText('SG')).toBeInTheDocument();
        expect(screen.getByText('SF')).toBeInTheDocument();
      });
    });
  });

  describe('Component Integration', () => {
    it('should render all player card elements together', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [mockPlayers[0]],
      });

      render(<PlayerCards />);

      await waitFor(() => {
        // Name
        expect(screen.getByText('LeBron James')).toBeInTheDocument();
        // Position
        expect(screen.getByText('SF')).toBeInTheDocument();
        // Jersey number
        expect(screen.getByText('#23')).toBeInTheDocument();
        // Button
        expect(screen.getByText('See Details')).toBeInTheDocument();
        // Image
        expect(screen.getByAltText('LeBron James')).toBeInTheDocument();
      });
    });

    it('should maintain player card structure', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [mockPlayers[0]],
      });

      const { container } = render(<PlayerCards />);

      await waitFor(() => {
        const card = container.querySelector('.group.relative');
        expect(card).toBeInTheDocument();
        
        const imageContainer = container.querySelector('.aspect-\\[3\\/4\\]');
        expect(imageContainer).toBeInTheDocument();
        
        const infoSection = card?.querySelector('.p-3');
        expect(infoSection).toBeInTheDocument();
      });
    });
  });
});