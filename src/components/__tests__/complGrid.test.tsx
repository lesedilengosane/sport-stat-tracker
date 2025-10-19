import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CompletedGamesGrid } from '../completed-games-grid';

// Mock the CompletedGameCard component
jest.mock('../completed-game-card', () => ({
  CompletedGameCard: ({
    match_id,
    date,
    time,
    location,
    homeTeam,
    awayTeam,
    home_score,
    away_score,
    completed,
    booked,
  }: any) => (
    <div data-testid={`game-card-${match_id}`}>
      <div data-testid="date">{date}</div>
      <div data-testid="time">{time}</div>
      <div data-testid="location">{location}</div>
      <div data-testid="home-team">{homeTeam.name}</div>
      <div data-testid="away-team">{awayTeam.name}</div>
      <div data-testid="home-score">{home_score}</div>
      <div data-testid="away-score">{away_score}</div>
      <div data-testid="completed">{completed.toString()}</div>
      <div data-testid="is-booked">{booked !== undefined ? booked.toString() : ''}</div>
    </div>
  ),
}));

describe('CompletedGamesGrid Component', () => {
  const mockTeam1 = {
    team_id: 'team-1',
    name: 'Lakers',
    logo: '/logos/lakers.png',
    color: '#552583',
    score: 105,
    timeouts: 3,
    fouls: 5,
    players: [
      { player_id: 'p1', name: 'LeBron James', position: 'Forward' },
    ],
  };

  const mockTeam2 = {
    team_id: 'team-2',
    name: 'Warriors',
    logo: '/logos/warriors.png',
    color: '#1D428A',
    score: 98,
    timeouts: 2,
    fouls: 4,
    players: [
      { player_id: 'p2', name: 'Stephen Curry', position: 'Guard' },
    ],
  };

  const mockTeam3 = {
    team_id: 'team-3',
    name: 'Celtics',
    logo: '/logos/celtics.png',
    color: '#007A33',
    score: 110,
    timeouts: 4,
    fouls: 3,
    players: [],
  };

  const mockGames = [
    {
      match_id: 'game-1',
      analyst: 'John Doe',
      completed: true,
      date: '2025-01-15',
      time: '19:00',
      location: 'Staples Center',
      homeTeam: mockTeam1,
      awayTeam: mockTeam2,
      home_score: 105,
      away_score: 98,
      booked: true,
      isBooked: true,
      homeLineup: [{ player_id: 'p1', name: 'LeBron James', position: 'Forward' }],
      awayLineup: [{ player_id: 'p2', name: 'Stephen Curry', position: 'Guard' }],
    },
    {
      match_id: 'game-2',
      analyst: 'Jane Smith',
      completed: true,
      date: '2025-01-16',
      time: '20:00',
      location: 'TD Garden',
      homeTeam: mockTeam3,
      awayTeam: mockTeam1,
      home_score: 110,
      away_score: 102,
      booked: false,
      isBooked: false,
      homeLineup: [],
      awayLineup: [],
    },
  ];

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<CompletedGamesGrid games={mockGames} />);
      expect(screen.getByText('Completed Games')).toBeInTheDocument();
    });

    it('renders the main heading', () => {
      render(<CompletedGamesGrid games={mockGames} />);
      const heading = screen.getByText('Completed Games');
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H2');
    });

    it('renders the grid container', () => {
      const { container } = render(<CompletedGamesGrid games={mockGames} />);
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('applies correct styling classes to heading', () => {
      render(<CompletedGamesGrid games={mockGames} />);
      const heading = screen.getByText('Completed Games');
      expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-black', 'mb-6');
    });
  });

  describe('Game Cards Rendering', () => {
    it('renders correct number of game cards', () => {
      render(<CompletedGamesGrid games={mockGames} />);
      const gameCards = screen.getAllByTestId(/^game-card-/);
      expect(gameCards).toHaveLength(2);
    });

    it('renders game cards with correct match IDs', () => {
      render(<CompletedGamesGrid games={mockGames} />);
      expect(screen.getByTestId('game-card-game-1')).toBeInTheDocument();
      expect(screen.getByTestId('game-card-game-2')).toBeInTheDocument();
    });

    it('passes correct props to each game card', () => {
      render(<CompletedGamesGrid games={mockGames} />);
      
      const firstCard = screen.getByTestId('game-card-game-1');
      expect(within(firstCard).getByTestId('date')).toHaveTextContent('2025-01-15');
      expect(within(firstCard).getByTestId('time')).toHaveTextContent('19:00');
      expect(within(firstCard).getByTestId('location')).toHaveTextContent('Staples Center');
      expect(within(firstCard).getByTestId('home-team')).toHaveTextContent('Lakers');
      expect(within(firstCard).getByTestId('away-team')).toHaveTextContent('Warriors');
    });

    it('passes scores correctly to game cards', () => {
      render(<CompletedGamesGrid games={mockGames} />);
      
      const firstCard = screen.getByTestId('game-card-game-1');
      expect(within(firstCard).getByTestId('home-score')).toHaveTextContent('105');
      expect(within(firstCard).getByTestId('away-score')).toHaveTextContent('98');
    });

    it('passes completed status correctly', () => {
      render(<CompletedGamesGrid games={mockGames} />);
      
      const firstCard = screen.getByTestId('game-card-game-1');
      expect(within(firstCard).getByTestId('completed')).toHaveTextContent('true');
    });

    it('passes booking status correctly', () => {
      render(<CompletedGamesGrid games={mockGames} />);
      
      const firstCard = screen.getByTestId('game-card-game-1');
      const secondCard = screen.getByTestId('game-card-game-2');
      
      expect(within(firstCard).getByTestId('is-booked')).toHaveTextContent('true');
      expect(within(secondCard).getByTestId('is-booked')).toHaveTextContent('false');
    });
  });

  describe('Empty States', () => {
    it('renders without games', () => {
      render(<CompletedGamesGrid games={[]} />);
      expect(screen.getByText('Completed Games')).toBeInTheDocument();
      expect(screen.queryByTestId(/^game-card-/)).not.toBeInTheDocument();
    });

    it('handles undefined scores gracefully', () => {
      const gamesWithUndefinedScores = [
        {
          ...mockGames[0],
          match_id: 'game-3',
          home_score: undefined,
          away_score: undefined,
          booked: true,
        },
      ];
      
      render(<CompletedGamesGrid games={gamesWithUndefinedScores} />);
      
      const card = screen.getByTestId('game-card-game-3');
      expect(within(card).getByTestId('home-score')).toHaveTextContent('0');
      expect(within(card).getByTestId('away-score')).toHaveTextContent('0');
    });

    it('handles undefined isBooked gracefully', () => {
      const gamesWithUndefinedBooked = [
        {
          ...mockGames[0],
          match_id: 'game-4',
          booked: undefined as any,
          isBooked: undefined,
        },
      ];
      
      render(<CompletedGamesGrid games={gamesWithUndefinedBooked} />);
      
      const card = screen.getByTestId('game-card-game-4');
      const isBookedElement = within(card).getByTestId('is-booked');
      expect(isBookedElement).toBeInTheDocument();
      expect(isBookedElement.textContent).toBe('');
    });
  });

  describe('Grid Layout', () => {
    it('applies correct grid classes', () => {
      const { container } = render(<CompletedGamesGrid games={mockGames} />);
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass(
        'grid',
        'grid-cols-1',
        'md:grid-cols-2',
        'lg:grid-cols-3',
        'gap-4'
      );
    });

    it('renders single game in grid', () => {
      render(<CompletedGamesGrid games={[mockGames[0]]} />);
      const gameCards = screen.getAllByTestId(/^game-card-/);
      expect(gameCards).toHaveLength(1);
    });

    it('renders multiple games in grid', () => {
      const manyGames = [
        mockGames[0],
        mockGames[1],
        { ...mockGames[0], match_id: 'game-3' },
        { ...mockGames[1], match_id: 'game-4' },
        { ...mockGames[0], match_id: 'game-5' },
      ];
      
      render(<CompletedGamesGrid games={manyGames} />);
      const gameCards = screen.getAllByTestId(/^game-card-/);
      expect(gameCards).toHaveLength(5);
    });
  });

  describe('Container Styling', () => {
    it('applies correct container classes', () => {
      const { container } = render(<CompletedGamesGrid games={mockGames} />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass(
        'w-full',
        'max-w-6xl',
        'mx-auto',
        'p-6'
      );
    });
  });

  describe('Team Data Integration', () => {
    it('passes complete team objects to game cards', () => {
      render(<CompletedGamesGrid games={mockGames} />);
      
      const firstCard = screen.getByTestId('game-card-game-1');
      expect(within(firstCard).getByTestId('home-team')).toHaveTextContent('Lakers');
      expect(within(firstCard).getByTestId('away-team')).toHaveTextContent('Warriors');
      
      const secondCard = screen.getByTestId('game-card-game-2');
      expect(within(secondCard).getByTestId('home-team')).toHaveTextContent('Celtics');
      expect(within(secondCard).getByTestId('away-team')).toHaveTextContent('Lakers');
    });

    it('handles games with empty player lineups', () => {
      const gameWithEmptyLineups = {
        ...mockGames[0],
        match_id: 'game-5',
        homeLineup: [],
        awayLineup: [],
        booked: true,
      };
      
      render(<CompletedGamesGrid games={[gameWithEmptyLineups]} />);
      expect(screen.getByTestId('game-card-game-5')).toBeInTheDocument();
    });

    it('handles games without lineup data', () => {
      const gameWithoutLineups = {
        match_id: 'game-6',
        completed: true,
        date: '2025-01-17',
        time: '18:00',
        location: 'Madison Square Garden',
        homeTeam: mockTeam1,
        awayTeam: mockTeam2,
        home_score: 100,
        away_score: 95,
        booked: false,
        isBooked: false,
      };
      
      render(<CompletedGamesGrid games={[gameWithoutLineups]} />);
      expect(screen.getByTestId('game-card-game-6')).toBeInTheDocument();
    });
  });

  describe('Key Props', () => {
    it('uses unique match_id as key for each game card', () => {
      const { container } = render(<CompletedGamesGrid games={mockGames} />);
      
      // React will throw a warning if keys are not unique, but we can verify
      // the cards are rendered
      expect(screen.getByTestId('game-card-game-1')).toBeInTheDocument();
      expect(screen.getByTestId('game-card-game-2')).toBeInTheDocument();
    });

    it('renders correctly with duplicate game data but different IDs', () => {
      const duplicateGames = [
        mockGames[0],
        { ...mockGames[0], match_id: 'game-1-copy' },
      ];
      
      render(<CompletedGamesGrid games={duplicateGames} />);
      expect(screen.getByTestId('game-card-game-1')).toBeInTheDocument();
      expect(screen.getByTestId('game-card-game-1-copy')).toBeInTheDocument();
    });
  });

  describe('Optional Props Handling', () => {
    it('handles games with sample data flag', () => {
      const sampleGame = {
        ...mockGames[0],
        match_id: 'sample-1',
        isSampleData: true,
        booked: true,
      };
      
      render(<CompletedGamesGrid games={[sampleGame]} />);
      expect(screen.getByTestId('game-card-sample-1')).toBeInTheDocument();
    });

    it('handles games with analyst field', () => {
      const gameWithAnalyst = {
        ...mockGames[0],
        match_id: 'analyzed-1',
        analyst: 'John Analyst',
        booked: true,
      };
      
      render(<CompletedGamesGrid games={[gameWithAnalyst]} />);
      expect(screen.getByTestId('game-card-analyzed-1')).toBeInTheDocument();
    });

    it('handles games without analyst field', () => {
      const gameWithoutAnalyst = {
        match_id: 'no-analyst-1',
        completed: true,
        date: '2025-01-18',
        time: '19:30',
        location: 'Arena',
        homeTeam: mockTeam1,
        awayTeam: mockTeam2,
        home_score: 90,
        away_score: 85,
        booked: true,
        isBooked: true,
      };
      
      render(<CompletedGamesGrid games={[gameWithoutAnalyst]} />);
      expect(screen.getByTestId('game-card-no-analyst-1')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long location names', () => {
      const gameWithLongLocation = {
        ...mockGames[0],
        match_id: 'long-location',
        location: 'The Very Long Name of an International Basketball Stadium Complex',
        booked: true,
      };
      
      render(<CompletedGamesGrid games={[gameWithLongLocation]} />);
      const card = screen.getByTestId('game-card-long-location');
      expect(within(card).getByTestId('location')).toHaveTextContent(
        'The Very Long Name of an International Basketball Stadium Complex'
      );
    });

    it('handles very long team names', () => {
      const longNameTeam = {
        ...mockTeam1,
        name: 'Very Long Team Name That Should Still Render Correctly',
      };
      
      const game = {
        ...mockGames[0],
        match_id: 'long-team-name',
        homeTeam: longNameTeam,
        booked: true,
      };
      
      render(<CompletedGamesGrid games={[game]} />);
      const card = screen.getByTestId('game-card-long-team-name');
      expect(within(card).getByTestId('home-team')).toHaveTextContent(
        'Very Long Team Name That Should Still Render Correctly'
      );
    });

    it('handles zero scores', () => {
      const gameWithZeroScores = {
        ...mockGames[0],
        match_id: 'zero-scores',
        home_score: 0,
        away_score: 0,
        booked: true,
      };
      
      render(<CompletedGamesGrid games={[gameWithZeroScores]} />);
      const card = screen.getByTestId('game-card-zero-scores');
      expect(within(card).getByTestId('home-score')).toHaveTextContent('0');
      expect(within(card).getByTestId('away-score')).toHaveTextContent('0');
    });

    it('handles very high scores', () => {
      const gameWithHighScores = {
        ...mockGames[0],
        match_id: 'high-scores',
        home_score: 999,
        away_score: 998,
        booked: true,
      };
      
      render(<CompletedGamesGrid games={[gameWithHighScores]} />);
      const card = screen.getByTestId('game-card-high-scores');
      expect(within(card).getByTestId('home-score')).toHaveTextContent('999');
      expect(within(card).getByTestId('away-score')).toHaveTextContent('998');
    });
  });

  describe('Responsive Grid Behavior', () => {
    it('renders with responsive grid classes for different screen sizes', () => {
      const { container } = render(<CompletedGamesGrid games={mockGames} />);
      const grid = container.querySelector('.grid');
      
      // Check for mobile (1 column)
      expect(grid).toHaveClass('grid-cols-1');
      // Check for tablet (2 columns)
      expect(grid).toHaveClass('md:grid-cols-2');
      // Check for desktop (3 columns)
      expect(grid).toHaveClass('lg:grid-cols-3');
    });
  });
});