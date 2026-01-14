"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="animate-fade-in-up">
        <div className="relative w-64 h-64 mx-auto mb-8 opacity-90">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full text-primary relative z-10"
          >
            <path
              d="M15.5 12H15.51M8.5 12H8.51M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse"
            />
            <path
              d="M10 16C10 16 11 15 12 15C13 15 14 16 14 16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 9L15 10M15 9L16 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 9L8 10M8 9L9 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold gradient-text mb-4">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
          Page not found
        </h2>
        <p className="text-foreground-secondary max-w-md mx-auto mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
      </div>
      <div>
        <Logo />
      </div>
    </div>
  );
}
