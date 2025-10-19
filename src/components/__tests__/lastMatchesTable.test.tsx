import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LastMatchesTable, MatchDetails } from '../LastMatchesTable'

describe('LastMatchesTable', () => {
  const mockMatches: MatchDetails[] = [
    {
      match_id: '1',
      home_team_id: 'team-1',
      away_team_id: 'team-2',
      home_score: 105,
      away_score: 98,
      match_date: '2025-10-20',
      completed: true,
      home_team: {
        team_id: 'team-1',
        team_name: 'Lakers',
        icon_url: '/logos/lakers.png',
        coach_id: 'coach-1',
      },
      away_team: {
        team_id: 'team-2',
        team_name: 'Warriors',
        icon_url: '/logos/warriors.png',
        coach_id: 'coach-2',
      },
    },
    {
      match_id: '2',
      home_team_id: 'team-3',
      away_team_id: 'team-4',
      home_score: 110,
      away_score: 102,
      match_date: '2025-10-18',
      completed: true,
      home_team: {
        team_id: 'team-3',
        team_name: 'Celtics',
        icon_url: '/logos/celtics.png',
        coach_id: 'coach-3',
      },
      away_team: {
        team_id: 'team-4',
        team_name: 'Bulls',
        icon_url: '/logos/bulls.png',
        coach_id: 'coach-4',
      },
    },
    {
      match_id: '3',
      home_team_id: 'team-5',
      away_team_id: 'team-6',
      home_score: 95,
      away_score: 100,
      match_date: '2025-10-25',
      completed: true,
      home_team: {
        team_id: 'team-5',
        team_name: 'Heat',
        icon_url: '/logos/heat.png',
        coach_id: 'coach-5',
      },
      away_team: {
        team_id: 'team-6',
        team_name: 'Knicks',
        icon_url: '/logos/knicks.png',
        coach_id: 'coach-6',
      },
    },
  ]

  const defaultProps = {
    data: mockMatches,
    title: 'Last 5 Matches',
    currentTeam: 'Lakers',
    onMatchClick: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the component with correct title', () => {
      render(<LastMatchesTable {...defaultProps} />)
      
      expect(screen.getByText('Lakers')).toBeInTheDocument()
    })

    it('renders with custom current team', () => {
      render(<LastMatchesTable {...defaultProps} currentTeam="Warriors" />)
      
      expect(screen.getByText('Warriors')).toBeInTheDocument()
    })

    it('renders game results', () => {
      render(<LastMatchesTable {...defaultProps} />)
      
      // Check for opponent names
      expect(screen.getByText('vs Warriors')).toBeInTheDocument()
    })

    it('displays correct number of games (max 5)', () => {
      render(<LastMatchesTable {...defaultProps} />)
      
      const gameCards = document.querySelectorAll('[class*="bg-orange-50"]')
      expect(gameCards.length).toBeLessThanOrEqual(5)
    })

    it('renders all game cards', () => {
      render(<LastMatchesTable {...defaultProps} />)
      
      expect(screen.getByText('vs Warriors')).toBeInTheDocument()
      expect(screen.getByText('105-98')).toBeInTheDocument()
    })
  })

  describe('Win/Loss Display', () => {
    it('displays W for wins', () => {
      render(<LastMatchesTable {...defaultProps} currentTeam="Lakers" />)
      
      // Lakers won 105-98
      const winIndicators = screen.getAllByText('W')
      expect(winIndicators.length).toBeGreaterThan(0)
    })

    it('displays L for losses', () => {
      render(<LastMatchesTable {...defaultProps} currentTeam="Heat" />)
      
      // Heat lost 95-100
      const lossIndicators = screen.getAllByText('L')
      expect(lossIndicators.length).toBeGreaterThan(0)
    })

    it('applies green background to wins', () => {
      const { container } = render(<LastMatchesTable {...defaultProps} currentTeam="Lakers" />)
      
      const greenCircles = container.querySelectorAll('.bg-green-500')
      expect(greenCircles.length).toBeGreaterThan(0)
    })

    it('applies red background to losses', () => {
      const { container } = render(<LastMatchesTable {...defaultProps} currentTeam="Heat" />)
      
      const redCircles = container.querySelectorAll('.bg-red-500')
      expect(redCircles.length).toBeGreaterThan(0)
    })
  })

  describe('Opponent Display', () => {
    it('shows correct opponent for home games', () => {
      render(<LastMatchesTable {...defaultProps} currentTeam="Lakers" />)
      
      // Lakers (home) vs Warriors (away)
      expect(screen.getByText('vs Warriors')).toBeInTheDocument()
    })

    it('shows correct opponent for away games', () => {
      render(<LastMatchesTable {...defaultProps} currentTeam="Warriors" />)
      
      // Warriors (away) vs Lakers (home)
      expect(screen.getByText('vs Lakers')).toBeInTheDocument()
    })

    it('displays opponent logos', () => {
      const { container } = render(<LastMatchesTable {...defaultProps} currentTeam="Lakers" />)
      
      const opponentLogo = container.querySelector('img[alt="Warriors logo"]')
      expect(opponentLogo).toBeInTheDocument()
    })

    it('renders logo with correct src', () => {
      const { container } = render(<LastMatchesTable {...defaultProps} currentTeam="Lakers" />)
      
      const logo = container.querySelector('img[src="/logos/warriors.png"]')
      expect(logo).toBeInTheDocument()
    })
  })

  describe('Score Display', () => {
    it('displays correct score format', () => {
      render(<LastMatchesTable {...defaultProps} currentTeam="Lakers" />)
      
      expect(screen.getByText('105-98')).toBeInTheDocument()
    })

    it('shows team score first for home games', () => {
      render(<LastMatchesTable {...defaultProps} currentTeam="Lakers" />)
      
      // Lakers (home) 105 vs Warriors (away) 98
      expect(screen.getByText('105-98')).toBeInTheDocument()
    })

    it('shows team score first for away games', () => {
      render(<LastMatchesTable {...defaultProps} currentTeam="Warriors" />)
      
      // Warriors (away) 98 vs Lakers (home) 105
      expect(screen.getByText('98-105')).toBeInTheDocument()
    })

    it('displays multiple scores correctly', () => {
      render(<LastMatchesTable {...defaultProps} currentTeam="Lakers" />)
      
      expect(screen.getByText('105-98')).toBeInTheDocument()
    })
  })

  describe('Click Handling', () => {
    it('calls onMatchClick when game card is clicked', () => {
      const mockOnMatchClick = jest.fn()
      render(<LastMatchesTable {...defaultProps} onMatchClick={mockOnMatchClick} />)
      
      const gameCard = screen.getByText('vs Warriors').closest('div')
      if (gameCard) {
        fireEvent.click(gameCard)
      }
      
      expect(mockOnMatchClick).toHaveBeenCalledTimes(1)
      expect(mockOnMatchClick).toHaveBeenCalledWith(mockMatches[0])
    })

    it('applies hover styles when onMatchClick is provided', () => {
      const { container } = render(<LastMatchesTable {...defaultProps} onMatchClick={jest.fn()} />)
      
      const clickableCard = container.querySelector('.cursor-pointer')
      expect(clickableCard).toBeInTheDocument()
    })

    it('does not apply cursor-pointer when onMatchClick is not provided', () => {
      const { onMatchClick, ...propsWithoutClick } = defaultProps
      const { container } = render(<LastMatchesTable {...propsWithoutClick} />)
      
      const cards = container.querySelectorAll('[class*="bg-orange-50"]')
      cards.forEach(card => {
        expect(card).not.toHaveClass('cursor-pointer')
      })
    })

    it('does not crash when clicking without onMatchClick', () => {
      const { onMatchClick, ...propsWithoutClick } = defaultProps
      render(<LastMatchesTable {...propsWithoutClick} />)
      
      const gameCard = screen.getByText('vs Warriors').closest('div')
      expect(() => {
        if (gameCard) fireEvent.click(gameCard)
      }).not.toThrow()
    })

    it('calls onMatchClick with correct match data', () => {
      const mockOnMatchClick = jest.fn()
      render(<LastMatchesTable {...defaultProps} onMatchClick={mockOnMatchClick} currentTeam="Celtics" />)
      
      const celticsGame = screen.getByText('vs Bulls').closest('div')
      if (celticsGame) {
        fireEvent.click(celticsGame)
      }
      
      expect(mockOnMatchClick).toHaveBeenCalledWith(mockMatches[1])
    })
  })

  describe('Data Handling', () => {
    it('handles empty data array', () => {
      render(<LastMatchesTable {...defaultProps} data={[]} />)
      
      expect(screen.getByText('Lakers')).toBeInTheDocument()
    })

    it('limits display to 5 games', () => {
      const manyMatches: MatchDetails[] = Array.from({ length: 10 }, (_, i) => ({
        match_id: `match-${i}`,
        home_team_id: `team-${i}`,
        away_team_id: `team-${i + 10}`,
        home_score: 100,
        away_score: 95,
        match_date: '2025-10-20',
        completed: true,
        home_team: {
          team_id: `team-${i}`,
          team_name: i === 0 ? 'Lakers' : `Team ${i}`,
          icon_url: `/logo-${i}.png`,
          coach_id: `coach-${i}`,
        },
        away_team: {
          team_id: `team-${i + 10}`,
          team_name: `Opponent ${i}`,
          icon_url: `/logo-opp-${i}.png`,
          coach_id: `coach-${i + 10}`,
        },
      }))
      
      const { container } = render(<LastMatchesTable {...defaultProps} data={manyMatches} />)
      
      const gameCards = container.querySelectorAll('[class*="bg-orange-50"]')
      expect(gameCards.length).toBeLessThanOrEqual(5)
    })

    it('handles single match', () => {
      render(<LastMatchesTable {...defaultProps} data={[mockMatches[0]]} />)
      
      expect(screen.getByText('vs Warriors')).toBeInTheDocument()
      expect(screen.getByText('105-98')).toBeInTheDocument()
    })

    it('handles matches without logos', () => {
      const matchWithoutLogo: MatchDetails = {
        ...mockMatches[0],
        home_team: { ...mockMatches[0].home_team, icon_url: '' },
        away_team: { ...mockMatches[0].away_team, icon_url: '' },
      }
      
      expect(() => 
        render(<LastMatchesTable {...defaultProps} data={[matchWithoutLogo]} />)
      ).not.toThrow()
    })
  })

  describe('Layout and Styling', () => {
    it('applies correct container styling', () => {
      const { container } = render(<LastMatchesTable {...defaultProps} />)
      
      const mainContainer = container.querySelector('.bg-white.rounded-lg')
      expect(mainContainer).toBeInTheDocument()
    })

    it('applies orange theme colors', () => {
      const { container } = render(<LastMatchesTable {...defaultProps} />)
      
      const orangeElements = container.querySelectorAll('[class*="orange"]')
      expect(orangeElements.length).toBeGreaterThan(0)
    })

    it('renders win/loss indicators with correct styling', () => {
      const { container } = render(<LastMatchesTable {...defaultProps} currentTeam="Lakers" />)
      
      const indicator = container.querySelector('.rounded-full.text-white')
      expect(indicator).toBeInTheDocument()
    })

    it('applies hover effects when clickable', () => {
      const { container } = render(<LastMatchesTable {...defaultProps} onMatchClick={jest.fn()} />)
      
      const hoverCard = container.querySelector('.hover\\:bg-orange-100')
      expect(hoverCard).toBeInTheDocument()
    })

    it('renders team title with correct styling', () => {
      render(<LastMatchesTable {...defaultProps} />)
      
      const title = screen.getByText('Lakers')
      expect(title).toHaveClass('text-xl', 'font-semibold', 'text-orange-600')
    })
  })

  describe('Edge Cases', () => {
    it('handles very high scores', () => {
      const highScoreMatch: MatchDetails = {
        ...mockMatches[0],
        home_score: 999,
        away_score: 888,
      }
      
      render(<LastMatchesTable {...defaultProps} data={[highScoreMatch]} currentTeam="Lakers" />)
      
      expect(screen.getByText('999-888')).toBeInTheDocument()
    })

    it('handles tied scores', () => {
      const tiedMatch: MatchDetails = {
        ...mockMatches[0],
        home_score: 100,
        away_score: 100,
      }
      
      render(<LastMatchesTable {...defaultProps} data={[tiedMatch]} currentTeam="Lakers" />)
      
      expect(screen.getByText('100-100')).toBeInTheDocument()
    })

    it('handles long team names', () => {
      const longNameMatch: MatchDetails = {
        ...mockMatches[0],
        away_team: {
          ...mockMatches[0].away_team,
          team_name: 'Very Long Team Name That Should Not Break Layout',
        },
      }
      
      render(<LastMatchesTable {...defaultProps} data={[longNameMatch]} currentTeam="Lakers" />)
      
      expect(screen.getByText('vs Very Long Team Name That Should Not Break Layout')).toBeInTheDocument()
    })

    it('correctly identifies home vs away for current team', () => {
      render(<LastMatchesTable {...defaultProps} currentTeam="Lakers" />)
      
      // Lakers is home team in first match
      expect(screen.getByText('vs Warriors')).toBeInTheDocument()
      expect(screen.getByText('105-98')).toBeInTheDocument() // Lakers score first
    })

    it('correctly identifies away vs home for current team', () => {
      render(<LastMatchesTable {...defaultProps} currentTeam="Warriors" />)
      
      // Warriors is away team in first match
      expect(screen.getByText('vs Lakers')).toBeInTheDocument()
      expect(screen.getByText('98-105')).toBeInTheDocument() // Warriors score first
    })

    it('handles incomplete matches', () => {
      const incompleteMatch: MatchDetails = {
        ...mockMatches[0],
        completed: false,
        home_score: 0,
        away_score: 0,
      }
      
      render(<LastMatchesTable {...defaultProps} data={[incompleteMatch]} currentTeam="Lakers" />)
      
      expect(screen.getByText('0-0')).toBeInTheDocument()
    })
  })

  describe('Props Validation', () => {
    it('accepts all required props', () => {
      expect(() => 
        render(<LastMatchesTable {...defaultProps} />)
      ).not.toThrow()
    })

    it('works without onMatchClick', () => {
      const { onMatchClick, ...propsWithoutClick } = defaultProps
      
      expect(() => 
        render(<LastMatchesTable {...propsWithoutClick} />)
      ).not.toThrow()
    })

    it('renders with different currentTeam values', () => {
      const teams = ['Lakers', 'Warriors', 'Celtics', 'Bulls']
      
      teams.forEach(team => {
        const { unmount } = render(<LastMatchesTable {...defaultProps} currentTeam={team} />)
        expect(screen.getByText(team)).toBeInTheDocument()
        unmount()
      })
    })
  })
});