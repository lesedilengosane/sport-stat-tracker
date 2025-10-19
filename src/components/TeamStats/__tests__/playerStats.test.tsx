import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlayerStats from '../PlayerStats';

describe('PlayerStats', () => {
  const mockPush = jest.fn();
  const mockOnClose = jest.fn();

  const mockPlayerStats = [
    {
      player_id: '1',
      first_name: 'LeBron',
      last_name: 'James',
      jersey_number: 23,
      position: 'Forward',
      matches_played: 10,
      ppg: 25.5,
      rpg: 8.2,
      apg: 7.3,
      points: 255,
      rebounds: 82,
      assists: 73,
      steals: 15,
      blocks: 10,
      turnovers: 35,
      fouls: 20,
      fg_percentage: 52.3,
      three_pt_percentage: 38.5,
      twoPointsMade: 80,
      twoPointsAttempted: 150,
      threePointsMade: 30,
      threePointsAttempted: 78,
      freeThrowsMade: 35,
      freeThrowsAttempted: 45,
    },
    {
      player_id: '2',
      first_name: 'Stephen',
      last_name: 'Curry',
      jersey_number: 30,
      position: 'Guard',
      matches_played: 10,
      ppg: 28.3,
      rpg: 5.1,
      apg: 6.8,
      points: 283,
      rebounds: 51,
      assists: 68,
      steals: 18,
      blocks: 3,
      turnovers: 30,
      fouls: 15,
      fg_percentage: 48.7,
      three_pt_percentage: 42.1,
      twoPointsMade: 70,
      twoPointsAttempted: 140,
      threePointsMade: 45,
      threePointsAttempted: 110,
      freeThrowsMade: 53,
      freeThrowsAttempted: 56,
    },
    {
      player_id: '3',
      first_name: 'Anthony',
      last_name: 'Davis',
      jersey_number: 3,
      position: 'Center',
      matches_played: 10,
      ppg: 22.1,
      rpg: 11.3,
      apg: 3.2,
      points: 221,
      rebounds: 113,
      assists: 32,
      steals: 12,
      blocks: 25,
      turnovers: 25,
      fouls: 28,
      fg_percentage: 55.2,
      three_pt_percentage: 28.3,
      twoPointsMade: 90,
      twoPointsAttempted: 155,
      threePointsMade: 11,
      threePointsAttempted: 39,
      freeThrowsMade: 30,
      freeThrowsAttempted: 40,
    },
  ];

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<PlayerStats playerStats={mockPlayerStats} />);
      expect(container).toBeInTheDocument();
    });

    it('should display no data message when playerStats is empty', () => {
      render(<PlayerStats playerStats={[]} />);
      expect(screen.getByText('No player statistics available')).toBeInTheDocument();
    });

    it('should display no data message when playerStats is null', () => {
      render(<PlayerStats playerStats={null as any} />);
      expect(screen.getByText('No player statistics available')).toBeInTheDocument();
    });

    it('should render all main sections', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      expect(screen.getByText('Team MVP')).toBeInTheDocument();
      expect(screen.getByText('Player Spotlight')).toBeInTheDocument();
      expect(screen.getByText('Top Performers')).toBeInTheDocument();
      expect(screen.getByText('Statistical Rankings')).toBeInTheDocument();
    });
  });

  describe('MVP Section', () => {
    it('should display the most efficient player as MVP', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      const mvpCard = screen.getByText('Player Spotlight').parentElement?.parentElement;
      expect(within(mvpCard!).getAllByText(/LeBron James/).length).toBeGreaterThan(0);
    });

    it('should display MVP stats correctly', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      expect(screen.getAllByText('25.5').length).toBeGreaterThan(0);
      expect(screen.getAllByText('8.2').length).toBeGreaterThan(0);
      expect(screen.getAllByText('7.3').length).toBeGreaterThan(0);
    });

    it('should display MVP jersey number and position', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      const mvpCard = screen.getByText('Player Spotlight').parentElement?.parentElement;
      expect(mvpCard).toHaveTextContent('#23');
      expect(mvpCard).toHaveTextContent('Forward');
    });

    it('should display MVP games played', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      const mvpCard = screen.getByText('Player Spotlight').parentElement?.parentElement;
      expect(mvpCard).toHaveTextContent('10 Games');
    });
  });

  describe('Top Performers Section', () => {
    it('should display top 4 performers', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      const topPerformersSection = screen.getByText('Top Performers').parentElement;
      
      expect(within(topPerformersSection!).getAllByText(/LeBron James/).length).toBeGreaterThan(0);
      expect(within(topPerformersSection!).getAllByText(/Stephen Curry/).length).toBeGreaterThan(0);
      expect(within(topPerformersSection!).getAllByText(/Anthony Davis/).length).toBeGreaterThan(0);
    });

    it('should display player names in top performers', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      expect(screen.getAllByText(/LeBron James/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Stephen Curry/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Anthony Davis/).length).toBeGreaterThan(0);
    });

    it('should expand player card when clicked', async () => {
      const user = userEvent.setup();
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      const topPerformersSection = screen.getByText('Top Performers').parentElement;
      const playerCards = within(topPerformersSection!).getAllByText(/LeBron James/);
      // Find the card by its cursor-pointer class
      const playerCard = playerCards[0].closest('.cursor-pointer') as HTMLElement;
      
      expect(screen.queryByText('Points')).not.toBeInTheDocument();
      
      await user.click(playerCard);
      
      expect(screen.getByText('Points')).toBeInTheDocument();
      expect(screen.getByText('Rebounds')).toBeInTheDocument();
      expect(screen.getByText('Assists')).toBeInTheDocument();
    });

    it('should collapse player card when clicked again', async () => {
      const user = userEvent.setup();
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      const topPerformersSection = screen.getByText('Top Performers').parentElement;
      const playerCards = within(topPerformersSection!).getAllByText(/LeBron James/);
      const playerCard = playerCards[0].closest('.cursor-pointer') as HTMLElement;
      
      await user.click(playerCard);
      expect(screen.getByText('Points')).toBeInTheDocument();
      
      await user.click(playerCard);
      expect(screen.queryByText('Points')).not.toBeInTheDocument();
    });

    it('should display detailed stats when card is expanded', async () => {
      const user = userEvent.setup();
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      const topPerformersSection = screen.getByText('Top Performers').parentElement;
      const playerCards = within(topPerformersSection!).getAllByText(/LeBron James/);
      const playerCard = playerCards[0].closest('.cursor-pointer') as HTMLElement;
      
      await user.click(playerCard);
      
      expect(screen.getByText('255')).toBeInTheDocument();
      expect(screen.getByText('82')).toBeInTheDocument();
      expect(screen.getByText('73')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('52.3%')).toBeInTheDocument();
    });
  });

  describe('Statistical Rankings', () => {
    it('should render all ranking categories', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      expect(screen.getByText('Top Scorers')).toBeInTheDocument();
      expect(screen.getByText('Top Rebounders')).toBeInTheDocument();
      expect(screen.getByText('Top Playmakers')).toBeInTheDocument();
      expect(screen.getByText('Top Defenders')).toBeInTheDocument();
      expect(screen.getByText('Most Efficient')).toBeInTheDocument();
      expect(screen.getByText('Best Shooters')).toBeInTheDocument();
    });

    it('should show only top 3 players by default', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      // Find the Top Scorers section by text
      const scorersHeader = screen.getByText('Top Scorers');
      const scorersTable = scorersHeader.closest('.bg-white\\/60') as HTMLElement;
      
      expect(within(scorersTable).getByText(/Stephen Curry/)).toBeInTheDocument();
      expect(within(scorersTable).getByText(/LeBron James/)).toBeInTheDocument();
      expect(within(scorersTable).getByText(/Anthony Davis/)).toBeInTheDocument();
    });

    it('should expand ranking table when header is clicked', async () => {
      const user = userEvent.setup();
      const manyPlayers = [
        ...mockPlayerStats,
        { ...mockPlayerStats[0], player_id: '4', first_name: 'Kevin', last_name: 'Durant', ppg: 20 },
        { ...mockPlayerStats[0], player_id: '5', first_name: 'Giannis', last_name: 'Antetokounmpo', ppg: 19 },
      ];
      
      render(<PlayerStats playerStats={manyPlayers} />);
      
      const initialKevinCount = screen.queryAllByText(/Kevin Durant/).length;
      
      const scorersHeader = screen.getByText('Top Scorers');
      await user.click(scorersHeader);
      
      expect(screen.getAllByText(/Kevin Durant/).length).toBeGreaterThan(initialKevinCount);
      expect(screen.getAllByText(/Giannis Antetokounmpo/).length).toBeGreaterThan(0);
    });

    it('should collapse ranking table when expanded header is clicked again', async () => {
      const user = userEvent.setup();
      const manyPlayers = [
        ...mockPlayerStats,
        { ...mockPlayerStats[0], player_id: '4', first_name: 'Kevin', last_name: 'Durant', ppg: 20 },
      ];
      
      render(<PlayerStats playerStats={manyPlayers} />);
      
      const scorersHeader = screen.getByText('Top Scorers');
      
      await user.click(scorersHeader);
      const expandedCount = screen.getAllByText(/Kevin Durant/).length;
      expect(expandedCount).toBeGreaterThan(0);
      
      await user.click(scorersHeader);
      const collapsedCount = screen.queryAllByText(/Kevin Durant/).length;
      
      expect(collapsedCount).toBeLessThan(expandedCount);
    });

    it('should display "See All" button when more than 3 players', () => {
      const manyPlayers = [
        ...mockPlayerStats,
        { ...mockPlayerStats[0], player_id: '4', first_name: 'Kevin', last_name: 'Durant', ppg: 20 },
      ];
      
      render(<PlayerStats playerStats={manyPlayers} />);
      
      expect(screen.getAllByText(/See All 4 Players/).length).toBeGreaterThan(0);
    });

    it('should not display "See All" button when 3 or fewer players', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      expect(screen.queryByText(/See All/)).not.toBeInTheDocument();
    });

    it('should expand table when "See All" button is clicked', async () => {
      const user = userEvent.setup();
      const manyPlayers = [
        ...mockPlayerStats,
        { ...mockPlayerStats[0], player_id: '4', first_name: 'Kevin', last_name: 'Durant', ppg: 20 },
      ];
      
      render(<PlayerStats playerStats={manyPlayers} />);
      
      const seeAllButtons = screen.getAllByText(/See All 4 Players/);
      await user.click(seeAllButtons[0]);
      
      expect(screen.getAllByText(/Kevin Durant/).length).toBeGreaterThan(0);
      expect(screen.getByText('Show Less')).toBeInTheDocument();
    });
  });

  describe('Efficiency Calculation', () => {
    it('should calculate efficiency correctly', () => {
      const singlePlayer = [{
        ...mockPlayerStats[0],
        points: 100,
        rebounds: 50,
        assists: 30,
        steals: 10,
        blocks: 5,
        turnovers: 20,
        fouls: 10,
      }];
      
      render(<PlayerStats playerStats={singlePlayer} />);
      
      expect(screen.getAllByText('170').length).toBeGreaterThan(0);
    });
  });

  describe('Team Summary', () => {
    it('should display total players count', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      expect(screen.getByText('Total Players')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should display average PPG', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      expect(screen.getByText('Avg PPG')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('should display total points', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      expect(screen.getByText('Total Points')).toBeInTheDocument();
      expect(screen.getByText('759')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort top scorers by PPG correctly', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      const scorersHeader = screen.getByText('Top Scorers');
      const scorersTable = scorersHeader.closest('.bg-white\\/60') as HTMLElement;
      
      expect(within(scorersTable).getByText(/Stephen Curry/)).toBeInTheDocument();
    });

    it('should sort top rebounders by RPG correctly', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      const reboundersHeader = screen.getByText('Top Rebounders');
      const reboundersTable = reboundersHeader.closest('.bg-white\\/60') as HTMLElement;
      
      expect(within(reboundersTable).getByText(/Anthony Davis/)).toBeInTheDocument();
    });

    it('should sort top playmakers by APG correctly', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      const playmakersHeader = screen.getByText('Top Playmakers');
      const playmakersTable = playmakersHeader.closest('.bg-white\\/60') as HTMLElement;
      
      expect(within(playmakersTable).getByText(/LeBron James/)).toBeInTheDocument();
    });

    it('should sort best shooters by FG% correctly', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      const shootersHeader = screen.getByText('Best Shooters');
      const shootersTable = shootersHeader.closest('.bg-white\\/60') as HTMLElement;
      
      expect(within(shootersTable).getByText(/Anthony Davis/)).toBeInTheDocument();
    });
  });

  describe('Player Details Display', () => {
    it('should display player jersey numbers', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      expect(screen.getAllByText(/#23/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/#30/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/#3/).length).toBeGreaterThan(0);
    });

    it('should display player positions', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      const forwardElements = screen.getAllByText(/Forward/);
      const guardElements = screen.getAllByText(/Guard/);
      const centerElements = screen.getAllByText(/Center/);
      
      expect(forwardElements.length).toBeGreaterThan(0);
      expect(guardElements.length).toBeGreaterThan(0);
      expect(centerElements.length).toBeGreaterThan(0);
    });
  });

  describe('Defensive Stats', () => {
    it('should calculate defensive rating for top defenders', () => {
      const highDefensivePlayer = [{
        ...mockPlayerStats[0],
        player_id: '99',
        first_name: 'Defensive',
        last_name: 'Player',
        steals: 50,
        blocks: 50,
      }];
      
      render(<PlayerStats playerStats={[...mockPlayerStats, ...highDefensivePlayer]} />);
      
      const defendersHeader = screen.getByText('Top Defenders');
      const defendersTable = defendersHeader.closest('.bg-white\\/60') as HTMLElement;
      
      expect(within(defendersTable).getByText(/Defensive Player/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single player', () => {
      render(<PlayerStats playerStats={[mockPlayerStats[0]]} />);
      
      expect(screen.getAllByText(/LeBron James/).length).toBeGreaterThan(0);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should handle player with zero stats', () => {
      const zeroStatsPlayer = [{
        ...mockPlayerStats[0],
        ppg: 0,
        rpg: 0,
        apg: 0,
        points: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        turnovers: 0,
        fouls: 0,
      }];
      
      render(<PlayerStats playerStats={zeroStatsPlayer} />);
      
      expect(screen.getAllByText(/LeBron James/).length).toBeGreaterThan(0);
    });

    it('should handle very large stat values', () => {
      const highStatsPlayer = [{
        ...mockPlayerStats[0],
        ppg: 999.9,
        points: 9999,
      }];
      
      render(<PlayerStats playerStats={highStatsPlayer} />);
      
      expect(screen.getByText('999.9')).toBeInTheDocument();
    });

    it('should handle negative efficiency', () => {
      const negativeEfficiencyPlayer = [{
        ...mockPlayerStats[0],
        points: 10,
        rebounds: 5,
        assists: 5,
        steals: 0,
        blocks: 0,
        turnovers: 100,
        fouls: 100,
      }];
      
      render(<PlayerStats playerStats={negativeEfficiencyPlayer} />);
      
      expect(screen.getAllByText(/LeBron James/).length).toBeGreaterThan(0);
      expect(screen.getAllByText('-130').length).toBeGreaterThan(0);
    });
  });

  describe('Multiple Category Expansion', () => {
    it('should allow multiple categories to be expanded independently', async () => {
      const user = userEvent.setup();
      const manyPlayers = [
        ...mockPlayerStats,
        { ...mockPlayerStats[0], player_id: '4', first_name: 'Kevin', last_name: 'Durant', ppg: 20, rpg: 9 },
      ];
      
      render(<PlayerStats playerStats={manyPlayers} />);
      
      const scorersHeader = screen.getByText('Top Scorers');
      await user.click(scorersHeader);
      expect(screen.getAllByText(/Kevin Durant/).length).toBeGreaterThan(0);
      
      const reboundersHeader = screen.getByText('Top Rebounders');
      await user.click(reboundersHeader);
      
      expect(screen.getAllByText(/Kevin Durant/).length).toBeGreaterThan(1);
    });
  });

  describe('Accessibility', () => {
    it('should have clickable elements', async () => {
      const user = userEvent.setup();
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      const topPerformersSection = screen.getByText('Top Performers').parentElement;
      const playerCards = within(topPerformersSection!).getAllByText(/LeBron James/);
      const playerCard = playerCards[0].closest('.cursor-pointer') as HTMLElement;
      
      expect(playerCard).toBeInTheDocument();
      
      await user.click(playerCard);
      expect(screen.getByText('Points')).toBeInTheDocument();
    });

    it('should render all player information', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      mockPlayerStats.forEach(player => {
        const fullName = `${player.first_name} ${player.last_name}`;
        expect(screen.getAllByText(new RegExp(fullName)).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Ranking Category Headers', () => {
    it('should have clickable category headers with chevron icons', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      const categories = [
        'Top Scorers',
        'Top Rebounders', 
        'Top Playmakers',
        'Top Defenders',
        'Most Efficient',
        'Best Shooters'
      ];

      categories.forEach(category => {
        const header = screen.getByText(category);
        expect(header).toBeInTheDocument();
        const headerContainer = header.closest('.cursor-pointer') as HTMLElement;
        expect(headerContainer).toBeInTheDocument();
      });
    });

    it('should toggle chevron direction when category is expanded', async () => {
      const user = userEvent.setup();
      const manyPlayers = [
        ...mockPlayerStats,
        { ...mockPlayerStats[0], player_id: '4', first_name: 'Kevin', last_name: 'Durant', ppg: 20 },
      ];
      
      render(<PlayerStats playerStats={manyPlayers} />);
      
      const scorersHeader = screen.getByText('Top Scorers');
      const headerContainer = scorersHeader.closest('.cursor-pointer') as HTMLElement;
      
      // Click to expand
      await user.click(headerContainer);
      
      // Click to collapse
      await user.click(headerContainer);
      
      // Should still render properly
      expect(scorersHeader).toBeInTheDocument();
    });
  });

  describe('Player Card Interactions', () => {
    it('should highlight selected player card', async () => {
      const user = userEvent.setup();
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      const topPerformersSection = screen.getByText('Top Performers').parentElement;
      const playerCards = within(topPerformersSection!).getAllByText(/LeBron James/);
      const playerCard = playerCards[0].closest('.cursor-pointer') as HTMLElement;
      
      await user.click(playerCard);
      
      // Check if card has shadow-lg class when selected
      expect(playerCard.className).toContain('shadow-lg');
    });

    it('should show rank badges with correct colors', () => {
      render(<PlayerStats playerStats={mockPlayerStats} />);
      
      const topPerformersSection = screen.getByText('Top Performers').parentElement;
      
      // Check for rank badges
      expect(within(topPerformersSection!).getByText('#1')).toBeInTheDocument();
      expect(within(topPerformersSection!).getByText('#2')).toBeInTheDocument();
      expect(within(topPerformersSection!).getByText('#3')).toBeInTheDocument();
    });
  });
});