// app/analyst/[matchid]/tracker/__tests__/page.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import StatTrackerPage from '../page';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock BasketballStatTracker component
// Path: src/components/basketball-stat-tracker.tsx
jest.mock('../../../../../components/basketball-stat-tracker', () => {
  return {
    __esModule: true,
    default: jest.fn(({ gameData, onBack, onSave }) => (
      <div data-testid="basketball-stat-tracker">
        <div data-testid="game-id">{gameData.match_id}</div>
        <div data-testid="home-team">{gameData.homeTeam.name}</div>
        <div data-testid="away-team">{gameData.awayTeam.name}</div>
        <div data-testid="home-players-count">{gameData.homeTeam.players.length}</div>
        <div data-testid="away-players-count">{gameData.awayTeam.players.length}</div>
        <button onClick={onBack} data-testid="back-button">Back</button>
        <button onClick={() => onSave(gameData)} data-testid="save-button">Save</button>
      </div>
    )),
  };
});

describe('StatTrackerPage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  };

  const createMockSearchParams = (params: Record<string, string>) => {
    return {
      get: jest.fn((key: string) => params[key] || null),
      getAll: jest.fn(),
      has: jest.fn(),
      keys: jest.fn(),
      values: jest.fn(),
      entries: jest.fn(),
      forEach: jest.fn(),
      toString: jest.fn(),
      [Symbol.iterator]: jest.fn(),
    };
  };

  const mockHomeLineup = [
    {
      id: '1',
      name: 'John',
      surname: 'Doe',
      position: 'Forward',
      jerseyNumber: 10,
      avatarUrl: '/avatars/john.jpg',
    },
    {
      id: '2',
      name: 'Jane',
      surname: 'Smith',
      position: 'Guard',
      jerseyNumber: 5,
      avatarUrl: '/avatars/jane.jpg',
    },
  ];

  const mockAwayLineup = [
    {
      id: '3',
      name: 'Bob',
      surname: 'Johnson',
      position: 'Center',
      jerseyNumber: 15,
      avatarUrl: '/avatars/bob.jpg',
    },
  ];

  const defaultParams = {
    gameId: 'game-123',
    date: 'January 15, 2024',
    homeTeamId: 'team-1',
    awayTeamId: 'team-2',
    homeTeam: 'Home United',
    awayTeam: 'Away FC',
    homeLogo: '/logos/home.png',
    awayLogo: '/logos/away.png',
    homeLineup: encodeURIComponent(JSON.stringify(mockHomeLineup)),
    awayLineup: encodeURIComponent(JSON.stringify(mockAwayLineup)),
    location: 'Main Stadium',
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should eventually render the component after loading', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('basketball-stat-tracker')).toBeInTheDocument();
      });
    });

    it('should hide loading state after data is loaded', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading game data...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Successful Data Loading', () => {
    it('should render BasketballStatTracker with correct game data', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('basketball-stat-tracker')).toBeInTheDocument();
      });

      expect(screen.getByTestId('game-id')).toHaveTextContent('game-123');
      expect(screen.getByTestId('home-team')).toHaveTextContent('Home United');
      expect(screen.getByTestId('away-team')).toHaveTextContent('Away FC');
    });

    it('should parse and format home lineup correctly', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('home-players-count')).toHaveTextContent('2');
      });
    });

    it('should parse and format away lineup correctly', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('away-players-count')).toHaveTextContent('1');
      });
    });

    it('should use all URL parameters correctly', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      
      expect(callArgs.gameData).toMatchObject({
        match_id: 'game-123',
        date: 'January 15, 2024',
        location: 'Main Stadium',
        status: 'live',
        homeTeam: {
          team_id: 'team-1',
          name: 'Home United',
          color: 'blue',
          score: 0,
          timeouts: 0,
          fouls: 0,
        },
        awayTeam: {
          team_id: 'team-2',
          name: 'Away FC',
          color: 'red',
          score: 0,
          timeouts: 0,
          fouls: 0,
        },
      });
    });

    it('should format player data correctly', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      
      expect(callArgs.gameData.homeTeam.players[0]).toEqual({
        player_id: 'team-1-1',
        name: 'John',
        position: 'Forward',
        jerseyNumber: 10,
      });
    });
  });

  describe('Default Values', () => {
    it('should use default values when parameters are missing', async () => {
      const mockSearchParams = createMockSearchParams({});
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      
      expect(callArgs.gameData).toMatchObject({
        match_id: 'game-001',
        homeTeam: {
          team_id: 'home-team',
          name: 'Home Team',
        },
        awayTeam: {
          team_id: 'away-team',
          name: 'Away Team',
        },
        location: 'Court',
      });
    });

    it('should generate current date when date parameter is missing', async () => {
      const mockSearchParams = createMockSearchParams({});
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      const expectedDate = new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      
      expect(callArgs.gameData.date).toBe(expectedDate);
    });

    it('should use placeholder logos when not provided', async () => {
      const paramsWithoutLogos = {
        gameId: defaultParams.gameId,
        date: defaultParams.date,
        homeTeamId: defaultParams.homeTeamId,
        awayTeamId: defaultParams.awayTeamId,
        homeTeam: defaultParams.homeTeam,
        awayTeam: defaultParams.awayTeam,
        homeLineup: defaultParams.homeLineup,
        awayLineup: defaultParams.awayLineup,
        location: defaultParams.location,
      };
      
      const mockSearchParams = createMockSearchParams(paramsWithoutLogos);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      expect(callArgs.gameData.homeTeam).toBeDefined();
      expect(callArgs.gameData.awayTeam).toBeDefined();
    });
  });

  describe('Lineup Parsing Edge Cases', () => {
    it('should handle invalid JSON in lineup gracefully', async () => {
      const paramsWithInvalidJSON = {
        ...defaultParams,
        homeLineup: 'invalid-json',
        awayLineup: 'also-invalid',
      };
      
      const mockSearchParams = createMockSearchParams(paramsWithInvalidJSON);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const consoleWarnSpy = jest.spyOn(console, 'warn');

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('basketball-stat-tracker')).toBeInTheDocument();
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to parse lineup data, using empty lineups',
        expect.any(Error)
      );

      expect(screen.getByTestId('home-players-count')).toHaveTextContent('0');
      expect(screen.getByTestId('away-players-count')).toHaveTextContent('0');
    });

    it('should handle null lineup parameters', async () => {
      const paramsWithoutLineups = {
        gameId: defaultParams.gameId,
        date: defaultParams.date,
        homeTeamId: defaultParams.homeTeamId,
        awayTeamId: defaultParams.awayTeamId,
        homeTeam: defaultParams.homeTeam,
        awayTeam: defaultParams.awayTeam,
        homeLogo: defaultParams.homeLogo,
        awayLogo: defaultParams.awayLogo,
        location: defaultParams.location,
      };
      
      const mockSearchParams = createMockSearchParams(paramsWithoutLineups);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('basketball-stat-tracker')).toBeInTheDocument();
      });

      expect(screen.getByTestId('home-players-count')).toHaveTextContent('0');
      expect(screen.getByTestId('away-players-count')).toHaveTextContent('0');
    });

    it('should handle empty array lineups', async () => {
      const paramsWithEmptyLineups = {
        ...defaultParams,
        homeLineup: encodeURIComponent(JSON.stringify([])),
        awayLineup: encodeURIComponent(JSON.stringify([])),
      };
      
      const mockSearchParams = createMockSearchParams(paramsWithEmptyLineups);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('basketball-stat-tracker')).toBeInTheDocument();
      });

      expect(screen.getByTestId('home-players-count')).toHaveTextContent('0');
      expect(screen.getByTestId('away-players-count')).toHaveTextContent('0');
    });

    it('should handle players with missing properties', async () => {
      const incompleteLineup = [
        { id: null, name: null, position: null, jerseyNumber: null },
      ];
      
      const paramsWithIncompleteData = {
        ...defaultParams,
        homeLineup: encodeURIComponent(JSON.stringify(incompleteLineup)),
      };
      
      const mockSearchParams = createMockSearchParams(paramsWithIncompleteData);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      
      expect(callArgs.gameData.homeTeam.players[0]).toMatchObject({
        player_id: expect.stringContaining('team-1'),
        name: 'Player 1',
        position: 'Unknown',
        jerseyNumber: 1,
      });
    });

    it('should generate fallback player IDs when ID is missing', async () => {
      const lineupWithoutIds = [
        { name: 'Test Player', position: 'Guard' },
      ];
      
      const paramsWithoutIds = {
        ...defaultParams,
        homeLineup: encodeURIComponent(JSON.stringify(lineupWithoutIds)),
      };
      
      const mockSearchParams = createMockSearchParams(paramsWithoutIds);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      
      expect(callArgs.gameData.homeTeam.players[0].player_id).toBe('team-1-home-player-1');
    });
  });

  describe('Navigation', () => {
    it('should call router.back when onBack is triggered', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('back-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('back-button'));

      expect(mockRouter.back).toHaveBeenCalledTimes(1);
    });

    it('should show back button in error state', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      // Mock searchParams.get to throw an error during useEffect
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'gameId') {
          throw new Error('Navigation error');
        }
        return null;
      });

      render(<StatTrackerPage />);

      // Should show error state with "Failed to load game data from URL parameters"
      await waitFor(() => {
        expect(screen.getByText(/Failed to load game data from URL parameters/i)).toBeInTheDocument();
      });

      // Should have a back button in error state
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });
  });

  describe('Save Functionality', () => {
    let createElementSpy: jest.SpyInstance;
    let appendChildSpy: jest.SpyInstance;
    let removeChildSpy: jest.SpyInstance;
    let createObjectURLSpy: jest.SpyInstance;
    let revokeObjectURLSpy: jest.SpyInstance;
    let alertSpy: jest.SpyInstance;
    let mockLink: any;

    beforeEach(() => {
      mockLink = {
        click: jest.fn(),
        href: '',
        download: '',
      };
      
      // Only mock createElement when it's called with 'a'
      createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockLink as any;
        }
        return document.createElement.bind(document)(tagName);
      });
      
      appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation((node: any) => node);
      removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation((node: any) => node);
      
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
      
      createObjectURLSpy = jest.spyOn(global.URL, 'createObjectURL');
      revokeObjectURLSpy = jest.spyOn(global.URL, 'revokeObjectURL');
      
      alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    });

    it('should download game data when save is triggered', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('save-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(createObjectURLSpy).toHaveBeenCalled();
        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(appendChildSpy).toHaveBeenCalled();
        expect(removeChildSpy).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalledWith('Game data downloaded successfully!');
      });
    });

    it('should create proper filename with team names and date', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const mockLink = { click: jest.fn(), href: '', download: '' };
      createElementSpy.mockReturnValue(mockLink as any);

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('save-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(mockLink.download).toMatch(/game-stats-Home United-vs-Away FC-\d{4}-\d{2}-\d{2}\.json/);
      });
    });

    it('should create a Blob with correct data', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const blobSpy = jest.spyOn(global, 'Blob');

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('save-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(blobSpy).toHaveBeenCalledWith(
          [expect.any(String)],
          { type: 'application/json' }
        );
      });
    });

    it('should cleanup URL after download', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('save-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
      });
    });

    it('should handle save errors gracefully', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      createObjectURLSpy.mockImplementation(() => {
        throw new Error('Blob creation failed');
      });
      const consoleErrorSpy = jest.spyOn(console, 'error');

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('save-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to save game:',
          expect.any(Error)
        );
        expect(alertSpy).toHaveBeenCalledWith('Failed to download game data. Please try again.');
      });
    });
  });

  describe('Error States', () => {
    it('should handle errors during data loading', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      const consoleErrorSpy = jest.spyOn(console, 'error');
      
      // Make JSON.parse throw an error after decodeURIComponent
      // This happens inside the try-catch for lineup parsing, which is caught
      // So we need to make the outer try-catch trigger
      let callCount = 0;
      mockSearchParams.get.mockImplementation((key: string) => {
        callCount++;
        // Throw on the first call to trigger the outer catch block
        if (callCount === 1) {
          throw new Error('Parse error');
        }
        return defaultParams[key as keyof typeof defaultParams] || null;
      });
      
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to load game data:',
          expect.any(Error)
        );
      });
      
      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/Failed to load game data from URL parameters/i)).toBeInTheDocument();
      });
    });
  });

  describe('useEffect Dependency', () => {
    it('should reload data when searchParams change', async () => {
      const initialParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(initialParams);

      const { rerender } = render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('game-id')).toHaveTextContent('game-123');
      });

      // Change params
      const newParams = createMockSearchParams({
        ...defaultParams,
        gameId: 'game-456',
        homeTeam: 'New Home',
      });
      (useSearchParams as jest.Mock).mockReturnValue(newParams);

      rerender(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('game-id')).toHaveTextContent('game-456');
        expect(screen.getByTestId('home-team')).toHaveTextContent('New Home');
      });
    });
  });

  describe('Player Formatting', () => {
    it('should handle non-array player data', async () => {
      const paramsWithInvalidLineup = {
        ...defaultParams,
        homeLineup: encodeURIComponent(JSON.stringify('not-an-array')),
      };
      
      const mockSearchParams = createMockSearchParams(paramsWithInvalidLineup);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('basketball-stat-tracker')).toBeInTheDocument();
      });

      // Should handle gracefully and return empty array
      expect(screen.getByTestId('home-players-count')).toHaveTextContent('0');
    });

    it('should assign correct team prefix to player IDs', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      
      // Home players should have team-1 prefix
      expect(callArgs.gameData.homeTeam.players[0].player_id).toContain('team-1');
      
      // Away players should have team-2 prefix
      expect(callArgs.gameData.awayTeam.players[0].player_id).toContain('team-2');
    });
  });
});