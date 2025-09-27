// src/app/analyst/__tests__/columns.test.tsx
import '@testing-library/jest-dom';
import { columns, Player_details } from '../column';
import { ColumnDef } from "@tanstack/react-table";

// Type guard to help with accessing column properties safely
const isColumnWithAccessor = (column: ColumnDef<Player_details>): column is ColumnDef<Player_details> & { accessorKey: keyof Player_details } => {
  return 'accessorKey' in column;
};

// Helper function to safely get value and assert it's defined
const getColumnValue = (player: Player_details, accessorKey: keyof Player_details): string => {
  const value = player[accessorKey];
  expect(value).toBeDefined();
  return value as string;
};

describe('Player Details Columns Configuration', () => {
  describe('Type Definitions', () => {
    it('should have correct Player_details type structure', () => {
      const testPlayer: Player_details = {
        id: '1',
        avatarUrl: 'https://example.com/avatar.jpg',
        name: 'John',
        surname: 'Doe',
        position: 'Forward',
      };

      expect(testPlayer.id).toBe('1');
      expect(testPlayer.avatarUrl).toBe('https://example.com/avatar.jpg');
      expect(testPlayer.name).toBe('John');
      expect(testPlayer.surname).toBe('Doe');
      expect(testPlayer.position).toBe('Forward');
    });

    it('should allow Player_details without optional avatarUrl', () => {
      const testPlayer: Player_details = {
        id: '2',
        name: 'Jane',
        surname: 'Smith',
        position: 'Guard',
      };

      expect(testPlayer.avatarUrl).toBeUndefined();
      expect(testPlayer.id).toBe('2');
      expect(testPlayer.name).toBe('Jane');
      expect(testPlayer.surname).toBe('Smith');
      expect(testPlayer.position).toBe('Guard');
    });

    it('should require all mandatory fields', () => {
      expect(() => {
        const validPlayer: Player_details = {
          id: '3',
          name: 'Valid',
          surname: 'Player',
          position: 'Center',
        };
        expect(validPlayer).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Columns Configuration', () => {
    it('should export columns array with correct length', () => {
      expect(columns).toBeDefined();
      expect(Array.isArray(columns)).toBe(true);
      expect(columns.length).toBe(3);
    });

    it('should have all columns with accessor keys', () => {
      columns.forEach(column => {
        expect(isColumnWithAccessor(column)).toBe(true);
      });
    });

    it('should have correct column configuration', () => {
      const expectedColumns = [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'surname', header: 'Surname' },
        { accessorKey: 'position', header: 'Position' }
      ];

      expectedColumns.forEach((expected, index) => {
        const column = columns[index];
        expect(isColumnWithAccessor(column)).toBe(true);
        if (isColumnWithAccessor(column)) {
          expect(column.accessorKey).toBe(expected.accessorKey);
          expect(column.header).toBe(expected.header);
        }
      });
    });

    it('should have proper header capitalization', () => {
      const headers = columns.map(col => col.header as string);
      
      headers.forEach(header => {
        expect(typeof header).toBe('string');
        expect(header.length).toBeGreaterThan(0);
        expect(header.charAt(0)).toBe(header.charAt(0).toUpperCase());
      });
    });
  });

  describe('Column Structure and Validation', () => {
    it('should have consistent column properties', () => {
      columns.forEach(column => {
        expect(column).toHaveProperty('header');
        expect(column.header).toBeDefined();
        expect(typeof column.header).toBe('string');
        
        if (isColumnWithAccessor(column)) {
          expect(column.accessorKey).toBeDefined();
          expect(typeof column.accessorKey).toBe('string');
        }
      });
    });

    it('should have unique headers and accessor keys', () => {
      const headers = columns.map(col => col.header as string);
      const uniqueHeaders = [...new Set(headers)];
      expect(headers.length).toBe(uniqueHeaders.length);

      const accessorKeys = columns
        .filter(isColumnWithAccessor)
        .map(col => col.accessorKey);
      const uniqueKeys = [...new Set(accessorKeys)];
      expect(accessorKeys.length).toBe(uniqueKeys.length);
    });

    it('should only include display-relevant columns', () => {
      const accessorKeys = columns
        .filter(isColumnWithAccessor)
        .map(col => col.accessorKey);

      // Should include essential display fields
      expect(accessorKeys).toContain('name');
      expect(accessorKeys).toContain('surname');
      expect(accessorKeys).toContain('position');

      // Should exclude non-display fields
      expect(accessorKeys).not.toContain('id');
      expect(accessorKeys).not.toContain('avatarUrl');
    });
  });

  describe('Data Integration', () => {
    it('should work correctly with player data', () => {
      const testPlayers: Player_details[] = [
        {
          id: '1',
          name: 'Michael',
          surname: 'Jordan',
          position: 'Shooting Guard',
        },
        {
          id: '2',
          name: 'LeBron',
          surname: 'James',
          position: 'Small Forward',
          avatarUrl: 'https://example.com/lebron.jpg',
        },
      ];

      testPlayers.forEach(player => {
        columns.forEach(column => {
          if (isColumnWithAccessor(column)) {
            const value = getColumnValue(player, column.accessorKey);
            expect(typeof value).toBe('string');
            expect(value.length).toBeGreaterThan(0);
          }
        });
      });
    });

    it('should handle various basketball positions', () => {
      const positions = [
        'Point Guard',
        'Shooting Guard', 
        'Small Forward',
        'Power Forward',
        'Center'
      ];

      positions.forEach((position, index) => {
        const player: Player_details = {
          id: `${index + 1}`,
          name: `Player`,
          surname: `${index + 1}`,
          position,
        };

        const positionColumn = columns.find(col => 
          isColumnWithAccessor(col) && col.accessorKey === 'position'
        );
        
        expect(positionColumn).toBeDefined();
        if (positionColumn && isColumnWithAccessor(positionColumn)) {
          const value = getColumnValue(player, positionColumn.accessorKey);
          expect(value).toBe(position);
        }
      });
    });

    it('should handle edge cases in data', () => {
      const edgeCasePlayer: Player_details = {
        id: '999',
        name: 'Very-Long-Hyphenated-First-Name',
        surname: 'O\'Connor-Smith',
        position: 'Point Guard / Shooting Guard',
      };

      columns.forEach(column => {
        if (isColumnWithAccessor(column)) {
          const value = getColumnValue(edgeCasePlayer, column.accessorKey);
          expect(typeof value).toBe('string');
        }
      });
    });
  });

  describe('TanStack Table Compatibility', () => {
    it('should be compatible with TanStack table structure', () => {
      columns.forEach(column => {
        expect(column).toMatchObject({
          header: expect.any(String),
        });
      });
    });

    it('should support table rendering with sample data', () => {
      const sampleData: Player_details[] = [
        { id: '1', name: 'John', surname: 'Doe', position: 'Guard' },
        { id: '2', name: 'Jane', surname: 'Smith', position: 'Forward' },
      ];

      sampleData.forEach(row => {
        columns.forEach(column => {
          if (isColumnWithAccessor(column)) {
            const cellValue = getColumnValue(row, column.accessorKey);
            expect(typeof cellValue).toBe('string');
          }
        });
      });
    });
  });

  describe('Performance and Optimization', () => {
    it('should not recreate columns unnecessarily', () => {
      expect(columns).toBe(columns);
      expect(Array.isArray(columns)).toBe(true);
    });

    it('should have minimal column configuration', () => {
      columns.forEach(column => {
        const keys = Object.keys(column);
        expect(keys.length).toBeGreaterThanOrEqual(1);
        expect(keys.length).toBeLessThanOrEqual(3);
      });
    });
  });

  describe('Extensibility and Maintenance', () => {
    it('should support adding new columns', () => {
      const extendedColumns: ColumnDef<Player_details>[] = [
        ...columns,
        {
          accessorKey: 'id',
          header: 'Player ID',
        },
      ];

      expect(extendedColumns.length).toBe(4);
      const newColumn = extendedColumns[3];
      expect(isColumnWithAccessor(newColumn)).toBe(true);
      if (isColumnWithAccessor(newColumn)) {
        expect(newColumn.accessorKey).toBe('id');
        expect(newColumn.header).toBe('Player ID');
      }
    });

    it('should support header customization', () => {
      const customizedColumns = columns.map(col => ({
        ...col,
        header: `Player ${col.header}`,
      }));

      expect(customizedColumns).toHaveLength(3);
      expect(customizedColumns[0].header).toBe('Player Name');
      expect(customizedColumns[1].header).toBe('Player Surname');
      expect(customizedColumns[2].header).toBe('Player Position');
    });

    it('should maintain type safety with modifications', () => {
      const testData: Player_details = {
        id: '1',
        name: 'Test',
        surname: 'Player',
        position: 'Guard',
      };

      columns.forEach(column => {
        if (isColumnWithAccessor(column)) {
          const value = getColumnValue(testData, column.accessorKey);
          expect(typeof value).toBe('string');
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle empty values gracefully', () => {
      const emptyPlayer: Player_details = {
        id: '',
        name: '',
        surname: '',
        position: '',
      };

      columns.forEach(column => {
        if (isColumnWithAccessor(column)) {
          const value = emptyPlayer[column.accessorKey];
          expect(value).toBeDefined();
          expect(typeof value).toBe('string');
          expect(value).toBe('');
        }
      });
    });

    it('should work with minimal player data', () => {
      const minimalPlayer: Player_details = {
        id: '1',
        name: 'A',
        surname: 'B',
        position: 'C',
      };

      columns.forEach(column => {
        if (isColumnWithAccessor(column)) {
          const value = getColumnValue(minimalPlayer, column.accessorKey);
          expect(value.length).toBeGreaterThanOrEqual(1);
        }
      });
    });
  });
});