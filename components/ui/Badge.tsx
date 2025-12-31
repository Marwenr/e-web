import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full';

    const variantStyles = {
      primary: 'bg-primary-900 text-white',
      secondary: 'bg-secondary-600 text-white',
      success: 'bg-success-500 text-white',
      warning: 'bg-warning-500 text-white',
      'error': 'bg-error-500 text-white',
      neutral: 'bg-neutral-500 text-white',
    };

    const sizeStyles = {
      sm: 'h-4 min-w-4 px-1 text-label-sm',
      md: 'h-5 min-w-5 px-1.5 text-label',
      lg: 'h-6 min-w-6 px-2 text-label-lg',
    };

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();

    return (
      <span
        ref={ref}
        className={combinedClassName}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;

