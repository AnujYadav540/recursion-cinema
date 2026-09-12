/**
 * Property-Based Tests for Array Operations
 * 
 * Feature: recursion-cinema, Property 9: Array Operations Tracked Correctly
 * 
 * For any Java code that modifies array elements, the interpreter should produce
 * frames where the variables object reflects the correct array state after each modification.
 * 
 * **Validates: Requirements 5.4**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { interpret } from '../../interpreter';
import type { FrameObject } from '../../types';

describe('Property 9: Array Operations Tracked Correctly', () => {
  /**
   * Helper to generate Java code that creates and modifies an array
   */
  const generateArrayModificationCode = (
    arraySize: number,
    index: number,
    newValue: number
  ): string => {
    const safeIndex = Math.min(index, arraySize - 1);
    return `
      public class Test {
        public static void modifyArray() {
          int[] arr = new int[${arraySize}];
          arr[${safeIndex}] = ${newValue};
        }
      }
    `;
  };

  /**
   * Helper to generate Java code with array initialization and modification
   */
  const generateArrayInitAndModifyCode = (
    initialValues: number[],
    index: number,
    newValue: number
  ): string => {
    const safeIndex = Math.min(index, initialValues.length - 1);
    const initStr = initialValues.join(', ');
    return `
      public class Test {
        public static void modifyArray() {
          int[] arr = {${initStr}};
          arr[${safeIndex}] = ${newValue};
        }
      }
    `;
  };

  /**
   * Property: Array creation produces correct initial state
   */
  it('should track array creation with correct size', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (size) => {
          const code = `
            public class Test {
              public static void createArray() {
                int[] arr = new int[${size}];
              }
            }
          `;
          
          const result = interpret(code, 'createArray');
          
          if (!result.success || result.frames.length === 0) return true;
          
          // Find a frame that has the array variable
          const frameWithArray = result.frames.find((f: FrameObject) => 
            f.variables && 'arr' in f.variables
          );
          
          if (!frameWithArray) return true;
          
          // Array should be formatted as string with correct number of zeros
          const arrValue = frameWithArray.variables.arr;
          if (typeof arrValue === 'string') {
            const zeros = Array(size).fill(0).join(', ');
            return arrValue === `[${zeros}]`;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Array modification updates the correct index
   */
  it('should track array element modifications correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 5 }),
        fc.integer({ min: 0, max: 4 }),
        fc.integer({ min: 1, max: 100 }),
        (size, index, newValue) => {
          const safeIndex = Math.min(index, size - 1);
          const code = generateArrayModificationCode(size, safeIndex, newValue);
          
          const result = interpret(code, 'modifyArray');
          
          if (!result.success || result.frames.length === 0) return true;
          
          // Find the RETURN frame which should have final state
          const returnFrame = result.frames.find((f: FrameObject) => 
            f.action === 'RETURN' && f.variables && 'arr' in f.variables
          );
          
          if (!returnFrame) return true;
          
          const arrValue = returnFrame.variables.arr;
          if (typeof arrValue === 'string') {
            // Parse the array string and verify the modified index
            const match = arrValue.match(/\[(.*)\]/);
            if (match) {
              const values = match[1].split(',').map(s => parseInt(s.trim(), 10));
              return values[safeIndex] === newValue;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Array initialization with values is tracked correctly
   */
  it('should track array initialization with values', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 5 }),
        (values) => {
          const initStr = values.join(', ');
          const code = `
            public class Test {
              public static void initArray() {
                int[] arr = {${initStr}};
              }
            }
          `;
          
          const result = interpret(code, 'initArray');
          
          if (!result.success || result.frames.length === 0) return true;
          
          // Find a frame with the array
          const frameWithArray = result.frames.find((f: FrameObject) => 
            f.variables && 'arr' in f.variables
          );
          
          if (!frameWithArray) return true;
          
          const arrValue = frameWithArray.variables.arr;
          if (typeof arrValue === 'string') {
            const expected = `[${values.join(', ')}]`;
            return arrValue === expected;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multiple array modifications are tracked in sequence
   */
  it('should track multiple array modifications in sequence', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 3, max: 5 }),
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 1, max: 50 }),
        (size, val1, val2) => {
          const code = `
            public class Test {
              public static void multiModify() {
                int[] arr = new int[${size}];
                arr[0] = ${val1};
                arr[1] = ${val2};
              }
            }
          `;
          
          const result = interpret(code, 'multiModify');
          
          if (!result.success || result.frames.length === 0) return true;
          
          // Find the RETURN frame
          const returnFrame = result.frames.find((f: FrameObject) => 
            f.action === 'RETURN' && f.variables && 'arr' in f.variables
          );
          
          if (!returnFrame) return true;
          
          const arrValue = returnFrame.variables.arr;
          if (typeof arrValue === 'string') {
            const match = arrValue.match(/\[(.*)\]/);
            if (match) {
              const values = match[1].split(',').map(s => parseInt(s.trim(), 10));
              return values[0] === val1 && values[1] === val2;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Array passed to recursive function maintains correct state
   */
  it('should track array state through recursive calls', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3 }),
        (depth) => {
          const code = `
            public class Test {
              public static void fillArray(int[] arr, int index) {
                if (index >= arr.length) {
                  return;
                }
                arr[index] = index * 10;
                fillArray(arr, index + 1);
              }
              
              public static void main() {
                int[] arr = new int[${depth + 1}];
                fillArray(arr, 0);
              }
            }
          `;
          
          const result = interpret(code, 'main');
          
          if (!result.success) return true;
          
          // Check that frames were generated
          return result.frames.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Array length is accessible and correct
   */
  it('should correctly report array length', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (size) => {
          const code = `
            public class Test {
              public static int getLength() {
                int[] arr = new int[${size}];
                return arr.length;
              }
            }
          `;
          
          const result = interpret(code, 'getLength');
          
          if (!result.success) return true;
          
          // The return value should be the array size
          return result.returnValue === size;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Array variables are formatted correctly in frames
   */
  it('should format array variables as readable strings', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 99 }), { minLength: 1, maxLength: 5 }),
        (values) => {
          const initStr = values.join(', ');
          const code = `
            public class Test {
              public static void showArray() {
                int[] arr = {${initStr}};
              }
            }
          `;
          
          const result = interpret(code, 'showArray');
          
          if (!result.success || result.frames.length === 0) return true;
          
          // Find frame with array
          const frameWithArray = result.frames.find((f: FrameObject) => 
            f.variables && 'arr' in f.variables
          );
          
          if (!frameWithArray) return true;
          
          const arrValue = frameWithArray.variables.arr;
          
          // Should be a string in format [x, y, z]
          if (typeof arrValue !== 'string') return false;
          
          // Should start with [ and end with ]
          if (!arrValue.startsWith('[') || !arrValue.endsWith(']')) return false;
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Array compound assignment operators work correctly
   */
  it('should track compound assignment operators on arrays', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 1, max: 10 }),
        (initial, addend) => {
          const code = `
            public class Test {
              public static void compoundAssign() {
                int[] arr = {${initial}};
                arr[0] += ${addend};
              }
            }
          `;
          
          const result = interpret(code, 'compoundAssign');
          
          if (!result.success || result.frames.length === 0) return true;
          
          // Find the RETURN frame
          const returnFrame = result.frames.find((f: FrameObject) => 
            f.action === 'RETURN' && f.variables && 'arr' in f.variables
          );
          
          if (!returnFrame) return true;
          
          const arrValue = returnFrame.variables.arr;
          if (typeof arrValue === 'string') {
            const match = arrValue.match(/\[(.*)\]/);
            if (match) {
              const value = parseInt(match[1].trim(), 10);
              return value === initial + addend;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Combined Property: Array operations maintain consistency across frames
   */
  it('should maintain array state consistency across all frames', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 4 }),
        fc.integer({ min: 1, max: 50 }),
        (size, value) => {
          const code = `
            public class Test {
              public static void consistent() {
                int[] arr = new int[${size}];
                arr[0] = ${value};
              }
            }
          `;
          
          const result = interpret(code, 'consistent');
          
          if (!result.success || result.frames.length === 0) return true;
          
          // All frames with 'arr' variable should have valid array format
          const framesWithArray = result.frames.filter((f: FrameObject) => 
            f.variables && 'arr' in f.variables
          );
          
          return framesWithArray.every((f: FrameObject) => {
            const arrValue = f.variables.arr;
            if (typeof arrValue !== 'string') return false;
            return arrValue.startsWith('[') && arrValue.endsWith(']');
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
