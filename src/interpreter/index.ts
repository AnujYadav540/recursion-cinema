/**
 * Java Interpreter Public API
 * 
 * This module exports the public interface for the Java interpreter.
 * Use interpret() to parse and execute Java code, generating frames for visualization.
 * 
 * _Requirements: 5.1, 5.2, 5.6_
 */

// Export AST types
export * from './ast';

// Export lexer
export { tokenize, JavaLexer } from './lexer';

// Export parser
export { parse, JavaParser } from './parser';

// Export executor
export { execute, Executor, ExecutionError } from './executor';
export type { ExecutionResult, RuntimeValue } from './executor';

import { parse } from './parser';
import { execute } from './executor';
import type { FrameObject } from '../types';

export interface InterpretResult {
  success: boolean;
  frames: FrameObject[];
  errors: Array<{
    message: string;
    line: number;
  }>;
  returnValue?: number | string | boolean | null;
  wasTruncated?: boolean;
}

/**
 * Interpret Java code and generate execution frames
 * 
 * @param code - Java source code to interpret
 * @param entryPoint - Method name to start execution (default: 'main')
 * @param args - Arguments to pass to the entry point method
 * @returns InterpretResult with frames or errors
 */
export function interpret(
  code: string, 
  entryPoint = 'main',
  args: (number | string | boolean | null | any[])[] = []
): InterpretResult {
  // Parse the code
  const parseResult = parse(code);
  
  if (!parseResult.success || !parseResult.ast) {
    return {
      success: false,
      frames: [],
      errors: parseResult.errors,
    };
  }

  // Execute the code
  const execResult = execute(parseResult.ast, entryPoint, args);
  
  // Format return value for display
  let returnValue: number | string | boolean | null | undefined;
  if (execResult.returnValue !== undefined && execResult.returnValue !== null) {
    if (typeof execResult.returnValue === 'number' || 
        typeof execResult.returnValue === 'string' ||
        typeof execResult.returnValue === 'boolean') {
      returnValue = execResult.returnValue;
    } else if (Array.isArray(execResult.returnValue)) {
      returnValue = '[' + execResult.returnValue.join(', ') + ']';
    }
  }

  return {
    success: execResult.success,
    frames: execResult.frames,
    errors: execResult.errors,
    returnValue,
    wasTruncated: execResult.wasTruncated,
  };
}
