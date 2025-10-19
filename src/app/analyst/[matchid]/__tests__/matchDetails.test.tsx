// app/analyst/[matchid]/__tests__/MatchDetails.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import MatchDetails from '../MatchDetails';

// Mock Supabase client before any imports that use it
jest.mock('../../../api/DatabaseApi/supabaseClient', () => ({
  __esModule: true,
  default: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  },
}));

// Mock AuthContext
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: null,
    signIn: jest.fn(),
    signOut: jest.fn(),
    loading: false,
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock MatchesContext
jest.mock('../../../context/MatchesContext', () => ({
  useMatches: jest.fn(() => ({
    allGames: [],
    loading: false,
    error: null,
    refetch: jest.fn(),
  })),
  MatchesProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock the Tabspage component
jest.mock('../../../../components/line-up-page', () => ({
  Tabspage: ({ homeLineup, awayLineup }: any) => (
    <div data-testid="tabs-page">
      <div data-testid="home-lineup">{JSON.stringify(homeLineup)}</div>
      <div data-testid="away-lineup">{JSON.stringify(awayLineup)}</div>
    </div>
  ),
}));

describe('MatchDetails', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  };

  const mockHomePlayers = [
    {
      id: '1',
      name: 'John',
      surname: 'Doe',
      position: 'Forward',
      avatarUrl: '/avatars/john.jpg',
    },
    {
      id: '2',
      name: 'Jane',
      surname: 'Smith',
      position: 'Midfielder',
      avatarUrl: '/avatars/jane.jpg',
    },
  ];

  const mockAwayPlayers = [
    {
      id: '3',
      name: 'Bob',
      surname: 'Johnson',
      position: 'Defender',
      avatarUrl: '/avatars/bob.jpg',
    },
  ];

  const mockHomeTeam = {
    team_id: 'team-1',
    team_name: 'Home United',
    coach_id: 'coach-1',
    icon_url: '/logos/home.png',
  };

  const mockAwayTeam = {
    team_id: 'team-2',
    team_name: 'Away FC',
    coach_id: 'coach-2',
    icon_url: '/logos/away.png',
  };

  const mockHomePrevMatches = [
    {
      match_id: 'match-1',
      match_date: '2024-03-15',
      location: 'Stadium A',
      home_score: 2,
      away_score: 1,
      status: 'completed',
      home_team_id: 'team-1',
      away_team_id: 'team-3',
    },
  ];

  const mockAwayPrevMatches = [
    {
      match_id: 'match-2',
      match_date: '2024-03-14',
      location: 'Stadium B',
      home_score: 1,
      away_score: 3,
      status: 'completed',
      home_team_id: 'team-4',
      away_team_id: 'team-2',
    },
  ];

  const mockMetadata = {
    idx: 1,
    match_id: 'match-123',
    home_team_id: 'team-1',
    away_team_id: 'team-2',
    location: 'Stadium Name',
    match_date: '2024-03-15',
    match_time: '19:00',
    status: 'scheduled',
    home_score: 0,
    away_score: 0,
    analyst_id: null,
    season: '2024',
    created_at: '2024-03-01T00:00:00Z',
    completed: false,
    analyst: '',
    booked: false,
  };

  const defaultProps = {
    matchId: 'match-123',
    homePlayers: mockHomePlayers,
    awayPlayers: mockAwayPlayers,
    homeTeam: mockHomeTeam,
    awayTeam: mockAwayTeam,
    homePrevMatches: mockHomePrevMatches,
    awayPrevMatches: mockAwayPrevMatches,
    metadata: mockMetadata,
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockPush.mockClear();
  });

  describe('Rendering', () => {
    it('should render the component without crashing', () => {
      render(<MatchDetails {...defaultProps} />);
      expect(screen.getByAltText('Background')).toBeInTheDocument();
    });

    it('should display home team information', () => {
      render(<MatchDetails {...defaultProps} />);
      expect(screen.getByText('Home United')).toBeInTheDocument();
      expect(screen.getByAltText('Home United')).toBeInTheDocument();
    });

    it('should display away team information', () => {
      render(<MatchDetails {...defaultProps} />);
      expect(screen.getByText('Away FC')).toBeInTheDocument();
      expect(screen.getByAltText('Away FC')).toBeInTheDocument();
    });

    it('should display match date from homePrevMatches', () => {
      render(<MatchDetails {...defaultProps} />);
      // The date is formatted as "Fri, 15 March 2024"
      expect(screen.getByText(/15 March 2024/i)).toBeInTheDocument();
    });

    it('should display "Date not specified" when no previous matches', () => {
      const propsWithoutMatches = {
        ...defaultProps,
        homePrevMatches: [],
      };
      render(<MatchDetails {...propsWithoutMatches} />);
      expect(screen.getByText('Date not specified')).toBeInTheDocument();
    });

    it('should render team icons with correct src', () => {
      render(<MatchDetails {...defaultProps} />);
      const homeIcon = screen.getByAltText('Home United');
      const awayIcon = screen.getByAltText('Away FC');
      expect(homeIcon).toHaveAttribute('src', '/logos/home.png');
      expect(awayIcon).toHaveAttribute('src', '/logos/away.png');
    });

    it('should use placeholder when team icon_url is missing', () => {
      const propsWithoutIcons = {
        ...defaultProps,
        homeTeam: { ...mockHomeTeam, icon_url: undefined },
        awayTeam: { ...mockAwayTeam, icon_url: undefined },
      };
      render(<MatchDetails {...propsWithoutIcons} />);
      const homeIcon = screen.getByAltText('Home United');
      const awayIcon = screen.getByAltText('Away FC');
      expect(homeIcon).toHaveAttribute('src', '/placeholder.svg');
      expect(awayIcon).toHaveAttribute('src', '/placeholder.svg');
    });

    it('should render the Tabspage component', () => {
      render(<MatchDetails {...defaultProps} />);
      expect(screen.getByTestId('tabs-page')).toBeInTheDocument();
    });

    it('should pass correct lineups to Tabspage', () => {
      render(<MatchDetails {...defaultProps} />);
      const homeLineupElement = screen.getByTestId('home-lineup');
      const awayLineupElement = screen.getByTestId('away-lineup');
      
      expect(homeLineupElement.textContent).toBe(JSON.stringify(mockHomePlayers));
      expect(awayLineupElement.textContent).toBe(JSON.stringify(mockAwayPlayers));
    });
  });

  describe('State Management', () => {
    it('should initialize homeLineup state with homePlayers', () => {
      render(<MatchDetails {...defaultProps} />);
      const homeLineupElement = screen.getByTestId('home-lineup');
      expect(homeLineupElement.textContent).toBe(JSON.stringify(mockHomePlayers));
    });

    it('should initialize awayLineup state with awayPlayers', () => {
      render(<MatchDetails {...defaultProps} />);
      const awayLineupElement = screen.getByTestId('away-lineup');
      expect(awayLineupElement.textContent).toBe(JSON.stringify(mockAwayPlayers));
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty player arrays', () => {
      const propsWithEmptyPlayers = {
        ...defaultProps,
        homePlayers: [],
        awayPlayers: [],
      };
      render(<MatchDetails {...propsWithEmptyPlayers} />);
      expect(screen.getByTestId('tabs-page')).toBeInTheDocument();
    });

    it('should handle missing optional team properties', () => {
      const propsWithMinimalTeams = {
        ...defaultProps,
        homeTeam: {
          team_id: 'team-1',
          team_name: 'Home Team',
        },
        awayTeam: {
          team_id: 'team-2',
          team_name: 'Away Team',
        },
      };
      render(<MatchDetails {...propsWithMinimalTeams} />);
      expect(screen.getByText('Home Team')).toBeInTheDocument();
      expect(screen.getByText('Away Team')).toBeInTheDocument();
    });

    it('should handle special characters in team names', () => {
      const propsWithSpecialChars = {
        ...defaultProps,
        homeTeam: { ...mockHomeTeam, team_name: "O'Brien's FC" },
        awayTeam: { ...mockAwayTeam, team_name: 'Ñoño & Co.' },
      };
      render(<MatchDetails {...propsWithSpecialChars} />);
      expect(screen.getByText("O'Brien's FC")).toBeInTheDocument();
      expect(screen.getByText('Ñoño & Co.')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text for images', () => {
      render(<MatchDetails {...defaultProps} />);
      expect(screen.getByAltText('Background')).toBeInTheDocument();
      expect(screen.getByAltText('Home United')).toBeInTheDocument();
      expect(screen.getByAltText('Away FC')).toBeInTheDocument();
    });
  });
});