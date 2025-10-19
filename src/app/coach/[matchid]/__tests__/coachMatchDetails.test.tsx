import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import MatchDetails from '../MatchDetails';
import { useAuth } from '../../../context/AuthContext';
import { useMatches } from '../../../context/MatchesContext';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../context/MatchesContext', () => ({
  useMatches: jest.fn(),
}));

jest.mock('../../../../components/line-up-page', () => ({
  Tabspage: jest.fn(() => <div data-testid="tabspage">Tabspage Component</div>),
}));

describe('MatchDetails Component', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockHomePlayers = [
    {
      id: 'player-1',
      name: 'John',
      surname: 'Doe',
      position: 'Guard',
      avatarUrl: '/avatars/john.jpg',
    },
    {
      id: 'player-2',
      name: 'Jane',
      surname: 'Smith',
      position: 'Forward',
      avatarUrl: '/avatars/jane.jpg',
    },
  ];

  const mockAwayPlayers = [
    {
      id: 'player-3',
      name: 'Bob',
      surname: 'Johnson',
      position: 'Center',
      avatarUrl: '/avatars/bob.jpg',
    },
  ];

  const mockHomeTeam = {
    team_id: 'team-1',
    team_name: 'Home Team',
    icon_url: '/teams/home.png',
  };

  const mockAwayTeam = {
    team_id: 'team-2',
    team_name: 'Away Team',
    icon_url: '/teams/away.png',
  };

  const mockHomePrevMatches = [
    {
      match_id: 'prev-1',
      match_date: '2025-10-19T14:30:00Z',
      home_score: 90,
      away_score: 85,
    },
  ];

  const mockAwayPrevMatches = [
    {
      match_id: 'prev-2',
      match_date: '2025-10-18T16:00:00Z',
      home_score: 78,
      away_score: 82,
    },
  ];

  const mockMatchEvents = [
    { id: 1, type: 'goal', time: '10:30' },
  ];

  const mockMetadata = {
    idx: 1,
    match_id: 'match-123',
    home_team_id: 'team-1',
    away_team_id: 'team-2',
    match_date: '2025-10-19T14:30:00Z',
    location: 'Test Arena',
    home_score: 0,
    away_score: 0,
    status: 'scheduled',
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2025-10-01T10:00:00Z',
    completed: false,
    season: '2025',
    analyst: 'analyst-123',
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
    MatchEvents: mockMatchEvents,
    metadata: mockMetadata,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({
      user: { auth_user_id: 'user-123' },
    });
    (useMatches as jest.Mock).mockReturnValue({
      allGames: [],
    });
  });

  it('should render without crashing', () => {
    render(<MatchDetails {...defaultProps} />);
    expect(screen.getByTestId('tabspage')).toBeInTheDocument();
  });

  it('should display home team information', () => {
    const { container } = render(<MatchDetails {...defaultProps} />);
    expect(screen.getByText('Home Team')).toBeInTheDocument();
    const homeTeamImage = container.querySelector('img[alt="Home Team"]');
    expect(homeTeamImage).toHaveAttribute('src', '/teams/home.png');
  });

  it('should display away team information', () => {
    const { container } = render(<MatchDetails {...defaultProps} />);
    expect(screen.getByText('Away Team')).toBeInTheDocument();
    const awayTeamImage = container.querySelector('img[alt="Away Team"]');
    expect(awayTeamImage).toHaveAttribute('src', '/teams/away.png');
  });

  it('should display formatted match date and time', () => {
    render(<MatchDetails {...defaultProps} />);
    
    // Check that some date text is displayed
    const dateElements = screen.getAllByText(/2025|October|Oct/i);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('should display "Date not specified" when no match date is available', () => {
    const propsWithoutDate = {
      ...defaultProps,
      homePrevMatches: [],
    };
    
    render(<MatchDetails {...propsWithoutDate} />);
    expect(screen.getByText('Date not specified')).toBeInTheDocument();
  });

  it('should render background image', () => {
    const { container } = render(<MatchDetails {...defaultProps} />);
    const backgroundImage = container.querySelector('img[alt="Background"]');
    expect(backgroundImage).toBeInTheDocument();
    expect(backgroundImage).toHaveAttribute('src', '/background/gameCard.jpeg');
  });

  it('should render Tabspage component with correct props', () => {
    const { Tabspage } = require('../../../../components/line-up-page');
    render(<MatchDetails {...defaultProps} />);

    expect(Tabspage).toHaveBeenCalledWith(
      expect.objectContaining({
        homeLineup: mockHomePlayers,
        awayLineup: mockAwayPlayers,
        homeTeam: 'Home Team',
        homeTeamID: 'team-1',
        awayTeamID: 'team-2',
        awayTeam: 'Away Team',
        homeLogo: '/teams/home.png',
        awayLogo: '/teams/away.png',
        homePrevMatches: mockHomePrevMatches,
        awayPrevMatches: mockAwayPrevMatches,
        MatchEvents: mockMatchEvents,
        metadata: mockMetadata,
      }),
      undefined
    );
  });

  it('should not display Open Tracker button when game is not booked', () => {
    (useMatches as jest.Mock).mockReturnValue({
      allGames: [
        {
          match_id: 'match-123',
          booked: false,
          completed: false,
          analyst: 'user-123',
        },
      ],
    });

    render(<MatchDetails {...defaultProps} />);
    expect(screen.queryByText('Open Tracker')).not.toBeInTheDocument();
  });

  it('should not display Open Tracker button when game is completed', () => {
    (useMatches as jest.Mock).mockReturnValue({
      allGames: [
        {
          match_id: 'match-123',
          booked: true,
          completed: true,
          analyst: 'user-123',
        },
      ],
    });

    render(<MatchDetails {...defaultProps} />);
    expect(screen.queryByText('Open Tracker')).not.toBeInTheDocument();
  });

  it('should not display Open Tracker button when user is not the analyst', () => {
    (useMatches as jest.Mock).mockReturnValue({
      allGames: [
        {
          match_id: 'match-123',
          booked: true,
          completed: false,
          analyst: 'different-user',
        },
      ],
    });

    render(<MatchDetails {...defaultProps} />);
    expect(screen.queryByText('Open Tracker')).not.toBeInTheDocument();
  });

  it('should display Open Tracker button when conditions are met', () => {
    (useMatches as jest.Mock).mockReturnValue({
      allGames: [
        {
          match_id: 'match-123',
          booked: true,
          completed: false,
          analyst: 'user-123',
        },
      ],
    });

    render(<MatchDetails {...defaultProps} />);
    expect(screen.getByText('Open Tracker')).toBeInTheDocument();
  });

  it('should navigate to tracker page with correct params when Open Tracker is clicked', () => {
    (useMatches as jest.Mock).mockReturnValue({
      allGames: [
        {
          match_id: 'match-123',
          booked: true,
          completed: false,
          analyst: 'user-123',
        },
      ],
    });

    render(<MatchDetails {...defaultProps} />);
    
    const openTrackerButton = screen.getByText('Open Tracker');
    fireEvent.click(openTrackerButton);

    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringContaining('/coach/match-123/tracker?')
    );
    
    const callArg = mockRouter.push.mock.calls[0][0];
    expect(callArg).toContain('gameId=match-123');
    expect(callArg).toContain('homeTeamId=team-1');
    expect(callArg).toContain('awayTeamId=team-2');
    expect(callArg).toContain('homeTeam=Home+Team');
    expect(callArg).toContain('awayTeam=Away+Team');
  });

  it('should use placeholder images when team icons are not provided', () => {
    const propsWithoutIcons = {
      ...defaultProps,
      homeTeam: { ...mockHomeTeam, icon_url: undefined },
      awayTeam: { ...mockAwayTeam, icon_url: undefined },
    };

    const { container } = render(<MatchDetails {...propsWithoutIcons} />);
    
    const homeTeamImage = container.querySelector('img[alt="Home Team"]');
    const awayTeamImage = container.querySelector('img[alt="Away Team"]');
    
    expect(homeTeamImage).toHaveAttribute('src', '/placeholder.svg');
    expect(awayTeamImage).toHaveAttribute('src', '/placeholder.svg');
  });

  it('should handle undefined homePrevMatches gracefully', () => {
    const propsWithoutPrevMatches = {
      ...defaultProps,
      homePrevMatches: undefined,
    };

    render(<MatchDetails {...propsWithoutPrevMatches} />);
    expect(screen.getByText('Date not specified')).toBeInTheDocument();
  });

  it('should handle undefined MatchEvents gracefully', () => {
    const propsWithoutEvents = {
      ...defaultProps,
      MatchEvents: undefined,
    };

    expect(() => {
      render(<MatchDetails {...propsWithoutEvents} />);
    }).not.toThrow();
  });

  it('should initialize state with provided lineups', () => {
    const { Tabspage } = require('../../../../components/line-up-page');
    render(<MatchDetails {...defaultProps} />);

    const tabspageCall = Tabspage.mock.calls[0][0];
    expect(tabspageCall.homeLineup).toEqual(mockHomePlayers);
    expect(tabspageCall.awayLineup).toEqual(mockAwayPlayers);
  });

  it('should handle user not being authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
    });

    (useMatches as jest.Mock).mockReturnValue({
      allGames: [
        {
          match_id: 'match-123',
          booked: true,
          completed: false,
          analyst: 'user-123',
        },
      ],
    });

    render(<MatchDetails {...defaultProps} />);
    expect(screen.queryByText('Open Tracker')).not.toBeInTheDocument();
  });

  it('should encode lineup data in query params correctly', () => {
    (useMatches as jest.Mock).mockReturnValue({
      allGames: [
        {
          match_id: 'match-123',
          booked: true,
          completed: false,
          analyst: 'user-123',
        },
      ],
    });

    render(<MatchDetails {...defaultProps} />);
    
    const openTrackerButton = screen.getByText('Open Tracker');
    fireEvent.click(openTrackerButton);

    const callArg = mockRouter.push.mock.calls[0][0];
    expect(callArg).toContain('homeLineup=');
    expect(callArg).toContain('awayLineup=');
  });

  it('should handle empty allGames array', () => {
    (useMatches as jest.Mock).mockReturnValue({
      allGames: [],
    });

    render(<MatchDetails {...defaultProps} />);
    expect(screen.queryByText('Open Tracker')).not.toBeInTheDocument();
  });
});