// jest.setup.ts (if you prefer TypeScript setup file)
import '@testing-library/jest-dom'

// Mock IntersectionObserver with complete implementation
class MockIntersectionObserver implements IntersectionObserver {
  root: Element | Document | null = null;
  rootMargin: string = '0px';
  thresholds: ReadonlyArray<number> = [];

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    this.root = options?.root || null;
    this.rootMargin = options?.rootMargin || '0px';
    this.thresholds = options?.threshold 
      ? Array.isArray(options.threshold) 
        ? options.threshold 
        : [options.threshold]
      : [0];
  }

  observe(target: Element): void {
    // Mock implementation - does nothing
  }

  unobserve(target: Element): void {
    // Mock implementation - does nothing
  }

  disconnect(): void {
    // Mock implementation - does nothing
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

// Mock ResizeObserver with complete implementation
class MockResizeObserver implements ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    // Mock implementation - does nothing
  }

  observe(target: Element, options?: ResizeObserverOptions): void {
    // Mock implementation - does nothing
  }

  unobserve(target: Element): void {
    // Mock implementation - does nothing
  }

  disconnect(): void {
    // Mock implementation - does nothing
  }
}

// Assign mocks to global
global.IntersectionObserver = MockIntersectionObserver;
global.ResizeObserver = MockResizeObserver;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});