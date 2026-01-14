"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({
  size = "md",
  showText = true,
  className = "",
}: LogoProps) {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const svgSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`${iconSizes[size]} rounded-lg gradient-bg flex items-center justify-center shadow-md`}
      >
        <svg
          width="800"
          height="800"
          viewBox="0 0 800 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_107_9)">
            <path
              d="M800 711.111C800 734.686 790.635 757.295 773.965 773.965C757.295 790.635 734.686 800 711.111 800H88.8889C65.3141 800 42.7049 790.635 26.035 773.965C9.36505 757.295 0 734.686 0 711.111V88.8889C0 65.3141 9.36505 42.7049 26.035 26.035C42.7049 9.36505 65.3141 0 88.8889 0L711.111 0C734.686 0 757.295 9.36505 773.965 26.035C790.635 42.7049 800 65.3141 800 88.8889V711.111Z"
              fill="url(#paint0_linear_107_9)"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M400 173.718C339.987 173.718 282.431 197.559 239.995 239.995C197.559 282.431 173.719 339.986 173.719 400C173.719 460.014 197.559 517.569 239.995 560.005C282.431 602.441 339.987 626.282 400 626.282H513.141C548.29 626.282 565.865 626.282 579.719 620.549C588.873 616.759 597.19 611.202 604.196 604.196C611.202 597.19 616.759 588.872 620.55 579.718C626.282 565.865 626.282 548.29 626.282 513.141V400C626.282 339.986 602.442 282.431 560.006 239.995C517.57 197.559 460.014 173.718 400 173.718ZM299.431 374.858C299.431 368.189 302.08 361.794 306.795 357.079C311.51 352.364 317.905 349.715 324.573 349.715H475.428C482.096 349.715 488.491 352.364 493.206 357.079C497.921 361.794 500.57 368.189 500.57 374.858C500.57 381.526 497.921 387.921 493.206 392.636C488.491 397.351 482.096 400 475.428 400H324.573C317.905 400 311.51 397.351 306.795 392.636C302.08 387.921 299.431 381.526 299.431 374.858ZM374.858 475.427C374.858 468.759 377.507 462.364 382.222 457.649C386.937 452.934 393.332 450.285 400 450.285H475.428C482.096 450.285 488.491 452.934 493.206 457.649C497.921 462.364 500.57 468.759 500.57 475.427C500.57 482.095 497.921 488.491 493.206 493.206C488.491 497.921 482.096 500.57 475.428 500.57H400C393.332 500.57 386.937 497.921 382.222 493.206C377.507 488.491 374.858 482.095 374.858 475.427Z"
              fill="white"
            />
          </g>
          <defs>
            <linearGradient
              id="paint0_linear_107_9"
              x1="400"
              y1="0"
              x2="400"
              y2="800"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#6366F1" />
              <stop offset="1" stop-color="#8B5CF6" />
            </linearGradient>
            <clipPath id="clip0_107_9">
              <rect width="800" height="800" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold gradient-text`}>
          Tether
        </span>
      )}
    </div>
  );
}
