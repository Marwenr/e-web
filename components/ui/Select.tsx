import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error = false, children, ...props }, ref) => {
    const baseStyles = 'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-body-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

    const errorStyles = error
      ? 'border-error-500 focus-visible:ring-error-500'
      : 'border-neutral-300 focus-visible:border-primary-500';

    const combinedClassName = `${baseStyles} ${errorStyles} ${className}`.trim();

    return (
      <select
        ref={ref}
        className={combinedClassName}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';

export default Select;
