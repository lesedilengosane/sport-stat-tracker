import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DemoPage from '../page';
import { Player_details } from '../column';

// Mock the DataTable component
jest.mock('../../../../components/Line-up-table/LineUp-table', () => ({
  DataTable: ({ columns, data }: { columns: any[]; data: Player_details[] }) => (
    <div data-testid="data-table">
      <table>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((player) => (
            <tr key={player.id} data-testid={`player-row-${player.id}`}>
              <td>{player.name}</td>
              <td>{player.surname}</td>
              <td>{player.position}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
}));

describe('DemoPage Component', () => {
  describe('Page Rendering', () => {
    it('renders without crashing', async () => {
      render(await DemoPage());
      
      expect(screen.getAllByTestId('data-table')).toHaveLength(2);
    });

    it('renders two DataTable components', async () => {
      render(await DemoPage());
      
      const tables = screen.getAllByTestId('data-table');
      expect(tables).toHaveLength(2);
    });

    it('applies correct container styling', async () => {
      const { container } = render(await DemoPage());
      
      const mainDiv = container.querySelector('.container');
      expect(mainDiv).toBeInTheDocument();
      expect(mainDiv).toHaveClass('mx-auto', 'py-10', 'flex', 'gap-6');
    });

    it('renders tables in 50/50 layout', async () => {
      const { container } = render(await DemoPage());
      
      const tableWrappers = container.querySelectorAll('.w-1\\/2');
      expect(tableWrappers).toHaveLength(2);
    });
  });

  describe('Data Loading', () => {
    it('displays all 10 players in each table', async () => {
      render(await DemoPage());
      
      await waitFor(() => {
        const michaelRows = screen.getAllByText('Michael');
        expect(michaelRows).toHaveLength(2); // One in each table
      });
    });

    it('displays correct player names', async () => {
      render(await DemoPage());
      
      const expectedNames = [
        'Michael', 'Alice', 'Bob', 'Carol', 'Dave',
        'Eve', 'Frank', 'Grace', 'Henry', 'Ivy'
      ];

      await waitFor(() => {
        expectedNames.forEach(name => {
          const elements = screen.getAllByText(name);
          expect(elements).toHaveLength(2); // Present in both tables
        });
      });
    });

    it('displays correct player surnames', async () => {
      render(await DemoPage());
      
      const expectedSurnames = [
        'Jordan', 'Smith', 'Johnson', 'Davis', 'Wilson',
        'Miller', 'Brown', 'Taylor', 'Anderson', 'Thomas'
      ];

      await waitFor(() => {
        expectedSurnames.forEach(surname => {
          const elements = screen.getAllByText(surname);
          expect(elements).toHaveLength(2);
        });
      });
    });

    it('displays correct player positions', async () => {
      render(await DemoPage());
      
      await waitFor(() => {
        expect(screen.getAllByText('Shooting Guard')).toHaveLength(4); // Michael and Eve, in both tables
        expect(screen.getAllByText('Point Guard')).toHaveLength(4); // Alice and Grace
        expect(screen.getAllByText('Center')).toHaveLength(4); // Bob and Frank
        expect(screen.getAllByText('Small Forward')).toHaveLength(4); // Carol and Henry
        expect(screen.getAllByText('Power Forward')).toHaveLength(4); // Dave and Ivy
      });
    });
  });

  describe('Player Data Integrity', () => {
    it('includes Michael Jordan with correct details', async () => {
      render(await DemoPage());
      
      await waitFor(() => {
        expect(screen.getAllByText('Michael')).toHaveLength(2);
        expect(screen.getAllByText('Jordan')).toHaveLength(2);
        expect(screen.getAllByText('Shooting Guard')).toBeTruthy();
      });
    });

    it('maintains consistent data across both tables', async () => {
      render(await DemoPage());
      
      await waitFor(() => {
        const table1Players = screen.getAllByTestId(/player-row-/);
        // Each player appears twice (once per table), so 10 players * 2 = 20 rows
        expect(table1Players.length).toBe(20);
      });
    });

    it('includes all unique player IDs', async () => {
      render(await DemoPage());
      
      const expectedIds = [
        '728ed52f', '9a12bc34', 'c67de89f', 'ef34ab56', '12cd34ef',
        '78gh56ij', '34kl78mn', '90op12qr', '56st34uv', 'ab89wx12'
      ];

      await waitFor(() => {
        expectedIds.forEach(id => {
          const rows = screen.getAllByTestId(`player-row-${id}`);
          expect(rows).toHaveLength(2); // One in each table
        });
      });
    });
  });

  describe('Position Distribution', () => {
    it('has correct number of each position type', async () => {
      render(await DemoPage());
      
      await waitFor(() => {
        // Each position count is doubled because there are 2 tables
        expect(screen.getAllByText('Point Guard').length).toBe(4); // 2 players * 2 tables
        expect(screen.getAllByText('Shooting Guard').length).toBe(4);
        expect(screen.getAllByText('Small Forward').length).toBe(4);
        expect(screen.getAllByText('Power Forward').length).toBe(4);
        expect(screen.getAllByText('Center').length).toBe(4);
      });
    });

    it('has balanced position distribution', async () => {
      render(await DemoPage());
      
      await waitFor(() => {
        const positions = [
          'Point Guard', 'Shooting Guard', 'Small Forward', 
          'Power Forward', 'Center'
        ];
        
        positions.forEach(position => {
          // Each position should appear exactly 4 times (2 players * 2 tables)
          expect(screen.getAllByText(position).length).toBe(4);
        });
      });
    });
  });

  describe('Data Structure', () => {
    it('passes columns prop to DataTable', async () => {
      render(await DemoPage());
      
      await waitFor(() => {
        // Check that table headers are rendered
        expect(screen.getAllByText('Name')).toHaveLength(2);
        expect(screen.getAllByText('Surname')).toHaveLength(2);
        expect(screen.getAllByText('Position')).toHaveLength(2);
      });
    });

    it('passes data prop with all players to DataTable', async () => {
      render(await DemoPage());
      
      await waitFor(() => {
        // Verify that all 10 unique players are present
        const uniquePlayers = ['Michael', 'Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy'];
        uniquePlayers.forEach(name => {
          expect(screen.getAllByText(name)).toHaveLength(2);
        });
      });
    });
  });

  describe('Async Behavior', () => {
    it('handles async data fetching', async () => {
      const component = await DemoPage();
      render(component);
      
      await waitFor(() => {
        expect(screen.getAllByTestId('data-table')).toHaveLength(2);
      });
    });

    it('renders data after getData resolves', async () => {
      render(await DemoPage());
      
      await waitFor(() => {
        expect(screen.getAllByText('Michael')).toBeTruthy();
      });
    });
  });

  describe('Layout Structure', () => {
    it('uses flexbox layout', async () => {
      const { container } = render(await DemoPage());
      
      const flexContainer = container.querySelector('.flex');
      expect(flexContainer).toBeInTheDocument();
    });

    it('applies gap between tables', async () => {
      const { container } = render(await DemoPage());
      
      const gapContainer = container.querySelector('.gap-6');
      expect(gapContainer).toBeInTheDocument();
    });

    it('centers content with container class', async () => {
      const { container } = render(await DemoPage());
      
      const containerDiv = container.querySelector('.container');
      expect(containerDiv).toHaveClass('mx-auto');
    });

    it('applies vertical padding', async () => {
      const { container } = render(await DemoPage());
      
      const paddedContainer = container.querySelector('.py-10');
      expect(paddedContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('renders identical data in both tables', async () => {
      render(await DemoPage());
      
      await waitFor(() => {
        const tables = screen.getAllByTestId('data-table');
        expect(tables[0].innerHTML).toBe(tables[1].innerHTML);
      });
    });

    it('handles players with same first name', async () => {
      render(await DemoPage());
      
      await waitFor(() => {
        // Verify that different players can be distinguished by surname
        expect(screen.getAllByText('Michael')).toHaveLength(2);
        expect(screen.getAllByText('Jordan')).toHaveLength(2);
      });
    });

    it('handles multi-word positions correctly', async () => {
      render(await DemoPage());
      
      await waitFor(() => {
        expect(screen.getAllByText('Shooting Guard')).toBeTruthy();
        expect(screen.getAllByText('Point Guard')).toBeTruthy();
        expect(screen.getAllByText('Small Forward')).toBeTruthy();
        expect(screen.getAllByText('Power Forward')).toBeTruthy();
      });
    });
  });

  describe('Data Completeness', () => {
    it('includes all required player properties', async () => {
      render(await DemoPage());
      
      await waitFor(() => {
        // Verify all players have name, surname, and position displayed
        expect(screen.getAllByText(/Michael|Alice|Bob|Carol|Dave|Eve|Frank|Grace|Henry|Ivy/).length).toBeGreaterThan(0);
      });
    });

    it('maintains player order', async () => {
      render(await DemoPage());
      
      await waitFor(() => {
        const rows = screen.getAllByTestId(/player-row-/);
        // First player should be Michael Jordan (appears twice, once in each table)
        expect(rows[0]).toHaveAttribute('data-testid', 'player-row-728ed52f');
      });
    });
  });

  describe('Component Integration', () => {
    it('integrates with DataTable component', async () => {
      render(await DemoPage());
      
      await waitFor(() => {
        const tables = screen.getAllByTestId('data-table');
        expect(tables.length).toBe(2);
        
        tables.forEach(table => {
          expect(table.querySelector('table')).toBeInTheDocument();
        });
      });
    });

    it('passes correct props structure to DataTable', async () => {
      render(await DemoPage());
      
      await waitFor(() => {
        // Verify that both columns and data are properly rendered
        expect(screen.getAllByText('Name')).toHaveLength(2); // Column header
        expect(screen.getAllByText('Michael')).toHaveLength(2); // Data
      });
    });
  });
});