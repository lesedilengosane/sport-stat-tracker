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

  getMatchesByCoachId: async (coachId: string) => {
    console.log(`[apiClient] Fetching matches for coachId: ${coachId}`);
    try {
      const response = await fetch(`/api/matches_by_coachID?coachId=${coachId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Failed to fetch matches for coach");
      }
      const data = await response.json();
      return data;
    } catch (err) {
      throw err;
    }
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
  

  // Alternative getPlayersByTeamIds method
// app/utils/apiClient.ts - Update getPlayersByTeamIds method
getPlayersByTeamIds: async (teamIds: string[]): Promise<Map<string, any[]>> => {
  const playersMap = new Map();
  
  console.log("Fetching players for team IDs:", teamIds);
  
  // Initialize with empty arrays for each team
  teamIds.forEach(teamId => {
    playersMap.set(teamId, []);
  });

  try {
    // Try the bulk approach first
    const response = await fetch(`/api/players?teamIds=${teamIds.join(',')}`);
    console.log("API Response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch players: ${response.status}`);
    }
    
    const allPlayers = await response.json();
    console.log("API Response data:", allPlayers);
    
    // Group players by team_id
    if (Array.isArray(allPlayers)) {
      allPlayers.forEach((player: any) => {
        if (player.team_id) {
          if (!playersMap.has(player.team_id)) {
            playersMap.set(player.team_id, []);
          }
          playersMap.get(player.team_id).push(player);
        }
      });
    }
    
  } catch (error) {
    console.error("Bulk fetch failed, trying individual requests:", error);
    
    // Fallback to individual requests
    try {
      for (const teamId of teamIds) {
        const response = await fetch(`/api/players?teamId=${teamId}`);
        if (response.ok) {
          const players = await response.json();
          playersMap.set(teamId, players);
          console.log(`Players for team ${teamId}:`, players);
        }
      }
    } catch (individualError) {
      console.error("Individual requests also failed:", individualError);
    }
  }
  
  console.log("Final players map:", playersMap);
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

  getTeamPlayers: async (coachId: string): Promise<any[]> => {
    const response = await fetch(`/api/coach/fetchTeamPlayers?coachId=${coachId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch team players');
    }
    return response.json();
  },
};