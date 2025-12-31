import React from 'react';

export interface FieldErrorProps {
  message: string;
  id?: string;
  className?: string;
}

const FieldError: React.FC<FieldErrorProps> = ({
  message,
  id,
  className = '',
}) => {
  return (
    <p
      id={id}
      role="alert"
      className={`text-body-xs text-error-600 ${className}`.trim()}
    >
      {message}
    </p>
  );
};

export default FieldError;

