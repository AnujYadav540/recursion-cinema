/**
 * SectionNav - Fixed navigation dots on right side with hide/show toggle
 * _Requirements: 8.1, 8.2, 8.4_
 */
import React, { useState, useCallback } from 'react';
import './SectionNav.css';

interface Section {
  id: string;
  label: string;
}

interface SectionNavProps {
  sections: Section[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const SectionNav: React.FC<SectionNavProps> = ({
  sections,
  activeSection,
  onNavigate,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, sectionId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNavigate(sectionId);
    }
  }, [onNavigate]);

  const handleClick = useCallback((sectionId: string) => {
    onNavigate(sectionId);
  }, [onNavigate]);

  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  return (
    <nav className={`section-nav ${isVisible ? 'section-nav--visible' : 'section-nav--hidden'}`} role="navigation" aria-label="Page sections">
      <button 
        className="nav-toggle" 
        onClick={toggleVisibility}
        aria-label={isVisible ? 'Hide navigation' : 'Show navigation'}
        title={isVisible ? 'Hide navigation' : 'Show navigation'}
      >
        {isVisible ? '›' : '‹'}
      </button>
      
      {isVisible && (
        <ul className="nav-list">
          {sections.map((section) => (
            <li key={section.id} className="nav-item">
              <button
                className={`nav-dot ${activeSection === section.id ? 'nav-dot--active' : ''}`}
                onClick={() => handleClick(section.id)}
                onKeyDown={(e) => handleKeyDown(e, section.id)}
                aria-label={`Navigate to ${section.label}`}
                aria-current={activeSection === section.id ? 'true' : undefined}
                title={section.label}
              >
                <span className="nav-dot-inner" />
                <span className="nav-label">{section.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default SectionNav;
