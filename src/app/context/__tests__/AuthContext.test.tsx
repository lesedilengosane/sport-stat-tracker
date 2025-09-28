import { render, screen, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';

// Mock the entire supabase module at the top level - create the mock inline
jest.mock('../../api/DatabaseApi/supabaseClient', () => {
  console.log('Mock being set up');
  return {
    supabase: {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
      },
    },
  };
});

// Mock fetch
global.fetch = jest.fn();

// Import the AuthProvider after mocking
import { AuthProvider, useAuth } from '../AuthContext';
import { supabase } from '../../api/DatabaseApi/supabaseClient';

// Get the mocked function after import
const mockGetSession = supabase.auth.getSession as jest.MockedFunction<typeof supabase.auth.getSession>;

describe('AuthProvider Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock to default behavior
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  it('should render without crashing', async () => {
    console.log('Starting basic render test');
    
    const TestComponent = () => {
      const { user } = useAuth();
      return <div data-testid="test">{user ? 'has-user' : 'no-user'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait a moment for any async operations
    await waitFor(() => {
      expect(screen.getByTestId('test')).toBeInTheDocument();
    }, { timeout: 3000 });

    console.log('Basic render test completed');
    console.log('Mock was called:', mockGetSession.mock.calls.length, 'times');
  });

  it('should allow manual user setting', () => {
    const TestComponent = () => {
      const { user, setUser } = useAuth();
      
      const handleClick = () => {
        setUser({
          user_id: '123',
          first_name: 'Test',
          last_name: 'User',
          user_role: 'Coach',
        });
      };

      return (
        <div>
          <div data-testid="user-display">{user ? `${user.first_name}` : 'no-user'}</div>
          <button onClick={handleClick} data-testid="set-user">Set User</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-display')).toHaveTextContent('no-user');

    act(() => {
      screen.getByTestId('set-user').click();
    });

    expect(screen.getByTestId('user-display')).toHaveTextContent('Test');
  });

  it('should handle session restoration', async () => {
    // Set up a mock session
    const mockSession = {
      user: { id: 'test-user-123' },
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      expires_in: 3600,
      token_type: 'bearer',
    };

    const mockUserData = {
      user_id: 'user-123',
      first_name: 'John',
      last_name: 'Doe',
      role: 'Coach',
    };

    // Mock the session call with type assertion
    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    } as any);

    // Mock the fetch call
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => mockUserData,
    } as Response);

    const TestComponent = () => {
      const { user } = useAuth();
      return (
        <div data-testid="user-info">
          {user ? `${user.first_name} ${user.last_name}` : 'No user'}
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should eventually show the user
    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe');
    }, { timeout: 5000 });

    // Verify the API calls were made
    expect(mockGetSession).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith('/api/DatabaseApi/checkUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auth_user_id: 'test-user-123' }),
    });
  });
});