// ./types/basketball

export interface Player {
  player_id: string;
  name: string;
  position: string;
  jerseyNumber?: number;
}
  
export interface Team {
  logo: string | Blob | undefined;
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
  

export interface GameCardProps {
  match_id: string;
  analyst?:string;
  date: string;
  time: string;
  homeTeam: Team;
  awayTeam: Team;
  location: string;
  isBooked?: boolean;
  homeLineup?: Player[];
  awayLineup?: Player[];
}

export interface CompletedGameCardProps {
  match_id: string;
  analyst?:string;
  date: string;
  time: string;
  completed:boolean;
  home_score:number;
  away_score:number;
  homeTeam: Team;
  awayTeam: Team;
  location: string;
  isBooked?: boolean;
  homeLineup?: Player[];
  awayLineup?: Player[];
}



export interface Game {
  home_score?:number
  away_score?:number
  isBooked: boolean
  match_id: string
  analyst?: string
  completed: boolean     
  date: string
  time: string
  location: string
  homeTeam: { team_id: string; name: string; logo: string }
  awayTeam: { team_id: string; name: string; logo: string }
  homeLineup?: Player[]
  awayLineup?: Player[]
  isSampleData?: boolean
}


export interface Match {
  match_id: string
  analyst?:string
  match_date: string
  location: string | null
  home_score: number
  away_score: number
  completed:boolean
  isBooked:boolean
  home_team_id: string
  away_team_id: string
}
