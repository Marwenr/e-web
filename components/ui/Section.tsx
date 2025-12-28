import React from 'react';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'muted';
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const baseStyles = 'py-12 md:py-16 lg:py-20';

    const variantStyles = {
      default: 'bg-background',
      muted: 'bg-background-secondary',
    };

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`.trim();

    return (
      <section
        ref={ref}
        className={combinedClassName}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = 'Section';

export default Section;
