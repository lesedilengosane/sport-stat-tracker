// src/app/players/[id]/__tests__/LoadingPlayer.test.tsx
import { render, screen } from '@testing-library/react';
import LoadingPlayer from '../loading';

// Mock Next.js router if needed
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/player/123',
  }),
}));

describe('LoadingPlayer Component', () => {
  beforeEach(() => {
    render(<LoadingPlayer />);
  });

  describe('Structure and Layout', () => {
    it('renders the main container with correct classes', () => {
      const container = document.querySelector('.mx-auto.max-w-3xl.p-6.animate-pulse');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('mx-auto', 'max-w-3xl', 'p-6', 'animate-pulse');
    });

    it('renders header skeleton section', () => {
      // Check for avatar skeleton
      const avatarSkeleton = document.querySelector('.h-20.w-20.rounded-full.bg-gray-300');
      expect(avatarSkeleton).toBeInTheDocument();
      
      // Check for name and position skeletons
      const nameSkeletons = document.querySelectorAll('.space-y-2 .rounded.bg-gray-300, .space-y-2 .rounded.bg-gray-200');
      expect(nameSkeletons.length).toBeGreaterThan(0);
    });

    it('renders table skeleton with correct structure', () => {
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      expect(table).toHaveClass('min-w-full', 'divide-y', 'divide-gray-200', 'border');
    });

    it('renders table headers correctly', () => {
      expect(screen.getByText('Stat')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
    });

    it('renders correct number of table rows', () => {
      const tbody = document.querySelector('tbody');
      const rows = tbody?.querySelectorAll('tr');
      expect(rows).toHaveLength(7);
    });

    it('renders shooting stats skeleton section', () => {
      const shootingSection = document.querySelector('.mt-8.space-y-2');
      expect(shootingSection).toBeInTheDocument();
      
      const skeletonBars = shootingSection?.querySelectorAll('.h-4.rounded.bg-gray-200, .h-5.rounded.bg-gray-300');
      expect(skeletonBars?.length).toBe(4);
    });
  });

  describe('Skeleton Elements', () => {
    it('has correct skeleton dimensions for avatar', () => {
      const avatar = document.querySelector('.h-20.w-20.rounded-full.bg-gray-300');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('h-20', 'w-20', 'rounded-full', 'bg-gray-300');
    });

    it('has correct skeleton dimensions for name elements', () => {
      const nameElement = document.querySelector('.h-5.w-40.rounded.bg-gray-300');
      const positionElement = document.querySelector('.h-4.w-24.rounded.bg-gray-200');
      
      expect(nameElement).toBeInTheDocument();
      expect(positionElement).toBeInTheDocument();
    });

    it('renders skeleton elements in each table row', () => {
      const statSkeletons = document.querySelectorAll('td .h-4.w-32.rounded.bg-gray-200');
      const valueSkeletons = document.querySelectorAll('td .h-4.w-16.rounded.bg-gray-200');
      
      expect(statSkeletons).toHaveLength(7);
      expect(valueSkeletons).toHaveLength(7);
    });

    it('has correct skeleton dimensions for shooting stats', () => {
      const shootingSection = document.querySelector('.mt-8.space-y-2');
      
      const titleSkeleton = shootingSection?.querySelector('.h-5.w-32.rounded.bg-gray-300');
      const statSkeletons = shootingSection?.querySelectorAll('.h-4.w-40.rounded.bg-gray-200');
      
      expect(titleSkeleton).toBeInTheDocument();
      expect(statSkeletons).toHaveLength(3);
    });
  });

  describe('CSS Classes and Styling', () => {
    it('applies pulse animation to main container', () => {
      const container = document.querySelector('.animate-pulse');
      expect(container).toBeInTheDocument();
    });

    it('applies correct table styling classes', () => {
      const table = screen.getByRole('table');
      expect(table).toHaveClass('min-w-full', 'divide-y', 'divide-gray-200', 'border');
      
      const thead = table.querySelector('thead');
      expect(thead).toHaveClass('bg-gray-50');
    });

    it('applies correct spacing classes', () => {
      const headerSection = document.querySelector('.mb-6.flex.items-center.gap-4');
      const nameSpace = document.querySelector('.space-y-2');
      const shootingSpace = document.querySelector('.mt-8.space-y-2');
      
      expect(headerSection).toBeInTheDocument();
      expect(nameSpace).toBeInTheDocument();
      expect(shootingSpace).toBeInTheDocument();
    });

    it('applies responsive classes', () => {
      const container = document.querySelector('.mx-auto.max-w-3xl.p-6');
      const tableContainer = document.querySelector('.overflow-x-auto');
      
      expect(container).toBeInTheDocument();
      expect(tableContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper table structure for screen readers', () => {
      const table = screen.getByRole('table');
      const columnHeaders = screen.getAllByRole('columnheader');
      
      expect(table).toBeInTheDocument();
      expect(columnHeaders).toHaveLength(2);
      expect(columnHeaders[0]).toHaveTextContent('Stat');
      expect(columnHeaders[1]).toHaveTextContent('Value');
    });

    it('table headers have correct semantic markup', () => {
      const headers = document.querySelectorAll('th');
      headers.forEach(header => {
        expect(header).toHaveClass('px-4', 'py-2', 'text-left', 'text-sm', 'font-semibold');
      });
    });
  });

  describe('Component Export', () => {
    it('exports LoadingPlayer as default', () => {
      expect(LoadingPlayer).toBeDefined();
      expect(typeof LoadingPlayer).toBe('function');
    });

    it('renders without crashing', () => {
      expect(() => render(<LoadingPlayer />)).not.toThrow();
    });
  });
});

// Additional integration-style tests
describe('LoadingPlayer Integration', () => {
  it('matches expected snapshot', () => {
    const { container } = render(<LoadingPlayer />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('maintains consistent skeleton structure', () => {
    const { container } = render(<LoadingPlayer />);
    
    // Verify the complete skeleton structure is present
    const skeletonElements = container.querySelectorAll('[class*="bg-gray"]');
    expect(skeletonElements.length).toBeGreaterThan(15); // Should have many skeleton elements
  });

  it('provides visual loading feedback', () => {
    const { container } = render(<LoadingPlayer />);
    
    // Check that animate-pulse is applied to provide visual feedback
    const animatedElement = container.querySelector('.animate-pulse');
    expect(animatedElement).toBeInTheDocument();
  });
});