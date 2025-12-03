import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Logo/Logo';
import '../Logo/Logo.css';
import './LandingPage.css';

function LandingPage() {
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('dnai_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('dnai_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = ['home', 'features', 'team', 'contact'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Icons
  const SunIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
  
  const MoonIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );

  const contributors = [
    { name: 'Muhammad Raffy Zeidan', role: 'Project Lead', avatar: '👨‍💻', github: 'zzeiidann' },
    { name: 'Contributor 2', role: 'Backend Developer', avatar: '👩‍💻', github: '#' },
    { name: 'Contributor 3', role: 'ML Engineer', avatar: '🧑‍💻', github: '#' },
    { name: 'Contributor 4', role: 'Frontend Developer', avatar: '👨‍🎨', github: '#' },
    { name: 'Contributor 5', role: 'UI/UX Designer', avatar: '👩‍🎨', github: '#' },
    { name: 'Contributor 6', role: 'Data Scientist', avatar: '🧑‍🔬', github: '#' },
  ];

  const features = [
    {
      icon: '📸',
      title: 'Food Recognition',
      description: 'Upload foto makanan dan AI akan mengidentifikasi jenis makanan secara otomatis menggunakan teknologi CLIP.',
      gradient: 'gradient-1'
    },
    {
      icon: '🔥',
      title: 'Calorie Tracking',
      description: 'Pantau asupan kalori harian Anda dengan mudah. Dapatkan insight tentang pola makan Anda.',
      gradient: 'gradient-2'
    },
    {
      icon: '🤖',
      title: 'AI Chatbot',
      description: 'Tanya apapun tentang nutrisi dan diet kepada asisten AI kami yang didukung oleh Gemini.',
      gradient: 'gradient-3'
    },
    {
      icon: '📊',
      title: 'Smart Dashboard',
      description: 'Lihat ringkasan nutrisi harian, progress mingguan, dan rekomendasi personal.',
      gradient: 'gradient-4'
    },
    {
      icon: '🎯',
      title: 'Goal Setting',
      description: 'Tentukan target kalori harian dan lacak progress Anda menuju gaya hidup sehat.',
      gradient: 'gradient-5'
    },
    {
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Akses DNAI dari mana saja. Desain responsif yang nyaman di semua perangkat.',
      gradient: 'gradient-6'
    }
  ];

  return (
    <div className={`landing-page ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Navigation */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo">
            <Logo size="small" showText={true} />
          </div>
          
          <ul className="nav-links">
            <li>
              <button 
                className={activeSection === 'home' ? 'active' : ''} 
                onClick={() => scrollToSection('home')}
              >
                Home
              </button>
            </li>
            <li>
              <button 
                className={activeSection === 'features' ? 'active' : ''} 
                onClick={() => scrollToSection('features')}
              >
                Fitur
              </button>
            </li>
            <li>
              <button 
                className={activeSection === 'team' ? 'active' : ''} 
                onClick={() => scrollToSection('team')}
              >
                Tim
              </button>
            </li>
          </ul>

          <div className="nav-auth">
            <button className="btn-theme" onClick={toggleTheme} title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
              {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </button>
            <Link to="/login" className="btn-login">Masuk</Link>
            <Link to="/register" className="btn-register">Daftar</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}></div>
            ))}
          </div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">✨</span>
            <span>AI-Powered Food Recognition</span>
          </div>
          
          <h1 className="hero-title">
            <span className="title-line">Kenali Makananmu,</span>
            <span className="title-line gradient-text">Kontrol Kalorimu</span>
          </h1>
          
          <p className="hero-description">
            DNAI menggunakan kecerdasan buatan untuk membantu Anda mengidentifikasi makanan,
            melacak kalori, dan mencapai tujuan kesehatan Anda dengan mudah.
          </p>
          
          <div className="hero-buttons">
            <Link to="/register" className="btn-primary">
              <span>Mulai Sekarang</span>
              <span className="btn-icon">→</span>
            </Link>
            <button className="btn-secondary" onClick={() => scrollToSection('features')}>
              <span className="btn-icon">▶</span>
              <span>Lihat Fitur</span>
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">100+</span>
              <span className="stat-label">Jenis Makanan</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">AI</span>
              <span className="stat-label">Powered</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Chatbot</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card main-card">
            <div className="card-header">
              <span className="card-dot red"></span>
              <span className="card-dot yellow"></span>
              <span className="card-dot green"></span>
            </div>
            <div className="card-content">
              <div className="food-preview">
                <span className="food-emoji">🍕</span>
                <div className="scan-line"></div>
              </div>
              <div className="food-info">
                <h4>Pizza Margherita</h4>
                <p>266 kkal per slice</p>
                <div className="nutrition-bars">
                  <div className="bar carbs"><span style={{width: '60%'}}></span></div>
                  <div className="bar protein"><span style={{width: '25%'}}></span></div>
                  <div className="bar fat"><span style={{width: '40%'}}></span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="visual-card floating-card card-1">
            <span className="floating-emoji">🥗</span>
            <span className="floating-cal">150 kkal</span>
          </div>
          
          <div className="visual-card floating-card card-2">
            <span className="floating-emoji">🍜</span>
            <span className="floating-cal">320 kkal</span>
          </div>
          
          <div className="visual-card floating-card card-3">
            <span className="floating-emoji">🍎</span>
            <span className="floating-cal">52 kkal</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <h2 className="section-title">
            <span className="gradient-text">Fitur Unggulan</span>
          </h2>
          <p className="section-description">
            DNAI dilengkapi dengan berbagai fitur canggih untuk membantu perjalanan kesehatan Anda
          </p>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className={`feature-card ${feature.gradient}`}>
                <div className="feature-icon">
                  <span>{feature.icon}</span>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-link">
                  <span>Pelajari lebih lanjut</span>
                  <span className="arrow">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="team-section">
        <div className="section-container">
          <h2 className="section-title">
            <span className="gradient-text">Tim Kami</span>
          </h2>
          <p className="section-description">
            Bertemu dengan orang-orang hebat di balik DNAI
          </p>

          <div className="team-grid">
            {/* First row - 3 members */}
            <div className="team-row">
              {contributors.slice(0, 3).map((member, index) => (
                <div key={index} className="team-card">
                  <div className="member-avatar">
                    <span>{member.avatar}</span>
                    <div className="avatar-ring"></div>
                  </div>
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                  <a href={`https://github.com/${member.github}`} className="member-github" target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>@{member.github}</span>
                  </a>
                </div>
              ))}
            </div>
            
            {/* Second row - 3 members */}
            <div className="team-row">
              {contributors.slice(3, 6).map((member, index) => (
                <div key={index} className="team-card">
                  <div className="member-avatar">
                    <span>{member.avatar}</span>
                    <div className="avatar-ring"></div>
                  </div>
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                  <a href={`https://github.com/${member.github}`} className="member-github" target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>@{member.github}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Siap memulai perjalanan sehat Anda?</h2>
            <p>Bergabung dengan ribuan pengguna yang sudah menggunakan DNAI untuk hidup lebih sehat.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn-cta-primary">
                Daftar Gratis
              </Link>
              <Link to="/login" className="btn-cta-secondary">
                Sudah punya akun? Masuk
              </Link>
            </div>
          </div>
          <div className="cta-decoration">
            <div className="deco-circle circle-1"></div>
            <div className="deco-circle circle-2"></div>
            <div className="deco-circle circle-3"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo">
              <Logo size="small" showText={true} />
            </div>
            <p>AI-Powered Food Recognition & Calorie Tracker</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h4>Navigasi</h4>
              <button onClick={() => scrollToSection('home')}>Home</button>
              <button onClick={() => scrollToSection('features')}>Fitur</button>
              <button onClick={() => scrollToSection('team')}>Tim</button>
            </div>
            <div className="footer-column">
              <h4>Akun</h4>
              <Link to="/login">Masuk</Link>
              <Link to="/register">Daftar</Link>
            </div>
            <div className="footer-column">
              <h4>Tech Stack</h4>
              <span>React + FastAPI</span>
              <span>CLIP + FAISS</span>
              <span>Gemini AI</span>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2024 DNAI. Built with ❤️ by the DNAI Team</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
