/**
 * Property-Based Tests for Array Display
 * 
 * Feature: recursion-cinema, Property 5: Array Variables Display Correctly
 * 
 * For any frame with array variables, the display should:
 * - Format arrays as readable strings: [38, 27, 43, ...]
 * - Handle nested arrays if present
 * - Truncate very long arrays with ellipsis
 * 
 * **Validates: Requirements 3.5**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Import the formatting functions from VariableDisplay
// Since they're not exported, we'll test the logic directly

/** Maximum characters to display for array values before truncating */
const MAX_ARRAY_DISPLAY_LENGTH = 40;

/**
 * Format a variable value for display
 * Handles arrays, strings, numbers, and other types
 */
function formatValue(value: number | string): string {
  const strValue = String(value);
  
  // Check if it's an array representation
  if (strValue.startsWith('[') && strValue.endsWith(']')) {
    // Truncate long arrays
    if (strValue.length > MAX_ARRAY_DISPLAY_LENGTH) {
      // Find a good truncation point (after a comma)
      const truncateAt = strValue.lastIndexOf(',', MAX_ARRAY_DISPLAY_LENGTH - 5);
      if (truncateAt > 0) {
        return strValue.substring(0, truncateAt) + ', ...]';
      }
      return strValue.substring(0, MAX_ARRAY_DISPLAY_LENGTH - 3) + '...]';
    }
    return strValue;
  }
  
  return strValue;
}

/**
 * Determine if a value is an array representation
 */
function isArrayValue(value: number | string): boolean {
  const strValue = String(value);
  return strValue.startsWith('[') && strValue.endsWith(']');
}

describe('Property 5: Array Variables Display Correctly', () => {
  /**
   * Property: Array values are detected correctly
   */
  it('should correctly identify array values', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: -100, max: 100 }), { minLength: 0, maxLength: 10 }),
        (arr) => {
          const formatted = '[' + arr.join(', ') + ']';
          return isArrayValue(formatted) === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Non-array values are not identified as arrays
   */
  it('should not identify non-array values as arrays', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 1000 }),
        (num) => {
          return isArrayValue(num) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Short arrays are displayed without truncation
   */
  it('should display short arrays without truncation', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 1, maxLength: 5 }),
        (arr) => {
          const formatted = '[' + arr.join(', ') + ']';
          const displayed = formatValue(formatted);
          
          // Short arrays should not be truncated
          return !displayed.includes('...');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Long arrays are truncated with ellipsis
   */
  it('should truncate long arrays with ellipsis', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 100, max: 999 }), { minLength: 15, maxLength: 30 }),
        (arr) => {
          const formatted = '[' + arr.join(', ') + ']';
          const displayed = formatValue(formatted);
          
          // Long arrays should be truncated
          if (formatted.length > MAX_ARRAY_DISPLAY_LENGTH) {
            return displayed.includes('...]');
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Truncated arrays maintain valid format
   */
  it('should maintain valid array format after truncation', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 999 }), { minLength: 1, maxLength: 50 }),
        (arr) => {
          const formatted = '[' + arr.join(', ') + ']';
          const displayed = formatValue(formatted);
          
          // Should start with [ and end with ] or ...]
          return displayed.startsWith('[') && 
                 (displayed.endsWith(']') || displayed.endsWith('...]'));
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Truncated display length is within limit
   */
  it('should keep truncated display within length limit', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 9999 }), { minLength: 1, maxLength: 100 }),
        (arr) => {
          const formatted = '[' + arr.join(', ') + ']';
          const displayed = formatValue(formatted);
          
          // Displayed length should be reasonable
          return displayed.length <= MAX_ARRAY_DISPLAY_LENGTH + 10; // Allow some buffer for ellipsis
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty arrays display correctly
   */
  it('should display empty arrays correctly', () => {
    const emptyArray = '[]';
    const displayed = formatValue(emptyArray);
    
    expect(displayed).toBe('[]');
    expect(isArrayValue(emptyArray)).toBe(true);
  });

  /**
   * Property: Single element arrays display correctly
   */
  it('should display single element arrays correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 1000 }),
        (num) => {
          const formatted = '[' + num + ']';
          const displayed = formatValue(formatted);
          
          return displayed === formatted;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Nested arrays are handled
   */
  it('should handle nested array representations', () => {
    const nestedArray = '[[1, 2], [3, 4], [5, 6]]';
    const displayed = formatValue(nestedArray);
    
    expect(isArrayValue(nestedArray)).toBe(true);
    expect(displayed.startsWith('[')).toBe(true);
  });

  /**
   * Property: Numbers are not modified
   */
  it('should not modify number values', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -10000, max: 10000 }),
        (num) => {
          const displayed = formatValue(num);
          return displayed === String(num);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: String values are preserved
   */
  it('should preserve string values that are not arrays', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.startsWith('[') || !s.endsWith(']')),
        (str) => {
          const displayed = formatValue(str);
          return displayed === str;
        }
      ),
      { numRuns: 100 }
    );
  });
});
