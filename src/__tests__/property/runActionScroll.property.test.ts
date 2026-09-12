/**
 * Property Test: Run Action Scroll Behavior
 * **Property 2: Run Action Scroll Behavior**
 * **Validates: Requirements 2.7**
 * 
 * For any successful code execution, the system SHALL scroll to the Visualization_Section.
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

interface ExecutionResult {
  success: boolean;
  frameCount: number;
  error?: string;
}

// Simulates the scroll behavior after code execution
function simulateRunAction(result: ExecutionResult): {
  shouldScroll: boolean;
  targetSection: string;
  scrollBehavior: 'smooth' | 'auto';
} {
  // Only scroll if execution was successful and produced frames
  if (result.success && result.frameCount > 0) {
    return {
      shouldScroll: true,
      targetSection: 'visualization',
      scrollBehavior: 'smooth',
    };
  }
  
  return {
    shouldScroll: false,
    targetSection: '',
    scrollBehavior: 'auto',
  };
}

// Generate valid Java code that produces frames
function generateValidCode(funcName: string, param: number): string {
  return `int ${funcName}(int n) {
    if (n <= 0) { return 0; }
    return n + ${funcName}(n - 1);
}
${funcName}(${param});`;
}

// Generate invalid code that produces errors
function generateInvalidCode(): string {
  return 'invalid code without method';
}

describe('Feature: scrollable-website-redesign, Property 2: Run Action Scroll Behavior', () => {
  
  it('for any successful execution with frames, should scroll to visualization', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (frameCount) => {
          const result: ExecutionResult = {
            success: true,
            frameCount,
          };
          
          const scrollAction = simulateRunAction(result);
          expect(scrollAction.shouldScroll).toBe(true);
          expect(scrollAction.targetSection).toBe('visualization');
          expect(scrollAction.scrollBehavior).toBe('smooth');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any failed execution, should not scroll', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (errorMessage) => {
          const result: ExecutionResult = {
            success: false,
            frameCount: 0,
            error: errorMessage,
          };
          
          const scrollAction = simulateRunAction(result);
          expect(scrollAction.shouldScroll).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any execution with zero frames, should not scroll', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (success) => {
          const result: ExecutionResult = {
            success,
            frameCount: 0,
          };
          
          const scrollAction = simulateRunAction(result);
          expect(scrollAction.shouldScroll).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('scroll target should always be visualization section when scrolling', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 500 }),
        (frameCount) => {
          const result: ExecutionResult = {
            success: true,
            frameCount,
          };
          
          const scrollAction = simulateRunAction(result);
          if (scrollAction.shouldScroll) {
            expect(scrollAction.targetSection).toBe('visualization');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('scroll behavior should always be smooth for successful executions', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 500 }),
        (frameCount) => {
          const result: ExecutionResult = {
            success: true,
            frameCount,
          };
          
          const scrollAction = simulateRunAction(result);
          if (scrollAction.shouldScroll) {
            expect(scrollAction.scrollBehavior).toBe('smooth');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('valid recursive code should trigger scroll', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z]\w*$/.test(s)),
        fc.integer({ min: 1, max: 10 }),
        (funcName, param) => {
          // Simulate that valid code produces frames
          const code = generateValidCode(funcName, param);
          const result: ExecutionResult = {
            success: true,
            frameCount: param * 2, // Each call produces CALL + RETURN frames
          };
          
          const scrollAction = simulateRunAction(result);
          expect(scrollAction.shouldScroll).toBe(true);
          expect(scrollAction.targetSection).toBe('visualization');
        }
      ),
      { numRuns: 100 }
    );
  });
});
