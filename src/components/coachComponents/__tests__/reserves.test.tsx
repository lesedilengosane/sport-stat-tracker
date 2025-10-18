// src/components/coachComponents/__tests__/reserves.test.tsx
import { render, screen } from '@testing-library/react';
import { Reserves } from '../reserves';
import type { Player } from '@/types/player';

// Mock PlayerCard component
jest.mock('../playerCard', () => ({
  PlayerCard: ({ player }: { player: Player }) => (
    <div data-testid={`player-card-${player.playerID}`}>
      {player.name}
    </div>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Plus: () => <span data-testid="plus-icon">+</span>,
}));

const mockPlayers: Player[] = [
  {
    playerID: 'player-1',
    teamID: 'team-1',
    name: 'LeBron James',
    position: 'SF',
    jerseyNumber: 23,
    isStarting: false,
    profileImage: '/lebron.jpg',
  },
  {
    playerID: 'player-2',
    teamID: 'team-1',
    name: 'Stephen Curry',
    position: 'PG',
    jerseyNumber: 30,
    isStarting: false,
    profileImage: '/curry.jpg',
  },
  {
    playerID: 'player-3',
    teamID: 'team-1',
    name: 'Kevin Durant',
    position: 'SF',
    jerseyNumber: 35,
    isStarting: false,
    profileImage: '/durant.jpg',
  },
];

describe('Reserves', () => {
  let onAddPlayer: jest.Mock;

  beforeEach(() => {
    onAddPlayer = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component title', () => {
      render(<Reserves players={[]} onAddPlayer={onAddPlayer} />);
      
      expect(screen.getByText('Reserves')).toBeInTheDocument();
    });

    it('should render Card with correct styling classes', () => {
      const { container } = render(<Reserves players={[]} onAddPlayer={onAddPlayer} />);
      
      const card = container.firstChild;
      expect(card).toHaveClass(
        'h-full',
        'flex',
        'flex-col',
        'bg-white/50',
        'backdrop-blur-sm',
        'border-orange-500/20'
      );
    });

    it('should render CardHeader with correct classes', () => {
      const { container } = render(<Reserves players={[]} onAddPlayer={onAddPlayer} />);
      
      const cardHeader = container.querySelector('.pb-4.flex-shrink-0');
      expect(cardHeader).toBeInTheDocument();
    });

    it('should render title with correct styling', () => {
      render(<Reserves players={[]} onAddPlayer={onAddPlayer} />);
      
      const title = screen.getByText('Reserves');
      expect(title).toHaveClass('text-xl', 'font-semibold', 'text-orange-400');
    });
  });

  describe('Empty State', () => {
    it('should show empty state message when no players', () => {
      render(<Reserves players={[]} onAddPlayer={onAddPlayer} />);
      
      expect(screen.getByText('Players should appear here')).toBeInTheDocument();
    });

    it('should show empty state with correct styling', () => {
      render(<Reserves players={[]} onAddPlayer={onAddPlayer} />);
      
      const emptyMessage = screen.getByText('Players should appear here');
      expect(emptyMessage).toHaveClass('text-lg');
      expect(emptyMessage.parentElement).toHaveClass('text-center', 'text-gray-300');
    });

    it('should not render PlayerCard components when empty', () => {
      const { container } = render(<Reserves players={[]} onAddPlayer={onAddPlayer} />);
      
      const playerCards = container.querySelectorAll('[data-testid^="player-card-"]');
      expect(playerCards).toHaveLength(0);
    });
  });

  describe('With Players', () => {
    it('should render all players', () => {
      render(<Reserves players={mockPlayers} onAddPlayer={onAddPlayer} />);
      
      expect(screen.getByTestId('player-card-player-1')).toBeInTheDocument();
      expect(screen.getByTestId('player-card-player-2')).toBeInTheDocument();
      expect(screen.getByTestId('player-card-player-3')).toBeInTheDocument();
    });

    it('should render correct number of PlayerCard components', () => {
      const { container } = render(<Reserves players={mockPlayers} onAddPlayer={onAddPlayer} />);
      
      const playerCards = container.querySelectorAll('[data-testid^="player-card-"]');
      expect(playerCards).toHaveLength(3);
    });

    it('should not show empty state message when players exist', () => {
      render(<Reserves players={mockPlayers} onAddPlayer={onAddPlayer} />);
      
      expect(screen.queryByText('Players should appear here')).not.toBeInTheDocument();
    });

    it('should render single player correctly', () => {
      const singlePlayer = [mockPlayers[0]];
      render(<Reserves players={singlePlayer} onAddPlayer={onAddPlayer} />);
      
      expect(screen.getByTestId('player-card-player-1')).toBeInTheDocument();
      expect(screen.queryByText('Players should appear here')).not.toBeInTheDocument();
    });

    it('should render players with correct keys', () => {
      const { container } = render(<Reserves players={mockPlayers} onAddPlayer={onAddPlayer} />);
      
      mockPlayers.forEach(player => {
        const playerCard = container.querySelector(`[data-testid="player-card-${player.playerID}"]`);
        expect(playerCard).toBeInTheDocument();
      });
    });
  });

  describe('Scrollable Area', () => {
    it('should have scrollable container with correct classes', () => {
      const { container } = render(<Reserves players={mockPlayers} onAddPlayer={onAddPlayer} />);
      
      const scrollContainer = container.querySelector('.overflow-y-auto');
      expect(scrollContainer).toHaveClass(
        'flex-1',
        'overflow-y-auto',
        'scrollbar-thin',
        'scrollbar-thumb-orange-500/50',
        'scrollbar-track-transparent',
        'pr-2',
        'min-h-0'
      );
    });

    it('should have space-y-3 for player cards spacing', () => {
      const { container } = render(<Reserves players={mockPlayers} onAddPlayer={onAddPlayer} />);
      
      const playerContainer = container.querySelector('.space-y-3');
      expect(playerContainer).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should have correct CardContent layout classes', () => {
      const { container } = render(<Reserves players={[]} onAddPlayer={onAddPlayer} />);
      
      const cardContent = container.querySelector('.flex-1.flex.flex-col.p-4.min-h-0');
      expect(cardContent).toBeInTheDocument();
    });

    it('should have footer section with correct styling', () => {
      const { container } = render(<Reserves players={[]} onAddPlayer={onAddPlayer} />);
      
      const footer = container.querySelector('.flex-shrink-0.border-t.border-orange-500\\/20.pt-4.mt-4');
      expect(footer).toBeInTheDocument();
    });

    it('should have proper flex-shrink-0 on header', () => {
      const { container } = render(<Reserves players={[]} onAddPlayer={onAddPlayer} />);
      
      const header = container.querySelector('.flex-shrink-0');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Dynamic Player Lists', () => {
    it('should handle adding players dynamically', () => {
      const { rerender } = render(<Reserves players={[]} onAddPlayer={onAddPlayer} />);
      
      expect(screen.getByText('Players should appear here')).toBeInTheDocument();
      
      rerender(<Reserves players={[mockPlayers[0]]} onAddPlayer={onAddPlayer} />);
      
      expect(screen.queryByText('Players should appear here')).not.toBeInTheDocument();
      expect(screen.getByTestId('player-card-player-1')).toBeInTheDocument();
    });

    it('should handle removing all players', () => {
      const { rerender } = render(<Reserves players={mockPlayers} onAddPlayer={onAddPlayer} />);
      
      expect(screen.getByTestId('player-card-player-1')).toBeInTheDocument();
      
      rerender(<Reserves players={[]} onAddPlayer={onAddPlayer} />);
      
      expect(screen.queryByTestId('player-card-player-1')).not.toBeInTheDocument();
      expect(screen.getByText('Players should appear here')).toBeInTheDocument();
    });

    it('should update when players array changes', () => {
      const { rerender } = render(<Reserves players={[mockPlayers[0]]} onAddPlayer={onAddPlayer} />);
      
      expect(screen.getByTestId('player-card-player-1')).toBeInTheDocument();
      expect(screen.queryByTestId('player-card-player-2')).not.toBeInTheDocument();
      
      rerender(<Reserves players={[mockPlayers[0], mockPlayers[1]]} onAddPlayer={onAddPlayer} />);
      
      expect(screen.getByTestId('player-card-player-1')).toBeInTheDocument();
      expect(screen.getByTestId('player-card-player-2')).toBeInTheDocument();
    });
  });

  describe('Large Player Lists', () => {
    it('should handle many players', () => {
      const manyPlayers: Player[] = Array.from({ length: 20 }, (_, i) => ({
        playerID: `player-${i}`,
        teamID: 'team-1',
        name: `Player ${i}`,
        position: 'PG',
        jerseyNumber: i,
        isStarting: false,
        profileImage: `/player${i}.jpg`,
      }));

      const { container } = render(<Reserves players={manyPlayers} onAddPlayer={onAddPlayer} />);
      
      const playerCards = container.querySelectorAll('[data-testid^="player-card-"]');
      expect(playerCards).toHaveLength(20);
    });

    it('should render first and last player in large list', () => {
      const manyPlayers: Player[] = Array.from({ length: 15 }, (_, i) => ({
        playerID: `player-${i}`,
        teamID: 'team-1',
        name: `Player ${i}`,
        position: 'PG',
        jerseyNumber: i,
        isStarting: false,
        profileImage: `/player${i}.jpg`,
      }));

      render(<Reserves players={manyPlayers} onAddPlayer={onAddPlayer} />);
      
      expect(screen.getByTestId('player-card-player-0')).toBeInTheDocument();
      expect(screen.getByTestId('player-card-player-14')).toBeInTheDocument();
    });
  });

  describe('Different Player Configurations', () => {
    it('should handle players with different positions', () => {
      const diversePlayers: Player[] = [
        { ...mockPlayers[0], position: 'PG' },
        { ...mockPlayers[1], position: 'SG' },
        { ...mockPlayers[2], position: 'C' },
      ];

      render(<Reserves players={diversePlayers} onAddPlayer={onAddPlayer} />);
      
      expect(screen.getByTestId('player-card-player-1')).toBeInTheDocument();
      expect(screen.getByTestId('player-card-player-2')).toBeInTheDocument();
      expect(screen.getByTestId('player-card-player-3')).toBeInTheDocument();
    });

    it('should handle players with same team', () => {
      const sameTeamPlayers = mockPlayers.map(p => ({ ...p, teamID: 'same-team' }));
      
      render(<Reserves players={sameTeamPlayers} onAddPlayer={onAddPlayer} />);
      
      const { container } = render(<Reserves players={sameTeamPlayers} onAddPlayer={onAddPlayer} />);
      const playerCards = container.querySelectorAll('[data-testid^="player-card-"]');
      expect(playerCards).toHaveLength(3);
    });
  });

  describe('Component Props', () => {
    it('should accept empty players array', () => {
      expect(() => {
        render(<Reserves players={[]} onAddPlayer={onAddPlayer} />);
      }).not.toThrow();
    });

    it('should accept onAddPlayer callback', () => {
      const customCallback = jest.fn();
      
      render(<Reserves players={[]} onAddPlayer={customCallback} />);
      
      // Component renders successfully with callback
      expect(screen.getByText('Reserves')).toBeInTheDocument();
    });

    it('should maintain player order', () => {
      const { container } = render(<Reserves players={mockPlayers} onAddPlayer={onAddPlayer} />);
      
      const playerCards = container.querySelectorAll('[data-testid^="player-card-"]');
      expect(playerCards[0]).toHaveAttribute('data-testid', 'player-card-player-1');
      expect(playerCards[1]).toHaveAttribute('data-testid', 'player-card-player-2');
      expect(playerCards[2]).toHaveAttribute('data-testid', 'player-card-player-3');
    });
  });

  describe('Accessibility', () => {
    it('should render title element', () => {
      render(<Reserves players={[]} onAddPlayer={onAddPlayer} />);
      
      const title = screen.getByText('Reserves');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('DIV');
    });

    it('should render empty state in accessible container', () => {
      render(<Reserves players={[]} onAddPlayer={onAddPlayer} />);
      
      const emptyState = screen.getByText('Players should appear here');
      expect(emptyState.parentElement).toHaveClass('text-center');
    });
  });
});