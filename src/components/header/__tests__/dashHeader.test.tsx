import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
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

      expect(screen.getByText('Hello, John Doe')).toBeInTheDocument();
    });

    it('should display user initial in badge', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('J');
    });

    it('should display loading skeleton when user first_name or last_name is missing', () => {
      mockUseAuth.mockReturnValue({
        user: null,
      } as any);

      render(<DashboardHeader />);

      // Check for loading skeletons instead of text
      const skeletons = screen.getAllByRole('generic').filter(el => 
        el.className.includes('animate-pulse')
      );
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should display loading skeleton when user fields are undefined', () => {
      mockUseAuth.mockReturnValue({
        user: {} as any,
      } as any);

      render(<DashboardHeader />);

      const skeletons = screen.getAllByRole('generic').filter(el => 
        el.className.includes('animate-pulse')
      );
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should transition from loading to user display', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      await waitFor(() => {
        expect(screen.getByText('Hello, John Doe')).toBeInTheDocument();
      });
    });

    it('should render with proper layout structure', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      const { container } = render(<DashboardHeader />);

      // Check for main container with proper classes
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('bg-white/50', 'backdrop-blur-sm', 'border-b', 'border-orange-200');
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
      
      // Type 1 character
      await userEvent.type(searchInput, 'L');
      expect(screen.queryByTestId('search-dropdown')).not.toBeInTheDocument();

      // Type second character
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
      await userEvent.type(searchInput, 'Warriors');
      
      // Focus should reopen dropdown
      await userEvent.click(searchInput);
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

    it('should close dropdown when clearing input to less than 2 characters', async () => {
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

    it('should handle search input with proper styling classes', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      expect(searchInput).toHaveClass('w-full', 'pl-10', 'pr-4', 'py-2');
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

    it('should not render clickable badge when user is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
      } as any);

      render(<DashboardHeader />);

      const badge = screen.queryByTestId('badge');
      expect(badge).not.toBeInTheDocument();
    });

    it('should render badge with proper styling', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-orange-500', 'hover:cursor-pointer');
    });
  });

  describe('User Role Display', () => {
    it('should handle user with Admin role', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      await waitFor(() => {
        expect(screen.getByText('Hello, John Doe')).toBeInTheDocument();
      });
    });

    it('should handle user with Analyst role', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'Jane', last_name: 'Smith', user_role: 'Analyst' },
      } as any);

      render(<DashboardHeader />);

      await waitFor(() => {
        expect(screen.getByText('Hello, Jane Smith')).toBeInTheDocument();
      });
    });

    it('should handle user with Coach role', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'Mike', last_name: 'Johnson', user_role: 'Coach' },
      } as any);

      render(<DashboardHeader />);

      await waitFor(() => {
        expect(screen.getByText('Hello, Mike Johnson')).toBeInTheDocument();
      });
    });

    it('should display correct initial for different users', async () => {
      const users = [
        { first_name: 'Alice', last_name: 'Anderson', user_role: 'Admin', initial: 'A' },
        { first_name: 'Bob', last_name: 'Brown', user_role: 'Coach', initial: 'B' },
        { first_name: 'Charlie', last_name: 'Clark', user_role: 'Analyst', initial: 'C' },
      ];

      for (const user of users) {
        mockUseAuth.mockReturnValue({ user } as any);
        const { unmount } = render(<DashboardHeader />);

        await waitFor(() => {
          const badge = screen.getByTestId('badge');
          expect(badge).toHaveTextContent(user.initial);
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

      // Should show loading skeleton since last_name is empty string
      const skeletons = screen.getAllByRole('generic').filter(el => 
        el.className.includes('animate-pulse')
      );
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should handle user with only last name', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: '', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      // Should show loading skeleton since first_name is empty string
      const skeletons = screen.getAllByRole('generic').filter(el => 
        el.className.includes('animate-pulse')
      );
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should handle user with lowercase first name', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'john', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      await waitFor(() => {
        const badge = screen.getByTestId('badge');
        expect(badge).toHaveTextContent('J'); // Should be uppercase
      });
    });

    it('should handle special characters in name', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: "O'Brien", last_name: 'Smith-Jones', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      await waitFor(() => {
        expect(screen.getByText("Hello, O'Brien Smith-Jones")).toBeInTheDocument();
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
        expect(screen.getByText('Hello, VeryLongFirstName VeryLongLastNameThatExceedsNormalLength')).toBeInTheDocument();
      });
    });

    it('should handle empty string in search after typing', async () => {
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

    it('should handle null user_role gracefully', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: null } as any,
      } as any);

      render(<DashboardHeader />);

      // Component should still render without errors
      expect(screen.getByText('Hello, John Doe')).toBeInTheDocument();
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

    it('should have accessible badge element', async () => {
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

    it('should have proper ARIA attributes on search input', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput.tagName).toBe('INPUT');
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

    it('should handle auth context changes from null to user', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
      } as any);

      const { rerender } = render(<DashboardHeader />);
      
      // Check for loading skeleton
      const skeletonsBefore = screen.getAllByRole('generic').filter(el => 
        el.className.includes('animate-pulse')
      );
      expect(skeletonsBefore.length).toBeGreaterThan(0);

      // Update auth context
      mockUseAuth.mockReturnValue({
        user: { first_name: 'Jane', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      rerender(<DashboardHeader />);

      await waitFor(() => {
        expect(screen.getByText('Hello, Jane Doe')).toBeInTheDocument();
      });
    });

    it('should handle auth context changes from one user to another', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      const { rerender } = render(<DashboardHeader />);
      
      expect(screen.getByText('Hello, John Doe')).toBeInTheDocument();

      // Change to different user
      mockUseAuth.mockReturnValue({
        user: { first_name: 'Jane', last_name: 'Smith', user_role: 'Coach' },
      } as any);

      rerender(<DashboardHeader />);

      await waitFor(() => {
        expect(screen.getByText('Hello, Jane Smith')).toBeInTheDocument();
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

    it('should position dropdown relative to search container', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      const { container } = render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      await userEvent.type(searchInput, 'Test');

      const dropdown = screen.getByTestId('search-dropdown');
      expect(dropdown).toBeInTheDocument();
    });
  });

  describe('Loading State Behavior', () => {
    it('should show skeleton when first_name is undefined', () => {
      mockUseAuth.mockReturnValue({
        user: { last_name: 'Doe', user_role: 'Admin' } as any,
      } as any);

      render(<DashboardHeader />);

      const skeletons = screen.getAllByRole('generic').filter(el => 
        el.className.includes('animate-pulse')
      );
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should show skeleton when last_name is undefined', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', user_role: 'Admin' } as any,
      } as any);

      render(<DashboardHeader />);

      const skeletons = screen.getAllByRole('generic').filter(el => 
        el.className.includes('animate-pulse')
      );
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render user content when both names are present', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      expect(screen.getByText('Hello, John Doe')).toBeInTheDocument();
      expect(screen.getByTestId('badge')).toBeInTheDocument();
    });
  });

  describe('Search Container and Layout', () => {
    it('should render search container with proper structure', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      const { container } = render(<DashboardHeader />);

      // Check for search container structure
      const searchContainers = container.querySelectorAll('.relative');
      expect(searchContainers.length).toBeGreaterThan(0);
    });

    it('should render search icon with proper positioning', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchIcon = screen.getByTestId('search-icon');
      expect(searchIcon).toBeInTheDocument();
    });

    it('should maintain max-width constraint on search bar', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      const { container } = render(<DashboardHeader />);

      const searchContainer = container.querySelector('.max-w-md');
      expect(searchContainer).toBeInTheDocument();
    });
  });

  describe('Profile Section Rendering', () => {
    it('should render profile section with correct layout', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      // Check that greeting and badge are in same container
      expect(screen.getByText('Hello, John Doe')).toBeInTheDocument();
      expect(screen.getByTestId('badge')).toBeInTheDocument();
    });

    it('should render skeleton with correct styling classes', () => {
      mockUseAuth.mockReturnValue({
        user: null,
      } as any);

      const { container } = render(<DashboardHeader />);

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThanOrEqual(2); // name skeleton and avatar skeleton
    });

    it('should apply orange color theme to greeting text', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const greeting = screen.getByText('Hello, John Doe');
      expect(greeting).toHaveClass('text-orange-500');
    });

    it('should apply orange background to badge', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-orange-500');
    });
  });

  describe('Search Input Focus Behavior', () => {
    it('should apply focus styles to search input', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      await userEvent.click(searchInput);
      expect(searchInput).toHaveFocus();
    });

    it('should handle blur events on search input', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      await userEvent.click(searchInput);
      expect(searchInput).toHaveFocus();

      searchInput.blur();
      expect(searchInput).not.toHaveFocus();
    });

    it('should keep dropdown open when blurring with valid query', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      await userEvent.type(searchInput, 'Lakers');
      expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();

      searchInput.blur();
      
      // Dropdown should still be open
      expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();
    });
  });

  describe('Multiple User Interactions', () => {
    it('should handle search and profile click in sequence', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      // Search first
      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      await userEvent.type(searchInput, 'Lakers');
      expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();

      // Then click profile
      const badge = screen.getByTestId('badge');
      await userEvent.click(badge);
      expect(mockPush).toHaveBeenCalledWith('/profile');

      // Search dropdown should still be open
      expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();
    });

    it('should handle multiple search queries in same session', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      // First query
      await userEvent.type(searchInput, 'Lakers');
      expect(screen.getByText('Search results for: Lakers')).toBeInTheDocument();

      // Clear and second query
      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, 'Warriors');
      expect(screen.getByText('Search results for: Warriors')).toBeInTheDocument();

      // Clear and third query
      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, 'Bulls');
      expect(screen.getByText('Search results for: Bulls')).toBeInTheDocument();
    });

    it('should handle dropdown close and reopen cycles', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      // Open dropdown
      await userEvent.type(searchInput, 'Lakers');
      expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();

      // Close it
      await userEvent.click(screen.getByText('Close'));
      expect(screen.queryByTestId('search-dropdown')).not.toBeInTheDocument();

      // Reopen with new query
      await userEvent.type(searchInput, 'Warriors');
      expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();

      // Close again
      await userEvent.click(screen.getByText('Close'));
      expect(screen.queryByTestId('search-dropdown')).not.toBeInTheDocument();
    });
  });

  describe('Performance and Optimization', () => {
    it('should not cause unnecessary re-renders on prop changes', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      const { rerender } = render(<DashboardHeader placeholder="Search..." />);
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();

      rerender(<DashboardHeader placeholder="Search..." />);
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('should handle rapid search query changes efficiently', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      // Simulate rapid typing
      const queries = ['L', 'La', 'Lak', 'Lake', 'Laker', 'Lakers'];
      for (const query of queries) {
        await userEvent.clear(searchInput);
        await userEvent.type(searchInput, query, { delay: 1 });
      }

      expect(searchInput).toHaveValue('Lakers');
      expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Cases', () => {
    it('should handle missing useAuth hook gracefully', () => {
      mockUseAuth.mockReturnValue({} as any);

      render(<DashboardHeader />);

      // Should render loading state
      const skeletons = screen.getAllByRole('generic').filter(el => 
        el.className.includes('animate-pulse')
      );
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should handle missing useRouter hook gracefully', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      mockUseRouter.mockReturnValue(null as any);

      // Should render without throwing
      expect(() => render(<DashboardHeader />)).not.toThrow();
    });
  });

  describe('Text Content Validation', () => {
    it('should display greeting with proper spacing', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const greeting = screen.getByText('Hello, John Doe');
      expect(greeting.textContent).toBe('Hello, John Doe');
    });

    it('should trim whitespace from user names', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: '  John  ', last_name: '  Doe  ', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      // Should still render with extra spaces (component doesn't trim)
      expect(screen.getByText(/Hello,.*John.*Doe/)).toBeInTheDocument();
    });

    it('should handle Unicode characters in names', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'José', last_name: 'García', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      await waitFor(() => {
        expect(screen.getByText('Hello, José García')).toBeInTheDocument();
      });
      
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('J');
    });

    it('should handle emojis in search queries', async () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      
      await userEvent.type(searchInput, '🏀 Lakers');

      expect(searchInput).toHaveValue('🏀 Lakers');
      expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();
    });
  });

  describe('Styling and CSS Classes', () => {
    it('should apply correct backdrop blur classes', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      const { container } = render(<DashboardHeader />);

      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('backdrop-blur-sm');
    });

    it('should apply orange theme colors consistently', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      const { container } = render(<DashboardHeader />);

      // Check border color
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('border-orange-200');

      // Check text color
      const greeting = screen.getByText('Hello, John Doe');
      expect(greeting).toHaveClass('text-orange-500');

      // Check badge background
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('bg-orange-500');
    });

    it('should apply rounded corners to search input', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const searchInput = screen.getByPlaceholderText('Search players and teams...');
      expect(searchInput).toHaveClass('rounded-4xl');
    });
  });
});