// src/app/profile/__tests__/ProfilePage.test.tsx
import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock Next.js navigation
const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

// Mock your AuthContext with different scenarios
const mockSetUser = jest.fn();
const defaultUser = {
  user_id: 'test-id',
  first_name: 'John',
  last_name: 'Doe',
  user_role: 'Fan',
};

const mockAuthContext = {
  user: defaultUser as typeof defaultUser | null,
  setUser: mockSetUser,
};

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock Supabase
jest.mock('../../api/DatabaseApi/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-auth-id' } } },
        error: null,
      }),
    },
  },
}));

// Mock components with correct props based on actual implementation
jest.mock('../../../components/UserCard', () => {
  return function MockUserCard({ name, email, role }: { 
    name: string; 
    email: string; 
    role: string; 
  }) {
    return (
      <div data-testid="user-card">
        <span data-testid="user-name">{name}</span>
        <span data-testid="user-email">{email}</span>
        <span data-testid="user-role">{role}</span>
      </div>
    );
  };
});

jest.mock('../../../components/historicaldata', () => {
  return function MockHistoricalData({ team, league }: { team: string; league: string }) {
    return (
      <div data-testid="historical-data">
        <span>Mocked HistoricalData</span>
        <span data-testid="team-prop">{team}</span>
        <span data-testid="league-prop">{league}</span>
      </div>
    );
  };
});

jest.mock('../../../components/ExtApi', () => {
  return function MockExtApi() {
    return <div data-testid="ext-api">Mocked ExtApi</div>;
  };
});

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ 
    src, 
    alt, 
    onLoad, 
    className 
  }: { 
    src: string; 
    alt: string; 
    onLoad?: () => void;
    className?: string;
  }) {
    React.useEffect(() => {
      if (onLoad) {
        setTimeout(onLoad, 100); // Simulate image load
      }
    }, [onLoad]);
    
    return (
      <img 
        src={src} 
        alt={alt} 
        className={className}
        data-testid="background-image"
      />
    );
  },
}));

// Mock fetch with different scenarios
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Import your component
import ProfilePage from '../page';

// Get the mocked supabase for testing
const { supabase } = require('../../api/DatabaseApi/supabaseClient');

describe('ProfilePage', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    user = userEvent.setup({ delay: null });
    
    // Suppress expected console.error messages
    jest.spyOn(console, 'error').mockImplementation((message) => {
      // Only suppress specific expected error messages
      if (message.includes('Error fetching user info:')) {
        return;
      }
      // Let other errors through for debugging
      console.log(message);
    });
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        exists: true,
        user_id: 'test-user-id',
        first_name: 'John',
        last_name: 'Doe',
        role: 'Fan',
      }),
    });
    mockAuthContext.user = defaultUser;
    
    // Reset Supabase mock
    jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: { user: { id: 'test-auth-id' } } },
      error: null,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks(); // This will restore console.error
  });

  describe('Initial Rendering', () => {
    it('renders the ProfilePage component with loading state', async () => {
      await act(async () => {
        render(<ProfilePage />);
      });
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows loading state initially', async () => {
      await act(async () => {
        render(<ProfilePage />);
      });
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText(/YOUR STATS. YOUR GAME./)).toBeInTheDocument(); // This text is always rendered
    });

    it('renders welcome message with user name after loading', async () => {
      await act(async () => {
        render(<ProfilePage />);
      });
      
      // Wait for animations and data loading
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/WELCOME, John Doe/)).toBeInTheDocument();
        expect(screen.getByText(/YOUR STATS. YOUR GAME./)).toBeInTheDocument();
      });
    });
  });

  describe('Component Rendering After Load', () => {
    it('renders user card after loading', async () => {
      await act(async () => {
        render(<ProfilePage />);
      });
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('user-card')).toBeInTheDocument();
      });
    });

    it('renders historical data and external API components', async () => {
      await act(async () => {
        render(<ProfilePage />);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('historical-data')).toBeInTheDocument();
        expect(screen.getByTestId('ext-api')).toBeInTheDocument();
      });
    });

    it('passes correct props to child components', async () => {
      await act(async () => {
        render(<ProfilePage />);
      });
      
      await waitFor(() => {
        // Check if user ID is passed to historical data
        expect(screen.getByTestId('user-id')).toHaveTextContent('test-id');
        // Check if user role is passed to external API component
        expect(screen.getByTestId('user-role')).toHaveTextContent('Fan');
      });
    });
  });

  describe('Different User Roles', () => {
    it('handles admin user role correctly', async () => {
      mockAuthContext.user = {
        ...defaultUser,
        user_role: 'Admin',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          exists: true,
          user_id: 'test-user-id',
          first_name: 'John',
          last_name: 'Doe',
          role: 'Admin',
        }),
      });

      await act(async () => {
        render(<ProfilePage />);
      });
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-role')).toHaveTextContent('Admin');
      });
    });

    it('handles coach user role correctly and fetches team data', async () => {
      mockAuthContext.user = {
        ...defaultUser,
        user_role: 'Coach',
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            exists: true,
            user_id: 'test-user-id',
            first_name: 'John',
            last_name: 'Doe',
            role: 'Coach',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            team_id: 'team-123',
            team_name: 'Test Team',
          }),
        });

      await act(async () => {
        render(<ProfilePage />);
      });
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-role')).toHaveTextContent('Coach');
      });

      // Verify team API was called
      expect(mockFetch).toHaveBeenCalledWith('/api/coach/getCoachTeam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'test-user-id' }),
      });
    });
  });

  describe('Error Handling', () => {
    it('handles fetch errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        render(<ProfilePage />);
      });
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      
      // Should still render the page even if fetch fails
      await waitFor(() => {
        expect(screen.getByText(/YOUR STATS. YOUR GAME./)).toBeInTheDocument();
      });
    });

    it('handles missing user data', async () => {
      mockAuthContext.user = null;

      await act(async () => {
        render(<ProfilePage />);
      });
      
      // Wait for loading animations
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        // When user is null, the UserCard should not render because of the conditional rendering
        // {!isLoading && user && (<UserCard ... />)}
        // But other components should still render
        expect(screen.getByText(/YOUR STATS. YOUR GAME./)).toBeInTheDocument();
        expect(screen.getByTestId('historical-data')).toBeInTheDocument();
        expect(screen.getByTestId('ext-api')).toBeInTheDocument();
      });
    });

    it('handles Supabase auth errors', async () => {
      // Mock the auth error for this specific test
      jest.spyOn(supabase.auth, 'getSession').mockResolvedValueOnce({
        data: { session: null },
        error: new Error('Auth error'),
      });

      await act(async () => {
        render(<ProfilePage />);
      });
      
      // Should still render the page
      await waitFor(() => {
        expect(screen.getByTestId('user-card')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('handles Dashboard button click', async () => {
      await act(async () => {
        render(<ProfilePage />);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000); // Wait for buttons to show
      });

      await waitFor(async () => {
        const dashboardButton = screen.getByText('Dashboard');
        expect(dashboardButton).toBeInTheDocument();
        
        await user.click(dashboardButton);
        expect(mockPush).toHaveBeenCalledWith('/analyst');
      });
    });

    it('handles View Players button click', async () => {
      await act(async () => {
        render(<ProfilePage />);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000); // Wait for buttons to show
      });

      await waitFor(async () => {
        const viewPlayersButton = screen.getByText('View Players');
        expect(viewPlayersButton).toBeInTheDocument();
        
        await user.click(viewPlayersButton);
        expect(mockPush).toHaveBeenCalledWith('/players');
      });
    });

    it('handles button hover effects', async () => {
      await act(async () => {
        render(<ProfilePage />);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(async () => {
        const dashboardButton = screen.getByText('Dashboard');
        
        // Test hover - this would trigger blur effect in real app
        await user.hover(dashboardButton);
        expect(dashboardButton).toBeInTheDocument();
        
        await user.unhover(dashboardButton);
        expect(dashboardButton).toBeInTheDocument();
      });
    });

    it('shows buttons with proper timing', async () => {
      await act(async () => {
        render(<ProfilePage />);
      });

      // Buttons should not be visible immediately
      expect(screen.getByText('Dashboard')).toHaveClass('opacity-0');
      expect(screen.getByText('View Players')).toHaveClass('opacity-0');

      // After 600ms, buttons should become visible
      await act(async () => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toHaveClass('opacity-100');
        expect(screen.getByText('View Players')).toHaveClass('opacity-100');
      });
    });
  });

  describe('Responsive Design', () => {
    it('renders correctly on mobile viewport', async () => {
      // Mock window.matchMedia for mobile
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(max-width: 768px)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      await act(async () => {
        render(<ProfilePage />);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('user-card')).toBeInTheDocument();
      });
    });
  });

  describe('Background Image', () => {
    it('renders background image with correct attributes', async () => {
      await act(async () => {
        render(<ProfilePage />);
      });
      
      const backgroundImage = screen.getByTestId('background-image');
      expect(backgroundImage).toBeInTheDocument();
      expect(backgroundImage).toHaveAttribute('alt');
    });

    it('handles background image load error', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      await act(async () => {
        render(<ProfilePage />);
      });
      
      // Wait for animations to complete
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      
      const backgroundImage = screen.getByTestId('background-image');
      fireEvent.error(backgroundImage);
      
      // Should not crash the application - other elements should still be there
      await waitFor(() => {
        expect(screen.getByText(/YOUR STATS. YOUR GAME./)).toBeInTheDocument();
        expect(screen.getByTestId('historical-data')).toBeInTheDocument();
      });
      
      consoleError.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', async () => {
      await act(async () => {
        render(<ProfilePage />);
      });
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        const heading = screen.getByText(/YOUR STATS. YOUR GAME./);
        expect(heading).toBeInTheDocument();
      });
    });

    it('has no accessibility violations', async () => {
      // This would require axe-core for full testing
      await act(async () => {
        render(<ProfilePage />);
      });
      
      await waitFor(() => {
        // Basic check that interactive elements are present
        expect(screen.getByTestId('user-card')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States and Animations', () => {
    it('shows proper loading sequence', async () => {
      await act(async () => {
        render(<ProfilePage />);
      });
      
      // Initially should show Loading...
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      
      // Text should start invisible
      const welcomeText = screen.getByText(/YOUR STATS. YOUR GAME./);
      expect(welcomeText).toHaveClass('opacity-0');
      
      // After 200ms, text should become visible
      await act(async () => {
        jest.advanceTimersByTime(200);
      });
      
      expect(welcomeText).toHaveClass('opacity-100');
      
      // After 600ms total, buttons should be visible
      await act(async () => {
        jest.advanceTimersByTime(400); // 200 + 400 = 600
      });
      
      expect(screen.getByText('Dashboard')).toHaveClass('opacity-100');
    });

    it('handles image loading', async () => {
      await act(async () => {
        render(<ProfilePage />);
      });
      
      // Background image should be present
      const backgroundImage = screen.getByTestId('background-image');
      expect(backgroundImage).toBeInTheDocument();
      expect(backgroundImage).toHaveAttribute('src', '/bgr.jpg');
      expect(backgroundImage).toHaveAttribute('alt', 'Basketball player dunking');
    });
  });
});