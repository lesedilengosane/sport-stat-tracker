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
  };