/**
 * TreeSection - Recursion tree visualization section
 * _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_
 */
import React, { useMemo, useState, useRef, useEffect } from 'react';
import type { FrameObject } from '../../types';
import './TreeSection.css';

interface TreeNode {
  id: string;
  name: string;
  args: string;
  children: TreeNode[];
  isActive: boolean;
  isReturned: boolean;
  returnValue?: any;
  isBaseCase?: boolean;
  phase?: 'calling' | 'returning' | 'completed';
}

interface TreeSectionProps {
  frames: FrameObject[];
  currentFrameIndex: number;
}

export const TreeSection: React.FC<TreeSectionProps> = ({ frames, currentFrameIndex }) => {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const tree = useMemo(() => {
    if (frames.length === 0) return null;

    const nodeMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];
    const returnedNodes = new Set<string>();
    const callStack: string[] = []; // Track call order

    // Build tree from frames up to current index
    for (let i = 0; i <= currentFrameIndex && i < frames.length; i++) {
      const frame = frames[i];
      
      if (frame.action === 'CALL') {
        const vars = Object.entries(frame.variables)
          .filter(([k]) => !k.startsWith('__'))
          .map(([, v]) => Array.isArray(v) ? `[${v.join(',')}]` : JSON.stringify(v))
          .join(', ');

        const node: TreeNode = {
          id: frame.id,
          name: frame.functionName,
          args: vars,
          children: [],
          isActive: i === currentFrameIndex,
          isReturned: false,
          phase: 'calling',
          isBaseCase: false,
        };

        nodeMap.set(frame.id, node);
        callStack.push(frame.id); // Track call order

        if (frame.parentFrameId && nodeMap.has(frame.parentFrameId)) {
          nodeMap.get(frame.parentFrameId)!.children.push(node);
        } else {
          roots.push(node);
        }
      } else if (frame.action === 'RETURN') {
        // Match RETURN to the most recent unreturned CALL with same function name
        // by searching backwards through the call stack
        for (let j = callStack.length - 1; j >= 0; j--) {
          const nodeId = callStack[j];
          const node = nodeMap.get(nodeId);
          if (node && node.name === frame.functionName && !returnedNodes.has(nodeId)) {
            node.isReturned = true;
            node.returnValue = frame.returnValue;
            node.isActive = i === currentFrameIndex;
            node.phase = i === currentFrameIndex ? 'returning' : 'completed';
            node.isBaseCase = node.children.length === 0;
            returnedNodes.add(nodeId);
            callStack.splice(j, 1); // Remove from call stack
            break;
          }
        }
      }
    }

    return roots[0] || null;
  }, [frames, currentFrameIndex]);

  // Auto-fit zoom when tree changes
  useEffect(() => {
    if (tree && containerRef.current) {
      // Reset to fit view
      const container = containerRef.current;
      const wrapper = container.querySelector('.tree-wrapper') as HTMLElement;
      if (wrapper) {
        const containerWidth = container.clientWidth - 40;
        const treeWidth = wrapper.scrollWidth;
        if (treeWidth > containerWidth) {
          const fitZoom = Math.max(0.4, containerWidth / treeWidth);
          setZoom(fitZoom);
        } else {
          setZoom(1);
        }
      }
    }
  }, [tree]);

  const handleZoomIn = () => setZoom(z => Math.min(2, z + 0.1));
  const handleZoomOut = () => setZoom(z => Math.max(0.3, z - 0.1));

  const renderNode = (node: TreeNode, level: number = 0): React.ReactNode => {
    const nodeClasses = [
      'tree-node',
      node.isActive && 'tree-node--active',
      node.phase === 'calling' && !node.isReturned && 'tree-node--calling',
      node.phase === 'returning' && 'tree-node--returning',
      node.phase === 'completed' && 'tree-node--completed',
      node.isBaseCase && 'tree-node--base-case',
    ].filter(Boolean).join(' ');

    return (
      <div key={node.id} className="tree-node-container">
        <div className={nodeClasses}>
          {node.isBaseCase && <span className="base-case-badge">Base Case</span>}
          <span className="node-name">{node.name}</span>
          <span className="node-args">({node.args})</span>
          {node.isReturned && node.returnValue !== undefined && (
            <span className="node-return">→ {JSON.stringify(node.returnValue)}</span>
          )}
        </div>
        {node.children.length > 0 && (
          <>
            <div className="tree-connector">
              <div className="connector-arrow">↓</div>
            </div>
            <div className="tree-children">
              {node.children.map(child => renderNode(child, level + 1))}
            </div>
          </>
        )}
        {node.isReturned && node.children.length > 0 && (
          <div className="return-arrow">↑</div>
        )}
      </div>
    );
  };

  return (
    <section id="tree" className="tree-section">
      <div className="section-header">
        <h2>🌳 Recursion Tree</h2>
        <p>Visualize how recursive calls branch out</p>
      </div>

      <div className="tree-container" ref={containerRef}>
        {tree && (
          <>
            <div className="tree-controls">
              <button onClick={handleZoomOut} className="zoom-btn" title="Zoom Out">−</button>
              <span className="zoom-level">{Math.round(zoom * 100)}%</span>
              <button onClick={handleZoomIn} className="zoom-btn" title="Zoom In">+</button>
            </div>
            <div className="tree-legend">
              <div className="legend-item">
                <div className="legend-box legend-box--calling"></div>
                <span>Calling</span>
              </div>
              <div className="legend-item">
                <div className="legend-box legend-box--returning"></div>
                <span>Returning</span>
              </div>
              <div className="legend-item">
                <div className="legend-box legend-box--completed"></div>
                <span>Completed</span>
              </div>
              <div className="legend-item">
                <span className="legend-arrow">↓</span>
                <span>Going Down</span>
              </div>
              <div className="legend-item">
                <span className="legend-arrow">↑</span>
                <span>Coming Back</span>
              </div>
            </div>
          </>
        )}
        {!tree ? (
          <div className="empty-state">
            <p className="empty-icon">🌳</p>
            <p className="empty-title">No Tree Yet</p>
            <p className="empty-desc">Run your code to see the recursion tree</p>
          </div>
        ) : (
          <div className="tree-wrapper" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
            {renderNode(tree)}
          </div>
        )}
      </div>
    </section>
  );
};

export default TreeSection;
