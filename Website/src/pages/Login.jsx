import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckSquare, Square } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-fill saved credentials on component mount
  useEffect(() => {
    const savedCreds = localStorage.getItem('smartpo_remembered_credentials');
    if (savedCreds) {
      try {
        const { email: savedEmail, password: savedPassword } = JSON.parse(savedCreds);
        if (savedEmail) setEmail(savedEmail);
        if (savedPassword) setPassword(savedPassword);
        setRememberMe(true);
      } catch (e) {
        // ignore parse error
      }
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Save credentials if Remember Me is checked
      if (rememberMe) {
        localStorage.setItem('smartpo_remembered_credentials', JSON.stringify({ email: email.trim(), password }));
      } else {
        localStorage.removeItem('smartpo_remembered_credentials');
      }

      // Set active user session
      localStorage.setItem('smartpo_registered', 'true');
      localStorage.setItem('smartpo_user', JSON.stringify({ email: email.trim(), name: email.split('@')[0] }));
      setLoading(false);
      navigate('/dashboard');
    }, 500);
  };

  return (
    <div className="app-container" style={{ 
      background: 'radial-gradient(circle at 50% 30%, rgba(79, 70, 229, 0.15) 0%, rgba(15, 23, 42, 1) 70%)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-card animate-fade-in" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem' }}>
        
        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #1A3C6E 0%, #4F46E5 100%)', 
            width: '64px', 
            height: '64px', 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.6rem',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.35)'
          }}>
            SP
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>Welcome Back</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Sign in to access your SmartPO dashboard
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.15)', 
            border: '1px solid rgba(239, 68, 68, 0.4)', 
            borderRadius: 'var(--radius-md)', 
            padding: '0.85rem 1rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={20} color="#EF4444" />
            <span style={{ fontSize: '0.875rem', color: '#F87171', fontWeight: 500 }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type="email" 
                className="form-input" 
                placeholder="name@company.com"
                style={{ paddingLeft: '2.75rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <a href="#forgot" onClick={(e) => e.preventDefault()} style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                Forgot Password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-input" 
                placeholder="••••••••"
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me / Save Password */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', marginBottom: '1.5rem' }}>
            <label 
              onClick={() => setRememberMe(!rememberMe)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-muted)', userSelect: 'none' }}
            >
              {rememberMe ? <CheckSquare size={18} color="var(--primary)" /> : <Square size={18} color="var(--text-dim)" />}
              <span>Remember Me (Save Credentials)</span>
            </label>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : (
              <>
                <span>Login</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Sign Up
          </Link>
        </div>

      </div>
    </div>
  );
}
