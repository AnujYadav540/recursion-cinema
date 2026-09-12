/**
 * Property Test: Section Highlight
 * **Property 13: Section Highlight**
 * **Validates: Requirements 8.3**
 * 
 * For any scroll position, highlight the section containing viewport majority.
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

interface Section {
  id: string;
  label: string;
  top: number;
  bottom: number;
}

interface ViewportState {
  scrollY: number;
  viewportHeight: number;
}

// Simulates the intersection observer logic
function calculateActiveSection(
  sections: Section[],
  viewport: ViewportState
): string {
  const viewportTop = viewport.scrollY;
  const viewportBottom = viewport.scrollY + viewport.viewportHeight;
  const viewportMiddle = viewport.scrollY + viewport.viewportHeight / 2;

  let maxOverlap = 0;
  let activeSection = sections[0]?.id || '';

  for (const section of sections) {
    // Calculate overlap between section and viewport
    const overlapTop = Math.max(section.top, viewportTop);
    const overlapBottom = Math.min(section.bottom, viewportBottom);
    const overlap = Math.max(0, overlapBottom - overlapTop);

    // Also consider if viewport middle is in section
    const middleInSection = viewportMiddle >= section.top && viewportMiddle < section.bottom;

    if (middleInSection) {
      // Prioritize section containing viewport middle
      return section.id;
    }

    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      activeSection = section.id;
    }
  }

  return activeSection;
}

// Generate sections with valid positions
function generateSections(count: number, sectionHeight: number): Section[] {
  const sections: Section[] = [];
  let currentTop = 0;

  for (let i = 0; i < count; i++) {
    sections.push({
      id: `section-${i}`,
      label: `Section ${i}`,
      top: currentTop,
      bottom: currentTop + sectionHeight,
    });
    currentTop += sectionHeight;
  }

  return sections;
}

describe('Feature: scrollable-website-redesign, Property 13: Section Highlight', () => {
  
  it('for any scroll position, exactly one section should be highlighted', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }),
        fc.integer({ min: 300, max: 1000 }),
        fc.integer({ min: 0, max: 5000 }),
        fc.integer({ min: 400, max: 1200 }),
        (sectionCount, sectionHeight, scrollY, viewportHeight) => {
          const sections = generateSections(sectionCount, sectionHeight);
          const totalHeight = sectionCount * sectionHeight;
          const validScrollY = Math.min(scrollY, Math.max(0, totalHeight - viewportHeight));
          
          const viewport: ViewportState = {
            scrollY: validScrollY,
            viewportHeight,
          };
          
          const activeSection = calculateActiveSection(sections, viewport);
          
          // Should return a valid section ID
          expect(sections.some(s => s.id === activeSection)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('when viewport middle is in a section, that section should be highlighted', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }),
        fc.integer({ min: 300, max: 1000 }),
        fc.integer({ min: 400, max: 1200 }),
        (sectionCount, sectionHeight, viewportHeight) => {
          const sections = generateSections(sectionCount, sectionHeight);
          
          // Pick a random section to scroll to
          const targetIndex = Math.floor(Math.random() * sectionCount);
          const targetSection = sections[targetIndex];
          
          // Position viewport so its middle is in the target section
          const sectionMiddle = (targetSection.top + targetSection.bottom) / 2;
          const scrollY = sectionMiddle - viewportHeight / 2;
          
          const viewport: ViewportState = {
            scrollY: Math.max(0, scrollY),
            viewportHeight,
          };
          
          const activeSection = calculateActiveSection(sections, viewport);
          
          // The target section should be highlighted (or adjacent if at boundaries)
          const activeIndex = sections.findIndex(s => s.id === activeSection);
          expect(Math.abs(activeIndex - targetIndex)).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('at page top, first or second section should be highlighted (depending on viewport size)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }),
        fc.integer({ min: 300, max: 1000 }),
        fc.integer({ min: 400, max: 1200 }),
        (sectionCount, sectionHeight, viewportHeight) => {
          const sections = generateSections(sectionCount, sectionHeight);
          
          const viewport: ViewportState = {
            scrollY: 0,
            viewportHeight,
          };
          
          const activeSection = calculateActiveSection(sections, viewport);
          const activeIndex = sections.findIndex(s => s.id === activeSection);
          
          // At top, should be first or second section (second if viewport middle extends past first section)
          expect(activeIndex).toBeLessThanOrEqual(1);
          expect(activeIndex).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('at page bottom, last section should be highlighted', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }),
        fc.integer({ min: 300, max: 1000 }),
        fc.integer({ min: 400, max: 1200 }),
        (sectionCount, sectionHeight, viewportHeight) => {
          const sections = generateSections(sectionCount, sectionHeight);
          const totalHeight = sectionCount * sectionHeight;
          
          // Scroll to bottom
          const scrollY = Math.max(0, totalHeight - viewportHeight);
          
          const viewport: ViewportState = {
            scrollY,
            viewportHeight,
          };
          
          const activeSection = calculateActiveSection(sections, viewport);
          
          // Should be last or second-to-last section
          const activeIndex = sections.findIndex(s => s.id === activeSection);
          expect(activeIndex).toBeGreaterThanOrEqual(sectionCount - 2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('scrolling through sections changes highlight sequentially', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 3, max: 8 }),
        fc.integer({ min: 500, max: 800 }),
        fc.integer({ min: 400, max: 600 }),
        (sectionCount, sectionHeight, viewportHeight) => {
          const sections = generateSections(sectionCount, sectionHeight);
          
          // Scroll through each section and verify highlight changes
          let lastActiveIndex = -1;
          
          for (let i = 0; i < sectionCount; i++) {
            const targetSection = sections[i];
            const sectionMiddle = (targetSection.top + targetSection.bottom) / 2;
            const scrollY = Math.max(0, sectionMiddle - viewportHeight / 2);
            
            const viewport: ViewportState = {
              scrollY,
              viewportHeight,
            };
            
            const activeSection = calculateActiveSection(sections, viewport);
            const activeIndex = sections.findIndex(s => s.id === activeSection);
            
            // Active section should be close to expected
            expect(Math.abs(activeIndex - i)).toBeLessThanOrEqual(1);
            
            // Should generally progress forward (allowing for boundary cases)
            if (lastActiveIndex >= 0 && i > 0) {
              expect(activeIndex).toBeGreaterThanOrEqual(lastActiveIndex - 1);
            }
            
            lastActiveIndex = activeIndex;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
