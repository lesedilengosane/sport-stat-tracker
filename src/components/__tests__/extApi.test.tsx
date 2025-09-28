import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExtApi from '../ExtApi';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, width, height, className }: any) {
    return (
      <img 
        src={src} 
        alt={alt} 
        width={width} 
        height={height} 
        className={className}
        data-testid="team-logo"
      />
    );
  };
});

// Mock fetch globally
global.fetch = jest.fn();

const mockLeagues = [
  { league_key: 'nfl', league_name: 'NFL' },
  { league_key: 'nba', league_name: 'NBA' },
  { league_key: 'mlb', league_name: 'MLB' }
];

const mockTeams = [
  { 
    team_key: 'team1', 
    team_name: 'Team One', 
    league_key: 'nfl',
    team_logo: 'https://example.com/logo1.png'
  },
  { 
    team_key: 'team2', 
    team_name: 'Team Two', 
    league_key: 'nfl',
    team_logo: 'https://example.com/logo2.png'
  },
  { 
    team_key: 'team3', 
    team_name: 'Team Three', 
    league_key: 'nfl'
  }
];

describe('ExtApi Component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('Initial Rendering', () => {
    test('renders component with initial loading states', () => {
      (fetch as jest.Mock).mockImplementation(() => 
        new Promise(() => {}) // Never resolves to keep loading state
      );

      render(<ExtApi />);
      
      expect(screen.getByText('Leagues')).toBeInTheDocument();
      expect(screen.getByText('Teams')).toBeInTheDocument();
      expect(screen.getByText('Loading leagues...')).toBeInTheDocument();
      expect(screen.getByText('Loading teams...')).toBeInTheDocument();
    });
  });

  describe('Leagues Functionality', () => {
    test('fetches and displays leagues successfully', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: mockLeagues })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: mockTeams })
        });

      render(<ExtApi />);

      await waitFor(() => {
        expect(screen.queryByText('Loading leagues...')).not.toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('NFL')).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'NFL' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'NBA' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'MLB' })).toBeInTheDocument();
    });

    test('handles leagues fetch error gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<ExtApi />);

      await waitFor(() => {
        expect(screen.queryByText('Loading leagues...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('No leagues available')).toBeInTheDocument();
    });

    test('handles empty leagues response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: [] })
      });

      render(<ExtApi />);

      await waitFor(() => {
        expect(screen.queryByText('Loading leagues...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('No leagues available')).toBeInTheDocument();
    });

    test('handles non-array leagues response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: null })
      });

      render(<ExtApi />);

      await waitFor(() => {
        expect(screen.queryByText('Loading leagues...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('No leagues available')).toBeInTheDocument();
    });
  });

  describe('Teams Functionality', () => {
    test('fetches and displays teams for selected league', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: mockLeagues })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: mockTeams })
        });

      render(<ExtApi />);

      await waitFor(() => {
        expect(screen.queryByText('Loading teams...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Team One')).toBeInTheDocument();
      expect(screen.getByText('Team Two')).toBeInTheDocument();
      expect(screen.getByText('Team Three')).toBeInTheDocument();
    });

    test('displays team logos when available', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: mockLeagues })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: mockTeams })
        });

      render(<ExtApi />);

      await waitFor(() => {
        expect(screen.queryByText('Loading teams...')).not.toBeInTheDocument();
      });

      const teamLogos = screen.getAllByTestId('team-logo');
      expect(teamLogos).toHaveLength(2); // Only Team One and Team Two have logos
      
      expect(teamLogos[0]).toHaveAttribute('src', 'https://example.com/logo1.png');
      expect(teamLogos[0]).toHaveAttribute('alt', 'Team One');
      expect(teamLogos[1]).toHaveAttribute('src', 'https://example.com/logo2.png');
      expect(teamLogos[1]).toHaveAttribute('alt', 'Team Two');
    });

    test('handles teams fetch error gracefully', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: mockLeagues })
        })
        .mockRejectedValueOnce(new Error('Network error'));

      render(<ExtApi />);

      await waitFor(() => {
        expect(screen.queryByText('Loading teams...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('No teams available for this league')).toBeInTheDocument();
    });

    test('handles empty teams response', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: mockLeagues })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: [] })
        });

      render(<ExtApi />);

      await waitFor(() => {
        expect(screen.queryByText('Loading teams...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('No teams available for this league')).toBeInTheDocument();
    });
  });

  describe('League Selection', () => {
    test('changes selected league and fetches new teams', async () => {
      const mockNbaTeams = [
        { team_key: 'nba1', team_name: 'Lakers', league_key: 'nba' },
        { team_key: 'nba2', team_name: 'Warriors', league_key: 'nba' }
      ];

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: mockLeagues })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: mockTeams })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: mockNbaTeams })
        });

      render(<ExtApi />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByText('Loading teams...')).not.toBeInTheDocument();
      });

      // Verify initial NFL teams are displayed
      expect(screen.getByText('Team One')).toBeInTheDocument();

      // Change league selection
      const selectElement = screen.getByDisplayValue('NFL');
      fireEvent.change(selectElement, { target: { value: 'nba' } });

      // Wait for new teams to load
      await waitFor(() => {
        expect(screen.getByText('Lakers')).toBeInTheDocument();
      });

      expect(screen.getByText('Warriors')).toBeInTheDocument();
      expect(screen.queryByText('Team One')).not.toBeInTheDocument();
    });

    test('makes correct API calls with proper parameters', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: mockLeagues })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: mockTeams })
        });

      render(<ExtApi />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
      });

      expect(fetch).toHaveBeenNthCalledWith(1, '/api/sports/leagues');
      expect(fetch).toHaveBeenNthCalledWith(2, '/api/sports/teams?league_id=nfl');
    });
  });

  describe('Component Styling and Structure', () => {
    test('applies correct CSS classes', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: mockLeagues })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: mockTeams })
        });

      const { container } = render(<ExtApi />);

      await waitFor(() => {
        expect(screen.queryByText('Loading teams...')).not.toBeInTheDocument();
      });

      // Check main section styling
      const mainSection = container.firstChild as HTMLElement;
      expect(mainSection).toHaveClass('relative', 'w-full', 'max-w-6xl', 'mx-auto');

      // Check select element styling
      const selectElement = screen.getByDisplayValue('NFL');
      expect(selectElement).toHaveClass('w-full', 'mb-8', 'rounded-xl', 'bg-gray-800');

      // Check team list items styling - find by team names directly
      const teamOneElement = screen.getByText('Team One');
      const teamListItem = teamOneElement.closest('li');
      expect(teamListItem).toHaveClass('flex', 'items-center', 'p-4', 'rounded-xl');
    });
  });

  describe('Edge Cases', () => {
    test('does not fetch teams when no league is selected', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: [] }) // Empty leagues
      });

      render(<ExtApi />);

      await waitFor(() => {
        expect(screen.queryByText('Loading leagues...')).not.toBeInTheDocument();
      });

      // Should only call leagues API, not teams API
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('/api/sports/leagues');
    });

    test('handles malformed API responses', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ malformed: 'response' }) // Missing result property
        });

      render(<ExtApi />);

      await waitFor(() => {
        expect(screen.queryByText('Loading leagues...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('No leagues available')).toBeInTheDocument();
    });
  });
});