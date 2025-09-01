export interface Player {
    id: string
    name: string
    position: string
    jerseyNumber: number
  }
  
  export interface Team {
    id: string
    name: string
    color: string
    players: Player[]
    score: number
    timeouts: number
    fouls: number
  }
  
  export interface GameEvent {
    id: string
    timestamp: string
    teamId: string
    playerId: string
    playerName: string
    action: string
    points?: number
  }
  
  export interface PlayerStats {
    playerId: string
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
    id: string
    date: string
    homeTeam: Team
    awayTeam: Team
    status: "scheduled" | "live" | "completed"
    location?: string
  }
  