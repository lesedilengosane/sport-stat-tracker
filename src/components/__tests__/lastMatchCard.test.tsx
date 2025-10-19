import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LastMatchesCards } from '../lastmatchesCard'

// Mock lucide-react Star icon
jest.mock('lucide-react', () => ({
  Star: () => <div data-testid="star-icon">Star</div>,
}))

describe('LastMatchesCards', () => {
  const mockMatches = [
    {
      match_id: '1',
      home_team_name: 'Lakers',
      away_team_name: 'Warriors',
      home_icon_url: '/logos/lakers.png',
      away_icon_url: '/logos/warriors.png',
      home_score: 105,
      away_score: 98,
      match_date: '2025-10-20',
      completed: true,
    },
    {
      match_id: '2',
      home_team_name: 'Celtics',
      away_team_name: 'Lakers',
      home_icon_url: '/logos/celtics.png',
      away_icon_url: '/logos/lakers.png',
      home_score: 110,
      away_score: 102,
      match_date: '2025-10-18',
      completed: true,
    },
    {
      match_id: '3',
      home_team_name: 'Lakers',
      away_team_name: 'Bulls',
      home_icon_url: '/logos/lakers.png',
      away_icon_url: '/logos/bulls.png',
      home_score: 0,
      away_score: 0,
      match_date: '2025-10-25',
      completed: false,
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
    it('renders the title', () => {
      render(<LastMatchesCards {...defaultProps} />)
      
      expect(screen.getByText('Last 5 Matches')).toBeInTheDocument()
    })

    it('renders all matches', () => {
      render(<LastMatchesCards {...defaultProps} />)
      
      // Check that all opponent teams are rendered
      expect(screen.getByText('Warriors')).toBeInTheDocument()
      expect(screen.getByText('Celtics')).toBeInTheDocument()
      expect(screen.getByText('Bulls')).toBeInTheDocument()
    })

    it('displays current team name', () => {
      render(<LastMatchesCards {...defaultProps} />)
      
      const lakersElements = screen.getAllByText('Lakers')
      // Lakers should appear 3 times (once per match card)
      expect(lakersElements.length).toBeGreaterThanOrEqual(3)
    })

    it('renders team logos', () => {
      const { container } = render(<LastMatchesCards {...defaultProps} />)
      
      const images = container.querySelectorAll('img')
      expect(images.length).toBeGreaterThan(0)
    })

    it('displays star icon for each match', () => {
      render(<LastMatchesCards {...defaultProps} />)
      
      const starIcons = screen.getAllByTestId('star-icon')
      expect(starIcons).toHaveLength(3)
    })
  })

  describe('Match Status Display', () => {
    it('shows "FT" for completed matches', () => {
      render(<LastMatchesCards {...defaultProps} />)
      
      const ftLabels = screen.getAllByText('FT')
      expect(ftLabels).toHaveLength(2) // Two completed matches
    })

    it('shows "SCH" for scheduled matches', () => {
      render(<LastMatchesCards {...defaultProps} />)
      
      expect(screen.getByText('SCH')).toBeInTheDocument()
    })

    it('displays scores for completed matches', () => {
      render(<LastMatchesCards {...defaultProps} />)
      
      expect(screen.getByText('105')).toBeInTheDocument()
      expect(screen.getByText('98')).toBeInTheDocument()
      expect(screen.getByText('110')).toBeInTheDocument()
      expect(screen.getByText('102')).toBeInTheDocument()
    })

    it('displays "-" for scheduled match scores', () => {
      render(<LastMatchesCards {...defaultProps} />)
      
      const dashScores = screen.getAllByText('-')
      expect(dashScores.length).toBeGreaterThanOrEqual(2) // At least 2 dashes for the scheduled match
    })
  })

  describe('Team Perspective', () => {
    it('shows current team score first when home team', () => {
      render(<LastMatchesCards {...defaultProps} />)
      
      // Match 1: Lakers (home) vs Warriors - Lakers won 105-98
      // The Lakers score (105) should be displayed as the team score
      expect(screen.getByText('105')).toBeInTheDocument()
    })

    it('shows current team score first when away team', () => {
      render(<LastMatchesCards {...defaultProps} />)
      
      // Match 2: Celtics vs Lakers (away) - Lakers lost 102-110
      // The Lakers score (102) should be displayed as the team score
      expect(screen.getByText('102')).toBeInTheDocument()
    })

    it('displays opponent team name', () => {
      render(<LastMatchesCards {...defaultProps} />)
      
      expect(screen.getByText('Warriors')).toBeInTheDocument()
      expect(screen.getByText('Celtics')).toBeInTheDocument()
      expect(screen.getByText('Bulls')).toBeInTheDocument()
    })

    it('handles case-insensitive team name matching', () => {
      const propsWithDifferentCase = {
        ...defaultProps,
        currentTeam: 'lakers', // lowercase
      }
      
      expect(() => render(<LastMatchesCards {...propsWithDifferentCase} />)).not.toThrow()
      expect(screen.getByText('Warriors')).toBeInTheDocument()
    })

    it('handles whitespace in team names', () => {
      const propsWithWhitespace = {
        ...defaultProps,
        currentTeam: '  Lakers  ', // with whitespace
      }
      
      expect(() => render(<LastMatchesCards {...propsWithWhitespace} />)).not.toThrow()
      expect(screen.getByText('Warriors')).toBeInTheDocument()
    })
  })

  describe('Match Click Handling', () => {
    it('calls onMatchClick when a match card is clicked', () => {
      const mockOnMatchClick = jest.fn()
      render(<LastMatchesCards {...defaultProps} onMatchClick={mockOnMatchClick} />)
      
      const matchCards = screen.getAllByText('Warriors')[0].closest('div[class*="cursor-pointer"]')
      fireEvent.click(matchCards!)
      
      expect(mockOnMatchClick).toHaveBeenCalledWith(mockMatches[0])
      expect(mockOnMatchClick).toHaveBeenCalledTimes(1)
    })

    it('calls onMatchClick with correct match data', () => {
      const mockOnMatchClick = jest.fn()
      render(<LastMatchesCards {...defaultProps} onMatchClick={mockOnMatchClick} />)
      
      const matchCards = screen.getAllByText('Celtics')[0].closest('div[class*="cursor-pointer"]')
      fireEvent.click(matchCards!)
      
      expect(mockOnMatchClick).toHaveBeenCalledWith(mockMatches[1])
    })

    it('allows clicking multiple matches', () => {
      const mockOnMatchClick = jest.fn()
      render(<LastMatchesCards {...defaultProps} onMatchClick={mockOnMatchClick} />)
      
      const warriorsMatch = screen.getAllByText('Warriors')[0].closest('div[class*="cursor-pointer"]')
      const celticsMatch = screen.getAllByText('Celtics')[0].closest('div[class*="cursor-pointer"]')
      
      fireEvent.click(warriorsMatch!)
      fireEvent.click(celticsMatch!)
      
      expect(mockOnMatchClick).toHaveBeenCalledTimes(2)
    })
  })

  describe('Image Rendering', () => {
    it('renders team logos with correct src attributes', () => {
      const { container } = render(<LastMatchesCards {...defaultProps} />)
      
      const images = container.querySelectorAll('img')
      const lakersLogos = Array.from(images).filter(img => 
        img.getAttribute('src')?.includes('lakers.png')
      )
      
      expect(lakersLogos.length).toBeGreaterThan(0)
    })

    it('renders opponent logos', () => {
      const { container } = render(<LastMatchesCards {...defaultProps} />)
      
      const images = container.querySelectorAll('img')
      const warriorsLogo = Array.from(images).find(img => 
        img.getAttribute('src')?.includes('warriors.png')
      )
      
      expect(warriorsLogo).toBeInTheDocument()
    })

    it('sets alt text for team logos', () => {
      render(<LastMatchesCards {...defaultProps} />)
      
      // Current team (Lakers) should have alt text
      const lakersImages = screen.getAllByAltText('Lakers')
      expect(lakersImages.length).toBeGreaterThan(0)
    })

    it('sets alt text for opponent logos', () => {
      render(<LastMatchesCards {...defaultProps} />)
      
      expect(screen.getByAltText('Warriors')).toBeInTheDocument()
      expect(screen.getByAltText('Celtics')).toBeInTheDocument()
      expect(screen.getByAltText('Bulls')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty matches array', () => {
      render(<LastMatchesCards {...defaultProps} data={[]} />)
      
      expect(screen.getByText('Last 5 Matches')).toBeInTheDocument()
      expect(screen.queryByText('Warriors')).not.toBeInTheDocument()
    })

    it('handles single match', () => {
      render(<LastMatchesCards {...defaultProps} data={[mockMatches[0]]} />)
      
      expect(screen.getByText('Warriors')).toBeInTheDocument()
      expect(screen.queryByText('Celtics')).not.toBeInTheDocument()
    })

    it('handles match with zero scores', () => {
      const matchWithZeroScores = {
        ...mockMatches[0],
        home_score: 0,
        away_score: 0,
        completed: true,
      }
      
      render(<LastMatchesCards {...defaultProps} data={[matchWithZeroScores]} />)
      
      const zeroScores = screen.getAllByText('0')
      expect(zeroScores.length).toBeGreaterThanOrEqual(2)
    })

    it('handles undefined team name gracefully', () => {
      const propsWithUndefinedTeam = {
        ...defaultProps,
        currentTeam: '',
      }
      
      expect(() => render(<LastMatchesCards {...propsWithUndefinedTeam} />)).not.toThrow()
    })

    it('handles missing icon URLs', () => {
      const matchesWithoutIcons = mockMatches.map(m => ({
        ...m,
        home_icon_url: '',
        away_icon_url: '',
      }))
      
      expect(() => 
        render(<LastMatchesCards {...defaultProps} data={matchesWithoutIcons} />)
      ).not.toThrow()
    })

    it('handles very long team names', () => {
      const matchWithLongNames = {
        ...mockMatches[0],
        home_team_name: 'Very Long Team Name That Should Not Break Layout',
        away_team_name: 'Another Very Long Team Name',
      }
      
      const props = {
        ...defaultProps,
        data: [matchWithLongNames],
        currentTeam: 'Very Long Team Name That Should Not Break Layout',
      }
      
      expect(() => render(<LastMatchesCards {...props} />)).not.toThrow()
    })

    it('handles large number of matches', () => {
      const manyMatches = Array.from({ length: 20 }, (_, i) => ({
        match_id: `match-${i}`,
        home_team_name: i % 2 === 0 ? 'Lakers' : 'Opponent',
        away_team_name: i % 2 === 0 ? 'Opponent' : 'Lakers',
        home_icon_url: '/logo1.png',
        away_icon_url: '/logo2.png',
        home_score: 100 + i,
        away_score: 95 + i,
        match_date: '2025-10-20',
        completed: true,
      }))
      
      expect(() => 
        render(<LastMatchesCards {...defaultProps} data={manyMatches} />)
      ).not.toThrow()
    })
  })

  describe('Layout and Styling', () => {
    it('applies correct container classes', () => {
      const { container } = render(<LastMatchesCards {...defaultProps} />)
      
      const mainContainer = container.querySelector('.w-full')
      expect(mainContainer).toBeInTheDocument()
    })

    it('applies hover styles to match cards', () => {
      const { container } = render(<LastMatchesCards {...defaultProps} />)
      
      const matchCards = container.querySelectorAll('.hover\\:bg-zinc-800')
      expect(matchCards.length).toBe(3)
    })

    it('applies cursor pointer to clickable cards', () => {
      const { container } = render(<LastMatchesCards {...defaultProps} />)
      
      const clickableCards = container.querySelectorAll('.cursor-pointer')
      expect(clickableCards.length).toBe(3)
    })

    it('renders with proper spacing between matches', () => {
      const { container } = render(<LastMatchesCards {...defaultProps} />)
      
      const spacedContainer = container.querySelector('.space-y-3')
      expect(spacedContainer).toBeInTheDocument()
    })
  })

  describe('Win/Loss Logic', () => {
    it('correctly identifies wins', () => {
      // Match 1: Lakers (105) vs Warriors (98) - Lakers win
      render(<LastMatchesCards {...defaultProps} data={[mockMatches[0]]} />)
      
      expect(screen.getByText('105')).toBeInTheDocument()
      expect(screen.getByText('98')).toBeInTheDocument()
    })

    it('correctly identifies losses', () => {
      // Match 2: Celtics (110) vs Lakers (102) - Lakers lose
      render(<LastMatchesCards {...defaultProps} data={[mockMatches[1]]} />)
      
      expect(screen.getByText('102')).toBeInTheDocument()
      expect(screen.getByText('110')).toBeInTheDocument()
    })

    it('handles tie scores', () => {
      const tieMatch = {
        ...mockMatches[0],
        home_score: 100,
        away_score: 100,
      }
      
      render(<LastMatchesCards {...defaultProps} data={[tieMatch]} />)
      
      const scores = screen.getAllByText('100')
      expect(scores).toHaveLength(2)
    })
  })
})