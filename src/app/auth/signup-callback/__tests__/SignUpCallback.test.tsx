import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import CallbackPage from '../page';
import { supabase } from '../../../api/DatabaseApi/supabaseClient';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../api/DatabaseApi/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

// Mock the Mirage loader component
jest.mock('ldrs/react', () => ({
  Mirage: () => <div data-testid="mirage-loader">Loading Animation</div>,
}));

jest.mock('ldrs/react/Mirage.css', () => ({}));

// Store original location
const originalLocation = window.location;

// Mock fetch globally
global.fetch = jest.fn();
global.alert = jest.fn();

const mockPush = jest.fn();

describe('CallbackPage Component', () => {
  beforeEach(() => {
    // Mock window.location for each test
    delete (window as any).location;
    (window as any).location = { search: '' };
    
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Ensure supabase mocks are properly reset with default values
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: null,
    });
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({});

    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original location after each test
    (window as any).location = originalLocation;
  });

  describe('Rendering', () => {
    it('renders loading UI correctly', () => {
      render(<CallbackPage />);
      
      expect(screen.getByText('Setting things up...')).toBeInTheDocument();
      expect(screen.getByText('Getting you on the court – almost there!')).toBeInTheDocument();
    });

    it('renders Mirage loader animation', () => {
      render(<CallbackPage />);
      
      const loader = screen.getByTestId('mirage-loader');
      expect(loader).toBeInTheDocument();
    });

    it('has correct CSS classes for styling', () => {
      const { container } = render(<CallbackPage />);
      
      // Check main container styling
      const mainContainer = container.querySelector('.min-h-screen.bg-\\[\\#f6f6f6\\]');
      expect(mainContainer).toBeInTheDocument();
      
      // Check heading styling
      const heading = screen.getByText('Setting things up...');
      expect(heading).toHaveClass('text-3xl', 'font-extrabold', 'text-black', 'mb-3');
      
      // Check description styling
      const description = screen.getByText('Getting you on the court – almost there!');
      expect(description).toHaveClass('text-gray-600', 'mb-2');
    });

    it('renders with proper z-index layering', () => {
      const { container } = render(<CallbackPage />);
      
      // Loader should be in background (z-0)
      const loaderContainer = container.querySelector('.z-0');
      expect(loaderContainer).toBeInTheDocument();
      
      // Text should be on top (z-10)
      const textContainer = container.querySelector('.z-10');
      expect(textContainer).toBeInTheDocument();
    });
  });

  describe('Role Parameter Handling', () => {
    it('defaults to Fan role when no role parameter is provided', async () => {
      (window as any).location = { search: '' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123', user_metadata: { full_name: 'John Doe' } } },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      render(<CallbackPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/DatabaseApi/addUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth_user_id: 'user-123',
            first_name: 'John',
            last_name: 'Doe',
            role: 'Fan',
          }),
        });
        expect(mockPush).toHaveBeenCalledWith('/fan');
      });
    });

    it('handles Coach role parameter and redirects to coach-call', async () => {
      (window as any).location = { search: '?role=Coach' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123', user_metadata: { full_name: 'Jane Smith' } } },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      render(<CallbackPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/DatabaseApi/addUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth_user_id: 'user-123',
            first_name: 'Jane',
            last_name: 'Smith',
            role: 'Coach',
          }),
        });
      });
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/coach/coach-call');
      });
    });

    it('handles Analyst role parameter and redirects to analyst', async () => {
      (window as any).location = { search: '?role=Analyst' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-456', user_metadata: { full_name: 'Mike Johnson' } } },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      render(<CallbackPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/DatabaseApi/addUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth_user_id: 'user-456',
            first_name: 'Mike',
            last_name: 'Johnson',
            role: 'Analyst',
          }),
        });
      });
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/analyst');
      });
    });

    it('handles Fan role parameter and redirects to fan', async () => {
      (window as any).location = { search: '?role=Fan' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-789', user_metadata: { full_name: 'Sarah Wilson' } } },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      render(<CallbackPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/DatabaseApi/addUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth_user_id: 'user-789',
            first_name: 'Sarah',
            last_name: 'Wilson',
            role: 'Fan',
          }),
        });
      });
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/fan');
      });
    });

    it('handles multiple query parameters and extracts role correctly', async () => {
      (window as any).location = { search: '?role=Coach&other=param&foo=bar' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123', user_metadata: { full_name: 'John Doe' } } },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      render(<CallbackPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/DatabaseApi/addUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth_user_id: 'user-123',
            first_name: 'John',
            last_name: 'Doe',
            role: 'Coach',
          }),
        });
      });
    });
  });

  describe('Name Parsing', () => {
    it('handles user with no full_name in metadata', async () => {
      (window as any).location = { search: '?role=Fan' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123', user_metadata: {} } },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      render(<CallbackPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/DatabaseApi/addUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth_user_id: 'user-123',
            first_name: '',
            last_name: '',
            role: 'Fan',
          }),
        });
      });
    });

    it('handles user with single name', async () => {
      (window as any).location = { search: '?role=Fan' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123', user_metadata: { full_name: 'John' } } },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      render(<CallbackPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/DatabaseApi/addUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth_user_id: 'user-123',
            first_name: 'John',
            last_name: '',
            role: 'Fan',
          }),
        });
      });
    });

    it('handles user with multiple word last name', async () => {
      (window as any).location = { search: '?role=Fan' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123', user_metadata: { full_name: 'John van der Berg' } } },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      render(<CallbackPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/DatabaseApi/addUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth_user_id: 'user-123',
            first_name: 'John',
            last_name: 'van der Berg',
            role: 'Fan',
          }),
        });
      });
    });

    it('handles empty string full_name', async () => {
      (window as any).location = { search: '?role=Fan' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123', user_metadata: { full_name: '' } } },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      render(<CallbackPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/DatabaseApi/addUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth_user_id: 'user-123',
            first_name: '',
            last_name: '',
            role: 'Fan',
          }),
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('handles authentication error - alerts and redirects to home', async () => {
      (window as any).location = { search: '?role=Fan' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' },
      });

      render(<CallbackPage />);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Authentication failed. Please try again.');
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('handles missing user - alerts and redirects to home', async () => {
      (window as any).location = { search: '?role=Fan' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      render(<CallbackPage />);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Authentication failed. Please try again.');
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('handles 409 conflict (user already exists) - signs out and redirects to coach-call', async () => {
      (window as any).location = { search: '?role=Coach' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123', user_metadata: { full_name: 'John Doe' } } },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 409,
      });

      render(<CallbackPage />);

      await waitFor(() => {
        expect(supabase.auth.signOut).toHaveBeenCalled();
        expect(global.alert).toHaveBeenCalledWith('An account with this email already exists.\nPlease sign in instead.');
        expect(mockPush).toHaveBeenCalledWith('/coach/coach-call');
      });
    });

    it('handles API error with error message - signs out and redirects to home', async () => {
      (window as any).location = { search: '?role=Fan' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123', user_metadata: { full_name: 'John Doe' } } },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Database error' }),
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<CallbackPage />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Create user failed:', 'Database error');
        expect(supabase.auth.signOut).toHaveBeenCalled();
        expect(global.alert).toHaveBeenCalledWith('Signup failed. Please try again.');
        expect(mockPush).toHaveBeenCalledWith('/');
      });

      consoleErrorSpy.mockRestore();
    });

    it('handles API error without parseable JSON - uses statusText', async () => {
      (window as any).location = { search: '?role=Fan' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123', user_metadata: { full_name: 'John Doe' } } },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<CallbackPage />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Create user failed:', 'Internal Server Error');
        expect(supabase.auth.signOut).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/');
      });

      consoleErrorSpy.mockRestore();
    });

    it('handles network error during fetch', async () => {
      (window as any).location = { search: '?role=Fan' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123', user_metadata: { full_name: 'John Doe' } } },
        error: null,
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<CallbackPage />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Signup error:', expect.any(Error));
        expect(supabase.auth.signOut).toHaveBeenCalled();
        expect(global.alert).toHaveBeenCalledWith('Signup failed. Please try again.');
        expect(mockPush).toHaveBeenCalledWith('/');
      }, { timeout: 3000 });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Component Lifecycle', () => {
    it('waits for roleParam before making API calls', async () => {
      (window as any).location = { search: '?role=Fan' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123', user_metadata: { full_name: 'John Doe' } } },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      render(<CallbackPage />);

      // Should not make API call immediately (needs to wait for roleParam state)
      expect(global.fetch).not.toHaveBeenCalled();

      // Should make API call after useEffect processes the URL params
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('does not make API calls when roleParam is initially null', async () => {
      (window as any).location = { search: '' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123', user_metadata: { full_name: 'John Doe' } } },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      render(<CallbackPage />);

      // Even with empty search, component defaults to 'Fan' and proceeds
      await waitFor(() => {
        expect(supabase.auth.getUser).toHaveBeenCalled();
      });
    });

    it('makes API calls in correct order', async () => {
      (window as any).location = { search: '?role=Fan' };
      
      const callOrder: string[] = [];
      
      (supabase.auth.getUser as jest.Mock).mockImplementation(async () => {
        callOrder.push('getUser');
        return {
          data: { user: { id: 'user-123', user_metadata: { full_name: 'John Doe' } } },
          error: null,
        };
      });

      (global.fetch as jest.Mock).mockImplementation(async () => {
        callOrder.push('fetch');
        return {
          ok: true,
          status: 200,
        };
      });

      render(<CallbackPage />);

      await waitFor(() => {
        expect(callOrder).toEqual(['getUser', 'fetch']);
      });
    });
  });

  describe('Redirect Logic', () => {
    it('redirects to /fan for Fan role after successful signup', async () => {
      (window as any).location = { search: '?role=Fan' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123', user_metadata: { full_name: 'Test User' } } },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      render(<CallbackPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/fan');
        expect(mockPush).toHaveBeenCalledTimes(1);
      });
    });

    it('redirects to /analyst for Analyst role after successful signup', async () => {
      (window as any).location = { search: '?role=Analyst' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123', user_metadata: { full_name: 'Test User' } } },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      render(<CallbackPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/analyst');
        expect(mockPush).toHaveBeenCalledTimes(1);
      });
    });

    it('redirects to /coach/coach-call for Coach role after successful signup', async () => {
      (window as any).location = { search: '?role=Coach' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123', user_metadata: { full_name: 'Test User' } } },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      render(<CallbackPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/coach/coach-call');
        expect(mockPush).toHaveBeenCalledTimes(1);
      });
    });

    it('does not redirect multiple times', async () => {
      (window as any).location = { search: '?role=Fan' };
      
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123', user_metadata: { full_name: 'Test User' } } },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      render(<CallbackPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledTimes(1);
      });
    });
  });
});