/**
 * Recursion Cinema - Universal Java Recursive Code Visualizer
 * Scrollable educational website with full-fledged visualization
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import './styles/globals.css';
import type { FrameObject, PlaybackState } from './types';
import { EXAMPLES } from './data/presets';

// Section Components
import Navbar from './components/Navbar/Navbar';
import HeroSection from './components/sections/HeroSection';
import LearnSection from './components/sections/LearnSection';
import CodeEditorSection from './components/sections/CodeEditor';
import VisualizationSection from './components/sections/VisualizationSection';
import TreeSection from './components/sections/TreeSection';
import ExplanationSection from './components/sections/ExplanationSection';
import PracticeSection from './components/sections/PracticeSection';
import FooterSection from './components/sections/FooterSection';
import StickyControls from './components/sections/StickyControls';
import SectionNav from './components/sections/SectionNav';
import useScrollTracking from './hooks/useScrollTracking';

// Section configuration
const SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'learn', label: 'Learn' },
  { id: 'code', label: 'Code' },
  { id: 'visualization', label: 'Stack' },
  { id: 'tree', label: 'Tree' },
  { id: 'explanation', label: 'Explain' },
  { id: 'practice', label: 'Practice' },
];

// ============ JAVA INTERPRETER ============
interface JavaMethod {
  name: string;
  returnType: string;
  params: { type: string; name: string }[];
  body: string;
  startLine: number;
}

interface JavaValue {
  type: 'int' | 'double' | 'boolean' | 'String' | 'int[]' | 'char' | 'void';
  value: any;
}

class JavaInterpreter {
  private frames: FrameObject[] = [];
  private frameCounter = 0;
  private callStack: { id: string; name: string; args: Record<string, any>; depth: number; lineNo: number }[] = [];
  private methods: Map<string, JavaMethod> = new Map();
  private maxFrames = 500;
  private maxDepth = 100;
  private maxLoopIterations = 10000;

  interpret(code: string): { frames: FrameObject[]; error?: string; result?: any } {
    this.frames = [];
    this.frameCounter = 0;
    this.callStack = [];
    this.methods.clear();

    try {
      this.parseJavaCode(code);
      const mainCall = this.findMainCall(code);
      if (!mainCall) {
        return { frames: [], error: 'No method call found. Add a call like: factorial(5);' };
      }
      const result = this.executeCall(mainCall.methodName, mainCall.args, 1);
      return { frames: this.frames, result: result?.value };
    } catch (error: any) {
      return { frames: this.frames, error: error.message };
    }
  }

  private parseJavaCode(code: string): void {
    const cleanCode = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const methodRegex = /(?:public\s+|private\s+|protected\s+)?(?:static\s+)?(\w+(?:\[\])?)\s+(\w+)\s*\(([^)]*)\)\s*\{/g;
    
    let match;
    while ((match = methodRegex.exec(cleanCode)) !== null) {
      const returnType = match[1];
      const name = match[2];
      const paramsStr = match[3];
      const bodyStart = match.index + match[0].length;
      
      const params: { type: string; name: string }[] = [];
      if (paramsStr.trim()) {
        for (const part of paramsStr.split(',')) {
          const paramMatch = part.trim().match(/(\w+(?:\[\])?)\s+(\w+)/);
          if (paramMatch) params.push({ type: paramMatch[1], name: paramMatch[2] });
        }
      }

      let braceCount = 1, bodyEnd = bodyStart;
      for (let i = bodyStart; i < cleanCode.length && braceCount > 0; i++) {
        if (cleanCode[i] === '{') braceCount++;
        if (cleanCode[i] === '}') braceCount--;
        if (braceCount === 0) bodyEnd = i;
      }

      const body = cleanCode.substring(bodyStart, bodyEnd);
      const startLine = code.substring(0, match.index).split('\n').length;
      this.methods.set(name, { name, returnType, params, body, startLine });
    }
  }


  private findMainCall(code: string): { methodName: string; args: any[] } | null {
    const lines = code.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (!line || line.startsWith('//') || line.startsWith('/*') || 
          line.includes('public ') || line.includes('private ') || 
          line.includes('static ') || line.match(/^\w+\s+\w+\s*\(/)) continue;
      
      const callMatch = line.match(/^(\w+)\s*\(([^)]*)\)\s*;?\s*$/);
      if (callMatch && this.methods.has(callMatch[1])) {
        return { methodName: callMatch[1], args: this.parseArguments(callMatch[2]) };
      }
    }
    return null;
  }

  private parseArguments(argsStr: string): any[] {
    if (!argsStr.trim()) return [];
    const args: any[] = [];
    let current = '', depth = 0, inString = false;
    
    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i];
      if (char === '"' && argsStr[i-1] !== '\\') inString = !inString;
      if (!inString) {
        if (char === '(' || char === '[' || char === '{') depth++;
        if (char === ')' || char === ']' || char === '}') depth--;
        if (char === ',' && depth === 0) { args.push(this.parseValue(current.trim())); current = ''; continue; }
      }
      current += char;
    }
    if (current.trim()) args.push(this.parseValue(current.trim()));
    return args;
  }

  private parseValue(str: string): any {
    str = str.trim();
    if (str === 'true') return true;
    if (str === 'false') return false;
    if (str.startsWith('"') && str.endsWith('"')) return str.slice(1, -1);
    if (str.startsWith("'") && str.endsWith("'")) return str.slice(1, -1);
    const arrayMatch = str.match(/(?:new\s+\w+\[\]\s*)?\{([^}]*)\}/);
    if (arrayMatch) return arrayMatch[1].split(',').map(v => this.parseValue(v.trim()));
    if (!isNaN(Number(str))) return Number(str);
    return str;
  }

  private executeCall(methodName: string, args: any[], _lineNo: number): JavaValue | null {
    const method = this.methods.get(methodName);
    if (!method) throw new Error(`Method '${methodName}' not found`);
    if (this.frames.length >= this.maxFrames) throw new Error('Maximum frames exceeded (500). Possible infinite recursion?');
    if (this.callStack.length >= this.maxDepth) throw new Error('Maximum recursion depth exceeded (100)');

    const variables: Record<string, any> = {};
    method.params.forEach((param, i) => { variables[param.name] = args[i]; });

    const frameId = `f${++this.frameCounter}`;
    const parentId = this.callStack.length > 0 ? this.callStack[this.callStack.length - 1].id : undefined;
    const depth = this.callStack.length;

    this.frames.push({ id: frameId, lineNo: method.startLine, stackDepth: depth, variables: { ...variables }, action: 'CALL', functionName: methodName, parentFrameId: parentId });
    this.callStack.push({ id: frameId, name: methodName, args: variables, depth, lineNo: method.startLine });

    const result = this.executeBody(method.body, variables, methodName);

    const returnFrame = this.callStack.pop();
    if (returnFrame) {
      this.frames.push({ id: `f${++this.frameCounter}`, lineNo: method.startLine, stackDepth: this.callStack.length, variables: { ...variables }, action: 'RETURN', functionName: methodName, returnValue: result?.value, parentFrameId: this.callStack.length > 0 ? this.callStack[this.callStack.length - 1].id : undefined });
    }
    return result;
  }

  private executeBody(body: string, variables: Record<string, any>, funcName: string): JavaValue | null {
    const statements = this.parseStatements(body);
    for (const stmt of statements) {
      const result = this.executeStatement(stmt, variables, funcName);
      if (result !== null) return result;
    }
    return null;
  }

  private parseStatements(body: string): string[] {
    const statements: string[] = [];
    let current = '', depth = 0, inString = false;
    
    for (let i = 0; i < body.length; i++) {
      const char = body[i];
      if (char === '"' && body[i-1] !== '\\') inString = !inString;
      if (!inString) {
        if (char === '{') depth++;
        if (char === '}') depth--;
        if (char === ';' && depth === 0) { if (current.trim()) statements.push(current.trim()); current = ''; continue; }
        if (depth === 0 && char === '}') { current += char; if (current.trim()) statements.push(current.trim()); current = ''; continue; }
      }
      current += char;
    }
    if (current.trim()) statements.push(current.trim());
    return statements;
  }


  private executeStatement(stmt: string, variables: Record<string, any>, funcName: string): JavaValue | null {
    stmt = stmt.trim();
    
    if (stmt.startsWith('return ')) {
      const expr = stmt.substring(7).replace(/;$/, '').trim();
      return { type: 'int', value: this.evaluateExpression(expr, variables, funcName) };
    }
    
    const forMatch = stmt.match(/^for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*([^;]+);\s*([^;]+);\s*([^)]+)\)\s*\{([\s\S]*)\}$/);
    if (forMatch) {
      const [, varName, initExpr, condExpr, updateExpr, body] = forMatch;
      variables[varName] = this.evaluateExpression(initExpr, variables, funcName);
      let iterations = 0;
      while (this.evaluateExpression(condExpr, variables, funcName) && iterations < this.maxLoopIterations) {
        const result = this.executeBody(body, variables, funcName);
        if (result !== null) return result;
        this.executeUpdate(updateExpr.trim(), variables, varName);
        iterations++;
      }
      if (iterations >= this.maxLoopIterations) throw new Error(`Maximum loop iterations exceeded (${this.maxLoopIterations})`);
      return null;
    }
    
    const whileMatch = stmt.match(/^while\s*\(([^)]+)\)\s*\{([\s\S]*)\}$/);
    if (whileMatch) {
      const [, condExpr, body] = whileMatch;
      let iterations = 0;
      while (this.evaluateExpression(condExpr, variables, funcName) && iterations < this.maxLoopIterations) {
        const result = this.executeBody(body, variables, funcName);
        if (result !== null) return result;
        iterations++;
      }
      if (iterations >= this.maxLoopIterations) throw new Error(`Maximum loop iterations exceeded (${this.maxLoopIterations})`);
      return null;
    }
    
    // Parse if statement with balanced parentheses (handles arr[mid] in conditions)
    if (stmt.startsWith('if ') || stmt.startsWith('if(')) {
      const conditionStart = stmt.indexOf('(');
      if (conditionStart !== -1) {
        let depth = 1, conditionEnd = conditionStart + 1;
        for (; conditionEnd < stmt.length && depth > 0; conditionEnd++) {
          if (stmt[conditionEnd] === '(') depth++;
          if (stmt[conditionEnd] === ')') depth--;
        }
        const condition = stmt.substring(conditionStart + 1, conditionEnd - 1);
        const rest = stmt.substring(conditionEnd).trim();
        
        // Check for block with braces
        if (rest.startsWith('{')) {
          let braceDepth = 1, bodyEnd = 1;
          for (; bodyEnd < rest.length && braceDepth > 0; bodyEnd++) {
            if (rest[bodyEnd] === '{') braceDepth++;
            if (rest[bodyEnd] === '}') braceDepth--;
          }
          const thenBody = rest.substring(1, bodyEnd - 1);
          const afterThen = rest.substring(bodyEnd).trim();
          
          // Check for else block
          let elseBody: string | null = null;
          if (afterThen.startsWith('else')) {
            const elseRest = afterThen.substring(4).trim();
            if (elseRest.startsWith('{')) {
              let elseBraceDepth = 1, elseBodyEnd = 1;
              for (; elseBodyEnd < elseRest.length && elseBraceDepth > 0; elseBodyEnd++) {
                if (elseRest[elseBodyEnd] === '{') elseBraceDepth++;
                if (elseRest[elseBodyEnd] === '}') elseBraceDepth--;
              }
              elseBody = elseRest.substring(1, elseBodyEnd - 1);
            }
          }
          
          if (this.evaluateExpression(condition, variables, funcName)) {
            return this.executeBody(thenBody, variables, funcName);
          } else if (elseBody) {
            return this.executeBody(elseBody, variables, funcName);
          }
          return null;
        } else {
          // Simple if without braces (single statement)
          if (this.evaluateExpression(condition, variables, funcName)) {
            return this.executeStatement(rest, variables, funcName);
          }
          return null;
        }
      }
    }
    
    const varMatch = stmt.match(/^(?:int|double|boolean|String|char)\s+(\w+)\s*=\s*(.+)$/);
    if (varMatch) { variables[varMatch[1]] = this.evaluateExpression(varMatch[2], variables, funcName); return null; }
    
    const arrayAssignMatch = stmt.match(/^(\w+)\[([^\]]+)\]\s*=\s*(.+)$/);
    if (arrayAssignMatch) {
      const [, arrName, indexExpr, valueExpr] = arrayAssignMatch;
      const arr = variables[arrName];
      const index = this.evaluateExpression(indexExpr, variables, funcName);
      const value = this.evaluateExpression(valueExpr, variables, funcName);
      if (!Array.isArray(arr)) throw new Error(`Variable '${arrName}' is not an array`);
      if (index < 0 || index >= arr.length) throw new Error(`Array index out of bounds: ${index}`);
      arr[index] = value;
      return null;
    }
    
    const assignMatch = stmt.match(/^(\w+)\s*=\s*(.+)$/);
    if (assignMatch) { variables[assignMatch[1]] = this.evaluateExpression(assignMatch[2], variables, funcName); return null; }
    
    const methodCallMatch = stmt.match(/^(\w+)\s*\(([^)]*)\)\s*;?$/);
    if (methodCallMatch && this.methods.has(methodCallMatch[1])) {
      const evaluatedArgs = methodCallMatch[2].split(',').filter(a => a.trim()).map(a => this.evaluateExpression(a.trim(), variables, funcName));
      this.executeCall(methodCallMatch[1], evaluatedArgs, 0);
      return null;
    }
    
    return null;
  }

  private executeUpdate(updateExpr: string, variables: Record<string, any>, varName: string): void {
    updateExpr = updateExpr.trim();
    if (updateExpr === `${varName}++` || updateExpr === `++${varName}`) { variables[varName]++; return; }
    if (updateExpr === `${varName}--` || updateExpr === `--${varName}`) { variables[varName]--; return; }
    const addMatch = updateExpr.match(/^(\w+)\s*\+=\s*(.+)$/);
    if (addMatch) { variables[addMatch[1]] += this.evaluateExpression(addMatch[2], variables, ''); return; }
    const subMatch = updateExpr.match(/^(\w+)\s*-=\s*(.+)$/);
    if (subMatch) { variables[subMatch[1]] -= this.evaluateExpression(subMatch[2], variables, ''); return; }
    const assignMatch = updateExpr.match(/^(\w+)\s*=\s*(.+)$/);
    if (assignMatch) { variables[assignMatch[1]] = this.evaluateExpression(assignMatch[2], variables, ''); }
  }


  private evaluateExpression(expr: string, variables: Record<string, any>, funcName: string): any {
    expr = expr.trim();
    if (expr === 'true') return true;
    if (expr === 'false') return false;
    if (!isNaN(Number(expr))) return Number(expr);
    if (expr.startsWith('"') && expr.endsWith('"')) return expr.slice(1, -1);
    if (expr.startsWith("'") && expr.endsWith("'")) return expr.slice(1, -1);
    if (/^\w+$/.test(expr) && expr in variables) return variables[expr];
    
    const arrayAccessMatch = expr.match(/^(\w+)\[([^\]]+)\]$/);
    if (arrayAccessMatch) {
      const arr = variables[arrayAccessMatch[1]];
      const idx = this.evaluateExpression(arrayAccessMatch[2], variables, funcName);
      if (!Array.isArray(arr)) throw new Error(`Variable '${arrayAccessMatch[1]}' is not an array`);
      if (idx < 0 || idx >= arr.length) throw new Error(`Array index out of bounds: ${idx}`);
      return arr[idx];
    }
    
    if (expr.includes('.length()')) { const varName = expr.replace('.length()', ''); const val = variables[varName]; return typeof val === 'string' ? val.length : 0; }
    if (expr.includes('.length')) { const varName = expr.replace('.length', ''); const val = variables[varName]; return Array.isArray(val) ? val.length : (typeof val === 'string' ? val.length : 0); }
    
    const substringMatch = expr.match(/(\w+)\.substring\(([^)]+)\)/);
    if (substringMatch) { const str = variables[substringMatch[1]]; const args = substringMatch[2].split(',').map(a => this.evaluateExpression(a.trim(), variables, funcName)); return typeof str === 'string' ? str.substring(args[0], args[1]) : ''; }
    
    const charAtMatch = expr.match(/(\w+)\.charAt\(([^)]+)\)/);
    if (charAtMatch) { const str = variables[charAtMatch[1]]; const idx = this.evaluateExpression(charAtMatch[2], variables, funcName); return typeof str === 'string' ? str.charAt(idx) : ''; }
    
    const callMatch = expr.match(/^(\w+)\s*\(([^)]*)\)$/);
    if (callMatch && this.methods.has(callMatch[1])) {
      const evaluatedArgs = callMatch[2].split(',').map(a => this.evaluateExpression(a.trim(), variables, funcName));
      const result = this.executeCall(callMatch[1], evaluatedArgs, 0);
      return result?.value;
    }
    
    return this.evaluateBinaryExpression(expr, variables, funcName);
  }

  private evaluateBinaryExpression(expr: string, variables: Record<string, any>, funcName: string): any {
    expr = expr.trim();
    
    while (expr.includes('(')) {
      const start = expr.lastIndexOf('(');
      const end = expr.indexOf(')', start);
      if (end === -1) break;
      const inner = expr.substring(start + 1, end);
      const beforeParen = expr.substring(0, start);
      const methodMatch = beforeParen.match(/(\w+)$/);
      if (methodMatch && this.methods.has(methodMatch[1])) {
        const evaluatedArgs = inner.split(',').map(a => this.evaluateExpression(a.trim(), variables, funcName));
        const result = this.executeCall(methodMatch[1], evaluatedArgs, 0);
        expr = beforeParen.slice(0, -methodMatch[1].length) + String(result?.value ?? 0) + expr.substring(end + 1);
      } else {
        const innerResult = this.evaluateBinaryExpression(inner, variables, funcName);
        expr = expr.substring(0, start) + String(innerResult) + expr.substring(end + 1);
      }
    }
    
    for (const op of ['<=', '>=', '==', '!=', '<', '>']) {
      const idx = this.findOperator(expr, op);
      if (idx !== -1) {
        const left = this.evaluateBinaryExpression(expr.substring(0, idx), variables, funcName);
        const right = this.evaluateBinaryExpression(expr.substring(idx + op.length), variables, funcName);
        switch (op) {
          case '<=': return left <= right;
          case '>=': return left >= right;
          case '==': return left === right;
          case '!=': return left !== right;
          case '<': return left < right;
          case '>': return left > right;
        }
      }
    }
    
    const andIdx = this.findOperator(expr, '&&');
    if (andIdx !== -1) return this.evaluateBinaryExpression(expr.substring(0, andIdx), variables, funcName) && this.evaluateBinaryExpression(expr.substring(andIdx + 2), variables, funcName);
    
    const orIdx = this.findOperator(expr, '||');
    if (orIdx !== -1) return this.evaluateBinaryExpression(expr.substring(0, orIdx), variables, funcName) || this.evaluateBinaryExpression(expr.substring(orIdx + 2), variables, funcName);
    
    for (let i = expr.length - 1; i >= 0; i--) {
      if ((expr[i] === '+' || expr[i] === '-') && i > 0) {
        const before = expr[i-1];
        if (before !== '*' && before !== '/' && before !== '%' && before !== '+' && before !== '-') {
          const left = this.evaluateBinaryExpression(expr.substring(0, i), variables, funcName);
          const right = this.evaluateBinaryExpression(expr.substring(i + 1), variables, funcName);
          if (typeof left === 'string' || typeof right === 'string') return String(left) + String(right);
          return expr[i] === '+' ? left + right : left - right;
        }
      }
    }
    
    for (let i = expr.length - 1; i >= 0; i--) {
      if (expr[i] === '*' || expr[i] === '/' || expr[i] === '%') {
        const left = this.evaluateBinaryExpression(expr.substring(0, i), variables, funcName);
        const right = this.evaluateBinaryExpression(expr.substring(i + 1), variables, funcName);
        switch (expr[i]) {
          case '*': return left * right;
          case '/': if (right === 0) throw new Error('Division by zero'); return Math.floor(left / right);
          case '%': if (right === 0) throw new Error('Modulo by zero'); return left % right;
        }
      }
    }
    
    if (/^\w+$/.test(expr)) { if (expr in variables) return variables[expr]; if (!isNaN(Number(expr))) return Number(expr); }
    if (!isNaN(Number(expr))) return Number(expr);
    
    // Handle array access like arr[mid] - delegate to evaluateExpression
    if (expr.includes('[') && expr.includes(']')) {
      return this.evaluateExpression(expr, variables, funcName);
    }
    
    // If it's a simple variable name, look it up
    if (expr in variables) return variables[expr];
    
    return expr;
  }

  private findOperator(expr: string, op: string): number {
    let depth = 0;
    for (let i = 0; i < expr.length - op.length + 1; i++) {
      if (expr[i] === '(') depth++;
      if (expr[i] === ')') depth--;
      if (depth === 0 && expr.substring(i, i + op.length) === op) return i;
    }
    return -1;
  }
}


// ============ ANIMATION CONTROLLER ============
class AnimationController {
  private frames: FrameObject[] = [];
  private currentFrameIndex = 0;
  private isPlaying = false;
  private speed = 1.0;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private callbacks: ((state: PlaybackState) => void)[] = [];

  setFrames(frames: FrameObject[]): void {
    this.frames = frames;
    this.currentFrameIndex = 0;
    this.isPlaying = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.notify();
  }

  getState(): PlaybackState {
    return { isPlaying: this.isPlaying, currentFrameIndex: this.currentFrameIndex, totalFrames: this.frames.length, speed: this.speed };
  }

  play(): void {
    if (this.frames.length === 0) return;
    if (this.currentFrameIndex >= this.frames.length - 1) this.currentFrameIndex = 0;
    this.isPlaying = true;
    this.lastFrameTime = performance.now();
    this.notify();
    this.tick();
  }

  pause(): void {
    this.isPlaying = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.notify();
  }

  stepForward(): void {
    if (this.isPlaying || this.currentFrameIndex >= this.frames.length - 1) return;
    this.currentFrameIndex++;
    this.notify();
  }

  stepBackward(): void {
    if (this.isPlaying || this.currentFrameIndex <= 0) return;
    this.currentFrameIndex--;
    this.notify();
  }

  reset(): void {
    this.isPlaying = false;
    this.currentFrameIndex = 0;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.notify();
  }

  setSpeed(speed: number): void {
    this.speed = Math.max(0.25, Math.min(3.0, speed));
    this.notify();
  }

  onChange(cb: (state: PlaybackState) => void): () => void {
    this.callbacks.push(cb);
    return () => { this.callbacks = this.callbacks.filter(c => c !== cb); };
  }

  private tick(): void {
    if (!this.isPlaying) return;
    this.animationFrameId = requestAnimationFrame((now) => {
      if (now - this.lastFrameTime >= 600 / this.speed) {
        if (this.currentFrameIndex < this.frames.length - 1) {
          this.currentFrameIndex++;
          this.notify();
          this.lastFrameTime = now;
        } else {
          this.isPlaying = false;
          this.notify();
          return;
        }
      }
      if (this.isPlaying) this.tick();
    });
  }

  private notify(): void {
    const state = this.getState();
    this.callbacks.forEach(cb => cb(state));
  }
}

// ============ MAIN APP ============
function App() {
  const [code, setCode] = useState(EXAMPLES.factorial.code);
  const [frames, setFrames] = useState<FrameObject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [playback, setPlayback] = useState<PlaybackState>({ isPlaying: false, currentFrameIndex: 0, totalFrames: 0, speed: 1 });

  const controller = useMemo(() => new AnimationController(), []);
  const interpreter = useMemo(() => new JavaInterpreter(), []);

  const { activeSection, scrollToSection } = useScrollTracking(SECTIONS);

  useEffect(() => controller.onChange(setPlayback), [controller]);

  const runCode = useCallback(() => {
    setError(null);
    const { frames: newFrames, error: err, result: res } = interpreter.interpret(code);
    
    if (err) {
      setError(err);
      setFrames([]);
    } else {
      setFrames(newFrames);
      setResult(res);
      if (newFrames.length > 0) {
        controller.setFrames(newFrames);
        controller.play();
        // Scroll to visualization section (Requirement 2.7)
        setTimeout(() => scrollToSection('visualization'), 100);
      }
    }
  }, [code, interpreter, controller, scrollToSection]);

  const handleGetStarted = useCallback(() => {
    scrollToSection('code');
  }, [scrollToSection]);

  const handleBackToTop = useCallback(() => {
    scrollToSection('hero');
  }, [scrollToSection]);

  const activeStack = useMemo(() => {
    const stack: FrameObject[] = [];
    const currentFrameData = frames[playback.currentFrameIndex];
    
    for (let i = 0; i <= playback.currentFrameIndex && i < frames.length; i++) {
      const f = frames[i];
      if (f.action === 'CALL') stack.push(f);
      else if (f.action === 'RETURN') {
        // If this is the CURRENT frame being displayed, DON'T remove it yet
        // so we can show the green "returning" state
        if (i === playback.currentFrameIndex) {
          // Keep the frame in stack - it will be shown as "returning"
          continue;
        }
        // For past RETURN frames, remove from stack
        const idx = stack.findIndex(s => s.functionName === f.functionName && s.stackDepth === f.stackDepth);
        if (idx !== -1) stack.splice(idx, 1);
      }
    }
    return stack;
  }, [frames, playback.currentFrameIndex]);

  const currentFrame = frames[playback.currentFrameIndex];
  const isComplete = playback.currentFrameIndex >= frames.length - 1 && frames.length > 0;

  return (
    <div className="app-container scrollable">
      {/* Navbar */}
      <Navbar activeSection={activeSection} onNavigate={scrollToSection} />
      
      {/* Hero Section */}
      <HeroSection onGetStarted={handleGetStarted} />

      {/* Learn Section */}
      <LearnSection />

      {/* Code Editor Section */}
      <CodeEditorSection 
        code={code} 
        onCodeChange={setCode} 
        onRun={runCode} 
        error={error} 
      />

      {/* Stack + Explanation Side by Side */}
      <section id="visualization" className="stack-explain-section">
        <div className="stack-explain-container">
          <VisualizationSection 
            activeStack={activeStack}
            currentFrame={currentFrame}
            result={result}
            isComplete={isComplete}
          />
          <ExplanationSection 
            currentFrame={currentFrame}
            currentFrameIndex={playback.currentFrameIndex}
            totalFrames={frames.length}
          />
        </div>
      </section>

      {/* Tree Section */}
      <TreeSection 
        frames={frames}
        currentFrameIndex={playback.currentFrameIndex}
      />

      {/* Practice Section */}
      <PracticeSection />

      {/* Footer Section */}
      <FooterSection onBackToTop={handleBackToTop} />

      {/* Sticky Controls */}
      <StickyControls 
        playback={playback}
        hasFrames={frames.length > 0}
        onPlay={() => controller.play()}
        onPause={() => controller.pause()}
        onStepForward={() => controller.stepForward()}
        onStepBackward={() => controller.stepBackward()}
        onReset={() => controller.reset()}
        onSpeedChange={(speed) => controller.setSpeed(speed)}
      />

      {/* Section Navigation */}
      <SectionNav 
        sections={SECTIONS}
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />
    </div>
  );
}

export default App;
