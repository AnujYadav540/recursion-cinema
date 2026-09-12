/**
 * useAnimationEvents - Custom hook for handling animation event queue
 * 
 * Manages the queue of animation events for the current frame,
 * providing timing and sequencing for Framer Motion animations.
 * 
 * _Requirements: 4.4, 8.2_
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { AnimationEvent } from '../types';
import { AnimationController } from '../engine/AnimationController';

interface UseAnimationEventsOptions {
  /** AnimationController instance */
  controller: AnimationController;
  /** Current frame index */
  currentFrameIndex: number;
}

interface UseAnimationEventsReturn {
  /** Current animation events for this frame */
  events: AnimationEvent[];
  /** Whether animations are currently running */
  isAnimating: boolean;
  /** Get events for a specific target */
  getEventsForTarget: (targetId: string) => AnimationEvent[];
  /** Check if a specific event type is active for a target */
  hasActiveEvent: (targetId: string, eventType: AnimationEvent['type']) => boolean;
  /** Mark an event as completed */
  completeEvent: (event: AnimationEvent) => void;
  /** Get animation delay for an event */
  getEventDelay: (event: AnimationEvent) => number;
  /** Get animation duration for an event */
  getEventDuration: (event: AnimationEvent) => number;
}

export function useAnimationEvents({
  controller,
  currentFrameIndex,
}: UseAnimationEventsOptions): UseAnimationEventsReturn {
  const [events, setEvents] = useState<AnimationEvent[]>([]);
  const [completedEvents, setCompletedEvents] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<number | null>(null);

  // Update events when frame changes
  useEffect(() => {
    const newEvents = controller.getEventsForFrame(currentFrameIndex);
    setEvents(newEvents);
    setCompletedEvents(new Set());
    
    if (newEvents.length > 0) {
      setIsAnimating(true);
      
      // Calculate total animation duration
      const maxEndTime = Math.max(
        ...newEvents.map((e: AnimationEvent) => e.delay + e.duration)
      );
      
      // Clear any existing timeout
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      // Set timeout to mark animations as complete
      animationTimeoutRef.current = window.setTimeout(() => {
        setIsAnimating(false);
      }, maxEndTime);
    } else {
      setIsAnimating(false);
    }

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [controller, currentFrameIndex]);

  const getEventsForTarget = useCallback(
    (targetId: string): AnimationEvent[] => {
      return events.filter(e => e.targetId === targetId);
    },
    [events]
  );

  const hasActiveEvent = useCallback(
    (targetId: string, eventType: AnimationEvent['type']): boolean => {
      return events.some(
        e => e.targetId === targetId && 
             e.type === eventType && 
             !completedEvents.has(getEventKey(e))
      );
    },
    [events, completedEvents]
  );

  const completeEvent = useCallback((event: AnimationEvent) => {
    setCompletedEvents(prev => {
      const next = new Set(prev);
      next.add(getEventKey(event));
      return next;
    });
  }, []);

  const getEventDelay = useCallback((event: AnimationEvent): number => {
    return event.delay / 1000; // Convert to seconds for Framer Motion
  }, []);

  const getEventDuration = useCallback((event: AnimationEvent): number => {
    return event.duration / 1000; // Convert to seconds for Framer Motion
  }, []);

  return {
    events,
    isAnimating,
    getEventsForTarget,
    hasActiveEvent,
    completeEvent,
    getEventDelay,
    getEventDuration,
  };
}

/**
 * Generate a unique key for an event
 */
function getEventKey(event: AnimationEvent): string {
  return `${event.type}-${event.targetId}-${event.delay}`;
}

export default useAnimationEvents;
