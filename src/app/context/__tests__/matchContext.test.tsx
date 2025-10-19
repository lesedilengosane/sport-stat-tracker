import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MatchesProvider, useMatches } from '../MatchesContext';
import { apiClient } from '../../utils/apiClient';
import { Game } from '../../../types/basketball';

// Mock the apiClient
jest.mock('../../utils/apiClient', () => ({
  apiClient: {
    getMatches: jest.fn(),
    getTeamsByIds: jest.fn(),
  },
}));

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('MatchesContext', () => {
  const mockMatchesData = [
    {
      match_id: 1,
      analyst: 'John Doe',
      completed: false,
      booked: true,
      away_score: 0,
      home_score: 0,
      location: 'Arena A',
      match_date: '2024-03-15T18:00:00Z',
      home_team_id: 101,
      away_team_id: 102,
    },
    {
      match_id: 2,
      analyst: 'Jane Smith',
      completed: true,
      booked: true,
      away_score: 95,
      home_score: 88,
      location: 'Arena B',
      match_date: '2024-03-16T19:30:00Z',
      home_team_id: 103,
      away_team_id: 104,
    },
  ];

  const mockTeamsData = [
    {
      team_id: 101,
      name: 'Lakers',
      team_name: 'Los Angeles Lakers',
      icon_url: '/lakers.png',
    },
    {
      team_id: 102,
      name: 'Warriors',
      team_name: 'Golden State Warriors',
      icon_url: '/warriors.png',
    },
    {
      team_id: 103,
      name: 'Bulls',
      team_name: 'Chicago Bulls',
      icon_url: '/bulls.png',
    },
    {
      team_id: 104,
      name: 'Celtics',
      team_name: 'Boston Celtics',
      icon_url: '/celtics.png',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
    (apiClient.getMatches as jest.Mock).mockResolvedValue(mockMatchesData);
    (apiClient.getTeamsByIds as jest.Mock).mockResolvedValue(mockTeamsData);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MatchesProvider>{children}</MatchesProvider>
  );

  describe('useMatches hook', () => {
    it('should throw error when used outside MatchesProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(() => {
        renderHook(() => useMatches());
      }).toThrow('useMatches must be used within MatchesProvider');
      
      consoleSpy.mockRestore();
    });

    it('should provide context when used within MatchesProvider', async () => {
      const { result } = renderHook(() => useMatches(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current).toBeDefined();
      expect(result.current.allGames).toBeDefined();
      expect(result.current.matches).toBeDefined();
      expect(result.current.fetchMatches).toBeDefined();
      expect(result.current.triggerRefetch).toBeDefined();
    });
  });

  describe('fetchMatches', () => {
    it('should fetch matches and teams successfully', async () => {
      const { result } = renderHook(() => useMatches(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(apiClient.getMatches).toHaveBeenCalledTimes(1);
      // Team IDs may be in different order due to Set
      expect(apiClient.getTeamsByIds).toHaveBeenCalledWith(
        expect.arrayContaining([101, 102, 103, 104])
      );
      expect(result.current.allGames).toHaveLength(2);
      expect(result.current.matches).toHaveLength(2);
      expect(result.current.error).toBeNull();
    });

    it('should transform match data correctly', async () => {
      const { result } = renderHook(() => useMatches(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const firstGame = result.current.allGames[0];
      expect(firstGame.match_id).toBe(1);
      expect(firstGame.analyst).toBe('John Doe');
      // The context uses the 'name' field first, then falls back to 'team_name'
      expect(firstGame.homeTeam.name).toBe('Lakers');
      expect(firstGame.awayTeam.name).toBe('Warriors');
      expect(firstGame.location).toBe('Arena A');
      expect(firstGame.date).toMatch(/March 15, 2024/);
    });

    it('should handle missing team data gracefully', async () => {
      (apiClient.getTeamsByIds as jest.Mock).mockResolvedValue([
        mockTeamsData[0], // Only first team
      ]);

      const { result } = renderHook(() => useMatches(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const firstGame = result.current.allGames[0];
      expect(firstGame.homeTeam.name).toBe('Lakers');
      expect(firstGame.awayTeam.name).toBe('Unknown Team');
      expect(firstGame.awayTeam.logo).toBe('/default_team.svg');
    });

    it('should handle empty matches data', async () => {
      (apiClient.getMatches as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useMatches(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.allGames).toHaveLength(0);
      expect(result.current.matches).toHaveLength(0);
      expect(apiClient.getTeamsByIds).not.toHaveBeenCalled();
    });

    it('should handle null matches data', async () => {
      (apiClient.getMatches as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useMatches(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.allGames).toHaveLength(0);
      expect(result.current.matches).toHaveLength(0);
    });

    it('should handle API errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (apiClient.getMatches as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useMatches(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load matches from database.');
      expect(result.current.allGames).toHaveLength(0);
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('caching functionality', () => {
    it('should cache matches in sessionStorage', async () => {
      const { result } = renderHook(() => useMatches(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const cachedData = mockSessionStorage.getItem('matches');
      expect(cachedData).toBeTruthy();
      
      const parsedCache = JSON.parse(cachedData!);
      expect(parsedCache).toHaveLength(2);
      expect(parsedCache[0].match_id).toBe(1);
    });

    it('should use cached data on subsequent manual fetches', async () => {
      const { result } = renderHook(() => useMatches(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify data is cached
      const cachedData = mockSessionStorage.getItem('matches');
      expect(cachedData).toBeTruthy();

      const callCountAfterFirst = (apiClient.getMatches as jest.Mock).mock.calls.length;

      // Call fetchMatches again without forceRefresh - should use cache
      await act(async () => {
        await result.current.fetchMatches(false);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should not make additional API call
      const finalCallCount = (apiClient.getMatches as jest.Mock).mock.calls.length;
      expect(finalCallCount).toBe(callCountAfterFirst);
      expect(result.current.allGames).toHaveLength(2);
    });

    it('should bypass cache when forceRefresh is true', async () => {
      const { result } = renderHook(() => useMatches(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCallCount = (apiClient.getMatches as jest.Mock).mock.calls.length;

      // Force refresh
      await act(async () => {
        await result.current.fetchMatches(true);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const finalCallCount = (apiClient.getMatches as jest.Mock).mock.calls.length;
      expect(finalCallCount).toBe(initialCallCount + 1);
    });
  });

  describe('triggerRefetch', () => {
    it('should refetch data when triggerRefetch is called', async () => {
      const { result } = renderHook(() => useMatches(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCallCount = (apiClient.getMatches as jest.Mock).mock.calls.length;

      // Trigger refetch
      act(() => {
        result.current.triggerRefetch();
      });

      await waitFor(() => {
        const finalCallCount = (apiClient.getMatches as jest.Mock).mock.calls.length;
        expect(finalCallCount).toBe(initialCallCount + 1);
      });
    });

    it('should update data after refetch', async () => {
      const { result } = renderHook(() => useMatches(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const originalGames = result.current.allGames;

      // Update mock data
      const newMatchData = [
        {
          ...mockMatchesData[0],
          match_id: 3,
          location: 'New Arena',
        },
      ];
      (apiClient.getMatches as jest.Mock).mockResolvedValue(newMatchData);

      // Trigger refetch
      act(() => {
        result.current.triggerRefetch();
      });

      await waitFor(() => {
        expect(result.current.allGames).not.toEqual(originalGames);
      });

      expect(result.current.allGames).toHaveLength(1);
      expect(result.current.allGames[0].match_id).toBe(3);
      expect(result.current.allGames[0].location).toBe('New Arena');
    });
  });

  describe('loading and error states', () => {
    it('should set isLoading to true during fetch', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      (apiClient.getMatches as jest.Mock).mockReturnValue(promise);

      const { result } = renderHook(() => useMatches(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        resolvePromise!(mockMatchesData);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should clear error on successful fetch after error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // First fetch fails
      (apiClient.getMatches as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useMatches(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load matches from database.');
      });

      // Second fetch succeeds
      (apiClient.getMatches as jest.Mock).mockResolvedValue(mockMatchesData);

      await act(async () => {
        await result.current.fetchMatches(true);
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });

      expect(result.current.allGames).toHaveLength(2);
      
      consoleErrorSpy.mockRestore();
    });
  });
});