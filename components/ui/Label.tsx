import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', required = false, children, ...props }, ref) => {
    const baseStyles = 'text-label font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70';

    const combinedClassName = `${baseStyles} ${className}`.trim();

    return (
      <label
        ref={ref}
        className={combinedClassName}
        {...props}
      >
        {children}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';

export default Label;
