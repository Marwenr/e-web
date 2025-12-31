import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "rectangular" | "circular" | "text";
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

/**
 * Base Skeleton Component
 * 
 * Reusable skeleton element with pulse animation.
 * Can be used as a building block for more complex skeletons.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rectangular",
  width,
  height,
  animate = true,
  style,
  ...props
}) => {
  const baseStyles = "bg-neutral-200";
  
  const variantStyles = {
    rectangular: "rounded-md",
    circular: "rounded-full",
    text: "rounded",
  };

  const animationStyles = animate ? "animate-pulse" : "";

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${animationStyles} ${className}`.trim();

  const skeletonStyle: React.CSSProperties = {
    width,
    height,
    ...style,
  };

  return (
    <div
      className={combinedClassName}
      style={skeletonStyle}
      aria-hidden="true"
      {...props}
    />
  );
};

