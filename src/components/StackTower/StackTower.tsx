/**
 * StackTower - Container for the animated stack of function call cards
 * 
 * Features:
 * - Manages array of StackCard components
 * - Positions cards with 3D overlap effect
 * - Handles frame updates to add/remove cards
 * - Implements Scope Ghost hover effect for variable comparison
 */

import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { FrameObject, StackCardState } from '../../types';
import { StackCard } from './StackCard';
import { ReturnOrbAnimated } from './ReturnOrb';

interface StackTowerProps {
  /** Current stack of active frames (CALL frames that haven't returned) */
  activeStack: FrameObject[];
  /** Current frame being processed (for determining active/frozen states) */
  currentFrame?: FrameObject;
  /** Maximum depth reached (for base case glow detection) */
  maxDepthReached?: number;
  /** Callback when a card exit animation completes */
  onCardExitComplete?: (frameId: string) => void;
}

/**
 * Compute the visual state for each card in the stack
 */
function computeCardStates(
  activeStack: FrameObject[],
  currentFrame?: FrameObject,
  maxDepthReached?: number
): StackCardState[] {
  if (activeStack.length === 0) return [];

  return activeStack.map((frame, index) => {
    const isTopmost = index === activeStack.length - 1;
    const isReturning = currentFrame?.action === 'RETURN' && 
                        currentFrame.stackDepth === frame.stackDepth &&
                        currentFrame.functionName === frame.functionName;
    
    // Base case glow: returning from max depth
    const isBaseCase = isReturning && 
                       maxDepthReached !== undefined && 
                       frame.stackDepth === maxDepthReached;

    return {
      frameId: frame.id,
      position: { x: index * 15, y: index * 20, z: 100 - index },
      isActive: isTopmost && !isReturning,
      isFrozen: !isTopmost && activeStack.length > 1,
      isReturning,
      glowColor: isBaseCase ? 'green' : (isTopmost && !isReturning ? 'blue' : 'none'),
    };
  });
}

export function StackTower({ 
  activeStack, 
  currentFrame,
  maxDepthReached,
  onCardExitComplete 
}: StackTowerProps) {
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const [activeOrb, setActiveOrb] = useState<{
    returnValue: number | string;
    fromIndex: number;
    toIndex: number;
  } | null>(null);

  // Compute card states
  const cardStates = useMemo(
    () => computeCardStates(activeStack, currentFrame, maxDepthReached),
    [activeStack, currentFrame, maxDepthReached]
  );

  // Get comparison variables for Scope Ghost effect
  const _comparisonVariables = useMemo(() => {
    if (hoveredCardIndex === null || activeStack.length <= 1) return undefined;
    // Compare with the card above (if exists) or below
    const compareIndex = hoveredCardIndex < activeStack.length - 1 
      ? hoveredCardIndex + 1 
      : hoveredCardIndex - 1;
    return activeStack[compareIndex]?.variables;
  }, [hoveredCardIndex, activeStack]);

  // Handle return orb spawning
  const handleReturnOrbSpawn = (fromIndex: number, toIndex: number, returnValue: number | string) => {
    setActiveOrb({ returnValue, fromIndex, toIndex });
  };

  const handleOrbComplete = () => {
    setActiveOrb(null);
  };

  // Spawn orb when current frame is RETURN with parent
  useMemo(() => {
    if (currentFrame?.action === 'RETURN' && 
        currentFrame.parentFrameId && 
        currentFrame.returnValue !== undefined) {
      const fromIndex = activeStack.findIndex(f => 
        f.functionName === currentFrame.functionName && 
        f.stackDepth === currentFrame.stackDepth
      );
      const toIndex = activeStack.findIndex(f => f.id === currentFrame.parentFrameId);
      
      if (fromIndex !== -1 && toIndex !== -1) {
        handleReturnOrbSpawn(fromIndex, toIndex, currentFrame.returnValue);
      }
    }
  }, [currentFrame, activeStack]);

  return (
    <div 
      className="stack-tower-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '20px',
        perspective: '1000px',
      }}
    >
      {/* Stack cards */}
      <div 
        style={{
          position: 'relative',
          width: '320px',
          minHeight: '200px',
        }}
      >
        <AnimatePresence mode="popLayout">
          {activeStack.map((frame, index) => (
            <motion.div
              key={frame.id}
              onMouseEnter={() => setHoveredCardIndex(index)}
              onMouseLeave={() => setHoveredCardIndex(null)}
              layout
            >
              <StackCard
                frame={{
                  ...frame,
                  // Pass return value from current frame if this card is returning
                  returnValue: currentFrame?.action === 'RETURN' && 
                               currentFrame.stackDepth === frame.stackDepth
                    ? currentFrame.returnValue
                    : frame.returnValue,
                }}
                state={cardStates[index]}
                index={index}
                onExitComplete={() => onCardExitComplete?.(frame.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Return orb animation */}
        {activeOrb && (
          <ReturnOrbAnimated
            returnValue={activeOrb.returnValue}
            fromCardIndex={activeOrb.fromIndex}
            toCardIndex={activeOrb.toIndex}
            cardHeight={120}
            cardOffset={20}
            onComplete={handleOrbComplete}
          />
        )}
      </div>

      {/* Scope Ghost indicator */}
      {hoveredCardIndex !== null && activeStack.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 16px',
            background: 'rgba(33, 150, 243, 0.2)',
            borderRadius: '4px',
            fontSize: '12px',
            color: 'var(--accent-blue)',
          }}
        >
          👻 Each card has its own copy of variables!
        </motion.div>
      )}

      {/* Empty state */}
      {activeStack.length === 0 && (
        <div style={{ 
          color: 'var(--text-secondary)', 
          textAlign: 'center',
          padding: '40px',
        }}>
          <p>Stack visualization will appear here</p>
          <p style={{ fontSize: '12px', marginTop: '8px' }}>
            Click "Play Demo" to see the recursion in action
          </p>
        </div>
      )}
    </div>
  );
}

// Export helper for computing states (used in tests)
export { computeCardStates };

export default StackTower;
