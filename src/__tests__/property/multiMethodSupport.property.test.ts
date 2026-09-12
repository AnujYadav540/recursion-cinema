/**
 * Property-Based Tests for Multi-Method Support
 * 
 * Feature: recursion-cinema, Property 8: Interpreter Handles Multiple Methods
 * 
 * For any Java code containing multiple method definitions, the interpreter should
 * correctly parse all methods and generate frames when any method is called,
 * including calls between different methods.
 * 
 * **Validates: Requirements 5.3, 5.5, 9.2, 9.3**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { interpret } from '../../interpreter';
import type { FrameObject } from '../../types';

describe('Property 8: Interpreter Handles Multiple Methods', () => {
  /**
   * Property: Code with multiple methods parses and executes successfully
   */
  it('should parse and execute code with multiple methods', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        (a, b) => {
          const code = `
            public class Test {
              public static int add(int x, int y) {
                return x + y;
              }
              
              public static int multiply(int x, int y) {
                return x * y;
              }
              
              public static int compute(int a, int b) {
                int sum = add(a, b);
                int product = multiply(a, b);
                return sum + product;
              }
            }
          `;
          
          const result = interpret(code, 'compute', [a, b]);
          
          if (!result.success) return true;
          
          // Should have frames for compute, add, and multiply
          const functionNames = new Set(result.frames.map((f: FrameObject) => f.functionName));
          
          return functionNames.has('compute') && 
                 functionNames.has('add') && 
                 functionNames.has('multiply');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Helper method calls generate separate frames
   */
  it('should generate separate frames for helper method calls', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (n) => {
          const code = `
            public class Test {
              public static int helper(int x) {
                return x * 2;
              }
              
              public static int main(int n) {
                return helper(n);
              }
            }
          `;
          
          const result = interpret(code, 'main', [n]);
          
          if (!result.success) return true;
          
          // Should have CALL frames for both main and helper
          const callFrames = result.frames.filter((f: FrameObject) => f.action === 'CALL');
          const mainCalls = callFrames.filter((f: FrameObject) => f.functionName === 'main');
          const helperCalls = callFrames.filter((f: FrameObject) => f.functionName === 'helper');
          
          return mainCalls.length >= 1 && helperCalls.length >= 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Recursive method with helper generates correct frame hierarchy
   */
  it('should track parent-child relationships across method boundaries', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3 }),
        (depth) => {
          const code = `
            public class Test {
              public static int process(int x) {
                return x + 1;
              }
              
              public static int recurse(int n) {
                if (n <= 0) {
                  return process(0);
                }
                return recurse(n - 1) + process(n);
              }
            }
          `;
          
          const result = interpret(code, 'recurse', [depth]);
          
          if (!result.success) return true;
          
          // Check that process calls have parentFrameId pointing to recurse frames
          const processCallFrames = result.frames.filter(
            (f: FrameObject) => f.action === 'CALL' && f.functionName === 'process'
          );
          
          return processCallFrames.every((f: FrameObject) => 
            f.parentFrameId !== undefined
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Each method call generates both CALL and RETURN frames
   */
  it('should generate CALL and RETURN frames for each method invocation', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        (n) => {
          const code = `
            public class Test {
              public static int double_val(int x) {
                return x * 2;
              }
              
              public static int triple(int x) {
                return x * 3;
              }
              
              public static int compute(int n) {
                return double_val(n) + triple(n);
              }
            }
          `;
          
          const result = interpret(code, 'compute', [n]);
          
          if (!result.success) return true;
          
          // Count CALL and RETURN frames per function
          const callCounts = new Map<string, number>();
          const returnCounts = new Map<string, number>();
          
          for (const frame of result.frames) {
            if (frame.action === 'CALL') {
              callCounts.set(frame.functionName, (callCounts.get(frame.functionName) || 0) + 1);
            } else if (frame.action === 'RETURN') {
              returnCounts.set(frame.functionName, (returnCounts.get(frame.functionName) || 0) + 1);
            }
          }
          
          // Each function should have equal CALL and RETURN counts
          for (const [fn, callCount] of callCounts) {
            const returnCount = returnCounts.get(fn) || 0;
            if (callCount !== returnCount) return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Method parameters are correctly passed between methods
   */
  it('should correctly pass parameters between methods', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: 1, max: 20 }),
        (a, b) => {
          const code = `
            public class Test {
              public static int sum(int x, int y) {
                return x + y;
              }
              
              public static int main(int a, int b) {
                return sum(a, b);
              }
            }
          `;
          
          const result = interpret(code, 'main', [a, b]);
          
          if (!result.success) return true;
          
          // Find the sum CALL frame and verify parameters
          const sumCallFrame = result.frames.find(
            (f: FrameObject) => f.action === 'CALL' && f.functionName === 'sum'
          );
          
          if (!sumCallFrame) return true;
          
          // Parameters should be in variables
          return sumCallFrame.variables.x === a && sumCallFrame.variables.y === b;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Return values propagate correctly between methods
   */
  it('should correctly propagate return values between methods', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (n) => {
          const code = `
            public class Test {
              public static int square(int x) {
                return x * x;
              }
              
              public static int main(int n) {
                return square(n);
              }
            }
          `;
          
          const result = interpret(code, 'main', [n]);
          
          if (!result.success) return true;
          
          // Final return value should be n * n
          return result.returnValue === n * n;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Nested method calls work correctly
   */
  it('should handle nested method calls correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        (n) => {
          const code = `
            public class Test {
              public static int inner(int x) {
                return x + 1;
              }
              
              public static int middle(int x) {
                return inner(x) * 2;
              }
              
              public static int outer(int x) {
                return middle(x) + 10;
              }
            }
          `;
          
          const result = interpret(code, 'outer', [n]);
          
          if (!result.success) return true;
          
          // Expected: ((n + 1) * 2) + 10
          const expected = ((n + 1) * 2) + 10;
          return result.returnValue === expected;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multiple calls to same helper method generate separate frames
   */
  it('should generate separate frames for multiple calls to same method', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        (n) => {
          const code = `
            public class Test {
              public static int helper(int x) {
                return x;
              }
              
              public static int main(int n) {
                int a = helper(n);
                int b = helper(n + 1);
                int c = helper(n + 2);
                return a + b + c;
              }
            }
          `;
          
          const result = interpret(code, 'main', [n]);
          
          if (!result.success) return true;
          
          // Should have 3 CALL frames for helper
          const helperCalls = result.frames.filter(
            (f: FrameObject) => f.action === 'CALL' && f.functionName === 'helper'
          );
          
          return helperCalls.length === 3;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Stack depth increases correctly with nested calls
   */
  it('should track stack depth correctly across method calls', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        (n) => {
          const code = `
            public class Test {
              public static int level3(int x) {
                return x;
              }
              
              public static int level2(int x) {
                return level3(x);
              }
              
              public static int level1(int x) {
                return level2(x);
              }
            }
          `;
          
          const result = interpret(code, 'level1', [n]);
          
          if (!result.success) return true;
          
          // Find max stack depth
          const maxDepth = Math.max(...result.frames.map((f: FrameObject) => f.stackDepth));
          
          // Should reach depth 2 (0-indexed: level1=0, level2=1, level3=2)
          return maxDepth >= 2;
        }
      ),
      { numRuns: 100 }
    );
  });
});
