// app/analyst/[matchid]/__tests__/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import MatchPage from '../page';

// Mock the MatchDetails component
jest.mock('../MatchDetails', () => ({
  __esModule: true,
  default: jest.fn(({ matchId, homePlayers, awayPlayers, homeTeam, awayTeam }) => (
    <div data-testid="match-details">
      <div data-testid="match-id">{matchId}</div>
      <div data-testid="home-team">{homeTeam?.team_name}</div>
      <div data-testid="away-team">{awayTeam?.team_name}</div>
      <div data-testid="home-players-count">{homePlayers?.length}</div>
      <div data-testid="away-players-count">{awayPlayers?.length}</div>
    </div>
  )),
}));

// Mock fetch
global.fetch = jest.fn();

describe('MatchPage', () => {
  const mockMatchData = {
    Teams: [
      {
        team_id: 'team-1',
        team_name: 'Home United',
        coach_id: 'coach-1',
        icon_url: '/logos/home.png',
      },
      {
        team_id: 'team-2',
        team_name: 'Away FC',
        coach_id: 'coach-2',
        icon_url: '/logos/away.png',
      },
    ],
    lineups: [
      {
        player_id: 'player-1',
        team_id: 'team-1',
        position: 'Forward',
        player: {
          first_name: 'John',
          last_name: 'Doe',
          avatar_url: '/avatars/john.jpg',
        },
      },
      {
        player_id: 'player-2',
        team_id: 'team-1',
        position: 'Midfielder',
        player: {
          first_name: 'Jane',
          last_name: 'Smith',
          avatar_url: '/avatars/jane.jpg',
        },
      },
      {
        player_id: 'player-3',
        team_id: 'team-2',
        position: 'Defender',
        player: {
          first_name: 'Bob',
          last_name: 'Johnson',
          avatar_url: '/avatars/bob.jpg',
        },
      },
    ],
    homePrevMatches: [
      {
        match_id: 'match-1',
        match_date: '2024-03-15',
        location: 'Stadium A',
        home_score: 2,
        away_score: 1,
        status: 'completed',
        home_team_id: 'team-1',
        away_team_id: 'team-3',
      },
    ],
    awayPrevMatches: [
      {
        match_id: 'match-2',
        match_date: '2024-03-14',
        location: 'Stadium B',
        home_score: 1,
        away_score: 3,
        status: 'completed',
        home_team_id: 'team-4',
        away_team_id: 'team-2',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockMatchData,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Successful Data Fetching', () => {
    it('should render MatchDetails component with correct data', async () => {
      const params = Promise.resolve({ matchid: 'match-123' });
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(screen.getByTestId('match-details')).toBeInTheDocument();
      });

      expect(screen.getByTestId('match-id')).toHaveTextContent('match-123');
      expect(screen.getByTestId('home-team')).toHaveTextContent('Home United');
      expect(screen.getByTestId('away-team')).toHaveTextContent('Away FC');
    });

    it('should fetch data from correct API endpoint', async () => {
      const params = Promise.resolve({ matchid: 'match-456' });
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/analyst/match-456'
        );
      });
    });

    it('should correctly split home and away lineups', async () => {
      const params = Promise.resolve({ matchid: 'match-123' });
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(screen.getByTestId('home-players-count')).toHaveTextContent('2');
        expect(screen.getByTestId('away-players-count')).toHaveTextContent('1');
      });
    });

    it('should map player data correctly', async () => {
      const params = Promise.resolve({ matchid: 'match-123' });
      const MatchDetails = require('../MatchDetails').default;
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(MatchDetails).toHaveBeenCalled();
      });

      const callArgs = MatchDetails.mock.calls[0][0];
      
      expect(callArgs.homePlayers).toEqual([
        {
          id: 'player-1',
          name: 'John',
          surname: 'Doe',
          position: 'Forward',
          avatarUrl: '/avatars/john.jpg',
        },
        {
          id: 'player-2',
          name: 'Jane',
          surname: 'Smith',
          position: 'Midfielder',
          avatarUrl: '/avatars/jane.jpg',
        },
      ]);

      expect(callArgs.awayPlayers).toEqual([
        {
          id: 'player-3',
          name: 'Bob',
          surname: 'Johnson',
          position: 'Defender',
          avatarUrl: '/avatars/bob.jpg',
        },
      ]);
    });

    it('should pass correct team objects to MatchDetails', async () => {
      const params = Promise.resolve({ matchid: 'match-123' });
      const MatchDetails = require('../MatchDetails').default;
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(MatchDetails).toHaveBeenCalled();
      });

      const callArgs = MatchDetails.mock.calls[0][0];
      
      expect(callArgs.homeTeam).toEqual(mockMatchData.Teams[0]);
      expect(callArgs.awayTeam).toEqual(mockMatchData.Teams[1]);
    });

    it('should pass previous matches to MatchDetails', async () => {
      const params = Promise.resolve({ matchid: 'match-123' });
      const MatchDetails = require('../MatchDetails').default;
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(MatchDetails).toHaveBeenCalled();
      });

      const callArgs = MatchDetails.mock.calls[0][0];
      
      expect(callArgs.homePrevMatches).toEqual(mockMatchData.homePrevMatches);
      expect(callArgs.awayPrevMatches).toEqual(mockMatchData.awayPrevMatches);
    });
  });

  describe('Data Mapping Edge Cases', () => {
    it('should handle missing player data with fallbacks', async () => {
      const incompleteData = {
        ...mockMatchData,
        lineups: [
          {
            player_id: null,
            team_id: 'team-1',
            position: null,
            player: {
              first_name: null,
              last_name: null,
              avatar_url: null,
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => incompleteData,
      });

      const params = Promise.resolve({ matchid: 'match-123' });
      const MatchDetails = require('../MatchDetails').default;
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(MatchDetails).toHaveBeenCalled();
      });

      const callArgs = MatchDetails.mock.calls[0][0];
      
      expect(callArgs.homePlayers[0]).toEqual({
        id: 'home-player-0',
        name: 'Player',
        surname: 'Unknown',
        position: 'Unknown',
        avatarUrl: '/avatars/player3.jpg',
      });
    });

    it('should handle empty lineups', async () => {
      const emptyLineupData = {
        ...mockMatchData,
        lineups: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => emptyLineupData,
      });

      const params = Promise.resolve({ matchid: 'match-123' });
      const MatchDetails = require('../MatchDetails').default;
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(MatchDetails).toHaveBeenCalled();
      });

      const callArgs = MatchDetails.mock.calls[0][0];
      
      expect(callArgs.homePlayers).toEqual([]);
      expect(callArgs.awayPlayers).toEqual([]);
    });

    it('should handle only one team in Teams array', async () => {
      const oneTeamData = {
        ...mockMatchData,
        Teams: [mockMatchData.Teams[0]],
        lineups: [mockMatchData.lineups[0], mockMatchData.lineups[1]],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => oneTeamData,
      });

      const params = Promise.resolve({ matchid: 'match-123' });
      const MatchDetails = require('../MatchDetails').default;
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(MatchDetails).toHaveBeenCalled();
      });

      const callArgs = MatchDetails.mock.calls[0][0];
      
      expect(callArgs.homeTeam).toBeDefined();
      expect(callArgs.awayTeam).toBeUndefined();
    });

    it('should handle players without player object', async () => {
      const noPlayerObjectData = {
        ...mockMatchData,
        lineups: [
          {
            player_id: 'player-1',
            team_id: 'team-1',
            position: 'Forward',
            player: null,
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => noPlayerObjectData,
      });

      const params = Promise.resolve({ matchid: 'match-123' });
      const MatchDetails = require('../MatchDetails').default;
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(MatchDetails).toHaveBeenCalled();
      });

      const callArgs = MatchDetails.mock.calls[0][0];
      
      expect(callArgs.homePlayers[0]).toEqual({
        id: 'player-1',
        name: 'Player',
        surname: 'Unknown',
        position: 'Forward',
        avatarUrl: '/avatars/player3.jpg',
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const params = Promise.resolve({ matchid: 'match-123' });
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(screen.getByText('Error loading match data')).toBeInTheDocument();
      });
    });

    it('should display error message when fetch throws', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const params = Promise.resolve({ matchid: 'match-123' });
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(screen.getByText('Error loading match data')).toBeInTheDocument();
      });
    });

    it('should display error message when JSON parsing fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const params = Promise.resolve({ matchid: 'match-123' });
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(screen.getByText('Error loading match data')).toBeInTheDocument();
      });
    });

    it('should handle missing Teams array gracefully', async () => {
      const noTeamsData = {
        ...mockMatchData,
        Teams: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => noTeamsData,
      });

      const params = Promise.resolve({ matchid: 'match-123' });
      
      // Should not throw error
      const result = await MatchPage({ params });
      expect(result).toBeDefined();
    });
  });

  describe('Match ID Handling', () => {
    it('should handle numeric match IDs', async () => {
      const params = Promise.resolve({ matchid: '12345' });
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/analyst/12345'
        );
      });
    });

    it('should handle alphanumeric match IDs', async () => {
      const params = Promise.resolve({ matchid: 'abc-123-xyz' });
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/analyst/abc-123-xyz'
        );
      });
    });

    it('should handle special characters in match ID', async () => {
      const params = Promise.resolve({ matchid: 'match_2024-01-01' });
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/analyst/match_2024-01-01'
        );
      });
    });
  });

  describe('Integration', () => {
    it('should pass matchId through to MatchDetails', async () => {
      const params = Promise.resolve({ matchid: 'integration-test-123' });
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(screen.getByTestId('match-id')).toHaveTextContent(
          'integration-test-123'
        );
      });
    });

    it('should handle complete workflow with valid data', async () => {
      const params = Promise.resolve({ matchid: 'workflow-test' });
      const MatchDetails = require('../MatchDetails').default;
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(MatchDetails).toHaveBeenCalledTimes(1);
      });

      const callArgs = MatchDetails.mock.calls[0][0];
      
      expect(callArgs).toMatchObject({
        matchId: 'workflow-test',
        homePlayers: expect.any(Array),
        awayPlayers: expect.any(Array),
        homeTeam: expect.any(Object),
        awayTeam: expect.any(Object),
        homePrevMatches: expect.any(Array),
        awayPrevMatches: expect.any(Array),
      });
    });
  });

  describe('Console Logging', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should log match ID extraction', async () => {
      const params = Promise.resolve({ matchid: 'log-test-123' });
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('This is after extracting matchid---matchID : log-test-123')
        );
      });
    });

    it('should log before fetching data', async () => {
      const params = Promise.resolve({ matchid: 'log-test-456' });
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('This is before fetching data---matchID : log-test-456')
        );
      });
    });

    it('should log successful data fetch', async () => {
      const params = Promise.resolve({ matchid: 'log-test-789' });
      
      render(await MatchPage({ params }));

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('This is if the data was fetched successfully : log-test-789')
        );
      });
    });
  });
});