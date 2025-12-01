"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatApp from "./components/ChatApp";

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("tether-logged-in");
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return null;
  }

  return <ChatApp />;
}
