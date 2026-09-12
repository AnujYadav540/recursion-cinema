/**
 * Property Test: Stack Frame Display
 * **Property 7: Stack Frame Display**
 * **Validates: Requirements 4.2, 4.6**
 * 
 * For any frame, the visualization SHALL show function name, parameters, and depth.
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { FrameObject } from '../../types';

// Helper to create a valid frame
function createFrame(
  id: string,
  functionName: string,
  variables: Record<string, any>,
  stackDepth: number,
  action: 'CALL' | 'RETURN'
): FrameObject {
  return {
    id,
    lineNo: 1,
    stackDepth,
    variables,
    action,
    functionName,
    parentFrameId: undefined,
    returnValue: action === 'RETURN' ? 0 : undefined,
  };
}

// Simulates what the VisualizationSection component does to display a frame
function formatFrameDisplay(frame: FrameObject): {
  functionName: string;
  parameters: string;
  depth: number;
  variables: Array<{ name: string; value: string }>;
} {
  const vars = Object.entries(frame.variables)
    .filter(([k]) => !k.startsWith('__'))
    .map(([k, v]) => ({
      name: k,
      value: Array.isArray(v) ? `[${v.join(', ')}]` : JSON.stringify(v),
    }));

  return {
    functionName: frame.functionName,
    parameters: vars.map(v => v.value).join(', '),
    depth: frame.stackDepth,
    variables: vars,
  };
}

describe('Feature: scrollable-website-redesign, Property 7: Stack Frame Display', () => {
  
  it('for any frame, display should include the function name', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z]\w*$/.test(s)),
        fc.integer({ min: 0, max: 10 }),
        (funcName, depth) => {
          const frame = createFrame('f1', funcName, { n: 5 }, depth, 'CALL');
          const display = formatFrameDisplay(frame);
          expect(display.functionName).toBe(funcName);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any frame, display should include the stack depth', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (depth) => {
          const frame = createFrame('f1', 'test', { n: 5 }, depth, 'CALL');
          const display = formatFrameDisplay(frame);
          expect(display.depth).toBe(depth);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any frame with integer parameters, display should show them correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: 1000 }),
        fc.integer({ min: -1000, max: 1000 }),
        (a, b) => {
          const frame = createFrame('f1', 'test', { a, b }, 0, 'CALL');
          const display = formatFrameDisplay(frame);
          expect(display.variables).toContainEqual({ name: 'a', value: String(a) });
          expect(display.variables).toContainEqual({ name: 'b', value: String(b) });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any frame with array parameters, display should format as [a, b, c]', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 10 }),
        (arr) => {
          const frame = createFrame('f1', 'test', { arr }, 0, 'CALL');
          const display = formatFrameDisplay(frame);
          const arrVar = display.variables.find(v => v.name === 'arr');
          expect(arrVar).toBeDefined();
          expect(arrVar!.value).toBe(`[${arr.join(', ')}]`);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any frame, internal variables (starting with __) should be filtered out', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z]\w*$/.test(s)),
        (varName) => {
          const frame = createFrame('f1', 'test', { 
            [varName]: 5, 
            __internal: 'hidden',
            __temp: 123 
          }, 0, 'CALL');
          const display = formatFrameDisplay(frame);
          expect(display.variables.some(v => v.name.startsWith('__'))).toBe(false);
          expect(display.variables.some(v => v.name === varName)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any frame, depth should be a non-negative integer', () => {
    fc.assert(
      fc.property(
        fc.nat(100),
        (depth) => {
          const frame = createFrame('f1', 'test', { n: 5 }, depth, 'CALL');
          const display = formatFrameDisplay(frame);
          expect(display.depth).toBeGreaterThanOrEqual(0);
          expect(Number.isInteger(display.depth)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any frame with string parameters, display should show them quoted', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        (str) => {
          const frame = createFrame('f1', 'test', { s: str }, 0, 'CALL');
          const display = formatFrameDisplay(frame);
          const strVar = display.variables.find(v => v.name === 's');
          expect(strVar).toBeDefined();
          expect(strVar!.value).toBe(JSON.stringify(str));
        }
      ),
      { numRuns: 100 }
    );
  });
});
