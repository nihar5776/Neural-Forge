import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Lock, Mail, User, AlertCircle, Loader, Radio } from 'lucide-react';
import { PageTransition, TiltCard, NeuralDecodeText, MagneticButton } from '../components/MotionWrappers';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const validateName = (val) => {
    if (!val) return 'Name is mandatory';
    if (val.length < 3) return 'Name must be at least 3 characters';
    if (/[^a-zA-Z0-9\s]/.test(val)) return 'Name must not contain special characters';
    return '';
  };

  const validateEmail = (val) => {
    if (!val) return 'Email address is mandatory';
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(val)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (val) => {
    if (!val) return 'Password is mandatory';
    if (val.length < 6) return 'Password must contain at least 6 characters';
    return '';
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (fieldErrors.name) {
      setFieldErrors(prev => ({ ...prev, name: validateName(val) }));
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (fieldErrors.email) {
      setFieldErrors(prev => ({ ...prev, email: validateEmail(val) }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: validatePassword(val) }));
    }
  };

  const validateForm = () => {
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setFieldErrors({
      name: nameErr,
      email: emailErr,
      password: passwordErr
    });

    return !nameErr && !emailErr && !passwordErr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/auth/register', { name, email, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const msg = err.message || 'Registration failed. Try a different email.';
      const msgLower = msg.toLowerCase();
      if (msgLower.includes('already exists') || msgLower.includes('email')) {
        setFieldErrors(prev => ({ ...prev, email: msg }));
      } else if (msgLower.includes('name')) {
        setFieldErrors(prev => ({ ...prev, name: msg }));
      } else if (msgLower.includes('password')) {
        setFieldErrors(prev => ({ ...prev, password: msg }));
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="auth-page animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'transparent' }}>
      <TiltCard className="auth-card" style={{ padding: '48px', maxWidth: '440px', width: '100%', borderTop: '2px solid hsla(var(--primary), 0.5)' }}>
        <div className="auth-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid hsla(var(--primary), 0.3)', boxShadow: '0 0 30px hsla(var(--primary), 0.2)' }}>
            <Radio size={32} color="hsl(var(--primary))" />
          </div>
          <h2 style={{ fontSize: '28px', margin: 0, textShadow: '0 0 20px hsla(var(--primary), 0.5)' }}>
            <NeuralDecodeText text="Initialize Profile" />
          </h2>
          <p className="auth-subtitle" style={{ color: 'hsl(var(--text-muted))', margin: 0, textAlign: 'center' }}>Establish a new neural identity for career operations</p>
        </div>

        {error && (
          <div className="auth-error-alert" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'hsla(var(--danger), 0.1)', color: 'hsl(var(--danger))', borderRadius: '8px', border: '1px solid hsla(var(--danger), 0.3)' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-success-alert" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'hsla(var(--success), 0.1)', color: 'hsl(var(--success))', borderRadius: '8px', border: '1px solid hsla(var(--success), 0.3)' }}>
            <span>Identity confirmed! Diverting to secure login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'hsl(var(--text-main))' }}>Designation (Full Name)</label>
            <div className={`input-with-icon ${fieldErrors.name ? 'has-error' : ''}`} style={{ position: 'relative' }}>
              <User className="input-icon" size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={handleNameChange}
                onBlur={() => {
                  const err = validateName(name);
                  setFieldErrors(prev => ({ ...prev, name: err }));
                }}
                required
                style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', background: 'hsla(0,0%,100%,0.02)', border: '1px solid hsla(0,0%,100%,0.05)', color: 'hsl(var(--text-main))', fontSize: '15px', outline: 'none' }}
              />
            </div>
            {fieldErrors.name && (
              <span className="field-error-message" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--danger))', fontSize: '12px', marginTop: '6px' }}>
                <AlertCircle size={14} />
                {fieldErrors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'hsl(var(--text-main))' }}>Communication Vector (Email)</label>
            <div className={`input-with-icon ${fieldErrors.email ? 'has-error' : ''}`} style={{ position: 'relative' }}>
              <Mail className="input-icon" size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => {
                  const err = validateEmail(email);
                  setFieldErrors(prev => ({ ...prev, email: err }));
                }}
                required
                style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', background: 'hsla(0,0%,100%,0.02)', border: '1px solid hsla(0,0%,100%,0.05)', color: 'hsl(var(--text-main))', fontSize: '15px', outline: 'none' }}
              />
            </div>
            {fieldErrors.email && (
              <span className="field-error-message" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--danger))', fontSize: '12px', marginTop: '6px' }}>
                <AlertCircle size={14} />
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'hsl(var(--text-main))' }}>Security Protocol (Password)</label>
            <div className={`input-with-icon ${fieldErrors.password ? 'has-error' : ''}`} style={{ position: 'relative' }}>
              <Lock className="input-icon" size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => {
                  const err = validatePassword(password);
                  setFieldErrors(prev => ({ ...prev, password: err }));
                }}
                required
                style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', background: 'hsla(0,0%,100%,0.02)', border: '1px solid hsla(0,0%,100%,0.05)', color: 'hsl(var(--text-main))', fontSize: '15px', outline: 'none' }}
              />
            </div>
            {fieldErrors.password && (
              <span className="field-error-message" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--danger))', fontSize: '12px', marginTop: '6px' }}>
                <AlertCircle size={14} />
                {fieldErrors.password}
              </span>
            )}
          </div>

          <MagneticButton type="submit" className="btn-primary auth-submit-btn" disabled={loading || success} style={{ padding: '16px', borderRadius: '100px', fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
            {loading ? (
              <>
                <Loader className="spinner" size={18} />
                Provisioning Identity...
              </>
            ) : (
              'Initialize Sequence'
            )}
          </MagneticButton>
        </form>

        <div className="auth-footer" style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'hsl(var(--text-muted))' }}>
          <p>
            Already registered? <Link to="/login" className="auth-link" style={{ color: 'hsl(var(--primary))', textDecoration: 'none', fontWeight: '600' }}>Access system here</Link>
          </p>
        </div>
      </TiltCard>
    </PageTransition>
  );
}
