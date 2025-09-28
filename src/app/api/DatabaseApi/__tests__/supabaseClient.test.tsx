// src/app/api/DatabaseApi/__tests__/supabaseClient.test.ts
describe('Supabase Client Configuration', () => {
  const originalEnv = process.env;
  
  // Mock the createClient function before importing
  const mockCreateClient = jest.fn();
  
  beforeAll(() => {
    // Mock the @supabase/supabase-js module
    jest.doMock('@supabase/supabase-js', () => ({
      createClient: mockCreateClient,
    }));
  });

  beforeEach(() => {
    // Reset environment and mocks
    process.env = { ...originalEnv };
    mockCreateClient.mockReset();
    // Clear module cache to ensure fresh imports
    jest.resetModules();
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
    jest.dontMock('@supabase/supabase-js');
  });

  describe('Environment Variable Validation', () => {
    it('should throw error when SUPABASE_URL is missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      expect(() => {
        require('../supabaseClient');
      }).toThrow('Supabase URL or ANON KEY is missing. Please check .env.local');
    });

    it('should throw error when SUPABASE_ANON_KEY is missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      expect(() => {
        require('../supabaseClient');
      }).toThrow('Supabase URL or ANON KEY is missing. Please check .env.local');
    });

    it('should throw error when both environment variables are missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      expect(() => {
        require('../supabaseClient');
      }).toThrow('Supabase URL or ANON KEY is missing. Please check .env.local');
    });

    it('should throw error when SUPABASE_URL is empty string', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = '';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      expect(() => {
        require('../supabaseClient');
      }).toThrow('Supabase URL or ANON KEY is missing. Please check .env.local');
    });

    it('should throw error when SUPABASE_ANON_KEY is empty string', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

      expect(() => {
        require('../supabaseClient');
      }).toThrow('Supabase URL or ANON KEY is missing. Please check .env.local');
    });
  });

  describe('Successful Client Creation', () => {
    it('should create supabase client with valid environment variables', () => {
      const testUrl = 'https://test.supabase.co';
      const testKey = 'test-anon-key';
      
      process.env.NEXT_PUBLIC_SUPABASE_URL = testUrl;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = testKey;

      // Mock the createClient return value
      const mockClient = { 
        auth: { signIn: jest.fn() },
        from: jest.fn()
      };
      mockCreateClient.mockReturnValue(mockClient);

      const { supabase } = require('../supabaseClient');

      expect(mockCreateClient).toHaveBeenCalledWith(testUrl, testKey);
      expect(mockCreateClient).toHaveBeenCalledTimes(1);
      expect(supabase).toBe(mockClient);
    });

    it('should handle different URL formats', () => {
      const testUrls = [
        'https://abc123.supabase.co',
        'https://my-project.supabase.co',
        'https://test-project-123.supabase.co',
      ];

      testUrls.forEach((url) => {
        // Reset for each iteration
        jest.resetModules();
        mockCreateClient.mockReset();
        
        process.env.NEXT_PUBLIC_SUPABASE_URL = url;
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

        const mockClient = { auth: {}, from: jest.fn() };
        mockCreateClient.mockReturnValue(mockClient);

        const { supabase } = require('../supabaseClient');

        expect(mockCreateClient).toHaveBeenCalledWith(url, 'test-key');
        expect(supabase).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should provide helpful error message', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      expect(() => {
        require('../supabaseClient');
      }).toThrow(/Supabase URL or ANON KEY is missing/);
    });

    it('should mention .env.local in error message', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

      expect(() => {
        require('../supabaseClient');
      }).toThrow(/\.env\.local/);
    });
  });

  describe('Environment Variable Names', () => {
    it('should require NEXT_PUBLIC_ prefix', () => {
      // Set variables without NEXT_PUBLIC_ prefix
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-key';
      
      // Should still fail
      expect(() => {
        require('../supabaseClient');
      }).toThrow('Supabase URL or ANON KEY is missing. Please check .env.local');
    });

    it('should work with NEXT_PUBLIC_ prefix', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

      const mockClient = { auth: {}, from: jest.fn() };
      mockCreateClient.mockReturnValue(mockClient);

      expect(() => {
        require('../supabaseClient');
      }).not.toThrow();
    });
  });

  describe('Module Export', () => {
    it('should export supabase client correctly', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

      const mockClient = { auth: {}, from: jest.fn() };
      mockCreateClient.mockReturnValue(mockClient);

      const exports = require('../supabaseClient');

      expect(exports).toHaveProperty('supabase');
      expect(exports.supabase).toBe(mockClient);
    });
  });

  describe('Integration', () => {
    it('should pass correct parameters to createClient', () => {
      const testUrl = 'https://my-project.supabase.co';
      const testKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example';

      process.env.NEXT_PUBLIC_SUPABASE_URL = testUrl;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = testKey;

      const mockClient = { 
        auth: { 
          signInWithOAuth: jest.fn(),
          getSession: jest.fn()
        },
        from: jest.fn()
      };
      mockCreateClient.mockReturnValue(mockClient);

      const { supabase } = require('../supabaseClient');

      expect(mockCreateClient).toHaveBeenCalledWith(testUrl, testKey);
      expect(mockCreateClient).toHaveBeenCalledTimes(1);
      expect(supabase.auth).toBeDefined();
      expect(supabase.from).toBeDefined();
    });

    it('should call createClient with exactly two parameters', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

      const mockClient = { auth: {}, from: jest.fn() };
      mockCreateClient.mockReturnValue(mockClient);

      require('../supabaseClient');

      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-key'
      );
      
      // Verify exactly 2 parameters were passed
      const callArgs = mockCreateClient.mock.calls[0];
      expect(callArgs).toHaveLength(2);
    });
  });

  describe('Realistic Scenarios', () => {
    it('should handle production-like environment variables', () => {
      const productionUrl = 'https://abcdefghijklmnop.supabase.co';
      const productionKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NzI5NzY5NCwiZXhwIjoxOTYyODczNjk0fQ.test';

      process.env.NEXT_PUBLIC_SUPABASE_URL = productionUrl;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = productionKey;

      const mockClient = { 
        auth: {}, 
        from: jest.fn(),
        storage: { from: jest.fn() },
        realtime: { channel: jest.fn() }
      };
      mockCreateClient.mockReturnValue(mockClient);

      expect(() => {
        const { supabase } = require('../supabaseClient');
        expect(supabase).toBeDefined();
      }).not.toThrow();

      expect(mockCreateClient).toHaveBeenCalledWith(productionUrl, productionKey);
    });

    it('should handle local development environment variables', () => {
      const localUrl = 'http://localhost:54321';
      const localKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.local-dev-key';

      process.env.NEXT_PUBLIC_SUPABASE_URL = localUrl;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = localKey;

      const mockClient = { auth: {}, from: jest.fn() };
      mockCreateClient.mockReturnValue(mockClient);

      expect(() => {
        require('../supabaseClient');
      }).not.toThrow();

      expect(mockCreateClient).toHaveBeenCalledWith(localUrl, localKey);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long keys', () => {
      const normalUrl = 'https://test.supabase.co';
      const veryLongKey = 'eyJ' + 'a'.repeat(1000) + '.very-long-key';

      process.env.NEXT_PUBLIC_SUPABASE_URL = normalUrl;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = veryLongKey;

      const mockClient = { auth: {}, from: jest.fn() };
      mockCreateClient.mockReturnValue(mockClient);

      expect(() => {
        require('../supabaseClient');
      }).not.toThrow();

      expect(mockCreateClient).toHaveBeenCalledWith(normalUrl, veryLongKey);
    });

    it('should handle URLs with special characters', () => {
      const urlWithChars = 'https://test-123_abc.supabase.co';
      const keyWithChars = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-key_123';

      process.env.NEXT_PUBLIC_SUPABASE_URL = urlWithChars;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = keyWithChars;

      const mockClient = { auth: {}, from: jest.fn() };
      mockCreateClient.mockReturnValue(mockClient);

      expect(() => {
        require('../supabaseClient');
      }).not.toThrow();

      expect(mockCreateClient).toHaveBeenCalledWith(urlWithChars, keyWithChars);
    });
  });
});