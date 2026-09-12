/**
 * HeroSection - Landing section with animated title and call-to-action
 * 
 * _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
 */

import React from 'react';
import './HeroSection.css';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <section 
      id="hero" 
      className="hero-section"
      aria-label="Welcome to Recursion Cinema"
    >
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="hero-emoji" aria-hidden="true">🎬</span>
          <span className="hero-text-gradient">Recursion Cinema</span>
        </h1>
        
        <p className="hero-tagline">
          Watch recursion unfold, step by step
        </p>
        
        <p className="hero-description">
          An educational visualization tool that transforms recursive code execution 
          into a cinematic experience. Explore 100+ curated preset examples covering 
          Dynamic Programming, Backtracking, Divide & Conquer, and classic algorithms 
          like Fibonacci, Binary Search, and Tower of Hanoi. Watch the call stack grow, 
          see variables change, and truly understand how recursion works.
        </p>
        
        <button 
          className="hero-cta" 
          onClick={onGetStarted}
          aria-label="Get started - scroll to code editor"
        >
          Get Started
          <span className="hero-cta-arrow" aria-hidden="true">↓</span>
        </button>
      </div>
      
      <div className="hero-visual" aria-hidden="true">
        <div className="hero-stack-preview">
          <div className="preview-card preview-card-1">factorial(3)</div>
          <div className="preview-card preview-card-2">factorial(2)</div>
          <div className="preview-card preview-card-3">factorial(1)</div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
