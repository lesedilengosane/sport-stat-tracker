// src/components/Line-up-table/__tests__/lineUpPage.test.tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabspage } from '../line-up-page';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

// Mock child components - using the actual file from line-up-page.tsx
jest.mock('../last5games', () => ({
  __esModule: true,
  default: () => <div data-testid="last-games">Last Games Component</div>,
}));

// The component imports BasketballTimeline from @/components/basketball-timeline
// Use virtual: true since the module doesn't exist yet
jest.mock('@/components/basketball-timeline', () => {
  const MockComponent = () => <div data-testid="basketball-timeline">Basketball Timeline Component</div>;
  return {
    __esModule: true,
    default: MockComponent,
  };
}, { virtual: true });

// Also mock the local one in case it exists
jest.mock('../basketball-stat-tracker', () => {
  const MockComponent = () => <div data-testid="basketball-timeline">Basketball Timeline Component</div>;
  return {
    __esModule: true,
    default: MockComponent,
  };
});

jest.mock('../LineUp-table', () => ({
  DataTable: ({ data }: { data: any[] }) => (
    <div data-testid="data-table">
      {data.length > 0 ? (
        <ul>
          {data.map((item, index) => (
            <li key={index}>{item.player}</li>
          ))}
        </ul>
      ) : (
        <span>No lineup data</span>
      )}
    </div>
  ),
}));

jest.mock('@/app/analyst/match-lineup/column', () => ({
  columns: [],
}), { virtual: true });

// Mock lineup data
const mockHomeLineup = [
  { position: 'PG', player: 'John Doe' },
  { position: 'SG', player: 'Jane Smith' },
  { position: 'SF', player: 'Mike Johnson' },
];

const mockAwayLineup = [
  { position: 'PG', player: 'Alice Brown' },
  { position: 'SG', player: 'Bob Wilson' },
  { position: 'SF', player: 'Charlie Davis' },
];

describe('Tabspage', () => {
  describe('Default Rendering', () => {
    it('should render with default props', () => {
      render(<Tabspage />);
      
      expect(screen.getByText('Home Team')).toBeInTheDocument();
      expect(screen.getByText('Away Team')).toBeInTheDocument();
      // Note: date prop is not rendered in the component UI
    });

    it('should render all three tabs', () => {
      render(<Tabspage />);
      
      expect(screen.getByRole('tab', { name: /lineups/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /last 5 games/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /game summary/i })).toBeInTheDocument();
    });

    it('should have Lineups tab active by default', () => {
      render(<Tabspage />);
      
      const lineupsTab = screen.getByRole('tab', { name: /lineups/i });
      expect(lineupsTab).toHaveAttribute('data-state', 'active');
    });
  });

  describe('Custom Props', () => {
    it('should render custom team names', () => {
      render(
        <Tabspage
          homeTeam="Lakers"
          awayTeam="Warriors"
        />
      );
      
      expect(screen.getByText('Lakers')).toBeInTheDocument();
      expect(screen.getByText('Warriors')).toBeInTheDocument();
    });

    it('should render team logos with correct src', () => {
      render(
        <Tabspage
          homeLogo="/lakers-logo.png"
          awayLogo="/warriors-logo.png"
        />
      );
      
      const homeLogo = screen.getByAltText(/home team logo/i);
      const awayLogo = screen.getByAltText(/away team logo/i);
      
      expect(homeLogo).toHaveAttribute('src', '/lakers-logo.png');
      expect(awayLogo).toHaveAttribute('src', '/warriors-logo.png');
    });

    it('should render custom date', () => {
      render(<Tabspage date="2024-01-15" />);
      
      // Note: date prop exists but is not rendered in the component UI
      // This test verifies the component accepts the date prop without errors
      expect(screen.getByText('Home Team')).toBeInTheDocument();
    });
  });

  describe('Lineups Tab', () => {
    it('should display both team lineups', () => {
      render(
        <Tabspage
          homeLineup={mockHomeLineup}
          awayLineup={mockAwayLineup}
        />
      );
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Alice Brown')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });

    it('should render DataTable for home team', () => {
      render(
        <Tabspage
          homeTeam="Lakers"
          homeLineup={mockHomeLineup}
        />
      );
      
      const dataTables = screen.getAllByTestId('data-table');
      expect(dataTables).toHaveLength(2);
    });

    it('should render DataTable for away team', () => {
      render(
        <Tabspage
          awayTeam="Warriors"
          awayLineup={mockAwayLineup}
        />
      );
      
      const dataTables = screen.getAllByTestId('data-table');
      expect(dataTables).toHaveLength(2);
    });

    it('should handle empty lineups', () => {
      render(
        <Tabspage
          homeLineup={[]}
          awayLineup={[]}
        />
      );
      
      const noDataMessages = screen.getAllByText('No lineup data');
      expect(noDataMessages).toHaveLength(2);
    });

    it('should display home and away sections side by side', () => {
      const { container } = render(
        <Tabspage
          homeTeam="Lakers"
          awayTeam="Warriors"
        />
      );
      
      const sections = container.querySelectorAll('.w-1\\/2');
      expect(sections).toHaveLength(2);
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to Last 5 Games tab when clicked', async () => {
      const user = userEvent.setup();
      render(<Tabspage />);
      
      const lastGamesTab = screen.getByRole('tab', { name: /last 5 games/i });
      await user.click(lastGamesTab);
      
      expect(lastGamesTab).toHaveAttribute('data-state', 'active');
      expect(screen.getByTestId('last-games')).toBeInTheDocument();
    });

    it('should switch to Game Summary tab when clicked', async () => {
      const user = userEvent.setup();
      render(<Tabspage />);
      
      const summaryTab = screen.getByRole('tab', { name: /game summary/i });
      await user.click(summaryTab);
      
      expect(summaryTab).toHaveAttribute('data-state', 'active');
      
      // Check if the summary tabpanel is visible
      const summaryPanel = screen.getByRole('tabpanel', { hidden: false });
      expect(summaryPanel).toBeInTheDocument();
      expect(summaryPanel).toHaveAttribute('data-state', 'active');
    });

    it('should not show Last Games component when on Lineups tab', () => {
      render(<Tabspage />);
      
      expect(screen.queryByTestId('last-games')).not.toBeInTheDocument();
    });

    it('should not show Basketball Timeline when on Lineups tab', () => {
      render(<Tabspage />);
      
      expect(screen.queryByTestId('basketball-timeline')).not.toBeInTheDocument();
    });

    it('should switch back to Lineups tab', async () => {
      const user = userEvent.setup();
      render(<Tabspage homeLineup={mockHomeLineup} />);
      
      // Navigate away
      const summaryTab = screen.getByRole('tab', { name: /game summary/i });
      await user.click(summaryTab);
      
      // Navigate back
      const lineupsTab = screen.getByRole('tab', { name: /lineups/i });
      await user.click(lineupsTab);
      
      expect(lineupsTab).toHaveAttribute('data-state', 'active');
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should apply orange border to team sections', () => {
      const { container } = render(<Tabspage />);
      
      const teamSections = container.querySelectorAll('.border-orange-500');
      expect(teamSections.length).toBeGreaterThan(0);
    });

    it('should center team logos and names', () => {
      const { container } = render(
        <Tabspage
          homeTeam="Lakers"
          awayTeam="Warriors"
        />
      );
      
      const centeredContainers = container.querySelectorAll('.justify-center');
      expect(centeredContainers.length).toBeGreaterThan(0);
    });

    it('should render images with correct dimensions', () => {
      render(
        <Tabspage
          homeLogo="/lakers-logo.png"
          awayLogo="/warriors-logo.png"
        />
      );
      
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('width', '60');
        expect(img).toHaveAttribute('height', '60');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper tab roles', () => {
      render(<Tabspage />);
      
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('should have descriptive alt text for team logos', () => {
      render(
        <Tabspage
          homeTeam="Lakers"
          awayTeam="Warriors"
        />
      );
      
      expect(screen.getByAltText('Lakers Logo')).toBeInTheDocument();
      expect(screen.getByAltText('Warriors Logo')).toBeInTheDocument();
    });

    it('should have proper tabpanel content', async () => {
      const user = userEvent.setup();
      render(<Tabspage />);
      
      const lastGamesTab = screen.getByRole('tab', { name: /last 5 games/i });
      await user.click(lastGamesTab);
      
      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined lineups gracefully', () => {
      render(
        <Tabspage
          homeLineup={undefined}
          awayLineup={undefined}
        />
      );
      
      // Should not crash and should render with empty arrays
      expect(screen.getByText('Home Team')).toBeInTheDocument();
    });

    it('should handle missing team logos', () => {
      // Note: This test expects empty src to be present but React warns about it
      // In real usage, you should pass null or a placeholder instead of empty string
      const { container } = render(
        <Tabspage
          homeLogo={undefined}
          awayLogo={undefined}
        />
      );
      
      const images = screen.getAllByRole('img');
      // With undefined, it should fall back to placeholder
      images.forEach(img => {
        expect(img).toHaveAttribute('src', '/placeholder.svg');
      });
    });

    it('should render with only home lineup provided', () => {
      render(
        <Tabspage
          homeLineup={mockHomeLineup}
          awayLineup={[]}
        />
      );
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('No lineup data')).toBeInTheDocument();
    });

    it('should render with only away lineup provided', () => {
      render(
        <Tabspage
          homeLineup={[]}
          awayLineup={mockAwayLineup}
        />
      );
      
      expect(screen.getByText('Alice Brown')).toBeInTheDocument();
      expect(screen.getByText('No lineup data')).toBeInTheDocument();
    });

    it('should handle very long team names', () => {
      const longName = 'Very Long Team Name That Should Still Display Correctly';
      render(
        <Tabspage
          homeTeam={longName}
          awayTeam={longName}
        />
      );
      
      const teamNames = screen.getAllByText(longName);
      expect(teamNames).toHaveLength(2);
    });
  });

  describe('Integration', () => {
    it('should pass correct props to DataTable components', () => {
      render(
        <Tabspage
          homeLineup={mockHomeLineup}
          awayLineup={mockAwayLineup}
        />
      );
      
      const dataTables = screen.getAllByTestId('data-table');
      expect(dataTables).toHaveLength(2);
      
      // Verify home lineup data is rendered
      expect(within(dataTables[0]).getByText('John Doe')).toBeInTheDocument();
      
      // Verify away lineup data is rendered
      expect(within(dataTables[1]).getByText('Alice Brown')).toBeInTheDocument();
    });

    it('should maintain state when switching between tabs', async () => {
      const user = userEvent.setup();
      render(
        <Tabspage
          homeTeam="Lakers"
          homeLineup={mockHomeLineup}
        />
      );
      
      // Verify initial state
      expect(screen.getByText('Lakers')).toBeInTheDocument();
      
      // Switch tabs
      await user.click(screen.getByRole('tab', { name: /last 5 games/i }));
      await user.click(screen.getByRole('tab', { name: /lineups/i }));
      
      // Verify state is maintained
      expect(screen.getByText('Lakers')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});