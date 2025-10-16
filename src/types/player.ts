export interface Player {
  teamID: string
  playerID: string
  name: string
  position: string
  isStarting: boolean
  jerseyNumber: number
  profileImage: string
}

export interface CourtPosition {
  id: string
  x: number
  y: number
  label: string
  player?: Player
}

//This is for the team stats
export interface PlayersStats {
  player_id: string;
  team_id: string;
  first_name: string;
  last_name: string;
  position: string;
  jersey_number: number;
  created_at: string;
  turnovers: number;
  fouls: number;
  points: number;
  assists: number;
  rebounds: number;
  blocks: number;
  twoPointsMade: number;
  twoPointsAttempted: number;
  threePointsMade: number;
  threePointsAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  matches_played: number;
  steals: number;
}