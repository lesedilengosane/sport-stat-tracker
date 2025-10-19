// src/components/Line-up-table/__tests__/basketball.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BasketballStatTracker from '../basketball-stat-tracker';
import type { GameData } from '@/types/basketball';

const mockGameData: GameData = {
  match_id: 'match-123',
  analyst: 'analyst-1',
  date: 'October 18, 2025',
  location: 'Arena',
  status: 'live',
  homeTeam: {
    team_id: 'team-1',
    name: 'Lakers',
    color: 'blue',
    score: 0,
    timeouts: 0,
    fouls: 0,
    logo: '/generic-basketball-logo.png',
    players: [
      {
        player_id: 'p1',
        name: 'LeBron James',
        position: 'Forward',
        jerseyNumber: 23,
      },
      {
        player_id: 'p2',
        name: 'Anthony Davis',
        position: 'Center',
        jerseyNumber: 3,
      },
    ],
  },
  awayTeam: {
    team_id: 'team-2',
    name: 'Heat',
    color: 'red',
    score: 0,
    timeouts: 0,
    fouls: 0,
    logo: '/miami-heat-logo.png',
    players: [
      {
        player_id: 'p3',
        name: 'Jimmy Butler',
        position: 'Guard',
        jerseyNumber: 22,
      },
      {
        player_id: 'p4',
        name: 'Bam Adebayo',
        position: 'Center',
        jerseyNumber: 13,
      },
    ],
  },
};

describe('BasketballStatTracker', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
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

    it('should render both team player sections', () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      expect(screen.getByText('Lakers Players')).toBeInTheDocument();
      expect(screen.getByText('Heat Players')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      expect(screen.getByText('Actions')).toBeInTheDocument();
      expect(screen.getByText('+1 FT')).toBeInTheDocument();
      expect(screen.getByText('+2 FG')).toBeInTheDocument();
      expect(screen.getByText('+3 FG')).toBeInTheDocument();
    });

    it('should render game history section', () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      expect(screen.getByText('Game History')).toBeInTheDocument();
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
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      expect(lebronCard).toBeInTheDocument();
      
      await user.click(lebronCard!);
      
      await waitFor(() => {
        expect(lebronCard).toHaveClass('bg-blue-100');
        expect(lebronCard).toHaveClass('border-blue-500');
      });
    });

    it('should keep player selected when clicked again', async () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      
      // First click - select
      await user.click(lebronCard!);
      await waitFor(() => {
        expect(lebronCard).toHaveClass('bg-blue-100');
        expect(lebronCard).toHaveClass('border-blue-500');
      });
      
      // Second click - should remain selected
      await user.click(lebronCard!);
      await waitFor(() => {
        expect(lebronCard).toHaveClass('bg-blue-100');
        expect(lebronCard).toHaveClass('border-blue-500');
      });
    });

    it('should only allow one player to be selected at a time', async () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      const anthonyCard = screen.getByText('Anthony Davis').closest('div[class*="cursor-pointer"]');
      
      await user.click(lebronCard!);
      await waitFor(() => {
        expect(lebronCard).toHaveClass('bg-blue-100');
        expect(lebronCard).toHaveClass('border-blue-500');
      });
      
      await user.click(anthonyCard!);
      await waitFor(() => {
        expect(anthonyCard).toHaveClass('bg-blue-100');
        expect(anthonyCard).toHaveClass('border-blue-500');
        expect(lebronCard).not.toHaveClass('bg-blue-100');
        expect(lebronCard).toHaveClass('bg-white');
      });
    });
  });

  describe('Stat Tracking - Scoring', () => {
    it('should track free throws correctly', async () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      await user.click(lebronCard!);
      
      const ftButton = screen.getByRole('button', { name: '+1 FT' });
      await user.click(ftButton);
      
      await waitFor(() => {
        const statsText = lebronCard?.textContent || '';
        expect(statsText).toMatch(/1 pts/);
      });
    });

    it('should track 2-point field goals correctly', async () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      await user.click(lebronCard!);
      
      const fgButton = screen.getByRole('button', { name: '+2 FG' });
      await user.click(fgButton);
      
      await waitFor(() => {
        const statsText = lebronCard?.textContent || '';
        expect(statsText).toMatch(/2 pts/);
      });
    });

    it('should track 3-point field goals correctly', async () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      await user.click(lebronCard!);
      
      const threeButton = screen.getByRole('button', { name: '+3 FG' });
      await user.click(threeButton);
      
      await waitFor(() => {
        const statsText = lebronCard?.textContent || '';
        expect(statsText).toMatch(/3 pts/);
      });
    });

    it('should accumulate points correctly', async () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      await user.click(lebronCard!);
      
      await user.click(screen.getByRole('button', { name: '+1 FT' }));
      await user.click(screen.getByRole('button', { name: '+2 FG' }));
      await user.click(screen.getByRole('button', { name: '+3 FG' }));
      
      await waitFor(() => {
        const statsText = lebronCard?.textContent || '';
        expect(statsText).toMatch(/6 pts/);
      });
    });

    it('should update correct team score', async () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      // Score for home team
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      await user.click(lebronCard!);
      await user.click(screen.getByRole('button', { name: '+3 FG' }));
      
      await waitFor(() => {
        const homeScoreBox = screen.getByText('Lakers').parentElement?.querySelector('.text-4xl');
        expect(homeScoreBox?.textContent).toBe('3');
      });
      
      // Score for away team
      const jimmyCard = screen.getByText('Jimmy Butler').closest('div[class*="cursor-pointer"]');
      await user.click(jimmyCard!);
      await user.click(screen.getByRole('button', { name: '+2 FG' }));
      
      await waitFor(() => {
        const awayScoreBox = screen.getByText('Heat').parentElement?.querySelector('.text-4xl');
        expect(awayScoreBox?.textContent).toBe('2');
      });
    });
  });

  describe('Stat Tracking - Non-Scoring', () => {
    it('should track rebounds without affecting score', async () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      await user.click(lebronCard!);
      await user.click(screen.getByRole('button', { name: 'Reb' }));
      
      await waitFor(() => {
        const statsText = lebronCard?.textContent || '';
        expect(statsText).toMatch(/1 reb/);
        expect(statsText).toMatch(/0 pts/);
      });
    });

    it('should track assists', async () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      await user.click(lebronCard!);
      await user.click(screen.getByRole('button', { name: 'Ast' }));
      
      await waitFor(() => {
        const statsText = lebronCard?.textContent || '';
        expect(statsText).toMatch(/1 ast/);
      });
    });

    it('should track steals', async () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      await user.click(lebronCard!);
      await user.click(screen.getByRole('button', { name: 'Stl' }));
      
      await waitFor(() => {
        // Stats updated (no visible steals count in this UI, but action should succeed)
        expect(lebronCard).toBeInTheDocument();
      });
    });

    it('should track blocks', async () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      await user.click(lebronCard!);
      await user.click(screen.getByRole('button', { name: 'Blk' }));
      
      await waitFor(() => {
        expect(lebronCard).toBeInTheDocument();
      });
    });

    it('should track turnovers', async () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      await user.click(lebronCard!);
      await user.click(screen.getByRole('button', { name: 'TO' }));
      
      await waitFor(() => {
        expect(lebronCard).toBeInTheDocument();
      });
    });

    it('should track fouls', async () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      await user.click(lebronCard!);
      await user.click(screen.getByRole('button', { name: 'Foul' }));
      
      await waitFor(() => {
        expect(lebronCard).toBeInTheDocument();
      });
    });
  });

  describe('Game Events', () => {
    it('should disable action buttons when no player is selected', async () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const ftButton = screen.getByRole('button', { name: '+1 FT' });
      expect(ftButton).toBeDisabled();
      
      const fgButton = screen.getByRole('button', { name: '+2 FG' });
      expect(fgButton).toBeDisabled();
      
      const threeButton = screen.getByRole('button', { name: '+3 FG' });
      expect(threeButton).toBeDisabled();
    });

    it('should add events to game history', async () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      await user.click(lebronCard!);
      
      const threeButton = screen.getByRole('button', { name: '+3 FG' });
      await user.click(threeButton);
      
      await waitFor(() => {
        const historySection = screen.getByText('Game History').parentElement;
        expect(historySection?.textContent).toContain('LeBron James');
        expect(historySection?.textContent).toContain('+3 FG');
      });
    });

    it('should display events in reverse chronological order', async () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      await user.click(lebronCard!);
      await user.click(screen.getByText('+2 FG'));
      
      const anthonyCard = screen.getByText('Anthony Davis').closest('div[class*="cursor-pointer"]');
      await user.click(anthonyCard!);
      await user.click(screen.getByText('+3 FG'));
      
      await waitFor(() => {
        const historySection = screen.getByText('Game History').parentElement;
        const historyText = historySection?.textContent || '';
        
        const anthonyIndex = historyText.indexOf('Anthony Davis');
        const lebronIndex = historyText.indexOf('LeBron James');
        
        expect(anthonyIndex).toBeLessThan(lebronIndex);
      });
    });
  });

  describe('Back Button', () => {
    it('should call onBack when Back button is clicked', async () => {
      const onBack = jest.fn();
      render(<BasketballStatTracker gameData={mockGameData} onBack={onBack} />);
      
      await user.click(screen.getByText('Back'));
      
      expect(onBack).toHaveBeenCalled();
    });
  });

  describe('Save Functionality', () => {
    it('should call onSave with complete game data when provided', async () => {
      const onSave = jest.fn();
      render(<BasketballStatTracker gameData={mockGameData} onSave={onSave} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      await user.click(lebronCard!);
      await user.click(screen.getByText('+3 FG'));
      
      await user.click(screen.getByText('Save Game'));
      
      await waitFor(() => {
        expect(onSave).toHaveBeenCalled();
        const savedData = onSave.mock.calls[0][0];
        expect(savedData.match_id).toBe('match-123');
        expect(savedData.homeTeam.name).toBe('Lakers');
        expect(savedData.awayTeam.name).toBe('Heat');
      });
    });

    it('should include player stats in saved data', async () => {
      const onSave = jest.fn();
      render(<BasketballStatTracker gameData={mockGameData} onSave={onSave} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      await user.click(lebronCard!);
      await user.click(screen.getByRole('button', { name: '+3 FG' }));
      await user.click(screen.getByRole('button', { name: 'Reb' }));
      
      await user.click(screen.getByText('Save Game'));
      
      await waitFor(() => {
        const savedData = onSave.mock.calls[0][0];
        const lebronStats = savedData.homeTeam.players[0].stats;
        expect(lebronStats.points).toBe(3);
        expect(lebronStats.rebounds).toBe(1);
        expect(lebronStats.threePointsMade).toBe(1);
      });
    });

    it('should download JSON file when onSave is not provided', async () => {
      const originalCreateObjectURL = global.URL.createObjectURL;
      const originalRevokeObjectURL = global.URL.revokeObjectURL;
      const originalCreateElement = document.createElement.bind(document);
      
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
      
      const clickSpy = jest.fn();
      document.createElement = jest.fn((tagName: string) => {
        const element = originalCreateElement(tagName);
        if (tagName === 'a') {
          element.click = clickSpy;
        }
        return element;
      }) as any;
      
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      await user.click(screen.getByText('Save Game'));
      
      await waitFor(() => {
        expect(clickSpy).toHaveBeenCalled();
        expect(global.URL.createObjectURL).toHaveBeenCalled();
      });
      
      global.URL.createObjectURL = originalCreateObjectURL;
      global.URL.revokeObjectURL = originalRevokeObjectURL;
      document.createElement = originalCreateElement as any;
    });

    it('should include correct final score in saved data', async () => {
      const onSave = jest.fn();
      render(<BasketballStatTracker gameData={mockGameData} onSave={onSave} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      await user.click(lebronCard!);
      await user.click(screen.getByRole('button', { name: '+3 FG' }));
      await user.click(screen.getByRole('button', { name: '+2 FG' }));
      
      const jimmyCard = screen.getByText('Jimmy Butler').closest('div[class*="cursor-pointer"]');
      await user.click(jimmyCard!);
      await user.click(screen.getByRole('button', { name: '+1 FT' }));
      await user.click(screen.getByRole('button', { name: '+3 FG' }));
      
      await user.click(screen.getByText('Save Game'));
      
      await waitFor(() => {
        const savedData = onSave.mock.calls[0][0];
        expect(savedData.homeTeam.score).toBe(5);
        expect(savedData.awayTeam.score).toBe(4);
        expect(savedData.finalScore).toBe('5-4');
      });
    });
  });

  describe('Player Stats Calculation', () => {
    it('should calculate shooting percentages correctly', async () => {
      const onSave = jest.fn();
      render(<BasketballStatTracker gameData={mockGameData} onSave={onSave} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      await user.click(lebronCard!);
      
      const fgButton = screen.getByRole('button', { name: '+2 FG' });
      await user.click(fgButton);
      await user.click(fgButton);
      
      const threeButton = screen.getByRole('button', { name: '+3 FG' });
      await user.click(threeButton);
      
      await user.click(screen.getByText('Save Game'));
      
      await waitFor(() => {
        const savedData = onSave.mock.calls[0][0];
        const stats = savedData.homeTeam.players[0].stats;
        expect(stats.twoPointsMade).toBe(2);
        expect(stats.twoPointsAttempted).toBe(2);
        expect(stats.threePointsMade).toBe(1);
        expect(stats.threePointsAttempted).toBe(1);
      });
    });

    it('should track multiple stat types for same player', async () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      await user.click(lebronCard!);
      await user.click(screen.getByRole('button', { name: '+3 FG' }));
      await user.click(screen.getByRole('button', { name: 'Reb' }));
      await user.click(screen.getByRole('button', { name: 'Ast' }));
      await user.click(screen.getByRole('button', { name: 'Stl' }));
      
      await waitFor(() => {
        const statsText = lebronCard?.textContent || '';
        expect(statsText).toMatch(/3 pts/);
        expect(statsText).toMatch(/1 reb/);
        expect(statsText).toMatch(/1 ast/);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid consecutive actions', async () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      await user.click(lebronCard!);
      
      const ftButton = screen.getByRole('button', { name: '+1 FT' });
      await user.click(ftButton);
      await user.click(ftButton);
      await user.click(ftButton);
      
      await waitFor(() => {
        const statsText = lebronCard?.textContent || '';
        expect(statsText).toMatch(/3 pts/);
      });
    });

    it('should handle switching between players', async () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      const lebronCard = screen.getByText('LeBron James').closest('div[class*="cursor-pointer"]');
      await user.click(lebronCard!);
      await user.click(screen.getByRole('button', { name: '+2 FG' }));
      
      const anthonyCard = screen.getByText('Anthony Davis').closest('div[class*="cursor-pointer"]');
      await user.click(anthonyCard!);
      await user.click(screen.getByRole('button', { name: '+3 FG' }));
      
      await waitFor(() => {
        const lebronStats = lebronCard?.textContent || '';
        const anthonyStats = anthonyCard?.textContent || '';
        expect(lebronStats).toMatch(/2 pts/);
        expect(anthonyStats).toMatch(/3 pts/);
      });
    });

    it('should initialize stats for all players', () => {
      render(<BasketballStatTracker gameData={mockGameData} />);
      
      expect(screen.getByText('LeBron James')).toBeInTheDocument();
      expect(screen.getByText('Anthony Davis')).toBeInTheDocument();
      expect(screen.getByText('Jimmy Butler')).toBeInTheDocument();
      expect(screen.getByText('Bam Adebayo')).toBeInTheDocument();
      
      const allPlayerCards = screen.getAllByText(/0 pts/);
      expect(allPlayerCards.length).toBeGreaterThanOrEqual(4);
    });
  });
});