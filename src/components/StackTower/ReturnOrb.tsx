/**
 * ReturnOrb - Animated orb representing a return value traveling up the stack
 * 
 * Features:
 * - Spawns from returning card with scale animation
 * - Travels to parent card position with spring physics
 * - Absorption animation when reaching parent
 * - Displays return value inside the orb
 */

import { motion } from 'framer-motion';

interface ReturnOrbProps {
  returnValue: number | string;
  onComplete?: () => void;
}

// Animation variants for the orb lifecycle
const orbVariants = {
  initial: {
    scale: 0,
    opacity: 0,
    y: 0,
  },
  spawn: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 20,
      duration: 0.3,
    },
  },
  travel: (targetY: number) => ({
    y: targetY,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      duration: 0.8,
    },
  }),
  absorb: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

export function ReturnOrb({ returnValue, onComplete }: ReturnOrbProps) {

  return (
    <motion.div
      className="return-orb"
      style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, var(--accent-green), #1b5e20)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '14px',
        color: 'white',
        boxShadow: '0 0 20px rgba(76, 175, 80, 0.6)',
        zIndex: 200,
      }}
      initial="initial"
      animate={['spawn']}
      variants={orbVariants}
      onAnimationComplete={(definition) => {
        if (definition === 'spawn' && onComplete) {
          onComplete();
        }
      }}
    >
      {String(returnValue)}
    </motion.div>
  );
}

/**
 * ReturnOrbAnimated - Full animation sequence version
 * Handles the complete spawn -> travel -> absorb lifecycle
 */
interface ReturnOrbAnimatedProps {
  returnValue: number | string;
  fromCardIndex: number;
  toCardIndex: number;
  cardHeight: number;
  cardOffset: number;
  onComplete?: () => void;
}

export function ReturnOrbAnimated({
  returnValue,
  fromCardIndex,
  toCardIndex,
  cardHeight = 120,
  cardOffset = 20,
  onComplete,
}: ReturnOrbAnimatedProps) {
  // Calculate positions based on card indices
  const startY = fromCardIndex * cardOffset + cardHeight / 2;
  const targetY = toCardIndex * cardOffset + cardHeight / 2;
  const travelDistance = startY - targetY; // Positive = moving down (up the stack visually)

  return (
    <motion.div
      className="return-orb"
      style={{
        position: 'absolute',
        bottom: startY,
        left: '50%',
        marginLeft: fromCardIndex * 15 + 140, // Align with card center
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #66bb6a, #2e7d32)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '14px',
        color: 'white',
        boxShadow: '0 0 25px rgba(76, 175, 80, 0.7), inset 0 0 10px rgba(255,255,255,0.2)',
        zIndex: 200,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [0, 1.2, 1, 1, 0],
        opacity: [0, 1, 1, 1, 0],
        y: [0, 0, 0, -travelDistance, -travelDistance],
        x: [0, 0, 0, -(fromCardIndex - toCardIndex) * 15, -(fromCardIndex - toCardIndex) * 15],
      }}
      transition={{
        duration: 1.5,
        times: [0, 0.15, 0.25, 0.8, 1],
        ease: ['easeOut', 'easeInOut', 'easeInOut', 'easeIn'],
      }}
      onAnimationComplete={onComplete}
    >
      <motion.span
        initial={{ scale: 0.8 }}
        animate={{ scale: [0.8, 1, 1.1, 1] }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {String(returnValue)}
      </motion.span>
    </motion.div>
  );
}

export default ReturnOrb;
