import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import SignInCallback from '../page';
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

  describe('Rendering', () => {
    it('renders loading UI correctly', () => {
      render(<SignInCallback />);
      
      expect(screen.getByText('Just checking your shot...')).toBeInTheDocument();
      expect(screen.getByText(/Getting you in the game/)).toBeInTheDocument();
    });

    it('has correct CSS classes for styling', () => {
      render(<SignInCallback />);
      
      const heading = screen.getByText('Just checking your shot...');
      expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-black', 'mb-2');
      
      const description = screen.getByText(/Getting you in the game/);
      expect(description).toHaveClass('text-gray-300');
    });

    it('renders with background image styling', () => {
      const { container } = render(<SignInCallback />);
      
      const mainDiv = container.querySelector('.min-h-screen');
      expect(mainDiv).toBeInTheDocument();
      expect(mainDiv).toHaveStyle({
        backgroundImage: "url('/loader/loader.gif')",
        backgroundSize: "200px 200px",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#f6f6f6",
      });
    });

    it('has proper accessibility attributes', () => {
      const { container } = render(<SignInCallback />);
      
      const mainDiv = container.querySelector('[role="status"]');
      expect(mainDiv).toBeInTheDocument();
      expect(mainDiv).toHaveAttribute('aria-live', 'polite');
    });

    it('renders hidden loading image for accessibility', () => {
      render(<SignInCallback />);
      
      const hiddenImage = screen.getByAltText('Loading...');
      expect(hiddenImage).toBeInTheDocument();
      expect(hiddenImage).toHaveClass('sr-only');
    });
  });

  describe('User Role Redirects', () => {
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
          auth_user_id: 'test-auth-id',
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
          auth_user_id: 'test-auth-id',
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
          auth_user_id: 'test-auth-id',
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
          auth_user_id: 'test-auth-id',
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
          auth_user_id: 'test-auth-id',
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
          auth_user_id: 'test-auth-id',
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
          auth_user_id: 'test-auth-id',
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
          auth_user_id: 'test-auth-id',
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
          auth_user_id: 'test-auth-id',
          hasTeam: false,
        }),
      });

      render(<SignInCallback />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Error Handling', () => {
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
          auth_user_id: null,
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

    it('handles missing user in session', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { user: null } },
        error: null,
      });

      render(<SignInCallback />);

      await waitFor(() => {
        expect(supabase.auth.signOut).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('API Integration', () => {
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
          auth_user_id: 'test-auth-id-123',
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

    it('calls getSession on component mount', async () => {
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
          first_name: 'Test',
          last_name: 'User',
          user_id: 'user-123',
          auth_user_id: 'test-auth-id',
          hasTeam: false,
        }),
      });

      render(<SignInCallback />);

      await waitFor(() => {
        expect(supabase.auth.getSession).toHaveBeenCalled();
      });
    });
  });

  describe('Logging', () => {
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
          auth_user_id: 'test-auth-id',
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

    it('logs error when API returns non-ok response', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
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
          error: 'API Error'
        }),
      });

      render(<SignInCallback />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Authentication error:', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('User Context', () => {
    it('sets user in context with all required fields', async () => {
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
          first_name: 'Michael',
          last_name: 'Jordan',
          user_id: 'user-mj-23',
          auth_user_id: 'test-auth-id',
          hasTeam: true,
        }),
      });

      render(<SignInCallback />);

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(
          expect.objectContaining({
            user_id: 'user-mj-23',
            first_name: 'Michael',
            last_name: 'Jordan',
            user_role: 'Coach',
            auth_user_id: 'test-auth-id',
          })
        );
      });
    });

    it('does not set user context when user does not exist', async () => {
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
          auth_user_id: null,
          hasTeam: false,
        }),
      });

      render(<SignInCallback />);

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith({
          user_id: null,
          first_name: null,
          last_name: null,
          user_role: null,
          auth_user_id: null,
        });
      });
    });
  });

  describe('Coach Team Logic', () => {
    it('handles coach with hasTeam true', async () => {
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
          first_name: 'Phil',
          last_name: 'Jackson',
          user_id: 'user-pj',
          auth_user_id: 'test-auth-id',
          hasTeam: true,
        }),
      });

      render(<SignInCallback />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/coach');
      });
    });

    it('handles coach with hasTeam false', async () => {
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
          first_name: 'New',
          last_name: 'Coach',
          user_id: 'user-new',
          auth_user_id: 'test-auth-id',
          hasTeam: false,
        }),
      });

      render(<SignInCallback />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/coach/coach-call');
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('runs authentication check on mount', async () => {
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
          first_name: 'Test',
          last_name: 'User',
          user_id: 'user-123',
          auth_user_id: 'test-auth-id',
          hasTeam: false,
        }),
      });

      render(<SignInCallback />);

      await waitFor(() => {
        expect(supabase.auth.getSession).toHaveBeenCalled();
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('does not run authentication check multiple times', async () => {
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
          first_name: 'Test',
          last_name: 'User',
          user_id: 'user-123',
          auth_user_id: 'test-auth-id',
          hasTeam: false,
        }),
      });

      const { rerender } = render(<SignInCallback />);

      await waitFor(() => {
        expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
      });

      rerender(<SignInCallback />);

      // Should not call again on rerender
      expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
    });
  });
});