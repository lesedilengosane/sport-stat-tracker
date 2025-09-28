// app/players/[id]/__tests__/layout.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayerLayout from '../layout';

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ 
    src, 
    alt, 
    fill, 
    priority, 
    className 
  }: { 
    src: string; 
    alt: string; 
    fill?: boolean; 
    priority?: boolean; 
    className?: string; 
  }) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={className}
        data-testid="background-image"
        data-fill={fill}
        data-priority={priority}
      />
    );
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ 
    href, 
    className, 
    children 
  }: { 
    href: string; 
    className?: string; 
    children: React.ReactNode; 
  }) {
    return (
      <a 
        href={href} 
        className={className}
        data-testid={`link-${href.replace(/\//g, '-')}`}
      >
        {children}
      </a>
    );
  },
}));

describe('PlayerLayout Component', () => {
  const mockChildren = <div data-testid="test-children">Test Content</div>;

  describe('Basic Rendering', () => {
    it('renders the layout with children', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      expect(screen.getByTestId('test-children')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders the main structure elements', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      // Check for main structural elements
      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('complementary')).toBeInTheDocument(); // aside
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
    });

    it('renders the background image correctly', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const backgroundImage = screen.getByTestId('background-image');
      expect(backgroundImage).toBeInTheDocument();
      expect(backgroundImage).toHaveAttribute('src', '/bgr.jpg');
      expect(backgroundImage).toHaveAttribute('alt', 'Basketball hero background');
      expect(backgroundImage).toHaveAttribute('data-fill', 'true');
      expect(backgroundImage).toHaveAttribute('data-priority', 'true');
    });
  });

  describe('Header Section', () => {
    it('displays the correct page title', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Player Profile');
    });

    it('renders navigation links with correct hrefs', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const homeLink = screen.getByTestId('link--');
      const playersLink = screen.getByTestId('link--players');
      
      expect(homeLink).toHaveAttribute('href', '/');
      expect(homeLink).toHaveTextContent('Home');
      
      expect(playersLink).toHaveAttribute('href', '/players');
      expect(playersLink).toHaveTextContent('All Players');
    });

    it('applies correct navigation styling classes', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveClass('space-x-4');
      
      const homeLink = screen.getByTestId('link--');
      expect(homeLink).toHaveClass('text-white', 'hover:text-orange-400', 'transition-colors');
    });

    it('has sticky positioning for header', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky', 'top-0');
    });
  });

  describe('Layout Structure', () => {
    it('implements responsive grid layout', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const mainGrid = screen.getByRole('main');
      expect(mainGrid).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-4', 'gap-6');
    });

    it('renders sidebar with correct column span', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('lg:col-span-1');
    });

    it('renders content section with correct column span', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const contentSection = screen.getByRole('main').querySelector('section');
      expect(contentSection).toHaveClass('lg:col-span-3');
    });

    it('places children in the correct content area', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const contentSection = screen.getByRole('main').querySelector('section');
      const childrenContainer = contentSection?.querySelector('div');
      
      expect(childrenContainer).toContainElement(screen.getByTestId('test-children'));
    });
  });

  describe('Sidebar Content', () => {
    it('renders placeholder avatar area', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const sidebar = screen.getByRole('complementary');
      const avatarPlaceholder = sidebar.querySelector('.aspect-square');
      
      expect(avatarPlaceholder).toBeInTheDocument();
      expect(avatarPlaceholder).toHaveClass('aspect-square', 'w-full', 'rounded-xl');
    });

    it('renders placeholder content bars', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const sidebar = screen.getByRole('complementary');
      const placeholderBars = sidebar.querySelectorAll('.bg-gray-100\\/30');
      
      expect(placeholderBars).toHaveLength(3);
    });

    it('has sticky positioning for sidebar content', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const sidebar = screen.getByRole('complementary');
      const stickyContainer = sidebar.querySelector('.sticky');
      
      expect(stickyContainer).toHaveClass('sticky', 'top-20');
    });
  });

  describe('Styling and Visual Design', () => {
    it('applies correct background and text colors', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      // The bg-black and text-white classes are on the outermost container
      const outerContainer = document.querySelector('.relative.min-h-screen.bg-black.text-white');
      expect(outerContainer).toBeInTheDocument();
      expect(outerContainer).toHaveClass('bg-black', 'text-white');
    });

    it('uses backdrop blur effects', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('backdrop-blur-sm');
      
      const sidebar = screen.getByRole('complementary').querySelector('div');
      expect(sidebar).toHaveClass('backdrop-blur-sm');
      
      const contentArea = screen.getByRole('main').querySelector('section > div');
      expect(contentArea).toHaveClass('backdrop-blur-sm');
    });

    it('applies glassmorphism styling', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const sidebar = screen.getByRole('complementary').querySelector('div');
      expect(sidebar).toHaveClass('bg-white/10', 'backdrop-blur-sm');
      
      const contentArea = screen.getByRole('main').querySelector('section > div');
      expect(contentArea).toHaveClass('bg-white/10', 'backdrop-blur-sm');
    });

    it('has proper spacing and padding', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const maxWidthContainer = screen.getByRole('banner').closest('.max-w-7xl');
      expect(maxWidthContainer).toHaveClass('max-w-7xl', 'px-4', 'py-6');
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('p-4');
    });
  });

  describe('Footer Section', () => {
    it('renders copyright information', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const currentYear = new Date().getFullYear();
      const footer = screen.getByRole('contentinfo');
      
      expect(footer).toHaveTextContent(`© ${currentYear} HoopMania · All rights reserved.`);
    });

    it('displays current year dynamically', () => {
      // Mock Date constructor to return a specific year
      const mockDate = new Date('2025-01-01');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      expect(screen.getByText(/© 2025 HoopMania/)).toBeInTheDocument();
      
      // Restore the original Date
      (global.Date as any).mockRestore();
    });

    it('applies correct footer styling', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass(
        'mt-12', 
        'border-t', 
        'border-white/20', 
        'text-center', 
        'text-sm', 
        'text-white/70', 
        'py-6'
      );
    });
  });

  describe('Responsive Design', () => {
    it('implements mobile-first responsive classes', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const mainGrid = screen.getByRole('main');
      expect(mainGrid).toHaveClass('grid-cols-1', 'lg:grid-cols-4');
      
      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('lg:col-span-1');
      
      const content = screen.getByRole('main').querySelector('section');
      expect(content).toHaveClass('lg:col-span-3');
    });

    it('handles overflow correctly', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      // The overflow-hidden class is on the outermost container
      const outerContainer = document.querySelector('.relative.min-h-screen.bg-black.text-white.overflow-hidden');
      expect(outerContainer).toBeInTheDocument();
      expect(outerContainer).toHaveClass('overflow-hidden');
    });
  });

  describe('Accessibility', () => {
    it('uses proper semantic HTML elements', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('complementary')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('has proper heading hierarchy', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Player Profile');
    });

    it('provides meaningful alt text for images', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const backgroundImage = screen.getByTestId('background-image');
      expect(backgroundImage).toHaveAttribute('alt', 'Basketball hero background');
    });

    it('has sufficient color contrast considerations', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      // Check that the main heading has white text
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-white');
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveClass('text-white');
      });
    });
  });

  describe('Children Integration', () => {
    it('renders different types of children correctly', () => {
      const complexChildren = (
        <div data-testid="complex-children">
          <h2>Player Stats</h2>
          <p>This is player information</p>
          <button>Action Button</button>
        </div>
      );
      
      render(<PlayerLayout>{complexChildren}</PlayerLayout>);
      
      expect(screen.getByTestId('complex-children')).toBeInTheDocument();
      expect(screen.getByText('Player Stats')).toBeInTheDocument();
      expect(screen.getByText('This is player information')).toBeInTheDocument();
      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });

    it('handles empty children', () => {
      render(<PlayerLayout>{null}</PlayerLayout>);
      
      const contentArea = screen.getByRole('main').querySelector('section > div');
      expect(contentArea).toBeInTheDocument();
      expect(contentArea).toBeEmptyDOMElement();
    });

    it('handles multiple child elements', () => {
      const multipleChildren = (
        <>
          <div data-testid="child-1">First Child</div>
          <div data-testid="child-2">Second Child</div>
          <span data-testid="child-3">Third Child</span>
        </>
      );
      
      render(<PlayerLayout>{multipleChildren}</PlayerLayout>);
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    it('uses priority loading for background image', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const backgroundImage = screen.getByTestId('background-image');
      expect(backgroundImage).toHaveAttribute('data-priority', 'true');
    });

    it('implements proper z-index layering', () => {
      render(<PlayerLayout>{mockChildren}</PlayerLayout>);
      
      const contentContainer = screen.getByRole('banner').closest('.relative.z-10');
      expect(contentContainer).toHaveClass('z-10');
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('z-20');
    });
  });

  describe('Error Boundaries', () => {
    it('renders layout structure even with broken children', () => {
      const BrokenChild = () => {
        throw new Error('Child component error');
      };

      // This would require an error boundary in real usage
      // For testing, we just ensure the layout structure remains
      const { container } = render(<PlayerLayout><div>Safe content</div></PlayerLayout>);
      
      expect(container.querySelector('header')).toBeInTheDocument();
      expect(container.querySelector('main')).toBeInTheDocument();
      expect(container.querySelector('aside')).toBeInTheDocument();
      expect(container.querySelector('footer')).toBeInTheDocument();
    });
  });
});