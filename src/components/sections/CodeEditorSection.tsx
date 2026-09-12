import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { EXAMPLES, CUSTOM_PLACEHOLDER } from '../../data/presets';
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

  return (
    <section id="code" className="code-editor-section">
      <div className="section-header">
        <h2>Java Code Editor</h2>
        <p>Choose a preset example or write your own recursive code</p>
      </div>
      <div className="mode-toggle">
        <button className={`mode-btn ${mode === 'preset' ? 'active' : ''}`} onClick={() => handleModeChange('preset')}>Presets</button>
        <button className={`mode-btn ${mode === 'custom' ? 'active' : ''}`} onClick={() => handleModeChange('custom')}>Custom Code</button>
      </div>
      {mode === 'preset' && (
        <div className="preset-selector">
          <select value={selectedPreset} onChange={(e) => handlePresetChange(e.target.value)} className="preset-dropdown">
            <optgroup label="Simple">{simple.map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}</optgroup>
            <optgroup label="Intermediate">{intermediate.map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}</optgroup>
            <optgroup label="Advanced">{advanced.map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}</optgroup>
          </select>
        </div>
      )}
      <div className="editor-container">
        <Editor height="400px" defaultLanguage="java" value={code} onChange={handleEditorChange} theme="vs-dark" options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', automaticLayout: true, readOnly: mode === 'preset' }} />
      </div>
      {error && <div className="error-display">{error}</div>}
      <div className="action-buttons">
        <button className="run-btn" onClick={onRun}>Run and Visualize</button>
        {mode === 'custom' && <button className="clear-btn" onClick={handleClear}>Clear</button>}
      </div>
    </section>
  );
};

export default CodeEditorSection;
