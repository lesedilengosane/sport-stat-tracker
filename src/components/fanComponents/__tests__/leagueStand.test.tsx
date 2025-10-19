import { render, screen } from '@testing-library/react'
import { LeagueStandings } from '../leagueStanding'

describe('LeagueStandings', () => {
  const mockStandings = [
    {
      team_id: 'team1',
      team: 'Lakers',
      wins: 45,
      losses: 20,
      pct: 0.692,
    },
    {
      team_id: 'team2',
      team: 'Warriors',
      wins: 40,
      losses: 25,
      pct: 0.615,
    },
    {
      team_id: 'team3',
      team: 'Celtics',
      wins: 38,
      losses: 27,
      pct: 0.585,
    },
  ]

  describe('Rendering', () => {
    it('renders the component with standings data', () => {
      render(<LeagueStandings standings={mockStandings} />)
      
      expect(screen.getByText('League Standings')).toBeInTheDocument()
      expect(screen.getByText('Lakers')).toBeInTheDocument()
      expect(screen.getByText('Warriors')).toBeInTheDocument()
      expect(screen.getByText('Celtics')).toBeInTheDocument()
    })

    it('renders empty state when no standings provided', () => {
      render(<LeagueStandings />)
      
      expect(screen.getByText('League Standings')).toBeInTheDocument()
      expect(screen.getByText('No standings data available')).toBeInTheDocument()
    })

    it('renders empty state when standings array is empty', () => {
      render(<LeagueStandings standings={[]} />)
      
      expect(screen.getByText('No standings data available')).toBeInTheDocument()
    })
  })

  describe('Table Headers', () => {
    it('renders all column headers', () => {
      render(<LeagueStandings standings={mockStandings} />)
      
      expect(screen.getByText('Rank')).toBeInTheDocument()
      expect(screen.getByText('Team')).toBeInTheDocument()
      expect(screen.getByText('W')).toBeInTheDocument()
      expect(screen.getByText('L')).toBeInTheDocument()
      expect(screen.getByText('PCT')).toBeInTheDocument()
      expect(screen.getByText('GB')).toBeInTheDocument()
      expect(screen.getByText('L10')).toBeInTheDocument()
      expect(screen.getByText('STRK')).toBeInTheDocument()
    })
  })

  describe('Data Transformations', () => {
    it('calculates correct rankings based on wins', () => {
      render(<LeagueStandings standings={mockStandings} />)
      
      const rows = screen.getAllByRole('row')
      // Skip header row
      expect(rows[1]).toHaveTextContent('1')
      expect(rows[1]).toHaveTextContent('Lakers')
      expect(rows[2]).toHaveTextContent('2')
      expect(rows[2]).toHaveTextContent('Warriors')
      expect(rows[3]).toHaveTextContent('3')
      expect(rows[3]).toHaveTextContent('Celtics')
    })

    it('generates correct team abbreviations', () => {
      render(<LeagueStandings standings={mockStandings} />)
      
      expect(screen.getByText('LAK')).toBeInTheDocument()
      expect(screen.getByText('WAR')).toBeInTheDocument()
      expect(screen.getByText('CEL')).toBeInTheDocument()
    })

    it('displays wins and losses correctly', () => {
      render(<LeagueStandings standings={mockStandings} />)
      
      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('45')
      expect(rows[1]).toHaveTextContent('20')
    })

    it('formats PCT to three decimal places', () => {
      render(<LeagueStandings standings={mockStandings} />)
      
      expect(screen.getByText('0.692')).toBeInTheDocument()
      expect(screen.getByText('0.615')).toBeInTheDocument()
      expect(screen.getByText('0.585')).toBeInTheDocument()
    })

    it('calculates PCT when null is provided', () => {
      const standingsWithNullPct = [
        {
          team_id: 'team1',
          team: 'Lakers',
          wins: 10,
          losses: 5,
          pct: null,
        },
      ]
      
      render(<LeagueStandings standings={standingsWithNullPct} />)
      
      // 10 / (10 + 5) = 0.667
      expect(screen.getByText('0.667')).toBeInTheDocument()
    })

    it('handles zero wins and losses when PCT is null', () => {
      const standingsWithZeros = [
        {
          team_id: 'team1',
          team: 'Lakers',
          wins: 0,
          losses: 0,
          pct: null,
        },
      ]
      
      render(<LeagueStandings standings={standingsWithZeros} />)
      
      expect(screen.getByText('0.000')).toBeInTheDocument()
    })

    it('displays "-" for games behind when team is in first place', () => {
      render(<LeagueStandings standings={mockStandings} />)
      
      const rows = screen.getAllByRole('row')
      const lakersRow = rows[1]
      const cells = lakersRow.querySelectorAll('td')
      // GB column is index 5
      expect(cells[5]).toHaveTextContent('-')
    })

    it('calculates games behind correctly', () => {
      render(<LeagueStandings standings={mockStandings} />)
      
      const rows = screen.getAllByRole('row')
      const warriorsRow = rows[2]
      const cells = warriorsRow.querySelectorAll('td')
      // Warriors: (45 - 40 + (25 - 20)) / 2 = (5 + 5) / 2 = 5.0
      expect(cells[5]).toHaveTextContent('5.0')
    })

    it('displays default values for L10 and STRK', () => {
      render(<LeagueStandings standings={mockStandings} />)
      
      const rows = screen.getAllByRole('row')
      rows.slice(1).forEach(row => {
        expect(row).toHaveTextContent('0-0')
        expect(row).toHaveTextContent('-')
      })
    })
  })

  describe('Compact Mode', () => {
    it('applies compact styling when compact prop is true', () => {
      const { container } = render(<LeagueStandings standings={mockStandings} compact={true} />)
      
      // The component should render without errors
      expect(container.querySelector('table')).toBeInTheDocument()
    })

    it('applies normal styling when compact prop is false', () => {
      const { container } = render(<LeagueStandings standings={mockStandings} compact={false} />)
      
      expect(container.querySelector('table')).toBeInTheDocument()
    })
  })

  describe('Sorting', () => {
    it('sorts teams by wins in descending order', () => {
      const unsortedStandings = [
        { team_id: 'team1', team: 'Team A', wins: 30, losses: 35, pct: 0.462 },
        { team_id: 'team2', team: 'Team B', wins: 50, losses: 15, pct: 0.769 },
        { team_id: 'team3', team: 'Team C', wins: 40, losses: 25, pct: 0.615 },
      ]
      
      render(<LeagueStandings standings={unsortedStandings} />)
      
      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('Team B')
      expect(rows[2]).toHaveTextContent('Team C')
      expect(rows[3]).toHaveTextContent('Team A')
    })

    it('uses losses as tiebreaker when wins are equal', () => {
      const tiedStandings = [
        { team_id: 'team1', team: 'Team A', wins: 40, losses: 30, pct: 0.571 },
        { team_id: 'team2', team: 'Team B', wins: 40, losses: 25, pct: 0.615 },
        { team_id: 'team3', team: 'Team C', wins: 40, losses: 28, pct: 0.588 },
      ]
      
      render(<LeagueStandings standings={tiedStandings} />)
      
      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('Team B') // 40-25
      expect(rows[2]).toHaveTextContent('Team C') // 40-28
      expect(rows[3]).toHaveTextContent('Team A') // 40-30
    })
  })

  describe('Edge Cases', () => {
    it('handles single team', () => {
      const singleTeam = [mockStandings[0]]
      
      render(<LeagueStandings standings={singleTeam} />)
      
      expect(screen.getByText('Lakers')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('handles team names shorter than 3 characters', () => {
      const shortNameStandings = [
        { team_id: 'team1', team: 'LA', wins: 45, losses: 20, pct: 0.692 },
      ]
      
      render(<LeagueStandings standings={shortNameStandings} />)
      
      // "LA" appears twice - as abbreviation and team name
      const laElements = screen.getAllByText('LA')
      expect(laElements).toHaveLength(2)
      expect(laElements[0]).toBeInTheDocument()
    })

    it('handles very long team names', () => {
      const longNameStandings = [
        {
          team_id: 'team1',
          team: 'Very Long Team Name That Should Display',
          wins: 45,
          losses: 20,
          pct: 0.692,
        },
      ]
      
      render(<LeagueStandings standings={longNameStandings} />)
      
      expect(screen.getByText('Very Long Team Name That Should Display')).toBeInTheDocument()
      expect(screen.getByText('VER')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('renders a proper table structure', () => {
      render(<LeagueStandings standings={mockStandings} />)
      
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getAllByRole('row').length).toBe(4) // 1 header + 3 data rows
      expect(screen.getAllByRole('columnheader').length).toBe(8)
    })

    it('has proper table headers', () => {
      render(<LeagueStandings standings={mockStandings} />)
      
      const headers = screen.getAllByRole('columnheader')
      expect(headers).toHaveLength(8)
    })
  })
})