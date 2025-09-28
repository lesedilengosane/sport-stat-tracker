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

// Mock fetch globally
global.fetch = jest.fn();
global.alert = jest.fn();

// Mock URLSearchParams to avoid JSDOM navigation issues
const mockURLSearchParams = jest.fn();
global.URLSearchParams = mockURLSearchParams;

const mockPush = jest.fn();

describe('CallbackPage Component', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Reset URLSearchParams mock
    mockURLSearchParams.mockImplementation((search) => ({
      get: jest.fn((key) => {
        if (search === '?role=Coach') return key === 'role' ? 'Coach' : null;
        if (search === '?role=Analyst') return key === 'role' ? 'Analyst' : null;
        if (search === '?role=Fan') return key === 'role' ? 'Fan' : null;
        if (search === '?role=Coach&other=param') return key === 'role' ? 'Coach' : (key === 'other' ? 'param' : null);
        return key === 'role' ? null : null; // Default case - no role parameter
      }),
    }));

    // Ensure supabase mocks are properly reset with default values
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: null,
    });
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({});

    jest.clearAllMocks();
  });

  it('renders loading UI correctly', () => {
    render(<CallbackPage />);
    
    expect(screen.getByText('Finalizing Your Sign-In...')).toBeInTheDocument();
    expect(screen.getByText('Getting you on the court – almost there!')).toBeInTheDocument();
    expect(screen.getByText('Just checking your shot – almost in the game!')).toBeInTheDocument();
  });

  it('renders basketball spinner animation', () => {
    render(<CallbackPage />);
    
    // Check for basketball spinner elements
    const spinnerContainer = document.querySelector('.animate-spin-slow');
    expect(spinnerContainer).toBeInTheDocument();
    
    // Check for bouncing basketball
    const bouncingBall = document.querySelector('.animate-bounce');
    expect(bouncingBall).toBeInTheDocument();
    expect(bouncingBall).toHaveClass('bg-orange-500', 'rounded-full');
  });

  it('defaults to Fan role when no role parameter is provided', async () => {
    // Mock URLSearchParams for empty search
    mockURLSearchParams.mockImplementation(() => ({
      get: jest.fn(() => null), // No role parameter
    }));
    
    // Explicitly set the mock return value for this test
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: { id: 'user-123', user_metadata: { full_name: 'John Doe' } } },
      error: null,
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    render(<CallbackPage />);

    await waitFor(() => {
      expect(supabase.auth.getUser).toHaveBeenCalled();
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

  it('handles Coach role parameter and redirects correctly', async () => {
    // Mock URLSearchParams for Coach role
    mockURLSearchParams.mockImplementation(() => ({
      get: jest.fn((key) => key === 'role' ? 'Coach' : null),
    }));
    
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
      expect(mockPush).toHaveBeenCalledWith('/coach/coach-call');
    });
  });

  it('handles Analyst role parameter and redirects correctly', async () => {
    // Mock URLSearchParams for Analyst role  
    mockURLSearchParams.mockImplementation(() => ({
      get: jest.fn((key) => key === 'role' ? 'Analyst' : null),
    }));
    
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
      expect(mockPush).toHaveBeenCalledWith('/analyst');
    });
  });

  it('handles Fan role parameter and redirects correctly', async () => {
    // Mock URLSearchParams for Fan role
    mockURLSearchParams.mockImplementation(() => ({
      get: jest.fn((key) => key === 'role' ? 'Fan' : null),
    }));
    
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
      expect(mockPush).toHaveBeenCalledWith('/fan');
    });
  });

  it('handles user with no full_name in metadata', async () => {
    // Mock URLSearchParams for Fan role
    mockURLSearchParams.mockImplementation(() => ({
      get: jest.fn((key) => key === 'role' ? 'Fan' : null),
    }));
    
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
    // Mock URLSearchParams for Fan role
    mockURLSearchParams.mockImplementation(() => ({
      get: jest.fn((key) => key === 'role' ? 'Fan' : null),
    }));
    
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

  it('handles authentication error - signs out and redirects to home', async () => {
    // Mock URLSearchParams for Fan role
    mockURLSearchParams.mockImplementation(() => ({
      get: jest.fn((key) => key === 'role' ? 'Fan' : null),
    }));
    
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

  it('handles missing user - signs out and redirects to home', async () => {
    // Mock URLSearchParams for Fan role
    mockURLSearchParams.mockImplementation(() => ({
      get: jest.fn((key) => key === 'role' ? 'Fan' : null),
    }));
    
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
    // Mock URLSearchParams for Coach role
    mockURLSearchParams.mockImplementation(() => ({
      get: jest.fn((key) => key === 'role' ? 'Coach' : null),
    }));
    
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
    // Mock URLSearchParams for Fan role
    mockURLSearchParams.mockImplementation(() => ({
      get: jest.fn((key) => key === 'role' ? 'Fan' : null),
    }));
    
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
    // Mock URLSearchParams for Fan role
    mockURLSearchParams.mockImplementation(() => ({
      get: jest.fn((key) => key === 'role' ? 'Fan' : null),
    }));
    
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

  it('has correct CSS classes for styling', () => {
    render(<CallbackPage />);
    
    // Check main container styling
    const container = document.querySelector('.min-h-screen.bg-black.flex.flex-col.items-center.justify-center');
    expect(container).toBeInTheDocument();
    
    // Check card styling
    const card = document.querySelector('.bg-gray-900.rounded-2xl.shadow-2xl.border-4.border-orange-500');
    expect(card).toBeInTheDocument();
    
    // Check heading styling
    const heading = screen.getByText('Finalizing Your Sign-In...');
    expect(heading).toHaveClass('text-3xl', 'font-extrabold', 'text-orange-500', 'mb-3');
  });

  it('waits for roleParam before making API calls', async () => {
    // Mock URLSearchParams for Fan role
    mockURLSearchParams.mockImplementation(() => ({
      get: jest.fn((key) => key === 'role' ? 'Fan' : null),
    }));
    
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user-123', user_metadata: { full_name: 'John Doe' } } },
      error: null,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
    });

    render(<CallbackPage />);

    // Should not make API call immediately
    expect(global.fetch).not.toHaveBeenCalled();

    // Should make API call after useEffect processes the URL params
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('handles multiple query parameters correctly', async () => {
    // Mock URLSearchParams for multiple parameters
    mockURLSearchParams.mockImplementation(() => ({
      get: jest.fn((key) => {
        if (key === 'role') return 'Coach';
        if (key === 'other') return 'param';
        return null;
      }),
    }));
    
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
      expect(mockPush).toHaveBeenCalledWith('/coach/coach-call');
    });
  });
});