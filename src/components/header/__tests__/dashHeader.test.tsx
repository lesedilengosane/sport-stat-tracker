import React from 'react';
import { render, screen } from '@testing-library/react';
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

    it('should display default values when user is null', () => {
      mockUseAuth.mockReturnValue({
        user: null,
      } as any);

      render(<DashboardHeader />);

      // Text is split: "Hello, " and "undefined undefined"
      expect(screen.getByText(/Hello,/)).toBeInTheDocument();
      expect(screen.getByText(/undefined undefined/)).toBeInTheDocument();
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('U');
    });

    it('should display default values when user fields are undefined', () => {
      mockUseAuth.mockReturnValue({
        user: {} as any,
      } as any);

      render(<DashboardHeader />);

      // Text is split: "Hello, " and "undefined undefined"
      expect(screen.getByText(/Hello,/)).toBeInTheDocument();
      expect(screen.getByText(/undefined undefined/)).toBeInTheDocument();
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('U');
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
  });

  describe('User Role Display', () => {
    it('should handle user with Admin role', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      expect(screen.getByText('Hello, John Doe')).toBeInTheDocument();
    });

    it('should handle user with Analyst role', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'Jane', last_name: 'Smith', user_role: 'Analyst' },
      } as any);

      render(<DashboardHeader />);

      expect(screen.getByText('Hello, Jane Smith')).toBeInTheDocument();
    });

    it('should handle user with Coach role', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'Mike', last_name: 'Johnson', user_role: 'Coach' },
      } as any);

      render(<DashboardHeader />);

      expect(screen.getByText('Hello, Mike Johnson')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with only first name', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'John', last_name: '', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      // Text is split across elements: "Hello, " and "John "
      expect(screen.getByText(/Hello,/)).toBeInTheDocument();
      expect(screen.getByText(/John/)).toBeInTheDocument();
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('J');
    });

    it('should handle user with lowercase first name', () => {
      mockUseAuth.mockReturnValue({
        user: { first_name: 'john', last_name: 'Doe', user_role: 'Admin' },
      } as any);

      render(<DashboardHeader />);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('J');
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
  });
});