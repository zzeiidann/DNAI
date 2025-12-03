import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import Logo from '../Logo/Logo';
import '../Logo/Logo.css';
import './Auth.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email, password);
      if (onLogin) {
        onLogin();
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-gradient"></div>
      </div>
      
      <Link to="/" className="back-home">
        <span>←</span> Kembali ke Beranda
      </Link>
      
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Logo size="large" showText={false} />
            <h1>DNAI</h1>
            <p className="subtitle">Masuk ke akun Anda</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && <p className="error-message">{error}</p>}
            
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Belum punya akun? <Link to="/register">Daftar di sini</Link>
            </p>
          </div>
          
          <div className="demo-account">
            <p>Demo Account:</p>
            <code>admin@dnai.com / admin</code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
