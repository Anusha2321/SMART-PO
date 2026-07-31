import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, Building, MapPin, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    companyName: '',
    gstNo: '',
    address: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        alert('Please fill out all required personal fields.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.companyName) {
        alert('Please enter your company name.');
        return;
      }
      setStep(3);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('smartpo_registered', 'true');
    localStorage.setItem('smartpo_user', JSON.stringify({ email: formData.email, name: formData.name, company: formData.companyName }));
    navigate('/dashboard');
  };

  return (
    <div className="app-container" style={{ 
      background: 'radial-gradient(circle at 50% 30%, rgba(79, 70, 229, 0.15) 0%, rgba(15, 23, 42, 1) 70%)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-card animate-fade-in" style={{ maxWidth: '520px', width: '100%', padding: '2.5rem' }}>
        
        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                backgroundColor: step >= s ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
                color: step >= s ? 'white' : 'var(--text-muted)'
              }}>
                {s}
              </div>
              {s < 3 && <div style={{ width: '40px', height: '2px', backgroundColor: step > s ? 'var(--primary)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {/* STEP 1: Personal Details */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create Your Account</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Step 1: Enter your personal details</p>
            </div>

            <form onSubmit={handleNext}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input type="text" name="name" className="form-input" placeholder="John Doe" style={{ paddingLeft: '2.75rem' }} value={formData.name} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input type="email" name="email" className="form-input" placeholder="john@company.com" style={{ paddingLeft: '2.75rem' }} value={formData.email} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input type="tel" name="phone" className="form-input" placeholder="+91 98765 43210" style={{ paddingLeft: '2.75rem' }} value={formData.phone} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input type="password" name="password" className="form-input" placeholder="••••••••" style={{ paddingLeft: '2.75rem' }} value={formData.password} onChange={handleChange} required />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }}>
                <span>Next: Company Info</span>
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: Company Details */}
        {step === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Company Details</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Step 2: Tell us about your business</p>
            </div>

            <form onSubmit={handleNext}>
              <div className="form-group">
                <label className="form-label">Company / Business Name</label>
                <div style={{ position: 'relative' }}>
                  <Building size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input type="text" name="companyName" className="form-input" placeholder="Apex Industrial Supplies" style={{ paddingLeft: '2.75rem' }} value={formData.companyName} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">GST / Tax Identification Number</label>
                <input type="text" name="gstNo" className="form-input" placeholder="27AAAAA0000A1Z5" value={formData.gstNo} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Business Address</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-dim)' }} />
                  <textarea name="address" className="form-input" rows="3" placeholder="Plot No. 42, Industrial Area, Phase II..." style={{ paddingLeft: '2.75rem' }} value={formData.address} onChange={handleChange} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>
                  <ArrowLeft size={18} />
                  <span>Back</span>
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  <span>Complete Setup</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Complete */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle size={64} color="var(--secondary)" style={{ margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Account Created!</h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Welcome aboard, <strong>{formData.name}</strong>! Your business workspace for <strong>{formData.companyName}</strong> is ready.
            </p>
            <button className="btn btn-success" style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }} onClick={handleFinish}>
              Go to SmartPO Dashboard
            </button>
          </div>
        )}

        {/* Footer Link */}
        {step < 3 && (
          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
