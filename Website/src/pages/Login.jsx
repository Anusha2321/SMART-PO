import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, AlertCircle, CheckSquare, Square } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto-fill saved credentials if available
    const savedCreds = localStorage.getItem('smartpo_remembered_credentials');
    if (savedCreds) {
      try {
        const { username: savedUser, password: savedPassword } = JSON.parse(savedCreds);
        if (savedUser) setUsername(savedUser);
        if (savedPassword) setPassword(savedPassword);
        setRememberMe(true);
      } catch (e) {}
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError(null);

    const inputUser = username.trim().toLowerCase();
    if (!inputUser) {
      setError('Please enter your Username or Email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your Password');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const usersStr = localStorage.getItem('smartpo_registered_users');
      let registeredUsers = [];
      try {
        if (usersStr) registeredUsers = JSON.parse(usersStr);
      } catch (e) {}

      const match = registeredUsers.find(u => 
        (u.username && u.username.toLowerCase() === inputUser) || 
        (u.email && u.email.toLowerCase() === inputUser)
      );

      if (match) {
        if (match.password !== password) {
          setLoading(false);
          setError('Incorrect password. Please verify your password and try again.');
          return;
        }
      } else {
        const isDemoUser = (inputUser.includes('anusha') || inputUser === 'admin' || inputUser === 'admin@smartpo.com');
        if (isDemoUser) {
          if (password !== 'admin123' && password !== 'password123' && password !== '123456') {
            setLoading(false);
            setError('Incorrect password. Verify password for your account.');
            return;
          }
        } else {
          if (password !== 'admin123' && password !== 'password123' && password !== '123456') {
            setLoading(false);
            setError('Incorrect username or password. Please try again.');
            return;
          }
        }
      }

      if (rememberMe) {
        localStorage.setItem('smartpo_remembered_credentials', JSON.stringify({ username: inputUser, password }));
      } else {
        localStorage.removeItem('smartpo_remembered_credentials');
      }

      localStorage.setItem('smartpo_registered', 'true');
      localStorage.setItem('smartpo_user', JSON.stringify({ email: inputUser, name: match ? match.name : inputUser.split('@')[0] }));
      setLoading(false);
      navigate('/dashboard');
    }, 400);
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F8FAFC',
      padding: '1.5rem'
    }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', 
            width: '56px', 
            height: '56px', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.5rem',
            margin: '0 auto 1rem',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
          }}>
            SP
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A' }}>Sign In to SmartPO</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            Enter your credentials to access your portal
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{ 
            backgroundColor: '#FEF2F2', 
            border: '1px solid #FECACA', 
            borderRadius: '8px', 
            padding: '0.75rem 1rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.65rem',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={18} color="#DC2626" />
            <span style={{ fontSize: '0.85rem', color: '#DC2626', fontWeight: 600 }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Username / Email */}
          <div className="form-group">
            <label className="form-label">Username or Email</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Username or email address..."
                style={{ paddingLeft: '2.5rem' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-input" 
                placeholder="••••••••"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '0.85rem 0 1.25rem' }}>
            <label 
              onClick={() => setRememberMe(!rememberMe)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#475569', userSelect: 'none', fontWeight: 600 }}
            >
              {rememberMe ? <CheckSquare size={18} color="#2563EB" /> : <Square size={18} color="#94A3B8" />}
              <span>Remember Me (Save Credentials)</span>
            </label>
          </div>

          {/* Sign In Button */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Don't have an account? Sign Up Link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: '#64748B' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
            Sign Up
          </Link>
        </div>

      </div>
    </div>
  );
}
