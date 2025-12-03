import React from 'react';
import './Logo.css';

// Check if we're in light mode
const useTheme = () => {
  const saved = localStorage.getItem('dnai_theme');
  return saved === 'light' ? 'light' : 'dark';
};

function Logo({ size = 'medium', showText = true, variant = 'default' }) {
  const theme = useTheme();
  const isLight = theme === 'light';
  
  const primaryColor = isLight ? '#f97316' : '#3b82f6';
  const secondaryColor = isLight ? '#fb923c' : '#06b6d4';
  const tertiaryColor = isLight ? '#ea580c' : '#8b5cf6';
  
  const sizeClasses = {
    small: 'logo-small',
    medium: 'logo-medium',
    large: 'logo-large',
    xlarge: 'logo-xlarge'
  };

  return (
    <div className={`dnai-logo ${sizeClasses[size]} ${variant}`}>
      <div className="logo-icon">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Circle with Gradient */}
          <defs>
            <linearGradient id={`logoGradient-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primaryColor} />
              <stop offset="50%" stopColor={secondaryColor} />
              <stop offset="100%" stopColor={isLight ? '#f59e0b' : '#10b981'} />
            </linearGradient>
            <linearGradient id={`logoGradient2-${theme}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={tertiaryColor} />
              <stop offset="100%" stopColor={primaryColor} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Outer Ring */}
          <circle 
            cx="50" 
            cy="50" 
            r="46" 
            stroke={`url(#logoGradient-${theme})`}
            strokeWidth="2" 
            fill="none"
            className="logo-ring"
          />
          
          {/* Inner Background */}
          <circle 
            cx="50" 
            cy="50" 
            r="42" 
            fill={isLight ? 'rgba(249, 115, 22, 0.1)' : 'rgba(59, 130, 246, 0.1)'}
          />
          
          {/* DNA Helix - Left Strand */}
          <path 
            d="M30 20 Q50 35, 30 50 Q50 65, 30 80" 
            stroke={`url(#logoGradient-${theme})`}
            strokeWidth="4" 
            strokeLinecap="round"
            fill="none"
            className="dna-strand"
          />
          
          {/* DNA Helix - Right Strand */}
          <path 
            d="M70 20 Q50 35, 70 50 Q50 65, 70 80" 
            stroke={`url(#logoGradient2-${theme})`}
            strokeWidth="4" 
            strokeLinecap="round"
            fill="none"
            className="dna-strand"
          />
          
          {/* DNA Bridges */}
          <line x1="35" y1="28" x2="65" y2="28" stroke={secondaryColor} strokeWidth="2" strokeLinecap="round" className="dna-bridge"/>
          <line x1="32" y1="40" x2="68" y2="40" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" className="dna-bridge"/>
          <line x1="32" y1="50" x2="68" y2="50" stroke={tertiaryColor} strokeWidth="2" strokeLinecap="round" className="dna-bridge"/>
          <line x1="32" y1="60" x2="68" y2="60" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" className="dna-bridge"/>
          <line x1="35" y1="72" x2="65" y2="72" stroke={secondaryColor} strokeWidth="2" strokeLinecap="round" className="dna-bridge"/>
          
          {/* AI Nodes */}
          <circle cx="30" cy="50" r="5" fill={`url(#logoGradient-${theme})`} filter="url(#glow)" className="ai-node"/>
          <circle cx="70" cy="50" r="5" fill={`url(#logoGradient2-${theme})`} filter="url(#glow)" className="ai-node"/>
          <circle cx="50" cy="35" r="4" fill={secondaryColor} className="ai-node-small"/>
          <circle cx="50" cy="65" r="4" fill={secondaryColor} className="ai-node-small"/>
        </svg>
      </div>
      {showText && (
        <span className="logo-text" style={{ color: isLight ? '#1e293b' : '#ffffff' }}>DNAI</span>
      )}
    </div>
  );
}

// Alternative simpler logo
export function LogoSimple({ size = 'medium', showText = true }) {
  const theme = useTheme();
  const isLight = theme === 'light';
  
  const primaryColor = isLight ? '#f97316' : '#3b82f6';
  const secondaryColor = isLight ? '#fb923c' : '#06b6d4';
  
  const sizeClasses = {
    small: 'logo-small',
    medium: 'logo-medium',
    large: 'logo-large',
    xlarge: 'logo-xlarge'
  };

  return (
    <div className={`dnai-logo ${sizeClasses[size]}`}>
      <div className="logo-icon simple">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={`simpleGradient-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primaryColor} />
              <stop offset="100%" stopColor={secondaryColor} />
            </linearGradient>
          </defs>
          
          {/* Hexagon Background */}
          <path 
            d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z" 
            fill={`url(#simpleGradient-${theme})`}
            className="hex-bg"
          />
          
          {/* Inner Design - Abstract Food/AI */}
          <circle cx="50" cy="40" r="15" fill="rgba(255,255,255,0.9)"/>
          <circle cx="50" cy="40" r="8" fill={primaryColor}/>
          <path 
            d="M35 60 Q50 75, 65 60" 
            stroke="rgba(255,255,255,0.9)" 
            strokeWidth="5" 
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Scan Lines */}
          <line x1="25" y1="50" x2="75" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
          <line x1="30" y1="55" x2="70" y2="55" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
        </svg>
      </div>
      {showText && (
        <span className="logo-text" style={{ color: isLight ? '#1e293b' : '#ffffff' }}>DNAI</span>
      )}
    </div>
  );
}

export default Logo;
