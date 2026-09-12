/**
 * FrameStore - Manages the collection of execution frames
 * 
 * Stores generated frames and provides navigation methods for playback.
 * Acts as the central data store for the visualization.
 */

import type { FrameObject } from '../types';

export class FrameStore {
  private frames: FrameObject[] = [];
  private currentIndex = 0;

  /**
   * Load a new set of frames (replaces existing)
   */
  setFrames(frames: FrameObject[]): void {
    this.frames = [...frames]; // Create a copy to ensure immutability
    this.currentIndex = 0;
  }

  /**
   * Get all frames
   */
  getFrames(): FrameObject[] {
    return this.frames;
  }

  /**
   * Get the current frame based on currentIndex
   */
  getCurrentFrame(): FrameObject | undefined {
    return this.frames[this.currentIndex];
  }

  /**
   * Get frame at a specific index
   */
  getFrameAt(index: number): FrameObject | undefined {
    if (index < 0 || index >= this.frames.length) {
      return undefined;
    }
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
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Set current frame index
   */
  setCurrentIndex(index: number): void {
    if (index >= 0 && index < this.frames.length) {
      this.currentIndex = index;
    }
  }

  /**
   * Move to next frame
   * @returns true if moved, false if already at end
   */
  next(): boolean {
    if (this.currentIndex < this.frames.length - 1) {
      this.currentIndex++;
      return true;
    }
    return false;
  }

  /**
   * Move to previous frame
   * @returns true if moved, false if already at start
   */
  previous(): boolean {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return true;
    }
    return false;
  }

  /**
   * Reset to first frame
   */
  reset(): void {
    this.currentIndex = 0;
  }

  /**
   * Check if at the beginning
   */
  isAtStart(): boolean {
    return this.currentIndex === 0;
  }

  /**
   * Check if at the end
   */
  isAtEnd(): boolean {
    return this.currentIndex >= this.frames.length - 1;
  }

  /**
   * Check if store has frames
   */
  hasFrames(): boolean {
    return this.frames.length > 0;
  }

  /**
   * Get frames up to current index (for building current stack state)
   */
  getFramesUpToCurrent(): FrameObject[] {
    return this.frames.slice(0, this.currentIndex + 1);
  }

  /**
   * Get the current call stack (active frames based on CALL/RETURN actions)
   * This builds the visual stack state at the current point in execution
   */
  getCurrentStack(): FrameObject[] {
    const stack: FrameObject[] = [];
    const frameMap = new Map<string, FrameObject>();

    // Process frames up to current index
    for (let i = 0; i <= this.currentIndex; i++) {
      const frame = this.frames[i];
      
      if (frame.action === 'CALL') {
        // Push to stack
        frameMap.set(frame.id, frame);
        stack.push(frame);
      } else if (frame.action === 'RETURN') {
        // Pop from stack - find the matching CALL frame
        const callFrameIndex = stack.findIndex(f => 
          f.functionName === frame.functionName && 
          f.stackDepth === frame.stackDepth
        );
        if (callFrameIndex !== -1) {
          stack.splice(callFrameIndex, 1);
        }
      }
      // CALC frames don't affect the stack structure
    }

    return stack;
  }

  /**
   * Get the maximum stack depth reached
   */
  getMaxStackDepth(): number {
    if (this.frames.length === 0) return 0;
    return Math.max(...this.frames.map(f => f.stackDepth));
  }

  /**
   * Clear all frames
   */
  clear(): void {
    this.frames = [];
    this.currentIndex = 0;
  }
}

// Export singleton instance for convenience
export const frameStore = new FrameStore();
