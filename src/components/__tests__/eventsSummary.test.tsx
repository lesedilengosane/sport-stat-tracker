import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import BasketballTimeline, { BasketballEvent } from '../EventsSummary'
import { MatchMetaData } from '@/types/basketball'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Target: () => <div data-testid="target-icon">Target</div>,
  AlertTriangle: () => <div data-testid="alert-icon">Alert</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  RotateCcw: () => <div data-testid="rotate-icon">Rotate</div>,
  Trophy: () => <div data-testid="trophy-icon">Trophy</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  Award: () => <div data-testid="award-icon">Award</div>,
  Activity: () => <div data-testid="activity-icon">Activity</div>,
}))

describe('BasketballTimeline', () => {
  const mockEvents: BasketballEvent[] = [
    {
      id: '1',
      match_id: 'match-1',
      timestamp: '00:05:30',
      team_id: 'home-team',
      action: '+2 FG',
      points: 2,
      player_id: 'player-1',
      players: {
        player_id: 'player-1',
        first_name: 'LeBron',
        last_name: 'James',
        position: 'SF',
        jersey_number: 23,
        team_id: 'home-team',
      },
    },
    {
      id: '2',
      match_id: 'match-1',
      timestamp: '00:10:15',
      team_id: 'away-team',
      action: '+3 FG',
      points: 3,
      player_id: 'player-2',
      players: {
        player_id: 'player-2',
        first_name: 'Stephen',
        last_name: 'Curry',
        position: 'PG',
        jersey_number: 30,
        team_id: 'away-team',
      },
    },
    {
      id: '3',
      match_id: 'match-1',
      timestamp: '00:15:45',
      team_id: 'home-team',
      action: 'Ast',
      points: null,
      player_id: 'player-3',
      players: {
        player_id: 'player-3',
        first_name: 'Anthony',
        last_name: 'Davis',
        position: 'PF',
        jersey_number: 3,
        team_id: 'home-team',
      },
    },
    {
      id: '4',
      match_id: 'match-1',
      timestamp: '00:08:20',
      team_id: 'away-team',
      action: 'Foul',
      points: null,
      player_id: 'player-4',
      players: {
        player_id: 'player-4',
        first_name: 'Klay',
        last_name: 'Thompson',
        position: 'SG',
        jersey_number: 11,
        team_id: 'away-team',
      },
    },
  ]

  const mockMetadata: MatchMetaData = {
    idx: 1,
    match_id: 'match-1',
    home_team_id: 'home-team',
    away_team_id: 'away-team',
    match_date: '2025-10-20',
    location: 'Staples Center',
    home_score: 105,
    away_score: 98,
    season: '2024-2025',
    created_at: '2025-10-19T12:00:00Z',
    completed: true,
    analyst: 'John Doe',
    booked: true,
  }

  const defaultProps = {
    MatchEvents: mockEvents,
    homeTeamID: 'home-team',
    awayTeamID: 'away-team',
    homeTeamName: 'Lakers',
    awayTeamName: 'Warriors',
    metadata: mockMetadata,
  }

  describe('Rendering', () => {
    it('renders the timeline header', () => {
      render(<BasketballTimeline {...defaultProps} />)
      
      expect(screen.getByText('Match Timeline')).toBeInTheDocument()
    })

    it('renders team names in header', () => {
      render(<BasketballTimeline {...defaultProps} />)
      
      expect(screen.getByText('Lakers vs Warriors')).toBeInTheDocument()
    })

    it('renders all events', () => {
      render(<BasketballTimeline {...defaultProps} />)
      
      expect(screen.getByText('LeBron James')).toBeInTheDocument()
      expect(screen.getByText('Stephen Curry')).toBeInTheDocument()
      expect(screen.getByText('Anthony Davis')).toBeInTheDocument()
      expect(screen.getByText('Klay Thompson')).toBeInTheDocument()
    })

    it('renders final score section', () => {
      render(<BasketballTimeline {...defaultProps} />)
      
      expect(screen.getByText('Final Score')).toBeInTheDocument()
      expect(screen.getByText('105')).toBeInTheDocument()
      expect(screen.getByText('98')).toBeInTheDocument()
    })

    it('displays correct score format', () => {
      render(<BasketballTimeline {...defaultProps} />)
      
      // Use getAllByText since "Lakers" appears twice (in header and score)
      const lakersElements = screen.getAllByText(/Lakers/)
      const scoreSection = lakersElements.find(el => 
        el.textContent?.includes('105') && el.textContent?.includes('98')
      )
      
      expect(scoreSection?.textContent).toContain('Lakers')
      expect(scoreSection?.textContent).toContain('105')
      expect(scoreSection?.textContent).toContain('98')
      expect(scoreSection?.textContent).toContain('Warriors')
    })
  })

  describe('Event Positioning', () => {
    it('places home team events on the left side', () => {
      const { container } = render(<BasketballTimeline {...defaultProps} />)
      
      // Home team events should be in the first column (left side)
      const homeEvents = container.querySelectorAll('.grid-cols-3 > div:first-child .bg-gray-800')
      expect(homeEvents.length).toBeGreaterThan(0)
    })

    it('places away team events on the right side', () => {
      const { container } = render(<BasketballTimeline {...defaultProps} />)
      
      // Away team events should be in the third column (right side)
      const awayEvents = container.querySelectorAll('.grid-cols-3 > div:last-child .bg-gray-800')
      expect(awayEvents.length).toBeGreaterThan(0)
    })

    it('renders events with correct team classification', () => {
      render(<BasketballTimeline {...defaultProps} />)
      
      // LeBron and Anthony are home team (left)
      expect(screen.getByText('LeBron James')).toBeInTheDocument()
      expect(screen.getByText('Anthony Davis')).toBeInTheDocument()
      
      // Stephen and Klay are away team (right)
      expect(screen.getByText('Stephen Curry')).toBeInTheDocument()
      expect(screen.getByText('Klay Thompson')).toBeInTheDocument()
    })
  })

  describe('Event Details', () => {
    it('displays action type for each event', () => {
      render(<BasketballTimeline {...defaultProps} />)
      
      expect(screen.getByText('+2 FG')).toBeInTheDocument()
      expect(screen.getByText('+3 FG')).toBeInTheDocument()
      expect(screen.getByText('Ast')).toBeInTheDocument()
      expect(screen.getByText('Foul')).toBeInTheDocument()
    })

    it('displays points when available', () => {
      render(<BasketballTimeline {...defaultProps} />)
      
      expect(screen.getByText('+2')).toBeInTheDocument()
      expect(screen.getByText('+3')).toBeInTheDocument()
    })

    it('does not display points for non-scoring actions', () => {
      render(<BasketballTimeline {...defaultProps} />)
      
      const assistEvent = screen.getByText('Ast').parentElement
      expect(assistEvent?.textContent).not.toContain('+')
      
      const foulEvent = screen.getByText('Foul').parentElement
      expect(foulEvent?.textContent).not.toMatch(/\+\d/)
    })

    it('renders correct icons for different actions', () => {
      render(<BasketballTimeline {...defaultProps} />)
      
      // Scoring actions (+2 FG, +3 FG) should have Target icon
      expect(screen.getAllByTestId('target-icon').length).toBeGreaterThan(0)
      
      // Assist should have Users icon
      expect(screen.getByTestId('users-icon')).toBeInTheDocument()
      
      // Foul should have AlertTriangle icon
      expect(screen.getByTestId('alert-icon')).toBeInTheDocument()
    })
  })

  describe('Timestamp Formatting', () => {
    it('formats timestamps correctly', () => {
      render(<BasketballTimeline {...defaultProps} />)
      
      // 00:05:30 -> 5m 30s
      expect(screen.getByText('5m 30s')).toBeInTheDocument()
      
      // 00:10:15 -> 10m 15s
      expect(screen.getByText('10m 15s')).toBeInTheDocument()
      
      // 00:15:45 -> 15m 45s
      expect(screen.getByText('15m 45s')).toBeInTheDocument()
      
      // 00:08:20 -> 8m 20s
      expect(screen.getByText('8m 20s')).toBeInTheDocument()
    })

    it('pads seconds with leading zero', () => {
      const eventsWithPadding: BasketballEvent[] = [
        {
          id: '1',
          match_id: 'match-1',
          timestamp: '00:05:05',
          team_id: 'home-team',
          action: '+2 FG',
          points: 2,
          player_id: 'player-1',
          players: {
            player_id: 'player-1',
            first_name: 'Test',
            last_name: 'Player',
            position: 'SF',
            jersey_number: 23,
            team_id: 'home-team',
          },
        },
      ]
      
      render(<BasketballTimeline {...defaultProps} MatchEvents={eventsWithPadding} />)
      
      // 00:05:05 -> 5m 05s (padded)
      expect(screen.getByText('5m 05s')).toBeInTheDocument()
    })
  })

  describe('Event Sorting', () => {
    it('sorts events by timestamp in descending order (most recent first)', () => {
      const { container } = render(<BasketballTimeline {...defaultProps} />)
      
      const timestamps = Array.from(container.querySelectorAll('.font-mono')).map(
        el => el.textContent
      )
      
      // Should be sorted: 15m 45s, 10m 15s, 8m 20s, 5m 30s
      expect(timestamps[0]).toBe('15m 45s')
      expect(timestamps[1]).toBe('10m 15s')
      expect(timestamps[2]).toBe('8m 20s')
      expect(timestamps[3]).toBe('5m 30s')
    })

    it('handles unsorted input events', () => {
      const unsortedEvents = [...mockEvents].reverse()
      const { container } = render(
        <BasketballTimeline {...defaultProps} MatchEvents={unsortedEvents} />
      )
      
      const timestamps = Array.from(container.querySelectorAll('.font-mono')).map(
        el => el.textContent
      )
      
      // Should still be sorted correctly
      expect(timestamps[0]).toBe('15m 45s')
      expect(timestamps[1]).toBe('10m 15s')
    })
  })

  describe('Player Information', () => {
    it('displays full player names', () => {
      render(<BasketballTimeline {...defaultProps} />)
      
      expect(screen.getByText('LeBron James')).toBeInTheDocument()
      expect(screen.getByText('Stephen Curry')).toBeInTheDocument()
    })

    it('handles events without player information', () => {
      const eventsWithoutPlayer: BasketballEvent[] = [
        {
          id: '1',
          match_id: 'match-1',
          timestamp: '00:05:30',
          team_id: 'home-team',
          action: '+2 FG',
          points: 2,
          player_id: null,
          players: null,
        },
      ]
      
      expect(() => 
        render(<BasketballTimeline {...defaultProps} MatchEvents={eventsWithoutPlayer} />)
      ).not.toThrow()
    })
  })

  describe('Metadata and Scores', () => {
    it('displays home and away scores from metadata', () => {
      render(<BasketballTimeline {...defaultProps} />)
      
      expect(screen.getByText('105')).toBeInTheDocument()
      expect(screen.getByText('98')).toBeInTheDocument()
    })

    it('displays default scores when metadata is missing', () => {
      render(<BasketballTimeline {...defaultProps} metadata={undefined} />)
      
      // Both home and away scores should be 0, so we expect 2 elements with "0"
      const zeroScores = screen.getAllByText('0')
      expect(zeroScores).toHaveLength(2)
    })

    it('handles partial metadata', () => {
      const partialMetadata = {
        match_id: 'match-1',
        home_score: 50,
        away_score: undefined,
      } as any
      
      render(<BasketballTimeline {...defaultProps} metadata={partialMetadata} />)
      
      expect(screen.getByText('50')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('Icon Rendering for Different Actions', () => {
    it('renders Target icon for scoring actions', () => {
      const scoringEvents: BasketballEvent[] = [
        { ...mockEvents[0], id: '1', action: '+1 FT' },
        { ...mockEvents[0], id: '2', action: '+2 FG' },
        { ...mockEvents[0], id: '3', action: '+3 FG', timestamp: '00:06:00' },
      ]
      
      render(<BasketballTimeline {...defaultProps} MatchEvents={scoringEvents} />)
      
      expect(screen.getAllByTestId('target-icon')).toHaveLength(3)
    })

    it('renders Award icon for rebounds', () => {
      const reboundEvent: BasketballEvent[] = [
        { ...mockEvents[0], action: 'Reb' },
      ]
      
      render(<BasketballTimeline {...defaultProps} MatchEvents={reboundEvent} />)
      
      expect(screen.getByTestId('award-icon')).toBeInTheDocument()
    })

    it('renders Trophy icon for blocks', () => {
      const blockEvent: BasketballEvent[] = [
        { ...mockEvents[0], action: 'Blk' },
      ]
      
      render(<BasketballTimeline {...defaultProps} MatchEvents={blockEvent} />)
      
      expect(screen.getByTestId('trophy-icon')).toBeInTheDocument()
    })

    it('renders Activity icon for steals', () => {
      const stealEvent: BasketballEvent[] = [
        { ...mockEvents[0], action: 'Stl' },
      ]
      
      render(<BasketballTimeline {...defaultProps} MatchEvents={stealEvent} />)
      
      expect(screen.getByTestId('activity-icon')).toBeInTheDocument()
    })

    it('renders RotateCcw icon for turnovers', () => {
      const turnoverEvent: BasketballEvent[] = [
        { ...mockEvents[0], action: 'TO' },
      ]
      
      render(<BasketballTimeline {...defaultProps} MatchEvents={turnoverEvent} />)
      
      expect(screen.getByTestId('rotate-icon')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty events array', () => {
      render(<BasketballTimeline {...defaultProps} MatchEvents={[]} />)
      
      expect(screen.getByText('Match Timeline')).toBeInTheDocument()
      expect(screen.getByText('Final Score')).toBeInTheDocument()
    })

    it('handles single event', () => {
      // The component sorts by timestamp, so we need to check what actually renders
      // Use a simple event and verify it renders without errors
      const singleEvent: BasketballEvent = {
        id: 'test-1',
        match_id: 'match-1',
        timestamp: '00:05:30',
        team_id: 'home-team',
        action: '+2 FG',
        points: 2,
        player_id: 'player-1',
        players: {
          player_id: 'player-1',
          first_name: 'Test',
          last_name: 'Player',
          position: 'SF',
          jersey_number: 23,
          team_id: 'home-team',
        },
      }
      
      render(<BasketballTimeline {...defaultProps} MatchEvents={[singleEvent]} />)
      
      expect(screen.getByText('Test Player')).toBeInTheDocument()
      expect(screen.getByText('+2 FG')).toBeInTheDocument()
    })

    it('handles events with same timestamp', () => {
      const sameTimeEvents: BasketballEvent[] = [
        mockEvents[0],
        { ...mockEvents[1], timestamp: '00:05:30' },
      ]
      
      expect(() => 
        render(<BasketballTimeline {...defaultProps} MatchEvents={sameTimeEvents} />)
      ).not.toThrow()
    })

    it('handles missing team names', () => {
      render(
        <BasketballTimeline 
          {...defaultProps} 
          homeTeamName={undefined} 
          awayTeamName={undefined} 
        />
      )
      
      expect(screen.getByText('Match Timeline')).toBeInTheDocument()
    })

    it('handles large number of events', () => {
      const manyEvents: BasketballEvent[] = Array.from({ length: 50 }, (_, i) => ({
        id: `event-${i}`,
        match_id: 'match-1',
        timestamp: `00:${String(i).padStart(2, '0')}:30`,
        team_id: i % 2 === 0 ? 'home-team' : 'away-team',
        action: '+2 FG' as const,
        points: 2,
        player_id: `player-${i}`,
        players: {
          player_id: `player-${i}`,
          first_name: `Player${i}`,
          last_name: `Last${i}`,
          position: 'SF',
          jersey_number: i,
          team_id: i % 2 === 0 ? 'home-team' : 'away-team',
        },
      }))
      
      expect(() => 
        render(<BasketballTimeline {...defaultProps} MatchEvents={manyEvents} />)
      ).not.toThrow()
    })
  })

  describe('Layout and Styling', () => {
    it('renders with correct container classes', () => {
      const { container } = render(<BasketballTimeline {...defaultProps} />)
      
      const mainContainer = container.querySelector('.max-w-5xl')
      expect(mainContainer).toHaveClass('mx-auto', 'rounded-2xl', 'p-8', 'bg-gray-900')
    })

    it('renders vertical timeline line', () => {
      const { container } = render(<BasketballTimeline {...defaultProps} />)
      
      const timelineLine = container.querySelector('.border-dotted.border-gray-600')
      expect(timelineLine).toBeInTheDocument()
    })

    it('renders event cards with hover effects', () => {
      const { container } = render(<BasketballTimeline {...defaultProps} />)
      
      const eventCards = container.querySelectorAll('.hover\\:shadow-md')
      expect(eventCards.length).toBeGreaterThan(0)
    })
  })
})