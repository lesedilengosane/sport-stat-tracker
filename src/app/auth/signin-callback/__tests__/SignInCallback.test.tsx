import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import SignInCallback from '../page'; // Adjust path as needed
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../api/DatabaseApi/supabaseClient';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../api/DatabaseApi/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

// Mock fetch globally
global.fetch = jest.fn();
global.alert = jest.fn();

const mockPush = jest.fn();
const mockSetUser = jest.fn();

describe('SignInCallback Component', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useAuth as jest.Mock).mockReturnValue({
      setUser: mockSetUser,
    });

    jest.clearAllMocks();
  });

  it('renders loading UI correctly', () => {
    render(<SignInCallback />);
    
    expect(screen.getByText('Just checking your shot...')).toBeInTheDocument();
    expect(screen.getByText(/Getting you in the game/)).toBeInTheDocument();
  });

  it('renders bouncing basketball animation', () => {
    render(<SignInCallback />);
    
    const basketballElement = document.querySelector('.animate-bounce-ball');
    expect(basketballElement).toBeInTheDocument();
    expect(basketballElement).toHaveClass('bg-orange-500');
    expect(basketballElement).toHaveClass('rounded-full');
  });

  it('redirects fan to /fan route', async () => {
    const mockSession = {
      user: { id: 'test-auth-id' }
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        exists: true,
        role: 'Fan',
        first_name: 'John',
        last_name: 'Doe',
        user_id: 'user-123',
        hasTeam: false,
      }),
    });

    render(<SignInCallback />);

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith({
        user_id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
        user_role: 'Fan',
      });
      expect(mockPush).toHaveBeenCalledWith('/fan');
    });
  });

  it('redirects analyst to /analyst route', async () => {
    const mockSession = {
      user: { id: 'test-auth-id' }
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        exists: true,
        role: 'Analyst',
        first_name: 'Jane',
        last_name: 'Smith',
        user_id: 'user-456',
        hasTeam: false,
      }),
    });

    render(<SignInCallback />);

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith({
        user_id: 'user-456',
        first_name: 'Jane',
        last_name: 'Smith',
        user_role: 'Analyst',
      });
      expect(mockPush).toHaveBeenCalledWith('/analyst');
    });
  });

  it('redirects coach with team to /coach route', async () => {
    const mockSession = {
      user: { id: 'test-auth-id' }
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        exists: true,
        role: 'Coach',
        first_name: 'Mike',
        last_name: 'Johnson',
        user_id: 'user-789',
        hasTeam: true,
      }),
    });

    render(<SignInCallback />);

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith({
        user_id: 'user-789',
        first_name: 'Mike',
        last_name: 'Johnson',
        user_role: 'Coach',
      });
      expect(mockPush).toHaveBeenCalledWith('/coach');
    });
  });

  it('redirects coach without team to /coach/coach-call route', async () => {
    const mockSession = {
      user: { id: 'test-auth-id' }
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        exists: true,
        role: 'Coach',
        first_name: 'Sarah',
        last_name: 'Wilson',
        user_id: 'user-101',
        hasTeam: false,
      }),
    });

    render(<SignInCallback />);

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith({
        user_id: 'user-101',
        first_name: 'Sarah',
        last_name: 'Wilson',
        user_role: 'Coach',
      });
      expect(mockPush).toHaveBeenCalledWith('/coach/coach-call');
    });
  });

  it('redirects unknown role to home route', async () => {
    const mockSession = {
      user: { id: 'test-auth-id' }
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        exists: true,
        role: 'Unknown',
        first_name: 'Test',
        last_name: 'User',
        user_id: 'user-unknown',
        hasTeam: false,
      }),
    });

    render(<SignInCallback />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('handles user that does not exist - signs out and redirects to signup', async () => {
    const mockSession = {
      user: { id: 'test-auth-id' }
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        exists: false,
        role: null,
        first_name: null,
        last_name: null,
        user_id: null,
        hasTeam: false,
      }),
    });

    render(<SignInCallback />);

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith('No account found. Please sign up first.');
      expect(mockPush).toHaveBeenCalledWith('/signup');
    });
  });

  it('handles session error - signs out and redirects to home', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: { message: 'Session expired' },
    });

    render(<SignInCallback />);

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('handles no session - signs out and redirects to home', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(<SignInCallback />);

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('handles API error when checking user - signs out and redirects to home', async () => {
    const mockSession = {
      user: { id: 'test-auth-id' }
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({
        error: 'Database error'
      }),
    });

    render(<SignInCallback />);

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('handles fetch network error - signs out and redirects to home', async () => {
    const mockSession = {
      user: { id: 'test-auth-id' }
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<SignInCallback />);

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('makes correct API call to check user', async () => {
    const mockSession = {
      user: { id: 'test-auth-id-123' }
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        exists: true,
        role: 'Fan',
        first_name: 'Test',
        last_name: 'User',
        user_id: 'user-123',
        hasTeam: false,
      }),
    });

    render(<SignInCallback />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/DatabaseApi/checkUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth_user_id: 'test-auth-id-123' }),
      });
    });
  });

  it('logs user information correctly', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    const mockSession = {
      user: { id: 'test-auth-id' }
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        exists: true,
        role: 'Fan',
        first_name: 'John',
        last_name: 'Doe',
        user_id: 'user-123',
        hasTeam: false,
      }),
    });

    render(<SignInCallback />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('The user given is: user-123, role: Fan');
    });

    consoleSpy.mockRestore();
  });

  it('logs authentication errors correctly', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    (supabase.auth.getSession as jest.Mock).mockRejectedValue(new Error('Auth error'));

    render(<SignInCallback />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Authentication error:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('has correct CSS classes for styling', () => {
    render(<SignInCallback />);
    
    const container = document.querySelector('.flex.items-center.justify-center.min-h-screen.bg-black');
    expect(container).toBeInTheDocument();
    
    const heading = screen.getByText('Just checking your shot...');
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-orange-500', 'mb-2');
    
    const description = screen.getByText(/Getting you in the game/);
    expect(description).toHaveClass('text-gray-300');
  });
});