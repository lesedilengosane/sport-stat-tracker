// src/components/Line-up-table/__tests__/basketball.test.tsx
import { render, screen, within, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BasketballStatTracker from '../basketball-stat-tracker';
import type { GameData } from '@/types/basketball';

// Mock child components
jest.mock('../../ui/team-player-card', () => ({
  __esModule: true,
  default: ({ team, selectedPlayer, onPlayerSelect, getPlayerStats, teamColor }: any) => (
    <div data-testid={`team-player-card-${teamColor}`}>
      {team.players.map((player: any) => (
        <button
          key={player.player_id}
          data-testid={`player-${player.player_id}`}
          onClick={() => onPlayerSelect(player.player_id)}
          className={selectedPlayer === player.player_id ? 'selected' : ''}
        >
          {player.name}
          <span data-testid={`stats-${player.player_id}`}>
            {JSON.stringify(getPlayerStats(player.player_id))}
          </span>
        </button>
      ))}
    </div>
  ),
}));

jest.mock('../../ui/game-history', () => ({
  __esModule: true,
  default: ({ events }: any) => (
    <div data-testid="game-history">
      {events.map((event: any) => (
        <div key={event.id} data-testid={`event-${event.id}`}>
          {event.playerName} - {event.action}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../../ui/action-buttons', () => ({
  __esModule: true,
  default: ({ onAction, disabled }: any) => (
    <div data-testid="action-buttons">
      <button onClick={() => !disabled && onAction('+1 FT', 1)} disabled={disabled} data-testid="btn-ft">+1 FT</button>
      <button onClick={() => !disabled && onAction('+2 FG', 2)} disabled={disabled} data-testid="btn-2pt">+2 FG</button>
      <button onClick={() => !disabled && onAction('+3 FG', 3)} disabled={disabled} data-testid="btn-3pt">+3 FG</button>
      <button onClick={() => !disabled && onAction('Reb', 0)} disabled={disabled} data-testid="btn-reb">Reb</button>
      <button onClick={() => !disabled && onAction('Ast', 0)} disabled={disabled} data-testid="btn-ast">Ast</button>
      <button onClick={() => !disabled && onAction('Stl', 0)} disabled={disabled} data-testid="btn-stl">Stl</button>
      <button onClick={() => !disabled && onAction('Blk', 0)} disabled={disabled} data-testid="btn-blk">Blk</button>
      <button onClick={() => !disabled && onAction('TO', 0)} disabled={disabled} data-testid="btn-to">TO</button>
      <button onClick={() => !disabled && onAction('Foul', 0)} disabled={disabled} data-testid="btn-foul">Foul</button>
    </div>
  ),
}));

// Mock game data
const mockGameData: GameData = {
  match_id: 'match-123',
  analyst: 'analyst-1',
  date: '2024-01-15',
  status: 'live',
  homeTeam: {
    team_id: 'team-home',
    name: 'Lakers',
    logo: '/lakers-logo.png',
    color: 'blue',
    score: 0,
    timeouts: 7,
    fouls: 0,
    players: [
      { player_id: 'p1', name: 'LeBron James', position: 'SF', jerseyNumber: 23 },
      { player_id: 'p2', name: 'Anthony Davis', position: 'PF', jerseyNumber: 3 },
    ],
  },
  awayTeam: {
    team_id: 'team-away',
    name: 'Heat',
    logo: '/heat-logo.png',
    color: 'red',
    score: 0,
    timeouts: 7,
    fouls: 0,
    players: [
      { player_id: 'p3', name: 'Jimmy Butler', position: 'SF', jerseyNumber: 22 },
      { player_id: 'p4', name: 'Bam Adebayo', position: 'C', jerseyNumber: 13 },
    ],
  },
};

describe('BasketballStatTracker', () => {
  let alertMock: jest.SpyInstance;

  beforeEach(() => {
    // Mock alert
    alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    // Mock URL methods
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    // Clean up mocks
    if (alertMock) alertMock.mockRestore();
    // Clean up DOM
    cleanup();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render with game data', () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      expect(screen.getByText('Lakers')).toBeInTheDocument();
      expect(screen.getByText('Heat')).toBeInTheDocument();
    });

    it('should display initial score as 0-0', () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const scores = screen.getAllByText('0');
      expect(scores.length).toBeGreaterThanOrEqual(2);
    });

    it('should render both team player cards', () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      expect(screen.getByTestId('team-player-card-blue')).toBeInTheDocument();
      expect(screen.getByTestId('team-player-card-red')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
    });

    it('should render game history section', () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      expect(screen.getByTestId('game-history')).toBeInTheDocument();
    });

    it('should render Save Game button', () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      expect(screen.getByText('Save Game')).toBeInTheDocument();
    });

    it('should render Back button when onBack is provided', () => {
      const onBack = jest.fn();
      render(<BasketballStatTracker gameData={mockGameData} onBack={onBack} />);
      
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('should not render Back button when onBack is not provided', () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      expect(screen.queryByText('Back')).not.toBeInTheDocument();
    });
  });

  describe('Player Selection', () => {
    it('should allow selecting a player', async () => {
      const user = userEvent.setup();
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const playerButton = screen.getByTestId('player-p1');
      await user.click(playerButton);
      
      expect(playerButton).toHaveClass('selected');
    });

    it('should deselect player when clicked again', async () => {
      const user = userEvent.setup();
      const { container } = render(<BasketballStatTracker gameData={mockGameData} />);
      
      const playerButton = screen.getByTestId('player-p1');
      
      // First click - select
      await user.click(playerButton);
      expect(playerButton).toHaveClass('selected');
      
      // Second click - deselect (component sets to "")
      await user.click(playerButton);
      
      // Wait for state update
      await waitFor(() => {
        expect(playerButton).not.toHaveClass('selected');
      });
    });

    it('should only allow one player to be selected at a time', async () => {
      const user = userEvent.setup();
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const player1 = screen.getByTestId('player-p1');
      const player2 = screen.getByTestId('player-p2');
      
      await user.click(player1);
      expect(player1).toHaveClass('selected');
      
      await user.click(player2);
      expect(player2).toHaveClass('selected');
      expect(player1).not.toHaveClass('selected');
    });
  });

  describe('Stat Tracking - Scoring', () => {
    it('should track free throws correctly', async () => {
      const user = userEvent.setup();
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      await user.click(screen.getByTestId('player-p1'));
      await user.click(screen.getByTestId('btn-ft'));
      
      // Check if score updated
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should track 2-point field goals correctly', async () => {
      const user = userEvent.setup();
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      await user.click(screen.getByTestId('player-p1'));
      await user.click(screen.getByTestId('btn-2pt'));
      
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should track 3-point field goals correctly', async () => {
      const user = userEvent.setup();
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      await user.click(screen.getByTestId('player-p1'));
      await user.click(screen.getByTestId('btn-3pt'));
      
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should accumulate points correctly', async () => {
      const user = userEvent.setup();
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      await user.click(screen.getByTestId('player-p1'));
      await user.click(screen.getByTestId('btn-2pt'));
      await user.click(screen.getByTestId('btn-3pt'));
      
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should update correct team score', async () => {
      const user = userEvent.setup();
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      // Home team scores
      await user.click(screen.getByTestId('player-p1'));
      await user.click(screen.getByTestId('btn-2pt'));
      
      // Away team scores
      await user.click(screen.getByTestId('player-p3'));
      await user.click(screen.getByTestId('btn-3pt'));
      
      const scores = screen.getAllByText(/[0-9]+/);
      expect(scores.some(el => el.textContent === '2')).toBe(true);
      expect(scores.some(el => el.textContent === '3')).toBe(true);
    });
  });

  describe('Stat Tracking - Non-Scoring', () => {
    it('should track rebounds without affecting score', async () => {
      const user = userEvent.setup();
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      await user.click(screen.getByTestId('player-p1'));
      await user.click(screen.getByTestId('btn-reb'));
      
      // Score should still be 0
      const scores = screen.getAllByText('0');
      expect(scores.length).toBeGreaterThanOrEqual(2);
    });

    it('should track assists', async () => {
      const user = userEvent.setup();
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      await user.click(screen.getByTestId('player-p1'));
      await user.click(screen.getByTestId('btn-ast'));
      
      // Event should be added to history
      await waitFor(() => {
        expect(screen.getByText(/LeBron James - Ast/)).toBeInTheDocument();
      });
    });

    it('should track steals', async () => {
      const user = userEvent.setup();
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      await user.click(screen.getByTestId('player-p1'));
      await user.click(screen.getByTestId('btn-stl'));
      
      await waitFor(() => {
        expect(screen.getByText(/LeBron James - Stl/)).toBeInTheDocument();
      });
    });

    it('should track blocks', async () => {
      const user = userEvent.setup();
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      await user.click(screen.getByTestId('player-p2'));
      await user.click(screen.getByTestId('btn-blk'));
      
      await waitFor(() => {
        expect(screen.getByText(/Anthony Davis - Blk/)).toBeInTheDocument();
      });
    });

    it('should track turnovers', async () => {
      const user = userEvent.setup();
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      await user.click(screen.getByTestId('player-p1'));
      await user.click(screen.getByTestId('btn-to'));
      
      await waitFor(() => {
        expect(screen.getByText(/LeBron James - TO/)).toBeInTheDocument();
      });
    });

    it('should track fouls', async () => {
      const user = userEvent.setup();
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      await user.click(screen.getByTestId('player-p1'));
      await user.click(screen.getByTestId('btn-foul'));
      
      await waitFor(() => {
        expect(screen.getByText(/LeBron James - Foul/)).toBeInTheDocument();
      });
    });
  });

  describe('Game Events', () => {
    it('should show alert when no player is selected', async () => {
      const user = userEvent.setup();
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      // Click action button without selecting a player
      await user.click(screen.getByTestId('btn-2pt'));
      
      // Wait for alert to be called
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Please select a player first');
      });
    });

    it('should add events to game history', async () => {
      const user = userEvent.setup();
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      await user.click(screen.getByTestId('player-p1'));
      await user.click(screen.getByTestId('btn-2pt'));
      await user.click(screen.getByTestId('btn-reb'));
      
      await waitFor(() => {
        const history = screen.getByTestId('game-history');
        expect(within(history).getByText(/LeBron James - \+2 FG/)).toBeInTheDocument();
        expect(within(history).getByText(/LeBron James - Reb/)).toBeInTheDocument();
      });
    });

    it('should display events in reverse chronological order', async () => {
      const user = userEvent.setup();
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      await user.click(screen.getByTestId('player-p1'));
      await user.click(screen.getByTestId('btn-2pt'));
      await user.click(screen.getByTestId('btn-3pt'));
      
      await waitFor(() => {
        const history = screen.getByTestId('game-history');
        const events = within(history).getAllByText(/LeBron James/);
        // Most recent event should contain +3 FG
        expect(events[0].textContent).toContain('+3 FG');
      });
    });
  });

  describe('Back Button', () => {
    it('should call onBack when Back button is clicked', async () => {
      const user = userEvent.setup();
      const onBack = jest.fn();
      render(<BasketballStatTracker gameData={mockGameData} onBack={onBack} />);
      
      await user.click(screen.getByText('Back'));
      
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Save Functionality', () => {
    it('should call onSave with complete game data when provided', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn();
      render(<BasketballStatTracker gameData={mockGameData} onSave={onSave} />);
      
      await user.click(screen.getByTestId('player-p1'));
      await user.click(screen.getByTestId('btn-2pt'));
      
      await user.click(screen.getByText('Save Game'));
      
      expect(onSave).toHaveBeenCalledTimes(1);
      const savedData = onSave.mock.calls[0][0];
      expect(savedData).toHaveProperty('match_id', 'match-123');
      expect(savedData).toHaveProperty('homeTeam');
      expect(savedData).toHaveProperty('awayTeam');
      expect(savedData).toHaveProperty('events');
      expect(savedData).toHaveProperty('finalScore');
    });

    it('should include player stats in saved data', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn();
      render(<BasketballStatTracker gameData={mockGameData} onSave={onSave} />);
      
      await user.click(screen.getByTestId('player-p1'));
      await user.click(screen.getByTestId('btn-2pt'));
      
      await user.click(screen.getByText('Save Game'));
      
      const savedData = onSave.mock.calls[0][0];
      const player1Stats = savedData.homeTeam.players[0].stats;
      expect(player1Stats.points).toBe(2);
      expect(player1Stats.twoPointsMade).toBe(1);
    });

    it('should download JSON file when onSave is not provided', async () => {
      const user = userEvent.setup();
      const createElementSpy = jest.spyOn(document, 'createElement');
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
      
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      await user.click(screen.getByText('Save Game'));
      
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
      
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('should include correct final score in saved data', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn();
      render(<BasketballStatTracker gameData={mockGameData} onSave={onSave} />);
      
      await user.click(screen.getByTestId('player-p1'));
      await user.click(screen.getByTestId('btn-2pt'));
      
      await user.click(screen.getByTestId('player-p3'));
      await user.click(screen.getByTestId('btn-3pt'));
      
      await user.click(screen.getByText('Save Game'));
      
      const savedData = onSave.mock.calls[0][0];
      expect(savedData.finalScore).toBe('2-3');
    });
  });

  describe('Player Stats Calculation', () => {
    it('should calculate shooting percentages correctly', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn();
      render(<BasketballStatTracker gameData={mockGameData} onSave={onSave} />);
      
      await user.click(screen.getByTestId('player-p1'));
      await user.click(screen.getByTestId('btn-2pt'));
      await user.click(screen.getByTestId('btn-2pt'));
      
      await user.click(screen.getByText('Save Game'));
      
      const savedData = onSave.mock.calls[0][0];
      const player1Stats = savedData.homeTeam.players[0].stats;
      expect(player1Stats.twoPointsMade).toBe(2);
      expect(player1Stats.twoPointsAttempted).toBe(2);
      expect(player1Stats.points).toBe(4);
    });

    it('should track multiple stat types for same player', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn();
      render(<BasketballStatTracker gameData={mockGameData} onSave={onSave} />);
      
      await user.click(screen.getByTestId('player-p1'));
      await user.click(screen.getByTestId('btn-2pt'));
      await user.click(screen.getByTestId('btn-reb'));
      await user.click(screen.getByTestId('btn-ast'));
      
      await user.click(screen.getByText('Save Game'));
      
      const savedData = onSave.mock.calls[0][0];
      const player1Stats = savedData.homeTeam.players[0].stats;
      expect(player1Stats.points).toBe(2);
      expect(player1Stats.rebounds).toBe(1);
      expect(player1Stats.assists).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid consecutive actions', async () => {
      const user = userEvent.setup();
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      await user.click(screen.getByTestId('player-p1'));
      await user.click(screen.getByTestId('btn-2pt'));
      await user.click(screen.getByTestId('btn-2pt'));
      await user.click(screen.getByTestId('btn-3pt'));
      
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('should handle switching between players', async () => {
      const user = userEvent.setup();
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      await user.click(screen.getByTestId('player-p1'));
      await user.click(screen.getByTestId('btn-2pt'));
      
      await user.click(screen.getByTestId('player-p2'));
      await user.click(screen.getByTestId('btn-3pt'));
      
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should initialize stats for all players', async () => {
      const onSave = jest.fn();
      render(<BasketballStatTracker gameData={mockGameData} onSave={onSave} />);
      
      const user = userEvent.setup();
      await user.click(screen.getByText('Save Game'));
      
      const savedData = onSave.mock.calls[0][0];
      expect(savedData.homeTeam.players).toHaveLength(2);
      expect(savedData.awayTeam.players).toHaveLength(2);
      savedData.homeTeam.players.forEach((player: any) => {
        expect(player.stats).toBeDefined();
        expect(player.stats.points).toBe(0);
      });
    });
  });
});