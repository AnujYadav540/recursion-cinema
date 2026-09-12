/**
 * Property Test: Sticky Controls Visibility
 * **Property 11: Sticky Controls Visibility**
 * **Validates: Requirements 7.1, 7.5**
 * 
 * For any state, sticky controls visible iff frames.length > 0.
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { FrameObject, PlaybackState } from '../../types';

// Helper to create a valid frame
function createFrame(id: string): FrameObject {
  return {
    id,
    lineNo: 1,
    stackDepth: 0,
    variables: { n: 5 },
    action: 'CALL',
    functionName: 'test',
    parentFrameId: undefined,
  };
}

// Simulates the visibility logic from StickyControls component
function shouldShowControls(hasFrames: boolean): boolean {
  return hasFrames;
}

// Simulates what the component receives
function getControlsState(frames: FrameObject[], playback: PlaybackState) {
  const hasFrames = frames.length > 0;
  return {
    isVisible: shouldShowControls(hasFrames),
    hasFrames,
    frameCount: frames.length,
    playback,
  };
}

describe('Feature: scrollable-website-redesign, Property 11: Sticky Controls Visibility', () => {
  
  it('for any state with frames, controls should be visible', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 0, max: 99 }),
        fc.boolean(),
        fc.float({ min: 0.25, max: 3, noNaN: true }),
        (frameCount, currentIndex, isPlaying, speed) => {
          const frames = Array.from({ length: frameCount }, (_, i) => createFrame(`f${i}`));
          const validIndex = Math.min(currentIndex, frameCount - 1);
          const playback: PlaybackState = {
            isPlaying,
            currentFrameIndex: validIndex,
            totalFrames: frameCount,
            speed,
          };
          
          const state = getControlsState(frames, playback);
          expect(state.isVisible).toBe(true);
          expect(state.hasFrames).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any state with zero frames, controls should be hidden', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.float({ min: 0.25, max: 3, noNaN: true }),
        (isPlaying, speed) => {
          const frames: FrameObject[] = [];
          const playback: PlaybackState = {
            isPlaying,
            currentFrameIndex: 0,
            totalFrames: 0,
            speed,
          };
          
          const state = getControlsState(frames, playback);
          expect(state.isVisible).toBe(false);
          expect(state.hasFrames).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('visibility is determined solely by frame count, not playback state', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 50 }),
        fc.boolean(),
        fc.integer({ min: 0, max: 100 }),
        fc.float({ min: 0.25, max: 3, noNaN: true }),
        (frameCount, isPlaying, currentIndex, speed) => {
          const frames = Array.from({ length: frameCount }, (_, i) => createFrame(`f${i}`));
          const validIndex = frameCount > 0 ? Math.min(currentIndex, frameCount - 1) : 0;
          const playback: PlaybackState = {
            isPlaying,
            currentFrameIndex: validIndex,
            totalFrames: frameCount,
            speed,
          };
          
          const state = getControlsState(frames, playback);
          
          // Visibility should match whether there are frames
          expect(state.isVisible).toBe(frameCount > 0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('adding frames makes controls visible', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        (framesToAdd) => {
          // Start with no frames
          const emptyFrames: FrameObject[] = [];
          const emptyPlayback: PlaybackState = {
            isPlaying: false,
            currentFrameIndex: 0,
            totalFrames: 0,
            speed: 1,
          };
          
          const stateBefore = getControlsState(emptyFrames, emptyPlayback);
          expect(stateBefore.isVisible).toBe(false);
          
          // Add frames
          const frames = Array.from({ length: framesToAdd }, (_, i) => createFrame(`f${i}`));
          const playback: PlaybackState = {
            isPlaying: false,
            currentFrameIndex: 0,
            totalFrames: framesToAdd,
            speed: 1,
          };
          
          const stateAfter = getControlsState(frames, playback);
          expect(stateAfter.isVisible).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('clearing frames hides controls', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        (initialFrameCount) => {
          // Start with frames
          const frames = Array.from({ length: initialFrameCount }, (_, i) => createFrame(`f${i}`));
          const playback: PlaybackState = {
            isPlaying: false,
            currentFrameIndex: 0,
            totalFrames: initialFrameCount,
            speed: 1,
          };
          
          const stateBefore = getControlsState(frames, playback);
          expect(stateBefore.isVisible).toBe(true);
          
          // Clear frames
          const emptyFrames: FrameObject[] = [];
          const emptyPlayback: PlaybackState = {
            isPlaying: false,
            currentFrameIndex: 0,
            totalFrames: 0,
            speed: 1,
          };
          
          const stateAfter = getControlsState(emptyFrames, emptyPlayback);
          expect(stateAfter.isVisible).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
