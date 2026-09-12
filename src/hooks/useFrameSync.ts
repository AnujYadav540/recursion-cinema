/**
 * useFrameSync - Custom hook for synchronizing components to current frame
 * 
 * Derives visualization state from the current frame, providing
 * synchronized data for StackTower, TreeBuilder, and CodePanel.
 * 
 * _Requirements: 4.4, 8.2_
 */

import { useMemo } from 'react';
import type { FrameObject, StackCardState, RecursionTreeNode } from '../types';

interface UseFrameSyncOptions {
  /** All frames in the sequence */
  frames: FrameObject[];
  /** Current frame index */
  currentFrameIndex: number;
}

interface UseFrameSyncReturn {
  /** Current frame */
  currentFrame: FrameObject | undefined;
  /** Stack cards to display (active stack at current frame) */
  stackCards: StackCardState[];
  /** Tree nodes to display */
  treeNodes: RecursionTreeNode[];
  /** Current line number to highlight */
  currentLineNo: number | undefined;
  /** Current action type for highlight color */
  currentAction: 'CALL' | 'RETURN' | 'CALC' | undefined;
  /** Current stack depth */
  stackDepth: number;
}

export function useFrameSync({ frames, currentFrameIndex }: UseFrameSyncOptions): UseFrameSyncReturn {
  return useMemo(() => {
    if (frames.length === 0 || currentFrameIndex < 0) {
      return {
        currentFrame: undefined,
        stackCards: [],
        treeNodes: [],
        currentLineNo: undefined,
        currentAction: undefined,
        stackDepth: 0,
      };
    }

    const currentFrame = frames[currentFrameIndex];
    
    // Build active stack by replaying frames up to current index
    const activeStack = buildActiveStack(frames, currentFrameIndex);
    
    // Convert to StackCardState
    const stackCards = activeStack.map((frame, index) => {
      const isTop = index === activeStack.length - 1;
      const isReturning = currentFrame?.action === 'RETURN' && currentFrame.id === frame.id;
      const isBaseCase = isReturning && isBaseCaseFrame(frames, currentFrameIndex);
      
      return {
        frameId: frame.id,
        position: {
          x: index * 20, // Offset for 3D effect
          y: 0,
          z: index * 10,
        },
        isActive: isTop,
        isFrozen: !isTop,
        isReturning,
        glowColor: isBaseCase ? 'green' as const : 'none' as const,
      };
    });

    // Build tree nodes from all CALL frames up to current
    const treeNodes = buildTreeNodes(frames, currentFrameIndex, activeStack);

    return {
      currentFrame,
      stackCards,
      treeNodes,
      currentLineNo: currentFrame?.lineNo,
      currentAction: currentFrame?.action,
      stackDepth: activeStack.length,
    };
  }, [frames, currentFrameIndex]);
}

/**
 * Build the active stack by replaying frames
 */
function buildActiveStack(frames: FrameObject[], upToIndex: number): FrameObject[] {
  const stack: FrameObject[] = [];
  const stackMap = new Map<number, FrameObject>(); // depth -> frame

  for (let i = 0; i <= upToIndex; i++) {
    const frame = frames[i];
    
    if (frame.action === 'CALL') {
      stackMap.set(frame.stackDepth, frame);
    } else if (frame.action === 'RETURN') {
      // Keep the frame in stack until after this frame is processed
      // (for showing the return animation)
      if (i === upToIndex) {
        // Current frame is a RETURN, still show the card
        stackMap.set(frame.stackDepth, frame);
      } else {
        // Past RETURN, remove from stack
        stackMap.delete(frame.stackDepth);
      }
    }
  }

  // Convert map to sorted array by depth
  const depths = Array.from(stackMap.keys()).sort((a, b) => a - b);
  for (const depth of depths) {
    const frame = stackMap.get(depth);
    if (frame) stack.push(frame);
  }

  return stack;
}

/**
 * Check if current frame is a base case return
 */
function isBaseCaseFrame(frames: FrameObject[], frameIndex: number): boolean {
  const frame = frames[frameIndex];
  if (!frame || frame.action !== 'RETURN') return false;

  // Find max depth reached before this return
  let maxDepth = 0;
  for (let i = 0; i < frameIndex; i++) {
    if (frames[i].action === 'CALL') {
      maxDepth = Math.max(maxDepth, frames[i].stackDepth);
    }
  }

  return frame.stackDepth === maxDepth;
}

/**
 * Build tree nodes from frames
 */
function buildTreeNodes(
  frames: FrameObject[],
  upToIndex: number,
  activeStack: FrameObject[]
): RecursionTreeNode[] {
  const nodes: RecursionTreeNode[] = [];
  const seenIds = new Set<string>();

  // Find the topmost active frame
  const topFrameId = activeStack.length > 0 ? activeStack[activeStack.length - 1].id : null;

  for (let i = 0; i <= upToIndex; i++) {
    const frame = frames[i];
    
    // Only create nodes for CALL frames (one node per call)
    if (frame.action === 'CALL' && !seenIds.has(frame.id)) {
      seenIds.add(frame.id);
      
      // Find return value if this frame has returned
      let returnValue: number | string | undefined;
      for (let j = i + 1; j <= upToIndex; j++) {
        if (frames[j].id === frame.id && frames[j].action === 'RETURN') {
          returnValue = frames[j].returnValue;
          break;
        }
      }

      nodes.push({
        id: frame.id,
        data: {
          label: `${frame.functionName}(${formatVariables(frame.variables)})`,
          variables: frame.variables,
          isActive: frame.id === topFrameId,
          returnValue,
        },
        position: calculateNodePosition(frame.stackDepth, nodes.filter(n => 
          getNodeDepth(frames, n.id) === frame.stackDepth
        ).length),
        parentId: frame.parentFrameId,
      });
    }
  }

  return nodes;
}

/**
 * Format variables for display
 */
function formatVariables(variables: Record<string, number | string>): string {
  return Object.entries(variables)
    .map(([, value]) => `${value}`)
    .join(', ');
}

/**
 * Calculate node position for tree layout
 */
function calculateNodePosition(depth: number, siblingIndex: number): { x: number; y: number } {
  const verticalSpacing = 100;
  const horizontalSpacing = 150;
  
  return {
    x: siblingIndex * horizontalSpacing,
    y: depth * verticalSpacing,
  };
}

/**
 * Get the stack depth of a node by its frame ID
 */
function getNodeDepth(frames: FrameObject[], frameId: string): number {
  const frame = frames.find(f => f.id === frameId && f.action === 'CALL');
  return frame?.stackDepth ?? 0;
}

export default useFrameSync;
