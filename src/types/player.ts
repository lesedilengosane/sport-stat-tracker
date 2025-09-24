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
