import { useRef, useCallback, useEffect, useState } from 'react';
import Editor, { type Monaco, type OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { ACTION_COLORS } from '../../types';

/**
 * Example code presets with detailed comments explaining recursion concepts.
 * Each preset demonstrates a different recursion pattern:
 * - Factorial: Linear recursion (single recursive call)
 * - Fibonacci: Tree recursion (multiple recursive calls)
 * - Tree Traversal: Structural recursion (traversing a data structure)
 * 
 * _Requirements: 1.3, 5.5_
 */
export const CODE_PRESETS = {
  factorial: `/**
 * FACTORIAL - Linear Recursion
 * ============================
 * 
 * The classic example of recursion!
 * Calculates n! = n × (n-1) × (n-2) × ... × 2 × 1
 * 
 * KEY CONCEPTS:
 * 1. BASE CASE: When n <= 1, return 1 (stops recursion)
 * 2. RECURSIVE CASE: n * factorial(n-1)
 * 3. Each call creates a NEW stack frame with its own 'n'
 * 
 * WATCH FOR:
 * - Stack grows DOWN as n decreases
 * - Returns UNWIND from bottom to top
 * - Each frame has ISOLATED variable values
 */
int factorial(int n) {
    // Base case: factorial of 0 or 1 is 1
    if (n <= 1) {
        return 1;
    }
    // Recursive case: n! = n × (n-1)!
    return n * factorial(n - 1);
}

// Try changing the number! (Keep it under 10 for clarity)
factorial(5)`,

  fibonacci: `/**
 * FIBONACCI - Tree Recursion
 * ==========================
 * 
 * A beautiful example of TREE recursion!
 * F(n) = F(n-1) + F(n-2)
 * Sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21...
 * 
 * KEY CONCEPTS:
 * 1. TWO BASE CASES: F(0)=0, F(1)=1
 * 2. TWO RECURSIVE CALLS per invocation
 * 3. Creates a TREE of calls, not just a stack
 * 
 * WATCH FOR:
 * - The call tree branches at each step
 * - Same values computed multiple times (inefficient!)
 * - Stack depth = n (deepest path)
 * 
 * NOTE: fib(6) creates 25 function calls!
 */
int fib(int n) {
    // Base cases
    if (n <= 1) {
        return n;
    }
    // Tree recursion: two calls!
    return fib(n - 1) + fib(n - 2);
}

// Try fib(6) = 8, or fib(7) = 13
fib(6)`,

  treeTraversal: `/**
 * TREE TRAVERSAL - Structural Recursion
 * =====================================
 * 
 * Recursion naturally fits tree structures!
 * This is INORDER traversal: Left → Node → Right
 * 
 * KEY CONCEPTS:
 * 1. BASE CASE: null node (empty subtree)
 * 2. STRUCTURAL: Follows the shape of data
 * 3. Each node visited exactly once
 * 
 * WATCH FOR:
 * - Recursion follows tree structure
 * - Left subtree fully explored before right
 * - Stack depth = tree height
 * 
 * Our demo tree:
 *        1
 *       / \\
 *      2   3
 *     / \\ / \\
 *    4  5 6  7
 */
void traverse(Node node) {
    // Base case: empty tree
    if (node == null) {
        return;
    }
    // Inorder: Left, Process, Right
    traverse(node.left);
    print(node.value);
    traverse(node.right);
}

// Traverses a sample binary tree
traverse(tree)`,
};

/**
 * Preset metadata for the dropdown selector
 */
export const PRESET_INFO: Record<PresetKey, { name: string; description: string; icon: string }> = {
  factorial: {
    name: 'Factorial',
    description: 'Linear recursion - single recursive call',
    icon: '📊',
  },
  fibonacci: {
    name: 'Fibonacci',
    description: 'Tree recursion - multiple recursive calls',
    icon: '🌳',
  },
  treeTraversal: {
    name: 'Tree Traversal',
    description: 'Structural recursion - traversing data',
    icon: '🔍',
  },
};

export type PresetKey = keyof typeof CODE_PRESETS;

interface CodePanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  highlightedLine?: number;
  highlightAction?: 'CALL' | 'RETURN' | 'CALC';
  onPresetSelect?: (preset: PresetKey) => void;
  readOnly?: boolean;
}

export function CodePanel({
  code,
  onCodeChange,
  highlightedLine,
  highlightAction,
  onPresetSelect,
  readOnly = false,
}: CodePanelProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsCollectionRef = useRef<editor.IEditorDecorationsCollection | null>(null);

  // Get highlight color based on action type
  const getHighlightColor = useCallback((action?: 'CALL' | 'RETURN' | 'CALC') => {
    if (!action) return 'rgba(255, 255, 0, 0.3)'; // Default yellow
    
    switch (action) {
      case 'CALL':
        return 'rgba(33, 150, 243, 0.3)'; // Blue
      case 'RETURN':
        return 'rgba(76, 175, 80, 0.3)'; // Green
      case 'CALC':
        return 'rgba(255, 193, 7, 0.3)'; // Yellow
      default:
        return 'rgba(255, 255, 0, 0.3)';
    }
  }, []);

  // Update line highlighting
  const updateHighlight = useCallback(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    
    if (!editor || !monaco) {
      return;
    }

    // Create decorations collection if it doesn't exist
    if (!decorationsCollectionRef.current) {
      decorationsCollectionRef.current = editor.createDecorationsCollection();
    }

    if (!highlightedLine) {
      // Clear decorations if no line to highlight
      decorationsCollectionRef.current.clear();
      return;
    }

    const highlightColor = getHighlightColor(highlightAction);
    
    // Create decoration for the highlighted line
    const newDecorations: editor.IModelDeltaDecoration[] = [
      {
        range: new monaco.Range(highlightedLine, 1, highlightedLine, 1),
        options: {
          isWholeLine: true,
          className: `line-highlight-${highlightAction || 'default'}`,
          glyphMarginClassName: 'line-glyph',
          overviewRuler: {
            color: highlightColor,
            position: monaco.editor.OverviewRulerLane.Full,
          },
        },
      },
    ];

    decorationsCollectionRef.current.set(newDecorations);

    // Scroll to the highlighted line
    editor.revealLineInCenter(highlightedLine);
  }, [highlightedLine, highlightAction, getHighlightColor]);

  // Handle editor mount
  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define custom CSS for line highlighting
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .line-highlight-CALL {
        background-color: ${ACTION_COLORS.CALL}40 !important;
        border-left: 3px solid ${ACTION_COLORS.CALL} !important;
      }
      .line-highlight-RETURN {
        background-color: ${ACTION_COLORS.RETURN}40 !important;
        border-left: 3px solid ${ACTION_COLORS.RETURN} !important;
      }
      .line-highlight-CALC {
        background-color: ${ACTION_COLORS.CALC}40 !important;
        border-left: 3px solid ${ACTION_COLORS.CALC} !important;
      }
      .line-highlight-default {
        background-color: rgba(255, 255, 0, 0.3) !important;
        border-left: 3px solid #FFC107 !important;
      }
      .line-glyph {
        background-color: currentColor;
        border-radius: 50%;
        margin-left: 5px;
      }
    `;
    document.head.appendChild(styleElement);

    // Initial highlight update
    updateHighlight();
  }, [updateHighlight]);

  // Update highlight when line changes
  useEffect(() => {
    updateHighlight();
  }, [updateHighlight]);

  // Handle code changes
  const handleCodeChange = useCallback((value: string | undefined) => {
    onCodeChange(value || '');
  }, [onCodeChange]);

  // Handle preset selection
  const handlePresetChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = e.target.value as PresetKey;
    if (preset && onPresetSelect) {
      onPresetSelect(preset);
      onCodeChange(CODE_PRESETS[preset]);
    }
  }, [onPresetSelect, onCodeChange]);

  // Track selected preset for display
  const [selectedPreset, setSelectedPreset] = useState<PresetKey | ''>('');

  // Handle preset button click
  const handlePresetClick = useCallback((preset: PresetKey) => {
    setSelectedPreset(preset);
    if (onPresetSelect) {
      onPresetSelect(preset);
    }
    onCodeChange(CODE_PRESETS[preset]);
  }, [onPresetSelect, onCodeChange]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#1e1e1e',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      {/* Header with preset selector */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: '#252526',
        borderBottom: '1px solid #3c3c3c',
      }}>
        <span style={{ color: '#cccccc', fontSize: '14px', fontWeight: 500 }}>
          Java Code
        </span>
        <select
          onChange={handlePresetChange}
          value={selectedPreset}
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #3c3c3c',
            background: '#3c3c3c',
            color: '#cccccc',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          <option value="" disabled>Load Example...</option>
          <option value="factorial">{PRESET_INFO.factorial.icon} {PRESET_INFO.factorial.name}</option>
          <option value="fibonacci">{PRESET_INFO.fibonacci.icon} {PRESET_INFO.fibonacci.name}</option>
          <option value="treeTraversal">{PRESET_INFO.treeTraversal.icon} {PRESET_INFO.treeTraversal.name}</option>
        </select>
      </div>

      {/* Preset quick-select buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '8px 12px',
        background: '#2a2a2a',
        borderBottom: '1px solid #3c3c3c',
        flexWrap: 'wrap',
      }}>
        {(Object.keys(PRESET_INFO) as PresetKey[]).map((key) => (
          <button
            key={key}
            onClick={() => handlePresetClick(key)}
            title={PRESET_INFO[key].description}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: selectedPreset === key ? '1px solid #4CAF50' : '1px solid #555',
              background: selectedPreset === key ? '#3a4a3a' : '#333',
              color: selectedPreset === key ? '#8BC34A' : '#aaa',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{PRESET_INFO[key].icon}</span>
            <span>{PRESET_INFO[key].name}</span>
          </button>
        ))}
      </div>

      {/* Legend for highlight colors */}
      <div style={{
        display: 'flex',
        gap: '16px',
        padding: '6px 12px',
        background: '#2d2d2d',
        borderBottom: '1px solid #3c3c3c',
        fontSize: '11px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            width: '12px',
            height: '12px',
            background: ACTION_COLORS.CALL,
            borderRadius: '2px',
          }} />
          <span style={{ color: '#999' }}>CALL</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            width: '12px',
            height: '12px',
            background: ACTION_COLORS.RETURN,
            borderRadius: '2px',
          }} />
          <span style={{ color: '#999' }}>RETURN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            width: '12px',
            height: '12px',
            background: ACTION_COLORS.CALC,
            borderRadius: '2px',
          }} />
          <span style={{ color: '#999' }}>CALC</span>
        </div>
      </div>

      {/* Monaco Editor */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor
          height="100%"
          defaultLanguage="java"
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
            glyphMargin: true,
            folding: true,
            lineDecorationsWidth: 10,
            renderLineHighlight: 'none',
          }}
        />
      </div>
    </div>
  );
}

export default CodePanel;
