import { render, screen, waitFor } from '@testing-library/react';
import MatchPage from '../page';
import MatchDetails from '../MatchDetails';

// Mock the MatchDetails component
jest.mock('../MatchDetails', () => {
  return jest.fn(() => <div data-testid="match-details">Match Details Component</div>);
});

// Mock fetch globally
global.fetch = jest.fn();

describe('MatchPage Component', () => {
  const mockMatchId = 'match-123';
  const mockParams = Promise.resolve({ matchid: mockMatchId });

  const mockMatchData = {
    Teams: [
      {
        team_id: 'team-1',
        team_name: 'Home Team',
      },
      {
        team_id: 'team-2',
        team_name: 'Away Team',
      },
    ],
    lineups: {
      homeLineup: [
        {
          player_id: 'player-1',
          position: 'Guard',
          player: {
            first_name: 'John',
            last_name: 'Doe',
            avatar_url: '/avatars/john.jpg',
          },
        },
        {
          player_id: 'player-2',
          position: 'Forward',
          player: {
            first_name: 'Jane',
            last_name: 'Smith',
            avatar_url: '/avatars/jane.jpg',
          },
        },
      ],
      awayLineup: [
        {
          player_id: 'player-3',
          position: 'Center',
          player: {
            first_name: 'Bob',
            last_name: 'Johnson',
            avatar_url: '/avatars/bob.jpg',
          },
        },
      ],
    },
    homePrevMatches: [{ id: 1, score: '90-85' }],
    awayPrevMatches: [{ id: 2, score: '78-82' }],
    MatchEvents: [{ id: 1, type: 'goal', time: '10:30' }],
    matchMetaData: {
      match_id: mockMatchId,
      date: '2025-10-19',
      venue: 'Test Arena',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.VERCEL_URL;
  });

  it('should render MatchDetails component with correct data', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMatchData,
    });

    render(await MatchPage({ params: mockParams }));

    await waitFor(() => {
      expect(screen.getByTestId('match-details')).toBeInTheDocument();
    });

    expect(MatchDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        matchId: mockMatchId,
        homePlayers: expect.arrayContaining([
          expect.objectContaining({
            id: 'player-1',
            name: 'John',
            surname: 'Doe',
            position: 'Guard',
            avatarUrl: '/avatars/john.jpg',
          }),
        ]),
        awayPlayers: expect.arrayContaining([
          expect.objectContaining({
            id: 'player-3',
            name: 'Bob',
            surname: 'Johnson',
            position: 'Center',
            avatarUrl: '/avatars/bob.jpg',
          }),
        ]),
        homeTeam: mockMatchData.Teams[0],
        awayTeam: mockMatchData.Teams[1],
        homePrevMatches: mockMatchData.homePrevMatches,
        awayPrevMatches: mockMatchData.awayPrevMatches,
        MatchEvents: mockMatchData.MatchEvents,
        metadata: mockMatchData.matchMetaData,
      }),
      undefined
    );
  });

  it('should fetch data from the correct API endpoint with default URL', async () => {
    // When no env vars are set, it should default to localhost:3000
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMatchData,
    });

    const result = await MatchPage({ params: mockParams });
    render(result);

    // Should use default localhost when no env vars set
    expect(global.fetch).toHaveBeenCalledWith(
      `http://localhost:3000/api/coach/${mockMatchId}`,
      { cache: 'no-store' }
    );
  });

  it('should use VERCEL_URL when NEXT_PUBLIC_API_URL is not set', async () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    process.env.VERCEL_URL = 'myapp.vercel.app';

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMatchData,
    });

    render(await MatchPage({ params: mockParams }));

    expect(global.fetch).toHaveBeenCalledWith(
      `https://myapp.vercel.app/api/coach/${mockMatchId}`,
      { cache: 'no-store' }
    );

    delete process.env.VERCEL_URL;
  });

  it('should display error message when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await MatchPage({ params: mockParams });
    const { container } = render(result);

    expect(container.textContent).toContain('Error loading match data');
    expect(container.textContent).toContain('Failed to fetch match data');
  });

  it('should handle network errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const result = await MatchPage({ params: mockParams });
    const { container } = render(result);

    expect(container.textContent).toContain('Error loading match data');
    expect(container.textContent).toContain('Network error');
  });

  it('should handle unknown errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce('String error');

    const result = await MatchPage({ params: mockParams });
    const { container } = render(result);

    expect(container.textContent).toContain('Error loading match data');
    expect(container.textContent).toContain('Unknown error');
  });

  it('should handle missing player data gracefully', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
    
    const dataWithMissingPlayer = {
      ...mockMatchData,
      lineups: {
        homeLineup: [
          {
            player_id: 'player-incomplete',
            position: 'Guard',
          },
        ],
        awayLineup: [],
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => dataWithMissingPlayer,
    });

    render(await MatchPage({ params: mockParams }));

    await waitFor(() => {
      expect(MatchDetails).toHaveBeenCalledWith(
        expect.objectContaining({
          homePlayers: expect.arrayContaining([
            expect.objectContaining({
              id: 'player-incomplete',
              name: 'Player',
              surname: 'Unknown',
              position: 'Guard',
              avatarUrl: '/avatars/player3.jpg',
            }),
          ]),
        }),
        undefined
      );
    });
  });

  it('should handle empty lineups', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
    
    const dataWithEmptyLineups = {
      ...mockMatchData,
      lineups: {
        homeLineup: [],
        awayLineup: [],
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => dataWithEmptyLineups,
    });

    render(await MatchPage({ params: mockParams }));

    await waitFor(() => {
      expect(MatchDetails).toHaveBeenCalledWith(
        expect.objectContaining({
          homePlayers: [],
          awayPlayers: [],
        }),
        undefined
      );
    });
  });

  it('should map lineup players with indices when player_id is missing', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
    
    const dataWithMissingPlayerId = {
      ...mockMatchData,
      lineups: {
        homeLineup: [
          {
            position: 'Guard',
            player: {
              first_name: 'Test',
              last_name: 'Player',
            },
          },
        ],
        awayLineup: [],
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => dataWithMissingPlayerId,
    });

    render(await MatchPage({ params: mockParams }));

    await waitFor(() => {
      expect(MatchDetails).toHaveBeenCalledWith(
        expect.objectContaining({
          homePlayers: expect.arrayContaining([
            expect.objectContaining({
              id: 'home-player-0',
              name: 'Test',
              surname: 'Player',
            }),
          ]),
        }),
        undefined
      );
    });
  });

  it('should correctly identify home and away teams', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMatchData,
    });

    render(await MatchPage({ params: mockParams }));

    await waitFor(() => {
      expect(MatchDetails).toHaveBeenCalledWith(
        expect.objectContaining({
          homeTeam: expect.objectContaining({
            team_id: 'team-1',
            team_name: 'Home Team',
          }),
          awayTeam: expect.objectContaining({
            team_id: 'team-2',
            team_name: 'Away Team',
          }),
        }),
        undefined
      );
    });
  });

  it('should use no-store cache policy', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMatchData,
    });

    render(await MatchPage({ params: mockParams }));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        cache: 'no-store',
      })
    );
  });
});