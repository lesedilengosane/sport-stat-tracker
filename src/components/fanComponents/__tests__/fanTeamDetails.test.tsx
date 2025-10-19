import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import TeamDetails from '../TeamDetails'
import type { PlayersStats } from '@/types/player'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function Link({ children, href }: any) {
    return <a href={href}>{children}</a>
  }
})

describe('TeamDetails', () => {
  const mockPlayers: PlayersStats[] = [
    {
      player_id: 'p1',
      team_id: 'team1',
      first_name: 'LeBron',
      last_name: 'James',
      position: 'Forward',
      jersey_number: 23,
      points: 100,
      assists: 50,
      rebounds: 40,
      blocks: 10,
      steals: 15,
      created_at: '2024-01-01',
      turnovers: 5,
      fouls: 8,
      twoPointsMade: 30,
      twoPointsAttempted: 50,
      threePointsMade: 10,
      threePointsAttempted: 25,
      freeThrowsMade: 20,
      freeThrowsAttempted: 25,
      matches_played: 10,
    },
    {
      player_id: 'p2',
      team_id: 'team1',
      first_name: 'Anthony',
      last_name: 'Davis',
      position: 'Center',
      jersey_number: 3,
      points: 80,
      assists: 30,
      rebounds: 60,
      blocks: 20,
      steals: 10,
      created_at: '2024-01-01',
      turnovers: 4,
      fouls: 6,
      twoPointsMade: 25,
      twoPointsAttempted: 40,
      threePointsMade: 5,
      threePointsAttempted: 15,
      freeThrowsMade: 15,
      freeThrowsAttempted: 20,
      matches_played: 10,
    },
  ]

  const mockApiData = {
    coaches: [
      {
        team_id: 'team1',
        users: {
          first_name: 'Frank',
          last_name: 'Vogel',
        },
      },
    ],
    teams: [
      {
        team_id: 'team1',
        team_name: 'Lakers',
        icon_url: 'https://example.com/lakers.png',
      },
    ],
    matches: [
      {
        match_id: 'm1',
        home_team: { team_name: 'Lakers', team_id: 'team1' },
        away_team: { team_name: 'Warriors', team_id: 'team2' },
        home_score: 110,
        away_score: 105,
        match_date: '2024-01-15',
        completed: true,
      },
      {
        match_id: 'm2',
        home_team: { team_name: 'Celtics', team_id: 'team3' },
        away_team: { team_name: 'Lakers', team_id: 'team1' },
        home_score: 115,
        away_score: 100,
        match_date: '2024-01-20',
        completed: true,
      },
    ],
  }

  beforeEach(() => {
    global.fetch = jest.fn()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Initial Loading', () => {
    it('displays loading state while fetching data', () => {
      ;(global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      render(<TeamDetails teamId="team1" />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('fetches players and team data on mount', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlayers,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockApiData,
        })

      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/pl')
        expect(global.fetch).toHaveBeenCalledWith('/api/all')
        expect(global.fetch).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Successful Data Loading', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlayers,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockApiData,
        })
    })

    it('renders team name and coach', async () => {
      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        expect(screen.getByText('Lakers')).toBeInTheDocument()
        expect(screen.getByText('Coach: Frank Vogel')).toBeInTheDocument()
      })
    })

    it('renders team icon when available', async () => {
      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        const img = screen.getByAltText('Lakers')
        expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute('src', 'https://example.com/lakers.png')
      })
    })

    it('displays correct team statistics', async () => {
      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        // Check stats bar at top
        expect(screen.getByText('Games Played')).toBeInTheDocument()
        expect(screen.getByText('Record')).toBeInTheDocument()
        const pointsElements = screen.getAllByText('180')
        expect(pointsElements.length).toBeGreaterThan(0)
        const assistsElements = screen.getAllByText('80')
        expect(assistsElements.length).toBeGreaterThan(0)
        const reboundsElements = screen.getAllByText('100')
        expect(reboundsElements.length).toBeGreaterThan(0)
        expect(screen.getByText('55')).toBeInTheDocument() // Blocks + Steals
      })
    })

    it('displays correct wins and losses', async () => {
      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        expect(screen.getByText('1-1')).toBeInTheDocument() // 1 win, 1 loss
      })
    })

    it('displays games played count', async () => {
      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument() // 2 matches
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message when players fetch fails', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Failed to fetch players')
      )

      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch players')).toBeInTheDocument()
      })
    })

    it('displays error message when team data fetch fails', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlayers,
        })
        .mockRejectedValueOnce(new Error('Failed to fetch team data'))

      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch team data')).toBeInTheDocument()
      })
    })

    it('displays error when API returns non-ok response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      })

      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch players')).toBeInTheDocument()
      })
    })
  })

  describe('Tab Navigation', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlayers,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockApiData,
        })
    })

    it('displays roster tab by default', async () => {
      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        expect(screen.getByText('Team Roster')).toBeInTheDocument()
      })
    })

    it('switches to schedule tab when clicked', async () => {
      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        expect(screen.getByText('Team Roster')).toBeInTheDocument()
      })

      const scheduleTab = screen.getByText('Schedule')
      fireEvent.click(scheduleTab)

      await waitFor(() => {
        expect(screen.getByText('Match Schedule')).toBeInTheDocument()
      })
    })

    it('switches to stats tab when clicked', async () => {
      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        expect(screen.getByText('Team Roster')).toBeInTheDocument()
      })

      const statsTab = screen.getByText('Stats')
      fireEvent.click(statsTab)

      await waitFor(() => {
        expect(screen.getByText('Team Statistics')).toBeInTheDocument()
      })
    })

    it('applies active styling to current tab', async () => {
      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        const rosterTab = screen.getByText('Roster')
        expect(rosterTab).toHaveClass('border-orange-400')
        expect(rosterTab).toHaveClass('text-orange-400')
      })
    })
  })

  describe('Roster Tab', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlayers,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockApiData,
        })
    })

    it('displays all players in roster', async () => {
      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        expect(screen.getByText('LeBron James')).toBeInTheDocument()
        expect(screen.getByText('Anthony Davis')).toBeInTheDocument()
      })
    })

    it('displays player statistics correctly', async () => {
      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        const rows = screen.getAllByRole('row')
        // Check LeBron's stats (first player row after header)
        expect(rows[1]).toHaveTextContent('23') // Jersey number
        expect(rows[1]).toHaveTextContent('Forward')
        expect(rows[1]).toHaveTextContent('100') // Points
        expect(rows[1]).toHaveTextContent('50') // Assists
        expect(rows[1]).toHaveTextContent('40') // Rebounds
      })
    })

    it('renders player links correctly', async () => {
      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        const link = screen.getByText('LeBron James').closest('a')
        expect(link).toHaveAttribute('href', '/players/p1')
      })
    })

    it('displays roster table headers', async () => {
      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        expect(screen.getByText('#')).toBeInTheDocument()
        expect(screen.getByText('Player')).toBeInTheDocument()
        expect(screen.getByText('Position')).toBeInTheDocument()
        expect(screen.getByText('PTS')).toBeInTheDocument()
        expect(screen.getByText('AST')).toBeInTheDocument()
        expect(screen.getByText('REB')).toBeInTheDocument()
        expect(screen.getByText('BLK')).toBeInTheDocument()
        expect(screen.getByText('STL')).toBeInTheDocument()
      })
    })
  })

  describe('Schedule Tab', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlayers,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockApiData,
        })
    })

    it('displays all matches', async () => {
      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        fireEvent.click(screen.getByText('Schedule'))
      })

      await waitFor(() => {
        expect(screen.getByText('Warriors')).toBeInTheDocument()
        expect(screen.getByText('Celtics')).toBeInTheDocument()
      })
    })

    it('displays match scores for completed games', async () => {
      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        fireEvent.click(screen.getByText('Schedule'))
      })

      await waitFor(() => {
        expect(screen.getByText('110 - 105')).toBeInTheDocument()
        expect(screen.getByText('100 - 115')).toBeInTheDocument()
      })
    })

    it('displays win/loss indicators correctly', async () => {
      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        fireEvent.click(screen.getByText('Schedule'))
      })

      await waitFor(() => {
        const winLossBadges = screen.getAllByText(/^[WL]$/)
        expect(winLossBadges).toHaveLength(2)
        expect(winLossBadges[0]).toHaveTextContent('W')
        expect(winLossBadges[1]).toHaveTextContent('L')
      })
    })

    it('formats match dates correctly', async () => {
      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        fireEvent.click(screen.getByText('Schedule'))
      })

      await waitFor(() => {
        expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument()
        expect(screen.getByText('Jan 20, 2024')).toBeInTheDocument()
      })
    })
  })

  describe('Stats Tab', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlayers,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockApiData,
        })
    })

    it('displays offensive statistics', async () => {
      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        fireEvent.click(screen.getByText('Stats'))
      })

      await waitFor(() => {
        expect(screen.getByText('Offensive Stats')).toBeInTheDocument()
        // Use getAllByText since these appear in multiple places
        const totalPointsElements = screen.getAllByText('Total Points')
        expect(totalPointsElements.length).toBeGreaterThan(0)
        const totalAssistsElements = screen.getAllByText('Total Assists')
        expect(totalAssistsElements.length).toBeGreaterThan(0)
      })
    })

    it('displays defensive statistics', async () => {
      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        fireEvent.click(screen.getByText('Stats'))
      })

      await waitFor(() => {
        expect(screen.getByText('Defensive Stats')).toBeInTheDocument()
        // Use getAllByText since these appear in multiple places
        const totalReboundsElements = screen.getAllByText('Total Rebounds')
        expect(totalReboundsElements.length).toBeGreaterThan(0)
        expect(screen.getByText('Total Blocks')).toBeInTheDocument()
        expect(screen.getByText('Total Steals')).toBeInTheDocument()
      })
    })

    it('calculates per-game averages correctly', async () => {
      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        fireEvent.click(screen.getByText('Stats'))
      })

      await waitFor(() => {
        // PPG = 180 / 2 = 90.0
        expect(screen.getByText('90.0')).toBeInTheDocument()
        // APG = 80 / 2 = 40.0
        expect(screen.getByText('40.0')).toBeInTheDocument()
        // RPG = 100 / 2 = 50.0
        expect(screen.getByText('50.0')).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles team with no coach', async () => {
      const dataWithoutCoach = {
        ...mockApiData,
        coaches: [],
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlayers,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => dataWithoutCoach,
        })

      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        expect(screen.getByText('Coach: No Coach')).toBeInTheDocument()
      })
    })

    it('handles team with no icon', async () => {
      const dataWithoutIcon = {
        ...mockApiData,
        teams: [{ ...mockApiData.teams[0], icon_url: null }],
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlayers,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => dataWithoutIcon,
        })

      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        expect(screen.queryByAltText('Lakers')).not.toBeInTheDocument()
      })
    })

    it('handles team not found in data', async () => {
      const dataWithoutTeam = {
        ...mockApiData,
        teams: [],
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlayers,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => dataWithoutTeam,
        })

      render(<TeamDetails teamId="team999" />)

      await waitFor(() => {
        expect(screen.getByText('Unknown Team')).toBeInTheDocument()
      })
    })

    it('handles no matches for team', async () => {
      const dataWithoutMatches = {
        ...mockApiData,
        matches: [],
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlayers,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => dataWithoutMatches,
        })

      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        expect(screen.getByText('0-0')).toBeInTheDocument() // No wins/losses
      })
    })

    it('calculates averages as 0.0 when no matches', async () => {
      const dataWithoutMatches = {
        ...mockApiData,
        matches: [],
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlayers,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => dataWithoutMatches,
        })

      render(<TeamDetails teamId="team1" />)

      await waitFor(() => {
        fireEvent.click(screen.getByText('Stats'))
      })

      await waitFor(() => {
        // Should show 0.0 for all per-game stats
        const zeroStats = screen.getAllByText('0.0')
        expect(zeroStats.length).toBeGreaterThan(0)
      })
    })
  })
})