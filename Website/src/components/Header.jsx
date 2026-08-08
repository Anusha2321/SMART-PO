import React, { useState } from 'react';
import { Menu, Bell, Search, Globe, ChevronDown, User, LogOut } from 'lucide-react';
import { LANGUAGES, useLanguage } from '../lib/languageStore';
import { useNavigate } from 'react-router-dom';

export default function Header({ title, subtitle }) {
  const navigate = useNavigate();
  const [currentLang, setLang] = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const selectedLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  const handleLogout = () => {
    localStorage.removeItem('smartpo_user');
    navigate('/login');
  };

  return (
    <header style={{
      height: '70px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      {/* Left Title Block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Menu size={22} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
            {title || 'Dashboard'}
          </h1>
          {subtitle && (
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Right User Actions Block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        
        {/* Language Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.75rem',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#334155'
            }}
          >
            <Globe size={16} color="#2563EB" />
            <span>{selectedLangObj.code.toUpperCase()}</span>
            <ChevronDown size={14} color="#64748B" />
          </button>

          {showLangMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '115%',
              width: '170px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              padding: '0.4rem',
              zIndex: 100
            }}>
              {LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  onClick={() => {
                    setLang(lang.code);
                    setShowLangMenu(false);
                  }}
                  style={{
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.85rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: currentLang === lang.code ? 700 : 400,
                    color: currentLang === lang.code ? '#2563EB' : '#334155',
                    backgroundColor: currentLang === lang.code ? '#EFF6FF' : 'transparent'
                  }}
                >
                  {lang.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notification Icon */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <div style={{
            padding: '0.55rem',
            borderRadius: '50%',
            backgroundColor: '#F1F5F9',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell size={19} />
          </div>
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            backgroundColor: '#EF4444',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 800,
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white'
          }}>
            3
          </span>
        </div>

        {/* Admin Avatar Dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#1E293B',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: '2px solid #2563EB'
            }}>
              A
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>Admin</span>
              <ChevronDown size={14} color="#64748B" />
            </div>
          </div>

          {showUserMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '120%',
              width: '180px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              padding: '0.5rem',
              zIndex: 100
            }}>
              <div
                onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: '#334155', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <User size={16} />
                <span>Profile & Settings</span>
              </div>
              <div
                onClick={handleLogout}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: '#EF4444', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid #F1F5F9' }}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
