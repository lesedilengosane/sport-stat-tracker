// ./types/basketball

export interface Player {
  player_id: string;
  name: string;
  position: string;
  jerseyNumber?: number;
}
  
export interface Team {
  team_id: string;
  name: string;
  color: string;
  score: number;
  timeouts: number;
  fouls: number;
  players: Player[];
}
  
  export interface GameEvent {
    id:string
    match_id: string
    timestamp: string
    team_id: string
    player_id: string
    playerName: string
    action: string
    points: number//changed this from points?. because it was giving a build error
  }
  
  export interface PlayerStats {
    player_id: string
    match_id:string
    points: number
    assists: number
    rebounds: number
    steals: number
    blocks: number
    turnovers: number
    fouls: number
    twoPointsMade: number
    twoPointsAttempted: number
    threePointsMade: number
    threePointsAttempted: number
    freeThrowsMade: number
    freeThrowsAttempted: number
  }
  
  export interface GameData {
    match_id: string;
    date: string;
    homeTeam: Team;
    awayTeam: Team;
    status: "live" | "completed" | "scheduled";
    location?: string;
  }
  