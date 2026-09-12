/**
 * StepGenerator - The brain of Recursion Cinema
 * 
 * Interprets Java recursive code and generates Frame_Objects for visualization.
 * Now uses the full Java interpreter for accurate execution.
 * 
 * Enhanced with robust error handling:
 * - Empty/invalid code detection
 * - Infinite recursion detection (capped at 500 frames)
 * - Stack overflow simulation (capped at 100 depth)
 * - Graceful fallbacks for animation failures
 * - User-friendly error messages with line numbers
 * 
 * _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.10_
 */

import type { FrameObject, ValidationResult, GenerationResult } from '../types';
import { interpret, type InterpretResult } from '../interpreter';

/** Error severity levels */
export type ErrorSeverity = 'error' | 'warning' | 'info';

/** Structured error message */
export interface StepGeneratorError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  suggestion?: string;
  line?: number;
}

/** Error codes for programmatic handling */
export const ERROR_CODES = {
  EMPTY_CODE: 'EMPTY_CODE',
  NO_FUNCTION: 'NO_FUNCTION',
  INFINITE_RECURSION: 'INFINITE_RECURSION',
  STACK_OVERFLOW: 'STACK_OVERFLOW',
  INVALID_ARGUMENT: 'INVALID_ARGUMENT',
  UNSUPPORTED_PATTERN: 'UNSUPPORTED_PATTERN',
  PARSE_ERROR: 'PARSE_ERROR',
  NEGATIVE_ARGUMENT: 'NEGATIVE_ARGUMENT',
  LARGE_ARGUMENT: 'LARGE_ARGUMENT',
  RUNTIME_ERROR: 'RUNTIME_ERROR',
  METHOD_NOT_FOUND: 'METHOD_NOT_FOUND',
} as const;

/** Error messages for user-friendly display */
export const ERROR_MESSAGES: Record<string, StepGeneratorError> = {
  EMPTY_CODE: {
    code: ERROR_CODES.EMPTY_CODE,
    message: 'Please enter some code to visualize.',
    severity: 'error',
    suggestion: 'Try loading an example from the dropdown menu.',
  },
  NO_FUNCTION: {
    code: ERROR_CODES.NO_FUNCTION,
    message: 'No function call detected.',
    severity: 'error',
    suggestion: 'Add a function call like factorial(5) or fib(6) at the end of your code.',
  },
  INFINITE_RECURSION: {
    code: ERROR_CODES.INFINITE_RECURSION,
    message: 'Possible infinite recursion detected. Visualization capped at 500 frames.',
    severity: 'warning',
    suggestion: 'Check that your base case is reachable and terminates the recursion.',
  },
  STACK_OVERFLOW: {
    code: ERROR_CODES.STACK_OVERFLOW,
    message: 'Stack depth exceeded 100 levels.',
    severity: 'warning',
    suggestion: 'This may indicate infinite recursion or a very deep call tree. Try a smaller input.',
  },
  INVALID_ARGUMENT: {
    code: ERROR_CODES.INVALID_ARGUMENT,
    message: 'Could not parse the function argument.',
    severity: 'warning',
    suggestion: 'Using default value of 5. Make sure your function call has a numeric argument.',
  },
  UNSUPPORTED_PATTERN: {
    code: ERROR_CODES.UNSUPPORTED_PATTERN,
    message: 'Pattern not recognized.',
    severity: 'info',
    suggestion: 'Using generic recursion visualization. Supported patterns: factorial, fibonacci, tree traversal.',
  },
  PARSE_ERROR: {
    code: ERROR_CODES.PARSE_ERROR,
    message: 'Failed to parse the code.',
    severity: 'error',
    suggestion: 'Check for syntax errors in your Java code.',
  },
  NEGATIVE_ARGUMENT: {
    code: ERROR_CODES.NEGATIVE_ARGUMENT,
    message: 'Negative argument detected.',
    severity: 'warning',
    suggestion: 'Using 0 instead. Recursive functions typically expect non-negative inputs.',
  },
  LARGE_ARGUMENT: {
    code: ERROR_CODES.LARGE_ARGUMENT,
    message: 'Argument is too large for visualization.',
    severity: 'warning',
    suggestion: 'Clamping to 20 for performance. Large values create too many frames.',
  },
  RUNTIME_ERROR: {
    code: ERROR_CODES.RUNTIME_ERROR,
    message: 'Runtime error during execution.',
    severity: 'error',
    suggestion: 'Check for issues like division by zero or array index out of bounds.',
  },
  METHOD_NOT_FOUND: {
    code: ERROR_CODES.METHOD_NOT_FOUND,
    message: 'Entry point method not found.',
    severity: 'error',
    suggestion: 'Make sure your code contains the method you want to visualize.',
  },
};

export class StepGenerator {
  private warnings: string[] = [];
  private errors: StepGeneratorError[] = [];
  private hitFrameLimit = false;
  private hitDepthLimit = false;

  /**
   * Reset internal state before generating new frames
   */
  private resetState(): void {
    this.warnings = [];
    this.errors = [];
    this.hitFrameLimit = false;
    this.hitDepthLimit = false;
  }

  /**
   * Add an error to the error list
   */
  private addError(errorKey: keyof typeof ERROR_MESSAGES, line?: number): void {
    const error = { ...ERROR_MESSAGES[errorKey] };
    if (line !== undefined) {
      error.line = line;
      error.message = `Line ${line}: ${error.message}`;
    }
    if (!this.errors.some(e => e.code === error.code)) {
      this.errors.push(error);
    }
  }

  /**
   * Extract entry point method name and arguments from code
   * Looks for patterns like: methodName(arg1, arg2, ...)
   */
  private extractEntryPoint(code: string): { methodName: string; args: (number | string | boolean | null | any[])[] } | null {
    // Look for method definitions to find the main recursive method
    const methodMatch = code.match(/public\s+static\s+\w+\s+(\w+)\s*\(/);
    if (!methodMatch) {
      return null;
    }

    const methodName = methodMatch[1];
    
    // Look for a call to this method at the end of the code or in comments
    // Pattern: methodName(args) or // methodName(args)
    const callPattern = new RegExp(`${methodName}\\s*\\(([^)]*)\\)`, 'g');
    const matches = [...code.matchAll(callPattern)];
    
    if (matches.length === 0) {
      // Default to calling with a reasonable default
      return { methodName, args: [5] };
    }

    // Use the last match (likely the intended call)
    const lastMatch = matches[matches.length - 1];
    const argsStr = lastMatch[1].trim();
    
    if (!argsStr) {
      return { methodName, args: [] };
    }

    // Parse arguments
    const args = this.parseArguments(argsStr);
    return { methodName, args };
  }

  /**
   * Parse argument string into array of values
   */
  private parseArguments(argsStr: string): (number | string | boolean | null | any[])[] {
    const args: (number | string | boolean | null | any[])[] = [];
    
    // Handle array literals like {1, 2, 3} or new int[]{1, 2, 3}
    if (argsStr.includes('{')) {
      const arrayMatch = argsStr.match(/\{([^}]*)\}/);
      if (arrayMatch) {
        const elements = arrayMatch[1].split(',').map(s => {
          const trimmed = s.trim();
          const num = parseInt(trimmed, 10);
          return isNaN(num) ? trimmed : num;
        });
        args.push(elements);
        
        // Check for additional args after the array
        const afterArray = argsStr.substring(argsStr.indexOf('}') + 1);
        if (afterArray.includes(',')) {
          const moreArgs = afterArray.split(',').slice(1);
          for (const arg of moreArgs) {
            const parsed = this.parseSingleArg(arg.trim());
            if (parsed !== undefined) {
              args.push(parsed);
            }
          }
        }
        return args;
      }
    }

    // Handle simple comma-separated args
    const parts = argsStr.split(',');
    for (const part of parts) {
      const parsed = this.parseSingleArg(part.trim());
      if (parsed !== undefined) {
        args.push(parsed);
      }
    }

    return args;
  }

  /**
   * Parse a single argument value
   */
  private parseSingleArg(arg: string): number | string | boolean | null | undefined {
    if (!arg) return undefined;
    
    // Boolean
    if (arg === 'true') return true;
    if (arg === 'false') return false;
    if (arg === 'null') return null;
    
    // Number
    const num = parseInt(arg, 10);
    if (!isNaN(num)) {
      // Validate argument range
      if (num < 0) {
        this.addError('NEGATIVE_ARGUMENT');
        return 0;
      }
      if (num > 20) {
        this.addError('LARGE_ARGUMENT');
        return 20;
      }
      return num;
    }
    
    // String (remove quotes)
    if ((arg.startsWith('"') && arg.endsWith('"')) || 
        (arg.startsWith("'") && arg.endsWith("'"))) {
      return arg.slice(1, -1);
    }
    
    return arg;
  }

  /**
   * Generate all execution frames from Java code
   * Returns a GenerationResult with frames, errors, and warnings
   */
  generateFrames(javaCode: string): FrameObject[] {
    this.resetState();
    
    const validation = this.validateCode(javaCode);
    
    if (!validation.isValid) {
      console.warn('StepGenerator validation failed:', validation.errors);
      return [];
    }

    // Extract entry point
    const entryPoint = this.extractEntryPoint(javaCode);
    if (!entryPoint) {
      this.addError('NO_FUNCTION');
      return [];
    }

    // Use the interpreter
    let result: InterpretResult;
    try {
      result = interpret(javaCode, entryPoint.methodName, entryPoint.args);
    } catch (error) {
      console.error('StepGenerator interpreter error:', error);
      this.addError('PARSE_ERROR');
      return [];
    }

    // Handle interpreter errors
    if (!result.success) {
      for (const err of result.errors) {
        this.errors.push({
          code: ERROR_CODES.PARSE_ERROR,
          message: err.message,
          severity: 'error',
          line: err.line,
          suggestion: 'Check your Java syntax.',
        });
      }
      return [];
    }

    // Check for truncation
    if (result.wasTruncated) {
      this.hitFrameLimit = true;
      this.addError('INFINITE_RECURSION');
    }

    return result.frames;
  }

  /**
   * Generate frames with full result including errors and warnings
   * This is the preferred method for UI integration
   */
  generateFramesWithResult(javaCode: string): GenerationResult {
    const frames = this.generateFrames(javaCode);
    
    return {
      frames,
      errors: this.getErrors(),
      warnings: this.getWarnings(),
      isSuccess: frames.length > 0 || this.errors.every(e => e.severity !== 'error'),
      wasTruncated: this.hitFrameLimit || this.hitDepthLimit,
    };
  }

  /**
   * Get any warnings generated during frame generation
   */
  getWarnings(): string[] {
    return [...this.warnings];
  }

  /**
   * Get structured errors from the last generation
   */
  getErrors(): StepGeneratorError[] {
    return [...this.errors];
  }

  /**
   * Check if the last generation was truncated due to limits
   */
  wasTruncated(): boolean {
    return this.hitFrameLimit || this.hitDepthLimit;
  }

  /**
   * Validate if code contains supported recursive patterns
   */
  validateCode(javaCode: string): ValidationResult {
    const errors: string[] = [];
    
    // Check for empty input
    if (!javaCode || javaCode.trim().length === 0) {
      this.addError('EMPTY_CODE');
      return { 
        isValid: false, 
        errors: [ERROR_MESSAGES.EMPTY_CODE.message] 
      };
    }

    // Check for basic class structure
    const hasClass = /class\s+\w+/.test(javaCode);
    if (!hasClass) {
      errors.push('Code must contain a class definition.');
    }

    // Check for method definition
    const hasMethod = /public\s+static\s+\w+\s+\w+\s*\(/.test(javaCode);
    if (!hasMethod) {
      this.addError('NO_FUNCTION');
      errors.push(ERROR_MESSAGES.NO_FUNCTION.message);
    }

    // Detect pattern
    const detectedPattern = this.detectPattern(javaCode);

    return {
      isValid: errors.length === 0,
      errors,
      detectedPattern,
    };
  }

  /**
   * Detect which recursive pattern the code matches
   */
  private detectPattern(code: string): 'factorial' | 'fibonacci' | 'tree_traversal' | 'custom' {
    const lowerCode = code.toLowerCase();
    
    if (lowerCode.includes('factorial') || 
        (lowerCode.includes('n * ') && lowerCode.includes('n - 1'))) {
      return 'factorial';
    }
    
    if (lowerCode.includes('fibonacci') || lowerCode.includes('fib(') ||
        (lowerCode.includes('n - 1') && lowerCode.includes('n - 2'))) {
      return 'fibonacci';
    }
    
    if (lowerCode.includes('traverse') || lowerCode.includes('tree') || 
        lowerCode.includes('node') ||
        (lowerCode.includes('left') && lowerCode.includes('right'))) {
      return 'tree_traversal';
    }
    
    return 'custom';
  }
}

// Export singleton instance for convenience
export const stepGenerator = new StepGenerator();

// Default export for compatibility
export default StepGenerator;
