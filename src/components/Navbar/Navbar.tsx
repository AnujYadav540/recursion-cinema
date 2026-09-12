import { useState, useEffect } from 'react';
import './Navbar.css';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

const Navbar = ({ activeSection, onNavigate }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'learn', label: 'Learn' },
    { id: 'code', label: 'Code' },
    { id: 'visualization', label: 'Stack' },
    { id: 'tree', label: 'Tree' },
    { id: 'practice', label: 'Practice' },
  ];

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="navbar-brand" onClick={() => handleNavClick('hero')}>
          <span className="brand-icon">🎬</span>
          <span className="brand-text">Recursion Cinema</span>
        </div>

        {/* Desktop Navigation */}
        <ul className="navbar-menu">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-link ${activeSection === item.id ? 'nav-link--active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Right side - Theme indicator */}
        <div className="navbar-actions">
          <div className="theme-indicator" title="Scroll to explore">
            <span className="indicator-dot"></span>
            <span className="indicator-text">Explore</span>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'hamburger--open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu--open' : ''}`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`mobile-nav-link ${activeSection === item.id ? 'mobile-nav-link--active' : ''}`}
            onClick={() => handleNavClick(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
