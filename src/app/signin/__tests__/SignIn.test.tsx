// src/app/signin/__tests__/SignIn.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignIn from '../page';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ 
    src, 
    alt, 
    className, 
    width, 
    height, 
    fill 
  }: { 
    src: string; 
    alt: string; 
    className?: string;
    width?: number;
    height?: number;
    fill?: boolean;
  }) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={className}
        width={width}
        height={height}
        data-testid={`image-${alt.toLowerCase().replace(/\s+/g, '-')}`}
        data-fill={fill}
      />
    );
  },
}));

// Mock Supabase client
jest.mock('../../api/DatabaseApi/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
    },
  },
}));

// Import the mocked supabase to access the mock function
import { supabase } from '../../api/DatabaseApi/supabaseClient';
const mockSignInWithOAuth = supabase.auth.signInWithOAuth as jest.MockedFunction<typeof supabase.auth.signInWithOAuth>;

// Mock CSS modules
jest.mock('../../landing.module.css', () => ({
  someClass: 'mocked-class',
}));

// Mock window.location more safely
const originalLocation = window.location;

beforeAll(() => {
  delete (window as any).location;
  (window as any).location = { origin: 'http://localhost:3000' };
});

afterAll(() => {
  (window as any).location = originalLocation;
});

// Mock window.alert
const mockAlert = jest.fn();
global.alert = mockAlert;

// Mock console.error
const mockConsoleError = jest.fn();
global.console.error = mockConsoleError;

describe('SignIn Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the signin page with all elements', () => {
      render(<SignIn />);

      // Check for main heading
      expect(screen.getByText('WELCOME BACK')).toBeInTheDocument();
      
      // Check for subtitle
      expect(screen.getByText('Use your existing Google Account to Log In')).toBeInTheDocument();
      
      // Check for Google sign-in button
      expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
    });

    it('renders background images', () => {
      render(<SignIn />);

      // Check for background images
      const backgroundImages = screen.getAllByTestId('image-background');
      expect(backgroundImages).toHaveLength(2); // Two background images in the component
    });

    it('renders basketball image on left side', () => {
      render(<SignIn />);

      const basketballImage = screen.getByTestId('image-basketball');
      expect(basketballImage).toBeInTheDocument();
      expect(basketballImage).toHaveAttribute('src', '/bg.jpg');
    });

    it('renders Google icon in the sign-in button', () => {
      render(<SignIn />);

      const googleIcon = screen.getByTestId('image-google');
      expect(googleIcon).toBeInTheDocument();
      expect(googleIcon).toHaveAttribute('src', '/google-icon.svg');
    });

    it('has correct styling classes', () => {
      render(<SignIn />);

      // Check if the main container has correct classes
      const mainContainer = screen.getByText('WELCOME BACK').closest('div');
      expect(mainContainer).toHaveClass('max-w-md', 'w-full', 'text-center', 'p-8');

      // Check Google button styling
      const googleButton = screen.getByRole('button', { name: /sign in with google/i });
      expect(googleButton).toHaveClass('w-full', 'border', 'border-gray-300');
    });
  });

  describe('Google Sign-In Functionality', () => {
    it('calls handleGoogleSignIn when button is clicked', async () => {
      mockSignInWithOAuth.mockResolvedValueOnce({ 
        data: { provider: 'google', url: 'https://accounts.google.com/oauth' }, 
        error: null 
      } as any);

      render(<SignIn />);

      const googleButton = screen.getByRole('button', { name: /sign in with google/i });
      
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
      });
    });

    it('calls supabase.auth.signInWithOAuth with correct parameters', async () => {
      mockSignInWithOAuth.mockResolvedValueOnce({ 
        data: { provider: 'google', url: 'https://accounts.google.com/oauth' }, 
        error: null 
      } as any);

      render(<SignIn />);

      const googleButton = screen.getByRole('button', { name: /sign in with google/i });
      
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: 'http://localhost:3000/auth/signin-callback',
          },
        });
      });
    });

    it('uses correct redirect URL based on window.location.origin', async () => {
      // Change the mock location origin
      (window as any).location.origin = 'https://myapp.com';
      mockSignInWithOAuth.mockResolvedValueOnce({ 
        data: { provider: 'google', url: 'https://accounts.google.com/oauth' }, 
        error: null 
      } as any);

      render(<SignIn />);

      const googleButton = screen.getByRole('button', { name: /sign in with google/i });
      
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: 'https://myapp.com/auth/signin-callback',
          },
        });
      });

      // Reset for other tests
      (window as any).location.origin = 'http://localhost:3000';
    });
  });

  describe('Error Handling', () => {
    it('handles sign-in errors properly', async () => {
      const errorMessage = 'Authentication failed';
      mockSignInWithOAuth.mockResolvedValueOnce({ 
        data: { provider: 'google', url: 'https://accounts.google.com/oauth' },
        error: { 
          message: errorMessage
        }
      } as any);

      render(<SignIn />);

      const googleButton = screen.getByRole('button', { name: /sign in with google/i });
      
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith('Google sign-in error:', errorMessage);
        expect(mockAlert).toHaveBeenCalledWith('Google sign-in failed. Please try again.');
      });
    });

    it('logs error to console when sign-in fails', async () => {
      const errorMessage = 'Network error';
      mockSignInWithOAuth.mockResolvedValueOnce({ 
        data: { provider: 'google', url: 'https://accounts.google.com/oauth' },
        error: { 
          message: errorMessage
        }
      } as any);

      render(<SignIn />);

      const googleButton = screen.getByRole('button', { name: /sign in with google/i });
      
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith('Google sign-in error:', errorMessage);
      });
    });

    it('shows alert when sign-in fails', async () => {
      mockSignInWithOAuth.mockResolvedValueOnce({ 
        data: { provider: 'google', url: 'https://accounts.google.com/oauth' },
        error: { 
          message: 'Some error'
        }
      } as any);

      render(<SignIn />);

      const googleButton = screen.getByRole('button', { name: /sign in with google/i });
      
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Google sign-in failed. Please try again.');
      });
    });
  });

  describe('Successful Sign-In', () => {
    it('does not show error when sign-in succeeds', async () => {
      mockSignInWithOAuth.mockResolvedValueOnce({ 
        data: { provider: 'google', url: 'https://accounts.google.com/oauth' }, 
        error: null 
      } as any);

      render(<SignIn />);

      const googleButton = screen.getByRole('button', { name: /sign in with google/i });
      
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalled();
      });

      // Should not call error handlers
      expect(mockConsoleError).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has accessible button text', () => {
      render(<SignIn />);

      const button = screen.getByRole('button', { name: /sign in with google/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAccessibleName();
    });

    it('has proper alt text for images', () => {
      render(<SignIn />);

      const backgroundImage = screen.getByTestId('image-background');
      expect(backgroundImage).toHaveAttribute('alt', 'Background');

      const basketballImage = screen.getByTestId('image-basketball');
      expect(basketballImage).toHaveAttribute('alt', 'Basketball');

      const googleIcon = screen.getByTestId('image-google');
      expect(googleIcon).toHaveAttribute('alt', 'Google');
    });

    it('has proper heading structure', () => {
      render(<SignIn />);

      const heading = screen.getByText('WELCOME BACK');
      expect(heading.tagName).toBe('H2');
    });
  });

  describe('Layout and Structure', () => {
    it('has correct layout structure', () => {
      render(<SignIn />);

      // Check for two-column layout
      const leftSide = screen.getByTestId('image-basketball').closest('.w-1\\/2');
      const rightSide = screen.getByText('WELCOME BACK').closest('.w-1\\/2');

      expect(leftSide).toBeInTheDocument();
      expect(rightSide).toBeInTheDocument();
    });

    it('applies backdrop blur to background', () => {
      render(<SignIn />);

      const backdropElement = document.querySelector('.backdrop-blur-sm');
      expect(backdropElement).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('button has hover effects class', () => {
      render(<SignIn />);

      const googleButton = screen.getByRole('button', { name: /sign in with google/i });
      expect(googleButton).toHaveClass('hover:bg-gray-50', 'transition');
    });

    it('button can be clicked multiple times', async () => {
      mockSignInWithOAuth.mockResolvedValue({ 
        data: { provider: 'google', url: 'https://accounts.google.com/oauth' }, 
        error: null 
      } as any);

      render(<SignIn />);

      const googleButton = screen.getByRole('button', { name: /sign in with google/i });
      
      fireEvent.click(googleButton);
      fireEvent.click(googleButton);
      
      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledTimes(2);
      });
    });
  });
});