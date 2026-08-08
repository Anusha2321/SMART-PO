import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckSquare, Square, X } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);

  // Pre-configured Google accounts for the chooser
  const googleAccounts = [
    { email: 'admin@gmail.com', name: 'SmartPO Administrator', avatar: 'A', bg: '#2563EB' },
    { email: 'anusha@gmail.com', name: 'Anusha (SmartPO Lead)', avatar: 'A', bg: '#F97316' },
    { email: 'user@gmail.com', name: 'Standard User Account', avatar: 'U', bg: '#10B981' }
  ];

  useEffect(() => {
    const savedCreds = localStorage.getItem('smartpo_remembered_credentials');
    if (savedCreds) {
      try {
        const { username: savedUser, password: savedPassword } = JSON.parse(savedCreds);
        if (savedUser) setUsername(savedUser);
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
      // Check registered users storage
      const usersStr = localStorage.getItem('smartpo_registered_users');
      let registeredUsers = [];
      try {
        if (usersStr) registeredUsers = JSON.parse(usersStr);
      } catch (e) {}

      // Look up account
      const match = registeredUsers.find(u => 
        (u.username && u.username.toLowerCase() === inputUser) || 
        (u.email && u.email.toLowerCase() === inputUser)
      );

      if (match) {
        // STRICT PASSWORD CHECK
        if (match.password !== password) {
          setLoading(false);
          setError('Incorrect password. Please verify your password and try again.');
          return;
        }
      } else {
        // If logging in with demo credentials, enforce password check
        const isDemoAdmin = (inputUser === 'admin' || inputUser === 'admin@gmail.com');
        if (isDemoAdmin) {
          if (password !== 'admin123' && password !== 'password123') {
            setLoading(false);
            setError('Incorrect password. Verify password for admin account.');
            return;
          }
        } else {
          // If custom user not found in registered database and wrong password
          if (password !== 'admin123' && password !== 'password123' && password !== '123456') {
            setLoading(false);
            setError('Incorrect username or password. Please try again.');
            return;
          }
        }
      }

      // Success! Save session
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

  const handleSelectGoogleAccount = (acc) => {
    setShowGoogleChooser(false);
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('smartpo_registered', 'true');
      localStorage.setItem('smartpo_user', JSON.stringify({ email: acc.email, name: acc.name }));
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <a 
                href="#forgot" 
                onClick={(e) => { e.preventDefault(); alert('Password reset instructions sent to your registered email.'); }}
                style={{ fontSize: '0.8rem', color: '#2563EB', textDecoration: 'none', fontWeight: 700 }}
              >
                Forgot Password?
              </a>
            </div>
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
              <span>Remember Me (Save Username & Password)</span>
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

        {/* OR Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: '#94A3B8', fontSize: '0.8rem', fontWeight: 700 }}>
          <div style={{ flex: 1, borderBottom: '1px solid #E2E8F0' }} />
          <span style={{ padding: '0 0.75rem' }}>OR</span>
          <div style={{ flex: 1, borderBottom: '1px solid #E2E8F0' }} />
        </div>

        {/* Continue with Google Button */}
        <button 
          onClick={() => setShowGoogleChooser(true)}
          type="button"
          className="btn btn-secondary"
          style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', color: '#334155', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Don't have an account? Sign Up Link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: '#64748B' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
            Sign Up
          </Link>
        </div>

      </div>

      {/* Google Account Selector Modal */}
      {showGoogleChooser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '2rem', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Choose a Google Account</h3>
              </div>
              <button 
                onClick={() => setShowGoogleChooser(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Select an email account to sign in to SmartPO:
            </p>

            {/* Account List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {googleAccounts.map((acc) => (
                <div
                  key={acc.email}
                  onClick={() => handleSelectGoogleAccount(acc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    backgroundColor: '#FFFFFF',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                >
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: acc.bg,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}>
                    {acc.avatar}
                  </div>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.9rem', color: '#0F172A', fontWeight: 700 }}>{acc.name}</h5>
                    <span style={{ fontSize: '0.775rem', color: '#64748B' }}>{acc.email}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
