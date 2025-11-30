"use client";

import { useRouter } from "next/navigation";
import LoginScreen from "../components/LoginScreen";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    localStorage.setItem("tether-logged-in", "true");
    router.push("/");
  };

  return <LoginScreen onLogin={handleLogin} />;
}
