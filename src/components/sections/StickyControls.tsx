/**
 * StickyControls - Fixed playback controls at bottom of viewport
 * _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
 */
import React, { useState } from 'react';
import type { PlaybackState } from '../../types';
import './StickyControls.css';

interface StickyControlsProps {
  playback: PlaybackState;
  hasFrames: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export const StickyControls: React.FC<StickyControlsProps> = ({
  playback,
  hasFrames,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Hidden when no frames (Requirement 7.5)
  if (!hasFrames) {
    return null;
  }

  const progress = playback.totalFrames > 0 
    ? ((playback.currentFrameIndex + 1) / playback.totalFrames) * 100 
    : 0;

  return (
    <div className={`sticky-controls ${!isVisible ? 'sticky-controls--hidden' : ''}`} role="toolbar" aria-label="Playback controls">
      <button 
        className="controls-toggle"
        onClick={() => setIsVisible(!isVisible)}
        title={isVisible ? 'Hide Controls' : 'Show Controls'}
        aria-label={isVisible ? 'Hide Controls' : 'Show Controls'}
      >
        {isVisible ? '▼' : '▲'}
      </button>
      <div className="controls-backdrop" />
      
      <div className="controls-content">
        {/* Reset button */}
        <button 
          className="control-btn" 
          onClick={onReset}
          title="Reset"
          aria-label="Reset to beginning"
        >
          ⏮
        </button>

        {/* Step backward */}
        <button 
          className="control-btn" 
          onClick={onStepBackward}
          disabled={playback.currentFrameIndex === 0}
          title="Step Back"
          aria-label="Step backward"
        >
          ⏪
        </button>

        {/* Play/Pause */}
        <button 
          className={`control-btn control-btn--play ${playback.isPlaying ? 'control-btn--pause' : ''}`}
          onClick={playback.isPlaying ? onPause : onPlay}
          title={playback.isPlaying ? 'Pause' : 'Play'}
          aria-label={playback.isPlaying ? 'Pause' : 'Play'}
        >
          {playback.isPlaying ? '⏸' : '▶'}
        </button>

        {/* Step forward */}
        <button 
          className="control-btn" 
          onClick={onStepForward}
          disabled={playback.currentFrameIndex >= playback.totalFrames - 1}
          title="Step Forward"
          aria-label="Step forward"
        >
          ⏩
        </button>

        {/* Step progress display */}
        <div className="step-progress">
          <span className="step-current">{playback.currentFrameIndex + 1}</span>
          <span className="step-separator">/</span>
          <span className="step-total">{playback.totalFrames || '-'}</span>
        </div>

        {/* Progress bar */}
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Speed slider */}
        <div className="speed-control">
          <span className="speed-label">Speed:</span>
          <input 
            type="range" 
            min="0.25" 
            max="3" 
            step="0.25" 
            value={playback.speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="speed-slider"
            aria-label="Playback speed"
          />
          <span className="speed-value">{playback.speed}x</span>
        </div>
      </div>
    </div>
  );
};

export default StickyControls;
