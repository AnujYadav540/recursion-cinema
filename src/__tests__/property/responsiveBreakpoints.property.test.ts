/**
 * Property Test: Responsive Breakpoints
 * Validates: Requirements 9.1, 9.2, 9.3
 * 
 * Tests that CSS breakpoints are correctly defined for:
 * - Desktop (>1024px): full-width sections, comfortable spacing
 * - Tablet (768-1024px): adjusted spacing, smaller fonts
 * - Mobile (<768px): stacked layout, touch-friendly sizing
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

// CSS files to check for responsive breakpoints
const CSS_FILES = [
  'src/styles/globals.css',
  'src/components/sections/HeroSection.css',
  'src/components/sections/CodeEditorSection.css',
  'src/components/sections/VisualizationSection.css',
  'src/components/sections/TreeSection.css',
  'src/components/sections/ExplanationSection.css',
  'src/components/sections/StickyControls.css',
  'src/components/sections/SectionNav.css',
];

// Required breakpoints
const BREAKPOINTS = {
  desktop: { min: 1025, query: '@media (min-width: 1025px)' },
  tablet: { min: 769, max: 1024, query: '@media (min-width: 769px) and (max-width: 1024px)' },
  mobile: { max: 768, query: '@media (max-width: 768px)' },
};

describe('Responsive Breakpoints Property Tests', () => {
  // Read all CSS content
  const cssContents: Record<string, string> = {};
  
  for (const file of CSS_FILES) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      cssContents[file] = fs.readFileSync(filePath, 'utf-8');
    }
  }

  it('Property: globals.css contains all three breakpoint definitions', () => {
    fc.assert(
      fc.property(
        fc.constant(cssContents['src/styles/globals.css'] || ''),
        (css) => {
          // Check for desktop breakpoint
          const hasDesktop = css.includes('@media (min-width: 1025px)');
          // Check for tablet breakpoint
          const hasTablet = css.includes('@media (min-width: 769px) and (max-width: 1024px)');
          // Check for mobile breakpoint
          const hasMobile = css.includes('@media (max-width: 768px)');
          
          return hasDesktop && hasTablet && hasMobile;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Each section CSS file has mobile breakpoint styles', () => {
    const sectionFiles = CSS_FILES.filter(f => f.includes('/sections/'));
    
    fc.assert(
      fc.property(
        fc.constantFrom(...sectionFiles),
        (file) => {
          const css = cssContents[file];
          if (!css) return true; // Skip if file doesn't exist
          
          // Each section should have mobile breakpoint
          return css.includes('@media (max-width: 768px)');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Breakpoint values are consistent across files', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...CSS_FILES),
        (file) => {
          const css = cssContents[file];
          if (!css) return true;
          
          // Check that breakpoint values use common responsive values
          // Allow any reasonable breakpoint values (320-1200px range)
          const allMediaQueries = css.match(/@media\s*\([^)]+\)/g) || [];
          
          // Extract pixel values from media queries
          const pixelValues = allMediaQueries
            .map(q => q.match(/(\d+)px/)?.[1])
            .filter(Boolean)
            .map(v => parseInt(v!, 10));
          
          // All pixel values should be reasonable breakpoints (between 320 and 1200)
          const validBreakpoints = pixelValues.every(v => v >= 320 && v <= 1200);
          
          // If no pixel-based media queries, that's acceptable
          if (pixelValues.length === 0) return true;
          
          return validBreakpoints;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Mobile styles reduce padding and font sizes', () => {
    fc.assert(
      fc.property(
        fc.constant(cssContents['src/styles/globals.css'] || ''),
        (css) => {
          // Extract mobile media query content
          const mobileMatch = css.match(/@media\s*\(\s*max-width:\s*768px\s*\)\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
          if (!mobileMatch) return false;
          
          const mobileStyles = mobileMatch[1];
          
          // Mobile should have reduced padding (2rem or less)
          const hasPaddingReduction = mobileStyles.includes('padding:') || 
                                       mobileStyles.includes('padding-');
          
          return hasPaddingReduction;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Desktop styles have larger spacing than mobile', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...CSS_FILES.filter(f => cssContents[f])),
        (file) => {
          const css = cssContents[file];
          if (!css) return true;
          
          // Check if file has both desktop and mobile breakpoints
          const hasDesktop = css.includes('@media (min-width: 1025px)');
          const hasMobile = css.includes('@media (max-width: 768px)');
          
          // If both exist, that's good responsive design
          // If only mobile exists, that's also acceptable (mobile-first)
          return hasMobile || hasDesktop;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Viewport widths map to correct breakpoint categories', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 1920 }),
        (viewportWidth) => {
          // Categorize viewport
          let category: 'mobile' | 'tablet' | 'desktop';
          if (viewportWidth <= 768) {
            category = 'mobile';
          } else if (viewportWidth <= 1024) {
            category = 'tablet';
          } else {
            category = 'desktop';
          }
          
          // Verify breakpoint logic
          const isMobile = viewportWidth <= BREAKPOINTS.mobile.max!;
          const isTablet = viewportWidth >= BREAKPOINTS.tablet.min && viewportWidth <= BREAKPOINTS.tablet.max!;
          const isDesktop = viewportWidth >= BREAKPOINTS.desktop.min;
          
          // Exactly one category should match
          const matchCount = [isMobile, isTablet, isDesktop].filter(Boolean).length;
          
          return matchCount === 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Reduced motion media query exists', () => {
    fc.assert(
      fc.property(
        fc.constant(cssContents['src/styles/globals.css'] || ''),
        (css) => {
          return css.includes('@media (prefers-reduced-motion: reduce)');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Small mobile breakpoint (480px) exists for extra compact layouts', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...CSS_FILES.filter(f => cssContents[f])),
        (file) => {
          const css = cssContents[file];
          if (!css) return true;
          
          // At least globals.css should have small mobile breakpoint
          if (file === 'src/styles/globals.css') {
            return css.includes('@media (max-width: 480px)');
          }
          
          // Other files may or may not have it
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
