/**
 * VariableDisplay - Shows local variables with Scope Ghost hover effect
 * 
 * Displays variables inside a stack card and highlights differences
 * across cards when hovering over the stack.
 * 
 * Enhanced to handle array variables with proper formatting and truncation.
 * _Requirements: 3.5_
 */

import { motion } from 'framer-motion';

interface VariableDisplayProps {
  variables: Record<string, number | string>;
  isHighlighted?: boolean;
  comparisonVariables?: Record<string, number | string>;
}

/** Maximum characters to display for array values before truncating */
const MAX_ARRAY_DISPLAY_LENGTH = 40;

/**
 * Format a variable value for display
 * Handles arrays, strings, numbers, and other types
 */
function formatValue(value: number | string): string {
  const strValue = String(value);
  
  // Check if it's an array representation
  if (strValue.startsWith('[') && strValue.endsWith(']')) {
    // Truncate long arrays
    if (strValue.length > MAX_ARRAY_DISPLAY_LENGTH) {
      // Find a good truncation point (after a comma)
      const truncateAt = strValue.lastIndexOf(',', MAX_ARRAY_DISPLAY_LENGTH - 5);
      if (truncateAt > 0) {
        return strValue.substring(0, truncateAt) + ', ...]';
      }
      return strValue.substring(0, MAX_ARRAY_DISPLAY_LENGTH - 3) + '...]';
    }
    return strValue;
  }
  
  return strValue;
}

/**
 * Determine if a value is an array representation
 */
function isArrayValue(value: number | string): boolean {
  const strValue = String(value);
  return strValue.startsWith('[') && strValue.endsWith(']');
}

export function VariableDisplay({ 
  variables, 
  isHighlighted = false,
  comparisonVariables 
}: VariableDisplayProps) {
  return (
    <motion.div
      className="variables"
      animate={{
        scale: isHighlighted ? 1.05 : 1,
        backgroundColor: isHighlighted ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
      }}
      transition={{ duration: 0.2 }}
      style={{
        padding: '4px',
        borderRadius: '4px',
      }}
    >
      {Object.entries(variables).map(([name, value]) => {
        const isDifferent = comparisonVariables && comparisonVariables[name] !== value;
        const isArray = isArrayValue(value);
        const displayValue = formatValue(value);
        
        return (
          <motion.div 
            key={name} 
            className="variable-item"
            animate={{
              backgroundColor: isDifferent ? 'rgba(255, 193, 7, 0.2)' : 'transparent',
            }}
            style={{
              display: 'flex',
              gap: '8px',
              padding: '4px 0',
              borderRadius: '2px',
              flexWrap: isArray ? 'wrap' : 'nowrap',
            }}
          >
            <span className="var-name" style={{ color: 'var(--accent-yellow)' }}>
              {name}
            </span>
            <span className="var-equals" style={{ color: 'var(--text-secondary)' }}>
              =
            </span>
            <motion.span 
              className="var-value" 
              style={{ 
                color: isArray ? 'var(--accent-cyan, #00bcd4)' : 'var(--accent-green)',
                fontFamily: isArray ? 'monospace' : 'inherit',
                fontSize: isArray ? '0.9em' : 'inherit',
                wordBreak: isArray ? 'break-all' : 'normal',
              }}
              animate={{
                fontWeight: isDifferent ? 'bold' : 'normal',
                textShadow: isDifferent ? '0 0 8px var(--accent-yellow)' : 'none',
              }}
              title={String(value)} // Show full value on hover
            >
              {displayValue}
            </motion.span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default VariableDisplay;
