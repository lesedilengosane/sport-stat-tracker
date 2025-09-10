// app/utils/apiClient.ts
// Client-side API calls
export const apiClient = {
  // Matches API
  getMatches: async () => {
    const response = await fetch('/api/matches');
    if (!response.ok) {
      throw new Error('Failed to fetch matches');
    }
    return response.json();
  },

  createMatch: async (matchData: any) => {
    const response = await fetch('/api/matches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(matchData),
    });
    if (!response.ok) {
      throw new Error('Failed to create match');
    }
    return response.json();
  },

  // Teams API
  getTeams: async () => {
    const response = await fetch('/api/teams');
    if (!response.ok) {
      throw new Error('Failed to fetch teams');
    }
    return response.json();
  },

  createTeam: async (teamData: any) => {
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    });
    if (!response.ok) {
      throw new Error('Failed to create team');
    }
    return response.json();
  },

  // Get teams by IDs
  getTeamsByIds: async (teamIds: string[]) => {
    const response = await fetch(`/api/teams?ids=${teamIds.join(',')}`);
    if (!response.ok) {
      throw new Error('Failed to fetch teams by IDs');
    }
    return response.json();
  },

  //Team Logo Fetcher
  getTeamLogo: async (teamId: string): Promise<string> => {
    const response = await fetch(`/api/teams/team-logos?teamId=${teamId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch team logo');
    }
    const data = await response.json();
    return data.logoUrl; // expect your API to return { logoUrl: "https://..." }
  },

  // Player methods
  getPlayersByTeamId: async (teamId: string): Promise<any[]> => {
    const response = await fetch(`/api/players?teamId=${teamId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch players');
    }
    return response.json();
  },
  

  getPlayersByTeamIds: async (teamIds: string[]): Promise<Map<string, any[]>> => {
    const playersMap = new Map();
    
    // Fetch players for each team
    for (const teamId of teamIds) {
      try {
        const players = await apiClient.getPlayersByTeamId(teamId);
        playersMap.set(teamId, players);
      } catch (error) {
        console.error(`Failed to fetch players for team ${teamId}:`, error);
        playersMap.set(teamId, []);
      }
    }
    
    return playersMap;
  },

  createPlayer: async (playerData: any): Promise<any> => {
    const response = await fetch('/api/players', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(playerData),
    });
    if (!response.ok) {
      throw new Error('Failed to create player');
    }
    return response.json();
  },
};