import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Package, 
  FileText, 
  Sparkles, 
  User, 
  LogOut, 
  PlusCircle,
  Globe
} from 'lucide-react';
import { LANGUAGES, useLanguage, t } from '../lib/languageStore';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentLang, setLang] = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: t('home'), icon: Home },
    { path: '/catalog', label: t('catalog'), icon: Package },
    { path: '/orders', label: t('orders'), icon: FileText },
    { path: '/ai-assistant', label: t('ai_assistant'), icon: Sparkles, badge: 'NEW' },
    { path: '/profile', label: t('profile'), icon: User },
  ];

  const handleLogout = () => {
    localStorage.removeItem('smartpo_user');
    navigate('/login');
  };

  const selectedLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <nav className="glass" style={{ padding: '0.85rem 2rem', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{ 
              background: '#1A3C6E', 
              width: '40px', 
              height: '40px', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.2rem',
              boxShadow: '0 4px 12px rgba(26, 60, 110, 0.3)',
              border: '2px solid #F97316'
            }}>
              SP
            </div>
            <h2 style={{ margin: 0, color: 'var(--text)', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Smart<span style={{ color: '#F97316' }}>PO</span>
            </h2>
          </Link>

          {/* Navigation Links */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: active ? 700 : 500,
                    color: active ? 'white' : 'var(--text-muted)',
                    backgroundColor: active ? 'rgba(26, 60, 110, 0.4)' : 'transparent',
                    border: active ? '1px solid rgba(26, 60, 110, 0.6)' : '1px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={18} color={active ? '#F97316' : 'currentColor'} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="badge" style={{ backgroundColor: '#F97316', color: 'white', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Quick Actions & Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
          
          {/* Language Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowLangMenu(!showLangMenu)}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(26, 60, 110, 0.2)' }}
            >
              <Globe size={16} color="#F97316" />
              <span>{selectedLangObj.code.toUpperCase()}</span>
            </button>

            {showLangMenu && (
              <div 
                className="glass-card animate-fade-in" 
                style={{ 
                  position: 'absolute', 
                  right: 0, 
                  top: '120%', 
                  width: '180px', 
                  padding: '0.5rem', 
                  maxHeight: '260px', 
                  overflowY: 'auto',
                  zIndex: 100,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
              >
                {LANGUAGES.map((lang) => (
                  <div
                    key={lang.code}
                    onClick={() => {
                      setLang(lang.code);
                      setShowLangMenu(false);
                    }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.85rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: currentLang === lang.code ? 700 : 400,
                      color: currentLang === lang.code ? '#F97316' : 'white',
                      backgroundColor: currentLang === lang.code ? 'rgba(249, 115, 22, 0.15)' : 'transparent'
                    }}
                  >
                    {lang.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/create-order')}
            style={{ padding: '0.55rem 1.1rem', fontSize: '0.875rem', backgroundColor: '#1A3C6E' }}
          >
            <PlusCircle size={18} color="#F97316" />
            <span>{t('create_new_po')}</span>
          </button>

          <button 
            className="btn btn-icon" 
            onClick={handleLogout} 
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>

      </div>
    </nav>
  );
}
