/**
 * Property-Based Tests for Syntax Error Reporting
 * 
 * Feature: recursion-cinema, Property 14: Syntax Error Reporting
 * 
 * For any Java code with syntax errors, the interpreter should return an error result
 * containing the line number and a descriptive message, without generating any frames.
 * 
 * **Validates: Requirements 5.10**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { parse } from '../../interpreter/parser';
import { tokenize } from '../../interpreter/lexer';

describe('Property 14: Syntax Error Reporting', () => {
  // ============ Generators for Invalid Java Code ============

  // Generator for code with missing semicolons
  const missingSemicolonArbitrary = fc.oneof(
    fc.constant('public class Test { public static void main() { int x = 5 } }'),
    fc.constant('public class Test { int x = 10 }'),
    fc.constant('public class Test { void foo() { return 5 } }'),
    fc.integer({ min: 1, max: 100 }).map(n => 
      `public class Test { void foo() { int x = ${n} } }`
    ),
  );

  // Generator for code with missing braces
  const missingBraceArbitrary = fc.oneof(
    fc.constant('public class Test { public static void main() { int x = 5;'),
    fc.constant('public class Test public static void main() { } }'),
    fc.constant('public class Test { void foo() { if (true) { }'),
    fc.constant('public class Test { void foo() for (int i = 0; i < 10; i++) { } }'),
  );

  // Generator for code with missing parentheses
  const missingParenArbitrary = fc.oneof(
    fc.constant('public class Test { void foo { } }'),
    fc.constant('public class Test { void foo() { if true) { } } }'),
    fc.constant('public class Test { void foo() { while x > 0) { } } }'),
    fc.constant('public class Test { void foo() { for int i = 0; i < 10; i++) { } } }'),
  );

  // Generator for code with invalid tokens
  const invalidTokenArbitrary = fc.oneof(
    fc.constant('public class Test { void foo() { int x = @; } }'),
    fc.constant('public class Test { void foo() { int x = #invalid; } }'),
    fc.constant('public class Test { void foo() { int $ = 5; } }'),
  );

  // Generator for code with incomplete expressions
  const incompleteExpressionArbitrary = fc.oneof(
    fc.constant('public class Test { void foo() { int x = ; } }'),
    fc.constant('public class Test { void foo() { int x = 5 + ; } }'),
    fc.constant('public class Test { void foo() { int x = * 5; } }'),
    fc.constant('public class Test { void foo() { int x = 5 5; } }'),
  );

  // Generator for code with invalid method declarations
  const invalidMethodArbitrary = fc.oneof(
    fc.constant('public class Test { void () { } }'),
    fc.constant('public class Test { public static main() { } }'),
    fc.constant('public class Test { int int foo() { } }'),
  );

  // Combined generator for all invalid code types
  const invalidCodeArbitrary = fc.oneof(
    missingSemicolonArbitrary,
    missingBraceArbitrary,
    missingParenArbitrary,
    invalidTokenArbitrary,
    incompleteExpressionArbitrary,
    invalidMethodArbitrary,
  );

  // Generator for valid Java code (for contrast)
  const validCodeArbitrary = fc.oneof(
    fc.constant('public class Test { }'),
    fc.constant('public class Test { public static void main() { } }'),
    fc.constant('public class Test { int x = 5; }'),
    fc.integer({ min: 1, max: 100 }).map(n => 
      `public class Test { public static int factorial(int n) { if (n <= 1) { return 1; } return n * factorial(n - 1); } }`
    ),
    fc.constant('public class Test { void foo() { int x = 5; int y = 10; int z = x + y; } }'),
  );

  // ============ Property Tests ============

  /**
   * Property: Invalid code should result in parse failure
   */
  it('should return success=false for invalid Java code', () => {
    fc.assert(
      fc.property(invalidCodeArbitrary, (code) => {
        const result = parse(code);
        return result.success === false;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Invalid code should produce at least one error
   */
  it('should produce at least one error for invalid Java code', () => {
    fc.assert(
      fc.property(invalidCodeArbitrary, (code) => {
        const result = parse(code);
        return result.errors.length > 0;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Each error should have a line number
   */
  it('should include line number in each error', () => {
    fc.assert(
      fc.property(invalidCodeArbitrary, (code) => {
        const result = parse(code);
        
        if (result.errors.length === 0) return true;
        
        return result.errors.every(error => {
          return typeof error.line === 'number' &&
                 Number.isInteger(error.line) &&
                 error.line >= 1;
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Each error should have a descriptive message
   */
  it('should include descriptive message in each error', () => {
    fc.assert(
      fc.property(invalidCodeArbitrary, (code) => {
        const result = parse(code);
        
        if (result.errors.length === 0) return true;
        
        return result.errors.every(error => {
          return typeof error.message === 'string' &&
                 error.message.length > 0;
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Invalid code should not produce an AST
   */
  it('should not produce AST for invalid Java code', () => {
    fc.assert(
      fc.property(invalidCodeArbitrary, (code) => {
        const result = parse(code);
        
        // If parsing failed, AST should be undefined
        if (!result.success) {
          return result.ast === undefined;
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Valid code should parse successfully
   */
  it('should return success=true for valid Java code', () => {
    fc.assert(
      fc.property(validCodeArbitrary, (code) => {
        const result = parse(code);
        return result.success === true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Valid code should produce no errors
   */
  it('should produce no errors for valid Java code', () => {
    fc.assert(
      fc.property(validCodeArbitrary, (code) => {
        const result = parse(code);
        return result.errors.length === 0;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Valid code should produce an AST
   */
  it('should produce AST for valid Java code', () => {
    fc.assert(
      fc.property(validCodeArbitrary, (code) => {
        const result = parse(code);
        
        if (result.success) {
          return result.ast !== undefined &&
                 result.ast.type === 'ClassDeclaration';
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Lexer errors should include line information
   */
  it('should report lexer errors with line numbers', () => {
    fc.assert(
      fc.property(invalidTokenArbitrary, (code) => {
        const lexResult = tokenize(code);
        
        if (lexResult.errors.length > 0) {
          return lexResult.errors.every(error => {
            return typeof error.line === 'number' &&
                   error.line >= 1;
          });
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Combined Property: Error reporting completeness
   */
  it('should provide complete error information for invalid code', () => {
    fc.assert(
      fc.property(invalidCodeArbitrary, (code) => {
        const result = parse(code);
        
        // Must fail
        if (result.success) return false;
        
        // Must have errors
        if (result.errors.length === 0) return false;
        
        // Each error must be complete
        return result.errors.every(error => {
          const hasLine = typeof error.line === 'number' && error.line >= 1;
          const hasMessage = typeof error.message === 'string' && error.message.length > 0;
          return hasLine && hasMessage;
        });
      }),
      { numRuns: 100 }
    );
  });
});
