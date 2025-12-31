import React from 'react';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  className?: string;
}

const variantStyles = {
  success: {
    container: 'bg-success-50 border-success-200',
    title: 'text-success-800',
    message: 'text-success-700',
  },
  error: {
    container: 'bg-error-50 border-error-200',
    title: 'text-error-800',
    message: 'text-error-700',
  },
  warning: {
    container: 'bg-warning-50 border-warning-200',
    title: 'text-warning-800',
    message: 'text-warning-700',
  },
  info: {
    container: 'bg-neutral-50 border-neutral-200',
    title: 'text-foreground',
    message: 'text-foreground-secondary',
  },
};

const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  className = '',
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`p-4 rounded-md border ${styles.container} ${className}`.trim()}
    >
      {title ? (
        <div className="space-y-2">
          <p className={`text-body font-medium ${styles.title}`}>
            {title}
          </p>
          <p className={`text-body-sm ${styles.message}`}>
            {message}
          </p>
        </div>
      ) : (
        <p className={`text-body-sm ${styles.message} font-medium`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Alert;

