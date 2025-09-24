// src/lib/lineupClient.ts
export interface PlayerLineup {
  default_lineup_id: number
  team_id: string
  player_id: string
  position: string | null
  is_starting: boolean | null
  jersey_number: number | null
  player_name : string
}

export interface LineupResponse {
  message: string
  lineup: PlayerLineup[]
  error?: string
}

export async function getDefaultLineup(authUserId: string): Promise<LineupResponse> {
  try {
    const response = await fetch('/api/lineups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ auth_user_id: authUserId }),
    })

    const data: LineupResponse = await response.json()
    return data
  } catch (err: any) {
    return { message: '', lineup: [], error: err.message || 'Failed to fetch lineup' }
  }
}