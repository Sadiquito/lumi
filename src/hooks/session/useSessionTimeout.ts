
import { useCallback } from 'react';

export const useSessionTimeout = (sessionTimeoutId: number | null, setSessionTimeoutId: (id: number | null) => void) => {
  // Session timeout duration (5 minutes of inactivity)
  const SESSION_TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes

  const resetSessionTimeout = useCallback((onTimeout: () => void) => {
    // Clear existing timeout
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId);
    }

    // Set new timeout
    const timeoutId = window.setTimeout(() => {
      console.log('Session timed out due to inactivity');
      onTimeout();
    }, SESSION_TIMEOUT_DURATION);

    setSessionTimeoutId(timeoutId);
  }, [sessionTimeoutId, setSessionTimeoutId, SESSION_TIMEOUT_DURATION]);

  const clearSessionTimeout = useCallback(() => {
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId);
      setSessionTimeoutId(null);
    }
  }, [sessionTimeoutId, setSessionTimeoutId]);

  return {
    resetSessionTimeout,
    clearSessionTimeout
  };
};
