// src/components/Logo.tsx
import React from 'react';

export interface LogoProps {
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'mark' | 'horizontal';
  subtitle?: string;
  showAdminBadge?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  subtitle = 'Health Enterprise Cloud',
  showAdminBadge = false,
  className = '',
  style = {},
}) => {
  // Map size prop to pixel dimensions
  let px = 36;
  if (typeof size === 'number') {
    px = size;
  } else {
    switch (size) {
      case 'sm':
        px = 28;
        break;
      case 'md':
        px = 36;
        break;
      case 'lg':
        px = 48;
        break;
      case 'xl':
        px = 60;
        break;
    }
  }

  // Calculate typography scales relative to icon size
  const titleSize = `${Math.max(0.9, (px / 36) * 1.15)}rem`;
  const subSize = `${Math.max(0.65, (px / 36) * 0.72)}rem`;
  const gapSize = `${Math.max(8, px * 0.28)}px`;

  // Unique SVG IDs to avoid DOM collisions
  const gradId = `ideal-logo-grad-${px}`;
  const pulseId = `ideal-pulse-grad-${px}`;

  const renderIconMark = () => (
    <div
      style={{
        width: `${px}px`,
        height: `${px}px`,
        minWidth: `${px}px`,
        borderRadius: `${Math.round(px * 0.26)}px`,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 14px color-mix(in srgb, var(--accent) 30%, transparent)',
        transition: 'var(--transition)',
        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 64 64"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0B7A75" />
            <stop offset="100%" stopColor="#043835" />
          </linearGradient>
          <linearGradient id={pulseId} x1="12" y1="32" x2="52" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3CC3BA" />
            <stop offset="50%" stopColor="#A7F3D0" />
            <stop offset="100%" stopColor="#3CC3BA" />
          </linearGradient>
        </defs>

        {/* Squircle base */}
        <rect width="64" height="64" rx="16" fill={`url(#${gradId})`} />
        <rect x="1" y="1" width="62" height="62" rx="15" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="1.5" />

        {/* Medical Cross & 'i' Dot for iDEAL */}
        <circle cx="32" cy="15" r="4.2" fill="#FFFFFF" />

        {/* Vertical Cross Stem */}
        <rect x="27.5" y="22" width="9" height="28" rx="4.5" fill="#FFFFFF" />

        {/* Horizontal Cross Arms */}
        <rect x="14" y="27.5" width="36" height="9" rx="4.5" fill="#FFFFFF" />

        {/* ECG Vital Wave Cutout Contour */}
        <path
          d="M 11 32 L 23 32 L 27.5 19 L 32 44 L 36.5 24 L 40.5 32 L 53 32"
          stroke="#042C2A"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Luminous ECG Wave Core */}
        <path
          d="M 11 32 L 23 32 L 27.5 19 L 32 44 L 36.5 24 L 40.5 32 L 53 32"
          stroke={`url(#${pulseId})`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  if (variant === 'mark') {
    return renderIconMark();
  }

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: gapSize,
        textDecoration: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      {renderIconMark()}

      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: titleSize,
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--text-h)',
              whiteSpace: 'nowrap',
            }}
          >
            iDEAL <span style={{ color: 'var(--accent)' }}>Care</span>
          </span>

          {showAdminBadge && (
            <span
              style={{
                fontSize: '0.625rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'var(--accent-soft)',
                color: 'var(--accent)',
                textTransform: 'uppercase',
              }}
            >
              Admin
            </span>
          )}
        </div>

        {variant === 'full' && subtitle && (
          <span
            style={{
              fontSize: subSize,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginTop: '2px',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
