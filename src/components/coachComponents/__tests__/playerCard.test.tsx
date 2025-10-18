// src/components/coachComponents/__tests__/playerCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerCard } from '../playerCard';
import type { Player } from '@/types/player';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className }: any) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-testid="player-image"
    />
  ),
}));

// Helper function to create a mock dataTransfer object
const createMockDataTransfer = () => ({
  setData: jest.fn(),
  getData: jest.fn(),
  clearData: jest.fn(),
  effectAllowed: 'none' as DataTransfer['effectAllowed'],
  dropEffect: 'none' as DataTransfer['dropEffect'],
  files: [] as any,
  items: [] as any,
  types: [] as any,
  setDragImage: jest.fn(),
});

const mockPlayer: Player = {
  playerID: 'player-1',
  teamID: 'team-1',
  name: 'LeBron James',
  position: 'SF',
  jerseyNumber: 23,
  isStarting: true,
  profileImage: '/lebron.jpg',
};

describe('PlayerCard', () => {
  describe('Rendering', () => {
    it('should render player name', () => {
      render(<PlayerCard player={mockPlayer} />);
      
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });

    it('should render player position', () => {
      render(<PlayerCard player={mockPlayer} />);
      
      expect(screen.getByText('SF')).toBeInTheDocument();
    });

    it('should render jersey number', () => {
      render(<PlayerCard player={mockPlayer} />);
      
      expect(screen.getByText('23')).toBeInTheDocument();
    });

    it('should render player image with correct src', () => {
      render(<PlayerCard player={mockPlayer} />);
      
      const image = screen.getByTestId('player-image');
      expect(image).toHaveAttribute('src', '/lebron.jpg');
    });

    it('should render player image with correct alt text', () => {
      render(<PlayerCard player={mockPlayer} />);
      
      const image = screen.getByAltText('LeBron James');
      expect(image).toBeInTheDocument();
    });

    it('should render player image with correct dimensions', () => {
      render(<PlayerCard player={mockPlayer} />);
      
      const image = screen.getByTestId('player-image');
      expect(image).toHaveAttribute('width', '40');
      expect(image).toHaveAttribute('height', '40');
    });

    it('should use placeholder image when profileImage is null', () => {
      const playerWithoutImage = { ...mockPlayer, profileImage: '' };
      render(<PlayerCard player={playerWithoutImage} />);
      
      const image = screen.getByTestId('player-image');
      expect(image).toHaveAttribute('src', '/placeholder.svg');
    });

    it('should render different player correctly', () => {
      const differentPlayer: Player = {
        playerID: 'player-2',
        teamID: 'team-1',
        name: 'Stephen Curry',
        position: 'PG',
        jerseyNumber: 30,
        isStarting: true,
        profileImage: '/curry.jpg',
      };

      render(<PlayerCard player={differentPlayer} />);
      
      expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
      expect(screen.getByText('PG')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByTestId('player-image')).toHaveAttribute('src', '/curry.jpg');
    });
  });

  describe('Styling', () => {
    it('should apply default styling when not dragging', () => {
      const { container } = render(<PlayerCard player={mockPlayer} />);
      
      const card = container.querySelector('.cursor-move');
      expect(card).toBeInTheDocument();
      expect(card).not.toHaveClass('opacity-50', 'scale-95');
    });

    it('should apply dragging styling when isDragging is true', () => {
      const { container } = render(<PlayerCard player={mockPlayer} isDragging={true} />);
      
      const card = container.querySelector('.cursor-move');
      expect(card).toHaveClass('opacity-50', 'scale-95');
    });

    it('should not apply dragging styling when isDragging is false', () => {
      const { container } = render(<PlayerCard player={mockPlayer} isDragging={false} />);
      
      const card = container.querySelector('.cursor-move');
      expect(card).not.toHaveClass('opacity-50', 'scale-95');
    });

    it('should have jersey number with correct styling classes', () => {
      render(<PlayerCard player={mockPlayer} />);
      
      const jerseyNumber = screen.getByText('23');
      expect(jerseyNumber).toHaveClass(
        'w-8',
        'h-8',
        'bg-orange-500',
        'rounded-full',
        'flex',
        'items-center',
        'justify-center',
        'text-white',
        'font-bold',
        'text-sm'
      );
    });

    it('should have player name with correct styling classes', () => {
      render(<PlayerCard player={mockPlayer} />);
      
      const playerName = screen.getByText('LeBron James');
      expect(playerName).toHaveClass('text-orange-400', 'font-medium', 'text-sm', 'truncate');
    });

    it('should have position with correct styling classes', () => {
      render(<PlayerCard player={mockPlayer} />);
      
      const position = screen.getByText('SF');
      expect(position).toHaveClass('text-gray-400', 'text-xs');
    });
  });

  describe('Draggable Functionality', () => {
    it('should be draggable', () => {
      const { container } = render(<PlayerCard player={mockPlayer} />);
      
      const card = container.querySelector('.cursor-move');
      expect(card).toHaveAttribute('draggable', 'true');
    });

    it('should set dataTransfer data on drag start', () => {
      const { container } = render(<PlayerCard player={mockPlayer} />);
      
      const card = container.querySelector('.cursor-move') as HTMLElement;
      const mockDataTransfer = createMockDataTransfer();

      fireEvent.dragStart(card, {
        dataTransfer: mockDataTransfer,
      });

      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'application/json',
        JSON.stringify(mockPlayer)
      );
      expect(mockDataTransfer.effectAllowed).toBe('move');
    });

    it('should set correct player data for different players', () => {
      const player1: Player = {
        playerID: 'player-1',
        teamID: 'team-1',
        name: 'Player One',
        position: 'PG',
        jerseyNumber: 1,
        isStarting: true,
        profileImage: '/player1.jpg',
      };

      const { container, rerender } = render(<PlayerCard player={player1} />);
      
      const card = container.querySelector('.cursor-move') as HTMLElement;
      const mockDataTransfer1 = createMockDataTransfer();

      fireEvent.dragStart(card, {
        dataTransfer: mockDataTransfer1,
      });

      expect(mockDataTransfer1.setData).toHaveBeenCalledWith(
        'application/json',
        JSON.stringify(player1)
      );

      const player2: Player = {
        playerID: 'player-2',
        teamID: 'team-1',
        name: 'Player Two',
        position: 'SG',
        jerseyNumber: 2,
        isStarting: true,
        profileImage: '/player2.jpg',
      };

      rerender(<PlayerCard player={player2} />);
      
      const mockDataTransfer2 = createMockDataTransfer();
      fireEvent.dragStart(card, {
        dataTransfer: mockDataTransfer2,
      });

      expect(mockDataTransfer2.setData).toHaveBeenCalledWith(
        'application/json',
        JSON.stringify(player2)
      );
    });
  });

  describe('Jersey Number Variations', () => {
    it('should handle single digit jersey numbers', () => {
      const playerWithSingleDigit = { ...mockPlayer, jerseyNumber: 5 };
      render(<PlayerCard player={playerWithSingleDigit} />);
      
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should handle double digit jersey numbers', () => {
      const playerWithDoubleDigit = { ...mockPlayer, jerseyNumber: 99 };
      render(<PlayerCard player={playerWithDoubleDigit} />);
      
      expect(screen.getByText('99')).toBeInTheDocument();
    });

    it('should handle zero jersey number', () => {
      const playerWithZero = { ...mockPlayer, jerseyNumber: 0 };
      render(<PlayerCard player={playerWithZero} />);
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Long Names', () => {
    it('should handle long player names with truncate class', () => {
      const playerWithLongName = {
        ...mockPlayer,
        name: 'Very Long Player Name That Should Be Truncated',
      };
      render(<PlayerCard player={playerWithLongName} />);
      
      const playerName = screen.getByText('Very Long Player Name That Should Be Truncated');
      expect(playerName).toHaveClass('truncate');
    });
  });

  describe('Different Positions', () => {
    it.each([
      ['PG', 'Point Guard'],
      ['SG', 'Shooting Guard'],
      ['SF', 'Small Forward'],
      ['PF', 'Power Forward'],
      ['C', 'Center'],
    ])('should render position %s correctly', (position) => {
      const playerWithPosition = { ...mockPlayer, position };
      render(<PlayerCard player={playerWithPosition} />);
      
      expect(screen.getByText(position)).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have correct Card component structure', () => {
      const { container } = render(<PlayerCard player={mockPlayer} />);
      
      const card = container.querySelector('.cursor-move');
      expect(card).toBeInTheDocument();
      
      const cardContent = card?.querySelector('.p-3');
      expect(cardContent).toBeInTheDocument();
    });

    it('should have flex layout with correct gap', () => {
      const { container } = render(<PlayerCard player={mockPlayer} />);
      
      const flexContainer = container.querySelector('.flex.items-center.gap-3');
      expect(flexContainer).toBeInTheDocument();
    });

    it('should have player image container with correct styling', () => {
      const { container } = render(<PlayerCard player={mockPlayer} />);
      
      const imageContainer = screen.getByTestId('player-image').parentElement;
      expect(imageContainer).toHaveClass(
        'w-10',
        'h-10',
        'rounded-full',
        'overflow-hidden',
        'bg-gray-600/30'
      );
    });
  });
});