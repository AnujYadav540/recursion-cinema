/**
 * useScrollTracking - Hook to track which section is currently visible
 * Uses IntersectionObserver to detect visible section
 * _Requirements: 8.3_
 */
import { useState, useEffect, useCallback, useRef } from 'react';

interface Section {
  id: string;
  label: string;
}

export function useScrollTracking(sections: Section[]): {
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
} {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the entry with the highest intersection ratio
        let maxRatio = 0;
        let mostVisibleSection = activeSection;

        entries.forEach((entry) => {
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisibleSection = entry.target.id;
          }
        });

        // Only update if we found a section with significant visibility
        if (maxRatio > 0.3) {
          setActiveSection(mostVisibleSection);
        }
      },
      {
        root: null, // viewport
        rootMargin: '-10% 0px -10% 0px', // Trigger when section is in middle 80% of viewport
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      }
    );

    // Observe all sections
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [sections, activeSection]);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  }, []);

  return { activeSection, scrollToSection };
}

export default useScrollTracking;
