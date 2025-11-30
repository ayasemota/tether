"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { MessageCircle } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError(false);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (index === 3 && value) {
      const fullPin = [...newPin.slice(0, 3), value].join("");
      if (fullPin === "0000") {
        onLogin();
      } else {
        setError(true);
        setTimeout(() => {
          setPin(["", "", "", ""]);
          setError(false);
          inputRefs[0].current?.focus();
        }, 500);
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    if (!/^\d+$/.test(pastedData)) return;

    const newPin = pastedData.split("");
    setPin([...newPin, "", "", ""].slice(0, 4));

    if (pastedData.length === 4) {
      if (pastedData === "0000") {
        onLogin();
      } else {
        setError(true);
        setTimeout(() => {
          setPin(["", "", "", ""]);
          setError(false);
          inputRefs[0].current?.focus();
        }, 500);
      }
    } else if (pastedData.length > 0) {
      inputRefs[Math.min(pastedData.length, 3)].current?.focus();
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Tether
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Enter your PIN to continue
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-16 h-16 text-center text-2xl font-bold rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                error
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20 animate-shake"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-red-500 text-sm mb-4">
            Incorrect PIN. Please try again.
          </p>
        )}

        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          Demo PIN: 0000
        </p>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}