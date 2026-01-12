'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // MOGBO DB INTEGRATION COMMENT:
    // This is where the authentication logic will go.
    // 1. Validate the form data.
    // 2. Call the MongoDB backend API (e.g., /api/auth/login) with formData.email and formData.password.
    // 3. Handle the response (store token, user data, etc.).
    // 4. Redirect the user upon success or show error upon failure.
    
    // Simulating API call
    setTimeout(() => {
      console.log('Logging in with:', formData);
      setIsLoading(false);
      router.push('/dashboard'); // Connect this to the actual dashboard route
    }, 1500);
  };

  return (
    <AuthLayout 
      header="Welcome Back" 
      subHeader="Enter your details to access your workspace"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            icon={<Mail className="h-4 w-4" />}
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          
          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <div className="flex justify-end">
              <Link 
                href="/forgot-password" 
                className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <Button 
            type="submit" 
            fullWidth 
            size="lg" 
            isLoading={isLoading}
            className="group"
          >
            Sign In
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          
          <p className="text-center text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link 
              href="/signup" 
              className="font-medium text-primary hover:text-primary-hover hover:underline transition-all"
            >
              create an account
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
