// src/components/coachComponents/__tests__/courtPlayer.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CourtPlayer } from '../courtPlayer';
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

const mockPlayer: Player = {
  playerID: 'player-1',
  teamID: 'team-1',
  name: 'LeBron James',
  position: 'SF',
  jerseyNumber: 23,
  isStarting: true,
  profileImage: '/lebron.jpg',
};

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

describe('CourtPlayer', () => {
  let onDragStart: jest.Mock;

  beforeEach(() => {
    onDragStart = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render player with correct position', () => {
      const position = { x: 50, y: 50 };
      const { container } = render(
        <CourtPlayer player={mockPlayer} position={position} onDragStart={onDragStart} />
      );

      const playerElement = container.firstChild as HTMLElement;
      expect(playerElement).toHaveStyle({ left: '50%', top: '50%' });
    });

    it('should render player image with correct src', () => {
      const position = { x: 30, y: 40 };
      render(<CourtPlayer player={mockPlayer} position={position} onDragStart={onDragStart} />);

      const image = screen.getByTestId('player-image');
      expect(image).toHaveAttribute('src', '/lebron.jpg');
    });

    it('should render player image with correct alt text', () => {
      const position = { x: 30, y: 40 };
      render(<CourtPlayer player={mockPlayer} position={position} onDragStart={onDragStart} />);

      const image = screen.getByAltText('LeBron James');
      expect(image).toBeInTheDocument();
    });

    it('should render player image with correct dimensions', () => {
      const position = { x: 30, y: 40 };
      render(<CourtPlayer player={mockPlayer} position={position} onDragStart={onDragStart} />);

      const image = screen.getByTestId('player-image');
      expect(image).toHaveAttribute('width', '64');
      expect(image).toHaveAttribute('height', '64');
    });

    it('should use placeholder image when profileImage is empty', () => {
      const playerWithPlaceholder = { ...mockPlayer, profileImage: '/placeholder.svg' };
      const position = { x: 30, y: 40 };
      
      render(<CourtPlayer player={playerWithPlaceholder} position={position} onDragStart={onDragStart} />);

      const image = screen.getByTestId('player-image');
      expect(image).toHaveAttribute('src', '/placeholder.svg');
    });
  });

  describe('Draggable Functionality', () => {
    it('should be draggable', () => {
      const position = { x: 50, y: 50 };
      const { container } = render(
        <CourtPlayer player={mockPlayer} position={position} onDragStart={onDragStart} />
      );

      const playerElement = container.firstChild as HTMLElement;
      expect(playerElement).toHaveAttribute('draggable', 'true');
    });

    it('should call onDragStart when drag starts', () => {
      const position = { x: 50, y: 50 };
      const { container } = render(
        <CourtPlayer player={mockPlayer} position={position} onDragStart={onDragStart} />
      );

      const playerElement = container.firstChild as HTMLElement;
      const mockDataTransfer = createMockDataTransfer();

      fireEvent.dragStart(playerElement, {
        dataTransfer: mockDataTransfer,
      });

      expect(onDragStart).toHaveBeenCalledTimes(1);
      expect(onDragStart).toHaveBeenCalledWith(mockPlayer);
    });

    it('should set correct dataTransfer data on drag start', () => {
      const position = { x: 50, y: 50 };
      const { container } = render(
        <CourtPlayer player={mockPlayer} position={position} onDragStart={onDragStart} />
      );

      const playerElement = container.firstChild as HTMLElement;
      const mockDataTransfer = createMockDataTransfer();

      fireEvent.dragStart(playerElement, {
        dataTransfer: mockDataTransfer,
      });

      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'application/json',
        JSON.stringify(mockPlayer)
      );
      expect(mockDataTransfer.effectAllowed).toBe('move');
    });
  });

  describe('Styling', () => {
    it('should have correct container classes', () => {
      const position = { x: 50, y: 50 };
      const { container } = render(
        <CourtPlayer player={mockPlayer} position={position} onDragStart={onDragStart} />
      );

      const playerElement = container.firstChild as HTMLElement;
      expect(playerElement).toHaveClass('absolute', 'transform', '-translate-x-1/2', '-translate-y-1/2', 'cursor-move', 'z-20');
    });

    it('should have correct inner div classes', () => {
      const position = { x: 50, y: 50 };
      render(<CourtPlayer player={mockPlayer} position={position} onDragStart={onDragStart} />);

      const innerDiv = screen.getByAltText('LeBron James').parentElement;
      expect(innerDiv).toHaveClass(
        'w-16',
        'h-16',
        'rounded-full',
        'overflow-hidden',
        'bg-white/90',
        'backdrop-blur-sm',
        'shadow-lg',
        'border-2',
        'border-orange-500',
        'hover:scale-105',
        'transition-transform'
      );
    });
  });

  describe('Position Variations', () => {
    it('should handle position at top-left corner', () => {
      const position = { x: 0, y: 0 };
      const { container } = render(
        <CourtPlayer player={mockPlayer} position={position} onDragStart={onDragStart} />
      );

      const playerElement = container.firstChild as HTMLElement;
      expect(playerElement).toHaveStyle({ left: '0%', top: '0%' });
    });

    it('should handle position at bottom-right corner', () => {
      const position = { x: 100, y: 100 };
      const { container } = render(
        <CourtPlayer player={mockPlayer} position={position} onDragStart={onDragStart} />
      );

      const playerElement = container.firstChild as HTMLElement;
      expect(playerElement).toHaveStyle({ left: '100%', top: '100%' });
    });

    it('should handle decimal positions', () => {
      const position = { x: 33.33, y: 66.67 };
      const { container } = render(
        <CourtPlayer player={mockPlayer} position={position} onDragStart={onDragStart} />
      );

      const playerElement = container.firstChild as HTMLElement;
      expect(playerElement).toHaveStyle({ left: '33.33%', top: '66.67%' });
    });
  });

  describe('Different Players', () => {
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
      const position = { x: 50, y: 50 };

      render(<CourtPlayer player={differentPlayer} position={position} onDragStart={onDragStart} />);

      expect(screen.getByAltText('Stephen Curry')).toBeInTheDocument();
      expect(screen.getByTestId('player-image')).toHaveAttribute('src', '/curry.jpg');
    });

    it('should call onDragStart with correct player data', () => {
      const player1: Player = {
        playerID: 'player-1',
        teamID: 'team-1',
        name: 'Player One',
        position: 'PG',
        jerseyNumber: 1,
        isStarting: true,
        profileImage: '/player1.jpg',
      };
      const position = { x: 50, y: 50 };

      const { container, rerender } = render(
        <CourtPlayer player={player1} position={position} onDragStart={onDragStart} />
      );

      const playerElement = container.firstChild as HTMLElement;
      const mockDataTransfer1 = createMockDataTransfer();

      fireEvent.dragStart(playerElement, {
        dataTransfer: mockDataTransfer1,
      });

      expect(onDragStart).toHaveBeenCalledWith(player1);

      const player2: Player = {
        playerID: 'player-2',
        teamID: 'team-1',
        name: 'Player Two',
        position: 'SG',
        jerseyNumber: 2,
        isStarting: true,
        profileImage: '/player2.jpg',
      };

      rerender(<CourtPlayer player={player2} position={position} onDragStart={onDragStart} />);
      
      const mockDataTransfer2 = createMockDataTransfer();
      fireEvent.dragStart(playerElement, {
        dataTransfer: mockDataTransfer2,
      });

      expect(onDragStart).toHaveBeenCalledWith(player2);
    });
  });
});