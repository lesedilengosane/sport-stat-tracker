// __tests__/MatchStatistics.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import MatchStatistics from '../MatchStatistics';

// Mock fetch
global.fetch = jest.fn();

describe('MatchStatistics', () => {
  const mockStatsData = {
    Statistics: [
      {
        Home: {
          TeamName: 'Manchester United',
          Stats: [
            { Type: 'Shots on Goal', Value: '12' },
            { Type: 'Possession %', Value: '58' },
            { Type: 'Corners', Value: '7' },
            { Type: 'Fouls', Value: '11' },
          ],
        },
        Away: {
          TeamName: 'Liverpool',
          Stats: [
            { Type: 'Shots on Goal', Value: '9' },
            { Type: 'Possession %', Value: '42' },
            { Type: 'Corners', Value: '5' },
            { Type: 'Fouls', Value: '14' },
          ],
        },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading message initially', () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<MatchStatistics />);

      expect(screen.getByText('Loading match statistics...')).toBeInTheDocument();
    });

    it('should apply loading animation classes', () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<MatchStatistics />);

      const loadingElement = screen.getByText('Loading match statistics...');
      expect(loadingElement).toHaveClass('animate-pulse');
      expect(loadingElement).toHaveClass('text-white');
    });
  });

  describe('Successful Data Fetching', () => {
    it('should fetch match statistics on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStatsData,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/match-stats');
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });

    it('should display team names correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStatsData,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        expect(screen.getByText('Manchester United')).toBeInTheDocument();
        expect(screen.getByText('Liverpool')).toBeInTheDocument();
      });
    });

    it('should display title "Live Match Statistics"', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStatsData,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        expect(screen.getByText('⚽ Live Match Statistics')).toBeInTheDocument();
      });
    });

    it('should display all stat types', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStatsData,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        expect(screen.getByText('Shots on Goal')).toBeInTheDocument();
        expect(screen.getByText('Possession %')).toBeInTheDocument();
        expect(screen.getByText('Corners')).toBeInTheDocument();
        expect(screen.getByText('Fouls')).toBeInTheDocument();
      });
    });

    it('should display all stat values for home team', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStatsData,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        expect(screen.getByText('12')).toBeInTheDocument(); // Shots on Goal
        expect(screen.getByText('58')).toBeInTheDocument(); // Possession
        expect(screen.getByText('7')).toBeInTheDocument(); // Corners
        expect(screen.getByText('11')).toBeInTheDocument(); // Fouls
      });
    });

    it('should display all stat values for away team', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStatsData,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        expect(screen.getByText('9')).toBeInTheDocument(); // Shots on Goal
        expect(screen.getByText('42')).toBeInTheDocument(); // Possession
        expect(screen.getByText('5')).toBeInTheDocument(); // Corners
        expect(screen.getByText('14')).toBeInTheDocument(); // Fouls
      });
    });

    it('should display "Stat" header', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStatsData,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        expect(screen.getByText('Stat')).toBeInTheDocument();
      });
    });

    it('should render stats in grid layout', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStatsData,
      });

      const { container } = render(<MatchStatistics />);

      await waitFor(() => {
        const grid = container.querySelector('.grid.grid-cols-3');
        expect(grid).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<MatchStatistics />);

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch match statistics.')).toBeInTheDocument();
      });
    });

    it('should display error message when response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch match statistics.')).toBeInTheDocument();
      });
    });

    it('should log error to console', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      render(<MatchStatistics />);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(expect.any(Error));
      });

      consoleError.mockRestore();
    });

    it('should apply error styling classes', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<MatchStatistics />);

      await waitFor(() => {
        const errorElement = screen.getByText('Failed to fetch match statistics.');
        expect(errorElement).toHaveClass('text-red-400');
      });
    });
  });

  describe('Empty/Null Data Handling', () => {
    it('should display "No stats found" when stats is null', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => null,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        expect(screen.getByText('No stats found.')).toBeInTheDocument();
      });
    });

    it('should display "No stats found" when stats is undefined', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => undefined,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        expect(screen.getByText('No stats found.')).toBeInTheDocument();
      });
    });

    it('should use default team names when TeamName is missing', async () => {
      const dataWithoutTeamNames = {
        Statistics: [
          {
            Home: {
              Stats: [{ Type: 'Shots', Value: '10' }],
            },
            Away: {
              Stats: [{ Type: 'Shots', Value: '8' }],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => dataWithoutTeamNames,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Away')).toBeInTheDocument();
      });
    });

    it('should display "-" for missing stat values', async () => {
      const dataWithMissingValues = {
        Statistics: [
          {
            Home: {
              TeamName: 'Team A',
              Stats: [{ Type: 'Shots', Value: null }],
            },
            Away: {
              TeamName: 'Team B',
              Stats: [{ Type: 'Shots', Value: undefined }],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => dataWithMissingValues,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        const dashes = screen.getAllByText('-');
        expect(dashes.length).toBeGreaterThan(0);
      });
    });

    it('should display "—" for missing stat types', async () => {
      const dataWithMissingTypes = {
        Statistics: [
          {
            Home: {
              TeamName: 'Team A',
              Stats: [{ Value: '10' }],
            },
            Away: {
              TeamName: 'Team B',
              Stats: [{ Value: '8' }],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => dataWithMissingTypes,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        expect(screen.getByText('—')).toBeInTheDocument();
      });
    });

    it('should handle empty Stats array', async () => {
      const dataWithEmptyStats = {
        Statistics: [
          {
            Home: {
              TeamName: 'Team A',
              Stats: [],
            },
            Away: {
              TeamName: 'Team B',
              Stats: [],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => dataWithEmptyStats,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        expect(screen.getByText('Team A')).toBeInTheDocument();
        expect(screen.getByText('Team B')).toBeInTheDocument();
      });
    });

    it('should handle missing Statistics array', async () => {
      const dataWithoutStatistics = {};

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => dataWithoutStatistics,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Away')).toBeInTheDocument();
      });
    });

    it('should handle mismatched away stats count', async () => {
      const dataWithMismatchedStats = {
        Statistics: [
          {
            Home: {
              TeamName: 'Team A',
              Stats: [
                { Type: 'Shots', Value: '10' },
                { Type: 'Corners', Value: '5' },
              ],
            },
            Away: {
              TeamName: 'Team B',
              Stats: [{ Type: 'Shots', Value: '8' }],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => dataWithMismatchedStats,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        expect(screen.getByText('Team A')).toBeInTheDocument();
        expect(screen.getByText('Team B')).toBeInTheDocument();
        expect(screen.getByText('Corners')).toBeInTheDocument();
      });
    });
  });

  describe('UI Styling', () => {
    it('should apply correct styling to main container', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStatsData,
      });

      const { container } = render(<MatchStatistics />);

      await waitFor(() => {
        const mainDiv = container.querySelector('.backdrop-blur-md');
        expect(mainDiv).toHaveClass('bg-black/30');
        expect(mainDiv).toHaveClass('border');
        expect(mainDiv).toHaveClass('border-white/10');
        expect(mainDiv).toHaveClass('rounded-2xl');
      });
    });

    it('should apply correct styling to title', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStatsData,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        const title = screen.getByText('⚽ Live Match Statistics');
        expect(title).toHaveClass('text-2xl');
        expect(title).toHaveClass('font-bold');
        expect(title).toHaveClass('text-orange-400');
      });
    });

    it('should apply correct styling to team names', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStatsData,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        const homeTeam = screen.getByText('Manchester United');
        const awayTeam = screen.getByText('Liverpool');
        expect(homeTeam).toHaveClass('font-semibold');
        expect(homeTeam).toHaveClass('text-orange-500');
        expect(awayTeam).toHaveClass('font-semibold');
        expect(awayTeam).toHaveClass('text-orange-500');
      });
    });
  });

  describe('Data Structure Variations', () => {
    it('should handle single stat correctly', async () => {
      const singleStatData = {
        Statistics: [
          {
            Home: {
              TeamName: 'Team A',
              Stats: [{ Type: 'Goals', Value: '2' }],
            },
            Away: {
              TeamName: 'Team B',
              Stats: [{ Type: 'Goals', Value: '1' }],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => singleStatData,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        expect(screen.getByText('Goals')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });

    it('should handle many stats correctly', async () => {
      const manyStatsData = {
        Statistics: [
          {
            Home: {
              TeamName: 'Team A',
              Stats: Array(10)
                .fill(null)
                .map((_, i) => ({ Type: `Stat ${i + 1}`, Value: `${i + 1}` })),
            },
            Away: {
              TeamName: 'Team B',
              Stats: Array(10)
                .fill(null)
                .map((_, i) => ({ Type: `Stat ${i + 1}`, Value: `${i + 10}` })),
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => manyStatsData,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        expect(screen.getByText('Stat 1')).toBeInTheDocument();
        expect(screen.getByText('Stat 10')).toBeInTheDocument();
      });
    });

    it('should handle special characters in team names', async () => {
      const specialCharsData = {
        Statistics: [
          {
            Home: {
              TeamName: "O'Brien's FC",
              Stats: [{ Type: 'Shots', Value: '10' }],
            },
            Away: {
              TeamName: 'Ñoño & Co.',
              Stats: [{ Type: 'Shots', Value: '8' }],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => specialCharsData,
      });

      render(<MatchStatistics />);

      await waitFor(() => {
        expect(screen.getByText("O'Brien's FC")).toBeInTheDocument();
        expect(screen.getByText('Ñoño & Co.')).toBeInTheDocument();
      });
    });
  });
});