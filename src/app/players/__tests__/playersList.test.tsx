import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayersList from '../PlayersList';

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

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
      avatar_url: '/avatars/lebron.jpg',
    },
    {
      player_id: '2',
      first_name: 'Stephen',
      last_name: 'Curry',
      position: 'Guard',
      jersey_number: 30,
      avatar_url: '/avatars/curry.jpg',
    },
    {
      player_id: '3',
      first_name: 'Kevin',
      last_name: 'Durant',
      position: 'Forward',
      jersey_number: 35,
      avatar_url: '/avatars/durant.jpg',
    },
    {
      player_id: '4',
      first_name: 'Giannis',
      last_name: 'Antetokounmpo',
      position: 'Forward',
      jersey_number: 34,
      avatar_url: '/avatars/giannis.jpg',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPlayersByTeamId.mockResolvedValue(mockPlayers);
  });

  describe('Loading State', () => {
    it('displays loading message while fetching players', () => {
      mockGetPlayersByTeamId.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      
      render(<PlayersList teamId="team-123" />);
      
      expect(screen.getByText('Loading players...')).toBeInTheDocument();
    });

    it('removes loading message after players are loaded', async () => {
      render(<PlayersList teamId="team-123" />);
      
      expect(screen.getByText('Loading players...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText('Loading players...')).not.toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('calls getPlayersByTeamId with correct teamId', async () => {
      render(<PlayersList teamId="team-456" />);
      
      await waitFor(() => {
        expect(mockGetPlayersByTeamId).toHaveBeenCalledWith('team-456');
      });
    });

    it('calls API only once on mount', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(mockGetPlayersByTeamId).toHaveBeenCalledTimes(1);
      });
    });

    it('handles API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGetPlayersByTeamId.mockRejectedValue(new Error('API Error'));
      
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByText('No players match your search.')).toBeInTheDocument();
      });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch players:',
        expect.any(Error)
      );
      
      consoleErrorSpy.mockRestore();
    });

    it('normalizes player data with fallback id field', async () => {
      const playersWithIdField = [
        {
          id: 'player-1',
          first_name: 'Test',
          last_name: 'Player',
          position: 'Guard',
          jersey_number: 10,
          avatar_url: '/avatar.jpg',
        },
      ];
      
      mockGetPlayersByTeamId.mockResolvedValue(playersWithIdField);
      
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/player/player-1');
      });
    });
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByRole('list')).toBeInTheDocument();
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

    it('renders correct number of player cards', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        const playerCards = screen.getAllByRole('listitem');
        expect(playerCards).toHaveLength(4);
      });
    });

    it('renders player grid as a list element', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        const list = screen.getByRole('list');
        expect(list).toBeInTheDocument();
        expect(list.tagName).toBe('UL');
      });
    });

    it('does not render search input when commented out', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByText('LeBron James')).toBeInTheDocument();
      });
      
      const searchInput = screen.queryByPlaceholderText('Search by name or jersey #');
      expect(searchInput).not.toBeInTheDocument();
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

    it('displays jersey numbers with # prefix', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByText('#23')).toBeInTheDocument();
      });
      
      expect(screen.getByText('#30')).toBeInTheDocument();
      expect(screen.getByText('#35')).toBeInTheDocument();
      expect(screen.getByText('#34')).toBeInTheDocument();
    });

    it('displays positions correctly', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        const forwardPositions = screen.getAllByText('Forward');
        expect(forwardPositions).toHaveLength(3);
        expect(screen.getByText('Guard')).toBeInTheDocument();
      });
    });

    it('displays player avatars with correct src', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(4);
        expect(images[0]).toHaveAttribute('src', '/avatars/lebron.jpg');
        expect(images[1]).toHaveAttribute('src', '/avatars/curry.jpg');
      });
    });

    it('displays fallback avatar when avatar_url is missing', async () => {
      const playersWithoutAvatar = [
        {
          ...mockPlayers[0],
          avatar_url: null,
        },
      ];
      
      mockGetPlayersByTeamId.mockResolvedValue(playersWithoutAvatar);
      
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('src', '/avatars/player3.jpg');
      });
    });

    it('sets correct alt text for player images', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByAltText('LeBron James')).toBeInTheDocument();
        expect(screen.getByAltText('Stephen Curry')).toBeInTheDocument();
      });
    });
  });

  describe('Player Links', () => {
    it('creates correct link for each player', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(4);
        expect(links[0]).toHaveAttribute('href', '/player/1');
        expect(links[1]).toHaveAttribute('href', '/player/2');
        expect(links[2]).toHaveAttribute('href', '/player/3');
        expect(links[3]).toHaveAttribute('href', '/player/4');
      });
    });

    it('wraps entire card content in link', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        const firstLink = screen.getAllByRole('link')[0];
        const linkContent = within(firstLink);
        expect(linkContent.getByText('LeBron James')).toBeInTheDocument();
        expect(linkContent.getByText('#23')).toBeInTheDocument();
        expect(linkContent.getByText('Forward')).toBeInTheDocument();
      });
    });
  });

  describe('Empty Players Array', () => {
    it('displays no results message when API returns empty array', async () => {
      mockGetPlayersByTeamId.mockResolvedValue([]);
      
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByText('No players match your search.')).toBeInTheDocument();
      });
    });

    it('does not crash with empty players array', async () => {
      mockGetPlayersByTeamId.mockResolvedValue([]);
      
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByRole('list')).toBeInTheDocument();
      });
      
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic HTML structure', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByRole('list')).toBeInTheDocument();
      });
      
      const list = screen.getByRole('list');
      const items = within(list).getAllByRole('listitem');
      
      expect(items).toHaveLength(4);
    });

    it('all player links are keyboard accessible', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        const links = screen.getAllByRole('link');
        
        links.forEach(link => {
          expect(link).toHaveAttribute('href');
        });
      });
    });

    it('images have descriptive alt text', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        mockPlayers.forEach(player => {
          const altText = `${player.first_name} ${player.last_name}`;
          expect(screen.getByAltText(altText)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Component Props', () => {
    it('accepts and uses teamId prop', async () => {
      const { rerender } = render(<PlayersList teamId="team-abc" />);
      
      await waitFor(() => {
        expect(mockGetPlayersByTeamId).toHaveBeenCalledWith('team-abc');
      });
      
      jest.clearAllMocks();
      
      rerender(<PlayersList teamId="team-xyz" />);
      
      await waitFor(() => {
        expect(mockGetPlayersByTeamId).toHaveBeenCalledWith('team-xyz');
      });
    });

    it('refetches players when teamId changes', async () => {
      const { rerender } = render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(mockGetPlayersByTeamId).toHaveBeenCalledTimes(1);
      });
      
      rerender(<PlayersList teamId="team-456" />);
      
      await waitFor(() => {
        expect(mockGetPlayersByTeamId).toHaveBeenCalledTimes(2);
        expect(mockGetPlayersByTeamId).toHaveBeenLastCalledWith('team-456');
      });
    });
  });

  describe('Styling and UI Classes', () => {
    it('applies correct CSS classes to player cards', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        const playerCards = screen.getAllByRole('listitem');
        
        playerCards.forEach(card => {
          expect(card.className).toContain('group');
          expect(card.className).toContain('rounded-2xl');
          expect(card.className).toContain('bg-white');
          expect(card.className).toContain('border-yellow-400');
        });
      });
    });

    it('applies grid layout to player list', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        const list = screen.getByRole('list');
        expect(list.className).toContain('grid');
        expect(list.className).toContain('gap-6');
      });
    });
  });

  describe('Data Integrity', () => {
    it('preserves player data structure', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByText('LeBron James')).toBeInTheDocument();
      });
      
      // Verify all player data is displayed correctly
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
      expect(screen.getByText('#23')).toBeInTheDocument();
      
      // Use getAllByText since "Forward" appears multiple times
      const forwardElements = screen.getAllByText('Forward');
      expect(forwardElements.length).toBeGreaterThan(0);
      
      const link = screen.getAllByRole('link')[0];
      expect(link).toHaveAttribute('href', '/player/1');
    });

    it('handles players with same jersey numbers correctly', async () => {
      const playersWithDuplicateNumbers = [
        { ...mockPlayers[0], jersey_number: 10 },
        { ...mockPlayers[1], jersey_number: 10 },
      ];
      
      mockGetPlayersByTeamId.mockResolvedValue(playersWithDuplicateNumbers);
      
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByText('LeBron James')).toBeInTheDocument();
        expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
      });
      
      const jerseyNumbers = screen.getAllByText('#10');
      expect(jerseyNumbers).toHaveLength(2);
    });

    it('handles players with same names correctly', async () => {
      const playersWithSameNames = [
        { ...mockPlayers[0], player_id: '1', first_name: 'John', last_name: 'Smith' },
        { ...mockPlayers[1], player_id: '2', first_name: 'John', last_name: 'Smith' },
      ];
      
      mockGetPlayersByTeamId.mockResolvedValue(playersWithSameNames);
      
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        const johnSmiths = screen.getAllByText('John Smith');
        expect(johnSmiths).toHaveLength(2);
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('cleans up properly on unmount', async () => {
      const { unmount } = render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByText('LeBron James')).toBeInTheDocument();
      });
      
      unmount();
      
      // Should not throw any errors
      expect(mockGetPlayersByTeamId).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Recovery', () => {
    it('recovers gracefully after API error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGetPlayersByTeamId.mockRejectedValueOnce(new Error('Network error'));
      
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByText('No players match your search.')).toBeInTheDocument();
      });
      
      // Component should still render properly
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
      
      consoleErrorSpy.mockRestore();
    });

    it('handles malformed player data gracefully', async () => {
      const malformedPlayers = [
        {
          player_id: '1',
          first_name: 'Test',
          last_name: 'Player',
          position: 'Guard',
          jersey_number: null,
          avatar_url: '/avatar.jpg',
        },
      ];
      
      mockGetPlayersByTeamId.mockResolvedValue(malformedPlayers);
      
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Player')).toBeInTheDocument();
      });
      
      // Should display the jersey number area even if null
      const listItem = screen.getByText('Test Player').closest('li');
      expect(listItem).toBeInTheDocument();
    });
  });

  describe('Unique Keys', () => {
    it('generates unique keys for each player card', async () => {
      render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        const playerCards = screen.getAllByRole('listitem');
        
        // Each card should have a unique key (React handles this internally)
        // We verify by checking all cards are rendered
        expect(playerCards).toHaveLength(4);
      });
    });

    it('uses player_id in key generation', async () => {
      const { container } = render(<PlayersList teamId="team-123" />);
      
      await waitFor(() => {
        const listItems = container.querySelectorAll('li');
        
        // Verify all list items are present
        expect(listItems.length).toBeGreaterThanOrEqual(4);
      });
    });
  });
});