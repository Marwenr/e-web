import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export interface LoadingStateProps {
  message?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'neutral';
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  description,
  size = 'lg',
  variant = 'primary',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-8 space-y-4 ${className}`.trim()}>
      <LoadingSpinner size={size} variant={variant} label={message} />
      <div className="text-center space-y-1">
        <p className="text-body font-medium text-foreground">
          {message}
        </p>
        {description && (
          <p className="text-body-sm text-foreground-secondary">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingState;

