import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error = false, ...props }, ref) => {
    const baseStyles = 'flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-body-sm transition-colors placeholder:text-foreground-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

    const errorStyles = error
      ? 'border-error-500 focus-visible:ring-error-500'
      : 'border-neutral-300 focus-visible:border-primary-500';

    const combinedClassName = `${baseStyles} ${errorStyles} ${className}`.trim();

    return (
      <textarea
        ref={ref}
        className={combinedClassName}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
