import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', label, error, icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-text-secondary ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary">
            {icon}
          </div>
          
          <input
            ref={ref}
            type={inputType}
            className={`
              w-full bg-input-bg border border-input-border rounded-xl 
              ${icon ? 'pl-10' : 'pl-4'} 
              ${isPassword ? 'pr-12' : 'pr-4'} 
              py-3 text-text-primary placeholder:text-text-muted
              transition-all duration-200
              focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10
              hover:border-border-hover
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-error focus:border-error focus:ring-error/10' : ''}
              ${className}
            `}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary transition-colors focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-error ml-1 animate-in slide-in-from-top-1 fade-in duration-200">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
