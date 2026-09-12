/**
 * FooterSection - Professional footer with copyright and back to top
 */
import React from 'react';
import './FooterSection.css';

interface FooterSectionProps {
  onBackToTop: () => void;
}

const FooterSection: React.FC<FooterSectionProps> = ({ onBackToTop }) => {
  return (
    <footer id="footer" className="footer-section">
      <div className="footer-container">
        <div className="footer-content">
          <p className="footer-text">
            © 2026 Recursion Cinema. Built by Anuj for learning and mastering recursion concepts.
          </p>
          <button 
            className="back-to-top-btn"
            onClick={onBackToTop}
            aria-label="Back to top"
          >
            Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
