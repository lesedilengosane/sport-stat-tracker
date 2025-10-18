// src/components/coachComponents/__tests__/teamManagement.test.tsx

// Set up environment variables for Supabase before anything imports it
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock supabaseClient BEFORE any imports that might use it
jest.mock('../../../app/api/DatabaseApi/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

// Mock lineups module
jest.mock('../../../app/utils/lineups', () => ({
  getDefaultLineup: jest.fn(),
}));

// Mock other dependencies
jest.mock('../reserves', () => ({
  Reserves: ({ players, onAddPlayer }: any) => (
    <div data-testid="reserves-component">
      <div data-testid="reserves-count">{players.length}</div>
      {players.map((p: any) => (
        <div key={p.playerID} data-testid={`reserve-player-${p.playerID}`}>
          {p.name}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('lucide-react', () => ({
  Save: () => <span data-testid="save-icon">Save</span>,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: any) => <img src={src} alt={alt} data-testid="player-image" />,
}));

// Mock Dialog components from shadcn/ui
jest.mock('../../ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => <div data-testid="dialog">{children}</div>,
  DialogTrigger: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
}));

// Mock Button component
jest.mock('../../ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

// Now import after mocks are set up
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TeamManagement from '../teamManagement';
import * as lineups from '../../../app/utils/lineups';
import * as supabaseClient from '../../../app/api/DatabaseApi/supabaseClient';

// Mock fetch globally
global.fetch = jest.fn();

// Get references to the mocked functions
const mockGetDefaultLineup = lineups.getDefaultLineup as jest.Mock;
const mockGetSession = supabaseClient.supabase.auth.getSession as jest.Mock;

const mockSession = {
  user: {
    id: 'test-user-id',
  },
};

const mockLineupData = {
  lineup: [
    {
      player_id: 'player-1',
      player_name: 'LeBron James',
      position: 'SF',
      team_id: 'team-1',
      is_starting: true,
      jersey_number: 23,
    },
    {
      player_id: 'player-2',
      player_name: 'Stephen Curry',
      position: 'PG',
      team_id: 'team-1',
      is_starting: true,
      jersey_number: 30,
    },
    {
      player_id: 'player-3',
      player_name: 'Kevin Durant',
      position: 'C',
      team_id: 'team-1',
      is_starting: false,
      jersey_number: 35,
    },
  ],
};

const mockUnassignedPlayers = [
  {
    player_id: 'free-1',
    first_name: 'John',
    last_name: 'Doe',
    position: 'PG',
    jersey_number: 10,
    team_id: null,
  },
  {
    player_id: 'free-2',
    first_name: 'Jane',
    last_name: 'Smith',
    position: 'SG',
    jersey_number: 15,
    team_id: null,
  },
];

describe('TeamManagement', () => {
  // Suppress console errors from Radix UI Presence component
  const originalError = console.error;
  
  beforeAll(() => {
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('An update to Presence inside a test was not wrapped in act')
      ) {
        return;
      }
      originalError.call(console, ...args);
    };
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
    });
    mockGetDefaultLineup.mockResolvedValue(mockLineupData);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockUnassignedPlayers,
    });
  });

  describe('Initial Rendering', () => {
    it('should show loading state initially', () => {
      render(<TeamManagement coachTeamId="team-1" />);
      expect(screen.getByText('Loading lineup...')).toBeInTheDocument();
    });

    it('should render page title after loading', async () => {
      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('Team Management')).toBeInTheDocument();
      });
    });

    it('should render court background image', async () => {
      const { container } = render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        const courtElement = container.querySelector('[style*="aerialView.png"]');
        expect(courtElement).toBeInTheDocument();
      });
    });

    it('should render reserves component', async () => {
      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('reserves-component')).toBeInTheDocument();
      });
    });

    it('should render all 5 court positions', async () => {
      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('PG')).toBeInTheDocument();
        expect(screen.getByText('SG')).toBeInTheDocument();
        expect(screen.getByText('SF')).toBeInTheDocument();
        expect(screen.getByText('PF')).toBeInTheDocument();
        expect(screen.getByText('C')).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should call getSession on mount', async () => {
      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        expect(mockGetSession).toHaveBeenCalled();
      });
    });

    it('should call getDefaultLineup with auth user id', async () => {
      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        expect(mockGetDefaultLineup).toHaveBeenCalledWith('test-user-id');
      });
    });

    it('should fetch unassigned players on mount', async () => {
      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/coach/free');
      });
    });

    it('should handle no session gracefully', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
      });

      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('Team Management')).toBeInTheDocument();
      });
      
      expect(mockGetDefaultLineup).not.toHaveBeenCalled();
    });

    it('should handle empty lineup data', async () => {
      mockGetDefaultLineup.mockResolvedValue({ lineup: [] });

      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('Team Management')).toBeInTheDocument();
      });
    });
  });

  describe('Player Rendering', () => {
    it('should render starting players on court', async () => {
      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('LeBron')).toBeInTheDocument();
        expect(screen.getByText('Stephen')).toBeInTheDocument();
      });
    });

    it('should render reserve players in reserves section', async () => {
      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('reserve-player-player-3')).toBeInTheDocument();
      });
    });

    it('should display jersey numbers for court players', async () => {
      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('#23')).toBeInTheDocument();
        expect(screen.getByText('#30')).toBeInTheDocument();
      });
    });

    it('should show empty court message when no starting players', async () => {
      mockGetDefaultLineup.mockResolvedValue({ lineup: [] });

      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        expect(screen.getByText(/No starting lineup set/i)).toBeInTheDocument();
      });
    });
  });

  describe('Save Lineup Button', () => {
    it('should render save button', async () => {
      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('save-icon')).toBeInTheDocument();
        expect(screen.getByText(/Need \d+ more players/i)).toBeInTheDocument();
      });
    });

    it('should disable save button when less than 5 players on court', async () => {
      mockGetDefaultLineup.mockResolvedValue({
        lineup: [mockLineupData.lineup[0]],
      });

      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        const saveButton = screen.getByText(/Need \d+ more players/i).closest('button');
        expect(saveButton).toBeDisabled();
      });
    });

    it('should show remaining players needed in button text', async () => {
      mockGetDefaultLineup.mockResolvedValue({
        lineup: [
          { ...mockLineupData.lineup[0], is_starting: true },
          { ...mockLineupData.lineup[1], is_starting: true },
        ],
      });

      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('Need 3 more players')).toBeInTheDocument();
      });
    });

    it('should enable save button with 5 players on court', async () => {
      const fullLineup = {
        lineup: [
          { ...mockLineupData.lineup[0], position: 'PG', is_starting: true },
          { ...mockLineupData.lineup[0], player_id: 'p2', position: 'SG', is_starting: true },
          { ...mockLineupData.lineup[0], player_id: 'p3', position: 'SF', is_starting: true },
          { ...mockLineupData.lineup[0], player_id: 'p4', position: 'PF', is_starting: true },
          { ...mockLineupData.lineup[0], player_id: 'p5', position: 'C', is_starting: true },
        ],
      };
      mockGetDefaultLineup.mockResolvedValue(fullLineup);

      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        const saveButton = screen.getByTestId('save-icon').closest('button');
        expect(saveButton).not.toBeDisabled();
      });
    });

    it('should call API when save button is clicked', async () => {
      const fullLineup = {
        lineup: [
          { ...mockLineupData.lineup[0], position: 'PG', is_starting: true },
          { ...mockLineupData.lineup[0], player_id: 'p2', position: 'SG', is_starting: true },
          { ...mockLineupData.lineup[0], player_id: 'p3', position: 'SF', is_starting: true },
          { ...mockLineupData.lineup[0], player_id: 'p4', position: 'PF', is_starting: true },
          { ...mockLineupData.lineup[0], player_id: 'p5', position: 'C', is_starting: true },
        ],
      };
      mockGetDefaultLineup.mockResolvedValue(fullLineup);
      
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation();

      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        const saveButton = screen.getByTestId('save-icon').closest('button');
        expect(saveButton).toBeInTheDocument();
      });

      const saveButton = screen.getByTestId('save-icon').closest('button');
      await act(async () => {
        fireEvent.click(saveButton!);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/lineups/UpdateDefault',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });

      mockAlert.mockRestore();
    });

    it('should show success alert on successful save', async () => {
      const fullLineup = {
        lineup: [
          { ...mockLineupData.lineup[0], position: 'PG', is_starting: true },
          { ...mockLineupData.lineup[0], player_id: 'p2', position: 'SG', is_starting: true },
          { ...mockLineupData.lineup[0], player_id: 'p3', position: 'SF', is_starting: true },
          { ...mockLineupData.lineup[0], player_id: 'p4', position: 'PF', is_starting: true },
          { ...mockLineupData.lineup[0], player_id: 'p5', position: 'C', is_starting: true },
        ],
      };
      mockGetDefaultLineup.mockResolvedValue(fullLineup);
      
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation();

      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        const saveButton = screen.getByTestId('save-icon').closest('button');
        expect(saveButton).toBeInTheDocument();
      });

      const saveButton = screen.getByTestId('save-icon').closest('button');
      await act(async () => {
        fireEvent.click(saveButton!);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Lineup successfully updated ✅');
      });

      mockAlert.mockRestore();
    });

    it('should show error alert on failed save', async () => {
      const fullLineup = {
        lineup: [
          { ...mockLineupData.lineup[0], position: 'PG', is_starting: true },
          { ...mockLineupData.lineup[0], player_id: 'p2', position: 'SG', is_starting: true },
          { ...mockLineupData.lineup[0], player_id: 'p3', position: 'SF', is_starting: true },
          { ...mockLineupData.lineup[0], player_id: 'p4', position: 'PF', is_starting: true },
          { ...mockLineupData.lineup[0], player_id: 'p5', position: 'C', is_starting: true },
        ],
      };
      mockGetDefaultLineup.mockResolvedValue(fullLineup);
      
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url === '/api/lineups/UpdateDefault') {
          return Promise.resolve({
            ok: false,
            json: async () => ({ error: 'Failed to save' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockUnassignedPlayers,
        });
      });
      
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation();

      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        const saveButton = screen.getByTestId('save-icon').closest('button');
        expect(saveButton).toBeInTheDocument();
      });

      const saveButton = screen.getByTestId('save-icon').closest('button');
      await act(async () => {
        fireEvent.click(saveButton!);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Failed to update lineup ❌');
      });

      mockAlert.mockRestore();
    });
  });

  describe('Drag and Drop', () => {
    it('should have draggable court players', async () => {
      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        const playerElement = screen.getByText('LeBron').closest('[draggable]');
        expect(playerElement).toHaveAttribute('draggable', 'true');
      });
    });

    it('should have drop zones for all positions', async () => {
      const { container } = render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        const dropZones = container.querySelectorAll('.w-20.h-20.rounded-full.z-10');
        expect(dropZones.length).toBe(5);
      });
    });
  });

  describe('Unassigned Players Dialog', () => {
    it('should render Add free Players button', async () => {
      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Add free Players/i })).toBeInTheDocument();
      });
    });

    it('should open dialog when button is clicked', async () => {
      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /Add free Players/i });
        expect(addButton).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /Add free Players/i });
      await act(async () => {
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Free Players')).toBeInTheDocument();
      });
    });

    it('should show refresh button in dialog', async () => {
      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /Add free Players/i });
        expect(addButton).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Add free Players/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Refresh List')).toBeInTheDocument();
      });
    });

    it('should display unassigned players in dialog', async () => {
      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /Add free Players/i });
        expect(addButton).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Add free Players/i }));
      });

      await waitFor(() => {
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
        expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
      });
    });

    it('should show empty message when no unassigned players', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /Add free Players/i });
        expect(addButton).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Add free Players/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('No unassigned players available.')).toBeInTheDocument();
      });
    });

    it('should have Add button for each unassigned player', async () => {
      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /Add free Players/i });
        expect(addButton).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Add free Players/i }));
      });

      await waitFor(() => {
        const addButtons = screen.getAllByRole('button', { name: 'Add' });
        expect(addButtons.length).toBe(2);
      });
    });

    it('should call assign API when Add button is clicked', async () => {
      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /Add free Players/i });
        expect(addButton).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Add free Players/i }));
      });

      await waitFor(() => {
        const addButtons = screen.getAllByRole('button', { name: 'Add' });
        expect(addButtons.length).toBeGreaterThan(0);
      });

      const addButtons = screen.getAllByRole('button', { name: 'Add' });
      await act(async () => {
        fireEvent.click(addButtons[0]);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/coach/assign-player',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ playerId: 'free-1', teamId: 'team-1' }),
          })
        );
      });
    });

    it('should refresh data after assigning player', async () => {
      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /Add free Players/i });
        expect(addButton).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Add free Players/i }));
      });

      await waitFor(() => {
        const addButtons = screen.getAllByRole('button', { name: 'Add' });
        expect(addButtons.length).toBeGreaterThan(0);
      });

      const addButtons = screen.getAllByRole('button', { name: 'Add' });
      await act(async () => {
        fireEvent.click(addButtons[0]);
      });

      await waitFor(() => {
        expect(mockGetDefaultLineup).toHaveBeenCalledTimes(2);
      });
    });

    it('should show loading state when refreshing', async () => {
      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /Add free Players/i });
        expect(addButton).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Add free Players/i }));
      });

      await waitFor(() => {
        const refreshButton = screen.getByText('Refresh List');
        expect(refreshButton).toBeInTheDocument();
      });
    });
  });

  describe('Player Name Display', () => {
    it('should display first name and last initial for court players', async () => {
      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('LeBron')).toBeInTheDocument();
        expect(screen.getByText('J.')).toBeInTheDocument();
        expect(screen.getByText('Stephen')).toBeInTheDocument();
        expect(screen.getByText('C.')).toBeInTheDocument();
      });
    });

    it('should handle single name players', async () => {
      const singleNameLineup = {
        lineup: [
          {
            ...mockLineupData.lineup[0],
            player_name: 'Madonna',
            is_starting: true,
          },
        ],
      };
      mockGetDefaultLineup.mockResolvedValue(singleNameLineup);

      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('Madonna')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors for unassigned players', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });

    it('should handle assign player errors', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url === '/api/coach/assign-player') {
          return Promise.resolve({
            ok: false,
            json: async () => ({ error: 'Assignment failed' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockUnassignedPlayers,
        });
      });

      render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /Add free Players/i });
        expect(addButton).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Add free Players/i }));
      });

      await waitFor(() => {
        const addButtons = screen.getAllByRole('button', { name: 'Add' });
        expect(addButtons.length).toBeGreaterThan(0);
      });

      const addButtons = screen.getAllByRole('button', { name: 'Add' });
      await act(async () => {
        fireEvent.click(addButtons[0]);
      });

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });

  describe('Layout and Styling', () => {
    it('should have correct flex layout', async () => {
      const { container } = render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        const layout = container.querySelector('.flex.gap-6');
        expect(layout).toBeInTheDocument();
      });
    });

    it('should have court taking 70% width', async () => {
      const { container } = render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        const court = container.querySelector('.flex-\\[7\\]');
        expect(court).toBeInTheDocument();
      });
    });

    it('should have reserves taking 30% width', async () => {
      const { container } = render(<TeamManagement coachTeamId="team-1" />);
      
      await waitFor(() => {
        const reserves = container.querySelector('.flex-\\[3\\]');
        expect(reserves).toBeInTheDocument();
      });
    });
  });
});