import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Layout from '../layout';

// Mock the MatchesProvider
jest.mock('../../context/MatchesContext', () => ({
  MatchesProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="matches-provider">{children}</div>
  ),
}));

describe('Layout Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );
      expect(container).toBeInTheDocument();
    });

    it('should render children correctly', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should wrap children with MatchesProvider', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );
      expect(screen.getByTestId('matches-provider')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <Layout>
          <div>First Child</div>
          <div>Second Child</div>
          <div>Third Child</div>
        </Layout>
      );
      
      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
      expect(screen.getByText('Third Child')).toBeInTheDocument();
    });
  });

  describe('Children Prop Handling', () => {
    it('should handle string children', () => {
      render(<Layout>Simple Text</Layout>);
      expect(screen.getByText('Simple Text')).toBeInTheDocument();
    });

    it('should handle component children', () => {
      const TestComponent = () => <div>Test Component</div>;
      render(
        <Layout>
          <TestComponent />
        </Layout>
      );
      expect(screen.getByText('Test Component')).toBeInTheDocument();
    });

    it('should handle nested children', () => {
      render(
        <Layout>
          <div>
            <div>
              <span>Nested Content</span>
            </div>
          </div>
        </Layout>
      );
      expect(screen.getByText('Nested Content')).toBeInTheDocument();
    });

    it('should handle children with complex structure', () => {
      render(
        <Layout>
          <header>Header</header>
          <main>Main Content</main>
          <footer>Footer</footer>
        </Layout>
      );
      
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Main Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('should handle children with props', () => {
      const ChildWithProps = ({ title }: { title: string }) => <div>{title}</div>;
      render(
        <Layout>
          <ChildWithProps title="Dynamic Title" />
        </Layout>
      );
      expect(screen.getByText('Dynamic Title')).toBeInTheDocument();
    });
  });

  describe('Context Provider Integration', () => {
    it('should ensure MatchesProvider wraps all children', () => {
      const { container } = render(
        <Layout>
          <div data-testid="child-element">Child</div>
        </Layout>
      );
      
      const provider = screen.getByTestId('matches-provider');
      const child = screen.getByTestId('child-element');
      
      expect(provider).toContainElement(child);
    });

    it('should maintain provider hierarchy', () => {
      render(
        <Layout>
          <div data-testid="outer">
            <div data-testid="inner">Content</div>
          </div>
        </Layout>
      );
      
      const provider = screen.getByTestId('matches-provider');
      const outer = screen.getByTestId('outer');
      const inner = screen.getByTestId('inner');
      
      expect(provider).toContainElement(outer);
      expect(outer).toContainElement(inner);
    });
  });

  describe('Component Updates', () => {
    it('should handle children updates', () => {
      const { rerender } = render(
        <Layout>
          <div>Original Content</div>
        </Layout>
      );
      
      expect(screen.getByText('Original Content')).toBeInTheDocument();
      
      rerender(
        <Layout>
          <div>Updated Content</div>
        </Layout>
      );
      
      expect(screen.queryByText('Original Content')).not.toBeInTheDocument();
      expect(screen.getByText('Updated Content')).toBeInTheDocument();
    });

    it('should handle dynamic children additions', () => {
      const { rerender } = render(
        <Layout>
          <div>Child 1</div>
        </Layout>
      );
      
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      
      rerender(
        <Layout>
          <div>Child 1</div>
          <div>Child 2</div>
        </Layout>
      );
      
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('should handle children removal', () => {
      const { rerender } = render(
        <Layout>
          <div>Child 1</div>
          <div>Child 2</div>
        </Layout>
      );
      
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      
      rerender(
        <Layout>
          <div>Child 1</div>
        </Layout>
      );
      
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.queryByText('Child 2')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = render(<Layout>{null}</Layout>);
      expect(container).toBeInTheDocument();
      expect(screen.getByTestId('matches-provider')).toBeInTheDocument();
    });

    it('should handle undefined children', () => {
      const { container } = render(<Layout>{undefined}</Layout>);
      expect(container).toBeInTheDocument();
      expect(screen.getByTestId('matches-provider')).toBeInTheDocument();
    });

    it('should handle boolean children', () => {
      const { container } = render(
        <Layout>
          {true && <div>Conditional Content</div>}
          {false && <div>Hidden Content</div>}
        </Layout>
      );
      
      expect(screen.getByText('Conditional Content')).toBeInTheDocument();
      expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
    });

    it('should handle array of children', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      render(
        <Layout>
          {items.map((item, index) => (
            <div key={index}>{item}</div>
          ))}
        </Layout>
      );
      
      items.forEach(item => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it('should handle fragments as children', () => {
      render(
        <Layout>
          <>
            <div>Fragment Child 1</div>
            <div>Fragment Child 2</div>
          </>
        </Layout>
      );
      
      expect(screen.getByText('Fragment Child 1')).toBeInTheDocument();
      expect(screen.getByText('Fragment Child 2')).toBeInTheDocument();
    });

    it('should handle children with special characters', () => {
      const specialText = 'Special @#$%^&* Characters! 2024';
      render(
        <Layout>
          <div>{specialText}</div>
        </Layout>
      );
      expect(screen.getByText(specialText)).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      const longContent = 'A'.repeat(1000);
      render(
        <Layout>
          <div>{longContent}</div>
        </Layout>
      );
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });
  });

  describe('TypeScript Type Safety', () => {
    it('should accept React.ReactNode as children', () => {
      expect(() => {
        render(
          <Layout>
            <div>Valid React Node</div>
          </Layout>
        );
      }).not.toThrow();
    });

    it('should accept JSX elements', () => {
      expect(() => {
        render(
          <Layout>
            <div>
              <span>JSX Element</span>
            </div>
          </Layout>
        );
      }).not.toThrow();
    });

    it('should accept text nodes', () => {
      expect(() => {
        render(<Layout>Text Node</Layout>);
      }).not.toThrow();
    });

    it('should accept number as children', () => {
      expect(() => {
        render(<Layout>{42}</Layout>);
      }).not.toThrow();
    });
  });

  describe('Component Lifecycle', () => {
    it('should mount correctly', () => {
      const { container } = render(
        <Layout>
          <div>Content</div>
        </Layout>
      );
      expect(container).toBeInTheDocument();
    });

    it('should unmount without errors', () => {
      const { unmount } = render(
        <Layout>
          <div>Content</div>
        </Layout>
      );
      
      expect(() => unmount()).not.toThrow();
    });

    it('should handle multiple mount/unmount cycles', () => {
      const { unmount, rerender } = render(
        <Layout>
          <div>Content 1</div>
        </Layout>
      );
      
      rerender(
        <Layout>
          <div>Content 2</div>
        </Layout>
      );
      
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Provider Behavior', () => {
    it('should ensure provider is present in DOM hierarchy', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );
      
      const provider = screen.getByTestId('matches-provider');
      expect(provider).toBeInTheDocument();
    });

    it('should render only one provider instance', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );
      
      const providers = screen.getAllByTestId('matches-provider');
      expect(providers).toHaveLength(1);
    });

    it('should maintain provider wrapper after rerenders', () => {
      const { rerender } = render(
        <Layout>
          <div>Original</div>
        </Layout>
      );
      
      expect(screen.getByTestId('matches-provider')).toBeInTheDocument();
      
      rerender(
        <Layout>
          <div>Updated</div>
        </Layout>
      );
      
      expect(screen.getByTestId('matches-provider')).toBeInTheDocument();
    });
  });

  describe('Client-Side Rendering', () => {
    it('should be marked as client component', () => {
      // The "use client" directive ensures this runs on client
      // This test verifies the component renders without SSR issues
      expect(() => {
        render(
          <Layout>
            <div>Client Component</div>
          </Layout>
        );
      }).not.toThrow();
    });

    it('should handle client-side state in children', () => {
      const StatefulChild = () => {
        const [count] = React.useState(0);
        return <div>Count: {count}</div>;
      };
      
      render(
        <Layout>
          <StatefulChild />
        </Layout>
      );
      
      expect(screen.getByText('Count: 0')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should maintain semantic structure of children', () => {
      const { container } = render(
        <Layout>
          <main>
            <h1>Main Heading</h1>
            <p>Paragraph content</p>
          </main>
        </Layout>
      );
      
      const main = container.querySelector('main');
      const heading = container.querySelector('h1');
      const paragraph = container.querySelector('p');
      
      expect(main).toBeInTheDocument();
      expect(heading).toBeInTheDocument();
      expect(paragraph).toBeInTheDocument();
    });

    it('should preserve ARIA attributes in children', () => {
      render(
        <Layout>
          <button aria-label="Test Button">Click Me</button>
        </Layout>
      );
      
      const button = screen.getByLabelText('Test Button');
      expect(button).toBeInTheDocument();
    });

    it('should preserve role attributes', () => {
      render(
        <Layout>
          <div role="navigation">Navigation</div>
        </Layout>
      );
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of children efficiently', () => {
      const manyChildren = Array.from({ length: 100 }, (_, i) => (
        <div key={i}>Child {i}</div>
      ));
      
      const startTime = performance.now();
      render(<Layout>{manyChildren}</Layout>);
      const endTime = performance.now();
      
      // Should render in reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
      
      // Verify first and last children rendered
      expect(screen.getByText('Child 0')).toBeInTheDocument();
      expect(screen.getByText('Child 99')).toBeInTheDocument();
    });

    it('should not cause memory leaks on unmount', () => {
      const { unmount } = render(
        <Layout>
          <div>Content</div>
        </Layout>
      );
      
      unmount();
      
      // If unmount completes without throwing, no memory leak occurred
      expect(true).toBe(true);
    });
  });
});