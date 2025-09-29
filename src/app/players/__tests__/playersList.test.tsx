import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayersList from '../PlayersList';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

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

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<PlayersList players={mockPlayers} />);
      expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
    });

    it('renders the search input', () => {
      render(<PlayersList players={mockPlayers} />);
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveValue('');
    });

    it('renders all players initially', () => {
      render(<PlayersList players={mockPlayers} />);
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
      expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
      expect(screen.getByText('Kevin Durant')).toBeInTheDocument();
      expect(screen.getByText('Giannis Antetokounmpo')).toBeInTheDocument();
    });

    it('displays player positions correctly', () => {
      render(<PlayersList players={mockPlayers} />);
      expect(screen.getByText('#23 · Forward')).toBeInTheDocument();
      expect(screen.getByText('#30 · Guard')).toBeInTheDocument();
    });

    it('renders correct number of player cards', () => {
      render(<PlayersList players={mockPlayers} />);
      const playerCards = screen.getAllByRole('listitem');
      expect(playerCards).toHaveLength(4);
    });

    it('renders player grid as a list', () => {
      render(<PlayersList players={mockPlayers} />);
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });
  });

  describe('Player Card Details', () => {
    it('displays full name for each player', () => {
      render(<PlayersList players={mockPlayers} />);
      mockPlayers.forEach(player => {
        expect(screen.getByText(`${player.first_name} ${player.last_name}`)).toBeInTheDocument();
      });
    });

    it('displays jersey number and position for each player', () => {
      render(<PlayersList players={mockPlayers} />);
      mockPlayers.forEach(player => {
        expect(screen.getByText(`#${player.jersey_number} · ${player.position}`)).toBeInTheDocument();
      });
    });

    it('displays View arrow link for each player', () => {
      render(<PlayersList players={mockPlayers} />);
      const viewLinks = screen.getAllByText('View →');
      expect(viewLinks).toHaveLength(4);
    });

    it('creates correct link for each player', () => {
      render(<PlayersList players={mockPlayers} />);
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/players/1');
      expect(links[1]).toHaveAttribute('href', '/players/2');
      expect(links[2]).toHaveAttribute('href', '/players/3');
      expect(links[3]).toHaveAttribute('href', '/players/4');
    });
  });

  describe('Search Functionality - First Name', () => {
    it('filters players by first name (case insensitive)', () => {
      render(<PlayersList players={mockPlayers} />);
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      
      fireEvent.change(searchInput, { target: { value: 'lebron' } });
      
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
      expect(screen.queryByText('Stephen Curry')).not.toBeInTheDocument();
      expect(screen.queryByText('Kevin Durant')).not.toBeInTheDocument();
    });

    it('filters players with partial first name match', () => {
      render(<PlayersList players={mockPlayers} />);
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      
      fireEvent.change(searchInput, { target: { value: 'Leb' } });
      
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
      expect(screen.queryByText('Stephen Curry')).not.toBeInTheDocument();
    });

    it('is case insensitive for first name search', () => {
      render(<PlayersList players={mockPlayers} />);
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      
      fireEvent.change(searchInput, { target: { value: 'LEBRON' } });
      
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });
  });

  describe('Search Functionality - Last Name', () => {
    it('filters players by last name', () => {
      render(<PlayersList players={mockPlayers} />);
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      
      fireEvent.change(searchInput, { target: { value: 'curry' } });
      
      expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
      expect(screen.queryByText('LeBron James')).not.toBeInTheDocument();
    });

    it('filters players with partial last name match', () => {
      render(<PlayersList players={mockPlayers} />);
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      
      fireEvent.change(searchInput, { target: { value: 'Dur' } });
      
      expect(screen.getByText('Kevin Durant')).toBeInTheDocument();
      expect(screen.queryByText('Stephen Curry')).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality - Jersey Number', () => {
    it('filters players by exact jersey number', () => {
      render(<PlayersList players={mockPlayers} />);
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      
      fireEvent.change(searchInput, { target: { value: '23' } });
      
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
      expect(screen.queryByText('Stephen Curry')).not.toBeInTheDocument();
    });

    it('requires exact jersey number match', () => {
      render(<PlayersList players={mockPlayers} />);
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      
      fireEvent.change(searchInput, { target: { value: '3' } });
      
      // Should not match #30, #34, or #35 - only exact match
      expect(screen.queryByText('Stephen Curry')).not.toBeInTheDocument();
      expect(screen.queryByText('Giannis Antetokounmpo')).not.toBeInTheDocument();
      expect(screen.queryByText('Kevin Durant')).not.toBeInTheDocument();
    });

    it('filters by jersey number 30', () => {
      render(<PlayersList players={mockPlayers} />);
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      
      fireEvent.change(searchInput, { target: { value: '30' } });
      
      expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
      expect(screen.queryByText('LeBron James')).not.toBeInTheDocument();
    });
  });

  describe('Search Input Behavior', () => {
    it('updates search input value on change', () => {
      render(<PlayersList players={mockPlayers} />);
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #') as HTMLInputElement;
      
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      expect(searchInput.value).toBe('test');
    });

    it('clears search and shows all players when input is cleared', () => {
      render(<PlayersList players={mockPlayers} />);
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      
      fireEvent.change(searchInput, { target: { value: 'LeBron' } });
      expect(screen.queryByText('Stephen Curry')).not.toBeInTheDocument();
      
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });

    it('handles whitespace-only search by showing all players', () => {
      render(<PlayersList players={mockPlayers} />);
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      
      fireEvent.change(searchInput, { target: { value: '   ' } });
      
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
      expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
    });
  });

  describe('No Results State', () => {
    it('displays no results message when search has no matches', () => {
      render(<PlayersList players={mockPlayers} />);
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      
      fireEvent.change(searchInput, { target: { value: 'NonexistentPlayer' } });
      
      expect(screen.getByText('No players match your search.')).toBeInTheDocument();
    });

    it('does not display player cards when no results', () => {
      render(<PlayersList players={mockPlayers} />);
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      
      fireEvent.change(searchInput, { target: { value: 'xyz123' } });
      
      expect(screen.queryByText('LeBron James')).not.toBeInTheDocument();
      expect(screen.queryByText('Stephen Curry')).not.toBeInTheDocument();
    });

    it('shows players again after clearing no-result search', () => {
      render(<PlayersList players={mockPlayers} />);
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      
      fireEvent.change(searchInput, { target: { value: 'NoMatch' } });
      expect(screen.getByText('No players match your search.')).toBeInTheDocument();
      
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.queryByText('No players match your search.')).not.toBeInTheDocument();
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });
  });

  describe('Empty Players Array', () => {
    it('displays no results message when players array is empty', () => {
      render(<PlayersList players={[]} />);
      expect(screen.getByText('No players match your search.')).toBeInTheDocument();
    });

    it('renders search input even with empty players array', () => {
      render(<PlayersList players={[]} />);
      expect(screen.getByPlaceholderText('Search by name or jersey #')).toBeInTheDocument();
    });
  });

  describe('Multiple Matches', () => {
    it('shows multiple players when search matches multiple results', () => {
      render(<PlayersList players={mockPlayers} />);
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      
      // Search for "an" which matches "Giannis" and "Durant"
      fireEvent.change(searchInput, { target: { value: 'an' } });
      
      expect(screen.getByText('Giannis Antetokounmpo')).toBeInTheDocument();
      expect(screen.getByText('Kevin Durant')).toBeInTheDocument();
      expect(screen.queryByText('LeBron James')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles special characters in search', () => {
      render(<PlayersList players={mockPlayers} />);
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      
      fireEvent.change(searchInput, { target: { value: '@#$%' } });
      
      expect(screen.getByText('No players match your search.')).toBeInTheDocument();
    });

    it('handles very long search strings', () => {
      render(<PlayersList players={mockPlayers} />);
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      
      const longString = 'a'.repeat(1000);
      fireEvent.change(searchInput, { target: { value: longString } });
      
      expect(screen.getByText('No players match your search.')).toBeInTheDocument();
    });

    it('maintains correct player count after multiple searches', () => {
      render(<PlayersList players={mockPlayers} />);
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      
      fireEvent.change(searchInput, { target: { value: 'LeBron' } });
      fireEvent.change(searchInput, { target: { value: 'Curry' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      
      const playerCards = screen.getAllByRole('listitem');
      expect(playerCards).toHaveLength(4);
    });
  });

  describe('Performance and Memoization', () => {
    it('filters correctly on rapid input changes', () => {
      render(<PlayersList players={mockPlayers} />);
      const searchInput = screen.getByPlaceholderText('Search by name or jersey #');
      
      fireEvent.change(searchInput, { target: { value: 'L' } });
      fireEvent.change(searchInput, { target: { value: 'Le' } });
      fireEvent.change(searchInput, { target: { value: 'Leb' } });
      
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
      expect(screen.queryByText('Stephen Curry')).not.toBeInTheDocument();
    });
  });
});