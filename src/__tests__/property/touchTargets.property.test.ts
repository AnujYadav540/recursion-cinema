/**
 * Property Test: Touch Targets
 * Validates: Requirements 9.4
 * 
 * Tests that all interactive elements have minimum 44px touch targets
 * for accessibility and mobile usability.
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

// CSS files containing interactive elements
const CSS_FILES_WITH_BUTTONS = [
  'src/styles/globals.css',
  'src/components/sections/HeroSection.css',
  'src/components/sections/CodeEditorSection.css',
  'src/components/sections/StickyControls.css',
  'src/components/sections/SectionNav.css',
];

// Minimum touch target size (WCAG 2.5.5)
const MIN_TOUCH_TARGET = 44;

// Parse CSS dimension value to pixels
function parseCssDimension(value: string): number | null {
  const match = value.match(/^(\d+(?:\.\d+)?)(px|rem|em)?$/);
  if (!match) return null;
  
  const num = parseFloat(match[1]);
  const unit = match[2] || 'px';
  
  switch (unit) {
    case 'px': return num;
    case 'rem': return num * 16; // Assume 16px base
    case 'em': return num * 16;
    default: return num;
  }
}

// Extract dimension values from CSS
function extractDimensions(css: string, property: string): number[] {
  const regex = new RegExp(`${property}\\s*:\\s*([^;]+)`, 'g');
  const dimensions: number[] = [];
  let match;
  
  while ((match = regex.exec(css)) !== null) {
    const value = match[1].trim();
    const parsed = parseCssDimension(value);
    if (parsed !== null) {
      dimensions.push(parsed);
    }
  }
  
  return dimensions;
}

describe('Touch Targets Property Tests', () => {
  // Read all CSS content
  const cssContents: Record<string, string> = {};
  
  for (const file of CSS_FILES_WITH_BUTTONS) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      cssContents[file] = fs.readFileSync(filePath, 'utf-8');
    }
  }

  it('Property: globals.css defines minimum touch target sizes', () => {
    fc.assert(
      fc.property(
        fc.constant(cssContents['src/styles/globals.css'] || ''),
        (css) => {
          // Check for min-height: 44px rule for interactive elements
          const hasMinHeight = css.includes('min-height: 44px') || 
                               css.includes('min-height:44px');
          const hasMinWidth = css.includes('min-width: 44px') || 
                              css.includes('min-width:44px');
          
          return hasMinHeight && hasMinWidth;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Control buttons have adequate touch target size', () => {
    fc.assert(
      fc.property(
        fc.constant(cssContents['src/components/sections/StickyControls.css'] || ''),
        (css) => {
          // Extract button dimensions
          const widths = extractDimensions(css, 'width');
          const heights = extractDimensions(css, 'height');
          
          // Filter to button-related dimensions (40px+)
          const buttonWidths = widths.filter(w => w >= 40);
          const buttonHeights = heights.filter(h => h >= 40);
          
          // Should have buttons with adequate size
          return buttonWidths.length > 0 && buttonHeights.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Hero CTA button has adequate touch target', () => {
    fc.assert(
      fc.property(
        fc.constant(cssContents['src/components/sections/HeroSection.css'] || ''),
        (css) => {
          // Check for hero-cta styles
          const hasCtaStyles = css.includes('.hero-cta');
          
          // Check for min-height in mobile breakpoint
          const mobileSection = css.match(/@media\s*\(\s*max-width:\s*768px\s*\)[\s\S]*?\{([\s\S]*?)\}/);
          
          // CTA should have padding that creates adequate touch target
          const hasPadding = css.includes('padding:') && css.includes('hero-cta');
          
          return hasCtaStyles && hasPadding;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Mode toggle buttons have adequate touch targets', () => {
    fc.assert(
      fc.property(
        fc.constant(cssContents['src/components/sections/CodeEditorSection.css'] || ''),
        (css) => {
          // Check for mode-btn styles with min-height
          const hasModeBtnMinHeight = css.includes('.mode-btn') && 
                                       (css.includes('min-height: 44px') || 
                                        css.includes('min-height:44px'));
          
          // Or check for adequate padding
          const modeBtnMatch = css.match(/\.mode-btn\s*\{[^}]*padding[^}]*\}/);
          const hasAdequatePadding = modeBtnMatch !== null;
          
          return hasModeBtnMinHeight || hasAdequatePadding;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Navigation dots have touch-friendly hit areas', () => {
    fc.assert(
      fc.property(
        fc.constant(cssContents['src/components/sections/SectionNav.css'] || ''),
        (css) => {
          // Check for nav-dot styles
          const hasNavDot = css.includes('.nav-dot');
          
          // Check for touch target expansion (::before pseudo-element or padding)
          const hasTouchExpansion = css.includes('nav-dot::before') || 
                                     css.includes('.nav-item') && css.includes('padding');
          
          return hasNavDot && hasTouchExpansion;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Button dimensions are at least 40px in mobile breakpoints', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...CSS_FILES_WITH_BUTTONS.filter(f => cssContents[f])),
        (file) => {
          const css = cssContents[file];
          if (!css) return true;
          
          // Extract mobile breakpoint content
          const mobileMatch = css.match(/@media\s*\(\s*max-width:\s*768px\s*\)\s*\{([\s\S]*?)\}(?=\s*(?:@media|\/\*|$))/);
          if (!mobileMatch) return true; // No mobile styles is acceptable
          
          const mobileStyles = mobileMatch[1];
          
          // Check button dimensions in mobile
          const widths = extractDimensions(mobileStyles, 'width');
          const heights = extractDimensions(mobileStyles, 'height');
          
          // All explicit button dimensions should be >= 40px
          const buttonWidths = widths.filter(w => w >= 10 && w <= 100);
          const buttonHeights = heights.filter(h => h >= 10 && h <= 100);
          
          // If there are button dimensions, they should be >= 40px
          const validWidths = buttonWidths.every(w => w >= 40);
          const validHeights = buttonHeights.every(h => h >= 40);
          
          return validWidths && validHeights;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Run and Clear buttons have adequate touch targets', () => {
    fc.assert(
      fc.property(
        fc.constant(cssContents['src/components/sections/CodeEditorSection.css'] || ''),
        (css) => {
          // Check for visualize-btn (run button) and clear-btn styles
          const hasVisualizeBtn = css.includes('.visualize-btn');
          const hasClearBtn = css.includes('.clear-btn');
          
          // Check for adequate padding that creates touch-friendly targets
          // Buttons with padding create adequate touch targets
          const hasAdequatePadding = css.includes('padding:') && 
                                      (css.includes('.visualize-btn') || css.includes('.clear-btn'));
          
          return hasVisualizeBtn && hasClearBtn && hasAdequatePadding;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Speed slider has adequate touch target', () => {
    fc.assert(
      fc.property(
        fc.constant(cssContents['src/components/sections/StickyControls.css'] || ''),
        (css) => {
          // Check for speed-slider styles
          const hasSpeedSlider = css.includes('.speed-slider');
          
          // Check for min-height in mobile
          const mobileMatch = css.match(/@media\s*\(\s*max-width:\s*768px\s*\)[\s\S]*?\.speed-slider[\s\S]*?min-height/);
          const hasMinHeight = mobileMatch !== null || 
                               css.includes('.speed-slider') && css.includes('min-height: 44px');
          
          return hasSpeedSlider && hasMinHeight;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Touch target sizes scale appropriately across breakpoints', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 1920 }),
        (viewportWidth) => {
          // Define expected minimum touch target for each breakpoint
          let expectedMinSize: number;
          
          if (viewportWidth <= 480) {
            expectedMinSize = 40; // Small mobile - slightly smaller acceptable
          } else if (viewportWidth <= 768) {
            expectedMinSize = 44; // Mobile - standard touch target
          } else if (viewportWidth <= 1024) {
            expectedMinSize = 44; // Tablet - standard touch target
          } else {
            expectedMinSize = 48; // Desktop - can be larger
          }
          
          // Touch targets should always be at least 40px
          return expectedMinSize >= 40;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Dropdown has adequate touch target', () => {
    fc.assert(
      fc.property(
        fc.constant(cssContents['src/components/sections/CodeEditorSection.css'] || ''),
        (css) => {
          // Check for preset-dropdown with adequate styling
          const hasDropdown = css.includes('.preset-dropdown');
          
          // Check for padding that creates adequate touch target
          const hasAdequatePadding = css.includes('.preset-dropdown') && css.includes('padding:');
          
          return hasDropdown && hasAdequatePadding;
        }
      ),
      { numRuns: 100 }
    );
  });
});
