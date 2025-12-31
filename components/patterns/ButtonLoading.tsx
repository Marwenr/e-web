import React from 'react';

export interface ButtonLoadingProps {
  loadingText?: string;
  children?: React.ReactNode;
}

const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  loadingText,
  children,
}) => {
  return (
    <span className="flex items-center justify-center gap-2">
      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      {loadingText || children}
    </span>
  );
};

export default ButtonLoading;

