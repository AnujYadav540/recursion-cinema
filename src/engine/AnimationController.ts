/**
 * AnimationController - Manages playback timing and frame advancement
 * 
 * Controls the animation playback with play/pause/step functionality,
 * speed adjustment, and frame change event emission.
 * 
 * _Requirements: 7.1, 7.2, 7.3_
 */

import type { FrameObject, AnimationEvent, PlaybackState } from '../types';

/** Callback type for frame change events */
export type FrameChangeCallback = (frameIndex: number, frame: FrameObject | undefined) => void;

/** Callback type for playback state changes */
export type PlaybackStateCallback = (state: PlaybackState) => void;

/** Default animation duration per frame in milliseconds */
const DEFAULT_FRAME_DURATION = 1000;

/** Minimum speed multiplier */
const MIN_SPEED = 0.5;

/** Maximum speed multiplier */
const MAX_SPEED = 2.0;

export class AnimationController {
  private frames: FrameObject[] = [];
  private currentFrameIndex = 0;
  private isPlaying = false;
  private speed = 1.0;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private frameChangeCallbacks: FrameChangeCallback[] = [];
  private playbackStateCallbacks: PlaybackStateCallback[] = [];

  /**
   * Load frames into the controller
   */
  setFrames(frames: FrameObject[]): void {
    this.frames = frames;
    this.currentFrameIndex = 0;
    this.isPlaying = false;
    this.cancelAnimation();
    this.notifyFrameChange();
    this.notifyPlaybackStateChange();
  }

  /**
   * Get the current playback state
   */
  getPlaybackState(): PlaybackState {
    return {
      isPlaying: this.isPlaying,
      currentFrameIndex: this.currentFrameIndex,
      totalFrames: this.frames.length,
      speed: this.speed,
    };
  }

  /**
   * Start playback from current position
   */
  play(): void {
    if (this.frames.length === 0) return;
    if (this.currentFrameIndex >= this.frames.length - 1) {
      // At end, reset to beginning
      this.currentFrameIndex = 0;
    }
    
    this.isPlaying = true;
    this.lastFrameTime = performance.now();
    this.notifyPlaybackStateChange();
    this.scheduleNextFrame();
  }

  /**
   * Pause playback
   */
  pause(): void {
    this.isPlaying = false;
    this.cancelAnimation();
    this.notifyPlaybackStateChange();
  }

  /**
   * Advance one frame (only works when paused)
   */
  stepForward(): void {
    if (this.isPlaying) return;
    if (this.frames.length === 0) return;
    
    if (this.currentFrameIndex < this.frames.length - 1) {
      this.currentFrameIndex++;
      this.notifyFrameChange();
      this.notifyPlaybackStateChange();
    }
  }

  /**
   * Go back one frame (only works when paused)
   */
  stepBackward(): void {
    if (this.isPlaying) return;
    if (this.frames.length === 0) return;
    
    if (this.currentFrameIndex > 0) {
      this.currentFrameIndex--;
      this.notifyFrameChange();
      this.notifyPlaybackStateChange();
    }
  }

  /**
   * Reset to beginning
   */
  reset(): void {
    this.isPlaying = false;
    this.currentFrameIndex = 0;
    this.cancelAnimation();
    this.notifyFrameChange();
    this.notifyPlaybackStateChange();
  }

  /**
   * Set playback speed (0.5 to 2.0)
   */
  setSpeed(speed: number): void {
    this.speed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, speed));
    this.notifyPlaybackStateChange();
  }

  /**
   * Get current frame
   */
  getCurrentFrame(): FrameObject | undefined {
    return this.frames[this.currentFrameIndex];
  }

  /**
   * Get frame at specific index
   */
  getFrameAt(index: number): FrameObject | undefined {
    return this.frames[index];
  }

  /**
   * Get total number of frames
   */
  getTotalFrames(): number {
    return this.frames.length;
  }

  /**
   * Get current frame index
   */
  getCurrentFrameIndex(): number {
    return this.currentFrameIndex;
  }

  /**
   * Jump to a specific frame index
   */
  goToFrame(index: number): void {
    if (index < 0 || index >= this.frames.length) return;
    
    this.currentFrameIndex = index;
    this.notifyFrameChange();
    this.notifyPlaybackStateChange();
  }

  /**
   * Get animation events for the current frame
   */
  getEventsForFrame(frameIndex: number): AnimationEvent[] {
    const frame = this.frames[frameIndex];
    if (!frame) return [];

    const events: AnimationEvent[] = [];
    const baseDuration = DEFAULT_FRAME_DURATION / this.speed;

    switch (frame.action) {
      case 'CALL':
        events.push({
          type: 'CARD_ENTER',
          targetId: frame.id,
          duration: baseDuration * 0.5,
          delay: 0,
          payload: { variables: frame.variables, functionName: frame.functionName },
        });
        // Freeze parent cards
        if (frame.parentFrameId) {
          events.push({
            type: 'CARD_FREEZE',
            targetId: frame.parentFrameId,
            duration: baseDuration * 0.3,
            delay: 0,
          });
        }
        break;

      case 'RETURN':
        // Glow effect for base case (deepest frame)
        const isBaseCase = this.isBaseCaseReturn(frameIndex);
        if (isBaseCase) {
          events.push({
            type: 'CARD_GLOW',
            targetId: frame.id,
            duration: baseDuration * 0.3,
            delay: 0,
            payload: { color: 'green' },
          });
        }
        // Orb travel to parent
        if (frame.parentFrameId && frame.returnValue !== undefined) {
          events.push({
            type: 'ORB_TRAVEL',
            targetId: frame.id,
            duration: baseDuration * 0.4,
            delay: baseDuration * 0.3,
            payload: { 
              returnValue: frame.returnValue, 
              targetFrameId: frame.parentFrameId 
            },
          });
        }
        // Card exit
        events.push({
          type: 'CARD_EXIT',
          targetId: frame.id,
          duration: baseDuration * 0.3,
          delay: baseDuration * 0.7,
        });
        break;
    }

    return events;
  }

  /**
   * Subscribe to frame change events
   */
  onFrameChange(callback: FrameChangeCallback): () => void {
    this.frameChangeCallbacks.push(callback);
    return () => {
      const index = this.frameChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.frameChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to playback state changes
   */
  onPlaybackStateChange(callback: PlaybackStateCallback): () => void {
    this.playbackStateCallbacks.push(callback);
    return () => {
      const index = this.playbackStateCallbacks.indexOf(callback);
      if (index > -1) {
        this.playbackStateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.cancelAnimation();
    this.frameChangeCallbacks = [];
    this.playbackStateCallbacks = [];
  }

  // Private methods

  private scheduleNextFrame(): void {
    if (!this.isPlaying) return;

    this.animationFrameId = requestAnimationFrame((currentTime) => {
      const elapsed = currentTime - this.lastFrameTime;
      const frameDuration = DEFAULT_FRAME_DURATION / this.speed;

      if (elapsed >= frameDuration) {
        this.advanceFrame();
        this.lastFrameTime = currentTime;
      }

      if (this.isPlaying) {
        this.scheduleNextFrame();
      }
    });
  }

  private advanceFrame(): void {
    if (this.currentFrameIndex < this.frames.length - 1) {
      this.currentFrameIndex++;
      this.notifyFrameChange();
      this.notifyPlaybackStateChange();
    } else {
      // Reached end, stop playing
      this.isPlaying = false;
      this.notifyPlaybackStateChange();
    }
  }

  private cancelAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private notifyFrameChange(): void {
    const frame = this.getCurrentFrame();
    for (const callback of this.frameChangeCallbacks) {
      callback(this.currentFrameIndex, frame);
    }
  }

  private notifyPlaybackStateChange(): void {
    const state = this.getPlaybackState();
    for (const callback of this.playbackStateCallbacks) {
      callback(state);
    }
  }

  private isBaseCaseReturn(frameIndex: number): boolean {
    const frame = this.frames[frameIndex];
    if (!frame || frame.action !== 'RETURN') return false;

    // Find the maximum stack depth reached before this return
    let maxDepth = 0;
    for (let i = 0; i < frameIndex; i++) {
      if (this.frames[i].action === 'CALL') {
        maxDepth = Math.max(maxDepth, this.frames[i].stackDepth);
      }
    }

    // This is a base case if it's returning from the deepest level
    return frame.stackDepth === maxDepth;
  }
}

// Export singleton instance for convenience
export const animationController = new AnimationController();

// Default export for compatibility
export default AnimationController;
