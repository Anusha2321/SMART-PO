import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  PlusCircle, 
  Sparkles, 
  User, 
  Settings, 
  LogOut,
  ShoppingCart
} from 'lucide-react';
import { t } from '../lib/languageStore';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/catalog', label: 'Items', icon: Package },
    { path: '/orders', label: 'Purchase Orders', icon: FileText },
    { path: '/create-order', label: 'Create PO', icon: PlusCircle, isCta: true },
    { path: '/ai-assistant', label: 'AI Assistant', icon: Sparkles, badge: 'NEW' },
    { path: '/profile', label: 'Profile & Settings', icon: User }
  ];

  const handleLogout = () => {
    localStorage.removeItem('smartpo_user');
    navigate('/login');
  };

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#0F172A',
      color: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 60,
      boxShadow: '4px 0 12px rgba(0,0,0,0.15)',
      borderRight: '1px solid rgba(255,255,255,0.08)'
    }}>
      {/* Brand Logo Header */}
      <div style={{ padding: '1.5rem 1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
          }}>
            <ShoppingCart size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              SMART PO
            </h2>
            <span style={{ fontSize: '0.725rem', color: '#94A3B8', fontWeight: 500, display: 'block' }}>
              Purchase Order Automation
            </span>
          </div>
        </Link>
      </div>

      {/* Main Navigation Links */}
      <div style={{ padding: '1.25rem 0.85rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: active ? 700 : 500,
                color: active ? '#FFFFFF' : '#94A3B8',
                backgroundColor: active ? '#2563EB' : 'transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <Icon size={19} color={active ? '#FFFFFF' : '#94A3B8'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  backgroundColor: '#F97316',
                  color: 'white',
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  padding: '0.1rem 0.45rem',
                  borderRadius: '4px'
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Profile & Logout Block */}
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#1E293B' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#3B82F6',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}>
              A
            </div>
            <div>
              <h5 style={{ margin: 0, color: 'white', fontSize: '0.875rem', fontWeight: 700 }}>Admin</h5>
              <span style={{ fontSize: '0.725rem', color: '#94A3B8' }}>Administrator</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
