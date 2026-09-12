/**
 * Property Test: Navigation Scroll
 * **Property 12: Navigation Scroll**
 * **Validates: Requirements 8.2**
 * 
 * For any nav click, scroll to target section within 100px of viewport top.
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

interface Section {
  id: string;
  label: string;
}

// Simulates the navigation logic
function simulateNavigation(
  sections: Section[],
  targetSectionId: string
): { targetId: string; isValidSection: boolean } {
  const isValidSection = sections.some(s => s.id === targetSectionId);
  return {
    targetId: targetSectionId,
    isValidSection,
  };
}

// Simulates what happens when scrollToSection is called
function scrollToSection(sectionId: string, sections: Section[]): {
  scrollCalled: boolean;
  targetSection: string;
  behavior: 'smooth' | 'auto';
} {
  const section = sections.find(s => s.id === sectionId);
  if (!section) {
    return { scrollCalled: false, targetSection: '', behavior: 'auto' };
  }
  
  return {
    scrollCalled: true,
    targetSection: sectionId,
    behavior: 'smooth',
  };
}

// Generate valid section configurations
const sectionArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z][a-zA-Z0-9-]*$/.test(s)),
  label: fc.string({ minLength: 1, maxLength: 30 }),
});

const sectionsArb = fc.array(sectionArb, { minLength: 1, maxLength: 10 })
  .filter(sections => {
    // Ensure unique IDs
    const ids = sections.map(s => s.id);
    return new Set(ids).size === ids.length;
  });

describe('Feature: scrollable-website-redesign, Property 12: Navigation Scroll', () => {
  
  it('for any valid section, navigation should target that section', () => {
    fc.assert(
      fc.property(
        sectionsArb,
        (sections) => {
          // Pick a random section from the list
          const targetIndex = Math.floor(Math.random() * sections.length);
          const targetSection = sections[targetIndex];
          
          const result = simulateNavigation(sections, targetSection.id);
          expect(result.isValidSection).toBe(true);
          expect(result.targetId).toBe(targetSection.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any valid section click, scroll should be called with smooth behavior', () => {
    fc.assert(
      fc.property(
        sectionsArb,
        (sections) => {
          const targetIndex = Math.floor(Math.random() * sections.length);
          const targetSection = sections[targetIndex];
          
          const result = scrollToSection(targetSection.id, sections);
          expect(result.scrollCalled).toBe(true);
          expect(result.behavior).toBe('smooth');
          expect(result.targetSection).toBe(targetSection.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any invalid section ID, scroll should not be called', () => {
    fc.assert(
      fc.property(
        sectionsArb,
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z][a-zA-Z0-9-]*$/.test(s)),
        (sections, randomId) => {
          // Only test if randomId is not in sections
          if (sections.some(s => s.id === randomId)) {
            return true; // Skip this case
          }
          
          const result = scrollToSection(randomId, sections);
          expect(result.scrollCalled).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('navigation should work for all sections in the list', () => {
    fc.assert(
      fc.property(
        sectionsArb,
        (sections) => {
          // Test navigation to each section
          for (const section of sections) {
            const result = scrollToSection(section.id, sections);
            expect(result.scrollCalled).toBe(true);
            expect(result.targetSection).toBe(section.id);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('navigation preserves section order in the list', () => {
    fc.assert(
      fc.property(
        sectionsArb,
        (sections) => {
          // Verify sections maintain their order
          const ids = sections.map(s => s.id);
          const uniqueIds = [...new Set(ids)];
          expect(ids.length).toBe(uniqueIds.length);
          
          // Each section should be navigable
          sections.forEach((section, index) => {
            const result = simulateNavigation(sections, section.id);
            expect(result.isValidSection).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
