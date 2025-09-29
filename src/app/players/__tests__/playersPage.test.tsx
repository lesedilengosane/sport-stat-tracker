import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayersPage from '../page';
import { supabase } from '../../api/DatabaseApi/supabaseClient';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock Supabase client
jest.mock('../../api/DatabaseApi/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock PlayersList component
jest.mock('../PlayersList', () => {
  return function MockPlayersList({ players }: { players: any[] }) {
    return (
      <div data-testid="players-list">
        {players.map((player) => (
          <div key={player.player_id} data-testid={`player-${player.player_id}`}>
            {player.first_name} {player.last_name}
          </div>
        ))}
      </div>
    );
  };
});

describe('PlayersPage Component', () => {
  const mockPlayers = [
    {
      player_id: '1',
      first_name: 'LeBron',
      last_name: 'James',
      position: 'Forward',
      jersey_number: 23,
    },
    {
      player_id: '2',
      first_name: 'Stephen',
      last_name: 'Curry',
      position: 'Guard',
      jersey_number: 30,
    },
  ];

  const mockSupabaseChain = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain);
  });

  describe('Successful Data Loading', () => {
    it('renders players page successfully with data', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: mockPlayers,
        error: null,
      });

      const component = await PlayersPage();
      render(component);

      expect(screen.getByText('ALL PLAYERS')).toBeInTheDocument();
      expect(screen.getByTestId('players-list')).toBeInTheDocument();
    });

    it('calls supabase with correct table name', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: mockPlayers,
        error: null,
      });

      await PlayersPage();

      expect(supabase.from).toHaveBeenCalledWith('players');
    });

    it('selects correct columns from database', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: mockPlayers,
        error: null,
      });

      await PlayersPage();

      expect(mockSupabaseChain.select).toHaveBeenCalledWith(
        'player_id, first_name, last_name, position, jersey_number'
      );
    });

    it('orders players by last name ascending', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: mockPlayers,
        error: null,
      });

      await PlayersPage();

      expect(mockSupabaseChain.order).toHaveBeenCalledWith('last_name', {
        ascending: true,
      });
    });

    it('passes players data to PlayersList component', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: mockPlayers,
        error: null,
      });

      const component = await PlayersPage();
      render(component);

      expect(screen.getByTestId('player-1')).toHaveTextContent('LeBron James');
      expect(screen.getByTestId('player-2')).toHaveTextContent('Stephen Curry');
    });

    it('renders background image with correct props', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: mockPlayers,
        error: null,
      });

      const component = await PlayersPage();
      render(component);

      const bgImage = screen.getByAltText('Basketball background');
      expect(bgImage).toBeInTheDocument();
      expect(bgImage).toHaveAttribute('src', '/bgr.jpg');
    });

    it('renders with correct layout structure', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: mockPlayers,
        error: null,
      });

      const component = await PlayersPage();
      const { container } = render(component);

      // Check for main container
      const mainContainer = container.querySelector('.relative.w-full.h-screen');
      expect(mainContainer).toBeInTheDocument();

      // Check for backdrop overlay
      const overlay = container.querySelector('.absolute.inset-0.bg-black\\/40');
      expect(overlay).toBeInTheDocument();
    });

    it('renders players list in scrollable container', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: mockPlayers,
        error: null,
      });

      const component = await PlayersPage();
      const { container } = render(component);

      const scrollContainer = container.querySelector('.max-h-\\[70vh\\].overflow-y-auto');
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when database query fails', async () => {
      const errorMessage = 'Database connection failed';
      mockSupabaseChain.order.mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      });

      const component = await PlayersPage();
      render(component);

      expect(screen.getByText(`Failed to load players: ${errorMessage}`)).toBeInTheDocument();
      expect(screen.queryByText('ALL PLAYERS')).not.toBeInTheDocument();
    });

    it('does not render PlayersList when there is an error', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: null,
        error: { message: 'Error' },
      });

      const component = await PlayersPage();
      render(component);

      expect(screen.queryByTestId('players-list')).not.toBeInTheDocument();
    });

    it('displays error with red text styling', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: null,
        error: { message: 'Test error' },
      });

      const component = await PlayersPage();
      const { container } = render(component);

      const errorDiv = container.querySelector('.text-red-600');
      expect(errorDiv).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays no players message when array is empty', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const component = await PlayersPage();
      render(component);

      expect(screen.getByText('No players found.')).toBeInTheDocument();
      expect(screen.queryByText('ALL PLAYERS')).not.toBeInTheDocument();
    });

    it('displays no players message when data is null', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: null,
        error: null,
      });

      const component = await PlayersPage();
      render(component);

      expect(screen.getByText('No players found.')).toBeInTheDocument();
    });

    it('does not render PlayersList when no players exist', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const component = await PlayersPage();
      render(component);

      expect(screen.queryByTestId('players-list')).not.toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('renders main heading with correct styling', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: mockPlayers,
        error: null,
      });

      const component = await PlayersPage();
      const { container } = render(component);

      const heading = screen.getByText('ALL PLAYERS');
      expect(heading.tagName).toBe('H1');
      expect(heading).toHaveClass('text-orange-500');
    });

    it('applies backdrop blur to players container', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: mockPlayers,
        error: null,
      });

      const component = await PlayersPage();
      const { container } = render(component);

      const blurContainer = container.querySelector('.backdrop-blur-md');
      expect(blurContainer).toBeInTheDocument();
    });

    it('has correct z-index layering', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: mockPlayers,
        error: null,
      });

      const component = await PlayersPage();
      const { container } = render(component);

      const contentLayer = container.querySelector('.relative.z-10');
      expect(contentLayer).toBeInTheDocument();
    });
  });

  describe('Data Integrity', () => {
    it('handles players with all required fields', async () => {
      const completePlayer = {
        player_id: '999',
        first_name: 'Test',
        last_name: 'Player',
        position: 'Center',
        jersey_number: 99,
      };

      mockSupabaseChain.order.mockResolvedValue({
        data: [completePlayer],
        error: null,
      });

      const component = await PlayersPage();
      render(component);

      expect(screen.getByTestId('player-999')).toBeInTheDocument();
    });

    it('passes correct data structure to PlayersList', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: mockPlayers,
        error: null,
      });

      const component = await PlayersPage();
      render(component);

      mockPlayers.forEach((player) => {
        expect(screen.getByTestId(`player-${player.player_id}`)).toBeInTheDocument();
      });
    });
  });

  describe('Revalidation', () => {
    it('exports revalidate constant', () => {
      // This test verifies the ISR configuration exists
      const module = require('../page');
      expect(module.revalidate).toBe(60);
    });
  });

  describe('Edge Cases', () => {
    it('handles single player in array', async () => {
      const singlePlayer = [mockPlayers[0]];
      mockSupabaseChain.order.mockResolvedValue({
        data: singlePlayer,
        error: null,
      });

      const component = await PlayersPage();
      render(component);

      expect(screen.getByTestId('players-list')).toBeInTheDocument();
      expect(screen.getByTestId('player-1')).toBeInTheDocument();
    });

    it('handles large number of players', async () => {
      const manyPlayers = Array.from({ length: 100 }, (_, i) => ({
        player_id: `${i}`,
        first_name: `Player${i}`,
        last_name: `Last${i}`,
        position: 'Guard',
        jersey_number: i,
      }));

      mockSupabaseChain.order.mockResolvedValue({
        data: manyPlayers,
        error: null,
      });

      const component = await PlayersPage();
      render(component);

      expect(screen.getByTestId('players-list')).toBeInTheDocument();
    });

    it('maintains proper query chain', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: mockPlayers,
        error: null,
      });

      await PlayersPage();

      expect(supabase.from).toHaveBeenCalledWith('players');
      expect(mockSupabaseChain.select).toHaveBeenCalled();
      expect(mockSupabaseChain.order).toHaveBeenCalled();
    });
  });
});