// __tests__/ExtApi.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ExtApi from '../ExtApi';

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
      data-testid="team-logo"
    />
  ),
}));

// Mock fetch
global.fetch = jest.fn();

describe('ExtApi', () => {
  const mockLeagues = [
    { league_key: 'league-1', league_name: 'Premier League' },
    { league_key: 'league-2', league_name: 'La Liga' },
    { league_key: 'league-3', league_name: 'Serie A' },
  ];

  const mockTeamsLeague1 = [
    {
      team_key: 'team-1',
      team_name: 'Manchester United',
      league_key: 'league-1',
      team_logo: '/logos/mu.png',
    },
    {
      team_key: 'team-2',
      team_name: 'Chelsea',
      league_key: 'league-1',
      team_logo: '/logos/chelsea.png',
    },
  ];

  const mockTeamsLeague2 = [
    {
      team_key: 'team-3',
      team_name: 'Barcelona',
      league_key: 'league-2',
      team_logo: '/logos/barca.png',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render the component', () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ result: [] }),
      });

      render(<ExtApi />);
      expect(screen.getByText('Leagues')).toBeInTheDocument();
      expect(screen.getByText('Teams')).toBeInTheDocument();
    });

    it('should show loading states initially', () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<ExtApi />);
      expect(screen.getByText('Loading leagues...')).toBeInTheDocument();
      expect(screen.getByText('Loading teams...')).toBeInTheDocument();
    });
  });

  describe('Leagues Fetching', () => {
    it('should fetch and display leagues', async () => {
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url === '/api/sports/leagues') {
          return Promise.resolve({
            json: async () => ({ result: mockLeagues }),
          });
        }
        return Promise.resolve({
          json: async () => ({ result: [] }),
        });
      });

      render(<ExtApi />);

      await waitFor(() => {
        expect(screen.getByText('Premier League')).toBeInTheDocument();
      });

      expect(screen.getByText('La Liga')).toBeInTheDocument();
      expect(screen.getByText('Serie A')).toBeInTheDocument();
    });

    it('should call leagues API on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ result: mockLeagues }),
      });

      render(<ExtApi />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/sports/leagues');
      });
    });

    it('should display "No leagues available" when leagues array is empty', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ result: [] }),
      });

      render(<ExtApi />);

      await waitFor(() => {
        expect(screen.getByText('No leagues available')).toBeInTheDocument();
      });
    });

    it('should handle leagues API error gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      render(<ExtApi />);

      await waitFor(() => {
        expect(screen.getByText('No leagues available')).toBeInTheDocument();
      });

      expect(consoleError).toHaveBeenCalledWith(
        'Error fetching leagues:',
        expect.any(Error)
      );
      consoleError.mockRestore();
    });

    it('should set first league as selected by default', async () => {
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url === '/api/sports/leagues') {
          return Promise.resolve({
            json: async () => ({ result: mockLeagues }),
          });
        }
        if (url.includes('league_id=league-1')) {
          return Promise.resolve({
            json: async () => ({ result: mockTeamsLeague1 }),
          });
        }
        return Promise.resolve({
          json: async () => ({ result: [] }),
        });
      });

      render(<ExtApi />);

      await waitFor(() => {
        const select = screen.getByRole('combobox') as HTMLSelectElement;
        expect(select.value).toBe('league-1');
      });
    });
  });

  describe('Teams Fetching', () => {
    it('should fetch and display teams for selected league', async () => {
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url === '/api/sports/leagues') {
          return Promise.resolve({
            json: async () => ({ result: mockLeagues }),
          });
        }
        if (url.includes('league_id=league-1')) {
          return Promise.resolve({
            json: async () => ({ result: mockTeamsLeague1 }),
          });
        }
        return Promise.resolve({
          json: async () => ({ result: [] }),
        });
      });

      render(<ExtApi />);

      await waitFor(() => {
        expect(screen.getByText('Manchester United')).toBeInTheDocument();
      });

      expect(screen.getByText('Chelsea')).toBeInTheDocument();
    });

    it('should call teams API with correct league_id', async () => {
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url === '/api/sports/leagues') {
          return Promise.resolve({
            json: async () => ({ result: mockLeagues }),
          });
        }
        return Promise.resolve({
          json: async () => ({ result: [] }),
        });
      });

      render(<ExtApi />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/sports/teams?league_id=league-1'
        );
      });
    });

    it('should display "No teams available" when teams array is empty', async () => {
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url === '/api/sports/leagues') {
          return Promise.resolve({
            json: async () => ({ result: mockLeagues }),
          });
        }
        return Promise.resolve({
          json: async () => ({ result: [] }),
        });
      });

      render(<ExtApi />);

      await waitFor(() => {
        expect(
          screen.getByText('No teams available for this league')
        ).toBeInTheDocument();
      });
    });

    it('should handle teams API error gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url === '/api/sports/leagues') {
          return Promise.resolve({
            json: async () => ({ result: mockLeagues }),
          });
        }
        return Promise.reject(new Error('Teams API Error'));
      });

      render(<ExtApi />);

      await waitFor(() => {
        expect(
          screen.getByText('No teams available for this league')
        ).toBeInTheDocument();
      });

      expect(consoleError).toHaveBeenCalledWith(
        'Error fetching teams:',
        expect.any(Error)
      );
      consoleError.mockRestore();
    });

    it('should render team logos when available', async () => {
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url === '/api/sports/leagues') {
          return Promise.resolve({
            json: async () => ({ result: mockLeagues }),
          });
        }
        if (url.includes('league_id=league-1')) {
          return Promise.resolve({
            json: async () => ({ result: mockTeamsLeague1 }),
          });
        }
        return Promise.resolve({
          json: async () => ({ result: [] }),
        });
      });

      render(<ExtApi />);

      await waitFor(() => {
        const logos = screen.getAllByTestId('team-logo');
        expect(logos).toHaveLength(2);
      });

      const logos = screen.getAllByTestId('team-logo');
      expect(logos[0]).toHaveAttribute('src', '/logos/mu.png');
      expect(logos[0]).toHaveAttribute('alt', 'Manchester United');
      expect(logos[1]).toHaveAttribute('src', '/logos/chelsea.png');
      expect(logos[1]).toHaveAttribute('alt', 'Chelsea');
    });

    it('should not render logo when team_logo is not provided', async () => {
      const teamsWithoutLogo = [
        {
          team_key: 'team-1',
          team_name: 'Manchester United',
          league_key: 'league-1',
        },
      ];

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url === '/api/sports/leagues') {
          return Promise.resolve({
            json: async () => ({ result: mockLeagues }),
          });
        }
        if (url.includes('league_id=league-1')) {
          return Promise.resolve({
            json: async () => ({ result: teamsWithoutLogo }),
          });
        }
        return Promise.resolve({
          json: async () => ({ result: [] }),
        });
      });

      render(<ExtApi />);

      await waitFor(() => {
        expect(screen.getByText('Manchester United')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('team-logo')).not.toBeInTheDocument();
    });
  });

  describe('League Selection', () => {
    it('should fetch new teams when league selection changes', async () => {
      let fetchCallCount = 0;
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url === '/api/sports/leagues') {
          return Promise.resolve({
            json: async () => ({ result: mockLeagues }),
          });
        }
        if (url.includes('league_id=league-1')) {
          fetchCallCount++;
          return Promise.resolve({
            json: async () => ({ result: mockTeamsLeague1 }),
          });
        }
        if (url.includes('league_id=league-2')) {
          fetchCallCount++;
          return Promise.resolve({
            json: async () => ({ result: mockTeamsLeague2 }),
          });
        }
        return Promise.resolve({
          json: async () => ({ result: [] }),
        });
      });

      render(<ExtApi />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Manchester United')).toBeInTheDocument();
      });

      // Change league
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'league-2' } });

      // Wait for new teams to load
      await waitFor(() => {
        expect(screen.getByText('Barcelona')).toBeInTheDocument();
      });

      expect(screen.queryByText('Manchester United')).not.toBeInTheDocument();
      expect(fetchCallCount).toBeGreaterThan(1);
    });

    it('should show loading state when changing leagues', async () => {
      let resolveTeamsPromise: any;
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url === '/api/sports/leagues') {
          return Promise.resolve({
            json: async () => ({ result: mockLeagues }),
          });
        }
        if (url.includes('league_id=league-1')) {
          return Promise.resolve({
            json: async () => ({ result: mockTeamsLeague1 }),
          });
        }
        if (url.includes('league_id=league-2')) {
          return new Promise((resolve) => {
            resolveTeamsPromise = resolve;
          });
        }
        return Promise.resolve({
          json: async () => ({ result: [] }),
        });
      });

      render(<ExtApi />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Manchester United')).toBeInTheDocument();
      });

      // Change league
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'league-2' } });

      // Should show loading
      await waitFor(() => {
        expect(screen.getByText('Loading teams...')).toBeInTheDocument();
      });

      // Resolve the promise
      if (resolveTeamsPromise) {
        resolveTeamsPromise({
          json: async () => ({ result: mockTeamsLeague2 }),
        });
      }

      // Should show teams
      await waitFor(() => {
        expect(screen.getByText('Barcelona')).toBeInTheDocument();
      });
    });

    it('should update select value when league changes', async () => {
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url === '/api/sports/leagues') {
          return Promise.resolve({
            json: async () => ({ result: mockLeagues }),
          });
        }
        return Promise.resolve({
          json: async () => ({ result: [] }),
        });
      });

      render(<ExtApi />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('league-1');

      fireEvent.change(select, { target: { value: 'league-3' } });

      expect(select.value).toBe('league-3');
    });
  });

  describe('Edge Cases', () => {
    it('should handle non-array result from leagues API', async () => {
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url === '/api/sports/leagues') {
          return Promise.resolve({
            json: async () => ({ result: null }),
          });
        }
        return Promise.resolve({
          json: async () => ({ result: [] }),
        });
      });

      render(<ExtApi />);

      await waitFor(() => {
        expect(screen.getByText('No leagues available')).toBeInTheDocument();
      });
    });

    it('should handle non-array result from teams API', async () => {
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url === '/api/sports/leagues') {
          return Promise.resolve({
            json: async () => ({ result: mockLeagues }),
          });
        }
        return Promise.resolve({
          json: async () => ({ result: null }),
        });
      });

      render(<ExtApi />);

      await waitFor(() => {
        expect(
          screen.getByText('No teams available for this league')
        ).toBeInTheDocument();
      });
    });

    it('should not fetch teams when no league is selected', async () => {
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url === '/api/sports/leagues') {
          return Promise.resolve({
            json: async () => ({ result: [] }),
          });
        }
        return Promise.resolve({
          json: async () => ({ result: [] }),
        });
      });

      render(<ExtApi />);

      await waitFor(() => {
        expect(screen.getByText('No leagues available')).toBeInTheDocument();
      });

      // Should only call leagues API, not teams API
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/sports/leagues');
    });
  });

  describe('UI Styling', () => {
    it('should apply correct CSS classes to main section', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ result: [] }),
      });

      const { container } = render(<ExtApi />);

      await waitFor(() => {
        expect(screen.getByText('Leagues')).toBeInTheDocument();
      });

      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-gradient-to-br');
      expect(section).toHaveClass('rounded-3xl');
    });

    it('should render team items with hover effects', async () => {
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url === '/api/sports/leagues') {
          return Promise.resolve({
            json: async () => ({ result: mockLeagues }),
          });
        }
        if (url.includes('league_id=league-1')) {
          return Promise.resolve({
            json: async () => ({ result: mockTeamsLeague1 }),
          });
        }
        return Promise.resolve({
          json: async () => ({ result: [] }),
        });
      });

      render(<ExtApi />);

      await waitFor(() => {
        expect(screen.getByText('Manchester United')).toBeInTheDocument();
      });

      const teamItem = screen.getByText('Manchester United').closest('li');
      expect(teamItem).toHaveClass('hover:bg-gray-700');
    });
  });
});