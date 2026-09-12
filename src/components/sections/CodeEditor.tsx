import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { EXAMPLES, CUSTOM_PLACEHOLDER } from '../../data/presets';
import { PRACTICE_LINKS, PLATFORM_INFO, DIFFICULTY_INFO } from '../../data/practiceLinks';
import './CodeEditorSection.css';

interface CodeEditorSectionProps {
  code: string;
  onCodeChange: (code: string) => void;
  onRun: () => void;
  error: string | null;
}

const CodeEditorSection = ({ code, onCodeChange, onRun, error }: CodeEditorSectionProps) => {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPreset, setSelectedPreset] = useState('factorial');
  const [customCode, setCustomCode] = useState(CUSTOM_PLACEHOLDER);
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  
  // Get practice link for current preset
  const practiceLink = PRACTICE_LINKS[selectedPreset];
  const platformInfo = practiceLink ? PLATFORM_INFO[practiceLink.platform] : null;
  const difficultyInfo = practiceLink ? DIFFICULTY_INFO[practiceLink.difficulty] : null;

  const handleModeChange = useCallback((newMode: 'preset' | 'custom') => {
    setMode(newMode);
    onCodeChange(newMode === 'preset' ? EXAMPLES[selectedPreset].code : customCode);
  }, [selectedPreset, customCode, onCodeChange]);

  const handlePresetChange = useCallback((key: string) => {
    setSelectedPreset(key);
    onCodeChange(EXAMPLES[key].code);
  }, [onCodeChange]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    const newCode = value || '';
    if (mode === 'custom') setCustomCode(newCode);
    onCodeChange(newCode);
  }, [mode, onCodeChange]);

  const handleClear = useCallback(() => {
    setCustomCode(CUSTOM_PLACEHOLDER);
    onCodeChange(CUSTOM_PLACEHOLDER);
  }, [onCodeChange]);

  const simple = Object.entries(EXAMPLES).filter(([, v]) => v.category === 'simple');
  const intermediate = Object.entries(EXAMPLES).filter(([, v]) => v.category === 'intermediate');
  const advanced = Object.entries(EXAMPLES).filter(([, v]) => v.category === 'advanced');
  const dp = Object.entries(EXAMPLES).filter(([, v]) => v.category === 'dp');
  const backtracking = Object.entries(EXAMPLES).filter(([, v]) => v.category === 'backtracking');

  return (
    <section id="code" className="code-editor-section">
      <div className="editor-card">
        <div className="editor-toolbar">
          <div className="toolbar-left">
            <div className="mode-toggle">
              <button className={`mode-btn ${mode === 'preset' ? 'active' : ''}`} onClick={() => handleModeChange('preset')}>Presets</button>
              <button className={`mode-btn ${mode === 'custom' ? 'active' : ''}`} onClick={() => handleModeChange('custom')}>Sandbox</button>
            </div>
            {mode === 'preset' && (
              <>
                <select value={selectedPreset} onChange={(e) => handlePresetChange(e.target.value)} className="preset-dropdown">
                  <optgroup label="Simple">{simple.map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}</optgroup>
                  <optgroup label="Intermediate">{intermediate.map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}</optgroup>
                  <optgroup label="Advanced">{advanced.map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}</optgroup>
                  <optgroup label="Dynamic Programming">{dp.map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}</optgroup>
                  <optgroup label="Backtracking">{backtracking.map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}</optgroup>
                </select>
                {practiceLink && platformInfo && difficultyInfo && (
                  <a 
                    href={practiceLink.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="practice-btn"
                    title={`Practice on ${platformInfo.name}`}
                  >
                    <span className="practice-icon">{platformInfo.icon}</span>
                    <span className="practice-text">Practice</span>
                    <span className="practice-difficulty" style={{ background: difficultyInfo.color }}>
                      {difficultyInfo.name}
                    </span>
                  </a>
                )}
              </>
            )}
            {mode === 'custom' && (
              <button className="clear-btn" onClick={handleClear}>Reset</button>
            )}
            <button className="visualize-btn" onClick={onRun}>
              <span className="btn-icon">▶</span>
              Visualize
            </button>
          </div>
          <div className="toolbar-right">
            <button 
              className="theme-toggle-btn"
              onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
              title="Toggle editor theme"
            >
              {editorTheme === 'vs-dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
        
        <div className="editor-container">
          <Editor 
            height="180px" 
            defaultLanguage="java" 
            value={code} 
            onChange={handleEditorChange} 
            theme={editorTheme} 
            options={{ 
              minimap: { enabled: false }, 
              fontSize: 13, 
              wordWrap: 'on', 
              automaticLayout: true, 
              readOnly: mode === 'preset',
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              padding: { top: 4, bottom: 4 },
              scrollbar: {
                alwaysConsumeMouseWheel: false
              }
            }} 
          />
        </div>
        
        <div className="language-note">
          <span className="note-icon">💡</span>
          <span className="note-text">
            Examples use Java-like syntax, but recursion concepts apply to all languages (Python, C++, JavaScript, etc.)
          </span>
        </div>
        
        {error && <div className="error-display">{error}</div>}
      </div>
    </section>
  );
};

export default CodeEditorSection;
