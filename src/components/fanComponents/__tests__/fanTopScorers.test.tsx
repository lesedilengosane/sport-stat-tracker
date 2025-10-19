import { render, screen, within } from '@testing-library/react'
import { TopScorers } from '../TopScorers'

// Define Player interface locally since it's not exported
interface Player {
  player_id: string
  name: string
  team: string
  ppg: number
  rpg: number
  apg: number
  fg: number
}

// Mock data
const mockPlayers: Player[] = [
  {
    player_id: '1',
    name: 'LeBron James',
    team: 'Los Angeles Lakers',
    ppg: 25.7,
    rpg: 7.3,
    apg: 7.3,
    fg: 52.4
  },
  {
    player_id: '2',
    name: 'Stephen Curry',
    team: 'Golden State Warriors',
    ppg: 29.4,
    rpg: 6.1,
    apg: 6.3,
    fg: 48.2
  },
  {
    player_id: '3',
    name: 'Giannis Antetokounmpo',
    team: 'Milwaukee Bucks',
    ppg: 31.1,
    rpg: 11.8,
    apg: 5.8,
    fg: 55.3
  }
]

describe('TopScorers Component', () => {
  describe('Rendering', () => {
    it('renders the component title', () => {
      render(<TopScorers players={mockPlayers} />)
      expect(screen.getByText('Top Scorers')).toBeInTheDocument()
    })

    it('renders table headers correctly', () => {
      render(<TopScorers players={mockPlayers} />)
      
      expect(screen.getByText('Player')).toBeInTheDocument()
      expect(screen.getByText('PPG')).toBeInTheDocument()
      expect(screen.getByText('RPG')).toBeInTheDocument()
      expect(screen.getByText('APG')).toBeInTheDocument()
      expect(screen.getByText('FG%')).toBeInTheDocument()
    })

    it('renders all players from the provided data', () => {
      render(<TopScorers players={mockPlayers} />)
      
      expect(screen.getByText('LeBron James')).toBeInTheDocument()
      expect(screen.getByText('Stephen Curry')).toBeInTheDocument()
      expect(screen.getByText('Giannis Antetokounmpo')).toBeInTheDocument()
    })

    it('renders team names correctly', () => {
      render(<TopScorers players={mockPlayers} />)
      
      expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument()
      expect(screen.getByText('Golden State Warriors')).toBeInTheDocument()
      expect(screen.getByText('Milwaukee Bucks')).toBeInTheDocument()
    })

    it('renders player statistics with correct formatting', () => {
      render(<TopScorers players={mockPlayers} />)
      
      // Check PPG formatting (one decimal place)
      expect(screen.getByText('25.7')).toBeInTheDocument()
      expect(screen.getByText('29.4')).toBeInTheDocument()
      
      // Check FG% formatting (one decimal with % sign)
      expect(screen.getByText('52.4%')).toBeInTheDocument()
      expect(screen.getByText('48.2%')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('displays message when no players are provided', () => {
      render(<TopScorers />)
      
      expect(screen.getByText('Top Scorers')).toBeInTheDocument()
      expect(screen.getByText('No player data available')).toBeInTheDocument()
    })

    it('displays message when empty array is provided', () => {
      render(<TopScorers players={[]} />)
      
      expect(screen.getByText('No player data available')).toBeInTheDocument()
    })

    it('does not render table when no players provided', () => {
      render(<TopScorers />)
      
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })
  })

  describe('Data Formatting', () => {
    it('formats decimal numbers to one decimal place', () => {
      const playerWithDecimals: Player[] = [{
        player_id: '1',
        name: 'Test Player',
        team: 'Test Team',
        ppg: 25.678,
        rpg: 7.345,
        apg: 6.123,
        fg: 51.987
      }]
      
      render(<TopScorers players={playerWithDecimals} />)
      
      expect(screen.getByText('25.7')).toBeInTheDocument()
      expect(screen.getByText('7.3')).toBeInTheDocument()
      expect(screen.getByText('6.1')).toBeInTheDocument()
      expect(screen.getByText('52.0%')).toBeInTheDocument()
    })

    it('handles whole numbers correctly', () => {
      const playerWithWholeNumbers: Player[] = [{
        player_id: '1',
        name: 'Test Player',
        team: 'Test Team',
        ppg: 20,
        rpg: 10,
        apg: 5,
        fg: 50
      }]
      
      render(<TopScorers players={playerWithWholeNumbers} />)
      
      expect(screen.getByText('20.0')).toBeInTheDocument()
      expect(screen.getByText('10.0')).toBeInTheDocument()
      expect(screen.getByText('5.0')).toBeInTheDocument()
      expect(screen.getByText('50.0%')).toBeInTheDocument()
    })
  })

  describe('Table Structure', () => {
    it('renders correct number of table rows', () => {
      const { container } = render(<TopScorers players={mockPlayers} />)
      const rows = container.querySelectorAll('tbody tr')
      
      expect(rows).toHaveLength(mockPlayers.length)
    })

    it('each player row contains correct data', () => {
      render(<TopScorers players={mockPlayers} />)
      
      // Verify each player's data is in the table
      mockPlayers.forEach(player => {
        expect(screen.getByText(player.name)).toBeInTheDocument()
        expect(screen.getByText(player.team)).toBeInTheDocument()
      })
    })

    it('renders table with proper structure', () => {
      render(<TopScorers players={mockPlayers} />)
      
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
      
      const thead = table.querySelector('thead')
      const tbody = table.querySelector('tbody')
      
      expect(thead).toBeInTheDocument()
      expect(tbody).toBeInTheDocument()
    })
  })

  describe('Single Player', () => {
    it('renders correctly with single player', () => {
      const singlePlayer: Player[] = [mockPlayers[0]]
      
      render(<TopScorers players={singlePlayer} />)
      
      expect(screen.getByText('LeBron James')).toBeInTheDocument()
      expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles player with zero stats', () => {
      const playerWithZeros: Player[] = [{
        player_id: '1',
        name: 'Rookie Player',
        team: 'New Team',
        ppg: 0,
        rpg: 0,
        apg: 0,
        fg: 0
      }]
      
      const { container } = render(<TopScorers players={playerWithZeros} />)
      
      expect(screen.getByText('Rookie Player')).toBeInTheDocument()
      
      // Find all cells with 0.0 and verify count
      const cells = container.querySelectorAll('td')
      const zeroCells = Array.from(cells).filter(cell => 
        cell.textContent === '0.0' || cell.textContent?.trim() === '0.0%'
      )
      expect(zeroCells.length).toBeGreaterThan(0)
    })

    it('handles very high statistics', () => {
      const playerWithHighStats: Player[] = [{
        player_id: '1',
        name: 'Super Player',
        team: 'Dream Team',
        ppg: 99.9,
        rpg: 99.9,
        apg: 99.9,
        fg: 99.9
      }]
      
      const { container } = render(<TopScorers players={playerWithHighStats} />)
      
      expect(screen.getByText('Super Player')).toBeInTheDocument()
      
      // Verify high stats are rendered
      const cells = container.querySelectorAll('td')
      const highStatCells = Array.from(cells).filter(cell => 
        cell.textContent === '99.9' || cell.textContent?.trim() === '99.9%'
      )
      expect(highStatCells.length).toBeGreaterThan(0)
    })

    it('handles special characters in player names', () => {
      const playerWithSpecialChars: Player[] = [{
        player_id: '1',
        name: "Luka Dončić",
        team: 'Dallas Mavericks',
        ppg: 28.4,
        rpg: 9.1,
        apg: 8.7,
        fg: 49.6
      }]
      
      render(<TopScorers players={playerWithSpecialChars} />)
      
      expect(screen.getByText("Luka Dončić")).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('table is accessible via role', () => {
      render(<TopScorers players={mockPlayers} />)
      
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('has proper table header structure', () => {
      const { container } = render(<TopScorers players={mockPlayers} />)
      const headers = container.querySelectorAll('th')
      
      expect(headers).toHaveLength(5)
    })
  })
})