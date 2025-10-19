import { render, screen, within } from '@testing-library/react'
import LastGames, { lastFiveGamesData, type Game, type GameResult } from '../last5games'

describe('LastGames Component', () => {
  describe('Rendering', () => {
    it('renders the component title', () => {
      render(<LastGames />)
      expect(screen.getByText('Last Five Games')).toBeInTheDocument()
    })

    it('renders all home team games', () => {
      render(<LastGames />)
      
      lastFiveGamesData.homeTeam.games.forEach(game => {
        const scores = screen.getAllByText(game.score.toString())
        expect(scores.length).toBeGreaterThan(0)
      })
    })

    it('renders all away team games', () => {
      render(<LastGames />)
      
      lastFiveGamesData.awayTeam.games.forEach(game => {
        const scores = screen.getAllByText(game.score.toString())
        expect(scores.length).toBeGreaterThan(0)
      })
    })

    it('renders correct number of games for home team', () => {
      const { container } = render(<LastGames />)
      const homeTeamSection = container.querySelector('.border-r-4')
      const gameElements = homeTeamSection?.querySelectorAll('.flex.items-center.space-x-20')
      
      expect(gameElements?.length).toBe(lastFiveGamesData.homeTeam.games.length)
    })

    it('renders correct number of games for away team', () => {
      const { container } = render(<LastGames />)
      const awayTeamSection = container.querySelector('.items-end')
      const gameElements = awayTeamSection?.querySelectorAll('.flex.items-center.space-x-20')
      
      expect(gameElements?.length).toBe(lastFiveGamesData.awayTeam.games.length)
    })
  })

  describe('Game Results Display', () => {
    it('displays W for wins', () => {
      render(<LastGames />)
      
      const allGames = [...lastFiveGamesData.homeTeam.games, ...lastFiveGamesData.awayTeam.games]
      const winCount = allGames.filter(game => game.result === 'W').length
      const winElements = screen.getAllByText('W')
      
      expect(winElements.length).toBe(winCount)
    })

    it('displays L for losses', () => {
      render(<LastGames />)
      
      const allGames = [...lastFiveGamesData.homeTeam.games, ...lastFiveGamesData.awayTeam.games]
      const lossCount = allGames.filter(game => game.result === 'L').length
      const lossElements = screen.getAllByText('L')
      
      expect(lossElements.length).toBe(lossCount)
    })

    it('applies green background for wins', () => {
      const { container } = render(<LastGames />)
      
      const winCircles = container.querySelectorAll('.bg-green-500')
      const expectedWins = [...lastFiveGamesData.homeTeam.games, ...lastFiveGamesData.awayTeam.games]
        .filter(game => game.result === 'W').length
      
      expect(winCircles.length).toBe(expectedWins)
    })

    it('applies red background for losses', () => {
      const { container } = render(<LastGames />)
      
      const lossCircles = container.querySelectorAll('.bg-red-500')
      const expectedLosses = [...lastFiveGamesData.homeTeam.games, ...lastFiveGamesData.awayTeam.games]
        .filter(game => game.result === 'L').length
      
      expect(lossCircles.length).toBe(expectedLosses)
    })
  })

  describe('Score Display', () => {
    it('displays all scores correctly', () => {
      render(<LastGames />)
      
      const allGames = [...lastFiveGamesData.homeTeam.games, ...lastFiveGamesData.awayTeam.games]
      const uniqueScores = [...new Set(allGames.map(game => game.score))]
      
      uniqueScores.forEach(score => {
        const scoreElements = screen.getAllByText(score.toString())
        expect(scoreElements.length).toBeGreaterThan(0)
      })
    })

    it('displays scores with correct styling', () => {
      const { container } = render(<LastGames />)
      
      const scoreElements = container.querySelectorAll('.text-lg.font-semibold')
      const totalGames = lastFiveGamesData.homeTeam.games.length + lastFiveGamesData.awayTeam.games.length
      
      expect(scoreElements.length).toBe(totalGames)
    })
  })

  describe('Layout and Structure', () => {
    it('renders two-column grid layout', () => {
      const { container } = render(<LastGames />)
      
      const gridContainer = container.querySelector('.grid.grid-cols-2')
      expect(gridContainer).toBeInTheDocument()
    })

    it('home team section has border styling', () => {
      const { container } = render(<LastGames />)
      
      const homeTeamSection = container.querySelector('.border-r-4.border-orange-500')
      expect(homeTeamSection).toBeInTheDocument()
    })

    it('away team section is right-aligned', () => {
      const { container } = render(<LastGames />)
      
      const awayTeamSection = container.querySelector('.items-end')
      expect(awayTeamSection).toBeInTheDocument()
    })

    it('renders result circles with correct styling', () => {
      const { container } = render(<LastGames />)
      
      const circles = container.querySelectorAll('.w-6.h-6.rounded-full')
      const totalGames = lastFiveGamesData.homeTeam.games.length + lastFiveGamesData.awayTeam.games.length
      
      expect(circles.length).toBe(totalGames)
    })
  })

  describe('Data Integrity', () => {
    it('renders games in correct order for home team', () => {
      const { container } = render(<LastGames />)
      
      const homeTeamSection = container.querySelector('.border-r-4')
      const gameElements = homeTeamSection?.querySelectorAll('.flex.items-center.space-x-20')
      
      gameElements?.forEach((element, index) => {
        const expectedResult = lastFiveGamesData.homeTeam.games[index].result
        const resultElement = element.querySelector('.rounded-full')
        
        expect(resultElement?.textContent).toBe(expectedResult)
      })
    })

    it('renders games in correct order for away team', () => {
      const { container } = render(<LastGames />)
      
      const awayTeamSection = container.querySelector('.items-end')
      const gameElements = awayTeamSection?.querySelectorAll('.flex.items-center.space-x-20')
      
      gameElements?.forEach((element, index) => {
        const expectedResult = lastFiveGamesData.awayTeam.games[index].result
        const resultElement = element.querySelector('.rounded-full')
        
        expect(resultElement?.textContent).toBe(expectedResult)
      })
    })

    it('matches home team game count from data', () => {
      const { container } = render(<LastGames />)
      
      const homeTeamSection = container.querySelector('.border-r-4')
      const gameElements = homeTeamSection?.querySelectorAll('.flex.items-center.space-x-20')
      
      expect(gameElements?.length).toBe(5)
    })

    it('matches away team game count from data', () => {
      const { container } = render(<LastGames />)
      
      const awayTeamSection = container.querySelector('.items-end')
      const gameElements = awayTeamSection?.querySelectorAll('.flex.items-center.space-x-20')
      
      expect(gameElements?.length).toBe(5)
    })
  })

  describe('Game Result Circles', () => {
    it('all circles have proper dimensions', () => {
      const { container } = render(<LastGames />)
      
      const circles = container.querySelectorAll('.w-6.h-6.rounded-full')
      
      circles.forEach(circle => {
        expect(circle).toHaveClass('w-6')
        expect(circle).toHaveClass('h-6')
        expect(circle).toHaveClass('rounded-full')
      })
    })

    it('all circles have centered content', () => {
      const { container } = render(<LastGames />)
      
      const circles = container.querySelectorAll('.rounded-full')
      
      circles.forEach(circle => {
        expect(circle).toHaveClass('flex')
        expect(circle).toHaveClass('items-center')
        expect(circle).toHaveClass('justify-center')
      })
    })

    it('all circles have white text', () => {
      const { container } = render(<LastGames />)
      
      const circles = container.querySelectorAll('.rounded-full')
      
      circles.forEach(circle => {
        expect(circle).toHaveClass('text-white')
      })
    })

    it('win circles have green background', () => {
      const { container } = render(<LastGames />)
      
      const winCircles = container.querySelectorAll('.bg-green-500')
      
      winCircles.forEach(circle => {
        expect(circle.textContent).toBe('W')
      })
    })

    it('loss circles have red background', () => {
      const { container } = render(<LastGames />)
      
      const lossCircles = container.querySelectorAll('.bg-red-500')
      
      lossCircles.forEach(circle => {
        expect(circle.textContent).toBe('L')
      })
    })
  })

  describe('Component Container', () => {
    it('has max width constraint', () => {
      const { container } = render(<LastGames />)
      
      const mainContainer = container.querySelector('.max-w-2xl')
      expect(mainContainer).toBeInTheDocument()
    })

    it('is centered horizontally', () => {
      const { container } = render(<LastGames />)
      
      const mainContainer = container.querySelector('.mx-auto')
      expect(mainContainer).toBeInTheDocument()
    })

    it('has full width', () => {
      const { container } = render(<LastGames />)
      
      const mainContainer = container.querySelector('.w-full')
      expect(mainContainer).toBeInTheDocument()
    })
  })

  describe('Typography', () => {
    it('title has correct styling', () => {
      const { container } = render(<LastGames />)
      
      const title = container.querySelector('h2')
      
      expect(title).toHaveClass('text-center')
      expect(title).toHaveClass('text-lg')
      expect(title).toHaveClass('font-bold')
      expect(title).toHaveClass('mb-4')
    })

    it('scores have correct font size', () => {
      const { container } = render(<LastGames />)
      
      const scores = container.querySelectorAll('.text-lg.font-semibold')
      
      expect(scores.length).toBeGreaterThan(0)
      scores.forEach(score => {
        expect(score).toHaveClass('text-lg')
        expect(score).toHaveClass('font-semibold')
      })
    })

    it('result text has correct size and weight', () => {
      const { container } = render(<LastGames />)
      
      const results = container.querySelectorAll('.rounded-full')
      
      results.forEach(result => {
        expect(result).toHaveClass('text-sm')
        expect(result).toHaveClass('font-bold')
      })
    })
  })

  describe('Spacing', () => {
    it('games have vertical spacing', () => {
      const { container } = render(<LastGames />)
      
      const homeTeamSection = container.querySelector('.space-y-3')
      expect(homeTeamSection).toBeInTheDocument()
    })

    it('game elements have horizontal spacing', () => {
      const { container } = render(<LastGames />)
      
      const gameElements = container.querySelectorAll('.space-x-20')
      const totalGames = lastFiveGamesData.homeTeam.games.length + lastFiveGamesData.awayTeam.games.length
      
      expect(gameElements.length).toBe(totalGames)
    })

    it('grid has gap between columns', () => {
      const { container } = render(<LastGames />)
      
      const grid = container.querySelector('.gap-8')
      expect(grid).toBeInTheDocument()
    })
  })
})