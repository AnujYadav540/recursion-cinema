/**
 * ExplanationSection - Step-by-step explanation section
 * Provides beginner-friendly explanations of recursion
 * _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
 */
import React from 'react';
import type { FrameObject } from '../../types';
import './ExplanationSection.css';

interface ExplanationSectionProps {
  currentFrame: FrameObject | undefined;
  currentFrameIndex: number;
  totalFrames: number;
}

export const ExplanationSection: React.FC<ExplanationSectionProps> = ({
  currentFrame, currentFrameIndex, totalFrames
}) => {
  
  // Generate beginner-friendly explanation based on the frame
  const getExplanation = (frame: FrameObject | undefined): { title: string; details: string[]; tip: string } => {
    if (!frame) return { title: '', details: [], tip: '' };
    
    const vars = Object.entries(frame.variables).filter(([k]) => !k.startsWith('__'));
    const funcName = frame.functionName;
    const depth = frame.stackDepth;
    
    // Get the main parameter (usually first one like 'n' for factorial)
    const mainParam = vars[0];
    const paramName = mainParam ? mainParam[0] : '';
    const paramValue = mainParam ? mainParam[1] : '';
    
    if (frame.action === 'CALL') {
      // Check if this might be a base case (common patterns)
      const isLikelyBaseCase = 
        paramValue === 0 || paramValue === 1 || 
        (Array.isArray(paramValue) && paramValue.length <= 1) ||
        (typeof paramValue === 'string' && paramValue.length <= 1);
      
      if (depth === 0) {
        // First call - the initial call
        return {
          title: `🚀 Starting: ${funcName}(${formatValue(paramValue)})`,
          details: [
            `This is the FIRST call to ${funcName}.`,
            `We're starting with ${paramName} = ${formatValue(paramValue)}.`,
            `A new "stack frame" is created to remember this call.`,
            `Think of it like putting a sticky note on a stack of papers.`
          ],
          tip: `💡 The stack grows each time we call a function. Watch the left panel!`
        };
      } else if (isLikelyBaseCase) {
        // Base case reached
        return {
          title: `🎯 Base Case: ${funcName}(${formatValue(paramValue)})`,
          details: [
            `We reached the BASE CASE! This is where recursion stops.`,
            `With ${paramName} = ${formatValue(paramValue)}, we don't need to call ${funcName} again.`,
            `The function can now return a value directly.`,
            `This is like reaching the bottom of a staircase.`
          ],
          tip: `💡 Every recursive function MUST have a base case, or it would run forever!`
        };
      } else {
        // Recursive call
        return {
          title: `🔄 Recursive Call: ${funcName}(${formatValue(paramValue)})`,
          details: [
            `${funcName} is calling ITSELF with a smaller problem!`,
            `Now ${paramName} = ${formatValue(paramValue)} (getting closer to base case).`,
            `This call is WAITING for the next call to finish first.`,
            `Stack depth is now ${depth + 1} (we're going deeper).`
          ],
          tip: `💡 Each recursive call makes the problem smaller until we hit the base case.`
        };
      }
    } else {
      // RETURN action
      const returnVal = frame.returnValue;
      
      if (depth === 0) {
        // Final return - back to the original caller
        return {
          title: `✅ Final Result: ${formatValue(returnVal)}`,
          details: [
            `We're back at the FIRST call!`,
            `${funcName}(${formatValue(paramValue)}) returns ${formatValue(returnVal)}.`,
            `All recursive calls have completed.`,
            `The stack is now empty - we're done!`
          ],
          tip: `🎉 The recursion is complete! The final answer is ${formatValue(returnVal)}.`
        };
      } else {
        // Intermediate return
        const calculation = getCalculationHint(funcName, paramValue, returnVal);
        return {
          title: `⬆️ Returning: ${formatValue(returnVal)}`,
          details: [
            `${funcName}(${formatValue(paramValue)}) finished and returns ${formatValue(returnVal)}.`,
            calculation,
            `This value goes back to the PREVIOUS call that was waiting.`,
            `The stack frame is removed (like removing a sticky note).`
          ],
          tip: `💡 Return values "bubble up" through the stack, one call at a time.`
        };
      }
    }
  };
  
  // Format values for display
  const formatValue = (val: any): string => {
    if (Array.isArray(val)) {
      if (val.length > 6) return `[${val.slice(0, 6).join(', ')}...]`;
      return `[${val.join(', ')}]`;
    }
    return JSON.stringify(val);
  };
  
  // Generate calculation hint based on function name
  const getCalculationHint = (funcName: string, param: any, result: any): string => {
    const fn = funcName.toLowerCase();
    if (fn.includes('factorial') || fn === 'fact') {
      return `Calculation: ${param} × (result from smaller call) = ${result}`;
    } else if (fn.includes('fib')) {
      return `Calculation: fib(${param-1}) + fib(${param-2}) = ${result}`;
    } else if (fn.includes('sum')) {
      return `Calculation: ${param} + (sum of rest) = ${result}`;
    } else if (fn.includes('search') || fn.includes('binary')) {
      return `Found the target or narrowed down the search range.`;
    } else if (fn.includes('merge') || fn.includes('sort')) {
      return `Merged/sorted portion complete.`;
    }
    return `The function computed its result based on the recursive call.`;
  };

  const explanation = getExplanation(currentFrame);
  const progress = totalFrames > 0 ? ((currentFrameIndex + 1) / totalFrames) * 100 : 0;

  return (
    <section id="explanation" className="explanation-section">
      <div className="section-header">
        <h2>Step-by-Step Explanation</h2>
      </div>

      <div className="explanation-content">
        {!currentFrame ? (
          <div className="empty-state">
            <p className="empty-icon">📖</p>
            <p className="empty-title">No Steps Yet</p>
            <p className="empty-desc">Run your code to see step-by-step explanations</p>
          </div>
        ) : (
          <>
            <div className="step-counter">
              <span className="step-label">Step</span>
              <span className="step-current">{currentFrameIndex + 1}</span>
              <span className="step-separator">/</span>
              <span className="step-total">{totalFrames}</span>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className={`action-badge ${currentFrame.action === 'CALL' ? 'action-badge--call' : 'action-badge--return'}`}>
              {currentFrame.action === 'CALL' ? '📥 FUNCTION CALL' : '📤 RETURNING VALUE'}
            </div>

            <div className="explanation-title">
              {explanation.title}
            </div>

            <div className="explanation-details">
              {explanation.details.map((detail, i) => (
                <p key={i} className="detail-item">• {detail}</p>
              ))}
            </div>

            <div className="explanation-tip">
              {explanation.tip}
            </div>

            <div className="variables-display">
              <h4>📋 Current Variables</h4>
              <div className="var-list">
                {Object.entries(currentFrame.variables)
                  .filter(([k]) => !k.startsWith('__'))
                  .map(([k, v]) => (
                    <div key={k} className="var-row">
                      <span className="var-name">{k}</span>
                      <span className="var-value">{formatValue(v)}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="depth-display">
              <h4>📚 Stack Depth: {currentFrame.stackDepth + 1}</h4>
              <div className="depth-visual">
                {Array.from({ length: Math.max(currentFrame.stackDepth + 1, 1) }).map((_, i) => (
                  <div key={i} className={`depth-block ${i <= currentFrame.stackDepth ? 'depth-block--active' : ''}`}>
                    {i + 1}
                  </div>
                ))}
              </div>
              <p className="depth-hint">
                {currentFrame.action === 'CALL' 
                  ? '↓ Stack is growing (going deeper)' 
                  : '↑ Stack is shrinking (returning back)'}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ExplanationSection;
