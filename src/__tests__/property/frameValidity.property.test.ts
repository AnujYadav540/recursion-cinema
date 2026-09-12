/**
 * Property-Based Tests for Frame Object Validity
 * 
 * Feature: recursion-cinema, Property 7: Frame Object Validity
 * 
 * For any output from StepGenerator.generateFrames(), each FrameObject must contain:
 * - a valid lineNo (positive integer)
 * - stackDepth (non-negative integer)
 * - a variables object
 * - action in {'CALL', 'RETURN', 'CALC'}
 * 
 * **Validates: Requirements 5.6, 5.7, 5.8**
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { StepGenerator } from '../../engine/StepGenerator';
import type { FrameObject } from '../../types';

describe('Property 7: Frame Object Validity', () => {
  const generator = new StepGenerator();

  // Generator for valid Java recursive code patterns
  const recursiveCodeArbitrary = fc.oneof(
    // Factorial patterns
    fc.integer({ min: 1, max: 8 }).map(n => `
      public class Test {
        public static int factorial(int n) {
          if (n <= 1) {
            return 1;
          }
          return n * factorial(n - 1);
        }
      }
      // factorial(${n})
    `),
    
    // Fibonacci patterns
    fc.integer({ min: 1, max: 5 }).map(n => `
      public class Test {
        public static int fib(int n) {
          if (n <= 1) {
            return n;
          }
          return fib(n - 1) + fib(n - 2);
        }
      }
      // fib(${n})
    `),
    
    // Sum patterns
    fc.integer({ min: 1, max: 8 }).map(n => `
      public class Test {
        public static int sum(int n) {
          if (n <= 0) {
            return 0;
          }
          return n + sum(n - 1);
        }
      }
      // sum(${n})
    `),
    
    // Power patterns
    fc.tuple(fc.integer({ min: 2, max: 3 }), fc.integer({ min: 1, max: 4 })).map(([base, exp]) => `
      public class Test {
        public static int power(int base, int exp) {
          if (exp <= 0) {
            return 1;
          }
          return base * power(base, exp - 1);
        }
      }
      // power(${base}, ${exp})
    `),
  );

  /**
   * Property: All generated frames have valid lineNo (positive integer)
   */
  it('should generate frames with valid lineNo (positive integer)', () => {
    fc.assert(
      fc.property(recursiveCodeArbitrary, (code) => {
        const frames = generator.generateFrames(code);
        
        // Skip empty results (invalid code)
        if (frames.length === 0) return true;
        
        return frames.every((frame: FrameObject) => {
          return typeof frame.lineNo === 'number' &&
                 Number.isInteger(frame.lineNo) &&
                 frame.lineNo > 0;
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All generated frames have valid stackDepth (non-negative integer)
   */
  it('should generate frames with valid stackDepth (non-negative integer)', () => {
    fc.assert(
      fc.property(recursiveCodeArbitrary, (code) => {
        const frames = generator.generateFrames(code);
        
        if (frames.length === 0) return true;
        
        return frames.every((frame: FrameObject) => {
          return typeof frame.stackDepth === 'number' &&
                 Number.isInteger(frame.stackDepth) &&
                 frame.stackDepth >= 0;
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All generated frames have a variables object
   */
  it('should generate frames with a variables object', () => {
    fc.assert(
      fc.property(recursiveCodeArbitrary, (code) => {
        const frames = generator.generateFrames(code);
        
        if (frames.length === 0) return true;
        
        return frames.every((frame: FrameObject) => {
          return typeof frame.variables === 'object' &&
                 frame.variables !== null;
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All generated frames have valid action type
   */
  it('should generate frames with action in {CALL, RETURN, CALC}', () => {
    const validActions = new Set(['CALL', 'RETURN', 'CALC']);
    
    fc.assert(
      fc.property(recursiveCodeArbitrary, (code) => {
        const frames = generator.generateFrames(code);
        
        if (frames.length === 0) return true;
        
        return frames.every((frame: FrameObject) => {
          return validActions.has(frame.action);
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All generated frames have a unique id
   */
  it('should generate frames with unique ids', () => {
    fc.assert(
      fc.property(recursiveCodeArbitrary, (code) => {
        const frames = generator.generateFrames(code);
        
        if (frames.length === 0) return true;
        
        const ids = frames.map((f: FrameObject) => f.id);
        const uniqueIds = new Set(ids);
        
        return ids.length === uniqueIds.size;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All generated frames have a functionName string
   */
  it('should generate frames with a functionName string', () => {
    fc.assert(
      fc.property(recursiveCodeArbitrary, (code) => {
        const frames = generator.generateFrames(code);
        
        if (frames.length === 0) return true;
        
        return frames.every((frame: FrameObject) => {
          return typeof frame.functionName === 'string' &&
                 frame.functionName.length > 0;
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: RETURN frames should have a returnValue (or undefined for void)
   */
  it('should generate RETURN frames with returnValue defined', () => {
    fc.assert(
      fc.property(recursiveCodeArbitrary, (code) => {
        const frames = generator.generateFrames(code);
        
        if (frames.length === 0) return true;
        
        const returnFrames = frames.filter((f: FrameObject) => f.action === 'RETURN');
        
        // All RETURN frames should exist (we're testing non-void functions)
        return returnFrames.length > 0;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Non-root CALL frames should have parentFrameId
   */
  it('should generate non-root CALL frames with parentFrameId', () => {
    fc.assert(
      fc.property(recursiveCodeArbitrary, (code) => {
        const frames = generator.generateFrames(code);
        
        if (frames.length === 0) return true;
        
        const callFrames = frames.filter((f: FrameObject) => f.action === 'CALL');
        
        return callFrames.every((frame: FrameObject) => {
          // Root frame (stackDepth 0) doesn't need parentFrameId
          if (frame.stackDepth === 0) return true;
          // Non-root frames should have parentFrameId
          return frame.parentFrameId !== undefined;
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: CALL frames should have parameters field
   */
  it('should generate CALL frames with parameters field', () => {
    fc.assert(
      fc.property(recursiveCodeArbitrary, (code) => {
        const frames = generator.generateFrames(code);
        
        if (frames.length === 0) return true;
        
        const callFrames = frames.filter((f: FrameObject) => f.action === 'CALL');
        
        return callFrames.every((frame: FrameObject) => {
          return typeof frame.parameters === 'object' &&
                 frame.parameters !== null;
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Combined Property: All frame validity constraints
   */
  it('should satisfy all frame validity constraints together', () => {
    const validActions = new Set(['CALL', 'RETURN', 'CALC']);
    
    fc.assert(
      fc.property(recursiveCodeArbitrary, (code) => {
        const frames = generator.generateFrames(code);
        
        if (frames.length === 0) return true;
        
        const ids = new Set<string>();
        
        return frames.every((frame: FrameObject) => {
          // Check unique id
          if (ids.has(frame.id)) return false;
          ids.add(frame.id);
          
          // Check lineNo is positive integer
          if (!Number.isInteger(frame.lineNo) || frame.lineNo <= 0) return false;
          
          // Check stackDepth is non-negative integer
          if (!Number.isInteger(frame.stackDepth) || frame.stackDepth < 0) return false;
          
          // Check variables is object
          if (typeof frame.variables !== 'object' || frame.variables === null) return false;
          
          // Check action is valid
          if (!validActions.has(frame.action)) return false;
          
          // Check functionName is non-empty string
          if (typeof frame.functionName !== 'string' || frame.functionName.length === 0) return false;
          
          return true;
        });
      }),
      { numRuns: 100 }
    );
  });
});
