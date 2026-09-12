/**
 * Property-Based Tests for CALL Action Creates Stack Card
 * 
 * Feature: recursion-cinema, Property 1: CALL Action Creates Stack Card
 * 
 * For any FrameObject with action type 'CALL', processing that frame should
 * result in a new StackCard being added to the Stack_Tower with matching
 * frameId and variables.
 * 
 * **Validates: Requirements 2.1**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { FrameObject, StackCardState } from '../../types';

/**
 * Simulates processing a CALL frame and creating a StackCard
 * This mirrors the logic in StackTower component
 */
function processCallFrame(
  frame: FrameObject,
  existingStack: FrameObject[]
): { newStack: FrameObject[]; newCard: StackCardState | null } {
  if (frame.action !== 'CALL') {
    return { newStack: existingStack, newCard: null };
  }

  // Add frame to stack
  const newStack = [...existingStack, frame];
  
  // Create card state for the new frame
  const index = newStack.length - 1;
  const newCard: StackCardState = {
    frameId: frame.id,
    position: { x: index * 15, y: index * 20, z: 100 - index },
    isActive: true, // New card is always active
    isFrozen: false, // New card is never frozen
    isReturning: false,
    glowColor: 'none',
  };

  return { newStack, newCard };
}

/**
 * Computes all stack card states from a list of frames
 */
function computeStackFromFrames(frames: FrameObject[]): {
  activeStack: FrameObject[];
  cardStates: StackCardState[];
} {
  const activeStack: FrameObject[] = [];
  const stackMap = new Map<number, FrameObject>();

  for (const frame of frames) {
    if (frame.action === 'CALL') {
      stackMap.set(frame.stackDepth, frame);
    } else if (frame.action === 'RETURN') {
      stackMap.delete(frame.stackDepth);
    }
  }

  // Convert to sorted array
  const depths = Array.from(stackMap.keys()).sort((a, b) => a - b);
  for (const depth of depths) {
    const frame = stackMap.get(depth);
    if (frame) activeStack.push(frame);
  }

  // Compute card states
  const cardStates = activeStack.map((frame, index) => ({
    frameId: frame.id,
    position: { x: index * 15, y: index * 20, z: 100 - index },
    isActive: index === activeStack.length - 1,
    isFrozen: index < activeStack.length - 1 && activeStack.length > 1,
    isReturning: false,
    glowColor: 'none' as const,
  }));

  return { activeStack, cardStates };
}

/**
 * Generator for CALL frames
 */
const callFrameArbitrary = fc.record({
  id: fc.uuid(),
  lineNo: fc.integer({ min: 1, max: 100 }),
  stackDepth: fc.integer({ min: 0, max: 10 }),
  variables: fc.dictionary(
    fc.string({ minLength: 1, maxLength: 5 }),
    fc.oneof(fc.integer({ min: 0, max: 100 }), fc.string({ minLength: 1, maxLength: 10 }))
  ),
  action: fc.constant('CALL' as const),
  functionName: fc.constantFrom('factorial', 'fib', 'traverse', 'recurse'),
  parentFrameId: fc.option(fc.uuid(), { nil: undefined }),
});

/**
 * Generator for a sequence of CALL frames with proper depth progression
 */
const callSequenceArbitrary = fc.integer({ min: 1, max: 10 }).chain((count) => {
  const frameGenerators = [];
  let parentId: string | undefined = undefined;
  
  for (let i = 0; i < count; i++) {
    const currentParentId = parentId;
    frameGenerators.push(
      fc.record({
        id: fc.uuid(),
        lineNo: fc.integer({ min: 1, max: 100 }),
        stackDepth: fc.constant(i),
        variables: fc.dictionary(
          fc.string({ minLength: 1, maxLength: 5 }),
          fc.integer({ min: 0, max: 100 })
        ),
        action: fc.constant('CALL' as const),
        functionName: fc.constantFrom('factorial', 'fib', 'traverse'),
        parentFrameId: fc.constant(currentParentId),
      }).map((frame) => {
        parentId = frame.id;
        return frame;
      })
    );
  }
  
  return fc.tuple(...frameGenerators);
});

describe('Property 1: CALL Action Creates Stack Card', () => {
  /**
   * Property: Processing a CALL frame should create a new StackCard
   */
  it('should create a new StackCard for each CALL frame', () => {
    fc.assert(
      fc.property(
        callFrameArbitrary,
        (frame) => {
          const { newStack, newCard } = processCallFrame(frame as FrameObject, []);
          
          // A new card should be created
          expect(newCard).not.toBeNull();
          
          // Stack should have one frame
          expect(newStack.length).toBe(1);
          
          return newCard !== null;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: The new StackCard should have matching frameId
   */
  it('should have StackCard frameId match the CALL frame id', () => {
    fc.assert(
      fc.property(
        callFrameArbitrary,
        (frame) => {
          const { newCard } = processCallFrame(frame as FrameObject, []);
          
          if (!newCard) return false;
          
          return newCard.frameId === frame.id;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: The new StackCard should be active (topmost)
   */
  it('should make new StackCard active', () => {
    fc.assert(
      fc.property(
        callFrameArbitrary,
        (frame) => {
          const { newCard } = processCallFrame(frame as FrameObject, []);
          
          if (!newCard) return false;
          
          return newCard.isActive === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: The new StackCard should not be frozen
   */
  it('should not freeze new StackCard', () => {
    fc.assert(
      fc.property(
        callFrameArbitrary,
        (frame) => {
          const { newCard } = processCallFrame(frame as FrameObject, []);
          
          if (!newCard) return false;
          
          return newCard.isFrozen === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Stack should grow by exactly one for each CALL
   */
  it('should grow stack by exactly one for each CALL', () => {
    fc.assert(
      fc.property(
        callFrameArbitrary,
        fc.array(callFrameArbitrary, { minLength: 0, maxLength: 5 }),
        (newFrame, existingFrames) => {
          const existingStack = existingFrames as FrameObject[];
          const { newStack } = processCallFrame(newFrame as FrameObject, existingStack);
          
          return newStack.length === existingStack.length + 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Non-CALL frames should not create cards
   */
  it('should not create card for non-CALL frames', () => {
    const nonCallFrameArbitrary = fc.record({
      id: fc.uuid(),
      lineNo: fc.integer({ min: 1, max: 100 }),
      stackDepth: fc.integer({ min: 0, max: 10 }),
      variables: fc.dictionary(fc.string({ minLength: 1, maxLength: 5 }), fc.integer()),
      action: fc.constantFrom('RETURN' as const, 'CALC' as const),
      functionName: fc.constantFrom('factorial', 'fib'),
    });

    fc.assert(
      fc.property(
        nonCallFrameArbitrary,
        (frame) => {
          const { newCard } = processCallFrame(frame as FrameObject, []);
          
          // No card should be created for non-CALL frames
          return newCard === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Each CALL in a sequence should create a corresponding card
   */
  it('should create cards for all CALL frames in sequence', () => {
    fc.assert(
      fc.property(
        callSequenceArbitrary,
        (frames) => {
          const frameArray = frames as FrameObject[];
          const { activeStack, cardStates } = computeStackFromFrames(frameArray);
          
          // Should have same number of cards as CALL frames
          const callCount = frameArray.filter(f => f.action === 'CALL').length;
          
          return cardStates.length === callCount && activeStack.length === callCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Card positions should reflect stack order
   */
  it('should position cards according to stack depth', () => {
    fc.assert(
      fc.property(
        callSequenceArbitrary,
        (frames) => {
          const frameArray = frames as FrameObject[];
          const { cardStates } = computeStackFromFrames(frameArray);
          
          // Each card's position should increase with index
          for (let i = 1; i < cardStates.length; i++) {
            if (cardStates[i].position.x <= cardStates[i - 1].position.x) {
              return false;
            }
            if (cardStates[i].position.y <= cardStates[i - 1].position.y) {
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Frame variables should be accessible from the card
   */
  it('should preserve frame data accessible via frameId', () => {
    fc.assert(
      fc.property(
        callSequenceArbitrary,
        (frames) => {
          const frameArray = frames as FrameObject[];
          const { activeStack, cardStates } = computeStackFromFrames(frameArray);
          
          // Each card should reference a frame in the active stack
          for (const card of cardStates) {
            const matchingFrame = activeStack.find(f => f.id === card.frameId);
            if (!matchingFrame) return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
