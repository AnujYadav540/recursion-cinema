/**
 * usePlayback - Custom hook for managing playback state
 * 
 * Provides a React-friendly interface to the AnimationController,
 * with automatic state synchronization and cleanup.
 * 
 * _Requirements: 4.4, 8.2_
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimationController } from '../engine/AnimationController';
import type { PlaybackState, FrameObject } from '../types';

interface UsePlaybackOptions {
  /** Optional external controller instance */
  controller?: AnimationController;
}

interface UsePlaybackReturn {
  /** Current playback state */
  playbackState: PlaybackState;
  /** Current frame being displayed */
  currentFrame: FrameObject | undefined;
  /** The AnimationController instance */
  controller: AnimationController;
  /** Load frames into the controller */
  loadFrames: (frames: FrameObject[]) => void;
  /** Start playback */
  play: () => void;
  /** Pause playback */
  pause: () => void;
  /** Toggle play/pause */
  togglePlayPause: () => void;
  /** Step forward one frame */
  stepForward: () => void;
  /** Step backward one frame */
  stepBackward: () => void;
  /** Reset to beginning */
  reset: () => void;
  /** Set playback speed */
  setSpeed: (speed: number) => void;
  /** Jump to specific frame */
  goToFrame: (index: number) => void;
}

export function usePlayback(options: UsePlaybackOptions = {}): UsePlaybackReturn {
  // Create or use provided controller
  const controller = useMemo(
    () => options.controller ?? new AnimationController(),
    [options.controller]
  );

  const [playbackState, setPlaybackState] = useState<PlaybackState>(() =>
    controller.getPlaybackState()
  );
  const [currentFrame, setCurrentFrame] = useState<FrameObject | undefined>(() =>
    controller.getCurrentFrame()
  );

  // Subscribe to controller events
  useEffect(() => {
    const unsubscribePlayback = controller.onPlaybackStateChange((state: PlaybackState) => {
      setPlaybackState(state);
    });

    const unsubscribeFrame = controller.onFrameChange((_: number, frame: FrameObject | undefined) => {
      setCurrentFrame(frame);
    });

    return () => {
      unsubscribePlayback();
      unsubscribeFrame();
    };
  }, [controller]);

  // Cleanup on unmount (only if we created the controller)
  useEffect(() => {
    if (!options.controller) {
      return () => controller.dispose();
    }
  }, [controller, options.controller]);

  const loadFrames = useCallback(
    (frames: FrameObject[]) => {
      controller.setFrames(frames);
    },
    [controller]
  );

  const play = useCallback(() => controller.play(), [controller]);
  const pause = useCallback(() => controller.pause(), [controller]);
  const togglePlayPause = useCallback(() => {
    if (playbackState.isPlaying) {
      controller.pause();
    } else {
      controller.play();
    }
  }, [controller, playbackState.isPlaying]);
  const stepForward = useCallback(() => controller.stepForward(), [controller]);
  const stepBackward = useCallback(() => controller.stepBackward(), [controller]);
  const reset = useCallback(() => controller.reset(), [controller]);
  const setSpeed = useCallback((speed: number) => controller.setSpeed(speed), [controller]);
  const goToFrame = useCallback((index: number) => controller.goToFrame(index), [controller]);

  return {
    playbackState,
    currentFrame,
    controller,
    loadFrames,
    play,
    pause,
    togglePlayPause,
    stepForward,
    stepBackward,
    reset,
    setSpeed,
    goToFrame,
  };
}

export default usePlayback;
