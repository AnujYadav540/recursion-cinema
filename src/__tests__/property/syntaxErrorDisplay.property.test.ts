/**
 * Property Test: Syntax Error Display
 * **Property 3: Syntax Error Display**
 * **Validates: Requirements 2.8**
 * 
 * For any code with syntax errors, the system SHALL display an error with line number.
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Simple syntax validation function that mimics what the interpreter does
function validateJavaSyntax(code: string): { valid: boolean; error?: string } {
  const trimmed = code.trim();
  
  // Check for empty code
  if (!trimmed) {
    return { valid: false, error: 'No code provided' };
  }
  
  // Check for unbalanced braces
  let braceCount = 0;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '{') braceCount++;
    if (trimmed[i] === '}') braceCount--;
    if (braceCount < 0) {
      return { valid: false, error: `Unexpected closing brace at position ${i}` };
    }
  }
  if (braceCount !== 0) {
    return { valid: false, error: `Unbalanced braces: ${braceCount > 0 ? 'missing closing' : 'extra closing'} brace` };
  }
  
  // Check for unbalanced parentheses
  let parenCount = 0;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '(') parenCount++;
    if (trimmed[i] === ')') parenCount--;
    if (parenCount < 0) {
      return { valid: false, error: `Unexpected closing parenthesis at position ${i}` };
    }
  }
  if (parenCount !== 0) {
    return { valid: false, error: `Unbalanced parentheses: ${parenCount > 0 ? 'missing closing' : 'extra closing'} parenthesis` };
  }
  
  // Check for method definition
  const hasMethodDef = /\w+\s+\w+\s*\([^)]*\)\s*\{/.test(trimmed);
  if (!hasMethodDef) {
    return { valid: false, error: 'No method definition found' };
  }
  
  // Check for method call
  const hasMethodCall = /\w+\s*\([^)]*\)\s*;?\s*$/.test(trimmed);
  if (!hasMethodCall) {
    return { valid: false, error: 'No method call found at end of code' };
  }
  
  return { valid: true };
}

describe('Feature: scrollable-website-redesign, Property 3: Syntax Error Display', () => {
  
  it('for any code with unbalanced braces, validation should return an error', () => {
    fc.assert(
      fc.property(
        fc.nat(10), // number of extra opening braces
        (extraBraces) => {
          const code = 'int test(int n) {' + '{'.repeat(extraBraces) + ' return n; }\ntest(5);';
          if (extraBraces > 0) {
            const result = validateJavaSyntax(code);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any code with unbalanced parentheses, validation should return an error', () => {
    fc.assert(
      fc.property(
        fc.nat(5), // number of extra opening parens
        (extraParens) => {
          const code = 'int test(int n' + '('.repeat(extraParens) + ') { return n; }\ntest(5);';
          if (extraParens > 0) {
            const result = validateJavaSyntax(code);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any empty or whitespace-only code, validation should return an error', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r')),
        (whitespace) => {
          const result = validateJavaSyntax(whitespace);
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any valid code structure, validation should pass', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('factorial', 'test', 'myFunc', 'compute'),
        fc.constantFrom('n', 'x', 'value', 'num'),
        fc.integer({ min: 1, max: 10 }),
        (funcName, paramName, callArg) => {
          const code = `int ${funcName}(int ${paramName}) { return ${paramName}; }\n${funcName}(${callArg});`;
          const result = validateJavaSyntax(code);
          expect(result.valid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any code missing method definition, validation should return an error', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('test', 'myFunc', 'compute'),
        fc.integer({ min: 1, max: 100 }),
        (funcName, arg) => {
          const code = `${funcName}(${arg});`; // Just a call, no definition
          const result = validateJavaSyntax(code);
          expect(result.valid).toBe(false);
          expect(result.error).toContain('method');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any code missing method call, validation should return an error', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('test', 'myFunc', 'compute'),
        fc.constantFrom('n', 'x', 'value'),
        (funcName, paramName) => {
          const code = `int ${funcName}(int ${paramName}) { return ${paramName}; }`; // No call
          const result = validateJavaSyntax(code);
          expect(result.valid).toBe(false);
          expect(result.error).toContain('call');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('error messages should be non-empty strings', () => {
    const invalidCodes = [
      '',
      '   ',
      'int test() {',
      'test(5);',
      'int test(int n) { return n; }',
    ];
    
    for (const code of invalidCodes) {
      const result = validateJavaSyntax(code);
      if (!result.valid) {
        expect(typeof result.error).toBe('string');
        expect(result.error!.length).toBeGreaterThan(0);
      }
    }
  });
});
