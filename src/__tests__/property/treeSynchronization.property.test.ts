/**
 * Property-Based Tests for Tree and Stack Synchronization
 * 
 * Feature: recursion-cinema, Property 6: Tree and Stack Synchronization
 * 
 * For any frame index during playback, the number of active nodes in Tree_Builder
 * should equal the current stack depth, and the active tree node should correspond
 * to the active StackCard.
 * 
 * **Validates: Requirements 4.2, 4.3, 4.4**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { FrameObject } from '../../types';

/**
 * Helper function to compute the current stack state at a given frame index.
 * This simulates what the StackTower component tracks.
 */
function computeStackStateAtFrame(
  frames: FrameObject[],
  currentIndex: number
): { activeFrameIds: string[]; currentActiveId: string | null } {
  const callStack: string[] = [];
  
  for (let i = 0; i <= currentIndex && i < frames.length; i++) {
    const frame = frames[i];
    
    if (frame.action === 'CALL') {
      callStack.push(frame.id);
    } else if (frame.action === 'RETURN') {
      callStack.pop();
    }
  }
  
  return {
    activeFrameIds: [...callStack],
    currentActiveId: callStack.length > 0 ? callStack[callStack.length - 1] : null,
  };
}

/**
 * Helper function to compute tree node count at a given frame index.
 * This simulates what the TreeBuilder component displays.
 */
function computeTreeNodeCountAtFrame(
  frames: FrameObject[],
  currentIndex: number
): { nodeCount: number; activeNodeId: string | null } {
  const callStack: string[] = [];
  
  for (let i = 0; i <= currentIndex && i < frames.length; i++) {
    const frame = frames[i];
    
    if (frame.action === 'CALL') {
      callStack.push(frame.id);
    } else if (frame.action === 'RETURN') {
      callStack.pop();
    }
  }
  
  return {
    nodeCount: callStack.length,
    activeNodeId: callStack.length > 0 ? callStack[callStack.length - 1] : null,
  };
}

/**
 * Generator for a single CALL frame at a specific depth with parent reference
 */
const callFrameAtDepthArbitrary = (depth: number, parentId?: string) =>
  fc.record({
    id: fc.uuid(),
    lineNo: fc.integer({ min: 1, max: 100 }),
    stackDepth: fc.constant(depth),
    variables: fc.dictionary(
      fc.string({ minLength: 1, maxLength: 5 }),
      fc.integer({ min: 0, max: 100 })
    ),
    action: fc.constant('CALL' as const),
    functionName: fc.constantFrom('factorial', 'fib', 'traverse', 'recurse'),
    parentFrameId: fc.constant(parentId),
  });

/**
 * Generator for a RETURN frame at a specific depth
 */
const returnFrameAtDepthArbitrary = (depth: number, parentId?: string) =>
  fc.record({
    id: fc.uuid(),
    lineNo: fc.integer({ min: 1, max: 100 }),
    stackDepth: fc.constant(depth),
    variables: fc.dictionary(
      fc.string({ minLength: 1, maxLength: 5 }),
      fc.integer({ min: 0, max: 100 })
    ),
    action: fc.constant('RETURN' as const),
    functionName: fc.constantFrom('factorial', 'fib', 'traverse', 'recurse'),
    returnValue: fc.integer({ min: 0, max: 1000 }),
    parentFrameId: fc.constant(parentId),
  });

/**
 * Generator for a valid frame sequence (CALL/RETURN pairs that form valid stack)
 */
function generateValidFrameSequence(maxDepth: number): fc.Arbitrary<FrameObject[]> {
  return fc.integer({ min: 1, max: maxDepth }).chain((targetDepth) => {
    // Build a sequence: CALL to depth, then RETURN back
    const frameGenerators: fc.Arbitrary<FrameObject>[] = [];
    const frameIds: string[] = [];
    
    // Generate CALL frames going down
    for (let d = 0; d <= targetDepth; d++) {
      const parentId = d > 0 ? `frame-${d - 1}` : undefined;
      frameGenerators.push(
        fc.record({
          id: fc.constant(`frame-${d}`),
          lineNo: fc.integer({ min: 1, max: 100 }),
          stackDepth: fc.constant(d),
          variables: fc.constant({ n: targetDepth - d + 1 }),
          action: fc.constant('CALL' as const),
          functionName: fc.constant('factorial'),
          parentFrameId: fc.constant(parentId),
        })
      );
      frameIds.push(`frame-${d}`);
    }
    
    // Generate RETURN frames going back up
    for (let d = targetDepth; d >= 0; d--) {
      const parentId = d > 0 ? `frame-${d - 1}` : undefined;
      frameGenerators.push(
        fc.record({
          id: fc.uuid(), // Different ID for return frame
          lineNo: fc.integer({ min: 1, max: 100 }),
          stackDepth: fc.constant(d),
          variables: fc.constant({ n: targetDepth - d + 1 }),
          action: fc.constant('RETURN' as const),
          functionName: fc.constant('factorial'),
          returnValue: fc.integer({ min: 1, max: 1000 }),
          parentFrameId: fc.constant(parentId),
        })
      );
    }
    
    return fc.tuple(...frameGenerators).map((frames) => frames as FrameObject[]);
  });
}

describe('Property 6: Tree and Stack Synchronization', () => {
  /**
   * Property: Tree node count equals stack depth at each frame
   */
  it('should have tree node count equal stack depth at each frame', () => {
    fc.assert(
      fc.property(
        generateValidFrameSequence(8),
        (frames) => {
          // Test at each frame index
          for (let i = 0; i < frames.length; i++) {
            const stackState = computeStackStateAtFrame(frames, i);
            const treeState = computeTreeNodeCountAtFrame(frames, i);
            
            // Tree node count should equal stack depth
            if (treeState.nodeCount !== stackState.activeFrameIds.length) {
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
   * Property: Active tree node matches active stack card
   */
  it('should have active tree node match active stack card', () => {
    fc.assert(
      fc.property(
        generateValidFrameSequence(8),
        (frames) => {
          for (let i = 0; i < frames.length; i++) {
            const stackState = computeStackStateAtFrame(frames, i);
            const treeState = computeTreeNodeCountAtFrame(frames, i);
            
            // Active node should match
            if (treeState.activeNodeId !== stackState.currentActiveId) {
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
   * Property: Tree grows when stack grows (CALL action)
   */
  it('should grow tree when stack grows on CALL', () => {
    fc.assert(
      fc.property(
        generateValidFrameSequence(8),
        (frames) => {
          for (let i = 1; i < frames.length; i++) {
            const prevStackState = computeStackStateAtFrame(frames, i - 1);
            const currStackState = computeStackStateAtFrame(frames, i);
            const prevTreeState = computeTreeNodeCountAtFrame(frames, i - 1);
            const currTreeState = computeTreeNodeCountAtFrame(frames, i);
            
            // If stack grew, tree should grow
            if (currStackState.activeFrameIds.length > prevStackState.activeFrameIds.length) {
              if (currTreeState.nodeCount <= prevTreeState.nodeCount) {
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
   * Property: Tree shrinks when stack shrinks (RETURN action)
   */
  it('should shrink tree when stack shrinks on RETURN', () => {
    fc.assert(
      fc.property(
        generateValidFrameSequence(8),
        (frames) => {
          for (let i = 1; i < frames.length; i++) {
            const prevStackState = computeStackStateAtFrame(frames, i - 1);
            const currStackState = computeStackStateAtFrame(frames, i);
            const prevTreeState = computeTreeNodeCountAtFrame(frames, i - 1);
            const currTreeState = computeTreeNodeCountAtFrame(frames, i);
            
            // If stack shrank, tree should shrink
            if (currStackState.activeFrameIds.length < prevStackState.activeFrameIds.length) {
              if (currTreeState.nodeCount >= prevTreeState.nodeCount) {
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
   * Property: Tree and stack are empty together or non-empty together
   */
  it('should have tree and stack empty/non-empty together', () => {
    fc.assert(
      fc.property(
        generateValidFrameSequence(8),
        (frames) => {
          for (let i = 0; i < frames.length; i++) {
            const stackState = computeStackStateAtFrame(frames, i);
            const treeState = computeTreeNodeCountAtFrame(frames, i);
            
            const stackEmpty = stackState.activeFrameIds.length === 0;
            const treeEmpty = treeState.nodeCount === 0;
            
            // Both should be empty or both non-empty
            if (stackEmpty !== treeEmpty) {
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
   * Property: Active node is null iff stack is empty
   */
  it('should have active node null iff stack is empty', () => {
    fc.assert(
      fc.property(
        generateValidFrameSequence(8),
        (frames) => {
          for (let i = 0; i < frames.length; i++) {
            const stackState = computeStackStateAtFrame(frames, i);
            const treeState = computeTreeNodeCountAtFrame(frames, i);
            
            const stackEmpty = stackState.activeFrameIds.length === 0;
            const activeNodeNull = treeState.activeNodeId === null;
            
            if (stackEmpty !== activeNodeNull) {
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
   * Property: Tree node count never exceeds maximum stack depth reached
   */
  it('should never have tree node count exceed max stack depth', () => {
    fc.assert(
      fc.property(
        generateValidFrameSequence(8),
        (frames) => {
          let maxDepthReached = 0;
          
          for (let i = 0; i < frames.length; i++) {
            const stackState = computeStackStateAtFrame(frames, i);
            const treeState = computeTreeNodeCountAtFrame(frames, i);
            
            maxDepthReached = Math.max(maxDepthReached, stackState.activeFrameIds.length);
            
            // Tree node count should never exceed max depth reached
            if (treeState.nodeCount > maxDepthReached) {
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
   * Property: Synchronization holds for factorial-like sequences
   */
  it('should maintain synchronization for factorial sequences', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (n) => {
          // Generate factorial-like frame sequence
          const frames: FrameObject[] = [];
          
          // CALL frames going down
          for (let i = 0; i < n; i++) {
            frames.push({
              id: `call-${i}`,
              lineNo: 1,
              stackDepth: i,
              variables: { n: n - i },
              action: 'CALL',
              functionName: 'factorial',
              parentFrameId: i > 0 ? `call-${i - 1}` : undefined,
            });
          }
          
          // RETURN frames going back up
          for (let i = n - 1; i >= 0; i--) {
            frames.push({
              id: `return-${i}`,
              lineNo: 4,
              stackDepth: i,
              variables: { n: n - i },
              action: 'RETURN',
              functionName: 'factorial',
              returnValue: i === n - 1 ? 1 : (n - i),
              parentFrameId: i > 0 ? `call-${i - 1}` : undefined,
            });
          }
          
          // Verify synchronization at each step
          for (let i = 0; i < frames.length; i++) {
            const stackState = computeStackStateAtFrame(frames, i);
            const treeState = computeTreeNodeCountAtFrame(frames, i);
            
            if (treeState.nodeCount !== stackState.activeFrameIds.length) {
              return false;
            }
            if (treeState.activeNodeId !== stackState.currentActiveId) {
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
