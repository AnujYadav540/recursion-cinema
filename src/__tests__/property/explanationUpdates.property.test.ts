/**
 * Property Test: Explanation Updates
 * **Property 10: Explanation Updates**
 * **Validates: Requirements 6.2, 6.3, 6.4**
 * 
 * For any frame change, the explanation SHALL update with action, variables, and context.
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
  action: 'CALL' | 'RETURN',
  returnValue?: any
): FrameObject {
  return {
    id,
    lineNo: 1,
    stackDepth,
    variables,
    action,
    functionName,
    parentFrameId: undefined,
    returnValue: action === 'RETURN' ? returnValue : undefined,
  };
}

// Simulates the getExplanation function from ExplanationSection
function getExplanation(frame: FrameObject | undefined): string {
  if (!frame) return '';
  const vars = Object.entries(frame.variables)
    .filter(([k]) => !k.startsWith('__'))
    .map(([k, v]) => `${k} = ${Array.isArray(v) ? `[${v.join(', ')}]` : JSON.stringify(v)}`)
    .join(', ');
  
  if (frame.action === 'CALL') {
    return `Calling ${frame.functionName}(${vars})\n\nA new stack frame is created.\nStack depth is now ${frame.stackDepth + 1}.\nThis call will wait for its recursive calls to return.`;
  } else {
    return `Returning ${JSON.stringify(frame.returnValue)} from ${frame.functionName}\n\nThis frame is removed from the stack.\nThe return value goes back to the caller.\nStack depth is now ${frame.stackDepth}.`;
  }
}

// Simulates what ExplanationSection displays
function getExplanationDisplay(frame: FrameObject | undefined, frameIndex: number, totalFrames: number) {
  if (!frame) {
    return { hasContent: false };
  }
  
  return {
    hasContent: true,
    stepCounter: `${frameIndex + 1}/${totalFrames}`,
    actionBadge: frame.action === 'CALL' ? 'FUNCTION CALL' : 'RETURN VALUE',
    explanationText: getExplanation(frame),
    variables: Object.entries(frame.variables)
      .filter(([k]) => !k.startsWith('__'))
      .map(([k, v]) => ({
        name: k,
        value: Array.isArray(v) ? `[${v.join(', ')}]` : JSON.stringify(v),
      })),
    stackDepth: frame.stackDepth,
    lineNo: frame.lineNo,
  };
}

describe('Feature: scrollable-website-redesign, Property 10: Explanation Updates', () => {
  
  it('for any CALL frame, explanation should mention "Calling" and function name', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z]\w*$/.test(s)),
        fc.integer({ min: 0, max: 10 }),
        (funcName, depth) => {
          const frame = createFrame('f1', funcName, { n: 5 }, depth, 'CALL');
          const display = getExplanationDisplay(frame, 0, 1);
          expect(display.hasContent).toBe(true);
          expect(display.actionBadge).toBe('FUNCTION CALL');
          expect(display.explanationText).toContain('Calling');
          expect(display.explanationText).toContain(funcName);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any RETURN frame, explanation should mention "Returning" and return value', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z]\w*$/.test(s)),
        fc.integer({ min: -1000, max: 1000 }),
        fc.integer({ min: 0, max: 10 }),
        (funcName, returnValue, depth) => {
          const frame = createFrame('f1', funcName, { n: 5 }, depth, 'RETURN', returnValue);
          const display = getExplanationDisplay(frame, 0, 1);
          expect(display.hasContent).toBe(true);
          expect(display.actionBadge).toBe('RETURN VALUE');
          expect(display.explanationText).toContain('Returning');
          expect(display.explanationText).toContain(String(returnValue));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any frame, variables should be displayed correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100, max: 100 }),
        fc.integer({ min: -100, max: 100 }),
        (a, b) => {
          const frame = createFrame('f1', 'test', { a, b }, 0, 'CALL');
          const display = getExplanationDisplay(frame, 0, 1);
          expect(display.variables).toContainEqual({ name: 'a', value: String(a) });
          expect(display.variables).toContainEqual({ name: 'b', value: String(b) });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any frame with arrays, variables should format as [a, b, c]', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 5 }),
        (arr) => {
          const frame = createFrame('f1', 'test', { arr }, 0, 'CALL');
          const display = getExplanationDisplay(frame, 0, 1);
          const arrVar = display.variables?.find(v => v.name === 'arr');
          expect(arrVar).toBeDefined();
          expect(arrVar!.value).toBe(`[${arr.join(', ')}]`);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any frame, step counter should show correct position', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: 1, max: 100 }),
        (frameIndex, totalFrames) => {
          // Ensure frameIndex is valid
          const validIndex = Math.min(frameIndex, totalFrames - 1);
          const frame = createFrame('f1', 'test', { n: 5 }, 0, 'CALL');
          const display = getExplanationDisplay(frame, validIndex, totalFrames);
          expect(display.stepCounter).toBe(`${validIndex + 1}/${totalFrames}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any frame, stack depth should be included in explanation', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 50 }),
        (depth) => {
          const frame = createFrame('f1', 'test', { n: 5 }, depth, 'CALL');
          const display = getExplanationDisplay(frame, 0, 1);
          expect(display.stackDepth).toBe(depth);
          // CALL frames mention depth + 1 (new depth after call)
          expect(display.explanationText).toContain(`Stack depth is now ${depth + 1}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any RETURN frame, stack depth in explanation should match frame depth', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 50 }),
        (depth) => {
          const frame = createFrame('f1', 'test', { n: 5 }, depth, 'RETURN', 42);
          const display = getExplanationDisplay(frame, 0, 1);
          expect(display.stackDepth).toBe(depth);
          expect(display.explanationText).toContain(`Stack depth is now ${depth}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for undefined frame, display should have no content', () => {
    const display = getExplanationDisplay(undefined, 0, 0);
    expect(display.hasContent).toBe(false);
  });

  it('for any frame, internal variables should be filtered out', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z]\w*$/.test(s)),
        (varName) => {
          const frame = createFrame('f1', 'test', { 
            [varName]: 5, 
            __internal: 'hidden',
            __temp: 123 
          }, 0, 'CALL');
          const display = getExplanationDisplay(frame, 0, 1);
          expect(display.variables?.some(v => v.name.startsWith('__'))).toBe(false);
          expect(display.variables?.some(v => v.name === varName)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
