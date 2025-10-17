// Team-related types
export interface TeamPlayer {
    player_id: string
    first_name: string
    last_name: string
    position: string
    jersey_number: number
  }
  
  export interface Team {
    team_id: string
    team_name: string
    coach_id: string
    players: TeamPlayer[]
  }
  
  export interface TeamInfo {
    team_id?: string
    name: string
    coach: string
    icon_url?: string | null
  }
  
  export interface TeamMatch {
    match_id: string
    home_team: { team_name: string; team_id: string }
    away_team: { team_name: string; team_id: string }
    home_score: number | null
    away_score: number | null
    match_date: string
    completed: boolean
  }
  
  export interface TeamDetailsProps {
    teamId: string
  }
  
  export type SortOption = "name-asc" | "name-desc" | "players-asc" | "players-desc" | "coach-asc" | "coach-desc"
  