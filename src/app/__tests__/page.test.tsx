import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Home from '../page'; // Adjust path as needed

// Mock Next.js components and hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/image', () => {
  return function MockImage({ src, alt, className, fill, priority, ...props }: any) {
    // Handle Next.js Image specific props that don't translate to img element
    const imgProps = { ...props };
    delete imgProps.fill;
    delete imgProps.priority;
    
    return (
      <img 
        src={src} 
        alt={alt} 
        className={className}
        data-testid="background-image"
        data-fill={fill?.toString()}
        data-priority={priority?.toString()}
        {...imgProps}
      />
    );
  };
});

// Mock timers
jest.useFakeTimers();

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

describe('Home Component', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
  });

  it('renders the main heading correctly', () => {
    render(<Home />);
    
    expect(screen.getByText('TRACK EVERY PLAY.')).toBeInTheDocument();
    expect(screen.getByText('OWN THE GAME.')).toBeInTheDocument();
  });

  it('renders the subtitle correctly', () => {
    render(<Home />);
    
    const subtitle = screen.getByText(/THE BRIGHTEST LIGHTS/);
    expect(subtitle).toBeInTheDocument();
    expect(subtitle).toHaveTextContent(
      "THE BRIGHTEST LIGHTS. THE LOUDEST CROWDS. THE BIGGEST GAMES. GET THE STATS THAT DEFINE THE MOMENTS YOU'LL NEVER FORGET."
    );
  });

  it('renders sign in and sign up buttons', () => {
    render(<Home />);
    
    expect(screen.getByText('SIGN IN')).toBeInTheDocument();
    expect(screen.getByText('SIGN UP')).toBeInTheDocument();
  });

  it('renders background image with correct props', () => {
    render(<Home />);
    
    const image = screen.getByTestId('background-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/background/landing.png');
    expect(image).toHaveAttribute('alt', 'Basketball player dunking');
  });

  it('navigates to signin when SIGN IN button is clicked', () => {
    render(<Home />);
    
    const signInButton = screen.getByText('SIGN IN');
    fireEvent.click(signInButton);
    
    expect(mockPush).toHaveBeenCalledWith('signin');
  });

  it('navigates to signup when SIGN UP button is clicked', () => {
    render(<Home />);
    
    const signUpButton = screen.getByText('SIGN UP');
    fireEvent.click(signUpButton);
    
    expect(mockPush).toHaveBeenCalledWith('signup');
  });

  it('shows text after 500ms delay', async () => {
    render(<Home />);
    
    // Initially, text should have opacity-0 class - check the h1 parent element
    const headingContainer = screen.getByText('TRACK EVERY PLAY.').closest('h1');
    expect(headingContainer?.className).toContain('opacity-0');
    
    // Fast forward 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Text should now be visible
    await waitFor(() => {
      expect(headingContainer?.className).toContain('opacity-100');
    });
  });

  it('shows buttons after 1400ms delay', async () => {
    render(<Home />);
    
    const signInButton = screen.getByText('SIGN IN');
    expect(signInButton.className).toContain('opacity-0');
    
    // Fast forward 1400ms
    act(() => {
      jest.advanceTimersByTime(1400);
    });
    
    await waitFor(() => {
      expect(signInButton.className).toContain('opacity-100');
    });
  });

  it('activates blur on button hover', async () => {
    render(<Home />);
    
    const signInButton = screen.getByText('SIGN IN');
    const backgroundImage = screen.getByTestId('background-image');
    
    // Initially no blur
    expect(backgroundImage.className).not.toContain('blur-sm');
    
    // Hover over button
    fireEvent.mouseEnter(signInButton);
    
    await waitFor(() => {
      expect(backgroundImage.className).toContain('blur-sm');
    });
    
    // Mouse leave should remove blur
    fireEvent.mouseLeave(signInButton);
    
    await waitFor(() => {
      expect(backgroundImage.className).not.toContain('blur-sm');
    });
  });

  it('activates blur on sign up button hover', async () => {
    render(<Home />);
    
    const signUpButton = screen.getByText('SIGN UP');
    const backgroundImage = screen.getByTestId('background-image');
    
    fireEvent.mouseEnter(signUpButton);
    
    await waitFor(() => {
      expect(backgroundImage.className).toContain('blur-sm');
    });
    
    fireEvent.mouseLeave(signUpButton);
    
    await waitFor(() => {
      expect(backgroundImage.className).not.toContain('blur-sm');
    });
  });

  it('sets isLoaded to true on mount', () => {
    render(<Home />);
    
    const backgroundImage = screen.getByTestId('background-image');
    expect(backgroundImage.className).toContain('opacity-100');
    expect(backgroundImage.className).toContain('scale-100');
  });

  it('has correct styling classes for responsive design', () => {
    render(<Home />);
    
    // Check main heading has responsive text sizes - get the h1 parent element
    const heading = screen.getByText('TRACK EVERY PLAY.').closest('h1');
    expect(heading?.className).toContain('text-4xl');
    expect(heading?.className).toContain('md:text-6xl');
    
    // Check subtitle has responsive text sizes
    const subtitle = screen.getByText(/THE BRIGHTEST LIGHTS/);
    expect(subtitle.className).toContain('text-lg');
    expect(subtitle.className).toContain('md:text-xl');
  });

  it('applies correct button styling', () => {
    render(<Home />);
    
    const signInButton = screen.getByText('SIGN IN');
    const signUpButton = screen.getByText('SIGN UP');
    
    // Sign in button styling
    expect(signInButton.className).toContain('bg-orange-500');
    expect(signInButton.className).toContain('hover:bg-orange-600');
    expect(signInButton.className).toContain('text-white');
    expect(signInButton.className).toContain('rounded-xl');
    
    // Sign up button styling
    expect(signUpButton.className).toContain('border-2');
    expect(signUpButton.className).toContain('border-orange-500');
    expect(signUpButton.className).toContain('text-orange-500');
    expect(signUpButton.className).toContain('bg-transparent');
  });

  it('cleans up timers on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
    
    const { unmount } = render(<Home />);
    unmount();
    
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(2); // textTimer and buttonTimer
    
    clearTimeoutSpy.mockRestore();
  });

  it('has proper accessibility attributes', () => {
    render(<Home />);
    
    const signInButton = screen.getByText('SIGN IN');
    const signUpButton = screen.getByText('SIGN UP');
    
    expect(signInButton.tagName).toBe('BUTTON');
    expect(signUpButton.tagName).toBe('BUTTON');
  });

  it('handles multiple button interactions correctly', async () => {
    render(<Home />);
    
    const signInButton = screen.getByText('SIGN IN');
    const signUpButton = screen.getByText('SIGN UP');
    
    // Test multiple clicks
    fireEvent.click(signInButton);
    fireEvent.click(signUpButton);
    fireEvent.click(signInButton);
    
    expect(mockPush).toHaveBeenCalledTimes(3);
    expect(mockPush).toHaveBeenNthCalledWith(1, 'signin');
    expect(mockPush).toHaveBeenNthCalledWith(2, 'signup');
    expect(mockPush).toHaveBeenNthCalledWith(3, 'signin');
  });

  it('maintains blur state during rapid hover events', async () => {
    render(<Home />);
    
    const signInButton = screen.getByText('SIGN IN');
    const backgroundImage = screen.getByTestId('background-image');
    
    // Rapid hover on/off
    fireEvent.mouseEnter(signInButton);
    fireEvent.mouseLeave(signInButton);
    fireEvent.mouseEnter(signInButton);
    
    await waitFor(() => {
      expect(backgroundImage.className).toContain('blur-sm');
    });
  });

  it('shows animation timing classes correctly', () => {
    render(<Home />);
    
    const heading1 = screen.getByText('TRACK EVERY PLAY.').closest('h1');
    const heading2 = screen.getByText('OWN THE GAME.');
    const subtitle = screen.getByText(/THE BRIGHTEST LIGHTS/);
    
    expect(heading1?.className).toContain('duration-800');
    expect(heading2.className).toContain('duration-800');
    expect(heading2.className).toContain('delay-200');
    expect(subtitle.className).toContain('delay-500');
  });
});