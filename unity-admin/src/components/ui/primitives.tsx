import React from 'react';
import { Icon } from './Icon';
import './ui.css';

type ButtonVariant = 'primary' | 'default' | 'ghost' | 'danger' | 'danger-ghost' | 'on-brand';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  loading?: boolean;
}

export function Button({
  variant = 'default',
  size = 'md',
  icon,
  loading,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '',
    !children ? 'btn-icon' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {loading ? <span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> : icon ? <Icon name={icon} size={16} /> : null}
      {children}
    </button>
  );
}

export function IconAction({
  icon,
  title,
  danger,
  onClick,
}: {
  icon: string;
  title: string;
  danger?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <button className={`icon-action${danger ? ' danger' : ''}`} title={title} aria-label={title} onClick={onClick} type="button">
      <Icon name={icon} size={16} />
    </button>
  );
}

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'neutral';

export function Badge({ tone = 'neutral', dot, children }: { tone?: BadgeTone; dot?: boolean; children: React.ReactNode }) {
  return (
    <span className={`badge badge-${tone}`}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

export function Spinner({ large }: { large?: boolean }) {
  return <span className={`spinner${large ? ' spinner-lg' : ''}`} />;
}

export function LoadingBlock({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="loading-block">
      <Spinner large />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({
  icon = 'inbox',
  title,
  message,
  action,
}: {
  icon?: string;
  title: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-ic">
        <Icon name={icon} size={26} />
      </div>
      <h4>{title}</h4>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function Card({
  children,
  className = '',
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardHead({ title, icon, action }: { title: React.ReactNode; icon?: string; action?: React.ReactNode }) {
  return (
    <div className="card-head">
      <div className="card-title">
        {icon && (
          <span className="ic">
            <Icon name={icon} size={17} />
          </span>
        )}
        {title}
      </div>
      {action}
    </div>
  );
}
