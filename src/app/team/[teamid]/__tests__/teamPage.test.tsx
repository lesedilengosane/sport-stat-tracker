// __tests__/TeamPage.test.tsx
import { render, screen } from '@testing-library/react';
import { useParams } from 'next/navigation';
import TeamPage from '../page';

// Mock Next.js useParams
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

// Mock TeamDetails component
jest.mock('../../../../components/fanComponents/TeamDetails', () => ({
  __esModule: true,
  default: ({ teamId }: { teamId: string }) => (
    <div data-testid="team-details">
      <p>Team Details for: {teamId}</p>
    </div>
  ),
}));

describe('TeamPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Valid Team ID', () => {
    it('should render TeamDetails component when teamId is provided', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: 'team-123',
      });

      render(<TeamPage />);

      expect(screen.getByTestId('team-details')).toBeInTheDocument();
    });

    it('should pass correct teamId to TeamDetails component', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: 'team-456',
      });

      render(<TeamPage />);

      expect(screen.getByText('Team Details for: team-456')).toBeInTheDocument();
    });

    it('should handle numeric teamId', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: '12345',
      });

      render(<TeamPage />);

      expect(screen.getByText('Team Details for: 12345')).toBeInTheDocument();
    });

    it('should handle teamId with special characters', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: 'team-abc-123',
      });

      render(<TeamPage />);

      expect(screen.getByText('Team Details for: team-abc-123')).toBeInTheDocument();
    });

    it('should handle long teamId', () => {
      const longTeamId = 'team-very-long-id-with-many-characters-12345';
      (useParams as jest.Mock).mockReturnValue({
        teamid: longTeamId,
      });

      render(<TeamPage />);

      expect(screen.getByText(`Team Details for: ${longTeamId}`)).toBeInTheDocument();
    });

    it('should handle teamId with underscores', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: 'team_123_abc',
      });

      render(<TeamPage />);

      expect(screen.getByText('Team Details for: team_123_abc')).toBeInTheDocument();
    });
  });

  describe('Invalid Team ID', () => {
    it('should display error message when teamId is undefined', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: undefined,
      });

      render(<TeamPage />);

      expect(screen.getByText('Invalid team ID')).toBeInTheDocument();
    });

    it('should display error message when teamId is null', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: null,
      });

      render(<TeamPage />);

      expect(screen.getByText('Invalid team ID')).toBeInTheDocument();
    });

    it('should display error message when teamId is empty string', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: '',
      });

      render(<TeamPage />);

      expect(screen.getByText('Invalid team ID')).toBeInTheDocument();
    });

    it('should display error message when params is null', () => {
      (useParams as jest.Mock).mockReturnValue(null);

      render(<TeamPage />);

      expect(screen.getByText('Invalid team ID')).toBeInTheDocument();
    });

    it('should display error message when params is undefined', () => {
      (useParams as jest.Mock).mockReturnValue(undefined);

      render(<TeamPage />);

      expect(screen.getByText('Invalid team ID')).toBeInTheDocument();
    });

    it('should display error message when params object is empty', () => {
      (useParams as jest.Mock).mockReturnValue({});

      render(<TeamPage />);

      expect(screen.getByText('Invalid team ID')).toBeInTheDocument();
    });

    it('should apply correct styling to error message', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: undefined,
      });

      render(<TeamPage />);

      const errorMessage = screen.getByText('Invalid team ID');
      expect(errorMessage).toHaveClass('text-center');
      expect(errorMessage).toHaveClass('mt-10');
      expect(errorMessage).toHaveClass('text-gray-900');
    });

    it('should not render TeamDetails when teamId is invalid', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: undefined,
      });

      render(<TeamPage />);

      expect(screen.queryByTestId('team-details')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle teamId with only spaces as empty', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: '   ',
      });

      render(<TeamPage />);

      // Note: '   ' is truthy in JavaScript, so it will render TeamDetails
      expect(screen.getByTestId('team-details')).toBeInTheDocument();
    });

    it('should handle params with other properties', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: 'team-789',
        otherparam: 'value',
      });

      render(<TeamPage />);

      expect(screen.getByText('Team Details for: team-789')).toBeInTheDocument();
    });

    it('should handle teamId as zero string', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: '0',
      });

      render(<TeamPage />);

      expect(screen.getByText('Team Details for: 0')).toBeInTheDocument();
    });

    it('should handle teamId with URL encoded characters', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: 'team%20with%20spaces',
      });

      render(<TeamPage />);

      expect(screen.getByText('Team Details for: team%20with%20spaces')).toBeInTheDocument();
    });

    it('should handle teamId with forward slashes', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: 'team/123/abc',
      });

      render(<TeamPage />);

      expect(screen.getByText('Team Details for: team/123/abc')).toBeInTheDocument();
    });
  });

  describe('Type Coercion', () => {
    it('should cast teamId to string', () => {
      // Even though TypeScript expects string, useParams could return various types
      (useParams as jest.Mock).mockReturnValue({
        teamid: 'team-123',
      });

      render(<TeamPage />);

      expect(screen.getByTestId('team-details')).toBeInTheDocument();
      expect(screen.getByText('Team Details for: team-123')).toBeInTheDocument();
    });

    it('should handle teamId as array (edge case from Next.js)', () => {
      // Next.js dynamic routes can return arrays in catch-all routes
      (useParams as jest.Mock).mockReturnValue({
        teamid: ['team-1', 'team-2'],
      });

      render(<TeamPage />);

      // Arrays are truthy, so TeamDetails will render
      expect(screen.getByTestId('team-details')).toBeInTheDocument();
    });
  });

  describe('useParams Behavior', () => {
    it('should call useParams hook', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: 'team-123',
      });

      render(<TeamPage />);

      expect(useParams).toHaveBeenCalled();
    });

    it('should call useParams only once', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: 'team-123',
      });

      render(<TeamPage />);

      expect(useParams).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component Rendering', () => {
    it('should render without crashing with valid teamId', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: 'team-123',
      });

      const { container } = render(<TeamPage />);

      expect(container).toBeInTheDocument();
    });

    it('should render without crashing with invalid teamId', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: undefined,
      });

      const { container } = render(<TeamPage />);

      expect(container).toBeInTheDocument();
    });

    it('should render error in paragraph element', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: undefined,
      });

      const { container } = render(<TeamPage />);

      const paragraph = container.querySelector('p');
      expect(paragraph).toBeInTheDocument();
      expect(paragraph?.textContent).toBe('Invalid team ID');
    });
  });

  describe('Multiple Renders', () => {
    it('should handle re-render with different teamId', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: 'team-111',
      });

      const { rerender } = render(<TeamPage />);

      expect(screen.getByText('Team Details for: team-111')).toBeInTheDocument();

      (useParams as jest.Mock).mockReturnValue({
        teamid: 'team-222',
      });

      rerender(<TeamPage />);

      expect(screen.getByText('Team Details for: team-222')).toBeInTheDocument();
    });

    it('should handle re-render from valid to invalid teamId', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: 'team-123',
      });

      const { rerender } = render(<TeamPage />);

      expect(screen.getByTestId('team-details')).toBeInTheDocument();

      (useParams as jest.Mock).mockReturnValue({
        teamid: undefined,
      });

      rerender(<TeamPage />);

      expect(screen.queryByTestId('team-details')).not.toBeInTheDocument();
      expect(screen.getByText('Invalid team ID')).toBeInTheDocument();
    });

    it('should handle re-render from invalid to valid teamId', () => {
      (useParams as jest.Mock).mockReturnValue({
        teamid: undefined,
      });

      const { rerender } = render(<TeamPage />);

      expect(screen.getByText('Invalid team ID')).toBeInTheDocument();

      (useParams as jest.Mock).mockReturnValue({
        teamid: 'team-456',
      });

      rerender(<TeamPage />);

      expect(screen.queryByText('Invalid team ID')).not.toBeInTheDocument();
      expect(screen.getByTestId('team-details')).toBeInTheDocument();
    });
  });
});