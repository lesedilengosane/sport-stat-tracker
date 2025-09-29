import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CoachSideNav } from '../coachSideNav';
import { supabase } from '../../../app/api/DatabaseApi/supabaseClient';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
}));

// Mock utils - Removed mock, using actual implementation

// Mock Supabase
jest.mock('../../../app/api/DatabaseApi/supabaseClient', () => ({
  supabase: {
    auth: {
      signOut: jest.fn()
    }
  }
}));

const mockSignOut = supabase.auth.signOut as jest.Mock;

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  BarChart3: () => <div data-testid="barchart-icon">BarChart3</div>,
  Trophy: () => <div data-testid="trophy-icon">Trophy</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  X: () => <div data-testid="x-icon">X</div>,
  LogOut: () => <div data-testid="logout-icon">LogOut</div>,
}));

describe('CoachSideNav Component', () => {
  const defaultProps = {
    activeTab: 'schedule',
    onTabChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<CoachSideNav {...defaultProps} />);
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    });

    it('renders the toggle button with menu icon when closed', () => {
      render(<CoachSideNav {...defaultProps} />);
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
    });

    it('renders all navigation items', () => {
      render(<CoachSideNav {...defaultProps} />);
      
      // Open the sidebar first
      fireEvent.click(screen.getByTestId('menu-icon'));
      
      expect(screen.getByText('Schedule')).toBeInTheDocument();
      expect(screen.getByText('All Games')).toBeInTheDocument();
      expect(screen.getByText('Team Management')).toBeInTheDocument();
      expect(screen.getByText('Team Stats')).toBeInTheDocument();
      expect(screen.getByText('Players')).toBeInTheDocument();
    });

    it('displays the coach dashboard title when open', () => {
      render(<CoachSideNav {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('menu-icon'));
      
      expect(screen.getByText('Coach Dashboard')).toBeInTheDocument();
    });

    it('renders logout button when sidebar is open', () => {
      render(<CoachSideNav {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('menu-icon'));
      
      expect(screen.getByText('Logout')).toBeInTheDocument();
      expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
    });
  });

  describe('Sidebar Toggle Functionality', () => {
    it('opens sidebar when menu button is clicked', () => {
      render(<CoachSideNav {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('menu-icon'));
      
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
      expect(screen.getByText('Coach Dashboard')).toBeInTheDocument();
    });

    it('closes sidebar when X button is clicked', () => {
      render(<CoachSideNav {...defaultProps} />);
      
      // Open sidebar
      fireEvent.click(screen.getByTestId('menu-icon'));
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
      
      // Close sidebar
      fireEvent.click(screen.getByTestId('x-icon'));
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    });

    it('closes sidebar when overlay is clicked', () => {
      render(<CoachSideNav {...defaultProps} />);
      
      // Open sidebar
      fireEvent.click(screen.getByTestId('menu-icon'));
      
      // Click overlay
      const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50');
      expect(overlay).toBeInTheDocument();
      fireEvent.click(overlay!);
      
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    });
  });

  describe('Active Tab Styling', () => {
    it('highlights the active tab', () => {
      render(<CoachSideNav {...defaultProps} activeTab="schedule" />);
      
      fireEvent.click(screen.getByTestId('menu-icon'));
      
      const scheduleButton = screen.getByText('Schedule').closest('button');
      expect(scheduleButton).toHaveClass('bg-orange-500/20', 'text-orange-400', 'border-l-4', 'border-orange-500');
    });

    it('does not highlight inactive tabs', () => {
      render(<CoachSideNav {...defaultProps} activeTab="schedule" />);
      
      fireEvent.click(screen.getByTestId('menu-icon'));
      
      const allGamesButton = screen.getByText('All Games').closest('button');
      expect(allGamesButton).toHaveClass('text-gray-300');
      expect(allGamesButton).not.toHaveClass('bg-orange-500/20');
    });
  });

  describe('Tab Navigation', () => {
    it('calls onTabChange when a nav item is clicked', () => {
      const onTabChange = jest.fn();
      render(<CoachSideNav {...defaultProps} onTabChange={onTabChange} />);
      
      fireEvent.click(screen.getByTestId('menu-icon'));
      fireEvent.click(screen.getByText('Team Stats'));
      
      expect(onTabChange).toHaveBeenCalledWith('team-stats');
    });

    it('closes sidebar when a nav item is clicked', () => {
      render(<CoachSideNav {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('menu-icon'));
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Players'));
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    });

    it('calls onTabChange for each navigation item', () => {
      const onTabChange = jest.fn();
      render(<CoachSideNav {...defaultProps} onTabChange={onTabChange} />);
      
      fireEvent.click(screen.getByTestId('menu-icon'));
      
      const navItems = [
        { text: 'Schedule', id: 'schedule' },
        { text: 'All Games', id: 'all-games' },
        { text: 'Team Management', id: 'team-management' },
        { text: 'Team Stats', id: 'team-stats' },
        { text: 'Players', id: 'players' }
      ];
      
      navItems.forEach(item => {
        fireEvent.click(screen.getByText(item.text));
        expect(onTabChange).toHaveBeenCalledWith(item.id);
      });
    });
  });

  describe('Logout Functionality', () => {
    it('calls supabase signOut when logout is clicked', async () => {
      mockSignOut.mockResolvedValue({ error: null });
      
      render(<CoachSideNav {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('menu-icon'));
      fireEvent.click(screen.getByText('Logout'));
      
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledTimes(1);
      }, { timeout: 3000 });
    });

    it('navigates to home page after logout', async () => {
      mockSignOut.mockResolvedValue({ error: null });
      
      render(<CoachSideNav {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('menu-icon'));
      fireEvent.click(screen.getByText('Logout'));
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      }, { timeout: 3000 });
    });

    it('closes sidebar after logout', async () => {
      mockSignOut.mockResolvedValue({ error: null });
      
      render(<CoachSideNav {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('menu-icon'));
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Logout'));
      
      await waitFor(() => {
        expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Icons Rendering', () => {
    it('renders correct icons for each navigation item', () => {
      render(<CoachSideNav {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('menu-icon'));
      
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
      expect(screen.getByTestId('trophy-icon')).toBeInTheDocument();
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
      expect(screen.getByTestId('barchart-icon')).toBeInTheDocument();
      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
      expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles', () => {
      render(<CoachSideNav {...defaultProps} />);
      
      const toggleButton = screen.getByTestId('menu-icon').closest('button');
      expect(toggleButton).toBeInTheDocument();
      
      fireEvent.click(toggleButton!);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(1); // Toggle + nav items + logout
    });

    it('navigation items are keyboard accessible', () => {
      render(<CoachSideNav {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('menu-icon'));
      
      const scheduleButton = screen.getByText('Schedule');
      expect(scheduleButton.closest('button')).toBeInTheDocument();
    });
  });

  describe('Prop Handling', () => {
    it('updates active tab when prop changes', () => {
      const { rerender } = render(<CoachSideNav {...defaultProps} activeTab="schedule" />);
      
      fireEvent.click(screen.getByTestId('menu-icon'));
      
      let scheduleButton = screen.getByText('Schedule').closest('button');
      expect(scheduleButton).toHaveClass('bg-orange-500/20');
      
      rerender(<CoachSideNav {...defaultProps} activeTab="players" />);
      
      const playersButton = screen.getByText('Players').closest('button');
      expect(playersButton).toHaveClass('bg-orange-500/20');
      
      scheduleButton = screen.getByText('Schedule').closest('button');
      expect(scheduleButton).not.toHaveClass('bg-orange-500/20');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined activeTab gracefully', () => {
      render(<CoachSideNav onTabChange={jest.fn()} activeTab={''} />);
      
      fireEvent.click(screen.getByTestId('menu-icon'));
      
      // Should not throw error and all items should be inactive
      const buttons = screen.getAllByRole('button');
      const navButtons = buttons.slice(1, -1); // Exclude toggle and logout
      
      navButtons.forEach(button => {
        expect(button).not.toHaveClass('bg-orange-500/20');
      });
    });

    it('handles multiple rapid toggle clicks', () => {
      render(<CoachSideNav {...defaultProps} />);
      
      const toggleButton = screen.getByTestId('menu-icon').closest('button');
      
      fireEvent.click(toggleButton!);
      fireEvent.click(screen.getByTestId('x-icon').closest('button')!);
      fireEvent.click(screen.getByTestId('menu-icon').closest('button')!);
      
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });
  });
});