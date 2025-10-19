import { render, screen } from '@testing-library/react'
import { SeasonHighlights } from '../SeasonHighlights'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Award: () => <span data-testid="award-icon">Award</span>,
  Target: () => <span data-testid="target-icon">Target</span>,
  TrendingUp: () => <span data-testid="trending-up-icon">TrendingUp</span>,
  BarChart3: () => <span data-testid="bar-chart-icon">BarChart3</span>,
}))

describe('SeasonHighlights', () => {
  const mockHighlights = {
    ppg_leader: { name: 'LeBron James', ppg: 28.5 },
    apg_leader: { name: 'Chris Paul', apg: 10.2 },
    rpg_leader: { name: 'Nikola Jokic', rpg: 13.8 },
    fg_leader: { name: 'Giannis Antetokounmpo', fg_pct: 61.5 },
  }

  describe('Rendering', () => {
    it('renders the component with title', () => {
      render(<SeasonHighlights highlights={mockHighlights} />)
      
      expect(screen.getByText('Season Highlights')).toBeInTheDocument()
    })

    it('renders all four highlight cards', () => {
      const { container } = render(<SeasonHighlights highlights={mockHighlights} />)
      
      const cards = container.querySelectorAll('.bg-black\\/10')
      expect(cards).toHaveLength(4)
    })
  })

  describe('PPG Leader Card', () => {
    it('displays PPG leader name and value', () => {
      render(<SeasonHighlights highlights={mockHighlights} />)
      
      expect(screen.getByText('League PPG Leader: LeBron James')).toBeInTheDocument()
      expect(screen.getByText('28.5')).toBeInTheDocument()
    })

    it('renders Award icon for PPG leader', () => {
      render(<SeasonHighlights highlights={mockHighlights} />)
      
      expect(screen.getByTestId('award-icon')).toBeInTheDocument()
    })

    it('formats PPG to one decimal place', () => {
      const highlights = {
        ...mockHighlights,
        ppg_leader: { name: 'Player', ppg: 25.678 },
      }
      
      render(<SeasonHighlights highlights={highlights} />)
      
      expect(screen.getByText('25.7')).toBeInTheDocument()
    })
  })

  describe('APG Leader Card', () => {
    it('displays APG leader name and value', () => {
      render(<SeasonHighlights highlights={mockHighlights} />)
      
      expect(screen.getByText('Top Assists Leader: Chris Paul')).toBeInTheDocument()
      expect(screen.getByText('10.2')).toBeInTheDocument()
    })

    it('renders Target icon for APG leader', () => {
      render(<SeasonHighlights highlights={mockHighlights} />)
      
      expect(screen.getByTestId('target-icon')).toBeInTheDocument()
    })

    it('formats APG to one decimal place', () => {
      const highlights = {
        ...mockHighlights,
        apg_leader: { name: 'Player', apg: 9.456 },
      }
      
      render(<SeasonHighlights highlights={highlights} />)
      
      expect(screen.getByText('9.5')).toBeInTheDocument()
    })
  })

  describe('RPG Leader Card', () => {
    it('displays RPG leader name and value', () => {
      render(<SeasonHighlights highlights={mockHighlights} />)
      
      expect(screen.getByText('Rebounds Leader: Nikola Jokic')).toBeInTheDocument()
      expect(screen.getByText('13.8')).toBeInTheDocument()
    })

    it('renders TrendingUp icon for RPG leader', () => {
      render(<SeasonHighlights highlights={mockHighlights} />)
      
      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument()
    })

    it('formats RPG to one decimal place', () => {
      const highlights = {
        ...mockHighlights,
        rpg_leader: { name: 'Player', rpg: 12.123 },
      }
      
      render(<SeasonHighlights highlights={highlights} />)
      
      expect(screen.getByText('12.1')).toBeInTheDocument()
    })
  })

  describe('FG% Leader Card', () => {
    it('displays FG% leader name and value', () => {
      render(<SeasonHighlights highlights={mockHighlights} />)
      
      expect(screen.getByText('Highest FG%: Giannis Antetokounmpo')).toBeInTheDocument()
      expect(screen.getByText('61.5%')).toBeInTheDocument()
    })

    it('renders BarChart3 icon for FG% leader', () => {
      render(<SeasonHighlights highlights={mockHighlights} />)
      
      expect(screen.getByTestId('bar-chart-icon')).toBeInTheDocument()
    })

    it('formats FG% to one decimal place with percentage sign', () => {
      const highlights = {
        ...mockHighlights,
        fg_leader: { name: 'Player', fg_pct: 58.789 },
      }
      
      render(<SeasonHighlights highlights={highlights} />)
      
      expect(screen.getByText('58.8%')).toBeInTheDocument()
    })
  })

  describe('Card Layout and Styling', () => {
    it('applies correct grid layout classes', () => {
      const { container } = render(<SeasonHighlights highlights={mockHighlights} />)
      
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1')
      expect(grid).toHaveClass('md:grid-cols-2')
      expect(grid).toHaveClass('lg:grid-cols-4')
    })

    it('applies hover effects to cards', () => {
      const { container } = render(<SeasonHighlights highlights={mockHighlights} />)
      
      const cards = container.querySelectorAll('.hover\\:shadow-xl')
      expect(cards).toHaveLength(4)
    })

    it('renders cards with proper styling', () => {
      const { container } = render(<SeasonHighlights highlights={mockHighlights} />)
      
      const cards = container.querySelectorAll('.bg-black\\/10')
      cards.forEach(card => {
        expect(card).toHaveClass('border')
        expect(card).toHaveClass('rounded-xl')
        expect(card).toHaveClass('p-6')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles zero values correctly', () => {
      const highlights = {
        ppg_leader: { name: 'Player A', ppg: 0 },
        apg_leader: { name: 'Player B', apg: 0 },
        rpg_leader: { name: 'Player C', rpg: 0 },
        fg_leader: { name: 'Player D', fg_pct: 0 },
      }
      
      render(<SeasonHighlights highlights={highlights} />)
      
      const zeroValues = screen.getAllByText('0.0')
      expect(zeroValues.length).toBeGreaterThan(0)
      expect(screen.getByText('0.0%')).toBeInTheDocument()
    })

    it('handles very large numbers', () => {
      const highlights = {
        ppg_leader: { name: 'Player', ppg: 999.9 },
        apg_leader: { name: 'Player', apg: 999.9 },
        rpg_leader: { name: 'Player', rpg: 999.9 },
        fg_leader: { name: 'Player', fg_pct: 100 },
      }
      
      render(<SeasonHighlights highlights={highlights} />)
      
      // 999.9 appears 3 times (ppg, apg, rpg)
      const largeNumbers = screen.getAllByText('999.9')
      expect(largeNumbers).toHaveLength(3)
      expect(screen.getByText('100.0%')).toBeInTheDocument()
    })

    it('handles player names with special characters', () => {
      const highlights = {
        ppg_leader: { name: "O'Neal Jr.", ppg: 25.5 },
        apg_leader: { name: 'Müller-Smith', apg: 10.5 },
        rpg_leader: { name: 'José García', rpg: 12.5 },
        fg_leader: { name: 'Αντετοκούνμπο', fg_pct: 55.5 },
      }
      
      render(<SeasonHighlights highlights={highlights} />)
      
      expect(screen.getByText("League PPG Leader: O'Neal Jr.")).toBeInTheDocument()
      expect(screen.getByText('Top Assists Leader: Müller-Smith')).toBeInTheDocument()
      expect(screen.getByText('Rebounds Leader: José García')).toBeInTheDocument()
      expect(screen.getByText('Highest FG%: Αντετοκούνμπο')).toBeInTheDocument()
    })

    it('handles very long player names', () => {
      const highlights = {
        ppg_leader: { name: 'Very Long Player Name That Should Still Display', ppg: 25.5 },
        apg_leader: { name: 'Another Extremely Long Name', apg: 10.5 },
        rpg_leader: { name: 'Yet Another Very Long Name', rpg: 12.5 },
        fg_leader: { name: 'Super Long Name Example', fg_pct: 55.5 },
      }
      
      render(<SeasonHighlights highlights={highlights} />)
      
      expect(screen.getByText('League PPG Leader: Very Long Player Name That Should Still Display')).toBeInTheDocument()
    })

    it('handles decimal values that round up', () => {
      const highlights = {
        ppg_leader: { name: 'Player', ppg: 25.95 },
        apg_leader: { name: 'Player', apg: 10.95 },
        rpg_leader: { name: 'Player', rpg: 12.95 },
        fg_leader: { name: 'Player', fg_pct: 55.95 },
      }
      
      render(<SeasonHighlights highlights={highlights} />)
      
      // toFixed(1) rounds to nearest, so 25.95 -> 25.9 (not 26.0)
      // Testing actual JavaScript behavior
      expect(screen.getByText('25.9')).toBeInTheDocument()
      expect(screen.getByText('10.9')).toBeInTheDocument()
      expect(screen.getByText('12.9')).toBeInTheDocument()
      expect(screen.getByText('56.0%')).toBeInTheDocument()
    })

    it('handles decimal values that round down', () => {
      const highlights = {
        ppg_leader: { name: 'Player', ppg: 25.04 },
        apg_leader: { name: 'Player', apg: 10.04 },
        rpg_leader: { name: 'Player', rpg: 12.04 },
        fg_leader: { name: 'Player', fg_pct: 55.04 },
      }
      
      render(<SeasonHighlights highlights={highlights} />)
      
      expect(screen.getByText('25.0')).toBeInTheDocument()
      expect(screen.getByText('10.0')).toBeInTheDocument()
      expect(screen.getByText('12.0')).toBeInTheDocument()
      expect(screen.getByText('55.0%')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('renders heading with proper hierarchy', () => {
      render(<SeasonHighlights highlights={mockHighlights} />)
      
      const heading = screen.getByText('Season Highlights')
      expect(heading.tagName).toBe('H2')
    })

    it('all cards are accessible', () => {
      const { container } = render(<SeasonHighlights highlights={mockHighlights} />)
      
      const cards = container.querySelectorAll('.bg-black\\/10')
      expect(cards).toHaveLength(4)
      
      cards.forEach(card => {
        expect(card).toBeInTheDocument()
      })
    })
  })

  describe('Icon Rendering', () => {
    it('renders all four icons', () => {
      render(<SeasonHighlights highlights={mockHighlights} />)
      
      expect(screen.getByTestId('award-icon')).toBeInTheDocument()
      expect(screen.getByTestId('target-icon')).toBeInTheDocument()
      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart-icon')).toBeInTheDocument()
    })

    it('icons appear in correct order', () => {
      const { container } = render(<SeasonHighlights highlights={mockHighlights} />)
      
      const icons = container.querySelectorAll('[data-testid]')
      expect(icons[0]).toHaveAttribute('data-testid', 'award-icon')
      expect(icons[1]).toHaveAttribute('data-testid', 'target-icon')
      expect(icons[2]).toHaveAttribute('data-testid', 'trending-up-icon')
      expect(icons[3]).toHaveAttribute('data-testid', 'bar-chart-icon')
    })
  })

  describe('Component Structure', () => {
    it('renders title before cards', () => {
      const { container } = render(<SeasonHighlights highlights={mockHighlights} />)
      
      const title = screen.getByText('Season Highlights')
      const grid = container.querySelector('.grid')
      
      expect(title.compareDocumentPosition(grid!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    })

    it('maintains correct card order', () => {
      render(<SeasonHighlights highlights={mockHighlights} />)
      
      const ppgText = screen.getByText('League PPG Leader: LeBron James')
      const apgText = screen.getByText('Top Assists Leader: Chris Paul')
      const rpgText = screen.getByText('Rebounds Leader: Nikola Jokic')
      const fgText = screen.getByText('Highest FG%: Giannis Antetokounmpo')
      
      expect(ppgText.compareDocumentPosition(apgText)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
      expect(apgText.compareDocumentPosition(rpgText)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
      expect(rpgText.compareDocumentPosition(fgText)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    })
  })
})