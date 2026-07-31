import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { 
  User, 
  Lock, 
  Shield, 
  FileText, 
  LogOut, 
  ChevronRight, 
  X,
  CheckCircle2,
  AlertCircle,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LANGUAGES, useLanguage, t } from '../lib/languageStore';

export default function Profile() {
  const navigate = useNavigate();
  const [currentLang, setLang] = useLanguage();

  // User Profile Data state
  const [userName, setUserName] = useState("Admin Account");
  const [userEmail, setUserEmail] = useState("admin@smartpo.com");
  const [userPhone, setUserPhone] = useState("+91 98765 43210");
  const [userCompany, setUserCompany] = useState("SmartPO Ltd");

  // Dialog Visibility States
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Load user details from localStorage
  useEffect(() => {
    const savedUserStr = localStorage.getItem('smartpo_user');
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser.name) setUserName(savedUser.name);
        if (savedUser.email) setUserEmail(savedUser.email);
        if (savedUser.company) setUserCompany(savedUser.company);
        if (savedUser.phone) setUserPhone(savedUser.phone);
      } catch (e) {
        // ignore parse error
      }
    }
  }, []);

  // Edit Profile Inputs
  const [tempName, setTempName] = useState(userName);
  const [tempPhone, setTempPhone] = useState(userPhone);
  const [tempCompany, setTempCompany] = useState(userCompany);

  // Change Password Inputs
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName);
      setUserPhone(tempPhone);
      setUserCompany(tempCompany);

      const updatedUser = {
        name: tempName.trim(),
        email: userEmail,
        company: tempCompany.trim(),
        phone: tempPhone.trim()
      };
      localStorage.setItem('smartpo_user', JSON.stringify(updatedUser));
      setShowEditProfile(false);
    }
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordSuccess(true);
    setTimeout(() => {
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(false);
    }, 1200);
  };

  const handleLogout = () => {
    localStorage.removeItem('smartpo_user');
    navigate('/login');
  };

  // Initials generator
  const initials = userName.split(" ")
    .map(n => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("").toUpperCase() || "A";

  const selectedLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content animate-fade-in" style={{ maxWidth: '640px' }}>
        
        {/* Profile Header Avatar */}
        <div className="glass-card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            background: '#1A3C6E', 
            width: '90px', 
            height: '90px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: '2.2rem',
            margin: '0 auto 1.25rem',
            border: '3px solid #F97316',
            boxShadow: '0 8px 25px rgba(26, 60, 110, 0.4)'
          }}>
            {initials}
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>{userName}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>{userEmail}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{userPhone}</p>
          <p style={{ color: '#F97316', fontSize: '0.95rem', fontWeight: 600, marginTop: '0.2rem' }}>{t('company')}: {userCompany}</p>
        </div>

        {/* Section 1: Account & Language Actions */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
          
          {/* Edit Profile */}
          <div 
            onClick={() => {
              setTempName(userName);
              setTempPhone(userPhone);
              setTempCompany(userCompany);
              setShowEditProfile(true);
            }}
            style={{ 
              padding: '1.1rem 1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderBottom: '1px solid var(--border)',
              transition: 'background-color 0.2s'
            }}
            className="profile-item-hover"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <User size={24} color="#93C5FD" />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{t('edit_profile')}</h4>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('edit_profile_desc')}</span>
              </div>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>

          {/* App Language Switcher */}
          <div 
            onClick={() => setShowLanguageModal(true)}
            style={{ 
              padding: '1.1rem 1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderBottom: '1px solid var(--border)',
              transition: 'background-color 0.2s'
            }}
            className="profile-item-hover"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Globe size={24} color="#F97316" />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{t('app_language')}</h4>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current: {selectedLangObj.name}</span>
              </div>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>

          {/* Change Password */}
          <div 
            onClick={() => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setPasswordError('');
              setShowChangePassword(true);
            }}
            style={{ 
              padding: '1.1rem 1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            className="profile-item-hover"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Lock size={24} color="#93C5FD" />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{t('change_password')}</h4>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('change_password_desc')}</span>
              </div>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>

        </div>

        {/* Section 2: Legal & Policies */}
        <div className="card" style={{ marginBottom: '2rem', padding: 0, overflow: 'hidden' }}>
          
          {/* Privacy Policy */}
          <div 
            onClick={() => setShowPrivacy(true)}
            style={{ 
              padding: '1.1rem 1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderBottom: '1px solid var(--border)',
              transition: 'background-color 0.2s'
            }}
            className="profile-item-hover"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Shield size={24} color="#93C5FD" />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{t('privacy_policy')}</h4>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('privacy_desc')}</span>
              </div>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>

          {/* Terms & Conditions */}
          <div 
            onClick={() => setShowTerms(true)}
            style={{ 
              padding: '1.1rem 1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            className="profile-item-hover"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <FileText size={24} color="#93C5FD" />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{t('terms_conditions')}</h4>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('terms_desc')}</span>
              </div>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </div>

        </div>

        {/* Logout Button */}
        <button 
          className="btn btn-danger" 
          style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 700, borderRadius: '9999px' }} 
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span>{t('logout')}</span>
        </button>

      </main>

      {/* DIALOG: Language Selector Modal */}
      {showLanguageModal && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowLanguageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Select App Language</h3>
              <button className="btn btn-icon" onClick={() => setShowLanguageModal(false)}><X size={20} /></button>
            </div>

            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
              {LANGUAGES.map((lang) => (
                <div 
                  key={lang.code}
                  onClick={() => {
                    setLang(lang.code);
                    setShowLanguageModal(false);
                  }}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: currentLang === lang.code ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
                    border: currentLang === lang.code ? '1px solid #F97316' : '1px solid transparent',
                    marginBottom: '0.5rem'
                  }}
                >
                  <span style={{ fontWeight: currentLang === lang.code ? 700 : 500, color: currentLang === lang.code ? '#F97316' : 'white' }}>
                    {lang.name}
                  </span>
                  {currentLang === lang.code && <CheckCircle2 size={18} color="#F97316" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DIALOG 1: Edit Profile Modal */}
      {showEditProfile && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowEditProfile(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Edit Profile</h3>
              <button className="btn btn-icon" onClick={() => setShowEditProfile(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" value={tempName} onChange={(e) => setTempName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="text" className="form-input" value={tempPhone} onChange={(e) => setTempPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input type="text" className="form-input" value={tempCompany} onChange={(e) => setTempCompany(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowEditProfile(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, backgroundColor: '#1A3C6E' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG 2: Change Password Modal */}
      {showChangePassword && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowChangePassword(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Change Password</h3>
              <button className="btn btn-icon" onClick={() => setShowChangePassword(false)}><X size={20} /></button>
            </div>

            {passwordError && (
              <div style={{ padding: '0.75rem 1rem', background: 'var(--danger-light)', borderRadius: 'var(--radius-md)', color: '#F87171', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(249, 115, 22, 0.2)', borderRadius: 'var(--radius-md)', color: '#F97316', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} />
                <span>Password updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowChangePassword(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, backgroundColor: '#1A3C6E' }}>Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG 3: Privacy Policy Modal */}
      {showPrivacy && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowPrivacy(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem', maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Privacy Policy</h3>
              <button className="btn btn-icon" onClick={() => setShowPrivacy(false)}><X size={20} /></button>
            </div>

            <div style={{ maxHeight: '360px', overflowY: 'auto', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingRight: '0.5rem' }}>
              <p style={{ fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>Effective Date: July 24, 2026</p>
              <p style={{ marginBottom: '1rem' }}>
                At SmartPO, we prioritize the protection and confidentiality of your business and personal data. This Privacy Policy details how we collect, store, and process your purchasing information.
              </p>
              <h4 style={{ color: 'white', fontSize: '0.95rem', margin: '1rem 0 0.25rem' }}>1. Data Collection</h4>
              <p style={{ marginBottom: '1rem' }}>
                We collect account details (name, email, phone number) and purchase order (PO) generation data, including item names, catalog metadata, and prices, to facilitate seamless PO management.
              </p>
              <h4 style={{ color: 'white', fontSize: '0.95rem', margin: '1rem 0 0.25rem' }}>2. Data Utilization</h4>
              <p style={{ marginBottom: '1rem' }}>
                Your data is solely used to process purchase orders, match catalog items using our Gemini AI assistant, and verify analytics. We do not sell or share your data with unauthorized third parties.
              </p>
              <h4 style={{ color: 'white', fontSize: '0.95rem', margin: '1rem 0 0.25rem' }}>3. Security Measures</h4>
              <p>
                We employ state-of-the-art encryption protocols (HTTPS, end-to-end database security via Supabase) to ensure all data remains protected against unauthorized breaches. Reach support@smartpo.com for queries.
              </p>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', backgroundColor: '#1A3C6E' }} onClick={() => setShowPrivacy(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* DIALOG 4: Terms & Conditions Modal */}
      {showTerms && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowTerms(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem', maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Terms & Conditions</h3>
              <button className="btn btn-icon" onClick={() => setShowTerms(false)}><X size={20} /></button>
            </div>

            <div style={{ maxHeight: '360px', overflowY: 'auto', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingRight: '0.5rem' }}>
              <p style={{ fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>Effective Date: July 24, 2026</p>
              <p style={{ marginBottom: '1rem' }}>
                Welcome to SmartPO. By accessing and using our application, you agree to comply with the following Terms and Conditions.
              </p>
              <h4 style={{ color: 'white', fontSize: '0.95rem', margin: '1rem 0 0.25rem' }}>1. License & Access</h4>
              <p style={{ marginBottom: '1rem' }}>
                We grant you a non-transferable, non-exclusive license to use the SmartPO platform strictly for generating, reviewing, and handling company purchase orders.
              </p>
              <h4 style={{ color: 'white', fontSize: '0.95rem', margin: '1rem 0 0.25rem' }}>2. AI Feature Usage</h4>
              <p style={{ marginBottom: '1rem' }}>
                Our AI Order Assistant is powered by Gemini AI. While we strive for extreme precision in catalog matching, all AI-generated matching results must be verified by the admin before making final purchase orders.
              </p>
              <h4 style={{ color: 'white', fontSize: '0.95rem', margin: '1rem 0 0.25rem' }}>3. Account Responsibility</h4>
              <p style={{ marginBottom: '1rem' }}>
                You are fully responsible for maintaining the confidentiality of your credentials. Any actions performed under your account will be deemed authorized by your organization.
              </p>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', backgroundColor: '#1A3C6E' }} onClick={() => setShowTerms(false)}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
