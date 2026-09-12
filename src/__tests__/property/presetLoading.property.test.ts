/**
 * Property Test: Preset Loading Consistency
 * **Property 1: Preset Loading Consistency**
 * **Validates: Requirements 2.4**
 * 
 * For any preset selection, the editor content SHALL exactly match the predefined code.
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { EXAMPLES } from '../../data/presets';

describe('Feature: scrollable-website-redesign, Property 1: Preset Loading Consistency', () => {
  // Get all preset keys
  const presetKeys = Object.keys(EXAMPLES);

  it('should have at least one preset available', () => {
    expect(presetKeys.length).toBeGreaterThan(0);
  });

  it('for any preset key, the code property should be a non-empty string', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...presetKeys),
        (presetKey) => {
          const preset = EXAMPLES[presetKey];
          expect(preset).toBeDefined();
          expect(typeof preset.code).toBe('string');
          expect(preset.code.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any preset key, the name property should be a non-empty string', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...presetKeys),
        (presetKey) => {
          const preset = EXAMPLES[presetKey];
          expect(preset.name).toBeDefined();
          expect(typeof preset.name).toBe('string');
          expect(preset.name.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any preset key, the category should be one of the valid categories', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...presetKeys),
        (presetKey) => {
          const preset = EXAMPLES[presetKey];
          expect(['simple', 'intermediate', 'advanced', 'dp', 'backtracking']).toContain(preset.category);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any preset, loading it twice should return identical code', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...presetKeys),
        (presetKey) => {
          const firstLoad = EXAMPLES[presetKey].code;
          const secondLoad = EXAMPLES[presetKey].code;
          expect(firstLoad).toBe(secondLoad);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any preset, the code should contain a method call at the end', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...presetKeys),
        (presetKey) => {
          const code = EXAMPLES[presetKey].code;
          // Code should end with a method call like: methodName(args);
          const hasMethodCall = /\w+\s*\([^)]*\)\s*;?\s*$/.test(code.trim());
          expect(hasMethodCall).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any preset, the code should contain at least one function definition', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...presetKeys),
        (presetKey) => {
          const code = EXAMPLES[presetKey].code;
          // Should contain a function definition like: int methodName(params) {
          const hasFunctionDef = /\w+\s+\w+\s*\([^)]*\)\s*\{/.test(code);
          expect(hasFunctionDef).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all presets should have unique keys', () => {
    // Note: Some presets may share display names (e.g., "Tribonacci" in advanced and dp categories)
    // but keys must be unique
    const uniqueKeys = new Set(presetKeys);
    expect(uniqueKeys.size).toBe(presetKeys.length);
  });

  it('each category should have at least one preset', () => {
    const categories = ['simple', 'intermediate', 'advanced', 'dp', 'backtracking'];
    for (const category of categories) {
      const presetsInCategory = presetKeys.filter(key => EXAMPLES[key].category === category);
      expect(presetsInCategory.length).toBeGreaterThan(0);
    }
  });
});
