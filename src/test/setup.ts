// Test setup file for vitest

// Mock requestAnimationFrame and cancelAnimationFrame for jsdom environment
if (typeof globalThis.requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number => {
    return setTimeout(() => callback(Date.now()), 0) as unknown as number;
  };
}

if (typeof globalThis.cancelAnimationFrame === 'undefined') {
  globalThis.cancelAnimationFrame = (id: number): void => {
    clearTimeout(id);
  };
}

// Mock performance.now if not available
if (typeof globalThis.performance === 'undefined') {
  globalThis.performance = {
    now: () => Date.now(),
  } as Performance;
}
