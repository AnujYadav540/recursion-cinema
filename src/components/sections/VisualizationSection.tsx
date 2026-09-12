/**
 * VisualizationSection - Call stack visualization section
 * _Requirements: 4.1, 4.2, 4.5, 4.6, 4.7_
 */
import React, { useState, useRef, useEffect } from 'react';
import type { FrameObject } from '../../types';
import './VisualizationSection.css';

interface VisualizationSectionProps {
  activeStack: FrameObject[];
  currentFrame: FrameObject | undefined;
  result: any;
  isComplete: boolean;
}

/**
 * Determine the state of a stack card for visual differentiation
 */
type CardState = 'processing' | 'waiting' | 'returning';

function getCardState(
  frame: FrameObject,
  index: number,
  stackLength: number,
  currentFrame: FrameObject | undefined
): CardState {
  // Check if this frame is the one currently returning
  // A frame is "returning" when the currentFrame is a RETURN action 
  // and matches this frame's function and depth
  const isReturning = currentFrame?.action === 'RETURN' && 
                      currentFrame.functionName === frame.functionName &&
                      currentFrame.stackDepth === frame.stackDepth;
  
  if (isReturning) return 'returning';
  
  // The topmost frame that isn't returning is "processing"
  const isTop = index === stackLength - 1;
  if (isTop) return 'processing';
  
  // All other frames are "waiting"
  return 'waiting';
}

function getCardStateLabel(state: CardState): string {
  switch (state) {
    case 'processing': return '▶ EXECUTING';
    case 'waiting': return '⏸ WAITING';
    case 'returning': return '✓ RETURNING';
  }
}

export const VisualizationSection: React.FC<VisualizationSectionProps> = ({
  activeStack, currentFrame, result, isComplete
}) => {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-fit zoom when stack gets deep
  useEffect(() => {
    if (activeStack.length > 5 && containerRef.current) {
      const container = containerRef.current;
      const tower = container.querySelector('.stack-tower') as HTMLElement;
      if (tower) {
        const containerHeight = container.clientHeight - 40;
        const towerHeight = tower.scrollHeight;
        if (towerHeight > containerHeight) {
          const fitZoom = Math.max(0.5, containerHeight / towerHeight);
          setZoom(fitZoom);
        }
      }
    } else if (activeStack.length <= 3) {
      setZoom(1);
    }
  }, [activeStack.length]);

  const handleZoomIn = () => setZoom(z => Math.min(1.5, z + 0.1));
  const handleZoomOut = () => setZoom(z => Math.max(0.4, z - 0.1));

  return (
    <section id="visualization" className="visualization-section">
      <div className="section-header">
        <h2>Call Stack Visualization</h2>
      </div>

      <div className="stack-container" ref={containerRef}>
        {/* Top bar with legend and info - inside container */}
        <div className="stack-top-bar">
          <div className="stack-legend">
            <div className="legend-item">
              <span className="legend-dot legend-dot--processing"></span>
              <span className="legend-label">Executing</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot legend-dot--waiting"></span>
              <span className="legend-label">Waiting</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot legend-dot--returning"></span>
              <span className="legend-label">Returning</span>
            </div>
          </div>
          <div className="stack-info">
            <span className="depth-indicator">Depth: {activeStack.length}</span>
            {isComplete && result !== null && (
              <span className="result-display">Result: {JSON.stringify(result)}</span>
            )}
          </div>
        </div>
        {activeStack.length > 0 && (
          <div className="stack-controls">
            <button onClick={handleZoomOut} className="zoom-btn" title="Zoom Out">−</button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} className="zoom-btn" title="Zoom In">+</button>
          </div>
        )}
        {activeStack.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">📚</p>
            <p className="empty-title">Call Stack Empty</p>
            <p className="empty-desc">Run your code to see the call stack visualization</p>
          </div>
        ) : (
          <div className="stack-tower" style={{ transform: `scale(${zoom})`, transformOrigin: 'bottom center' }}>
            {activeStack.map((frame, i) => {
              const cardState = getCardState(frame, i, activeStack.length, currentFrame);
              const vars = Object.entries(frame.variables).filter(([k]) => !k.startsWith('__'));
              
              return (
                <div 
                  key={frame.id} 
                  className={`stack-card stack-card--${cardState}`}
                >
                  {/* State badge */}
                  <div className={`card-state-badge card-state-badge--${cardState}`}>
                    {getCardStateLabel(cardState)}
                  </div>
                  
                  <div className="card-header">
                    <span className="func-name">{frame.functionName}</span>
                    <span className="func-args">({vars.map(([,v]) => Array.isArray(v) ? `[${(v as any[]).slice(0,5).join(',')}${(v as any[]).length > 5 ? '...' : ''}]` : JSON.stringify(v)).join(', ')})</span>
                  </div>
                  <div className="card-vars">
                    {vars.map(([k, v]) => (
                      <div key={k} className="var-item">
                        <span className="var-name">{k}</span>
                        <span className="var-eq">=</span>
                        <span className="var-value">{Array.isArray(v) ? `[${(v as any[]).slice(0,8).join(', ')}${(v as any[]).length > 8 ? '...' : ''}]` : JSON.stringify(v)}</span>
                      </div>
                    ))}
                  </div>
                  {cardState === 'returning' && currentFrame?.returnValue !== undefined && (
                    <div className="return-value">
                      ↩ returns {JSON.stringify(currentFrame.returnValue)}
                    </div>
                  )}
                  <div className="card-depth">depth: {frame.stackDepth}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default VisualizationSection;
