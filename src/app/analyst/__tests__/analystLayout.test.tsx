import { render, screen } from '@testing-library/react';
import Layout from '../layout';
import { MatchesProvider } from '../../context/MatchesContext';

// Mock the MatchesProvider
jest.mock('../../context/MatchesContext', () => ({
  MatchesProvider: jest.fn(({ children }) => <div data-testid="matches-provider">{children}</div>)
}));

describe('Layout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(
      <Layout>
        <div>Test Child</div>
      </Layout>
    );
    
    expect(screen.getByTestId('matches-provider')).toBeInTheDocument();
  });

  it('should wrap children with MatchesProvider', () => {
    const testContent = 'Test Content';
    
    render(
      <Layout>
        <div>{testContent}</div>
      </Layout>
    );
    
    expect(screen.getByText(testContent)).toBeInTheDocument();
    expect(MatchesProvider).toHaveBeenCalled();
  });

  it('should pass children prop to MatchesProvider', () => {
    const children = <div data-testid="child-component">Child Component</div>;
    
    render(<Layout>{children}</Layout>);
    
    expect(MatchesProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        children: children
      }),
      {}
    );
  });

  it('should render multiple children', () => {
    render(
      <Layout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </Layout>
    );
    
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('should handle null children gracefully', () => {
    expect(() => {
      render(<Layout>{null}</Layout>);
    }).not.toThrow();
  });

  it('should render with complex nested children', () => {
    render(
      <Layout>
        <div>
          <header>Header</header>
          <main>Main Content</main>
          <footer>Footer</footer>
        </div>
      </Layout>
    );
    
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});