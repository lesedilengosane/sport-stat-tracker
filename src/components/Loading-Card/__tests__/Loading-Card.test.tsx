// __tests__/GameCardSkeleton.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GameCardSkeleton } from '../game-card-skeleton';

// No mocking - test with the actual Card component
describe('GameCardSkeleton Component', () => {
  
  describe('Component Structure', () => {
    it('renders the main card container with correct styling', () => {
      render(<GameCardSkeleton />);
      // Use a more generic selector since we can't control the Card component's attributes
      const container = document.querySelector('.bg-white.border.border-gray-200.p-3');
      expect(container).toBeInTheDocument();
    });

    it('renders all skeleton sections', () => {
      render(<GameCardSkeleton />);
      
      // Count all skeleton elements with animate-pulse class
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      // Your component has 9 skeleton elements - adjust this if your structure changes
      expect(skeletonElements.length).toBeGreaterThanOrEqual(8);
      expect(skeletonElements.length).toBeLessThanOrEqual(10);
      
      // More specific: verify we have the expected structure
      expect(skeletonElements.length).toBe(9);
    });
  });

  describe('Date and Time Section', () => {
    it('renders date and time skeleton elements with correct classes', () => {
      render(<GameCardSkeleton />);
      
      const dateTimeSection = document.querySelector('.flex.items-center.justify-between.text-xs.mb-2');
      expect(dateTimeSection).toBeInTheDocument();
      
      const skeletonElements = dateTimeSection?.querySelectorAll('.animate-pulse');
      expect(skeletonElements?.length).toBe(2);
    });

    it('has correct animation delays for date and time elements', () => {
      render(<GameCardSkeleton />);
      
      const dateTimeSection = document.querySelector('.flex.items-center.justify-between.text-xs.mb-2');
      const skeletonElements = dateTimeSection?.querySelectorAll('.animate-pulse');
      
      expect(skeletonElements?.[0]).toHaveStyle('animation-delay: 0s');
      expect(skeletonElements?.[1]).toHaveStyle('animation-delay: 0.1s');
    });
  });

  describe('Teams Section', () => {
    it('renders the teams container with VS text', () => {
      render(<GameCardSkeleton />);
      
      expect(screen.getByText('VS')).toBeInTheDocument();
      expect(screen.getByText('VS')).toHaveClass('text-gray-400', 'font-bold', 'text-sm', 'mx-2');
    });

    it('renders home and away team skeletons', () => {
      render(<GameCardSkeleton />);
      
      const teamsSection = document.querySelector('.flex.items-center.justify-between.my-2');
      expect(teamsSection).toBeInTheDocument();
      
      // Should have two team containers
      const teamContainers = teamsSection?.querySelectorAll('.flex.flex-col.items-center.flex-1');
      expect(teamContainers).toHaveLength(2);
    });

    it('renders team logo and name skeletons with correct dimensions', () => {
      render(<GameCardSkeleton />);
      
      // Team logos (circular skeletons)
      const teamLogos = document.querySelectorAll('.w-16.h-16.bg-gray-300.rounded-full.mb-1.animate-pulse');
      expect(teamLogos).toHaveLength(2);
      
      // Team names (check for h-3 w-16 elements within team sections)
      const teamNames = document.querySelectorAll('.h-3.w-16.bg-gray-200.rounded.animate-pulse');
      expect(teamNames.length).toBeGreaterThanOrEqual(2);
    });

    it('has correct animation delays for team elements', () => {
      render(<GameCardSkeleton />);
      
      const teamLogos = document.querySelectorAll('.w-16.h-16.bg-gray-300.rounded-full.mb-1.animate-pulse');
      
      expect(teamLogos[0]).toHaveStyle('animation-delay: 0.2s');
      expect(teamLogos[1]).toHaveStyle('animation-delay: 0.4s');
    });
  });

  describe('Location Section', () => {
    it('renders location skeleton with correct styling', () => {
      render(<GameCardSkeleton />);
      
      const locationElement = document.querySelector('.h-3.w-32.bg-gray-200.rounded.my-1.animate-pulse');
      expect(locationElement).toBeInTheDocument();
      expect(locationElement).toHaveStyle('animation-delay: 0.6s');
    });
  });

  describe('Action Buttons Section', () => {
    it('renders action buttons skeleton section', () => {
      render(<GameCardSkeleton />);
      
      const actionSection = document.querySelector('.flex.items-center.justify-between.mt-2');
      expect(actionSection).toBeInTheDocument();
      
      const actionButtons = actionSection?.querySelectorAll('.animate-pulse');
      expect(actionButtons).toHaveLength(2);
    });

    it('renders action buttons with correct dimensions', () => {
      render(<GameCardSkeleton />);
      
      const actionSection = document.querySelector('.flex.items-center.justify-between.mt-2');
      
      const button1 = actionSection?.querySelector('.h-3.w-20.bg-gray-200.rounded.animate-pulse');
      const button2 = actionSection?.querySelector('.h-3.w-28.bg-gray-200.rounded.animate-pulse');
      
      expect(button1).toBeInTheDocument();
      expect(button2).toBeInTheDocument();
    });

    it('has correct animation delays for action buttons', () => {
      render(<GameCardSkeleton />);
      
      const actionSection = document.querySelector('.flex.items-center.justify-between.mt-2');
      const actionButtons = actionSection?.querySelectorAll('.animate-pulse');
      
      expect(actionButtons?.[0]).toHaveStyle('animation-delay: 0.7s');
      expect(actionButtons?.[1]).toHaveStyle('animation-delay: 0.8s');
    });
  });

  describe('Animation and Visual Effects', () => {
    it('applies pulse animation to all skeleton elements', () => {
      render(<GameCardSkeleton />);
      
      const pulseElements = document.querySelectorAll('.animate-pulse');
      expect(pulseElements.length).toBe(9);
      
      pulseElements.forEach(element => {
        expect(element).toHaveClass('animate-pulse');
      });
    });

    it('has staggered animation delays', () => {
      render(<GameCardSkeleton />);
      
      const animatedElements = document.querySelectorAll('.animate-pulse');
      const expectedDelays = ['0s', '0.1s', '0.2s', '0.3s', '0.4s', '0.5s', '0.6s', '0.7s', '0.8s'];
      
      // Test each delay
      expectedDelays.forEach((expectedDelay, index) => {
        expect(animatedElements[index]).toHaveStyle(`animation-delay: ${expectedDelay}`);
      });
    });

    it('uses consistent gray color scheme', () => {
      render(<GameCardSkeleton />);
      
      // Check that gray-200 is used for most elements (7 elements based on actual structure)
      const gray200Elements = document.querySelectorAll('.bg-gray-200');
      expect(gray200Elements).toHaveLength(7);
      
      // Check that gray-300 is used for team logos (2 elements)
      const gray300Elements = document.querySelectorAll('.bg-gray-300');
      expect(gray300Elements).toHaveLength(2);
    });
  });

  describe('Layout and Spacing', () => {
    it('applies correct spacing classes to main container', () => {
      render(<GameCardSkeleton />);
      
      // Find the container with our specific classes
      const container = document.querySelector('.bg-white.border.border-gray-200.p-3');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('p-3');
    });

    it('has correct section margins', () => {
      render(<GameCardSkeleton />);
      
      // Check that sections with expected margin classes exist
      expect(document.querySelector('.mb-2')).toBeInTheDocument();
      expect(document.querySelector('.my-2')).toBeInTheDocument();
      expect(document.querySelector('.my-1')).toBeInTheDocument();
      expect(document.querySelector('.mt-2')).toBeInTheDocument();
    });

    it('uses flexbox for proper alignment', () => {
      render(<GameCardSkeleton />);
      
      const flexContainers = document.querySelectorAll('.flex');
      expect(flexContainers.length).toBeGreaterThan(0);
      
      // Check that flex containers have proper alignment classes
      const justifyBetweenElements = document.querySelectorAll('.justify-between');
      const itemsCenterElements = document.querySelectorAll('.items-center');
      
      expect(justifyBetweenElements.length).toBeGreaterThan(0);
      expect(itemsCenterElements.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design Elements', () => {
    it('uses appropriate sizing classes', () => {
      render(<GameCardSkeleton />);
      
      // Check that elements use appropriate width classes
      const widthClasses = ['w-16', 'w-12', 'w-32', 'w-20', 'w-28'];
      
      widthClasses.forEach(widthClass => {
        const elements = document.querySelectorAll(`.${widthClass}`);
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it('uses flex-1 for team containers for equal distribution', () => {
      render(<GameCardSkeleton />);
      
      const teamContainers = document.querySelectorAll('.flex-1');
      expect(teamContainers).toHaveLength(2);
    });
  });

  describe('Component Behavior', () => {
    it('renders without crashing', () => {
      expect(() => render(<GameCardSkeleton />)).not.toThrow();
    });

    it('maintains consistent structure across renders', () => {
      const { unmount: unmount1 } = render(<GameCardSkeleton />);
      const elements1 = document.querySelectorAll('.animate-pulse');
      const elementsCount1 = elements1.length;
      unmount1();

      render(<GameCardSkeleton />);
      const elements2 = document.querySelectorAll('.animate-pulse');
      const elementsCount2 = elements2.length;
      
      expect(elementsCount1).toBe(elementsCount2);
    });

    it('renders all expected skeleton element types', () => {
      render(<GameCardSkeleton />);
      
      // Verify we have the expected mix of skeleton elements
      const dateTimeSkeletons = document.querySelectorAll('.flex.items-center.justify-between.text-xs.mb-2 .animate-pulse');
      const teamSkeletons = document.querySelectorAll('.flex.items-center.justify-between.my-2 .animate-pulse');
      const locationSkeleton = document.querySelectorAll('.h-3.w-32.bg-gray-200.rounded.my-1.animate-pulse');
      const actionSkeletons = document.querySelectorAll('.flex.items-center.justify-between.mt-2 .animate-pulse');
      
      expect(dateTimeSkeletons).toHaveLength(2);
      expect(teamSkeletons).toHaveLength(4);
      expect(locationSkeleton).toHaveLength(1);
      expect(actionSkeletons).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('maintains semantic structure without interfering with screen readers', () => {
      render(<GameCardSkeleton />);
      
      // Skeleton elements should not have text content that would confuse screen readers
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      
      skeletonElements.forEach(element => {
        // All skeleton elements should be empty divs
        expect(element.tagName.toLowerCase()).toBe('div');
        expect(element.textContent?.trim()).toBe('');
      });
    });

    it('preserves VS text for screen readers', () => {
      render(<GameCardSkeleton />);
      
      // The VS text should be accessible
      const vsText = screen.getByText('VS');
      expect(vsText).toBeInTheDocument();
      expect(vsText.textContent).toBe('VS');
    });
  });
});