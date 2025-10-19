import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill, className }: any) => (
    <img src={src} alt={alt} className={className} data-fill={fill} />
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  User: () => <div data-testid="user-icon">User</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  X: () => <div data-testid="x-icon">X</div>,
}));

// Mock TeamDetails component
jest.mock('../../fanComponents/TeamDetails', () => ({
  __esModule: true,
  default: () => <div data-testid="team-details">Team Details</div>,
}));

import { SearchDropdown } from '../searchDropdown';
import { useRouter } from 'next/navigation';
import { act } from 'react';

describe('SearchDropdown', () => {
  const mockPush = jest.fn();
  const mockOnClose = jest.fn();
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

  const mockSearchResults = {
    players: [
      {
        player_id: 1,
        first_name: 'LeBron',
        last_name: 'James',
        position: 'Forward',
        jersey_number: 23,
        avatar_url: '/lebron.jpg',
      },
      {
        player_id: 2,
        first_name: 'Stephen',
        last_name: 'Curry',
        position: 'Guard',
        jersey_number: 30,
        avatar_url: null,
      },
    ],
    teams: [
      {
        team_id: 101,
        team_name: 'Los Angeles Lakers',
        icon_url: '/lakers.png',
      },
      {
        team_id: 102,
        team_name: 'Golden State Warriors',
        icon_url: null,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when query is empty', () => {
      const { container } = render(<SearchDropdown query="" onClose={mockOnClose} />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render when query length is less than 2', () => {
      const { container } = render(<SearchDropdown query="L" onClose={mockOnClose} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render when query length is 2 or more', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      render(<SearchDropdown query="Lakers" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Search results for "Lakers"')).toBeInTheDocument();
      });
    });

    it('should render all tabs', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      render(<SearchDropdown query="Lakers" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText(/All/)).toBeInTheDocument();
        expect(screen.getByText(/Players/)).toBeInTheDocument();
        expect(screen.getByText(/Teams/)).toBeInTheDocument();
      });
    });

    it('should display close button', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      render(<SearchDropdown query="Lakers" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByTestId('x-icon')).toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    it('should fetch search results on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      render(<SearchDropdown query="Lakers" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/search?q=Lakers');
      });
    });

    it('should show loading state while fetching', async () => {
      let resolvePromise: (value: any) => void;
      const fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValueOnce(fetchPromise);

      render(<SearchDropdown query="Lakers" onClose={mockOnClose} />);

      // Loading state should be visible
      await waitFor(() => {
        expect(screen.getByText('Searching...')).toBeInTheDocument();
      });

      // Resolve the fetch promise
      act(() => {
        resolvePromise!({
          ok: true,
          json: async () => mockSearchResults,
        });
      });

      // Loading state should disappear
      await waitFor(() => {
        expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
      });
    });

    it('should debounce fetch requests', async () => {
      jest.useFakeTimers();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockSearchResults,
      });

      const { rerender } = render(<SearchDropdown query="L" onClose={mockOnClose} />);

      // Change query multiple times quickly
      rerender(<SearchDropdown query="La" onClose={mockOnClose} />);
      rerender(<SearchDropdown query="Lak" onClose={mockOnClose} />);
      rerender(<SearchDropdown query="Lake" onClose={mockOnClose} />);

      // Should not call fetch yet
      expect(global.fetch).not.toHaveBeenCalled();

      // Fast forward time and wait for the fetch to complete
      await act(async () => {
        jest.advanceTimersByTime(300);
        await Promise.resolve(); // Let promises resolve
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith('/api/search?q=Lake');
      });

      jest.useRealTimers();
    });

    it('should handle fetch errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<SearchDropdown query="Lakers" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle non-ok response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      render(<SearchDropdown query="Lakers" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Should show no results
      await waitFor(() => {
        expect(screen.getByText(/No results found/)).toBeInTheDocument();
      });
    });

    it('should encode query parameters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ players: [], teams: [] }),
      });

      render(<SearchDropdown query="LeBron James" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/search?q=LeBron%20James');
      });
    });
  });

  describe('Tab Functionality', () => {
    it('should show all results by default', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      render(<SearchDropdown query="Lakers" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('LeBron James')).toBeInTheDocument();
        expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
      });
    });

    it('should filter to only players when Players tab is clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      render(<SearchDropdown query="Lakers" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('LeBron James')).toBeInTheDocument();
      });

      // Get the Players tab button (not the section header)
      const playersTab = screen.getAllByText(/Players/)[0].closest('button');
      await userEvent.click(playersTab!);

      expect(screen.getByText('LeBron James')).toBeInTheDocument();
      expect(screen.queryByText('Los Angeles Lakers')).not.toBeInTheDocument();
    });

    it('should filter to only teams when Teams tab is clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      render(<SearchDropdown query="Lakers" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
      });

      // Get the Teams tab button (not the section header)
      const teamsTab = screen.getAllByText(/Teams/)[0].closest('button');
      await userEvent.click(teamsTab!);

      expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
      expect(screen.queryByText('LeBron James')).not.toBeInTheDocument();
    });

    it('should show correct counts in tabs', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      render(<SearchDropdown query="Lakers" onClose={mockOnClose} />);

      await waitFor(() => {
        // Get the button elements and check their text content
        const allTab = screen.getByText(/All/).closest('button');
        const playersTab = screen.getAllByText(/Players/)[0].closest('button');
        const teamsTab = screen.getAllByText(/Teams/)[0].closest('button');
        
        expect(allTab).toHaveTextContent('4');
        expect(playersTab).toHaveTextContent('2');
        expect(teamsTab).toHaveTextContent('2');
      });
    });

    it('should highlight active tab', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      render(<SearchDropdown query="Lakers" onClose={mockOnClose} />);

      await waitFor(() => {
        const allTab = screen.getByText(/All/).closest('button');
        expect(allTab).toHaveClass('bg-orange-500');
      });

      const playersTab = screen.getAllByText(/Players/)[0].closest('button');
      await userEvent.click(playersTab!);

      expect(playersTab).toHaveClass('bg-orange-500');
    });
  });

  describe('Results Display', () => {
    it('should display player with avatar', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      render(<SearchDropdown query="Lakers" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('LeBron James')).toBeInTheDocument();
        expect(screen.getByText('Forward • #23')).toBeInTheDocument();
        expect(screen.getByAltText('LeBron James')).toBeInTheDocument();
      });
    });

    it('should display player without avatar with initials', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      render(<SearchDropdown query="Curry" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
        expect(screen.getByText('SC')).toBeInTheDocument();
      });
    });

    it('should display team with icon', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      render(<SearchDropdown query="Lakers" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
        expect(screen.getByAltText('Los Angeles Lakers')).toBeInTheDocument();
      });
    });

    it('should display team without icon with default icon', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      render(<SearchDropdown query="Warriors" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Golden State Warriors')).toBeInTheDocument();
      });
    });

    it('should show no results message when no results found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ players: [], teams: [] }),
      });

      render(<SearchDropdown query="xyz" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('No results found for "xyz"')).toBeInTheDocument();
      });
    });

    it('should display section headers in All tab', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      render(<SearchDropdown query="Lakers" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Players')).toBeInTheDocument();
        expect(screen.getByText('Teams')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to player page when player is clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      render(<SearchDropdown query="Lakers" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('LeBron James')).toBeInTheDocument();
      });

      const playerButton = screen.getByText('LeBron James').closest('button');
      await userEvent.click(playerButton!);

      expect(mockPush).toHaveBeenCalledWith('/player/1');
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should navigate to team page when team is clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      render(<SearchDropdown query="Lakers" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
      });

      const teamButton = screen.getByText('Los Angeles Lakers').closest('button');
      await userEvent.click(teamButton!);

      expect(mockPush).toHaveBeenCalledWith('/team/101');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      render(<SearchDropdown query="Lakers" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByTestId('x-icon')).toBeInTheDocument();
      });

      const closeButton = screen.getByTestId('x-icon').closest('button');
      await userEvent.click(closeButton!);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when clicking outside dropdown', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      render(
        <div>
          <div data-testid="outside">Outside</div>
          <SearchDropdown query="Lakers" onClose={mockOnClose} />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText('LeBron James')).toBeInTheDocument();
      });

      const outsideElement = screen.getByTestId('outside');
      fireEvent.mouseDown(outsideElement);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not call onClose when clicking inside dropdown', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults,
      });

      render(<SearchDropdown query="Lakers" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('LeBron James')).toBeInTheDocument();
      });

      const dropdown = screen.getByText('LeBron James').closest('div[ref]');
      fireEvent.mouseDown(screen.getByText('Search results for "Lakers"'));

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle player without jersey number', async () => {
      const resultsWithoutJersey = {
        players: [
          {
            player_id: 3,
            first_name: 'Test',
            last_name: 'Player',
            position: 'Center',
            jersey_number: null,
            avatar_url: null,
          },
        ],
        teams: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => resultsWithoutJersey,
      });

      render(<SearchDropdown query="Test" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Test Player')).toBeInTheDocument();
        expect(screen.getByText('Center')).toBeInTheDocument();
      });
    });

    it('should handle only players results', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ players: mockSearchResults.players, teams: [] }),
      });

      render(<SearchDropdown query="Player" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('LeBron James')).toBeInTheDocument();
        // The Teams tab still exists but shows count of 0
        const teamsTab = screen.getAllByText(/Teams/)[0].closest('button');
        expect(teamsTab).toHaveTextContent('0');
      });
    });

    it('should handle only teams results', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ players: [], teams: mockSearchResults.teams }),
      });

      render(<SearchDropdown query="Team" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
        // The Players tab still exists but shows count of 0
        const playersTab = screen.getAllByText(/Players/)[0].closest('button');
        expect(playersTab).toHaveTextContent('0');
      });
    });
  });
});