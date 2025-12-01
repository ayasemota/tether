"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-2 app-bg-secondary app-border border-b flex items-center justify-center gap-2 shadow-md">
      <WifiOff className="w-4 h-4 text-red-500" />
      <span className="text-sm app-text">
        You&apos;re offline. Some features may be unavailable.
      </span>
    </div>
  );
}
