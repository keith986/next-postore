"use client";
import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface UseIdleTimeoutOptions {
  timeoutMinutes?: number;  // default 30 mins
  warningMinutes?: number;  // show warning before logout
  onWarning?: () => void;
  onLogout?: () => void;
}

export function useIdleTimeout({
  timeoutMinutes = 30,
  warningMinutes = 5,
  onWarning,
  onLogout,
}: UseIdleTimeoutOptions = {}) {
  const router = useRouter();
  //const timeoutRef = useRef<NodeJS.Timeout>();
  //const warningRef = useRef<NodeJS.Timeout>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  const logout = useCallback(() => {
    localStorage.removeItem("user");
    onLogout?.();
    router.push("/login");
  }, [router, onLogout]);

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

    // Set warning timer
    warningRef.current = setTimeout(() => {
      onWarning?.();
    }, warningMs);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      logout();
    }, timeoutMs);
  }, [timeoutMinutes, warningMinutes, logout, onWarning]);

  useEffect(() => {
    const events = [
      "mousedown", "mousemove", "keydown",
      "scroll", "touchstart", "click", "keypress"
    ];

    // Start timer on mount
    resetTimer();

    // Reset on any activity
    events.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer]);

  return { resetTimer };
}