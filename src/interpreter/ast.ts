/**
 * AST Node Type Definitions for Java Interpreter
 * 
 * These types represent the Abstract Syntax Tree nodes produced by the parser.
 * Each node includes line number information for error reporting and visualization.
 * 
 * _Requirements: 5.1_
 */

// Base interface for all AST nodes
export interface ASTNode {
  type: string;
  line: number;
}

// ============ Top-Level Declarations ============

export interface ClassDeclaration extends ASTNode {
  type: 'ClassDeclaration';
  name: string;
  methods: MethodDeclaration[];
  fields: FieldDeclaration[];
}

export interface MethodDeclaration extends ASTNode {
  type: 'MethodDeclaration';
  name: string;
  modifiers: string[]; // 'public', 'static', 'private'
  returnType: TypeNode;
  parameters: Parameter[];
  body: Statement[];
  lineEnd: number;
}

export interface FieldDeclaration extends ASTNode {
  type: 'FieldDeclaration';
  name: string;
  modifiers: string[];
  varType: TypeNode;
  initializer?: Expression;
}

export interface Parameter {
  name: string;
  paramType: TypeNode;
}

// ============ Type Nodes ============

export interface TypeNode {
  baseType: string; // 'int', 'boolean', 'void', 'String', etc.
  isArray: boolean;
  arrayDimensions: number; // 1 for int[], 2 for int[][], etc.
}

// ============ Statements ============

export type Statement =
  | VariableDeclaration
  | ExpressionStatement
  | IfStatement
  | WhileStatement
  | ForStatement
  | ReturnStatement
  | BlockStatement;

export interface VariableDeclaration extends ASTNode {
  type: 'VariableDeclaration';
  name: string;
  varType: TypeNode;
  initializer?: Expression;
}

export interface ExpressionStatement extends ASTNode {
  type: 'ExpressionStatement';
  expression: Expression;
}

export interface IfStatement extends ASTNode {
  type: 'IfStatement';
  condition: Expression;
  consequent: Statement[];
  alternate?: Statement[];
}

export interface WhileStatement extends ASTNode {
  type: 'WhileStatement';
  condition: Expression;
  body: Statement[];
}

export interface ForStatement extends ASTNode {
  type: 'ForStatement';
  init?: VariableDeclaration | Expression;
  condition?: Expression;
  update?: Expression;
  body: Statement[];
}

export interface ReturnStatement extends ASTNode {
  type: 'ReturnStatement';
  argument?: Expression;
}

export interface BlockStatement extends ASTNode {
  type: 'BlockStatement';
  body: Statement[];
}

// ============ Expressions ============

export type Expression =
  | Identifier
  | Literal
  | BinaryExpression
  | UnaryExpression
  | AssignmentExpression
  | UpdateExpression
  | MethodCallExpression
  | ArrayAccessExpression
  | ArrayCreationExpression
  | MemberExpression
  | ConditionalExpression;

export interface Identifier extends ASTNode {
  type: 'Identifier';
  name: string;
}

export interface Literal extends ASTNode {
  type: 'Literal';
  value: number | string | boolean | null;
  raw: string;
}

export interface BinaryExpression extends ASTNode {
  type: 'BinaryExpression';
  operator: BinaryOperator;
  left: Expression;
  right: Expression;
}

export type BinaryOperator =
  | '+' | '-' | '*' | '/' | '%'
  | '<' | '<=' | '>' | '>=' | '==' | '!='
  | '&&' | '||';

export interface UnaryExpression extends ASTNode {
  type: 'UnaryExpression';
  operator: '!' | '-' | '+';
  argument: Expression;
  prefix: boolean;
}

export interface AssignmentExpression extends ASTNode {
  type: 'AssignmentExpression';
  operator: '=' | '+=' | '-=' | '*=' | '/=';
  left: Expression; // Identifier or ArrayAccessExpression
  right: Expression;
}

export interface UpdateExpression extends ASTNode {
  type: 'UpdateExpression';
  operator: '++' | '--';
  argument: Expression;
  prefix: boolean;
}

export interface MethodCallExpression extends ASTNode {
  type: 'MethodCallExpression';
  callee: string; // Method name
  object?: Expression; // For obj.method() calls
  arguments: Expression[];
}

export interface ArrayAccessExpression extends ASTNode {
  type: 'ArrayAccessExpression';
  array: Expression;
  index: Expression;
}

export interface ArrayCreationExpression extends ASTNode {
  type: 'ArrayCreationExpression';
  elementType: TypeNode;
  size: Expression;
  initializer?: Expression[]; // For {1, 2, 3} style initialization
}

export interface MemberExpression extends ASTNode {
  type: 'MemberExpression';
  object: Expression;
  property: string;
}

export interface ConditionalExpression extends ASTNode {
  type: 'ConditionalExpression';
  test: Expression;
  consequent: Expression;
  alternate: Expression;
}

// ============ Parse Result ============

export interface ParseResult {
  success: boolean;
  ast?: ClassDeclaration;
  errors: ParseError[];
}

export interface ParseError {
  message: string;
  line: number;
  column?: number;
}

// ============ Helper Functions ============

export function createTypeNode(baseType: string, isArray = false, arrayDimensions = 0): TypeNode {
  return { baseType, isArray, arrayDimensions };
}

export function isStatement(node: ASTNode): node is Statement {
  return [
    'VariableDeclaration',
    'ExpressionStatement',
    'IfStatement',
    'WhileStatement',
    'ForStatement',
    'ReturnStatement',
    'BlockStatement',
  ].includes(node.type);
}

export function isExpression(node: ASTNode): node is Expression {
  return [
    'Identifier',
    'Literal',
    'BinaryExpression',
    'UnaryExpression',
    'AssignmentExpression',
    'UpdateExpression',
    'MethodCallExpression',
    'ArrayAccessExpression',
    'ArrayCreationExpression',
    'MemberExpression',
    'ConditionalExpression',
  ].includes(node.type);
}
