/**
 * Java Lexer using Chevrotain
 * 
 * Tokenizes Java source code into a stream of tokens for the parser.
 * Tracks line numbers for error reporting and visualization.
 * 
 * _Requirements: 5.1_
 */

import { createToken, Lexer, ITokenConfig } from 'chevrotain';

// ============ Keywords ============

export const Public = createToken({ name: 'Public', pattern: /public/ });
export const Private = createToken({ name: 'Private', pattern: /private/ });
export const Protected = createToken({ name: 'Protected', pattern: /protected/ });
export const Static = createToken({ name: 'Static', pattern: /static/ });
export const Final = createToken({ name: 'Final', pattern: /final/ });
export const Class = createToken({ name: 'Class', pattern: /class/ });
export const Void = createToken({ name: 'Void', pattern: /void/ });
export const Int = createToken({ name: 'Int', pattern: /int/ });
export const Boolean = createToken({ name: 'Boolean', pattern: /boolean/ });
export const Char = createToken({ name: 'Char', pattern: /char/ });
export const String = createToken({ name: 'String', pattern: /String/ });
export const If = createToken({ name: 'If', pattern: /if/ });
export const Else = createToken({ name: 'Else', pattern: /else/ });
export const While = createToken({ name: 'While', pattern: /while/ });
export const For = createToken({ name: 'For', pattern: /for/ });
export const Return = createToken({ name: 'Return', pattern: /return/ });
export const New = createToken({ name: 'New', pattern: /new/ });
export const True = createToken({ name: 'True', pattern: /true/ });
export const False = createToken({ name: 'False', pattern: /false/ });
export const Null = createToken({ name: 'Null', pattern: /null/ });
export const This = createToken({ name: 'This', pattern: /this/ });

// ============ Operators ============

// Comparison operators (longer patterns first)
export const LessEqual = createToken({ name: 'LessEqual', pattern: /<=/ });
export const GreaterEqual = createToken({ name: 'GreaterEqual', pattern: />=/ });
export const Equal = createToken({ name: 'Equal', pattern: /==/ });
export const NotEqual = createToken({ name: 'NotEqual', pattern: /!=/ });
export const Less = createToken({ name: 'Less', pattern: /</ });
export const Greater = createToken({ name: 'Greater', pattern: />/ });

// Logical operators
export const And = createToken({ name: 'And', pattern: /&&/ });
export const Or = createToken({ name: 'Or', pattern: /\|\|/ });
export const Not = createToken({ name: 'Not', pattern: /!/ });

// Assignment operators (longer patterns first)
export const PlusAssign = createToken({ name: 'PlusAssign', pattern: /\+=/ });
export const MinusAssign = createToken({ name: 'MinusAssign', pattern: /-=/ });
export const MultiplyAssign = createToken({ name: 'MultiplyAssign', pattern: /\*=/ });
export const DivideAssign = createToken({ name: 'DivideAssign', pattern: /\/=/ });
export const Assign = createToken({ name: 'Assign', pattern: /=/ });

// Increment/Decrement
export const Increment = createToken({ name: 'Increment', pattern: /\+\+/ });
export const Decrement = createToken({ name: 'Decrement', pattern: /--/ });

// Arithmetic operators
export const Plus = createToken({ name: 'Plus', pattern: /\+/ });
export const Minus = createToken({ name: 'Minus', pattern: /-/ });
export const Multiply = createToken({ name: 'Multiply', pattern: /\*/ });
export const Divide = createToken({ name: 'Divide', pattern: /\// });
export const Modulo = createToken({ name: 'Modulo', pattern: /%/ });

// ============ Delimiters ============

export const LParen = createToken({ name: 'LParen', pattern: /\(/ });
export const RParen = createToken({ name: 'RParen', pattern: /\)/ });
export const LBrace = createToken({ name: 'LBrace', pattern: /\{/ });
export const RBrace = createToken({ name: 'RBrace', pattern: /\}/ });
export const LBracket = createToken({ name: 'LBracket', pattern: /\[/ });
export const RBracket = createToken({ name: 'RBracket', pattern: /\]/ });
export const Semicolon = createToken({ name: 'Semicolon', pattern: /;/ });
export const Comma = createToken({ name: 'Comma', pattern: /,/ });
export const Dot = createToken({ name: 'Dot', pattern: /\./ });
export const Colon = createToken({ name: 'Colon', pattern: /:/ });
export const QuestionMark = createToken({ name: 'QuestionMark', pattern: /\?/ });

// ============ Literals ============

export const IntegerLiteral = createToken({ 
  name: 'IntegerLiteral', 
  pattern: /0|[1-9]\d*/ 
});

export const StringLiteral = createToken({ 
  name: 'StringLiteral', 
  pattern: /"[^"\\]*(?:\\.[^"\\]*)*"/ 
});

export const CharLiteral = createToken({ 
  name: 'CharLiteral', 
  pattern: /'(?:[^'\\]|\\.)'/ 
});

// ============ Identifier ============
// Must come after keywords to ensure keywords are matched first

export const Identifier = createToken({ 
  name: 'Identifier', 
  pattern: /[a-zA-Z_][a-zA-Z0-9_]*/ 
});

// ============ Whitespace and Comments ============

export const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

export const SingleLineComment = createToken({
  name: 'SingleLineComment',
  pattern: /\/\/[^\n\r]*/,
  group: Lexer.SKIPPED,
});

export const MultiLineComment = createToken({
  name: 'MultiLineComment',
  pattern: /\/\*[\s\S]*?\*\//,
  group: Lexer.SKIPPED,
});

// ============ Token Order ============
// Order matters! Longer patterns and keywords must come before shorter ones

export const allTokens = [
  // Whitespace and comments (skipped)
  WhiteSpace,
  SingleLineComment,
  MultiLineComment,
  
  // Keywords (must come before Identifier)
  Public,
  Private,
  Protected,
  Static,
  Final,
  Class,
  Void,
  Boolean,
  Char,
  String,
  Int,
  If,
  Else,
  While,
  For,
  Return,
  New,
  True,
  False,
  Null,
  This,
  
  // Multi-character operators (must come before single-character)
  LessEqual,
  GreaterEqual,
  Equal,
  NotEqual,
  And,
  Or,
  PlusAssign,
  MinusAssign,
  MultiplyAssign,
  DivideAssign,
  Increment,
  Decrement,
  
  // Single-character operators
  Less,
  Greater,
  Not,
  Assign,
  Plus,
  Minus,
  Multiply,
  Divide,
  Modulo,
  
  // Delimiters
  LParen,
  RParen,
  LBrace,
  RBrace,
  LBracket,
  RBracket,
  Semicolon,
  Comma,
  Dot,
  Colon,
  QuestionMark,
  
  // Literals
  IntegerLiteral,
  StringLiteral,
  CharLiteral,
  
  // Identifier (must be last to not match keywords)
  Identifier,
];

// Create the lexer instance
export const JavaLexer = new Lexer(allTokens);

// ============ Lexer Interface ============

export interface LexResult {
  tokens: ReturnType<typeof JavaLexer.tokenize>['tokens'];
  errors: LexError[];
}

export interface LexError {
  message: string;
  line: number;
  column: number;
}

/**
 * Tokenize Java source code
 * 
 * @param code - Java source code
 * @returns LexResult with tokens or errors
 */
export function tokenize(code: string): LexResult {
  const result = JavaLexer.tokenize(code);
  
  const errors: LexError[] = result.errors.map(err => ({
    message: err.message,
    line: err.line ?? 1,
    column: err.column ?? 1,
  }));
  
  return {
    tokens: result.tokens,
    errors,
  };
}

// Export token type map for parser
export const tokenVocabulary = allTokens.reduce((acc, token) => {
  acc[token.name] = token;
  return acc;
}, {} as Record<string, ITokenConfig>);
