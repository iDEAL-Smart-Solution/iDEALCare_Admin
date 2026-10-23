// src/pages/auth/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Building2,
  Sun,
  Moon,
  Heart,
  CheckCircle2,
  Wifi,
} from 'lucide-react';
import { usePlatformAuthStore } from '../../stores/platformAuthStore';
import { Button } from '../../components/Button';
import { Logo } from '../../components/Logo';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Theme synchronization with local storage and root data-theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('idealcare_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('idealcare_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const { isAuthenticated, login, isLoading, error, clearError } = usePlatformAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!email.trim()) {
      setValidationError('Please enter your administrator email address.');
      return;
    }
    if (!password) {
      setValidationError('Please enter your administrator password.');
      return;
    }

    const success = await login({ email: email.trim(), password });
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── LEFT HERO: Medical Platform Showcase ────────────────────────── */}
      <div
        style={{
          flex: '1.15',
          backgroundColor: 'var(--surface-elevated)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="medical-hero-panel"
      >
        {/* Decorative Grid & Ambient Medical Glows */}
        <div
          className="medical-grid-pattern"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.65,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 18%, transparent) 0%, transparent 70%)',
            top: '-60px',
            right: '-60px',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 10%, transparent) 0%, transparent 70%)',
            bottom: '40px',
            left: '-40px',
            pointerEvents: 'none',
          }}
        />

        {/* Top Branding & Live Telemetry Chip */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <Logo size={46} variant="full" subtitle="Health Enterprise Cloud" />

            {/* Live Infrastructure Status */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span className="live-beacon" />
              <span>Clinical Cloud: Operational</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>• 99.99%</span>
            </div>
          </div>
        </div>

        {/* Main Hero Message & Interactive Medical Vitals Card */}
        <div style={{ position: 'relative', zIndex: 2, margin: '48px 0' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            <ShieldCheck size={14} /> Multi-Tenant Clinical Architecture
          </div>

          <h1
            style={{
              fontSize: '2.35rem',
              fontWeight: 800,
              lineHeight: 1.18,
              letterSpacing: '-0.03em',
              color: 'var(--text-h)',
              marginBottom: '16px',
              maxWidth: '560px',
            }}
          >
            Intelligent Platform Governance for <span style={{ color: 'var(--accent)' }}>Modern Healthcare</span>
          </h1>

          <p
            style={{
              fontSize: '0.98rem',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
              maxWidth: '540px',
              marginBottom: '32px',
            }}
          >
            Unified administrative orchestration across hospitals, specialist clinics, and nursing facilities.
            Enforcing strict tenant database isolation, automated subscription lifecycle management, and
            cryptographically verifiable audit trails.
          </p>

          {/* Animated Clinical ECG & Telemetry Card */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '20px 24px',
              boxShadow: 'var(--shadow-md)',
              maxWidth: '540px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Heart size={14} className="cardiac-pulse" style={{ color: '#ef4444' }} />
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-h)' }}>
                  CLINICAL MONITOR &bull; LEAD II TELEMETRY
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--accent)',
                }}
              >
                <Wifi size={12} />
                <span>LIVE FEED</span>
              </div>
            </div>

            {/* SVG ECG Waveform Animation */}
            <div
              style={{
                height: '56px',
                width: '100%',
                position: 'relative',
                background: 'color-mix(in srgb, var(--surface-elevated) 80%, transparent)',
                borderRadius: '8px',
                padding: '4px 0',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <svg
                viewBox="0 0 500 60"
                style={{
                  width: '100%',
                  height: '100%',
                  stroke: 'var(--accent)',
                  fill: 'none',
                  strokeWidth: '2.2',
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  filter: 'drop-shadow(0 0 4px var(--accent))',
                }}
              >
                <path
                  className="ecg-line"
                  d="M0,30 L60,30 L75,30 L85,15 L95,45 L105,8 L115,50 L125,30 L150,30 L210,30 L225,30 L235,15 L245,45 L255,8 L265,50 L275,30 L300,30 L360,30 L375,30 L385,15 L395,45 L405,8 L415,50 L425,30 L450,30 L500,30"
                />
              </svg>
            </div>

            {/* Vitals Telemetry Numbers */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
                  Heart Rhythm
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-h)' }}>
                  72 <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-muted)' }}>BPM</span>
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
                  Schema Isolation
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--success)' }}>
                  100% <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-muted)' }}>VERIFIED</span>
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
                  Encryption Standard
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)' }}>
                  TLS 1.3 <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-muted)' }}>AES</span>
                </span>
              </div>
            </div>
          </div>

          {/* Three Architectural Highlights */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '12px',
              marginTop: '28px',
              maxWidth: '540px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: 'color-mix(in srgb, var(--surface) 60%, transparent)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  padding: '6px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 2px 0', color: 'var(--text-h)' }}>
                  Zero Cross-Facility Leakage
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                  Every hospital and clinic tenant executes within dedicated tenant boundaries with verified EF Core global query filtering.
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: 'color-mix(in srgb, var(--surface) 60%, transparent)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  padding: '6px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  flexShrink: 0,
                }}
              >
                <Building2 size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 2px 0', color: 'var(--text-h)' }}>
                  Automated Subscription Lifecycle
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                  Real-time subscription status validation, grace period management, and transparent hospital billing governance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Footer Badges */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            paddingTop: '20px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
            <span>NDPR & Healthcare Data Protected</span>
          </div>
          <div>iDEAL Smart Solution &bull; Enterprise Health Suite</div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Administrator Authentication Console ───────────── */}
      <div
        style={{
          flex: '0.85',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 32px',
          position: 'relative',
          backgroundColor: 'var(--bg)',
        }}
      >
        {/* Top Controls: Theme Switcher & System Status */}
        <div
          style={{
            position: 'absolute',
            top: '32px',
            right: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 10,
          }}
        >
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '9999px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--transition)',
              boxShadow: 'var(--shadow-sm)',
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={15} style={{ color: '#f59e0b' }} />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon size={15} style={{ color: 'var(--accent)' }} />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>

        {/* Authentication Form Card */}
        <div
          style={{
            width: '100%',
            maxWidth: '430px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '40px 36px',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Card Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'inline-flex', marginBottom: '16px' }}>
              <Logo size={52} variant="mark" />
            </div>

            <h2
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                color: 'var(--text-h)',
                letterSpacing: '-0.02em',
                marginBottom: '6px',
              }}
            >
              Platform Administrator
            </h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                lineHeight: 1.45,
                margin: 0,
              }}
            >
              Authenticate session credentials to govern health networks, tenants, and clinical subscriptions
            </p>
          </div>

          {/* Error Banner */}
          {(validationError || error) && (
            <div
              className="alert alert-danger"
              style={{
                marginBottom: '20px',
                padding: '12px 14px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '0.85rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{validationError || error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label
                className="form-label"
                htmlFor="admin-email"
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--text-h)',
                  marginBottom: '6px',
                  display: 'block',
                }}
              >
                Administrator Email ID
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Mail size={18} />
                </span>
                <input
                  id="admin-email"
                  type="email"
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 42px',
                    fontSize: '0.9rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    boxSizing: 'border-box',
                    transition: 'var(--transition)',
                  }}
                  placeholder="admin@idealsmart.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label
                className="form-label"
                htmlFor="admin-password"
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--text-h)',
                  marginBottom: '6px',
                  display: 'block',
                }}
              >
                Security Master Password
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Lock size={18} />
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '11px 42px 11px 42px',
                    fontSize: '0.9rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    boxSizing: 'border-box',
                    transition: 'var(--transition)',
                  }}
                  placeholder="Enter authorized password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    padding: '4px',
                    borderRadius: '4px',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                marginBottom: '24px',
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                lineHeight: 1.45,
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <ShieldCheck size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span>
                Session IP and timestamp are encrypted & recorded to the permanent regulatory audit trail.
              </span>
            </div>

            {/* Login Action Button */}
            <Button
              type="submit"
              variant="primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: '10px',
                boxShadow: '0 6px 20px color-mix(in srgb, var(--accent) 35%, transparent)',
              }}
              isLoading={isLoading}
              rightIcon={<ArrowRight size={18} />}
            >
              Authorize Administrator Session
            </Button>
          </form>

          {/* Footer inside card */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '18px',
              borderTop: '1px solid var(--border)',
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            iDEAL Care Multi-Tenant System &bull; Version 2.4.0
          </div>
        </div>

        {/* External Copyright & Regulatory notice */}
        <div
          style={{
            marginTop: '28px',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            maxWidth: '380px',
            lineHeight: 1.5,
          }}
        >
          Protected by Enterprise 256-Bit TLS & NDPR Healthcare Protocols.
          <br />
          &copy; {new Date().getFullYear()} iDEAL Smart Solution. All rights reserved.
        </div>
      </div>

      {/* Responsive layout CSS for smaller screens */}
      <style>{`
        @media (max-width: 960px) {
          .medical-hero-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
