import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Navbar } from '../NavBar';

// Mock Next.js components
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('next/image', () => {
  return function MockImage({ src, alt, width, height, className }: any) {
    return (
      <img 
        src={src} 
        alt={alt} 
        width={width} 
        height={height} 
        className={className}
        data-testid="profile-image"
      />
    );
  };
});

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  SearchIcon: ({ className }: { className?: string }) => (
    <div data-testid="search-icon" className={className}>SearchIcon</div>
  )
}));

// Mock Supabase client
jest.mock('../../../../app/api/DatabaseApi/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    }
  }
}));

// Import the mocked supabase after mocking
import { supabase } from '../../../../app/api/DatabaseApi/supabaseClient';

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('Initial Rendering', () => {
    test('renders navbar with default elements', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null
      });

      render(<Navbar />);

      // Check main elements
      expect(screen.getByText('StatTracker')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search teams, players, games...')).toBeInTheDocument();
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
      expect(screen.getByText('Hello, User')).toBeInTheDocument();
    });

    test('applies correct CSS classes to main elements', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null
      });

      const { container } = render(<Navbar />);

      const header = container.querySelector('header');
      expect(header).toHaveClass('bg-gray-800', 'border-b', 'border-gray-700');

      const searchInput = screen.getByPlaceholderText('Search teams, players, games...');
      expect(searchInput).toHaveClass('w-full', 'bg-gray-700', 'rounded-full');

      const searchIcon = screen.getByTestId('search-icon');
      expect(searchIcon).toHaveClass('absolute', 'left-3', 'top-2.5', 'h-4', 'w-4', 'text-gray-400');
    });
  });

  describe('User Authentication States', () => {
    test('displays default user when no user is authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null
      });

      render(<Navbar />);

      await waitFor(() => {
        expect(screen.getByText('Hello, User')).toBeInTheDocument();
      });

      // Should show default avatar with "U"
      expect(screen.getByText('U')).toBeInTheDocument();
      expect(screen.queryByTestId('profile-image')).not.toBeInTheDocument();
    });

    test('displays user with full name when authenticated', async () => {
      const mockUser = {
        email: 'john.doe@example.com',
        user_metadata: {
          full_name: 'John Doe',
          avatar_url: null
        }
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      render(<Navbar />);

      await waitFor(() => {
        expect(screen.getByText('Hello, John')).toBeInTheDocument();
      });

      // Should show avatar with first letter of name
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    test('displays user with email fallback when no full name', async () => {
      const mockUser = {
        email: 'jane.smith@example.com',
        user_metadata: {}
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      render(<Navbar />);

      await waitFor(() => {
        expect(screen.getByText('Hello, jane.smith@example.com')).toBeInTheDocument();
      });
    });

    test('displays profile image when available', async () => {
      const mockUser = {
        email: 'john.doe@example.com',
        user_metadata: {
          full_name: 'John Doe',
          avatar_url: 'https://example.com/avatar.jpg'
        }
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      render(<Navbar />);

      await waitFor(() => {
        expect(screen.getByTestId('profile-image')).toBeInTheDocument();
      });

      const profileImage = screen.getByTestId('profile-image');
      expect(profileImage).toHaveAttribute('src', 'https://example.com/avatar.jpg');
      expect(profileImage).toHaveAttribute('alt', 'Profile');
    });

    test('handles multi-word names correctly', async () => {
      const mockUser = {
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Mary Jane Watson Smith'
        }
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      render(<Navbar />);

      await waitFor(() => {
        expect(screen.getByText('Hello, Mary')).toBeInTheDocument();
      });

      // Should show avatar with "M"
      expect(screen.getByText('M')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles Supabase auth error gracefully', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Authentication failed' }
      });

      render(<Navbar />);

      await waitFor(() => {
        expect(screen.getByText('Hello, User')).toBeInTheDocument();
      });

      // Should fallback to default user display
      expect(screen.getByText('U')).toBeInTheDocument();
    });

    test('handles network errors gracefully', async () => {
      (supabase.auth.getUser as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<Navbar />);

      // Should still render with default values
      expect(screen.getByText('Hello, User')).toBeInTheDocument();
      expect(screen.getByText('U')).toBeInTheDocument();
    });
  });

  describe('Navigation and Links', () => {
    test('profile link has correct href', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null
      });

      render(<Navbar />);

      const profileLink = screen.getByRole('link');
      expect(profileLink).toHaveAttribute('href', '/dashboard/profile');
    });

    test('profile link contains avatar or image', async () => {
      const mockUser = {
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User'
        }
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      render(<Navbar />);

      await waitFor(() => {
        expect(screen.getByText('Hello, Test')).toBeInTheDocument();
      });

      const profileLink = screen.getByRole('link');
      expect(profileLink).toBeInTheDocument();
      
      // Should contain either avatar div or profile image
      const avatarDiv = profileLink.querySelector('div');
      expect(avatarDiv).toBeInTheDocument();
    });
  });

  describe('Avatar Styling', () => {
    test('default avatar has correct styling', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null
      });

      render(<Navbar />);

      await waitFor(() => {
        const avatarDiv = screen.getByText('U').closest('div');
        expect(avatarDiv).toHaveClass(
          'h-10', 'w-10', 'rounded-full', 'bg-blue-500', 
          'flex', 'items-center', 'justify-center', 'text-white', 'font-medium'
        );
      });
    });

    test('profile image has correct styling', async () => {
      const mockUser = {
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User',
          avatar_url: 'https://example.com/avatar.jpg'
        }
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      render(<Navbar />);

      await waitFor(() => {
        const profileImage = screen.getByTestId('profile-image');
        expect(profileImage).toHaveClass(
          'rounded-full', 'border-2', 'border-white', 'shadow-md', 'cursor-pointer'
        );
        expect(profileImage).toHaveAttribute('width', '40');
        expect(profileImage).toHaveAttribute('height', '40');
      });
    });
  });

  describe('Search Functionality', () => {
    test('search input has correct attributes', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null
      });

      render(<Navbar />);

      const searchInput = screen.getByPlaceholderText('Search teams, players, games...');
      expect(searchInput).toHaveAttribute('type', 'text');
      expect(searchInput).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
    });

    test('search container has correct structure', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null
      });

      const { container } = render(<Navbar />);

      const searchContainer = container.querySelector('.flex-1.max-w-md.mx-4');
      expect(searchContainer).toBeInTheDocument();

      const relativeContainer = searchContainer?.querySelector('.relative');
      expect(relativeContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty user metadata', async () => {
      const mockUser = {
        email: '',
        user_metadata: {}
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      render(<Navbar />);

      await waitFor(() => {
        expect(screen.getByText('Hello, User')).toBeInTheDocument();
      });
    });

    test('handles user with undefined metadata', async () => {
      const mockUser = {
        email: 'test@example.com'
        // user_metadata is undefined
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      render(<Navbar />);

      await waitFor(() => {
        expect(screen.getByText('Hello, test@example.com')).toBeInTheDocument();
      });
    });

    test('handles single character names', async () => {
      const mockUser = {
        email: 'x@example.com',
        user_metadata: {
          full_name: 'X'
        }
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      render(<Navbar />);

      await waitFor(() => {
        expect(screen.getByText('Hello, X')).toBeInTheDocument();
        expect(screen.getByText('X')).toBeInTheDocument();
      });
    });
  });
});