import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="app-container" style={{ 
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem'
    }}>
      <div className="glass-card animate-fade-in" style={{ 
        maxWidth: '520px', 
        width: '100%', 
        padding: '3.5rem 2.5rem', 
        textAlign: 'center',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Logo Badge */}
        <div style={{ 
          background: '#1A3C6E', 
          width: '72px', 
          height: '72px', 
          borderRadius: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white',
          fontWeight: 800,
          fontSize: '2rem',
          margin: '0 auto 1.5rem',
          boxShadow: '0 8px 20px rgba(26, 60, 110, 0.4)'
        }}>
          SP
        </div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem', color: '#F8FAFC' }}>
          Welcome to <span style={{ color: '#F97316' }}>SmartPO</span>
        </h1>

        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', margin: '0 auto 3rem', lineHeight: 1.5 }}>
          Create and manage your Purchase Orders with ease.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 700, backgroundColor: '#1A3C6E' }} 
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 700 }} 
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
