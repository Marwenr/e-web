import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, type = 'text', ...props }, ref) => {
    const baseStyles = 'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-body-sm transition-colors placeholder:text-foreground-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

    const errorStyles = error
      ? 'border-error-500 focus-visible:ring-error-500'
      : 'border-neutral-300 focus-visible:border-primary-500';

    const combinedClassName = `${baseStyles} ${errorStyles} ${className}`.trim();

    return (
      <input
        ref={ref}
        type={type}
        className={combinedClassName}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
