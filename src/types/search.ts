export interface SearchPlayer {
    player_id: string
    first_name: string
    last_name: string
    position: string
    jersey_number: number | null
    avatar_url: string | null
    team_id: string | null
  }
  
  export interface SearchTeam {
    team_id: string
    team_name: string
    icon_url: string | null
  }
  
  export interface SearchResults {
    players: SearchPlayer[]
    teams: SearchTeam[]
  }
  
  export interface SearchModalProps {
    isOpen: boolean
    onClose: () => void
    initialQuery?: string
  }
  