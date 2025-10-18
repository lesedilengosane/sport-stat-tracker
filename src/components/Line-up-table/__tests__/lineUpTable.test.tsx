// src/components/Line-up-table/LineUp-table.test.tsx
import { render, screen } from '@testing-library/react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../LineUp-table';

// Mock data type
type TestData = {
  id: string;
  name: string;
  position: string;
};

// Mock columns
const mockColumns: ColumnDef<TestData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'position',
    header: 'Position',
  },
];

// Mock data
const mockData: TestData[] = [
  { id: '1', name: 'John Doe', position: 'Forward' },
  { id: '2', name: 'Jane Smith', position: 'Midfielder' },
  { id: '3', name: 'Bob Johnson', position: 'Defender' },
];

describe('DataTable', () => {
  describe('Rendering', () => {
    it('should render the table with correct structure', () => {
      render(<DataTable columns={mockColumns} data={mockData} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should render all column headers', () => {
      render(<DataTable columns={mockColumns} data={mockData} />);
      
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Position')).toBeInTheDocument();
    });

    it('should render all data rows', () => {
      render(<DataTable columns={mockColumns} data={mockData} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.getByText('Forward')).toBeInTheDocument();
      expect(screen.getByText('Midfielder')).toBeInTheDocument();
      expect(screen.getByText('Defender')).toBeInTheDocument();
    });

    it('should render correct number of rows', () => {
      render(<DataTable columns={mockColumns} data={mockData} />);
      
      const rows = screen.getAllByRole('row');
      // 1 header row + 3 data rows
      expect(rows).toHaveLength(4);
    });
  });

  describe('Empty State', () => {
    it('should display "No results." when data array is empty', () => {
      render(<DataTable columns={mockColumns} data={[]} />);
      
      expect(screen.getByText('No results.')).toBeInTheDocument();
    });

    it('should render only header row when data is empty', () => {
      render(<DataTable columns={mockColumns} data={[]} />);
      
      const rows = screen.getAllByRole('row');
      // 1 header row + 1 "no results" row
      expect(rows).toHaveLength(2);
    });

    it('should span all columns in empty state message', () => {
      render(<DataTable columns={mockColumns} data={[]} />);
      
      const noResultsCell = screen.getByText('No results.');
      expect(noResultsCell).toHaveAttribute('colspan', String(mockColumns.length));
    });
  });

  describe('Styling', () => {
    it('should apply orange border to table container', () => {
      const { container } = render(<DataTable columns={mockColumns} data={mockData} />);
      
      const tableContainer = container.firstChild;
      expect(tableContainer).toHaveClass('border-orange-500');
    });

    it('should apply orange background to header', () => {
      const { container } = render(<DataTable columns={mockColumns} data={mockData} />);
      
      const tableHeader = container.querySelector('thead');
      expect(tableHeader).toHaveClass('bg-orange-500');
    });

    it('should apply hover styles to data rows', () => {
      const { container } = render(<DataTable columns={mockColumns} data={mockData} />);
      
      const dataRows = container.querySelectorAll('tbody tr');
      dataRows.forEach(row => {
        expect(row).toHaveClass('hover:bg-orange-600/20');
      });
    });
  });

  describe('Custom Cell Rendering', () => {
    it('should render custom cell content', () => {
      const customColumns: ColumnDef<TestData>[] = [
        {
          accessorKey: 'name',
          header: 'Player',
          cell: ({ row }) => <span data-testid="custom-cell">{row.original.name.toUpperCase()}</span>,
        },
      ];

      render(<DataTable columns={customColumns} data={[mockData[0]]} />);
      
      expect(screen.getByTestId('custom-cell')).toHaveTextContent('JOHN DOE');
    });

    it('should render custom header content', () => {
      const customColumns: ColumnDef<TestData>[] = [
        {
          accessorKey: 'name',
          header: () => <span data-testid="custom-header">Custom Header</span>,
        },
      ];

      render(<DataTable columns={customColumns} data={mockData} />);
      
      expect(screen.getByTestId('custom-header')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single row of data', () => {
      render(<DataTable columns={mockColumns} data={[mockData[0]]} />);
      
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(2); // header + 1 data row
    });

    it('should handle single column', () => {
      const singleColumn: ColumnDef<TestData>[] = [
        {
          accessorKey: 'name',
          header: 'Name',
        },
      ];

      render(<DataTable columns={singleColumn} data={mockData} />);
      
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.queryByText('Position')).not.toBeInTheDocument();
    });

    it('should handle data with undefined values', () => {
      const dataWithUndefined: TestData[] = [
        { id: '1', name: 'John Doe', position: undefined as any },
      ];

      render(<DataTable columns={mockColumns} data={dataWithUndefined} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure for screen readers', () => {
      render(<DataTable columns={mockColumns} data={mockData} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(2);
      expect(screen.getAllByRole('row')).toHaveLength(4);
    });

    it('should render table headers with correct role', () => {
      render(<DataTable columns={mockColumns} data={mockData} />);
      
      const headers = screen.getAllByRole('columnheader');
      expect(headers[0]).toHaveTextContent('Name');
      expect(headers[1]).toHaveTextContent('Position');
    });
  });
});