/**
 * Java Executor - Interprets parsed Java AST and generates execution frames
 * 
 * This executor runs Java code by walking the AST and tracking:
 * - Variable values at each step
 * - Call stack for recursive calls
 * - Frame generation for CALL, RETURN, and CALC actions
 * 
 * _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_
 */

import type {
  ClassDeclaration, MethodDeclaration, Statement, Expression,
  VariableDeclaration, IfStatement, WhileStatement, ForStatement,
  ReturnStatement, BlockStatement, ExpressionStatement,
  BinaryExpression, UnaryExpression, AssignmentExpression, UpdateExpression,
  MethodCallExpression, ArrayAccessExpression, ArrayCreationExpression,
  Identifier, Literal, MemberExpression, TypeNode
} from './ast';
import type { FrameObject } from '../types';

// ============ Execution Limits ============

/** Maximum frames to prevent infinite recursion */
const MAX_FRAMES = 500;

/** Maximum stack depth to prevent stack overflow */
const MAX_DEPTH = 100;

/** Maximum loop iterations to prevent infinite loops */
const MAX_LOOP_ITERATIONS = 10000;

// ============ Value Types ============

/** Runtime value types */
export type RuntimeValue = number | string | boolean | null | RuntimeValue[];

/** Deep clone a runtime value */
function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(deepClone) as T;
  }
  return { ...value } as T;
}

// ============ Execution Context ============

/** Variable scope - maps variable names to values */
interface Scope {
  variables: Map<string, RuntimeValue>;
  parent?: Scope;
}

/** Stack frame for tracking method calls */
interface CallFrame {
  frameId: string;
  methodName: string;
  scope: Scope;
  parentFrameId?: string;
  line: number;
}

/** Execution context tracks the entire execution state */
export class ExecutionContext {
  private frameCounter = 0;
  private callStack: CallFrame[] = [];
  private methodTable: Map<string, MethodDeclaration> = new Map();
  private fields: Map<string, RuntimeValue> = new Map();
  
  public frames: FrameObject[] = [];
  public errors: ExecutionError[] = [];
  public hitFrameLimit = false;
  public hitDepthLimit = false;
  public hitLoopLimit = false;

  constructor(classDecl: ClassDeclaration) {
    // Build method table
    for (const method of classDecl.methods) {
      this.methodTable.set(method.name, method);
    }
    // Initialize fields
    for (const field of classDecl.fields) {
      const value = field.initializer 
        ? this.getDefaultValue(field.varType) // Fields initialized later by executor
        : this.getDefaultValue(field.varType);
      this.fields.set(field.name, value);
    }
  }

  /** Generate unique frame ID */
  generateFrameId(): string {
    return `f${++this.frameCounter}`;
  }

  /** Get current stack depth */
  getStackDepth(): number {
    return this.callStack.length;
  }

  /** Get current frame ID */
  getCurrentFrameId(): string | undefined {
    return this.callStack.length > 0 
      ? this.callStack[this.callStack.length - 1].frameId 
      : undefined;
  }

  /** Get parent frame ID */
  getParentFrameId(): string | undefined {
    return this.callStack.length > 1
      ? this.callStack[this.callStack.length - 2].frameId
      : undefined;
  }

  /** Check if we can continue execution */
  canContinue(): boolean {
    if (this.frames.length >= MAX_FRAMES) {
      this.hitFrameLimit = true;
      return false;
    }
    if (this.callStack.length >= MAX_DEPTH) {
      this.hitDepthLimit = true;
      return false;
    }
    return true;
  }

  /** Push a new call frame */
  pushFrame(methodName: string, params: Map<string, RuntimeValue>, line: number): string {
    const frameId = this.generateFrameId();
    const parentFrameId = this.getCurrentFrameId();
    
    const scope = this.createScope(
      this.callStack.length > 0 ? undefined : undefined // Methods don't inherit local scope
    );
    
    // Add parameters to scope
    for (const [name, value] of params) {
      scope.variables.set(name, value);
    }

    this.callStack.push({
      frameId,
      methodName,
      scope,
      parentFrameId,
      line,
    });

    return frameId;
  }

  /** Pop the current call frame */
  popFrame(): CallFrame | undefined {
    return this.callStack.pop();
  }

  /** Get current scope */
  getCurrentScope(): Scope {
    if (this.callStack.length === 0) {
      throw new ExecutionError('No active scope', 0);
    }
    return this.callStack[this.callStack.length - 1].scope;
  }

  /** Create a new scope */
  createScope(parent?: Scope): Scope {
    return {
      variables: new Map(),
      parent,
    };
  }

  /** Look up a variable in the current scope chain */
  lookupVariable(name: string): RuntimeValue {
    // First check current scope chain
    if (this.callStack.length > 0) {
      let scope: Scope | undefined = this.getCurrentScope();
      while (scope) {
        if (scope.variables.has(name)) {
          return scope.variables.get(name)!;
        }
        scope = scope.parent;
      }
    }
    
    // Then check fields
    if (this.fields.has(name)) {
      return this.fields.get(name)!;
    }
    
    throw new ExecutionError(`Undefined variable: ${name}`, 0);
  }

  /** Set a variable in the current scope */
  setVariable(name: string, value: RuntimeValue): void {
    // First try to find existing variable in scope chain
    if (this.callStack.length > 0) {
      let scope: Scope | undefined = this.getCurrentScope();
      while (scope) {
        if (scope.variables.has(name)) {
          scope.variables.set(name, value);
          return;
        }
        scope = scope.parent;
      }
    }
    
    // Check fields
    if (this.fields.has(name)) {
      this.fields.set(name, value);
      return;
    }
    
    // Create in current scope
    if (this.callStack.length > 0) {
      this.getCurrentScope().variables.set(name, value);
    }
  }

  /** Declare a new variable in current scope */
  declareVariable(name: string, value: RuntimeValue): void {
    if (this.callStack.length > 0) {
      this.getCurrentScope().variables.set(name, value);
    }
  }

  /** Get method by name */
  getMethod(name: string): MethodDeclaration | undefined {
    return this.methodTable.get(name);
  }

  /** Get all current variables for frame generation */
  getCurrentVariables(): Record<string, number | string> {
    const vars: Record<string, number | string> = {};
    
    if (this.callStack.length > 0) {
      let scope: Scope | undefined = this.getCurrentScope();
      while (scope) {
        for (const [name, value] of scope.variables) {
          if (!(name in vars)) {
            vars[name] = this.formatValue(value);
          }
        }
        scope = scope.parent;
      }
    }
    
    return vars;
  }

  /** Format a runtime value for display */
  formatValue(value: RuntimeValue): number | string {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return value;
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (value === null) return 'null';
    if (Array.isArray(value)) {
      return '[' + value.map(v => this.formatValue(v)).join(', ') + ']';
    }
    return String(value);
  }

  /** Get default value for a type */
  getDefaultValue(type: TypeNode): RuntimeValue {
    if (type.isArray) return [];
    switch (type.baseType) {
      case 'int': return 0;
      case 'boolean': return false;
      case 'char': return '\0';
      case 'String': return '';
      default: return null;
    }
  }

  /** Add a frame to the output */
  addFrame(frame: FrameObject): void {
    this.frames.push(frame);
  }

  /** Evaluate an expression (delegated to executor) */
  evaluateExpression(_expr: Expression, _scope: Scope): RuntimeValue {
    // This will be implemented by the Executor class
    throw new Error('evaluateExpression should be called through Executor');
  }
}


// ============ Execution Error ============

export class ExecutionError extends Error {
  constructor(
    message: string,
    public line: number,
    public column?: number
  ) {
    super(message);
    this.name = 'ExecutionError';
  }
}

// ============ Return Value Signal ============

/** Signal class to handle return statements */
class ReturnSignal {
  constructor(public value: RuntimeValue) {}
}

// ============ Executor Class ============

/**
 * Main executor that interprets Java AST and generates frames
 */
export class Executor {
  private context: ExecutionContext;
  private loopIterations = 0;

  constructor(classDecl: ClassDeclaration) {
    this.context = new ExecutionContext(classDecl);
  }

  /**
   * Execute a method by name with given arguments
   * This is the main entry point for execution
   */
  executeMethod(methodName: string, args: RuntimeValue[]): ExecutionResult {
    const method = this.context.getMethod(methodName);
    if (!method) {
      return {
        success: false,
        frames: [],
        errors: [{ message: `Method not found: ${methodName}`, line: 1 }],
        returnValue: undefined,
      };
    }

    try {
      const result = this.invokeMethod(method, args, undefined);
      return {
        success: true,
        frames: this.context.frames,
        errors: this.context.errors.map(e => ({ message: e.message, line: e.line })),
        returnValue: result,
        wasTruncated: this.context.hitFrameLimit || this.context.hitDepthLimit || this.context.hitLoopLimit,
      };
    } catch (error) {
      if (error instanceof ExecutionError) {
        return {
          success: false,
          frames: this.context.frames,
          errors: [{ message: error.message, line: error.line }],
          returnValue: undefined,
        };
      }
      throw error;
    }
  }

  /**
   * Invoke a method with arguments
   */
  private invokeMethod(
    method: MethodDeclaration,
    args: RuntimeValue[],
    parentFrameId: string | undefined
  ): RuntimeValue {
    if (!this.context.canContinue()) {
      return null;
    }

    // Build parameter map
    const params = new Map<string, RuntimeValue>();
    for (let i = 0; i < method.parameters.length; i++) {
      const param = method.parameters[i];
      const value = i < args.length ? args[i] : this.context.getDefaultValue(param.paramType);
      params.set(param.name, deepClone(value));
    }

    // Push call frame
    const frameId = this.context.pushFrame(method.name, params, method.line);

    // Build parameters object for display
    const parametersObj: Record<string, number | string> = {};
    for (const [name, value] of params) {
      parametersObj[name] = this.context.formatValue(value);
    }

    // Generate CALL frame
    this.context.addFrame({
      id: frameId,
      lineNo: method.line,
      stackDepth: this.context.getStackDepth() - 1,
      variables: this.context.getCurrentVariables(),
      action: 'CALL',
      functionName: method.name,
      parentFrameId,
      parameters: parametersObj,
    });

    // Execute method body
    let returnValue: RuntimeValue = null;
    try {
      for (const stmt of method.body) {
        if (!this.context.canContinue()) break;
        this.executeStatement(stmt);
      }
    } catch (signal) {
      if (signal instanceof ReturnSignal) {
        returnValue = signal.value;
      } else {
        throw signal;
      }
    }

    // Generate RETURN frame
    if (this.context.canContinue()) {
      this.context.addFrame({
        id: this.context.generateFrameId(),
        lineNo: method.lineEnd,
        stackDepth: this.context.getStackDepth() - 1,
        variables: this.context.getCurrentVariables(),
        action: 'RETURN',
        functionName: method.name,
        returnValue: returnValue !== null ? this.context.formatValue(returnValue) : undefined,
        parentFrameId,
      });
    }

    // Pop call frame
    this.context.popFrame();

    return returnValue;
  }

  /**
   * Execute a statement
   */
  private executeStatement(stmt: Statement): void {
    if (!this.context.canContinue()) return;

    switch (stmt.type) {
      case 'VariableDeclaration':
        this.executeVariableDeclaration(stmt);
        break;
      case 'ExpressionStatement':
        this.executeExpressionStatement(stmt);
        break;
      case 'IfStatement':
        this.executeIfStatement(stmt);
        break;
      case 'WhileStatement':
        this.executeWhileStatement(stmt);
        break;
      case 'ForStatement':
        this.executeForStatement(stmt);
        break;
      case 'ReturnStatement':
        this.executeReturnStatement(stmt);
        break;
      case 'BlockStatement':
        this.executeBlockStatement(stmt);
        break;
      default: {
        const _exhaustiveCheck: never = stmt;
        throw new ExecutionError(`Unknown statement type: ${(stmt as Statement).type}`, (stmt as Statement).line);
      }
    }
  }

  private executeVariableDeclaration(stmt: VariableDeclaration): void {
    const value = stmt.initializer 
      ? this.evaluateExpression(stmt.initializer)
      : this.context.getDefaultValue(stmt.varType);
    
    this.context.declareVariable(stmt.name, value);
  }

  private executeExpressionStatement(stmt: ExpressionStatement): void {
    this.evaluateExpression(stmt.expression);
  }

  private executeIfStatement(stmt: IfStatement): void {
    const condition = this.evaluateExpression(stmt.condition);
    
    // Generate CALC frame for condition evaluation
    if (this.context.canContinue()) {
      this.context.addFrame({
        id: this.context.generateFrameId(),
        lineNo: stmt.line,
        stackDepth: this.context.getStackDepth() - 1,
        variables: this.context.getCurrentVariables(),
        action: 'CALC',
        functionName: this.getCurrentMethodName(),
      });
    }

    if (this.isTruthy(condition)) {
      for (const s of stmt.consequent) {
        if (!this.context.canContinue()) break;
        this.executeStatement(s);
      }
    } else if (stmt.alternate) {
      for (const s of stmt.alternate) {
        if (!this.context.canContinue()) break;
        this.executeStatement(s);
      }
    }
  }

  private executeWhileStatement(stmt: WhileStatement): void {
    let iterations = 0;
    
    while (this.context.canContinue()) {
      const condition = this.evaluateExpression(stmt.condition);
      
      if (!this.isTruthy(condition)) break;
      
      iterations++;
      this.loopIterations++;
      
      if (this.loopIterations > MAX_LOOP_ITERATIONS) {
        this.context.hitLoopLimit = true;
        throw new ExecutionError('Maximum loop iterations exceeded', stmt.line);
      }

      for (const s of stmt.body) {
        if (!this.context.canContinue()) break;
        this.executeStatement(s);
      }
    }
  }

  private executeForStatement(stmt: ForStatement): void {
    // Execute init
    if (stmt.init) {
      if (stmt.init.type === 'VariableDeclaration') {
        this.executeVariableDeclaration(stmt.init);
      } else {
        this.evaluateExpression(stmt.init);
      }
    }

    let iterations = 0;
    
    while (this.context.canContinue()) {
      // Check condition
      if (stmt.condition) {
        const condition = this.evaluateExpression(stmt.condition);
        if (!this.isTruthy(condition)) break;
      }

      iterations++;
      this.loopIterations++;
      
      if (this.loopIterations > MAX_LOOP_ITERATIONS) {
        this.context.hitLoopLimit = true;
        throw new ExecutionError('Maximum loop iterations exceeded', stmt.line);
      }

      // Execute body
      for (const s of stmt.body) {
        if (!this.context.canContinue()) break;
        this.executeStatement(s);
      }

      // Execute update
      if (stmt.update && this.context.canContinue()) {
        this.evaluateExpression(stmt.update);
      }
    }
  }

  private executeReturnStatement(stmt: ReturnStatement): void {
    const value = stmt.argument 
      ? this.evaluateExpression(stmt.argument)
      : null;
    
    throw new ReturnSignal(value);
  }

  private executeBlockStatement(stmt: BlockStatement): void {
    for (const s of stmt.body) {
      if (!this.context.canContinue()) break;
      this.executeStatement(s);
    }
  }

  /**
   * Evaluate an expression and return its value
   */
  private evaluateExpression(expr: Expression): RuntimeValue {
    switch (expr.type) {
      case 'Literal':
        return this.evaluateLiteral(expr);
      case 'Identifier':
        return this.evaluateIdentifier(expr);
      case 'BinaryExpression':
        return this.evaluateBinaryExpression(expr);
      case 'UnaryExpression':
        return this.evaluateUnaryExpression(expr);
      case 'AssignmentExpression':
        return this.evaluateAssignmentExpression(expr);
      case 'UpdateExpression':
        return this.evaluateUpdateExpression(expr);
      case 'MethodCallExpression':
        return this.evaluateMethodCallExpression(expr);
      case 'ArrayAccessExpression':
        return this.evaluateArrayAccessExpression(expr);
      case 'ArrayCreationExpression':
        return this.evaluateArrayCreationExpression(expr);
      case 'MemberExpression':
        return this.evaluateMemberExpression(expr);
      case 'ConditionalExpression':
        return this.evaluateConditionalExpression(expr);
      default: {
        const _exhaustiveCheck: never = expr;
        throw new ExecutionError(`Unknown expression type: ${(expr as Expression).type}`, (expr as Expression).line);
      }
    }
  }

  private evaluateLiteral(expr: Literal): RuntimeValue {
    return expr.value;
  }

  private evaluateIdentifier(expr: Identifier): RuntimeValue {
    return this.context.lookupVariable(expr.name);
  }

  private evaluateBinaryExpression(expr: BinaryExpression): RuntimeValue {
    const left = this.evaluateExpression(expr.left);
    const right = this.evaluateExpression(expr.right);

    switch (expr.operator) {
      // Arithmetic
      case '+':
        if (typeof left === 'string' || typeof right === 'string') {
          return String(left) + String(right);
        }
        return (left as number) + (right as number);
      case '-':
        return (left as number) - (right as number);
      case '*':
        return (left as number) * (right as number);
      case '/':
        if (right === 0) {
          throw new ExecutionError('Division by zero', expr.line);
        }
        return Math.floor((left as number) / (right as number));
      case '%':
        return (left as number) % (right as number);
      
      // Comparison
      case '<':
        return (left as number) < (right as number);
      case '<=':
        return (left as number) <= (right as number);
      case '>':
        return (left as number) > (right as number);
      case '>=':
        return (left as number) >= (right as number);
      case '==':
        return left === right;
      case '!=':
        return left !== right;
      
      // Logical
      case '&&':
        return this.isTruthy(left) && this.isTruthy(right);
      case '||':
        return this.isTruthy(left) || this.isTruthy(right);
      
      default:
        throw new ExecutionError(`Unknown operator: ${expr.operator}`, expr.line);
    }
  }

  private evaluateUnaryExpression(expr: UnaryExpression): RuntimeValue {
    const arg = this.evaluateExpression(expr.argument);

    switch (expr.operator) {
      case '!':
        return !this.isTruthy(arg);
      case '-':
        return -(arg as number);
      case '+':
        return +(arg as number);
      default:
        throw new ExecutionError(`Unknown unary operator: ${expr.operator}`, expr.line);
    }
  }

  private evaluateAssignmentExpression(expr: AssignmentExpression): RuntimeValue {
    const right = this.evaluateExpression(expr.right);
    
    if (expr.left.type === 'Identifier') {
      const name = expr.left.name;
      let value: RuntimeValue;
      
      switch (expr.operator) {
        case '=':
          value = right;
          break;
        case '+=':
          value = (this.context.lookupVariable(name) as number) + (right as number);
          break;
        case '-=':
          value = (this.context.lookupVariable(name) as number) - (right as number);
          break;
        case '*=':
          value = (this.context.lookupVariable(name) as number) * (right as number);
          break;
        case '/=':
          value = Math.floor((this.context.lookupVariable(name) as number) / (right as number));
          break;
        default:
          throw new ExecutionError(`Unknown assignment operator: ${expr.operator}`, expr.line);
      }
      
      this.context.setVariable(name, value);
      return value;
    }
    
    if (expr.left.type === 'ArrayAccessExpression') {
      const arrayExpr = expr.left as ArrayAccessExpression;
      const array = this.evaluateExpression(arrayExpr.array) as RuntimeValue[];
      const index = this.evaluateExpression(arrayExpr.index) as number;
      
      if (index < 0 || index >= array.length) {
        throw new ExecutionError(`Array index out of bounds: ${index}`, expr.line);
      }
      
      let value: RuntimeValue;
      switch (expr.operator) {
        case '=':
          value = right;
          break;
        case '+=':
          value = (array[index] as number) + (right as number);
          break;
        case '-=':
          value = (array[index] as number) - (right as number);
          break;
        case '*=':
          value = (array[index] as number) * (right as number);
          break;
        case '/=':
          value = Math.floor((array[index] as number) / (right as number));
          break;
        default:
          throw new ExecutionError(`Unknown assignment operator: ${expr.operator}`, expr.line);
      }
      
      array[index] = value;
      return value;
    }
    
    throw new ExecutionError('Invalid assignment target', expr.line);
  }

  private evaluateUpdateExpression(expr: UpdateExpression): RuntimeValue {
    if (expr.argument.type !== 'Identifier') {
      throw new ExecutionError('Update expression requires identifier', expr.line);
    }
    
    const name = (expr.argument as Identifier).name;
    const oldValue = this.context.lookupVariable(name) as number;
    const newValue = expr.operator === '++' ? oldValue + 1 : oldValue - 1;
    
    this.context.setVariable(name, newValue);
    
    return expr.prefix ? newValue : oldValue;
  }

  private evaluateMethodCallExpression(expr: MethodCallExpression): RuntimeValue {
    // Handle built-in methods
    if (expr.object) {
      return this.evaluateObjectMethodCall(expr);
    }

    // Handle System.out.println (simplified)
    if (expr.callee === 'println' || expr.callee === 'print') {
      // Just evaluate args, don't actually print
      for (const arg of expr.arguments) {
        this.evaluateExpression(arg);
      }
      return null;
    }

    // Handle user-defined methods
    const method = this.context.getMethod(expr.callee);
    if (!method) {
      throw new ExecutionError(`Method not found: ${expr.callee}`, expr.line);
    }

    const args = expr.arguments.map(arg => this.evaluateExpression(arg));
    const parentFrameId = this.context.getCurrentFrameId();
    
    return this.invokeMethod(method, args, parentFrameId);
  }

  private evaluateObjectMethodCall(expr: MethodCallExpression): RuntimeValue {
    const obj = this.evaluateExpression(expr.object!);
    
    // Handle array.length
    if (expr.callee === 'length' && Array.isArray(obj)) {
      return obj.length;
    }
    
    // Handle String methods
    if (typeof obj === 'string') {
      switch (expr.callee) {
        case 'length':
          return obj.length;
        case 'charAt':
          const idx = this.evaluateExpression(expr.arguments[0]) as number;
          return obj.charAt(idx);
        case 'substring':
          const start = this.evaluateExpression(expr.arguments[0]) as number;
          const end = expr.arguments[1] 
            ? this.evaluateExpression(expr.arguments[1]) as number
            : obj.length;
          return obj.substring(start, end);
      }
    }
    
    throw new ExecutionError(`Unknown method: ${expr.callee}`, expr.line);
  }

  private evaluateArrayAccessExpression(expr: ArrayAccessExpression): RuntimeValue {
    const array = this.evaluateExpression(expr.array) as RuntimeValue[];
    const index = this.evaluateExpression(expr.index) as number;
    
    if (!Array.isArray(array)) {
      throw new ExecutionError('Cannot index non-array', expr.line);
    }
    
    if (index < 0 || index >= array.length) {
      throw new ExecutionError(`Array index out of bounds: ${index}`, expr.line);
    }
    
    return array[index];
  }

  private evaluateArrayCreationExpression(expr: ArrayCreationExpression): RuntimeValue {
    if (expr.initializer) {
      return expr.initializer.map(e => this.evaluateExpression(e));
    }
    
    const size = this.evaluateExpression(expr.size) as number;
    const defaultValue = this.getDefaultForType(expr.elementType.baseType);
    
    return new Array(size).fill(defaultValue);
  }

  private evaluateMemberExpression(expr: MemberExpression): RuntimeValue {
    const obj = this.evaluateExpression(expr.object);
    
    // Handle array.length
    if (expr.property === 'length' && Array.isArray(obj)) {
      return obj.length;
    }
    
    throw new ExecutionError(`Unknown property: ${expr.property}`, expr.line);
  }

  private evaluateConditionalExpression(expr: any): RuntimeValue {
    const test = this.evaluateExpression(expr.test);
    return this.isTruthy(test)
      ? this.evaluateExpression(expr.consequent)
      : this.evaluateExpression(expr.alternate);
  }

  /** Check if a value is truthy */
  private isTruthy(value: RuntimeValue): boolean {
    if (value === null) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value.length > 0;
    return true;
  }

  /** Get default value for a type name */
  private getDefaultForType(typeName: string): RuntimeValue {
    switch (typeName) {
      case 'int': return 0;
      case 'boolean': return false;
      case 'char': return '\0';
      case 'String': return '';
      default: return null;
    }
  }

  /** Get current method name */
  private getCurrentMethodName(): string {
    const depth = this.context.getStackDepth();
    if (depth === 0) return 'main';
    // Access through context's internal state
    return 'method';
  }
}

// ============ Execution Result ============

export interface ExecutionResult {
  success: boolean;
  frames: FrameObject[];
  errors: { message: string; line: number }[];
  returnValue: RuntimeValue | undefined;
  wasTruncated?: boolean;
}

// ============ Public API ============

/**
 * Execute Java code and generate frames
 * 
 * @param classDecl - Parsed class declaration
 * @param methodName - Name of method to execute
 * @param args - Arguments to pass to the method
 * @returns ExecutionResult with frames and any errors
 */
export function execute(
  classDecl: ClassDeclaration,
  methodName: string,
  args: RuntimeValue[]
): ExecutionResult {
  const executor = new Executor(classDecl);
  return executor.executeMethod(methodName, args);
}
