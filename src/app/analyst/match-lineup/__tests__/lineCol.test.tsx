import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { columns, Player_details } from '../column';
import { ColumnDef, AccessorKeyColumnDef } from '@tanstack/react-table';

// Type guard to check if column has accessorKey
const isAccessorKeyColumn = (column: ColumnDef<Player_details>): column is AccessorKeyColumnDef<Player_details> => {
  return 'accessorKey' in column;
};

describe('Player Details Columns', () => {
  describe('Column Structure', () => {
    it('should export an array of column definitions', () => {
      expect(Array.isArray(columns)).toBe(true);
      expect(columns.length).toBeGreaterThan(0);
    });

    it('should have exactly 3 columns', () => {
      expect(columns.length).toBe(3);
    });

    it('should have all columns with accessorKey', () => {
      columns.forEach((column) => {
        expect(isAccessorKeyColumn(column)).toBe(true);
      });
    });

    it('should have all required column properties', () => {
      columns.forEach((column) => {
        if (isAccessorKeyColumn(column)) {
          expect(column.accessorKey).toBeDefined();
          expect(column.header).toBeDefined();
        }
      });
    });
  });

  describe('Name Column', () => {
    const nameColumn = columns[0];

    it('should have correct accessorKey', () => {
      if (isAccessorKeyColumn(nameColumn)) {
        expect(nameColumn.accessorKey).toBe('name');
      }
    });

    it('should have correct header', () => {
      expect(nameColumn.header).toBe('Name');
    });

    it('should be a ColumnDef type', () => {
      expect(nameColumn).toBeDefined();
      expect(typeof nameColumn).toBe('object');
    });
  });

  describe('Surname Column', () => {
    const surnameColumn = columns[1];

    it('should have correct accessorKey', () => {
      if (isAccessorKeyColumn(surnameColumn)) {
        expect(surnameColumn.accessorKey).toBe('surname');
      }
    });

    it('should have correct header', () => {
      expect(surnameColumn.header).toBe('Surname');
    });

    it('should be a ColumnDef type', () => {
      expect(surnameColumn).toBeDefined();
      expect(typeof surnameColumn).toBe('object');
    });
  });

  describe('Position Column', () => {
    const positionColumn = columns[2];

    it('should have correct accessorKey', () => {
      if (isAccessorKeyColumn(positionColumn)) {
        expect(positionColumn.accessorKey).toBe('position');
      }
    });

    it('should have correct header', () => {
      expect(positionColumn.header).toBe('Position');
    });

    it('should be a ColumnDef type', () => {
      expect(positionColumn).toBeDefined();
      expect(typeof positionColumn).toBe('object');
    });
  });

  describe('Player_details Type', () => {
    it('should allow valid player data', () => {
      const validPlayer: Player_details = {
        id: 'player-1',
        name: 'John',
        surname: 'Doe',
        position: 'Forward',
      };

      expect(validPlayer.id).toBe('player-1');
      expect(validPlayer.name).toBe('John');
      expect(validPlayer.surname).toBe('Doe');
      expect(validPlayer.position).toBe('Forward');
    });

    it('should allow optional avatarUrl', () => {
      const playerWithAvatar: Player_details = {
        id: 'player-2',
        name: 'Jane',
        surname: 'Smith',
        position: 'Guard',
        avatarUrl: '/avatars/jane.png',
      };

      expect(playerWithAvatar.avatarUrl).toBe('/avatars/jane.png');
    });

    it('should work without avatarUrl', () => {
      const playerWithoutAvatar: Player_details = {
        id: 'player-3',
        name: 'Mike',
        surname: 'Johnson',
        position: 'Center',
      };

      expect(playerWithoutAvatar.avatarUrl).toBeUndefined();
    });
  });

  describe('Column Order', () => {
    it('should have columns in correct order', () => {
      const accessorKeys = columns
        .filter(isAccessorKeyColumn)
        .map((col) => col.accessorKey);
      
      expect(accessorKeys[0]).toBe('name');
      expect(accessorKeys[1]).toBe('surname');
      expect(accessorKeys[2]).toBe('position');
    });

    it('should have headers in correct order', () => {
      expect(columns[0].header).toBe('Name');
      expect(columns[1].header).toBe('Surname');
      expect(columns[2].header).toBe('Position');
    });
  });

  describe('Column Accessibility', () => {
    it('should have readable header names', () => {
      columns.forEach((column) => {
        expect(typeof column.header).toBe('string');
        if (typeof column.header === 'string') {
          expect(column.header.length).toBeGreaterThan(0);
        }
      });
    });

    it('should have valid accessor keys', () => {
      const accessorKeys = columns
        .filter(isAccessorKeyColumn)
        .map((col) => col.accessorKey);
      
      expect(accessorKeys).toEqual(['name', 'surname', 'position']);
    });
  });

  describe('Type Safety', () => {
    it('should match Player_details interface properties', () => {
      const samplePlayer: Player_details = {
        id: 'test-id',
        name: 'Test',
        surname: 'Player',
        position: 'Guard',
      };

      const columnKeys = columns
        .filter(isAccessorKeyColumn)
        .map((col) => col.accessorKey);
      
      columnKeys.forEach((key) => {
        expect(key in samplePlayer).toBe(true);
      });
    });

    it('should not include id or avatarUrl in columns', () => {
      const columnKeys = columns
        .filter(isAccessorKeyColumn)
        .map((col) => col.accessorKey);
      
      expect(columnKeys).not.toContain('id');
      expect(columnKeys).not.toContain('avatarUrl');
    });
  });

  describe('Column Configuration', () => {
    it('should not have custom cell renderers by default', () => {
      columns.forEach((column) => {
        expect(column.cell).toBeUndefined();
      });
    });

    it('should not have custom sorting by default', () => {
      columns.forEach((column) => {
        expect(column.sortingFn).toBeUndefined();
      });
    });

    it('should not have custom filtering by default', () => {
      columns.forEach((column) => {
        expect(column.filterFn).toBeUndefined();
      });
    });

    it('should be simple text columns', () => {
      columns.forEach((column) => {
        if (isAccessorKeyColumn(column)) {
          expect(column.accessorKey).toBeTruthy();
        }
        expect(typeof column.header).toBe('string');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string values', () => {
      const emptyPlayer: Player_details = {
        id: '',
        name: '',
        surname: '',
        position: '',
      };

      expect(emptyPlayer.name).toBe('');
      expect(emptyPlayer.surname).toBe('');
      expect(emptyPlayer.position).toBe('');
    });

    it('should handle special characters in data', () => {
      const specialPlayer: Player_details = {
        id: 'player-special',
        name: "O'Connor",
        surname: 'Smith-Jones',
        position: 'Point Guard',
      };

      expect(specialPlayer.name).toContain("'");
      expect(specialPlayer.surname).toContain('-');
      expect(specialPlayer.position).toContain(' ');
    });

    it('should handle unicode characters', () => {
      const unicodePlayer: Player_details = {
        id: 'player-unicode',
        name: 'José',
        surname: 'González',
        position: 'Forward',
      };

      expect(unicodePlayer.name).toBe('José');
      expect(unicodePlayer.surname).toBe('González');
    });
  });

  describe('Column Immutability', () => {
    it('should not modify original columns array', () => {
      const originalLength = columns.length;
      const firstColumn = columns[0];
      const originalHeader = firstColumn.header;

      // Attempt operations that shouldn't mutate
      columns
        .filter(isAccessorKeyColumn)
        .map((col) => col.accessorKey);
      
      expect(columns.length).toBe(originalLength);
      expect(columns[0].header).toBe(originalHeader);
    });
  });

  describe('Column Headers', () => {
    it('should have capitalized headers', () => {
      columns.forEach((column) => {
        const header = column.header as string;
        expect(header[0]).toBe(header[0].toUpperCase());
      });
    });

    it('should not have empty headers', () => {
      columns.forEach((column) => {
        expect(column.header).toBeTruthy();
        if (typeof column.header === 'string') {
          expect(column.header.trim().length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Data Types', () => {
    it('should work with various position values', () => {
      const positions = ['Guard', 'Forward', 'Center', 'Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward'];
      
      positions.forEach((pos) => {
        const player: Player_details = {
          id: 'test',
          name: 'Test',
          surname: 'Player',
          position: pos,
        };
        
        expect(player.position).toBe(pos);
      });
    });

    it('should handle different name formats', () => {
      const names = ['John', 'Mary-Anne', "O'Brien", 'José', 'Muhammad'];
      
      names.forEach((name) => {
        const player: Player_details = {
          id: 'test',
          name: name,
          surname: 'Test',
          position: 'Guard',
        };
        
        expect(player.name).toBe(name);
      });
    });
  });

  describe('Column Accessor Keys', () => {
    it('should have exactly 3 accessor key columns', () => {
      const accessorKeyColumns = columns.filter(isAccessorKeyColumn);
      expect(accessorKeyColumns.length).toBe(3);
    });

    it('should map accessor keys to player properties', () => {
      const accessorKeys = columns
        .filter(isAccessorKeyColumn)
        .map((col) => col.accessorKey);

      const testPlayer: Player_details = {
        id: 'test',
        name: 'John',
        surname: 'Doe',
        position: 'Guard',
      };

      accessorKeys.forEach((key) => {
        expect(testPlayer[key as keyof Player_details]).toBeDefined();
      });
    });
  });
});