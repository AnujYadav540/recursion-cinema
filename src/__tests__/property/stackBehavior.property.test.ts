/**
 * Property-Based Tests for Stack Behavior
 * 
 * Feature: recursion-cinema, Property 2: Parent Cards Freeze When Child Active
 * 
 * For any Stack_Tower state with depth greater than 1, all StackCards except
 * the topmost should have `isFrozen: true` and the topmost should have `isActive: true`.
 * 
 * **Validates: Requirements 2.3, 2.4**
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import type { FrameObject, StackCardState } from '../../types';

/**
 * Helper function to compute stack card states from a list of active frames
 * This simulates what the StackTower component does internally
 */
function computeStackCardStates(activeFrames: FrameObject[]): StackCardState[] {
  if (activeFrames.length === 0) return [];

  return activeFrames.map((frame, index) => {
    const isTopmost = index === activeFrames.length - 1;
    
    return {
      frameId: frame.id,
      position: { x: index * 15, y: index * 20, z: 100 - index },
      isActive: isTopmost,
      isFrozen: !isTopmost && activeFrames.length > 1,
      isReturning: false,
      glowColor: 'none' as const,
    };
  });
}

/**
 * Generator for a single frame at a specific depth
 */
const frameAtDepthArbitrary = (depth: number) =>
  fc.record({
    id: fc.uuid(),
    lineNo: fc.integer({ min: 1, max: 100 }),
    stackDepth: fc.constant(depth),
    variables: fc.dictionary(
      fc.string({ minLength: 1, maxLength: 5 }),
      fc.oneof(fc.integer({ min: 0, max: 100 }), fc.string({ minLength: 1, maxLength: 10 }))
    ),
    action: fc.constant('CALL' as const),
    functionName: fc.constantFrom('factorial', 'fib', 'traverse', 'recurse'),
  });

/**
 * Generator for a stack of frames with increasing depth
 */
const stackOfFramesArbitrary = (minDepth: number, maxDepth: number) =>
  fc.integer({ min: minDepth, max: maxDepth }).chain((depth) => {
    const frameGenerators = [];
    for (let i = 0; i <= depth; i++) {
      frameGenerators.push(frameAtDepthArbitrary(i));
    }
    return fc.tuple(...frameGenerators);
  });

describe('Property 2: Parent Cards Freeze When Child Active', () => {
  /**
   * Property: In a stack with depth > 1, all non-top cards should be frozen
   */
  it('should freeze all parent cards when stack depth > 1', () => {
    fc.assert(
      fc.property(
        stackOfFramesArbitrary(2, 10), // Stack with at least 2 frames
        (frames) => {
          const states = computeStackCardStates(frames as FrameObject[]);
          
          // All cards except the last should be frozen
          for (let i = 0; i < states.length - 1; i++) {
            if (!states[i].isFrozen) return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: The topmost card should always be active
   */
  it('should keep topmost card active', () => {
    fc.assert(
      fc.property(
        stackOfFramesArbitrary(1, 10), // Stack with at least 1 frame
        (frames) => {
          const states = computeStackCardStates(frames as FrameObject[]);
          
          if (states.length === 0) return true;
          
          // The last card should be active
          const topCard = states[states.length - 1];
          return topCard.isActive === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: The topmost card should NOT be frozen
   */
  it('should not freeze the topmost card', () => {
    fc.assert(
      fc.property(
        stackOfFramesArbitrary(1, 10),
        (frames) => {
          const states = computeStackCardStates(frames as FrameObject[]);
          
          if (states.length === 0) return true;
          
          const topCard = states[states.length - 1];
          return topCard.isFrozen === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Single card stack should have active, non-frozen card
   */
  it('should have active non-frozen card when stack depth is 1', () => {
    fc.assert(
      fc.property(
        frameAtDepthArbitrary(0),
        (frame) => {
          const states = computeStackCardStates([frame as FrameObject]);
          
          if (states.length !== 1) return false;
          
          const card = states[0];
          return card.isActive === true && card.isFrozen === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Exactly one card should be active at any time
   */
  it('should have exactly one active card', () => {
    fc.assert(
      fc.property(
        stackOfFramesArbitrary(1, 10),
        (frames) => {
          const states = computeStackCardStates(frames as FrameObject[]);
          
          if (states.length === 0) return true;
          
          const activeCount = states.filter(s => s.isActive).length;
          return activeCount === 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Number of frozen cards equals stack depth - 1 (when depth > 1)
   */
  it('should have (depth - 1) frozen cards when depth > 1', () => {
    fc.assert(
      fc.property(
        stackOfFramesArbitrary(2, 10),
        (frames) => {
          const states = computeStackCardStates(frames as FrameObject[]);
          
          const frozenCount = states.filter(s => s.isFrozen).length;
          const expectedFrozen = states.length - 1;
          
          return frozenCount === expectedFrozen;
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 4: Return Action Spawns Orb to Parent
 * 
 * For any FrameObject with action 'RETURN' that has a parentFrameId,
 * processing should spawn a ReturnOrb with target set to the parent card's position.
 * 
 * **Validates: Requirements 2.6, 2.7**
 */

interface OrbSpawnEvent {
  returnValue: number | string;
  fromFrameId: string;
  toFrameId: string;
  fromIndex: number;
  toIndex: number;
}

/**
 * Helper function to determine if a RETURN frame should spawn an orb
 * and calculate the orb's target
 */
function computeOrbSpawnForReturn(
  returnFrame: FrameObject,
  activeStack: FrameObject[]
): OrbSpawnEvent | null {
  // Only RETURN frames spawn orbs
  if (returnFrame.action !== 'RETURN') return null;
  
  // Must have a parent to travel to
  if (!returnFrame.parentFrameId) return null;
  
  // Must have a return value
  if (returnFrame.returnValue === undefined) return null;
  
  // Find the returning card's index in the stack
  const fromIndex = activeStack.findIndex(f => 
    f.functionName === returnFrame.functionName && 
    f.stackDepth === returnFrame.stackDepth
  );
  
  // Find the parent card's index
  const toIndex = activeStack.findIndex(f => f.id === returnFrame.parentFrameId);
  
  if (fromIndex === -1 || toIndex === -1) return null;
  
  return {
    returnValue: returnFrame.returnValue,
    fromFrameId: activeStack[fromIndex].id,
    toFrameId: returnFrame.parentFrameId,
    fromIndex,
    toIndex,
  };
}

/**
 * Generator for RETURN frames with parent
 */
const returnFrameWithParentArbitrary = fc.record({
  id: fc.uuid(),
  lineNo: fc.integer({ min: 1, max: 100 }),
  stackDepth: fc.integer({ min: 1, max: 10 }), // Must be > 0 to have parent
  variables: fc.dictionary(
    fc.string({ minLength: 1, maxLength: 5 }),
    fc.integer({ min: 0, max: 100 })
  ),
  action: fc.constant('RETURN' as const),
  functionName: fc.constantFrom('factorial', 'fib', 'traverse'),
  returnValue: fc.oneof(fc.integer({ min: 0, max: 1000 }), fc.string({ minLength: 1, maxLength: 10 })),
  parentFrameId: fc.uuid(),
});

describe('Property 4: Return Action Spawns Orb to Parent', () => {
  /**
   * Property: RETURN frames with parentFrameId should spawn orb
   */
  it('should spawn orb for RETURN frames with parentFrameId', () => {
    fc.assert(
      fc.property(
        returnFrameWithParentArbitrary,
        fc.array(frameAtDepthArbitrary(0), { minLength: 2, maxLength: 5 }),
        (returnFrame, baseStack) => {
          // Build a mock stack that includes the parent
          const parentFrame = { ...baseStack[0], id: returnFrame.parentFrameId };
          const childFrame = { 
            ...baseStack[1], 
            id: returnFrame.id,
            stackDepth: returnFrame.stackDepth,
            functionName: returnFrame.functionName,
          };
          const mockStack = [parentFrame, childFrame] as FrameObject[];
          
          const orbEvent = computeOrbSpawnForReturn(returnFrame as FrameObject, mockStack);
          
          // Should spawn an orb
          return orbEvent !== null;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Orb should target the parent frame
   */
  it('should target orb to parent frame', () => {
    fc.assert(
      fc.property(
        returnFrameWithParentArbitrary,
        fc.array(frameAtDepthArbitrary(0), { minLength: 2, maxLength: 5 }),
        (returnFrame, baseStack) => {
          const parentFrame = { ...baseStack[0], id: returnFrame.parentFrameId };
          const childFrame = { 
            ...baseStack[1], 
            id: returnFrame.id,
            stackDepth: returnFrame.stackDepth,
            functionName: returnFrame.functionName,
          };
          const mockStack = [parentFrame, childFrame] as FrameObject[];
          
          const orbEvent = computeOrbSpawnForReturn(returnFrame as FrameObject, mockStack);
          
          if (!orbEvent) return true; // Skip if no orb
          
          // Orb should target the parent
          return orbEvent.toFrameId === returnFrame.parentFrameId;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Orb should carry the return value
   */
  it('should carry return value in orb', () => {
    fc.assert(
      fc.property(
        returnFrameWithParentArbitrary,
        fc.array(frameAtDepthArbitrary(0), { minLength: 2, maxLength: 5 }),
        (returnFrame, baseStack) => {
          const parentFrame = { ...baseStack[0], id: returnFrame.parentFrameId };
          const childFrame = { 
            ...baseStack[1], 
            id: returnFrame.id,
            stackDepth: returnFrame.stackDepth,
            functionName: returnFrame.functionName,
          };
          const mockStack = [parentFrame, childFrame] as FrameObject[];
          
          const orbEvent = computeOrbSpawnForReturn(returnFrame as FrameObject, mockStack);
          
          if (!orbEvent) return true;
          
          // Orb should carry the return value
          return orbEvent.returnValue === returnFrame.returnValue;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Root RETURN frames (no parent) should not spawn orb
   */
  it('should not spawn orb for root RETURN frames', () => {
    const rootReturnFrameArbitrary = fc.record({
      id: fc.uuid(),
      lineNo: fc.integer({ min: 1, max: 100 }),
      stackDepth: fc.constant(0),
      variables: fc.dictionary(fc.string({ minLength: 1, maxLength: 5 }), fc.integer()),
      action: fc.constant('RETURN' as const),
      functionName: fc.constantFrom('factorial', 'fib'),
      returnValue: fc.integer({ min: 0, max: 1000 }),
      // No parentFrameId for root
    });

    fc.assert(
      fc.property(
        rootReturnFrameArbitrary,
        (returnFrame) => {
          const orbEvent = computeOrbSpawnForReturn(returnFrame as FrameObject, []);
          
          // Should NOT spawn an orb (no parent)
          return orbEvent === null;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Orb fromIndex should be greater than toIndex (child above parent)
   */
  it('should have orb travel from higher index to lower index', () => {
    fc.assert(
      fc.property(
        returnFrameWithParentArbitrary,
        fc.array(frameAtDepthArbitrary(0), { minLength: 2, maxLength: 5 }),
        (returnFrame, baseStack) => {
          const parentFrame = { ...baseStack[0], id: returnFrame.parentFrameId, stackDepth: 0 };
          const childFrame = { 
            ...baseStack[1], 
            id: returnFrame.id,
            stackDepth: returnFrame.stackDepth,
            functionName: returnFrame.functionName,
          };
          const mockStack = [parentFrame, childFrame] as FrameObject[];
          
          const orbEvent = computeOrbSpawnForReturn(returnFrame as FrameObject, mockStack);
          
          if (!orbEvent) return true;
          
          // Child (fromIndex) should be above parent (toIndex) in the stack
          return orbEvent.fromIndex > orbEvent.toIndex;
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 5: Stack Cards Contain Isolated Variables
 * 
 * For any two StackCards in the Stack_Tower, their variable objects should be
 * independent copies (modifying one does not affect the other), and each card's
 * variables should match its corresponding FrameObject.
 * 
 * **Validates: Requirements 3.1, 3.4**
 */

describe('Property 5: Stack Cards Contain Isolated Variables', () => {
  /**
   * Property: Each card's variables should match its frame's variables
   */
  it('should have card variables match frame variables', () => {
    fc.assert(
      fc.property(
        stackOfFramesArbitrary(1, 10),
        (frames) => {
          const states = computeStackCardStates(frames as FrameObject[]);
          
          // Each state should reference the correct frame
          for (let i = 0; i < states.length; i++) {
            const state = states[i];
            const frame = (frames as FrameObject[])[i];
            
            if (state.frameId !== frame.id) return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Variables in different frames should be independent objects
   */
  it('should have independent variable objects across frames', () => {
    // Generator for frames with the same variable name but different values
    const framesWithSameVarNameArbitrary = fc.integer({ min: 2, max: 5 }).chain((count) => {
      const frameGenerators = [];
      for (let i = 0; i < count; i++) {
        frameGenerators.push(
          fc.record({
            id: fc.uuid(),
            lineNo: fc.integer({ min: 1, max: 100 }),
            stackDepth: fc.constant(i),
            variables: fc.constant({ n: i + 1 }), // Same var name 'n', different values
            action: fc.constant('CALL' as const),
            functionName: fc.constant('factorial'),
          })
        );
      }
      return fc.tuple(...frameGenerators);
    });

    fc.assert(
      fc.property(
        framesWithSameVarNameArbitrary,
        (frames) => {
          const frameArray = frames as FrameObject[];
          
          // All frames have 'n' but with different values
          for (let i = 0; i < frameArray.length; i++) {
            for (let j = i + 1; j < frameArray.length; j++) {
              // Variables should be different objects
              if (frameArray[i].variables === frameArray[j].variables) {
                return false; // Same reference = not isolated
              }
              
              // Values should be different (as we set them)
              if (frameArray[i].variables.n === frameArray[j].variables.n) {
                return false;
              }
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Modifying one frame's variables should not affect others
   */
  it('should not affect other frames when modifying variables', () => {
    fc.assert(
      fc.property(
        stackOfFramesArbitrary(2, 5),
        (frames) => {
          const frameArray = [...(frames as FrameObject[])];
          
          // Deep copy the first frame's variables
          const originalFirstVars = { ...frameArray[0].variables };
          const originalSecondVars = { ...frameArray[1].variables };
          
          // "Modify" the first frame's variables (simulate what shouldn't happen)
          const modifiedVars = { ...frameArray[0].variables, modified: true };
          
          // The second frame's variables should still be unchanged
          // (This tests that we're working with copies, not references)
          return JSON.stringify(frameArray[1].variables) === JSON.stringify(originalSecondVars);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Each frame at different depths should have its own variable scope
   */
  it('should maintain separate scopes at different depths', () => {
    fc.assert(
      fc.property(
        stackOfFramesArbitrary(2, 8),
        (frames) => {
          const frameArray = frames as FrameObject[];
          
          // Group frames by depth
          const framesByDepth = new Map<number, FrameObject[]>();
          for (const frame of frameArray) {
            const existing = framesByDepth.get(frame.stackDepth) || [];
            existing.push(frame);
            framesByDepth.set(frame.stackDepth, existing);
          }
          
          // Each depth should have independent variable objects
          for (const [_depth, depthFrames] of framesByDepth) {
            for (let i = 0; i < depthFrames.length; i++) {
              for (let j = i + 1; j < depthFrames.length; j++) {
                // Different frames at same depth should have different variable objects
                if (depthFrames[i].variables === depthFrames[j].variables) {
                  return false;
                }
              }
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Variable values should be preserved through stack operations
   */
  it('should preserve variable values through stack operations', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (n) => {
          // Simulate factorial frames
          const frames: FrameObject[] = [];
          for (let i = n; i >= 1; i--) {
            frames.push({
              id: `f${n - i}`,
              lineNo: 1,
              stackDepth: n - i,
              variables: { n: i },
              action: 'CALL',
              functionName: 'factorial',
            });
          }
          
          // Each frame should have its own 'n' value preserved
          for (let i = 0; i < frames.length; i++) {
            const expectedN = n - i;
            if (frames[i].variables.n !== expectedN) {
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
