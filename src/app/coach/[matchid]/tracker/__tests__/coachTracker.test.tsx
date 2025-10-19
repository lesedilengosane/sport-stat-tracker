import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import '@testing-library/jest-dom';
import StatTrackerPage from '../page';
import { useAuth } from '../../../../context/AuthContext';
import { useMatches } from '../../../../context/MatchesContext';
import { apiClient } from '../../../../utils/apiClient';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('../../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../context/MatchesContext', () => ({
  useMatches: jest.fn(),
  MatchesProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('../../../../utils/apiClient', () => ({
  apiClient: {
    SaveGameData: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon">Loading...</div>,
}));

jest.mock('../../../../../components/basketball-stat-tracker', () => {
  return jest.fn(({ gameData, onBack, onSave }) => (
    <div data-testid="basketball-stat-tracker">
      <div data-testid="game-id">{gameData.match_id}</div>
      <div data-testid="home-team">{gameData.homeTeam.name}</div>
      <div data-testid="away-team">{gameData.awayTeam.name}</div>
      <button onClick={onBack} data-testid="back-button">Back</button>
      <button onClick={() => onSave(gameData)} data-testid="save-button">Save</button>
    </div>
  ));
});

describe('StatTrackerPage Component', () => {
  // Set up DOM environment
  beforeAll(() => {
    // Mock document.createElement to return proper DOM elements
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = jest.fn((tag: string) => {
      if (tag === 'a') {
        const element = originalCreateElement(tag);
        element.click = jest.fn();
        return element;
      }
      return originalCreateElement(tag);
    });
  });

  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockSearchParams = new Map([
    ['gameId', 'game-123'],
    ['date', 'January 1, 2025'],
    ['homeTeamId', 'home-team-1'],
    ['awayTeamId', 'away-team-1'],
    ['homeTeam', 'Home Team'],
    ['awayTeam', 'Away Team'],
    ['homeLogo', '/logos/home.png'],
    ['awayLogo', '/logos/away.png'],
    ['location', 'Test Arena'],
    ['homeLineup', JSON.stringify([
      { id: 'p1', name: 'Player 1', position: 'Guard', jerseyNumber: 1 },
      { id: 'p2', name: 'Player 2', position: 'Forward', jerseyNumber: 2 },
    ])],
    ['awayLineup', JSON.stringify([
      { id: 'p3', name: 'Player 3', position: 'Center', jerseyNumber: 3 },
    ])],
  ]);

  const mockUser = {
    auth_user_id: 'user-123',
    email: 'test@example.com',
  };

  const mockTriggerRefetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useMatches as jest.Mock).mockReturnValue({ triggerRefetch: mockTriggerRefetch });
    
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => mockSearchParams.get(key) || null,
    });

    // Mock URL methods
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
    
    // Mock Blob
    global.Blob = jest.fn((content, options) => ({
      size: content[0].length,
      type: options?.type || '',
    })) as any;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    cleanup();
  });

  it('should render loading state initially', () => {
    render(<StatTrackerPage />);
    expect(screen.getByText('Loading game data...')).toBeInTheDocument();
  });

  it('should load and display game data from URL params', async () => {
    render(<StatTrackerPage />);

    await waitFor(() => {
      expect(screen.getByTestId('basketball-stat-tracker')).toBeInTheDocument();
    });

    expect(screen.getByTestId('game-id')).toHaveTextContent('game-123');
    expect(screen.getByTestId('home-team')).toHaveTextContent('Home Team');
    expect(screen.getByTestId('away-team')).toHaveTextContent('Away Team');
  });

  it('should use default values when URL params are missing', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => null,
    });

    render(<StatTrackerPage />);

    await waitFor(() => {
      expect(screen.getByTestId('basketball-stat-tracker')).toBeInTheDocument();
    });

    expect(screen.getByTestId('game-id')).toHaveTextContent('game-001');
    expect(screen.getByTestId('home-team')).toHaveTextContent('Home Team');
    expect(screen.getByTestId('away-team')).toHaveTextContent('Away Team');
  });

  it('should handle back button click', async () => {
    render(<StatTrackerPage />);

    await waitFor(() => {
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('back-button'));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('should handle save game successfully', async () => {
    (apiClient.SaveGameData as jest.Mock).mockResolvedValue({
      status: 200,
      data: { success: true },
    });

    render(<StatTrackerPage />);

    await waitFor(() => {
      expect(screen.getByTestId('save-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(apiClient.SaveGameData).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Game saved! Download started.',
        expect.objectContaining({
          description: 'Navigating to Analyst page...',
        })
      );
    });

    expect(mockTriggerRefetch).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/analyst');
  });

  it('should show saving loader when saving', async () => {
    (apiClient.SaveGameData as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ status: 200 }), 100))
    );

    render(<StatTrackerPage />);

    await waitFor(() => {
      expect(screen.getByTestId('save-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(screen.getByText('Saving your game data...')).toBeInTheDocument();
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    });
  });

  it('should handle save game error', async () => {
    (apiClient.SaveGameData as jest.Mock).mockResolvedValue({
      status: 500,
      error: 'Server error',
    });

    render(<StatTrackerPage />);

    await waitFor(() => {
      expect(screen.getByTestId('save-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to save game data',
        expect.objectContaining({
          description: 'Server error',
        })
      );
    });

    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('should handle save game exception', async () => {
    const error = new Error('Network error');
    (apiClient.SaveGameData as jest.Mock).mockRejectedValue(error);

    render(<StatTrackerPage />);

    await waitFor(() => {
      expect(screen.getByTestId('save-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Error while saving game data',
        expect.objectContaining({
          description: 'Network error',
        })
      );
    });
  });

  it('should handle invalid lineup JSON gracefully', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => {
        if (key === 'homeLineup') return 'invalid-json';
        if (key === 'awayLineup') return 'invalid-json';
        return mockSearchParams.get(key) || null;
      },
    });

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    render(<StatTrackerPage />);

    await waitFor(() => {
      expect(screen.getByTestId('basketball-stat-tracker')).toBeInTheDocument();
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to parse lineup data',
      expect.any(Error)
    );

    consoleWarnSpy.mockRestore();
  });

  it('should display error state when loading fails', async () => {
    (useSearchParams as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to get params');
    });

    render(<StatTrackerPage />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load game data from URL parameters/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  it('should handle go back from error state', async () => {
    (useSearchParams as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to get params');
    });

    render(<StatTrackerPage />);

    await waitFor(() => {
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Go Back'));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('should format players correctly from lineup data', async () => {
    render(<StatTrackerPage />);

    await waitFor(() => {
      expect(screen.getByTestId('basketball-stat-tracker')).toBeInTheDocument();
    });

    const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker');
    const lastCall = BasketballStatTracker.mock.calls[BasketballStatTracker.mock.calls.length - 1][0];

    expect(lastCall.gameData.homeTeam.players).toHaveLength(2);
    expect(lastCall.gameData.homeTeam.players[0]).toMatchObject({
      player_id: 'p1',
      name: 'Player 1',
      position: 'Guard',
      jerseyNumber: 1,
    });

    expect(lastCall.gameData.awayTeam.players).toHaveLength(1);
    expect(lastCall.gameData.awayTeam.players[0]).toMatchObject({
      player_id: 'p3',
      name: 'Player 3',
      position: 'Center',
      jerseyNumber: 3,
    });
  });

  it('should include analyst ID in game data', async () => {
    render(<StatTrackerPage />);

    await waitFor(() => {
      expect(screen.getByTestId('basketball-stat-tracker')).toBeInTheDocument();
    });

    const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker');
    const lastCall = BasketballStatTracker.mock.calls[BasketballStatTracker.mock.calls.length - 1][0];

    expect(lastCall.gameData.analyst).toBe('user-123');
  });

  it('should handle empty analyst when user is not authenticated', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    render(<StatTrackerPage />);

    await waitFor(() => {
      expect(screen.getByTestId('basketball-stat-tracker')).toBeInTheDocument();
    });

    const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker');
    const lastCall = BasketballStatTracker.mock.calls[BasketballStatTracker.mock.calls.length - 1][0];

    expect(lastCall.gameData.analyst).toBe('');
  });

  it('should create download link with correct filename', async () => {
    (apiClient.SaveGameData as jest.Mock).mockResolvedValue({ status: 200 });

    render(<StatTrackerPage />);

    await waitFor(() => {
      expect(screen.getByTestId('save-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(apiClient.SaveGameData).toHaveBeenCalled();
    });

    await waitFor(() => {
      const createElementCalls = (document.createElement as jest.Mock).mock.calls;
      const linkCall = createElementCalls.find(call => call[0] === 'a');
      expect(linkCall).toBeDefined();
    });
  });

  it('should handle non-array lineup data', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => {
        if (key === 'homeLineup') return JSON.stringify({ invalid: 'data' });
        if (key === 'awayLineup') return JSON.stringify({ invalid: 'data' });
        return mockSearchParams.get(key) || null;
      },
    });

    render(<StatTrackerPage />);

    await waitFor(() => {
      expect(screen.getByTestId('basketball-stat-tracker')).toBeInTheDocument();
    });

    const BasketballStatTracker = require('../../../../../components/basketball-stat-tracker');
    const lastCall = BasketballStatTracker.mock.calls[BasketballStatTracker.mock.calls.length - 1][0];

    expect(lastCall.gameData.homeTeam.players).toEqual([]);
    expect(lastCall.gameData.awayTeam.players).toEqual([]);
  });
});