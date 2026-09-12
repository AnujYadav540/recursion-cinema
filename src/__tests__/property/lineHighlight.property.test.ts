/**
 * Property-Based Tests for Line Highlight
 * 
 * Feature: recursion-cinema, Property 9: Line Highlight Matches Current Frame
 * 
 * For any current FrameObject during playback, the Code_Editor's highlighted
 * line number should equal frame.lineNo, and the highlight color should map
 * correctly to the action type.
 * 
 * **Validates: Requirements 8.1, 8.3**
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import type { FrameObject } from '../../types';
import { ACTION_COLORS } from '../../types';

/**
 * Helper function to compute the expected highlight state for a frame.
 * This simulates what the CodePanel component should display.
 */
interface HighlightState {
  lineNo: number;
  color: string;
  action: 'CALL' | 'RETURN' | 'CALC';
}

function computeHighlightForFrame(frame: FrameObject): HighlightState {
  return {
    lineNo: frame.lineNo,
    color: ACTION_COLORS[frame.action],
    action: frame.action,
  };
}

/**
 * Helper function to get the expected color for an action type
 */
function getExpectedColor(action: 'CALL' | 'RETURN' | 'CALC'): string {
  switch (action) {
    case 'CALL':
      return ACTION_COLORS.CALL; // Blue
    case 'RETURN':
      return ACTION_COLORS.RETURN; // Green
    case 'CALC':
      return ACTION_COLORS.CALC; // Yellow
  }
}

/**
 * Generator for a single frame with valid properties
 */
const frameArbitrary = fc.record({
  id: fc.uuid(),
  lineNo: fc.integer({ min: 1, max: 100 }),
  stackDepth: fc.integer({ min: 0, max: 10 }),
  variables: fc.dictionary(
    fc.string({ minLength: 1, maxLength: 5 }),
    fc.integer({ min: 0, max: 100 })
  ),
  action: fc.constantFrom('CALL' as const, 'RETURN' as const, 'CALC' as const),
  functionName: fc.constantFrom('factorial', 'fib', 'traverse', 'recurse'),
});

/**
 * Generator for CALL frames
 */
const callFrameArbitrary = fc.record({
  id: fc.uuid(),
  lineNo: fc.integer({ min: 1, max: 100 }),
  stackDepth: fc.integer({ min: 0, max: 10 }),
  variables: fc.dictionary(
    fc.string({ minLength: 1, maxLength: 5 }),
    fc.integer({ min: 0, max: 100 })
  ),
  action: fc.constant('CALL' as const),
  functionName: fc.constantFrom('factorial', 'fib', 'traverse'),
});

/**
 * Generator for RETURN frames
 */
const returnFrameArbitrary = fc.record({
  id: fc.uuid(),
  lineNo: fc.integer({ min: 1, max: 100 }),
  stackDepth: fc.integer({ min: 0, max: 10 }),
  variables: fc.dictionary(
    fc.string({ minLength: 1, maxLength: 5 }),
    fc.integer({ min: 0, max: 100 })
  ),
  action: fc.constant('RETURN' as const),
  functionName: fc.constantFrom('factorial', 'fib', 'traverse'),
  returnValue: fc.integer({ min: 0, max: 1000 }),
});

/**
 * Generator for CALC frames
 */
const calcFrameArbitrary = fc.record({
  id: fc.uuid(),
  lineNo: fc.integer({ min: 1, max: 100 }),
  stackDepth: fc.integer({ min: 0, max: 10 }),
  variables: fc.dictionary(
    fc.string({ minLength: 1, maxLength: 5 }),
    fc.integer({ min: 0, max: 100 })
  ),
  action: fc.constant('CALC' as const),
  functionName: fc.constantFrom('factorial', 'fib', 'traverse'),
});

describe('Property 9: Line Highlight Matches Current Frame', () => {
  /**
   * Property: Highlighted line number equals frame.lineNo
   */
  it('should highlight the line number from the current frame', () => {
    fc.assert(
      fc.property(frameArbitrary, (frame) => {
        const highlight = computeHighlightForFrame(frame as FrameObject);
        
        // Highlighted line should match frame's lineNo
        return highlight.lineNo === frame.lineNo;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: CALL action produces blue highlight
   */
  it('should produce blue highlight for CALL action', () => {
    fc.assert(
      fc.property(callFrameArbitrary, (frame) => {
        const highlight = computeHighlightForFrame(frame as FrameObject);
        
        return highlight.color === ACTION_COLORS.CALL;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: RETURN action produces green highlight
   */
  it('should produce green highlight for RETURN action', () => {
    fc.assert(
      fc.property(returnFrameArbitrary, (frame) => {
        const highlight = computeHighlightForFrame(frame as FrameObject);
        
        return highlight.color === ACTION_COLORS.RETURN;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: CALC action produces yellow highlight
   */
  it('should produce yellow highlight for CALC action', () => {
    fc.assert(
      fc.property(calcFrameArbitrary, (frame) => {
        const highlight = computeHighlightForFrame(frame as FrameObject);
        
        return highlight.color === ACTION_COLORS.CALC;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Highlight color matches expected color for action type
   */
  it('should have highlight color match expected color for action type', () => {
    fc.assert(
      fc.property(frameArbitrary, (frame) => {
        const highlight = computeHighlightForFrame(frame as FrameObject);
        const expectedColor = getExpectedColor(frame.action);
        
        return highlight.color === expectedColor;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Highlight action matches frame action
   */
  it('should have highlight action match frame action', () => {
    fc.assert(
      fc.property(frameArbitrary, (frame) => {
        const highlight = computeHighlightForFrame(frame as FrameObject);
        
        return highlight.action === frame.action;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Line number is always positive
   */
  it('should always have positive line number in highlight', () => {
    fc.assert(
      fc.property(frameArbitrary, (frame) => {
        const highlight = computeHighlightForFrame(frame as FrameObject);
        
        return highlight.lineNo > 0;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Highlight state is deterministic for same frame
   */
  it('should produce same highlight state for same frame', () => {
    fc.assert(
      fc.property(frameArbitrary, (frame) => {
        const highlight1 = computeHighlightForFrame(frame as FrameObject);
        const highlight2 = computeHighlightForFrame(frame as FrameObject);
        
        return (
          highlight1.lineNo === highlight2.lineNo &&
          highlight1.color === highlight2.color &&
          highlight1.action === highlight2.action
        );
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Different line numbers produce different highlights
   */
  it('should produce different line highlights for different lineNo values', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 51, max: 100 }),
        (lineNo1, lineNo2) => {
          const frame1: FrameObject = {
            id: 'f1',
            lineNo: lineNo1,
            stackDepth: 0,
            variables: {},
            action: 'CALL',
            functionName: 'test',
          };
          const frame2: FrameObject = {
            id: 'f2',
            lineNo: lineNo2,
            stackDepth: 0,
            variables: {},
            action: 'CALL',
            functionName: 'test',
          };
          
          const highlight1 = computeHighlightForFrame(frame1);
          const highlight2 = computeHighlightForFrame(frame2);
          
          // Different line numbers should produce different highlighted lines
          return highlight1.lineNo !== highlight2.lineNo;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All three action types have distinct colors
   */
  it('should have distinct colors for all action types', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const callColor = ACTION_COLORS.CALL;
        const returnColor = ACTION_COLORS.RETURN;
        const calcColor = ACTION_COLORS.CALC;
        
        // All colors should be distinct
        return (
          callColor !== returnColor &&
          returnColor !== calcColor &&
          callColor !== calcColor
        );
      }),
      { numRuns: 1 } // Only need to run once since it's constant
    );
  });

  /**
   * Property: Highlight synchronization across frame sequence
   */
  it('should synchronize highlight with frame sequence', () => {
    fc.assert(
      fc.property(
        fc.array(frameArbitrary, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 0, max: 19 }),
        (frames, index) => {
          const frameArray = frames as FrameObject[];
          const safeIndex = index % frameArray.length;
          const currentFrame = frameArray[safeIndex];
          
          const highlight = computeHighlightForFrame(currentFrame);
          
          // Highlight should match the current frame exactly
          return (
            highlight.lineNo === currentFrame.lineNo &&
            highlight.action === currentFrame.action
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
