import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the dependencies BEFORE imports
jest.mock('../../../app/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../searchDropdown', () => ({
  SearchDropdown: ({ query, onClose }: { query: string; onClose: () => void }) => (
    <div data-testid="search-dropdown">
      <div>Search results for: {query}</div>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search Icon</div>,
}));

jest.mock('../../ui/badge', () => ({
  Badge: ({ children, onClick, className }: any) => (
    <div data-testid="badge" onClick={onClick} className={className}>
      {children}
    </div>
  ),
}));

// Import after mocks
import { DashboardHeader } from '../header';
import { useAuth } from '../../../app/context/AuthContext';
import { useRouter } from 'next/navigation';

describe('DashboardHeader', () => {
  const mockPush = jest.fn();
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    } as any);
  });

  describe('Rendering', () => {
    it('should render with default placeholder', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader placeholder="Custom search text..." />);

      const searchInput = screen.getByPlaceholderText('Custom search text...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should render search icon', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('should display user greeting with full name', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      expect(screen.getByText('WELCOME, John Doe.')).toBeInTheDocument();
    });

    it('should display user initial in badge', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('J');
    });

    it('should display loading state when user is null', () => {
      mockUseAuth.mockReturnValue({
        user: null,
      } as any);

      render(<DashboardHeader />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('U');
    });

    it('should display default values when user fields are undefined', () => {
      mockUseAuth.mockReturnValue({
        user: {} as any,
      } as any);

      render(<DashboardHeader />);

      expect(screen.getByText('WELCOME, undefined undefined.')).toBeInTheDocument();
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('U');
    });

    it('should transition from loading to user display', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      // Wait for loading to finish and user to display
      await waitFor(() => {
        expect(screen.getByText('WELCOME, John Doe.')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should update search query on input change', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      await userEvent.type(searchInput, 'Lakers');

      expect(searchInput).toHaveValue('Lakers');
    });

    it('should open search dropdown when query length is 2 or more', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      // Type less than 2 characters
      await userEvent.type(searchInput, 'L');
      expect(screen.queryByTestId('search-dropdown')).not.toBeInTheDocument();

      // Type 2 or more characters
      await userEvent.type(searchInput, 'a');
      expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();
    });

    it('should not open search dropdown when query length is less than 2', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      await userEvent.type(searchInput, 'L');

      expect(screen.queryByTestId('search-dropdown')).not.toBeInTheDocument();
    });

    it('should open dropdown on focus if query length is 2 or more', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      // Type to set query
      await userEvent.type(searchInput, 'Lakers');
      expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();
      
      // Close dropdown
      const closeButton = screen.getByText('Close');
      await userEvent.click(closeButton);
      
      expect(screen.queryByTestId('search-dropdown')).not.toBeInTheDocument();
      expect(searchInput).toHaveValue(''); // Query is cleared on close

      // Type again to have 2+ characters
      await userEvent.type(searchInput, 'Lakers');
      
      // Now dropdown should be open again
      expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();
    });

    it('should not open dropdown on focus if query length is less than 2', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      await userEvent.click(searchInput);
      
      expect(screen.queryByTestId('search-dropdown')).not.toBeInTheDocument();
    });

    it('should close search dropdown and clear query when onClose is called', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      // Open dropdown
      await userEvent.type(searchInput, 'Lakers');
      expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();

      // Close dropdown
      const closeButton = screen.getByText('Close');
      await userEvent.click(closeButton);

      expect(screen.queryByTestId('search-dropdown')).not.toBeInTheDocument();
      expect(searchInput).toHaveValue('');
    });

    it('should pass correct query to SearchDropdown', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      await userEvent.type(searchInput, 'Warriors');

      expect(screen.getByText('Search results for: Warriors')).toBeInTheDocument();
    });

    it('should close dropdown when backspacing to less than 2 characters', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      // Type enough to open dropdown
      await userEvent.type(searchInput, 'Lakers');
      expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();

      // Clear to less than 2 characters
      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, 'L');

      expect(screen.queryByTestId('search-dropdown')).not.toBeInTheDocument();
    });

    it('should handle rapid typing correctly', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      await userEvent.type(searchInput, 'LakersTeam', { delay: 1 });

      expect(searchInput).toHaveValue('LakersTeam');
      expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();
    });
  });

  describe('Profile Navigation', () => {
    it('should navigate to profile page when badge is clicked', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const badge = screen.getByTestId('badge');
      await userEvent.click(badge);

      expect(mockPush).toHaveBeenCalledWith('/profile');
      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('should allow profile navigation even when loading', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
      } as any);

      render(<DashboardHeader />);

      const badge = screen.getByTestId('badge');
      await userEvent.click(badge);

      expect(mockPush).toHaveBeenCalledWith('/profile');
    });
  });

  describe('User Role Display', () => {
    it('should handle user with Admin role', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      await waitFor(() => {
        expect(screen.getByText('WELCOME, John Doe.')).toBeInTheDocument();
      });
    });

    it('should handle user with Analyst role', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'Jane', last_name: 'Smith', user_role: 'Analyst' },
      } as any);

      render(<DashboardHeader />);

      await waitFor(() => {
        expect(screen.getByText('WELCOME, Jane Smith.')).toBeInTheDocument();
      });
    });

    it('should handle user with Coach role', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'Mike', last_name: 'Johnson', user_role: 'Coach' },
      } as any);

      render(<DashboardHeader />);

      await waitFor(() => {
        expect(screen.getByText('WELCOME, Mike Johnson.')).toBeInTheDocument();
      });
    });

    it('should display correct initial for different roles', async () => {
      const roles = [
        { first_name: 'Admin', last_name: 'User', user_role: 'Admin', initial: 'A' },
        { first_name: 'Coach', last_name: 'User', user_role: 'Coach', initial: 'C' },
        { first_name: 'Analyst', last_name: 'User', user_role: 'Analyst', initial: 'A' },
      ];

      for (const role of roles) {
        mockUseAuth.mockReturnValue({ user: role } as any);
        const { unmount } = render(<DashboardHeader />);

        await waitFor(() => {
          const badge = screen.getByTestId('badge');
          expect(badge).toHaveTextContent(role.initial);
        });

        unmount();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with only first name', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: '', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      await waitFor(() => {
        expect(screen.getByText('WELCOME, John .')).toBeInTheDocument();
      });
      
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('J');
    });

    it('should handle user with only last name', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: '', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      await waitFor(() => {
        // Use regex with \s+ to match one or more whitespace characters
        expect(screen.getByText(/WELCOME,\s+Doe\./)).toBeInTheDocument();
      });
      
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('U'); // Empty string first character
    });

    it('should handle user with lowercase first name', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'john', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      await waitFor(() => {
        const badge = screen.getByTestId('badge');
        expect(badge).toHaveTextContent('J');
      });
    });

    it('should handle special characters in name', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: "O'Brien", last_name: 'Smith-Jones', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      await waitFor(() => {
        expect(screen.getByText("WELCOME, O'Brien Smith-Jones.")).toBeInTheDocument();
      });
      
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('O');
    });

    it('should handle special characters in search', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      await userEvent.type(searchInput, '@#$%');

      expect(searchInput).toHaveValue('@#$%');
      expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();
    });

    it('should handle very long search queries', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      const longQuery = 'A'.repeat(100);
      
      await userEvent.type(searchInput, longQuery);

      expect(searchInput).toHaveValue(longQuery);
      expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();
    });

    it('should handle user with very long name', async () => {
      mockUseAuth.mockReturnValue({
        user: { 
          first_name: 'VeryLongFirstName', 
          last_name: 'VeryLongLastNameThatExceedsNormalLength', 
          user_role: 'Admin' 
        },
      } as any);

      render(<DashboardHeader />);

      await waitFor(() => {
        expect(screen.getByText('WELCOME, VeryLongFirstName VeryLongLastNameThatExceedsNormalLength.')).toBeInTheDocument();
      });
    });

    it('should handle empty string in search', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      await userEvent.type(searchInput, 'Test');
      await userEvent.clear(searchInput);

      expect(searchInput).toHaveValue('');
      expect(screen.queryByTestId('search-dropdown')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper input attributes', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      expect(searchInput).toHaveAttribute('type', 'text');
      expect(searchInput).toHaveAttribute('placeholder');
    });

    it('should allow keyboard navigation in search input', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      searchInput.focus();
      expect(searchInput).toHaveFocus();

      await userEvent.type(searchInput, 'Test');
      expect(searchInput).toHaveValue('Test');
    });

    it('should have accessible badge with role information', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const badge = screen.getByTestId('badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('J');
    });

    it('should maintain focus after typing in search', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      await userEvent.click(searchInput);
      await userEvent.type(searchInput, 'Lakers');

      expect(searchInput).toHaveFocus();
    });
  });

  describe('Component Lifecycle', () => {
    it('should clean up properly on unmount', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      const { unmount } = render(<DashboardHeader />);
      
      expect(() => unmount()).not.toThrow();
    });

    it('should handle auth context changes', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
      } as any);

      const { rerender } = render(<DashboardHeader />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Update auth context
      mockUseAuth.mockReturnValue({
        user: { first_name: 'Jane', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      rerender(<DashboardHeader />);

      await waitFor(() => {
        expect(screen.getByText('WELCOME, Jane Doe.')).toBeInTheDocument();
      });
    });
  });

  describe('Search Dropdown Interaction', () => {
    it('should keep dropdown open while typing after initial open', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      await userEvent.type(searchInput, 'La');
      expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();

      await userEvent.type(searchInput, 'kers');
      expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();
      expect(searchInput).toHaveValue('Lakers');
    });

    it('should update dropdown content as query changes', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      await userEvent.type(searchInput, 'Lakers');
      expect(screen.getByText('Search results for: Lakers')).toBeInTheDocument();

      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, 'Warriors');
      expect(screen.getByText('Search results for: Warriors')).toBeInTheDocument();
    });
  });
});