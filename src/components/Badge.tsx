// src/components/Badge.tsx
import React from 'react';

export type BadgeVariant =
  | 'active'
  | 'pending'
  | 'expired'
  | 'suspended'
  | 'default'
  | 'paid'
  | 'overdue'
  | 'info'
  | 'assigned';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  icon,
  className = '',
}) => {
  const variantClass = `badge badge-${variant}`;
  return (
    <span className={`${variantClass} ${className}`}>
      {icon && <span style={{ display: 'inline-flex', fontSize: '0.9em' }}>{icon}</span>}
      {children}
    </span>
  );
};
