/**
 * RecursionNode - Custom node component for the recursion tree
 * 
 * Displays:
 * - Function name in tree nodes
 * - Variables and their values
 * - Active/returned state with visual feedback
 * 
 * _Requirements: 9.4_
 */

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';

export interface RecursionNodeData {
  label: string;
  functionName?: string;
  variables: Record<string, number | string>;
  isActive: boolean;
  returnValue?: number | string;
  [key: string]: unknown; // Index signature for React Flow compatibility
}

interface RecursionNodeProps {
  data: RecursionNodeData;
}

const nodeVariants = {
  inactive: {
    scale: 1,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },
  active: {
    scale: 1.05,
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.5)',
  },
  returned: {
    scale: 1,
    boxShadow: '0 4px 16px rgba(76, 175, 80, 0.4)',
  },
};

/** Maximum length for variable values before truncating */
const MAX_VALUE_LENGTH = 20;

/**
 * Format a variable value for display
 */
function formatValue(value: number | string): string {
  const str = String(value);
  if (str.length > MAX_VALUE_LENGTH) {
    return str.substring(0, MAX_VALUE_LENGTH - 3) + '...';
  }
  return str;
}

function RecursionNode({ data }: RecursionNodeProps) {
  const { label, functionName, variables, isActive, returnValue } = data;
  const hasReturned = returnValue !== undefined;

  return (
    <motion.div
      variants={nodeVariants}
      initial="inactive"
      animate={hasReturned ? 'returned' : isActive ? 'active' : 'inactive'}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        padding: '10px 14px',
        borderRadius: '8px',
        background: hasReturned
          ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
          : isActive
          ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
          : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
        border: `2px solid ${
          hasReturned ? '#4caf50' : isActive ? '#2196f3' : '#bdbdbd'
        }`,
        minWidth: '100px',
        maxWidth: '180px',
        textAlign: 'center',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      
      {/* Function name badge */}
      {functionName && (
        <div style={{
          fontSize: '10px',
          color: '#666',
          marginBottom: '2px',
          fontWeight: 500,
        }}>
          {functionName}
        </div>
      )}
      
      {/* Main label (function call) */}
      <div 
        style={{ 
          fontWeight: 600, 
          fontSize: '13px', 
          marginBottom: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={label}
      >
        {label}
      </div>
      
      {/* Variables */}
      <div style={{ fontSize: '11px', color: '#666' }}>
        {Object.entries(variables).slice(0, 3).map(([key, value]) => (
          <div 
            key={key}
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={`${key} = ${value}`}
          >
            {key} = {formatValue(value)}
          </div>
        ))}
        {Object.keys(variables).length > 3 && (
          <div style={{ color: '#999', fontStyle: 'italic' }}>
            +{Object.keys(variables).length - 3} more
          </div>
        )}
      </div>
      
      {/* Return value badge */}
      {hasReturned && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '6px',
            padding: '3px 6px',
            background: '#4caf50',
            color: 'white',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={`return ${returnValue}`}
        >
          → {formatValue(returnValue as number | string)}
        </motion.div>
      )}
      
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </motion.div>
  );
}

export default memo(RecursionNode);
