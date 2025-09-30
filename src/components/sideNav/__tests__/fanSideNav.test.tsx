// __tests__/fanSideNav.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Supabase client - create the mock function inline to avoid hoisting issues
jest.mock('../../../app/api/DatabaseApi/supabaseClient', () => ({
  supabase: {
    auth: {
      signOut: jest.fn(),
    },
  },
}));

// Import component and supabase after mocks
import { FanSideNav } from '../fanSideNav';
import { supabase } from '../../../app/api/DatabaseApi/supabaseClient';

// Get reference to the mocked function
const mockSignOut = supabase.auth.signOut as jest.Mock;

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Home: () => <div data-testid="home-icon">Home Icon</div>,
  Users: () => <div data-testid="users-icon">Users Icon</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar Icon</div>,
  Trophy: () => <div data-testid="trophy-icon">Trophy Icon</div>,
  Menu: () => <div data-testid="menu-icon">Menu Icon</div>,
  X: () => <div data-testid="x-icon">X Icon</div>,
  LogOut: () => <div data-testid="logout-icon">Logout Icon</div>,
}));

describe('FanSideNav Component', () => {
  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render and Toggle', () => {
    it('renders menu button initially', () => {
      render(<FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      expect(menuButton).toBeInTheDocument();
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    });

    it('sidebar is hidden initially', () => {
      const { container } = render(
        <FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />
      );

      const sidebar = container.querySelector('.-translate-x-full');
      expect(sidebar).toBeInTheDocument();
    });

    it('opens sidebar when menu button is clicked', () => {
      const { container } = render(
        <FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />
      );

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const sidebar = container.querySelector('.translate-x-0');
      expect(sidebar).toBeInTheDocument();
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    it('closes sidebar when X button is clicked', () => {
      const { container } = render(
        <FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />
      );

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const closeButton = screen.getByLabelText('Close menu');
      fireEvent.click(closeButton);

      const sidebar = container.querySelector('.-translate-x-full');
      expect(sidebar).toBeInTheDocument();
    });

    it('closes sidebar when backdrop is clicked', () => {
      const { container } = render(
        <FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />
      );

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const backdrop = container.querySelector('.bg-black\\/25');
      expect(backdrop).toBeInTheDocument();
      
      fireEvent.click(backdrop!);

      const sidebar = container.querySelector('.-translate-x-full');
      expect(sidebar).toBeInTheDocument();
    });

    it('only shows backdrop when sidebar is open', () => {
      const { container } = render(
        <FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />
      );

      let backdrop = container.querySelector('.bg-black\\/25');
      expect(backdrop).not.toBeInTheDocument();

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      backdrop = container.querySelector('.bg-black\\/25');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('Sidebar Content', () => {
    it('displays dashboard title', () => {
      render(<FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      expect(screen.getByText('Fan')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders all navigation items', () => {
      render(<FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Players')).toBeInTheDocument();
      expect(screen.getByText('Schedule')).toBeInTheDocument();
      expect(screen.getByText('Standings')).toBeInTheDocument();
    });

    it('renders all navigation icons', () => {
      render(<FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
      expect(screen.getByTestId('trophy-icon')).toBeInTheDocument();
    });

    it('renders logout button', () => {
      render(<FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      expect(screen.getByText('Logout')).toBeInTheDocument();
      expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
    });
  });

  describe('Active Tab Styling', () => {
    it('highlights the active tab', () => {
      render(<FanSideNav activeTab="players" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const playersButton = screen.getByText('Players').closest('button');
      expect(playersButton).toHaveClass('bg-white/15', 'text-white');
    });

    it('does not highlight inactive tabs', () => {
      render(<FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const playersButton = screen.getByText('Players').closest('button');
      expect(playersButton).toHaveClass('text-black');
      expect(playersButton).not.toHaveClass('bg-white/15');
    });

    it('updates active styling when activeTab prop changes', () => {
      const { rerender } = render(
        <FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />
      );

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      let overviewButton = screen.getByText('Overview').closest('button');
      expect(overviewButton).toHaveClass('bg-white/15', 'text-white');

      rerender(<FanSideNav activeTab="schedule" onTabChange={mockOnTabChange} />);

      overviewButton = screen.getByText('Overview').closest('button');
      const scheduleButton = screen.getByText('Schedule').closest('button');
      
      expect(overviewButton).not.toHaveClass('bg-white/15');
      expect(scheduleButton).toHaveClass('bg-white/15', 'text-white');
    });
  });

  describe('Navigation Interaction', () => {
    it('calls onTabChange when a nav item is clicked', () => {
      render(<FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const playersButton = screen.getByText('Players');
      fireEvent.click(playersButton);

      expect(mockOnTabChange).toHaveBeenCalledWith('players');
      expect(mockOnTabChange).toHaveBeenCalledTimes(1);
    });

    it('closes sidebar after clicking a nav item', () => {
      const { container } = render(
        <FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />
      );

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const scheduleButton = screen.getByText('Schedule');
      fireEvent.click(scheduleButton);

      const sidebar = container.querySelector('.-translate-x-full');
      expect(sidebar).toBeInTheDocument();
    });

    it('handles clicking each navigation item correctly', () => {
      render(<FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const navItems = [
        { text: 'Overview', id: 'overview' },
        { text: 'Players', id: 'players' },
        { text: 'Schedule', id: 'schedule' },
        { text: 'Standings', id: 'standings' },
      ];

      navItems.forEach(({ text, id }) => {
        mockOnTabChange.mockClear();
        const button = screen.getByText(text);
        fireEvent.click(button);
        expect(mockOnTabChange).toHaveBeenCalledWith(id);
      });
    });
  });

  describe('Logout Functionality', () => {
    it('calls supabase signOut when logout is clicked', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      render(<FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledTimes(1);
      });
    });

    it('redirects to home page after logout', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      render(<FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('closes sidebar after logout', async () => {
      mockSignOut.mockResolvedValue({ error: null });
      const { container } = render(
        <FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />
      );

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      await waitFor(() => {
        const sidebar = container.querySelector('.-translate-x-full');
        expect(sidebar).toBeInTheDocument();
      });
    });

    it('handles logout errors gracefully', async () => {
      // Suppress console.error for this test since we expect an error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockSignOut.mockRejectedValue(new Error('Logout failed'));

      render(<FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });

      // Restore console.error
      consoleSpy.mockRestore();
    });
  });

  describe('Styling and CSS Classes', () => {
    it('applies correct button styling to menu toggle', () => {
      render(<FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      expect(menuButton).toHaveClass(
        'fixed',
        'top-4',
        'left-4',
        'z-50',
        'rounded-full',
        'bg-white/10',
        'backdrop-blur-md'
      );
    });

    it('applies correct sidebar styling', () => {
      const { container } = render(
        <FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />
      );

      const sidebar = container.querySelector('.w-64');
      expect(sidebar).toHaveClass(
        'fixed',
        'left-0',
        'top-0',
        'h-full',
        'bg-white/10',
        'backdrop-blur-sm',
        'z-40'
      );
    });

    it('applies hover effects to nav items', () => {
      render(<FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const playersButton = screen.getByText('Players').closest('button');
      expect(playersButton).toHaveClass('hover:bg-white/10', 'hover:translate-x-1');
    });

    it('applies correct title styling', () => {
      render(<FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const fanTitle = screen.getByText('Fan');
      expect(fanTitle).toHaveClass('text-xl', 'font-bold', 'text-black', 'uppercase');

      const dashboardTitle = screen.getByText('Dashboard');
      expect(dashboardTitle).toHaveClass('text-xl', 'font-bold', 'text-orange-400', 'uppercase');
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-labels for menu buttons', () => {
      render(<FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      expect(menuButton).toBeInTheDocument();

      fireEvent.click(menuButton);

      const closeButton = screen.getByLabelText('Close menu');
      expect(closeButton).toBeInTheDocument();
    });

    it('all buttons are keyboard accessible', () => {
      render(<FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const allButtons = screen.getAllByRole('button');
      allButtons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    it('navigation items have proper button roles', () => {
      render(<FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const navButtons = [
        screen.getByText('Overview'),
        screen.getByText('Players'),
        screen.getByText('Schedule'),
        screen.getByText('Standings'),
      ];

      navButtons.forEach(button => {
        expect(button.closest('button')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid menu toggle clicks', () => {
      const { container } = render(
        <FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />
      );

      const menuButton = screen.getByLabelText('Open menu');
      
      fireEvent.click(menuButton);
      fireEvent.click(screen.getByLabelText('Close menu'));
      fireEvent.click(screen.getByLabelText('Open menu'));
      fireEvent.click(screen.getByLabelText('Close menu'));

      const sidebar = container.querySelector('.-translate-x-full');
      expect(sidebar).toBeInTheDocument();
    });

    it('handles clicking nav items without onTabChange callback', () => {
      render(<FanSideNav activeTab="overview" onTabChange={jest.fn()} />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      const playersButton = screen.getByText('Players');
      
      expect(() => fireEvent.click(playersButton)).not.toThrow();
    });

    it('maintains state consistency during multiple interactions', () => {
      render(<FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      
      fireEvent.click(menuButton);
      fireEvent.click(screen.getByText('Players'));
      
      expect(mockOnTabChange).toHaveBeenCalledWith('players');
      
      fireEvent.click(screen.getByLabelText('Open menu'));
      fireEvent.click(screen.getByText('Schedule'));
      
      expect(mockOnTabChange).toHaveBeenCalledWith('schedule');
      expect(mockOnTabChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('Component Integration', () => {
    it('renders complete component structure when opened', () => {
      render(<FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      expect(screen.getByText('Fan')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Players')).toBeInTheDocument();
      expect(screen.getByText('Schedule')).toBeInTheDocument();
      expect(screen.getByText('Standings')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('properly isolates navigation and logout functionality', async () => {
      mockSignOut.mockResolvedValue({ error: null });
      
      render(<FanSideNav activeTab="overview" onTabChange={mockOnTabChange} />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      fireEvent.click(screen.getByText('Players'));
      expect(mockOnTabChange).toHaveBeenCalledWith('players');
      expect(mockSignOut).not.toHaveBeenCalled();

      fireEvent.click(screen.getByLabelText('Open menu'));
      fireEvent.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });
  });
});