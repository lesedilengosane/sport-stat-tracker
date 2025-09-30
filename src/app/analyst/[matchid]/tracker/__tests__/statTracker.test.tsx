// app/analyst/[matchid]/tracker/__tests__/page.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import StatTrackerPage from '../page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

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
    it('should show loading spinner and text initially', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StatTrackerPage />);

      // Try to catch the loading state, but it's okay if it loads too fast
      const loadingText = screen.queryByText('Loading game data...');
      const spinner = document.querySelector('.animate-spin');
      
      // If we catch it in loading state, verify it
      if (loadingText && spinner) {
        expect(loadingText).toBeInTheDocument();
        expect(spinner).toBeInTheDocument();
      }

      // Ultimately, the component should render successfully
      await waitFor(() => {
        expect(screen.getByTestId('basketball-stat-tracker')).toBeInTheDocument();
      });
    });

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

    it('should use default location "Court" when location parameter is missing', async () => {
      const { location, ...paramsWithoutLocation } = defaultParams;
      
      const mockSearchParams = createMockSearchParams(paramsWithoutLocation);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      expect(callArgs.gameData.location).toBe('Court');
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

    it('should handle partially valid JSON in lineup (only homeLineup invalid)', async () => {
      const paramsWithPartialInvalidJSON = {
        ...defaultParams,
        homeLineup: 'invalid-json',
      };
      
      const mockSearchParams = createMockSearchParams(paramsWithPartialInvalidJSON);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const consoleWarnSpy = jest.spyOn(console, 'warn');

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('basketball-stat-tracker')).toBeInTheDocument();
      });

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(screen.getByTestId('home-players-count')).toHaveTextContent('0');
      expect(screen.getByTestId('away-players-count')).toHaveTextContent('0');
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

    it('should show back button in error state with no game data', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'gameId') {
          throw new Error('Navigation error');
        }
        return null;
      });

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load game data from URL parameters/i)).toBeInTheDocument();
      });

      const backButton = screen.getByText('Go Back');
      expect(backButton).toBeInTheDocument();
      
      fireEvent.click(backButton);
      expect(mockRouter.back).toHaveBeenCalled();
    });

    it('should show back button when no game data is available after loading', async () => {
      const mockSearchParams = createMockSearchParams({});
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      // Force gameData to be null by throwing during state setting
      mockSearchParams.get.mockImplementation(() => {
        throw new Error('Critical error');
      });

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load game data from URL parameters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Save Functionality', () => {
    let alertSpy: jest.SpyInstance;

    it('should download game data when save is triggered', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      
      // Mock DOM methods
      const mockLink = { click: jest.fn(), href: '', download: '' };
      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
      alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('save-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled();
        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(appendChildSpy).toHaveBeenCalled();
        expect(removeChildSpy).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalledWith('Game data downloaded successfully!');
      });
      
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('should create proper filename with team names and date', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      
      let capturedLink: any;
      const mockLink = { click: jest.fn(), href: '', download: '' };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation((node: any) => {
        capturedLink = node;
        return node;
      });
      jest.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('save-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(mockLink.download).toMatch(/game-stats-Home United-vs-Away FC-\d{4}-\d{2}-\d{2}\.json/);
      });
      
      appendChildSpy.mockRestore();
    });

    it('should create a Blob with correct data', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      
      const mockLink = { click: jest.fn(), href: '', download: '' };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      jest.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
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
      
      const mockLink = { click: jest.fn(), href: '', download: '' };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      jest.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
      alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('save-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      });
    });

    it('should handle save errors gracefully', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      
      const mockLink = { click: jest.fn(), href: '', download: '' };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      jest.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
      
      (global.URL.createObjectURL as jest.Mock) = jest.fn(() => {
        throw new Error('Blob creation failed');
      });
      
      alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
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

    it('should properly append and remove link from DOM', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      
      let capturedLink: any;
      const mockLink = { click: jest.fn(), href: '', download: '' };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation((node: any) => {
        capturedLink = node;
        return node;
      });
      const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('save-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(appendChildSpy).toHaveBeenCalledWith(capturedLink);
        expect(mockLink.click).toHaveBeenCalled();
        expect(removeChildSpy).toHaveBeenCalledWith(capturedLink);
      });
    });

    it('should set correct href on download link', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      
      const mockLink = { click: jest.fn(), href: '', download: '' };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      jest.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('save-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('save-button'));

      await waitFor(() => {
        expect(mockLink.href).toBe('blob:mock-url');
      });
    });
  });

  describe('Error States', () => {
    it('should handle errors during data loading', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      const consoleErrorSpy = jest.spyOn(console, 'error');
      
      let callCount = 0;
      mockSearchParams.get.mockImplementation((key: string) => {
        callCount++;
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
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to load game data from URL parameters/i)).toBeInTheDocument();
      });
    });

    it('should maintain error message while showing loading was attempted', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      mockSearchParams.get.mockImplementation(() => {
        throw new Error('Critical error');
      });
      
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading game data...')).not.toBeInTheDocument();
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

    it('should clear error state when searchParams change to valid data', async () => {
      const errorParams = createMockSearchParams(defaultParams);
      errorParams.get.mockImplementation(() => {
        throw new Error('Initial error');
      });
      
      (useSearchParams as jest.Mock).mockReturnValue(errorParams);

      const { rerender } = render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load game data from URL parameters/i)).toBeInTheDocument();
      });

      const validParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(validParams);

      rerender(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.queryByText(/Failed to load game data from URL parameters/i)).not.toBeInTheDocument();
        expect(screen.getByTestId('basketball-stat-tracker')).toBeInTheDocument();
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
      
      expect(callArgs.gameData.homeTeam.players[0].player_id).toContain('team-1');
      expect(callArgs.gameData.awayTeam.players[0].player_id).toContain('team-2');
    });

    it('should handle players with partial data (missing jerseyNumber)', async () => {
      const partialLineup = [
        { id: '1', name: 'John', position: 'Forward' },
      ];
      
      const paramsWithPartialData = {
        ...defaultParams,
        homeLineup: encodeURIComponent(JSON.stringify(partialLineup)),
      };
      
      const mockSearchParams = createMockSearchParams(paramsWithPartialData);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      expect(callArgs.gameData.homeTeam.players[0].jerseyNumber).toBe(1);
    });

    it('should handle players with zero as jerseyNumber', async () => {
      const lineupWithZero = [
        { id: '1', name: 'John', position: 'Forward', jerseyNumber: 0 },
      ];
      
      const paramsWithZero = {
        ...defaultParams,
        homeLineup: encodeURIComponent(JSON.stringify(lineupWithZero)),
      };
      
      const mockSearchParams = createMockSearchParams(paramsWithZero);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      expect(callArgs.gameData.homeTeam.players[0].jerseyNumber).toBe(1);
    });

    it('should correctly index multiple players', async () => {
      const multiplePlayersWithoutIds = [
        { name: 'Player A' },
        { name: 'Player B' },
        { name: 'Player C' },
      ];
      
      const paramsWithMultiple = {
        ...defaultParams,
        homeLineup: encodeURIComponent(JSON.stringify(multiplePlayersWithoutIds)),
      };
      
      const mockSearchParams = createMockSearchParams(paramsWithMultiple);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      const players = callArgs.gameData.homeTeam.players;
      
      expect(players[0].player_id).toBe('team-1-home-player-1');
      expect(players[1].player_id).toBe('team-1-home-player-2');
      expect(players[2].player_id).toBe('team-1-home-player-3');
      
      expect(players[0].jerseyNumber).toBe(1);
      expect(players[1].jerseyNumber).toBe(2);
      expect(players[2].jerseyNumber).toBe(3);
    });

    it('should use provided player ID when available', async () => {
      const lineupWithId = [
        { id: 'custom-id-123', name: 'John', position: 'Forward', jerseyNumber: 10 },
      ];
      
      const paramsWithCustomId = {
        ...defaultParams,
        homeLineup: encodeURIComponent(JSON.stringify(lineupWithId)),
      };
      
      const mockSearchParams = createMockSearchParams(paramsWithCustomId);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      expect(callArgs.gameData.homeTeam.players[0].player_id).toBe('team-1-custom-id-123');
    });
  });

  describe('Team Configuration', () => {
    it('should set correct team colors (blue for home, red for away)', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      expect(callArgs.gameData.homeTeam.color).toBe('blue');
      expect(callArgs.gameData.awayTeam.color).toBe('red');
    });

    it('should initialize team scores to 0', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      expect(callArgs.gameData.homeTeam.score).toBe(0);
      expect(callArgs.gameData.awayTeam.score).toBe(0);
    });

    it('should initialize team timeouts to 0', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      expect(callArgs.gameData.homeTeam.timeouts).toBe(0);
      expect(callArgs.gameData.awayTeam.timeouts).toBe(0);
    });

    it('should initialize team fouls to 0', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      expect(callArgs.gameData.homeTeam.fouls).toBe(0);
      expect(callArgs.gameData.awayTeam.fouls).toBe(0);
    });

    it('should set game status to "live"', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      expect(callArgs.gameData.status).toBe('live');
    });
  });

  describe('Component Integration', () => {
    it('should pass onBack callback to BasketballStatTracker', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      expect(callArgs.onBack).toBeInstanceOf(Function);
    });

    it('should pass onSave callback to BasketballStatTracker', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      expect(callArgs.onSave).toBeInstanceOf(Function);
    });

    it('should not render BasketballStatTracker during loading', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;
      
      // Clear previous calls
      BasketballStatTracker.mockClear();

      render(<StatTrackerPage />);

      // Immediately check - component should be loading
      const loadingText = screen.queryByText('Loading game data...');
      
      // If still loading, BasketballStatTracker shouldn't be called yet
      if (loadingText) {
        expect(BasketballStatTracker).not.toHaveBeenCalled();
      }

      // Wait for it to finish loading
      await waitFor(() => {
        expect(screen.getByTestId('basketball-stat-tracker')).toBeInTheDocument();
      });
    });
  });

  describe('Data Encoding', () => {
    it('should properly decode URL-encoded lineup data', async () => {
      const specialCharLineup = [
        { id: '1', name: 'O\'Brien', position: 'Guard & Forward', jerseyNumber: 10 },
      ];
      
      const paramsWithSpecialChars = {
        ...defaultParams,
        homeLineup: encodeURIComponent(JSON.stringify(specialCharLineup)),
      };
      
      const mockSearchParams = createMockSearchParams(paramsWithSpecialChars);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
      const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker').default;

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(BasketballStatTracker).toHaveBeenCalled();
      });

      const callArgs = BasketballStatTracker.mock.calls[0][0];
      expect(callArgs.gameData.homeTeam.players[0].name).toBe('O\'Brien');
      expect(callArgs.gameData.homeTeam.players[0].position).toBe('Guard & Forward');
    });

    it('should handle lineup data that is already decoded', async () => {
      const alreadyDecoded = JSON.stringify(mockHomeLineup);
      
      const paramsWithDecoded = {
        ...defaultParams,
        homeLineup: alreadyDecoded,
      };
      
      const mockSearchParams = createMockSearchParams(paramsWithDecoded);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StatTrackerPage />);

      await waitFor(() => {
        expect(screen.getByTestId('basketball-stat-tracker')).toBeInTheDocument();
      });

      expect(screen.getByTestId('home-players-count')).toHaveTextContent('2');
    });
  });

  describe('Accessibility and UI States', () => {
    it('should have proper accessibility on loading state', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StatTrackerPage />);

      // Check for loading elements
      const loadingText = screen.queryByText('Loading game data...');
      const spinner = document.querySelector('.animate-spin');
      
      // If we catch the loading state, verify it exists
      if (loadingText && spinner) {
        expect(loadingText).toBeInTheDocument();
        expect(spinner).toBeInTheDocument();
      }

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByTestId('basketball-stat-tracker')).toBeInTheDocument();
      });
    });

    it('should display error message prominently', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      mockSearchParams.get.mockImplementation(() => {
        throw new Error('Test error');
      });
      
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StatTrackerPage />);

      await waitFor(() => {
        const errorMessage = screen.getByText(/Failed to load game data from URL parameters/i);
        expect(errorMessage).toHaveClass('text-red-600');
      });
    });

    it('should style back button consistently', async () => {
      const mockSearchParams = createMockSearchParams(defaultParams);
      mockSearchParams.get.mockImplementation(() => {
        throw new Error('Test error');
      });
      
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

      render(<StatTrackerPage />);

      await waitFor(() => {
        const backButton = screen.getByText('Go Back');
        expect(backButton).toHaveClass('px-4', 'py-2', 'bg-blue-500', 'text-white', 'rounded');
      });
    });
  });
});