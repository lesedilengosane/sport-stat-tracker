import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the Tabspage component and its dependencies
jest.mock('../ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs">{children}</div>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-content">{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-trigger">{children}</div>,
}));

jest.mock('../Line-up-table/LineUp-table', () => ({
  DataTable: ({ data }: { data: any[] }) => <div data-testid="data-table">DataTable with {data.length} items</div>
}));

jest.mock('../../app/analyst/column', () => ({
  columns: [],
  Player_details: {}
}));

// Mock the line-up-page component
const MockedTabspage = jest.fn(({ homeTeam = "Home Team", awayTeam = "Away Team", date }: any) => (
  <div data-testid="tabspage-component">
    <div data-testid="home-team">{homeTeam}</div>
    <div data-testid="away-team">{awayTeam}</div>
    {date && <div data-testid="game-date">{date}</div>}
    <div data-testid="tabs-container">
      <div data-testid="tabs">
        <div data-testid="tabs-list">
          <div data-testid="tabs-trigger">Lineups</div>
          <div data-testid="tabs-trigger">Last 5 games</div>
          <div data-testid="tabs-trigger">Game summary</div>
        </div>
        <div data-testid="tabs-content">
          <div data-testid="data-table">DataTable with 0 items</div>
        </div>
      </div>
    </div>
  </div>
));

jest.mock('../line-up-page', () => ({
  Tabspage: MockedTabspage,
  default: MockedTabspage
}));

// Import the component after mocking its dependencies
import Admindashboard from '../page';

describe('Admindashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(() => {
      render(<Admindashboard />);
    }).not.toThrow();
  });

  it('renders and contains the Tabspage component', () => {
    render(<Admindashboard />);
    expect(screen.getByTestId('tabspage-component')).toBeInTheDocument();
  });

  it('calls Tabspage component', () => {
    render(<Admindashboard />);
    expect(MockedTabspage).toHaveBeenCalledTimes(1);
  });

  it('calls Tabspage with no props (uses defaults)', () => {
    render(<Admindashboard />);
    expect(MockedTabspage).toHaveBeenCalledWith({}, {});
  });

  it('renders default team names', () => {
    render(<Admindashboard />);
    expect(screen.getByTestId('home-team')).toHaveTextContent('Home Team');
    expect(screen.getByTestId('away-team')).toHaveTextContent('Away Team');
  });

  it('renders tabs structure', () => {
    render(<Admindashboard />);
    expect(screen.getByTestId('tabs-container')).toBeInTheDocument();
    expect(screen.getByTestId('tabs')).toBeInTheDocument();
    expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
  });

  it('renders all tab triggers', () => {
    render(<Admindashboard />);
    const tabTriggers = screen.getAllByTestId('tabs-trigger');
    expect(tabTriggers).toHaveLength(3);
    expect(tabTriggers[0]).toHaveTextContent('Lineups');
    expect(tabTriggers[1]).toHaveTextContent('Last 5 games');
    expect(tabTriggers[2]).toHaveTextContent('Game summary');
  });

  it('renders data table', () => {
    render(<Admindashboard />);
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('has correct component structure', () => {
    const { container } = render(<Admindashboard />);
    const tabsPageElement = screen.getByTestId('tabspage-component');
    
    // Check that Tabspage is rendered
    expect(tabsPageElement).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<Admindashboard />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('Admindashboard Component Behavior', () => {
  it('renders consistently on multiple renders', () => {
    const { rerender } = render(<Admindashboard />);
    expect(screen.getByTestId('tabspage-component')).toBeInTheDocument();
    
    // Clear mocks before rerendering to get accurate count
    jest.clearAllMocks();
    rerender(<Admindashboard />);
    expect(screen.getByTestId('tabspage-component')).toBeInTheDocument();
    expect(MockedTabspage).toHaveBeenCalledTimes(1); // Should be 1 after clearing
  });

  it('is a functional component', () => {
    // Check if it's a valid React component (function or object with $$typeof)
    expect(typeof Admindashboard).toBe('function');
  });

  it('exports as default', () => {
    expect(Admindashboard).toBeDefined();
    expect(typeof Admindashboard).toBe('function');
  });
});