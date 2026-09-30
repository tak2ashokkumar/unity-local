import React from 'react';
import { Icon } from './Icon';

export function PageHeader({
  eyebrow,
  eyebrowIcon,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  eyebrowIcon?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div className="ph-left">
        {eyebrow && (
          <div className="ph-eyebrow">
            {eyebrowIcon && <Icon name={eyebrowIcon} size={13} strokeWidth={2.4} />}
            {eyebrow}
          </div>
        )}
        <h1>{title}</h1>
        {subtitle && <div className="ph-sub">{subtitle}</div>}
      </div>
      {actions && <div className="ph-actions">{actions}</div>}
    </div>
  );
}
