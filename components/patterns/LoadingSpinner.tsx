import React from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerVariant = 'primary' | 'success' | 'neutral';

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
  label?: string;
}

const sizeStyles = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
};

const variantStyles = {
  primary: {
    base: 'border-primary-200',
    accent: 'border-t-primary-900',
  },
  success: {
    base: 'border-success-200',
    accent: 'border-t-success-600',
  },
  neutral: {
    base: 'border-neutral-200',
    accent: 'border-t-neutral-600',
  },
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className = '',
  label,
}) => {
  const styles = variantStyles[variant];
  const sizeClass = sizeStyles[size];

  return (
    <div className={className || 'flex items-center justify-center'}>
      <div
        className={`${sizeClass} ${styles.base} ${styles.accent} rounded-full animate-spin`}
        role="status"
        aria-label={label || 'Loading'}
      >
        <span className="sr-only">{label || 'Loading'}</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;

