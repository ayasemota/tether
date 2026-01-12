import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, fullWidth, children, disabled, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
    
    const variants = {
      primary: "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/25 border border-transparent focus:ring-primary",
      secondary: "bg-surface hover:bg-surface-hover text-text-primary border border-border focus:ring-secondary",
      outline: "bg-transparent border border-border hover:border-primary/50 hover:bg-primary/5 text-text-primary focus:ring-primary",
      ghost: "bg-transparent hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-transparent focus:ring-secondary",
      danger: "bg-error text-white hover:bg-red-600 shadow-lg shadow-error/25 border border-transparent focus:ring-error"
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-6 text-base",
      lg: "h-14 px-8 text-lg"
    };

    const widthClass = fullWidth ? "w-full" : "";
    
    // Combine classes manually to avoid dependency
    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`;

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
