import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`.trim()}>
      {icon && (
        <div className="mb-4 text-foreground-tertiary">
          {icon}
        </div>
      )}
      <h3 className="text-h4 font-semibold text-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-body text-foreground-secondary mb-6 max-w-md">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;

