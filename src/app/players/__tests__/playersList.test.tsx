import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayersList from '../PlayersList';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock apiClient
const mockGetPlayersByTeamId = jest.fn();
jest.mock('../../utils/apiClient', () => ({
  apiClient: {
    getPlayersByTeamId: (...args: any[]) => mockGetPlayersByTeamId(...args),
  },
}));

describe('PlayersList Component', () => {
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
    {
      player_id: '3',
      first_name: 'Kevin',
      last_name: 'Durant',
      position: 'Forward',
      jersey_number: 35,
    },
    {
      player_id: '4',
      first_name: 'Giannis',
      last_name: 'Antetokounmpo',
      position: 'Forward',
      jersey_number: 34,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPlayersByTeamId.mockResolvedValue(mockPlayers);
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
    });

    it('renders the search input', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
        expect(searchInput).toBeInTheDocument();
        expect(searchInput).toHaveValue('');
      });
    });

    it('renders all players initially', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByText('LeBron James')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
      expect(screen.getByText('Kevin Durant')).toBeInTheDocument();
      expect(screen.getByText('Giannis Antetokounmpo')).toBeInTheDocument();
    });

    it('displays player positions correctly', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        // Use getAllByText since "Forward" appears multiple times
        const forwardPositions = screen.getAllByText('Forward');
        expect(forwardPositions.length).toBeGreaterThan(0);
        expect(screen.getByText('Guard')).toBeInTheDocument();
      });
    });

    it('renders correct number of player cards', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        const playerCards = screen.getAllByRole('listitem');
        expect(playerCards).toHaveLength(4);
      });
    });

    it('renders player grid as a list', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        const list = screen.getByRole('list');
        expect(list).toBeInTheDocument();
      });
    });
  });

  describe('Player Card Details', () => {
    it('displays full name for each player', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByText('LeBron James')).toBeInTheDocument();
      });
      
      mockPlayers.forEach(player => {
        expect(screen.getByText(`${player.first_name} ${player.last_name}`)).toBeInTheDocument();
      });
    });

    it('displays jersey number and position for each player', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByText('#23')).toBeInTheDocument();
      });
      
      // Check for jersey numbers
      expect(screen.getByText('#23')).toBeInTheDocument();
      expect(screen.getByText('#30')).toBeInTheDocument();
      expect(screen.getByText('#35')).toBeInTheDocument();
      expect(screen.getByText('#34')).toBeInTheDocument();
    });

    it('displays View arrow link for each player', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(4);
      });
    });

    it('creates correct link for each player', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        const links = screen.getAllByRole('link');
        expect(links[0]).toHaveAttribute('href', '/players/1');
        expect(links[1]).toHaveAttribute('href', '/players/2');
        expect(links[2]).toHaveAttribute('href', '/players/3');
        expect(links[3]).toHaveAttribute('href', '/players/4');
      });
    });
  });

  describe('Search Functionality - First Name', () => {
    it('filters players by first name (case insensitive)', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      fireEvent.change(searchInput, { target: { value: 'lebron' } });
      
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
      expect(screen.queryByText('Stephen Curry')).not.toBeInTheDocument();
      expect(screen.queryByText('Kevin Durant')).not.toBeInTheDocument();
    });

    it('filters players with partial first name match', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      fireEvent.change(searchInput, { target: { value: 'Leb' } });
      
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
      expect(screen.queryByText('Stephen Curry')).not.toBeInTheDocument();
    });

    it('is case insensitive for first name search', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      fireEvent.change(searchInput, { target: { value: 'LEBRON' } });
      
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });
  });

  describe('Search Functionality - Last Name', () => {
    it('filters players by last name', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      fireEvent.change(searchInput, { target: { value: 'curry' } });
      
      expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
      expect(screen.queryByText('LeBron James')).not.toBeInTheDocument();
    });

    it('filters players with partial last name match', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      fireEvent.change(searchInput, { target: { value: 'Dur' } });
      
      expect(screen.getByText('Kevin Durant')).toBeInTheDocument();
      expect(screen.queryByText('Stephen Curry')).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality - Jersey Number', () => {
    it('filters players by exact jersey number', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      fireEvent.change(searchInput, { target: { value: '23' } });
      
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
      expect(screen.queryByText('Stephen Curry')).not.toBeInTheDocument();
    });

    it('requires exact jersey number match', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      fireEvent.change(searchInput, { target: { value: '3' } });
      
      // Should not match #30, #34, or #35 - only exact match
      expect(screen.queryByText('Stephen Curry')).not.toBeInTheDocument();
      expect(screen.queryByText('Giannis Antetokounmpo')).not.toBeInTheDocument();
      expect(screen.queryByText('Kevin Durant')).not.toBeInTheDocument();
      expect(screen.getByText('No players match your search.')).toBeInTheDocument();
    });

    it('filters by jersey number 30', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      fireEvent.change(searchInput, { target: { value: '30' } });
      
      expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
      expect(screen.queryByText('LeBron James')).not.toBeInTheDocument();
    });
  });

  describe('Search Input Behavior', () => {
    it('updates search input value on change', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      expect(searchInput.value).toBe('test');
    });

    it('clears search and shows all players when input is cleared', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      fireEvent.change(searchInput, { target: { value: 'LeBron' } });
      expect(screen.queryByText('Stephen Curry')).not.toBeInTheDocument();
      
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });

    it('handles whitespace-only search by showing all players', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      fireEvent.change(searchInput, { target: { value: '   ' } });
      
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
      expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
    });
  });

  describe('No Results State', () => {
    it('displays no results message when search has no matches', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      fireEvent.change(searchInput, { target: { value: 'NonexistentPlayer' } });
      
      expect(screen.getByText('No players match your search.')).toBeInTheDocument();
    });

    it('does not display player cards when no results', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      fireEvent.change(searchInput, { target: { value: 'xyz123' } });
      
      expect(screen.queryByText('LeBron James')).not.toBeInTheDocument();
      expect(screen.queryByText('Stephen Curry')).not.toBeInTheDocument();
    });

    it('shows players again after clearing no-result search', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      fireEvent.change(searchInput, { target: { value: 'NoMatch' } });
      expect(screen.getByText('No players match your search.')).toBeInTheDocument();
      
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.queryByText('No players match your search.')).not.toBeInTheDocument();
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });
  });

  describe('Empty Players Array', () => {
    it('displays no results message when players array is empty', async () => {
      mockGetPlayersByTeamId.mockResolvedValue([]);
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByText('No players match your search.')).toBeInTheDocument();
      });
    });

    it('renders search input even with empty players array', async () => {
      mockGetPlayersByTeamId.mockResolvedValue([]);
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Matches', () => {
    it('shows multiple players when search matches multiple results', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      // Search for "an" which matches "Giannis" and "Durant"
      fireEvent.change(searchInput, { target: { value: 'an' } });
      
      expect(screen.getByText('Giannis Antetokounmpo')).toBeInTheDocument();
      expect(screen.getByText('Kevin Durant')).toBeInTheDocument();
      expect(screen.queryByText('LeBron James')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles special characters in search', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      fireEvent.change(searchInput, { target: { value: '@#$%' } });
      
      expect(screen.getByText('No players match your search.')).toBeInTheDocument();
    });

    it('handles very long search strings', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      const longString = 'a'.repeat(1000);
      fireEvent.change(searchInput, { target: { value: longString } });
      
      expect(screen.getByText('No players match your search.')).toBeInTheDocument();
    });

    it('maintains correct player count after multiple searches', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      fireEvent.change(searchInput, { target: { value: 'LeBron' } });
      fireEvent.change(searchInput, { target: { value: 'Curry' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      
      const playerCards = screen.getAllByRole('listitem');
      expect(playerCards).toHaveLength(4);
    });
  });

  describe('Performance and Memoization', () => {
    it('filters correctly on rapid input changes', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      fireEvent.change(searchInput, { target: { value: 'L' } });
      fireEvent.change(searchInput, { target: { value: 'Le' } });
      fireEvent.change(searchInput, { target: { value: 'Leb' } });
      
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
      expect(screen.queryByText('Stephen Curry')).not.toBeInTheDocument();
    });
  });
});