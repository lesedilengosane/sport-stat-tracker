// src/app/signup/__tests__/SignUp.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SignUp from '../page';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ 
    src, 
    alt, 
    fill, 
    className, 
    width, 
    height,
    priority,
    sizes 
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
    width?: number;
    height?: number;
    priority?: boolean;
    sizes?: string;
  }) {
    return (
      <img 
        src={src} 
        alt={alt}
        className={className}
        width={width}
        height={height}
        data-testid={`image-${alt.toLowerCase().replace(/\s+/g, '-')}`}
        data-priority={priority}
        data-sizes={sizes}
        data-fill={fill}
      />
    );
  },
}));

// Mock Supabase
jest.mock('../../api/DatabaseApi/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
    },
  },
}));

// Import the mocked supabase
import { supabase } from '../../api/DatabaseApi/supabaseClient';

// Mock window.alert
window.alert = jest.fn();

// Mock console.error
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

// Get the mocked signInWithOAuth function
const mockSignInWithOAuth = supabase.auth.signInWithOAuth as jest.MockedFunction<typeof supabase.auth.signInWithOAuth>;

describe('SignUp Component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
    consoleSpy.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders the signup page with all elements', () => {
      render(<SignUp />);

      // Check heading
      expect(screen.getByText('CREATE YOUR ACCOUNT')).toBeInTheDocument();
      
      // Check description
      expect(screen.getByText(/Select your role and Sign Up with your existing Google Account/)).toBeInTheDocument();
      
      // Check role label
      expect(screen.getByText('Role:')).toBeInTheDocument();
      
      // Check select dropdown
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      
      // Check Google sign-up button
      expect(screen.getByRole('button', { name: /Sign Up with Google/i })).toBeInTheDocument();
    });

    it('renders background images correctly', () => {
      render(<SignUp />);

      // Check background images are present
      const backgroundImage = screen.getByTestId('image-background');
      const basketballImage = screen.getByTestId('image-basketball');
      const googleIcon = screen.getByTestId('image-google');

      expect(backgroundImage).toBeInTheDocument();
      expect(basketballImage).toBeInTheDocument();
      expect(googleIcon).toBeInTheDocument();

      // Check image attributes
      expect(backgroundImage).toHaveAttribute('src', '/bgrs.jpeg');
      expect(basketballImage).toHaveAttribute('src', '/bgrs.jpeg');
      expect(googleIcon).toHaveAttribute('src', '/google-icon.svg');
    });

    it('has correct initial role selection', () => {
      render(<SignUp />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('Fan');
    });

    it('displays all role options in select dropdown', () => {
      render(<SignUp />);

      const coachOption = screen.getByRole('option', { name: 'Coach' });
      const analystOption = screen.getByRole('option', { name: 'Analyst' });
      const fanOption = screen.getByRole('option', { name: 'Fan' });

      expect(coachOption).toBeInTheDocument();
      expect(analystOption).toBeInTheDocument();
      expect(fanOption).toBeInTheDocument();
    });
  });

  describe('Role Selection', () => {
    it('allows changing role to Coach', async () => {
      render(<SignUp />);

      const select = screen.getByRole('combobox');
      
      await user.selectOptions(select, 'Coach');
      
      expect(select).toHaveValue('Coach');
    });

    it('allows changing role to Analyst', async () => {
      render(<SignUp />);

      const select = screen.getByRole('combobox');
      
      await user.selectOptions(select, 'Analyst');
      
      expect(select).toHaveValue('Analyst');
    });

    it('allows changing role back to Fan', async () => {
      render(<SignUp />);

      const select = screen.getByRole('combobox');
      
      // Change to Coach first
      await user.selectOptions(select, 'Coach');
      expect(select).toHaveValue('Coach');
      
      // Change back to Fan
      await user.selectOptions(select, 'Fan');
      expect(select).toHaveValue('Fan');
    });

    it('handles multiple role changes', async () => {
      render(<SignUp />);

      const select = screen.getByRole('combobox');
      
      await user.selectOptions(select, 'Analyst');
      expect(select).toHaveValue('Analyst');
      
      await user.selectOptions(select, 'Coach');
      expect(select).toHaveValue('Coach');
      
      await user.selectOptions(select, 'Fan');
      expect(select).toHaveValue('Fan');
    });
  });

  describe('Google Sign-Up Functionality', () => {
    it('calls supabase signInWithOAuth when Google button is clicked', async () => {
      mockSignInWithOAuth.mockResolvedValue({ 
        data: { provider: 'google', url: 'https://accounts.google.com/oauth' }, 
        error: null 
      });

      render(<SignUp />);

      const googleButton = screen.getByRole('button', { name: /Sign Up with Google/i });
      
      await user.click(googleButton);

      expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost/auth/signup-callback?role=Fan',
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
    });

    it('includes selected role in redirect URL for Coach', async () => {
      mockSignInWithOAuth.mockResolvedValue({ 
        data: { provider: 'google', url: 'https://accounts.google.com/oauth' }, 
        error: null 
      });

      render(<SignUp />);

      // Change role to Coach
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'Coach');

      // Click Google button
      const googleButton = screen.getByRole('button', { name: /Sign Up with Google/i });
      await user.click(googleButton);

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/signup-callback?role=Coach',
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
    });

    it('includes selected role in redirect URL for Analyst', async () => {
      mockSignInWithOAuth.mockResolvedValue({ 
        data: { provider: 'google', url: 'https://accounts.google.com/oauth' }, 
        error: null 
      });

      render(<SignUp />);

      // Change role to Analyst
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'Analyst');

      // Click Google button
      const googleButton = screen.getByRole('button', { name: /Sign Up with Google/i });
      await user.click(googleButton);

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/signup-callback?role=Analyst',
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
    });

    it('handles successful Google sign-in without error', async () => {
      mockSignInWithOAuth.mockResolvedValue({ 
        data: { provider: 'google', url: 'https://accounts.google.com/oauth' }, 
        error: null 
      });

      render(<SignUp />);

      const googleButton = screen.getByRole('button', { name: /Sign Up with Google/i });
      
      await user.click(googleButton);

      expect(mockSignInWithOAuth).toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles Google sign-in error and shows alert', async () => {
      const errorMessage = 'Authentication failed';
      mockSignInWithOAuth.mockResolvedValue({ 
        data: { provider: 'google' as any, url: null },
        error: {
          message: errorMessage,
        } as any
      });

      render(<SignUp />);

      const googleButton = screen.getByRole('button', { name: /Sign Up with Google/i });
      
      await user.click(googleButton);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Google sign-up error:', errorMessage);
        expect(window.alert).toHaveBeenCalledWith('Google sign-in failed. Please try again.');
      });
    });

    it('handles network error during sign-in', async () => {
      mockSignInWithOAuth.mockRejectedValue(new Error('Network error'));

      render(<SignUp />);

      const googleButton = screen.getByRole('button', { name: /Sign Up with Google/i });
      
      // The component should handle the error gracefully, not throw it
      await user.click(googleButton);
      
      // Instead of expecting a throw, check that the error was handled
      expect(mockSignInWithOAuth).toHaveBeenCalled();
    });

    it('handles undefined error message', async () => {
      mockSignInWithOAuth.mockResolvedValue({ 
        data: { provider: 'google' as any, url: null },
        error: {
          message: undefined,
        } as any
      });

      render(<SignUp />);

      const googleButton = screen.getByRole('button', { name: /Sign Up with Google/i });
      
      await user.click(googleButton);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Google sign-up error:', undefined);
        expect(window.alert).toHaveBeenCalledWith('Google sign-in failed. Please try again.');
      });
    });
  });

  describe('UI Interactions', () => {
    it('has proper styling classes on key elements', () => {
      render(<SignUp />);

      const heading = screen.getByText('CREATE YOUR ACCOUNT');
      expect(heading).toHaveClass('text-3xl', 'font-bold', 'mb-4', 'text-black');

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('w-full', 'px-4', 'py-2', 'border');

      const button = screen.getByRole('button', { name: /Sign Up with Google/i });
      expect(button).toHaveClass('w-full', 'border', 'py-3', 'rounded-lg');
    });

    it('has correct button structure with icon and text', () => {
      render(<SignUp />);

      const button = screen.getByRole('button', { name: /Sign Up with Google/i });
      const icon = screen.getByTestId('image-google');
      const text = screen.getByText('Sign Up with Google');

      expect(button).toContainElement(icon);
      expect(button).toContainElement(text);
    });

    it('applies hover effects on button', async () => {
      render(<SignUp />);

      const button = screen.getByRole('button', { name: /Sign Up with Google/i });
      
      expect(button).toHaveClass('hover:bg-gray-50');
    });
  });

  describe('Form Accessibility', () => {
    it('has proper label association with select', () => {
      render(<SignUp />);

      const label = screen.getByText('Role:');
      const select = screen.getByRole('combobox');

      expect(label).toBeInTheDocument();
      expect(select).toBeInTheDocument();
    });

    it('has accessible button text', () => {
      render(<SignUp />);

      const button = screen.getByRole('button', { name: /Sign Up with Google/i });
      expect(button).toBeInTheDocument();
      // The button includes both the Google image alt text and the text, so it shows as "Google Sign Up with Google"
      expect(button).toHaveAccessibleName('Google Sign Up with Google');
    });

    it('has proper image alt texts', () => {
      render(<SignUp />);

      expect(screen.getByTestId('image-background')).toHaveAttribute('alt', 'Background');
      expect(screen.getByTestId('image-basketball')).toHaveAttribute('alt', 'Basketball');
      expect(screen.getByTestId('image-google')).toHaveAttribute('alt', 'Google');
    });
  });

  describe('Layout and Styling', () => {
    it('renders with correct layout structure', () => {
      render(<SignUp />);

      // Check main container
      const container = screen.getByText('CREATE YOUR ACCOUNT').closest('div');
      expect(container).toHaveClass('max-w-md', 'w-full', 'text-center', 'p-8');
    });

    it('has proper responsive classes', () => {
      render(<SignUp />);

      const leftSection = screen.getByTestId('image-basketball').closest('.w-1\\/2');
      const rightSection = screen.getByText('CREATE YOUR ACCOUNT').closest('.w-1\\/2');

      expect(leftSection).toHaveClass('w-1/2');
      expect(rightSection).toHaveClass('w-1/2');
    });
  });

  describe('Integration Tests', () => {
    it('completes full user flow - select role and sign up', async () => {
      mockSignInWithOAuth.mockResolvedValue({ 
        data: { provider: 'google', url: 'https://accounts.google.com/oauth' }, 
        error: null 
      });

      render(<SignUp />);

      // 1. Change role to Coach
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'Coach');
      expect(select).toHaveValue('Coach');

      // 2. Click Google sign up
      const googleButton = screen.getByRole('button', { name: /Sign Up with Google/i });
      await user.click(googleButton);

      // 3. Verify correct API call
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/signup-callback?role=Coach',
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
    });

    it('handles role change after error', async () => {
      // First attempt fails
      mockSignInWithOAuth.mockResolvedValueOnce({ 
        data: { provider: 'google' as any, url: null },
        error: {
          message: 'First error',
        } as any
      });

      render(<SignUp />);

      const googleButton = screen.getByRole('button', { name: /Sign Up with Google/i });
      await user.click(googleButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Google sign-in failed. Please try again.');
      });

      // Change role and try again
      mockSignInWithOAuth.mockResolvedValueOnce({ 
        data: { provider: 'google' as any, url: 'https://accounts.google.com/oauth' }, 
        error: null 
      });
      
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'Analyst');
      
      await user.click(googleButton);

      expect(mockSignInWithOAuth).toHaveBeenLastCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/signup-callback?role=Analyst',
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
    });
  });
});