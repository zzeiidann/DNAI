import React from 'react';
import './Logo.css';

function Logo({ size = 'medium', showText = true, variant = 'default' }) {
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
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="logoGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
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
            stroke="url(#logoGradient)" 
            strokeWidth="2" 
            fill="none"
            className="logo-ring"
          />
          
          {/* Inner Background */}
          <circle 
            cx="50" 
            cy="50" 
            r="42" 
            fill="rgba(59, 130, 246, 0.1)"
          />
          
          {/* DNA Helix - Left Strand */}
          <path 
            d="M30 20 Q50 35, 30 50 Q50 65, 30 80" 
            stroke="url(#logoGradient)" 
            strokeWidth="4" 
            strokeLinecap="round"
            fill="none"
            className="dna-strand"
          />
          
          {/* DNA Helix - Right Strand */}
          <path 
            d="M70 20 Q50 35, 70 50 Q50 65, 70 80" 
            stroke="url(#logoGradient2)" 
            strokeWidth="4" 
            strokeLinecap="round"
            fill="none"
            className="dna-strand"
          />
          
          {/* DNA Bridges */}
          <line x1="35" y1="28" x2="65" y2="28" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" className="dna-bridge"/>
          <line x1="32" y1="40" x2="68" y2="40" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" className="dna-bridge"/>
          <line x1="32" y1="50" x2="68" y2="50" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" className="dna-bridge"/>
          <line x1="32" y1="60" x2="68" y2="60" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" className="dna-bridge"/>
          <line x1="35" y1="72" x2="65" y2="72" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" className="dna-bridge"/>
          
          {/* AI Nodes */}
          <circle cx="30" cy="50" r="5" fill="url(#logoGradient)" filter="url(#glow)" className="ai-node"/>
          <circle cx="70" cy="50" r="5" fill="url(#logoGradient2)" filter="url(#glow)" className="ai-node"/>
          <circle cx="50" cy="35" r="4" fill="#06b6d4" className="ai-node-small"/>
          <circle cx="50" cy="65" r="4" fill="#06b6d4" className="ai-node-small"/>
        </svg>
      </div>
      {showText && (
        <span className="logo-text">DNAI</span>
      )}
    </div>
  );
}

// Alternative simpler logo
export function LogoSimple({ size = 'medium', showText = true }) {
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
            <linearGradient id="simpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          
          {/* Hexagon Background */}
          <path 
            d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z" 
            fill="url(#simpleGradient)"
            className="hex-bg"
          />
          
          {/* Inner Design - Abstract Food/AI */}
          <circle cx="50" cy="40" r="15" fill="rgba(255,255,255,0.9)"/>
          <circle cx="50" cy="40" r="8" fill="#3b82f6"/>
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
        <span className="logo-text">DNAI</span>
      )}
    </div>
  );
}

// Modern minimalist logo
export function LogoModern({ size = 'medium', showText = true }) {
  const sizeClasses = {
    small: 'logo-small',
    medium: 'logo-medium',
    large: 'logo-large',
    xlarge: 'logo-xlarge'
  };

  return (
    <div className={`dnai-logo ${sizeClasses[size]}`}>
      <div className="logo-icon modern">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="modernGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <filter id="modernGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
          </defs>
          
          {/* Background Square with rounded corners */}
          <rect 
            x="8" y="8" 
            width="84" height="84" 
            rx="20" 
            fill="url(#modernGradient)"
          />
          
          {/* Letter D - stylized */}
          <path 
            d="M28 25 L28 75 L45 75 Q65 75, 65 50 Q65 25, 45 25 Z" 
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          
          {/* AI Circuit dots */}
          <circle cx="75" cy="30" r="4" fill="rgba(255,255,255,0.8)"/>
          <circle cx="75" cy="50" r="4" fill="rgba(255,255,255,0.8)"/>
          <circle cx="75" cy="70" r="4" fill="rgba(255,255,255,0.8)"/>
          
          {/* Connection lines */}
          <line x1="65" y1="50" x2="71" y2="30" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
          <line x1="65" y1="50" x2="71" y2="50" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
          <line x1="65" y1="50" x2="71" y2="70" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
        </svg>
      </div>
      {showText && (
        <span className="logo-text">DNAI</span>
      )}
    </div>
  );
}

export default Logo;
