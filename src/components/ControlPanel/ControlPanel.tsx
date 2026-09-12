/**
 * ControlPanel - Playback controls for the recursion visualization
 * 
 * Provides Play/Pause toggle, Step Forward/Backward buttons,
 * speed slider, and current step display.
 * 
 * _Requirements: 7.1, 7.2, 7.3, 7.4_
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { PlaybackState } from '../../types';
import { AnimationController } from '../../engine/AnimationController';

interface ControlPanelProps {
  /** AnimationController instance to control */
  controller: AnimationController;
  /** Optional callback when play is clicked (e.g., to generate frames first) */
  onPlayClick?: () => void;
  /** Whether frames are loaded and ready for playback */
  hasFrames?: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  controller,
  onPlayClick,
  hasFrames = false,
}) => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>(() =>
    controller.getPlaybackState()
  );

  // Subscribe to playback state changes
  useEffect(() => {
    const unsubscribe = controller.onPlaybackStateChange((state: PlaybackState) => {
      setPlaybackState(state);
    });
    return unsubscribe;
  }, [controller]);

  const handlePlayPause = useCallback(() => {
    if (playbackState.isPlaying) {
      controller.pause();
    } else {
      if (onPlayClick && !hasFrames) {
        onPlayClick();
      } else {
        controller.play();
      }
    }
  }, [controller, playbackState.isPlaying, onPlayClick, hasFrames]);

  const handleStepForward = useCallback(() => {
    controller.stepForward();
  }, [controller]);

  const handleStepBackward = useCallback(() => {
    controller.stepBackward();
  }, [controller]);

  const handleReset = useCallback(() => {
    controller.reset();
  }, [controller]);

  const handleSpeedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      controller.setSpeed(parseFloat(e.target.value));
    },
    [controller]
  );

  const { isPlaying, currentFrameIndex, totalFrames, speed } = playbackState;
  const isAtStart = currentFrameIndex === 0;
  const isAtEnd = totalFrames > 0 && currentFrameIndex >= totalFrames - 1;
  const canStep = !isPlaying && totalFrames > 0;

  return (
    <div className="control-panel">
      <div className="control-panel__buttons">
        {/* Reset Button */}
        <motion.button
          className="control-btn control-btn--reset"
          onClick={handleReset}
          disabled={isAtStart && !isPlaying}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Reset to beginning"
        >
          <ResetIcon />
        </motion.button>

        {/* Step Backward Button */}
        <motion.button
          className="control-btn control-btn--step"
          onClick={handleStepBackward}
          disabled={!canStep || isAtStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Step backward"
        >
          <StepBackIcon />
        </motion.button>

        {/* Play/Pause Button */}
        <motion.button
          className="control-btn control-btn--play"
          onClick={handlePlayPause}
          disabled={totalFrames === 0 && hasFrames}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </motion.button>

        {/* Step Forward Button */}
        <motion.button
          className="control-btn control-btn--step"
          onClick={handleStepForward}
          disabled={!canStep || isAtEnd}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Step forward"
        >
          <StepForwardIcon />
        </motion.button>
      </div>

      {/* Step Counter */}
      <div className="control-panel__counter">
        <span className="counter__current">{currentFrameIndex + 1}</span>
        <span className="counter__separator">/</span>
        <span className="counter__total">{totalFrames || '-'}</span>
      </div>

      {/* Speed Slider */}
      <div className="control-panel__speed">
        <label className="speed__label">
          <span className="speed__text">Speed: {speed.toFixed(1)}x</span>
          <input
            type="range"
            className="speed__slider"
            min="0.5"
            max="2"
            step="0.1"
            value={speed}
            onChange={handleSpeedChange}
          />
        </label>
        <div className="speed__markers">
          <span>0.5x</span>
          <span>1x</span>
          <span>2x</span>
        </div>
      </div>
    </div>
  );
};

// Icon Components
const PlayIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const StepForwardIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
  </svg>
);

const StepBackIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
  </svg>
);

const ResetIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
  </svg>
);

export default ControlPanel;
