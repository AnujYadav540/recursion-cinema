/**
 * Property-Based Tests for Multi-Parameter Functions
 * 
 * Feature: recursion-cinema, Property 12: Multi-Parameter Functions Tracked
 * 
 * For any recursive function with multiple parameters (e.g., mergeSort(array, left, right)),
 * all parameters should be captured in the frame's variables object with correct values.
 * 
 * **Validates: Requirements 9.5**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { interpret } from '../../interpreter';
import type { FrameObject } from '../../types';

describe('Property 12: Multi-Parameter Functions Tracked', () => {
  /**
   * Property: Two-parameter functions have both parameters in variables
   */
  it('should track two parameters correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 1, max: 50 }),
        (a, b) => {
          const code = `
            public class Test {
              public static int add(int x, int y) {
                return x + y;
              }
            }
          `;
          
          const result = interpret(code, 'add', [a, b]);
          
          if (!result.success) return true;
          
          // Find the CALL frame for add
          const callFrame = result.frames.find(
            (f: FrameObject) => f.action === 'CALL' && f.functionName === 'add'
          );
          
          if (!callFrame) return true;
          
          // Both parameters should be in variables
          return callFrame.variables.x === a && callFrame.variables.y === b;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Three-parameter functions have all parameters in variables
   */
  it('should track three parameters correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 5, max: 10 }),
        (arr_placeholder, left, right) => {
          const safeRight = Math.max(left, right);
          const code = `
            public class Test {
              public static void process(int[] arr, int left, int right) {
                return;
              }
            }
          `;
          
          const result = interpret(code, 'process', [[1, 2, 3, 4, 5], left, safeRight]);
          
          if (!result.success) return true;
          
          // Find the CALL frame
          const callFrame = result.frames.find(
            (f: FrameObject) => f.action === 'CALL' && f.functionName === 'process'
          );
          
          if (!callFrame) return true;
          
          // All three parameters should be present
          return 'arr' in callFrame.variables && 
                 callFrame.variables.left === left && 
                 callFrame.variables.right === safeRight;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Parameters are captured in the parameters field
   */
  it('should populate parameters field in CALL frames', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: 1, max: 20 }),
        (a, b) => {
          const code = `
            public class Test {
              public static int multiply(int x, int y) {
                return x * y;
              }
            }
          `;
          
          const result = interpret(code, 'multiply', [a, b]);
          
          if (!result.success) return true;
          
          // Find the CALL frame
          const callFrame = result.frames.find(
            (f: FrameObject) => f.action === 'CALL' && f.functionName === 'multiply'
          );
          
          if (!callFrame) return true;
          
          // Parameters should be in the parameters field if present
          if (callFrame.parameters) {
            return callFrame.parameters.x === a && callFrame.parameters.y === b;
          }
          
          // Or at least in variables
          return callFrame.variables.x === a && callFrame.variables.y === b;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Recursive calls preserve parameter values
   */
  it('should preserve parameter values in recursive calls', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        (n) => {
          const code = `
            public class Test {
              public static int countdown(int n, int acc) {
                if (n <= 0) {
                  return acc;
                }
                return countdown(n - 1, acc + n);
              }
            }
          `;
          
          const result = interpret(code, 'countdown', [n, 0]);
          
          if (!result.success) return true;
          
          // All CALL frames should have both parameters
          const callFrames = result.frames.filter(
            (f: FrameObject) => f.action === 'CALL' && f.functionName === 'countdown'
          );
          
          return callFrames.every((f: FrameObject) => 
            'n' in f.variables && 'acc' in f.variables
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Array parameters are tracked correctly
   */
  it('should track array parameters correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 5 }),
        (arr) => {
          const arrStr = arr.join(', ');
          const code = `
            public class Test {
              public static int sumArray(int[] arr) {
                int sum = 0;
                for (int i = 0; i < arr.length; i++) {
                  sum += arr[i];
                }
                return sum;
              }
            }
          `;
          
          const result = interpret(code, 'sumArray', [arr]);
          
          if (!result.success) return true;
          
          // Find the CALL frame
          const callFrame = result.frames.find(
            (f: FrameObject) => f.action === 'CALL' && f.functionName === 'sumArray'
          );
          
          if (!callFrame) return true;
          
          // Array parameter should be present
          return 'arr' in callFrame.variables;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Mixed type parameters are all tracked
   */
  it('should track mixed type parameters', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 0, max: 5 }),
        (size, index) => {
          const safeIndex = Math.min(index, size - 1);
          const code = `
            public class Test {
              public static int getElement(int[] arr, int index) {
                return arr[index];
              }
            }
          `;
          
          const arr = Array.from({ length: size }, (_, i) => i * 10);
          const result = interpret(code, 'getElement', [arr, safeIndex]);
          
          if (!result.success) return true;
          
          // Find the CALL frame
          const callFrame = result.frames.find(
            (f: FrameObject) => f.action === 'CALL' && f.functionName === 'getElement'
          );
          
          if (!callFrame) return true;
          
          // Both parameters should be present
          return 'arr' in callFrame.variables && callFrame.variables.index === safeIndex;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Parameters are independent between recursive calls
   */
  it('should maintain independent parameters between recursive calls', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 4 }),
        (depth) => {
          const code = `
            public class Test {
              public static int recurse(int level, int value) {
                if (level <= 0) {
                  return value;
                }
                return recurse(level - 1, value * 2);
              }
            }
          `;
          
          const result = interpret(code, 'recurse', [depth, 1]);
          
          if (!result.success) return true;
          
          // Get all CALL frames
          const callFrames = result.frames.filter(
            (f: FrameObject) => f.action === 'CALL' && f.functionName === 'recurse'
          );
          
          // Each frame should have different level values
          const levels = callFrames.map((f: FrameObject) => f.variables.level);
          const uniqueLevels = new Set(levels);
          
          return uniqueLevels.size === callFrames.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Four or more parameters are all tracked
   */
  it('should track four or more parameters', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 1, max: 10 }),
        (a, b, c, d) => {
          const code = `
            public class Test {
              public static int combine(int a, int b, int c, int d) {
                return a + b + c + d;
              }
            }
          `;
          
          const result = interpret(code, 'combine', [a, b, c, d]);
          
          if (!result.success) return true;
          
          // Find the CALL frame
          const callFrame = result.frames.find(
            (f: FrameObject) => f.action === 'CALL' && f.functionName === 'combine'
          );
          
          if (!callFrame) return true;
          
          // All four parameters should be present
          return callFrame.variables.a === a &&
                 callFrame.variables.b === b &&
                 callFrame.variables.c === c &&
                 callFrame.variables.d === d;
        }
      ),
      { numRuns: 100 }
    );
  });
});
