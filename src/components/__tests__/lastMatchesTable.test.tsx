import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LastMatchesTable, MatchDetails, matchColumns } from '../LastMatchesTable'

// Mock the DataTable component
jest.mock('../Line-up-table/LineUp-table', () => ({
  DataTable: ({ columns, data, onRowClick }: any) => (
    <div data-testid="data-table">
      <table>
        <thead>
          <tr>
            {columns.map((col: any, idx: number) => (
              <th key={idx}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, rowIdx: number) => (
            <tr
              key={rowIdx}
              onClick={() => onRowClick?.({ original: row })}
              data-testid={`table-row-${rowIdx}`}
            >
              {columns.map((col: any, colIdx: number) => (
                <td key={colIdx}>
                  {col.cell ? col.cell({ row: { getValue: (key: string) => row[key], original: row } }) : row[col.accessorKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
}))

describe('LastMatchesTable', () => {
  const mockMatches: MatchDetails[] = [
    {
      match_id: '1',
      home_team_name: 'Lakers',
      away_team_name: 'Warriors',
      home_icon_url: '/logos/lakers.png',
      away_icon_url: '/logos/warriors.png',
      home_score: 105,
      away_score: 98,
      match_date: '2025-10-20',
      completed: true,
    },
    {
      match_id: '2',
      home_team_name: 'Celtics',
      away_team_name: 'Bulls',
      home_icon_url: '/logos/celtics.png',
      away_icon_url: '/logos/bulls.png',
      home_score: 110,
      away_score: 102,
      match_date: '2025-10-18',
      completed: true,
    },
    {
      match_id: '3',
      home_team_name: 'Heat',
      away_team_name: 'Knicks',
      home_icon_url: '/logos/heat.png',
      away_icon_url: '/logos/knicks.png',
      home_score: 0,
      away_score: 0,
      match_date: '2025-10-25',
      completed: false,
    },
  ]

  const defaultProps = {
    data: mockMatches,
    title: 'Last 5 Matches',
    onRowClick: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the title', () => {
      render(<LastMatchesTable {...defaultProps} />)
      
      expect(screen.getByText('Last 5 Matches')).toBeInTheDocument()
    })

    it('renders the DataTable component', () => {
      render(<LastMatchesTable {...defaultProps} />)
      
      expect(screen.getByTestId('data-table')).toBeInTheDocument()
    })

    it('passes correct data to DataTable', () => {
      render(<LastMatchesTable {...defaultProps} />)
      
      expect(screen.getByText('Lakers')).toBeInTheDocument()
      expect(screen.getByText('Warriors')).toBeInTheDocument()
      expect(screen.getByText('Celtics')).toBeInTheDocument()
      expect(screen.getByText('Bulls')).toBeInTheDocument()
    })

    it('renders all table headers', () => {
      render(<LastMatchesTable {...defaultProps} />)
      
      expect(screen.getByText('Date')).toBeInTheDocument()
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Away')).toBeInTheDocument()
      expect(screen.getByText('Score')).toBeInTheDocument()
    })

    it('renders all matches in table rows', () => {
      render(<LastMatchesTable {...defaultProps} />)
      
      expect(screen.getByTestId('table-row-0')).toBeInTheDocument()
      expect(screen.getByTestId('table-row-1')).toBeInTheDocument()
      expect(screen.getByTestId('table-row-2')).toBeInTheDocument()
    })
  })

  describe('Column Definitions', () => {
    it('has correct number of columns', () => {
      expect(matchColumns).toHaveLength(4)
    })

    it('has Date column with correct configuration', () => {
      const dateColumn = matchColumns[0] as any
      expect(dateColumn.accessorKey).toBe('match_date')
      expect(dateColumn.header).toBe('Date')
    })

    it('has Home column with correct configuration', () => {
      const homeColumn = matchColumns[1] as any
      expect(homeColumn.accessorKey).toBe('home_team_name')
      expect(homeColumn.header).toBe('Home')
    })

    it('has Away column with correct configuration', () => {
      const awayColumn = matchColumns[2] as any
      expect(awayColumn.accessorKey).toBe('away_team_name')
      expect(awayColumn.header).toBe('Away')
    })

    it('has Score column with correct configuration', () => {
      const scoreColumn = matchColumns[3] as any
      expect(scoreColumn.accessorKey).toBe('score')
      expect(scoreColumn.header).toBe('Score')
    })
  })

  describe('Date Formatting', () => {
    it('formats dates correctly', () => {
      render(<LastMatchesTable {...defaultProps} />)
      
      // Dates should be formatted using toLocaleDateString
      const formattedDate1 = new Date('2025-10-20').toLocaleDateString()
      const formattedDate2 = new Date('2025-10-18').toLocaleDateString()
      
      expect(screen.getByText(formattedDate1)).toBeInTheDocument()
      expect(screen.getByText(formattedDate2)).toBeInTheDocument()
    })
  })

  describe('Team Display', () => {
    it('renders home team logos', () => {
      const { container } = render(<LastMatchesTable {...defaultProps} />)
      
      const lakersLogo = container.querySelector('img[src="/logos/lakers.png"]')
      const celticsLogo = container.querySelector('img[src="/logos/celtics.png"]')
      
      expect(lakersLogo).toBeInTheDocument()
      expect(celticsLogo).toBeInTheDocument()
    })

    it('renders away team logos', () => {
      const { container } = render(<LastMatchesTable {...defaultProps} />)
      
      const warriorsLogo = container.querySelector('img[src="/logos/warriors.png"]')
      const bullsLogo = container.querySelector('img[src="/logos/bulls.png"]')
      
      expect(warriorsLogo).toBeInTheDocument()
      expect(bullsLogo).toBeInTheDocument()
    })

    it('sets alt text for home team logos', () => {
      const { container } = render(<LastMatchesTable {...defaultProps} />)
      
      const homeLogos = container.querySelectorAll('img[alt="home logo"]')
      expect(homeLogos.length).toBeGreaterThan(0)
    })

    it('sets alt text for away team logos', () => {
      const { container } = render(<LastMatchesTable {...defaultProps} />)
      
      const awayLogos = container.querySelectorAll('img[alt="away logo"]')
      expect(awayLogos.length).toBeGreaterThan(0)
    })

    it('renders team names with logos', () => {
      render(<LastMatchesTable {...defaultProps} />)
      
      expect(screen.getByText('Lakers')).toBeInTheDocument()
      expect(screen.getByText('Warriors')).toBeInTheDocument()
    })
  })

  describe('Score Display', () => {
    it('displays scores in correct format', () => {
      render(<LastMatchesTable {...defaultProps} />)
      
      expect(screen.getByText('105 - 98')).toBeInTheDocument()
      expect(screen.getByText('110 - 102')).toBeInTheDocument()
    })

    it('displays scores for incomplete matches', () => {
      render(<LastMatchesTable {...defaultProps} />)
      
      expect(screen.getByText('0 - 0')).toBeInTheDocument()
    })

    it('displays scores with correct spacing', () => {
      render(<LastMatchesTable {...defaultProps} />)
      
      const scoreText = screen.getByText('105 - 98')
      expect(scoreText.textContent).toBe('105 - 98')
    })
  })

  describe('Row Click Handling', () => {
    it('calls onRowClick when a row is clicked', () => {
      const mockOnRowClick = jest.fn()
      render(<LastMatchesTable {...defaultProps} onRowClick={mockOnRowClick} />)
      
      const firstRow = screen.getByTestId('table-row-0')
      fireEvent.click(firstRow)
      
      expect(mockOnRowClick).toHaveBeenCalledWith(mockMatches[0])
      expect(mockOnRowClick).toHaveBeenCalledTimes(1)
    })

    it('calls onRowClick with correct match data', () => {
      const mockOnRowClick = jest.fn()
      render(<LastMatchesTable {...defaultProps} onRowClick={mockOnRowClick} />)
      
      const secondRow = screen.getByTestId('table-row-1')
      fireEvent.click(secondRow)
      
      expect(mockOnRowClick).toHaveBeenCalledWith(mockMatches[1])
    })

    it('handles multiple row clicks', () => {
      const mockOnRowClick = jest.fn()
      render(<LastMatchesTable {...defaultProps} onRowClick={mockOnRowClick} />)
      
      const firstRow = screen.getByTestId('table-row-0')
      const secondRow = screen.getByTestId('table-row-1')
      
      fireEvent.click(firstRow)
      fireEvent.click(secondRow)
      
      expect(mockOnRowClick).toHaveBeenCalledTimes(2)
    })

    it('does not throw when onRowClick is undefined', () => {
      render(<LastMatchesTable {...defaultProps} onRowClick={undefined} />)
      
      const firstRow = screen.getByTestId('table-row-0')
      expect(() => fireEvent.click(firstRow)).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty data array', () => {
      render(<LastMatchesTable {...defaultProps} data={[]} />)
      
      expect(screen.getByText('Last 5 Matches')).toBeInTheDocument()
      expect(screen.getByTestId('data-table')).toBeInTheDocument()
    })

    it('handles single match', () => {
      render(<LastMatchesTable {...defaultProps} data={[mockMatches[0]]} />)
      
      expect(screen.getByText('Lakers')).toBeInTheDocument()
      expect(screen.getByText('Warriors')).toBeInTheDocument()
    })

    it('handles large number of matches', () => {
      const manyMatches: MatchDetails[] = Array.from({ length: 20 }, (_, i) => ({
        match_id: `match-${i}`,
        home_team_name: `Home Team ${i}`,
        away_team_name: `Away Team ${i}`,
        home_icon_url: `/logo-home-${i}.png`,
        away_icon_url: `/logo-away-${i}.png`,
        home_score: 100 + i,
        away_score: 95 + i,
        match_date: '2025-10-20',
        completed: true,
      }))
      
      expect(() => 
        render(<LastMatchesTable {...defaultProps} data={manyMatches} />)
      ).not.toThrow()
    })

    it('handles matches with high scores', () => {
      const highScoreMatch: MatchDetails = {
        ...mockMatches[0],
        home_score: 999,
        away_score: 888,
      }
      
      render(<LastMatchesTable {...defaultProps} data={[highScoreMatch]} />)
      
      expect(screen.getByText('999 - 888')).toBeInTheDocument()
    })

    it('handles invalid date strings gracefully', () => {
      const matchWithInvalidDate: MatchDetails = {
        ...mockMatches[0],
        match_date: 'invalid-date',
      }
      
      expect(() => 
        render(<LastMatchesTable {...defaultProps} data={[matchWithInvalidDate]} />)
      ).not.toThrow()
    })

    it('handles missing icon URLs', () => {
      const matchWithoutIcons: MatchDetails = {
        ...mockMatches[0],
        home_icon_url: '',
        away_icon_url: '',
      }
      
      expect(() => 
        render(<LastMatchesTable {...defaultProps} data={[matchWithoutIcons]} />)
      ).not.toThrow()
    })

    it('handles very long team names', () => {
      const matchWithLongNames: MatchDetails = {
        ...mockMatches[0],
        home_team_name: 'Very Long Team Name That Should Not Break Layout',
        away_team_name: 'Another Very Long Team Name',
      }
      
      render(<LastMatchesTable {...defaultProps} data={[matchWithLongNames]} />)
      
      expect(screen.getByText('Very Long Team Name That Should Not Break Layout')).toBeInTheDocument()
    })
  })

  describe('Layout and Styling', () => {
    it('applies correct container classes', () => {
      const { container } = render(<LastMatchesTable {...defaultProps} />)
      
      const mainContainer = container.querySelector('.w-full')
      expect(mainContainer).toBeInTheDocument()
    })

    it('applies correct title styling', () => {
      render(<LastMatchesTable {...defaultProps} />)
      
      const title = screen.getByText('Last 5 Matches')
      expect(title).toHaveClass('text-lg', 'font-semibold', 'text-white', 'mb-4', 'text-center')
    })

    it('renders team logos with correct size classes', () => {
      const { container } = render(<LastMatchesTable {...defaultProps} />)
      
      const logos = container.querySelectorAll('img.w-6.h-6')
      expect(logos.length).toBeGreaterThan(0)
    })

    it('applies rounded-full class to logos', () => {
      const { container } = render(<LastMatchesTable {...defaultProps} />)
      
      const logos = container.querySelectorAll('img.rounded-full')
      expect(logos.length).toBeGreaterThan(0)
    })
  })

  describe('Props Handling', () => {
    it('accepts custom title', () => {
      render(<LastMatchesTable {...defaultProps} title="Recent Games" />)
      
      expect(screen.getByText('Recent Games')).toBeInTheDocument()
    })

    it('works without onRowClick prop', () => {
      const { onRowClick, ...propsWithoutClick } = defaultProps
      
      expect(() => 
        render(<LastMatchesTable {...propsWithoutClick} />)
      ).not.toThrow()
    })

    it('passes columns correctly to DataTable', () => {
      render(<LastMatchesTable {...defaultProps} />)
      
      // Verify all column headers are rendered
      expect(screen.getByText('Date')).toBeInTheDocument()
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Away')).toBeInTheDocument()
      expect(screen.getByText('Score')).toBeInTheDocument()
    })
  })
})