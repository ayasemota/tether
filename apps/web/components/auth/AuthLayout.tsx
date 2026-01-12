import React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  header: string;
  subHeader?: string;
}

export const AuthLayout = ({ children, header, subHeader }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
      
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        {/* Card */}
        <div className="bg-surface/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 md:p-10 relative overflow-hidden">
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-block mb-6 group">
                <div className="h-12 w-12 bg-gradient-to-br from-primary to-accent rounded-xl mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-background group-hover:scale-105 transition-transform duration-200">
                  T
                </div>
              </Link>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary">
                {header}
              </h1>
              {subHeader && (
                <p className="text-text-secondary mt-2 text-sm">
                  {subHeader}
                </p>
              )}
            </div>

            {/* Content */}
            {children}
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-text-muted text-xs mt-8">
          Secured by Tether &middot; <Link href="#" className="hover:text-primary transition-colors">Privacy</Link> &middot; <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
        </p>
      </div>
    </div>
  );
};
