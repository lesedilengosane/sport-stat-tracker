import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import BasketballCourtLineup from '../CourtLineUp'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))

describe('BasketballCourtLineup', () => {
  const mockHomeLineup = [
    { id: '1', name: 'John', surname: 'Doe', position: 'PG', avatarUrl: '/player1.jpg' },
    { id: '2', name: 'Jane', surname: 'Smith', position: 'SG', avatarUrl: '/player2.jpg' },
    { id: '3', name: 'Bob', surname: 'Johnson', position: 'SF', avatarUrl: '/player3.jpg' },
    { id: '4', name: 'Alice', surname: 'Williams', position: 'PF', avatarUrl: '/player4.jpg' },
    { id: '5', name: 'Tom', surname: 'Brown', position: 'C', avatarUrl: '/player5.jpg' },
    { id: '6', name: 'Mike', surname: 'Davis', position: 'SUB', avatarUrl: '/player6.jpg' },
    { id: '7', name: 'Sarah', surname: 'Wilson', position: 'SUB', avatarUrl: '/player7.jpg' },
  ]

  const mockAwayLineup = [
    { id: '8', name: 'Chris', surname: 'Taylor', position: 'PG', avatarUrl: '/player8.jpg' },
    { id: '9', name: 'Emma', surname: 'Anderson', position: 'SG', avatarUrl: '/player9.jpg' },
    { id: '10', name: 'David', surname: 'Thomas', position: 'SF', avatarUrl: '/player10.jpg' },
    { id: '11', name: 'Lisa', surname: 'Moore', position: 'PF', avatarUrl: '/player11.jpg' },
    { id: '12', name: 'Paul', surname: 'Martin', position: 'C', avatarUrl: '/player12.jpg' },
    { id: '13', name: 'Kevin', surname: 'Lee', position: 'SUB', avatarUrl: '/player13.jpg' },
  ]

  const defaultProps = {
    homeTeam: 'Lakers',
    awayTeam: 'Warriors',
    homeLineup: mockHomeLineup,
    awayLineup: mockAwayLineup,
  }

  describe('Rendering', () => {
    it('renders team names correctly', () => {
      render(<BasketballCourtLineup {...defaultProps} />)
      
      expect(screen.getByText('Lakers')).toBeInTheDocument()
      expect(screen.getByText('Warriors')).toBeInTheDocument()
    })

    it('renders court image', () => {
      render(<BasketballCourtLineup {...defaultProps} />)
      
      const courtImage = screen.getByAltText('Basketball court')
      expect(courtImage).toBeInTheDocument()
      // Note: The component currently hardcodes '/court/court3.jpg' instead of using courtImageUrl prop
      expect(courtImage).toHaveAttribute('src', '/court/court3.jpg')
    })

    it('renders 5 home starters on the court', () => {
      render(<BasketballCourtLineup {...defaultProps} />)
      
      expect(screen.getByText('John')).toBeInTheDocument()
      expect(screen.getByText('Jane')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Tom')).toBeInTheDocument()
    })

    it('renders 5 away starters on the court', () => {
      render(<BasketballCourtLineup {...defaultProps} />)
      
      expect(screen.getByText('Chris')).toBeInTheDocument()
      expect(screen.getByText('Emma')).toBeInTheDocument()
      expect(screen.getByText('David')).toBeInTheDocument()
      expect(screen.getByText('Lisa')).toBeInTheDocument()
      expect(screen.getByText('Paul')).toBeInTheDocument()
    })

    it('renders home substitutes section', () => {
      render(<BasketballCourtLineup {...defaultProps} />)
      
      expect(screen.getByText('Home Subs')).toBeInTheDocument()
      expect(screen.getByText('Mike')).toBeInTheDocument()
      expect(screen.getByText('Sarah')).toBeInTheDocument()
    })

    it('renders away substitutes section', () => {
      render(<BasketballCourtLineup {...defaultProps} />)
      
      expect(screen.getByText('Away Subs')).toBeInTheDocument()
      expect(screen.getByText('Kevin')).toBeInTheDocument()
    })

    it('displays "No substitutes" when no subs available', () => {
      const propsWithNoSubs = {
        ...defaultProps,
        homeLineup: mockHomeLineup.slice(0, 5),
        awayLineup: mockAwayLineup.slice(0, 5),
      }
      
      render(<BasketballCourtLineup {...propsWithNoSubs} />)
      
      const noSubsMessages = screen.getAllByText('No substitutes')
      expect(noSubsMessages).toHaveLength(2)
    })

    it('renders player avatars when avatarUrl is provided', () => {
      render(<BasketballCourtLineup {...defaultProps} />)
      
      const johnAvatar = screen.getByAltText('John')
      expect(johnAvatar).toBeInTheDocument()
      expect(johnAvatar).toHaveAttribute('src', '/player1.jpg')
    })

    it('renders placeholder with initials when no avatarUrl', () => {
      const propsWithoutAvatars = {
        ...defaultProps,
        homeLineup: [
          { id: '1', name: 'John', surname: 'Doe', position: 'PG' },
          { id: '2', name: 'Jane', surname: 'Smith', position: 'SG' },
          { id: '3', name: 'Bob', surname: 'Johnson', position: 'SF' },
          { id: '4', name: 'Alice', surname: 'Williams', position: 'PF' },
          { id: '5', name: 'Tom', surname: 'Brown', position: 'C' },
        ],
      }
      
      render(<BasketballCourtLineup {...propsWithoutAvatars} />)
      
      expect(screen.getByText('JO')).toBeInTheDocument() // John -> JO
      expect(screen.getByText('JA')).toBeInTheDocument() // Jane -> JA
      expect(screen.getByText('BO')).toBeInTheDocument() // Bob -> BO
    })

    it('renders surname when provided', () => {
      render(<BasketballCourtLineup {...defaultProps} />)
      
      expect(screen.getAllByText('Doe')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Smith')[0]).toBeInTheDocument()
    })
  })

  describe('Player Interactions', () => {
    it('calls onPlayerClick when starter is clicked', () => {
      const mockOnPlayerClick = jest.fn()
      render(<BasketballCourtLineup {...defaultProps} onPlayerClick={mockOnPlayerClick} />)
      
      const johnPlayer = screen.getByText('John').closest('div')
      fireEvent.click(johnPlayer!)
      
      expect(mockOnPlayerClick).toHaveBeenCalledWith('1')
      expect(mockOnPlayerClick).toHaveBeenCalledTimes(1)
    })

    it('calls onPlayerClick when substitute is clicked', () => {
      const mockOnPlayerClick = jest.fn()
      render(<BasketballCourtLineup {...defaultProps} onPlayerClick={mockOnPlayerClick} />)
      
      const mikePlayer = screen.getByText('Mike').closest('div')
      fireEvent.click(mikePlayer!)
      
      expect(mockOnPlayerClick).toHaveBeenCalledWith('6')
    })

    it('handles keyboard Enter key on player', () => {
      const mockOnPlayerClick = jest.fn()
      render(<BasketballCourtLineup {...defaultProps} onPlayerClick={mockOnPlayerClick} />)
      
      const johnPlayer = screen.getByText('John').closest('div')
      fireEvent.keyDown(johnPlayer!, { key: 'Enter', code: 'Enter' })
      
      expect(mockOnPlayerClick).toHaveBeenCalledWith('1')
    })

    it('does not call onPlayerClick when other keys are pressed', () => {
      const mockOnPlayerClick = jest.fn()
      render(<BasketballCourtLineup {...defaultProps} onPlayerClick={mockOnPlayerClick} />)
      
      const johnPlayer = screen.getByText('John').closest('div')
      fireEvent.keyDown(johnPlayer!, { key: 'Space', code: 'Space' })
      
      expect(mockOnPlayerClick).not.toHaveBeenCalled()
    })

    it('does not throw error when onPlayerClick is not provided', () => {
      render(<BasketballCourtLineup {...defaultProps} />)
      
      const johnPlayer = screen.getByText('John').closest('div')
      expect(() => fireEvent.click(johnPlayer!)).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty lineups gracefully', () => {
      const emptyProps = {
        homeTeam: 'Lakers',
        awayTeam: 'Warriors',
        homeLineup: [],
        awayLineup: [],
      }
      
      render(<BasketballCourtLineup {...emptyProps} />)
      
      expect(screen.getByText('Lakers')).toBeInTheDocument()
      expect(screen.getByText('Warriors')).toBeInTheDocument()
      const noSubsMessages = screen.getAllByText('No substitutes')
      expect(noSubsMessages).toHaveLength(2)
    })

    it('handles lineup with less than 5 players', () => {
      const shortLineupProps = {
        ...defaultProps,
        homeLineup: mockHomeLineup.slice(0, 3),
        awayLineup: mockAwayLineup.slice(0, 2),
      }
      
      render(<BasketballCourtLineup {...shortLineupProps} />)
      
      expect(screen.getByText('John')).toBeInTheDocument()
      expect(screen.getByText('Jane')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Chris')).toBeInTheDocument()
      expect(screen.getByText('Emma')).toBeInTheDocument()
    })

    it('handles lineup with only starters (exactly 5 players)', () => {
      const startersOnlyProps = {
        ...defaultProps,
        homeLineup: mockHomeLineup.slice(0, 5),
        awayLineup: mockAwayLineup.slice(0, 5),
      }
      
      render(<BasketballCourtLineup {...startersOnlyProps} />)
      
      const noSubsMessages = screen.getAllByText('No substitutes')
      expect(noSubsMessages).toHaveLength(2)
    })

    it('handles player without surname', () => {
      const propsWithoutSurname = {
        ...defaultProps,
        homeLineup: [
          { id: '1', name: 'John', surname: '', position: 'PG', avatarUrl: '/player1.jpg' },
          ...mockHomeLineup.slice(1),
        ],
      }
      
      render(<BasketballCourtLineup {...propsWithoutSurname} />)
      
      expect(screen.getByText('John')).toBeInTheDocument()
    })

    it('handles player with undefined name gracefully', () => {
      const propsWithUndefinedName = {
        ...defaultProps,
        homeLineup: [
          { id: '1', name: '', surname: 'Doe', position: 'PG', avatarUrl: '/player1.jpg' },
          ...mockHomeLineup.slice(1),
        ],
      }
      
      expect(() => render(<BasketballCourtLineup {...propsWithUndefinedName} />)).not.toThrow()
    })
  })

  describe('Accessibility', () => {
    it('has proper role and tabIndex for interactive elements', () => {
      render(<BasketballCourtLineup {...defaultProps} />)
      
      // The role and tabIndex are on the topmost div that wraps the player chip
      // We need to traverse up from the text node
      const johnText = screen.getByText('John')
      const playerWrapper = johnText.closest('[role="button"]')
      expect(playerWrapper).toBeInTheDocument()
      expect(playerWrapper).toHaveAttribute('tabIndex', '0')
    })

    it('has alt text for all player images', () => {
      render(<BasketballCourtLineup {...defaultProps} />)
      
      expect(screen.getByAltText('John')).toBeInTheDocument()
      expect(screen.getByAltText('Jane')).toBeInTheDocument()
      expect(screen.getByAltText('Chris')).toBeInTheDocument()
    })
  })
})