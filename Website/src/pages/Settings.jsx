import React from 'react';
import Navbar from '../components/Navbar';
import { Settings as SettingsIcon, Database, Moon, Bell, Shield } from 'lucide-react';

export default function Settings() {
  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content animate-fade-in">
        
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
            <SettingsIcon size={26} color="var(--primary)" />
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Application Settings</h1>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Cloud Configuration</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Supabase Cloud Connection</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Connected to PostgreSQL Database</span>
              </div>
              <span className="badge badge-success">Online</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Gemini AI Model Engine</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gemini 3.6 Flash for Order Parsing</span>
              </div>
              <span className="badge badge-primary">Active</span>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Preferences</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Theme Mode</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dark Navy Glassmorphic Theme</span>
              </div>
              <span className="badge badge-primary">Enabled</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Offline Fallback Cache</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Auto fallback when offline</span>
              </div>
              <span className="badge badge-success">Enabled</span>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
