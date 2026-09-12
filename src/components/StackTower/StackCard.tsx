/**
 * StackCard - Animated card representing a single function call frame
 * 
 * Features:
 * - Slide-in animation from right with spring physics
 * - Freeze effect (blur + dim) for inactive parent cards
 * - Green glow for base case returns
 * - Slide-out exit animation
 * - Displays function name with parameters in card header
 * - Shows all parameters in variable section
 * - Handles long parameter lists gracefully
 * 
 * _Requirements: 9.5_
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { FrameObject, StackCardState } from '../../types';

interface StackCardProps {
  frame: FrameObject;
  state: StackCardState;
  index: number;
  onExitComplete?: () => void;
}

/** Maximum characters for function signature before truncating */
const MAX_SIGNATURE_LENGTH = 35;

/**
 * Format function signature with parameters
 */
function formatFunctionSignature(frame: FrameObject): string {
  const params = frame.parameters || frame.variables;
  const paramStr = Object.entries(params)
    .map(([name, value]) => {
      const strValue = String(value);
      // Truncate long array values in signature
      if (strValue.length > 15) {
        return `${name}=[...]`;
      }
      return `${name}=${strValue}`;
    })
    .join(', ');
  
  const signature = `${frame.functionName}(${paramStr})`;
  
  // Truncate if too long
  if (signature.length > MAX_SIGNATURE_LENGTH) {
    return signature.substring(0, MAX_SIGNATURE_LENGTH - 3) + '...)';
  }
  
  return signature;
}

/**
 * Format a simple function call for display
 */
function formatSimpleCall(frame: FrameObject): string {
  const params = frame.parameters || frame.variables;
  const values = Object.values(params).map(v => {
    const strValue = String(v);
    if (strValue.length > 10) {
      return '[...]';
    }
    return strValue;
  });
  return `${frame.functionName}(${values.join(', ')})`;
}

// Animation variants for card enter
const cardEnterVariants = {
  initial: {
    x: 300,
    opacity: 0,
    scale: 0.8,
    rotateY: -15,
  },
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      duration: 0.5,
    },
  },
  exit: {
    x: 300,
    opacity: 0,
    scale: 0.8,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
};

// Animation variants for freeze effect
const freezeVariants = {
  active: {
    filter: 'blur(0px) brightness(1)',
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  frozen: {
    filter: 'blur(2px) brightness(0.6)',
    opacity: 0.7,
    transition: {
      duration: 0.3,
    },
  },
};

// Animation variants for glow effect
const glowVariants = {
  none: {
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  green: {
    boxShadow: '0 0 30px 10px rgba(76, 175, 80, 0.6)',
    transition: {
      duration: 0.3,
    },
  },
  blue: {
    boxShadow: '0 0 20px 5px rgba(33, 150, 243, 0.5)',
    transition: {
      duration: 0.3,
    },
  },
};

export function StackCard({ frame, state, index, onExitComplete }: StackCardProps) {
  const freezeState = state.isFrozen ? 'frozen' : 'active';
  const glowState = state.glowColor || 'none';
  
  // Use parameters if available, otherwise fall back to variables
  const displayParams = frame.parameters || {};
  const hasParameters = Object.keys(displayParams).length > 0;

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      <motion.div
        key={frame.id}
        className={`stack-card ${state.isActive ? 'active' : ''} ${state.isFrozen ? 'frozen' : ''} ${state.glowColor === 'green' ? 'glow-green' : ''}`}
        style={{
          position: 'absolute',
          bottom: index * 20, // Stack offset
          left: index * 15,   // 3D tower effect
          zIndex: 100 - index,
          transformStyle: 'preserve-3d',
        }}
        variants={cardEnterVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        layout
      >
        {/* Freeze overlay */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '12px',
            pointerEvents: 'none',
          }}
          variants={freezeVariants}
          animate={freezeState}
        />

        {/* Glow effect */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '12px',
            pointerEvents: 'none',
          }}
          variants={glowVariants}
          animate={glowState}
        />

        {/* Card content */}
        <div className="card-content" style={{ position: 'relative', zIndex: 1 }}>
          {/* Function name header with parameters */}
          <div 
            className="function-name"
            title={formatFunctionSignature(frame)}
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {formatSimpleCall(frame)}
          </div>

          {/* Parameters section (if available) */}
          {hasParameters && (
            <div className="parameters" style={{ marginBottom: '4px' }}>
              <div style={{ 
                fontSize: '10px', 
                color: 'var(--text-secondary)', 
                marginBottom: '2px' 
              }}>
                params:
              </div>
              {Object.entries(displayParams).map(([name, value]) => (
                <div key={name} className="param-item" style={{
                  display: 'flex',
                  gap: '4px',
                  fontSize: '11px',
                }}>
                  <span style={{ color: 'var(--accent-cyan, #00bcd4)' }}>{name}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>=</span>
                  <span 
                    style={{ 
                      color: 'var(--accent-green)',
                      maxWidth: '100px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={String(value)}
                  >
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Variables display */}
          <div className="variables">
            {Object.entries(frame.variables).map(([name, value]) => (
              <div key={name} className="variable-item">
                <span className="var-name">{name}</span>
                <span className="var-equals">=</span>
                <span 
                  className="var-value"
                  style={{
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                  }}
                  title={String(value)}
                >
                  {String(value)}
                </span>
              </div>
            ))}
          </div>

          {/* Return value (if returning) */}
          {state.isReturning && frame.returnValue !== undefined && (
            <motion.div
              className="return-value"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                marginTop: '8px',
                padding: '4px 8px',
                background: 'var(--accent-green)',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            >
              return {String(frame.returnValue)}
            </motion.div>
          )}

          {/* Stack depth indicator */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              fontSize: '10px',
              color: 'var(--text-secondary)',
              opacity: 0.7,
            }}
          >
            depth: {frame.stackDepth}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default StackCard;
