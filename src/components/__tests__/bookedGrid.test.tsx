import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BookedGamesGrid } from '../booked-games-grid'
import { Game } from '@/types/basketball'

// Mock the GameCard component
jest.mock('../game-card', () => ({
  GameCard: ({ match_id, homeTeam, awayTeam, booked }: any) => (
    <div data-testid={`game-card-${match_id}`}>
      <span>{homeTeam.name} vs {awayTeam.name}</span>
      <span>{booked ? 'Booked' : 'Not Booked'}</span>
    </div>
  ),
}))

describe('BookedGamesGrid', () => {
  const mockGames: Game[] = [
    {
      match_id: '1',
      date: '2025-10-20',
      time: '19:00',
      location: 'Staples Center',
      homeTeam: {
        team_id: 'lal',
        name: 'Lakers',
        logo: '/logos/lakers.png',
      },
      awayTeam: {
        team_id: 'gsw',
        name: 'Warriors',
        logo: '/logos/warriors.png',
      },
      completed: false,
      booked: true,
    },
    {
      match_id: '2',
      date: '2025-10-21',
      time: '20:00',
      location: 'Madison Square Garden',
      homeTeam: {
        team_id: 'nyk',
        name: 'Knicks',
        logo: '/logos/knicks.png',
      },
      awayTeam: {
        team_id: 'bos',
        name: 'Celtics',
        logo: '/logos/celtics.png',
      },
      completed: false,
      booked: false,
    },
    {
      match_id: '3',
      date: '2025-10-22',
      time: '18:30',
      location: 'United Center',
      homeTeam: {
        team_id: 'chi',
        name: 'Bulls',
        logo: '/logos/bulls.png',
      },
      awayTeam: {
        team_id: 'mia',
        name: 'Heat',
        logo: '/logos/heat.png',
      },
      completed: false,
      booked: true,
    },
    {
      match_id: '4',
      date: '2025-10-23',
      time: '21:00',
      location: 'American Airlines Arena',
      homeTeam: {
        team_id: 'dal',
        name: 'Mavericks',
        logo: '/logos/mavericks.png',
      },
      awayTeam: {
        team_id: 'sas',
        name: 'Spurs',
        logo: '/logos/spurs.png',
      },
      completed: false,
      booked: true,
    },
  ]

  describe('Rendering', () => {
    it('renders the component title', () => {
      render(<BookedGamesGrid games={mockGames} />)
      
      expect(screen.getByText('BOOKED GAMES')).toBeInTheDocument()
    })

    it('renders only booked games', () => {
      render(<BookedGamesGrid games={mockGames} />)
      
      // Should render 3 booked games (match_id 1, 3, 4)
      expect(screen.getByTestId('game-card-1')).toBeInTheDocument()
      expect(screen.getByTestId('game-card-3')).toBeInTheDocument()
      expect(screen.getByTestId('game-card-4')).toBeInTheDocument()
      
      // Should NOT render unbooked game (match_id 2)
      expect(screen.queryByTestId('game-card-2')).not.toBeInTheDocument()
    })

    it('renders correct number of booked games', () => {
      render(<BookedGamesGrid games={mockGames} />)
      
      const gameCards = screen.getAllByTestId(/^game-card-/)
      expect(gameCards).toHaveLength(3)
    })

    it('passes correct props to GameCard components', () => {
      render(<BookedGamesGrid games={mockGames} />)
      
      expect(screen.getByText('Lakers vs Warriors')).toBeInTheDocument()
      expect(screen.getByText('Bulls vs Heat')).toBeInTheDocument()
      expect(screen.getByText('Mavericks vs Spurs')).toBeInTheDocument()
    })

    it('applies correct grid layout classes', () => {
      const { container } = render(<BookedGamesGrid games={mockGames} />)
      
      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-4')
    })
  })

  describe('Empty State', () => {
    it('displays empty state when no games are provided', () => {
      render(<BookedGamesGrid games={[]} />)
      
      expect(screen.getByText('No booked games yet')).toBeInTheDocument()
      expect(screen.getByText('Games you book for analysis will appear here')).toBeInTheDocument()
    })

    it('displays empty state when no booked games exist', () => {
      const unbookedGames: Game[] = [
        {
          match_id: '1',
          date: '2025-10-20',
          time: '19:00',
          location: 'Staples Center',
          homeTeam: {
            team_id: 'lal',
            name: 'Lakers',
            logo: '/logos/lakers.png',
          },
          awayTeam: {
            team_id: 'gsw',
            name: 'Warriors',
            logo: '/logos/warriors.png',
          },
          completed: false,
          booked: false,
        },
        {
          match_id: '2',
          date: '2025-10-21',
          time: '20:00',
          location: 'Madison Square Garden',
          homeTeam: {
            team_id: 'nyk',
            name: 'Knicks',
            logo: '/logos/knicks.png',
          },
          awayTeam: {
            team_id: 'bos',
            name: 'Celtics',
            logo: '/logos/celtics.png',
          },
          completed: false,
          booked: false,
        },
      ]
      
      render(<BookedGamesGrid games={unbookedGames} />)
      
      expect(screen.getByText('No booked games yet')).toBeInTheDocument()
      expect(screen.queryByTestId(/^game-card-/)).not.toBeInTheDocument()
    })

    it('does not render grid when showing empty state', () => {
      const { container } = render(<BookedGamesGrid games={[]} />)
      
      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).not.toBeInTheDocument()
    })
  })

  describe('Filtering Logic', () => {
    it('correctly filters booked games from mixed list', () => {
      render(<BookedGamesGrid games={mockGames} />)
      
      // Verify booked games are shown
      expect(screen.getByText('Lakers vs Warriors')).toBeInTheDocument()
      expect(screen.getByText('Bulls vs Heat')).toBeInTheDocument()
      expect(screen.getByText('Mavericks vs Spurs')).toBeInTheDocument()
      
      // Verify unbooked game is not shown
      expect(screen.queryByText('Knicks vs Celtics')).not.toBeInTheDocument()
    })

    it('handles all games being booked', () => {
      const allBookedGames: Game[] = mockGames.map(game => ({ ...game, booked: true }))
      
      render(<BookedGamesGrid games={allBookedGames} />)
      
      const gameCards = screen.getAllByTestId(/^game-card-/)
      expect(gameCards).toHaveLength(4)
    })

    it('handles boolean booked field correctly', () => {
      const gamesWithExplicitBoolean: Game[] = [
        { ...mockGames[0], booked: true },
        { ...mockGames[1], booked: false },
      ]
      
      render(<BookedGamesGrid games={gamesWithExplicitBoolean} />)
      
      expect(screen.getByTestId('game-card-1')).toBeInTheDocument()
      expect(screen.queryByTestId('game-card-2')).not.toBeInTheDocument()
    })
  })

  describe('Game Card Rendering', () => {
    it('renders GameCard with all required props', () => {
      render(<BookedGamesGrid games={[mockGames[0]]} />)
      
      const gameCard = screen.getByTestId('game-card-1')
      expect(gameCard).toBeInTheDocument()
      expect(screen.getByText('Booked')).toBeInTheDocument()
    })

    it('maintains game order from filtered list', () => {
      const { container } = render(<BookedGamesGrid games={mockGames} />)
      
      const gameCards = container.querySelectorAll('[data-testid^="game-card-"]')
      expect(gameCards[0]).toHaveAttribute('data-testid', 'game-card-1')
      expect(gameCards[1]).toHaveAttribute('data-testid', 'game-card-3')
      expect(gameCards[2]).toHaveAttribute('data-testid', 'game-card-4')
    })

    it('uses match_id as key for GameCard components', () => {
      const { container } = render(<BookedGamesGrid games={mockGames} />)
      
      // Check that each game card has unique match_id
      expect(screen.getByTestId('game-card-1')).toBeInTheDocument()
      expect(screen.getByTestId('game-card-3')).toBeInTheDocument()
      expect(screen.getByTestId('game-card-4')).toBeInTheDocument()
    })
  })

  describe('Layout and Styling', () => {
    it('renders with correct container classes', () => {
      const { container } = render(<BookedGamesGrid games={mockGames} />)
      
      const mainContainer = container.querySelector('.w-full')
      expect(mainContainer).toHaveClass('max-w-6xl', 'mx-auto', 'p-6')
    })

    it('renders title with correct styling', () => {
      render(<BookedGamesGrid games={mockGames} />)
      
      const title = screen.getByText('BOOKED GAMES')
      expect(title).toHaveClass('text-2xl', 'font-bold', 'text-black', 'mb-6')
    })

    it('renders empty state with correct styling', () => {
      const { container } = render(<BookedGamesGrid games={[]} />)
      
      const emptyState = container.querySelector('.bg-white\\/80')
      expect(emptyState).toHaveClass('backdrop-blur-sm', 'border', 'border-orange-500/20', 'rounded-lg', 'p-8', 'text-center')
    })
  })

  describe('Edge Cases', () => {
    it('handles single booked game', () => {
      const singleGame: Game[] = [mockGames[0]]
      
      render(<BookedGamesGrid games={singleGame} />)
      
      expect(screen.getByTestId('game-card-1')).toBeInTheDocument()
      expect(screen.getAllByTestId(/^game-card-/)).toHaveLength(1)
    })

    it('handles large number of booked games', () => {
      const manyGames: Game[] = Array.from({ length: 20 }, (_, i) => ({
        match_id: `game-${i}`,
        date: '2025-10-20',
        time: '19:00',
        location: 'Arena',
        homeTeam: {
          team_id: `team-a-${i}`,
          name: `Team A${i}`,
          logo: `/logos/team-a-${i}.png`,
        },
        awayTeam: {
          team_id: `team-b-${i}`,
          name: `Team B${i}`,
          logo: `/logos/team-b-${i}.png`,
        },
        completed: false,
        booked: true,
      }))
      
      render(<BookedGamesGrid games={manyGames} />)
      
      expect(screen.getAllByTestId(/^game-card-/)).toHaveLength(20)
    })

    it('handles games with missing optional fields', () => {
      const gameWithMinimalData: Game[] = [
        {
          match_id: '99',
          date: '2025-10-20',
          time: '19:00',
          location: 'Arena',
          homeTeam: {
            team_id: 'home',
            name: 'Home',
            logo: '/logos/home.png',
          },
          awayTeam: {
            team_id: 'away',
            name: 'Away',
            logo: '/logos/away.png',
          },
          completed: false,
          booked: true,
        },
      ]
      
      expect(() => render(<BookedGamesGrid games={gameWithMinimalData} />)).not.toThrow()
    })

    it('handles undefined booked field as falsy', () => {
      const gamesWithUndefinedBooked: Game[] = [
        { ...mockGames[0], booked: undefined as any },
      ]
      
      render(<BookedGamesGrid games={gamesWithUndefinedBooked} />)
      
      expect(screen.getByText('No booked games yet')).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('re-renders when games prop changes', () => {
      const { rerender } = render(<BookedGamesGrid games={mockGames} />)
      
      expect(screen.getAllByTestId(/^game-card-/)).toHaveLength(3)
      
      const newGames: Game[] = [mockGames[0]]
      rerender(<BookedGamesGrid games={newGames} />)
      
      expect(screen.getAllByTestId(/^game-card-/)).toHaveLength(1)
    })

    it('updates display when games are booked/unbooked', () => {
      const initialGames: Game[] = [
        { ...mockGames[0], booked: false },
        { ...mockGames[1], booked: false },
      ]
      
      const { rerender } = render(<BookedGamesGrid games={initialGames} />)
      expect(screen.getByText('No booked games yet')).toBeInTheDocument()
      
      const updatedGames: Game[] = [
        { ...mockGames[0], booked: true },
        { ...mockGames[1], booked: false },
      ]
      
      rerender(<BookedGamesGrid games={updatedGames} />)
      expect(screen.getByTestId('game-card-1')).toBeInTheDocument()
      expect(screen.queryByText('No booked games yet')).not.toBeInTheDocument()
    })
  })
})