/**
 * Generate a unique session ID with timestamp and random string
 */
export function generateSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const random2 = Math.random().toString(36).substring(2, 15);
  return `session-${timestamp}-${random}${random2}`;
}

/**
 * Get session ID from localStorage, create new one if not exists or expired
 */
export function getOrCreateSessionId(): string {
  const STORAGE_KEY = 'compare-session-id';
  const EXPIRY_KEY = 'compare-session-expiry';
  const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

  try {
    const storedSessionId = localStorage.getItem(STORAGE_KEY);
    const storedExpiry = localStorage.getItem(EXPIRY_KEY);

    // Check if session exists and is not expired
    if (storedSessionId && storedExpiry) {
      const expiryTime = parseInt(storedExpiry, 10);
      const now = Date.now();

      if (now < expiryTime) {
        return storedSessionId;
      }
    }

    // Create new session
    const newSessionId = generateSessionId();
    const newExpiry = Date.now() + SESSION_DURATION;

    localStorage.setItem(STORAGE_KEY, newSessionId);
    localStorage.setItem(EXPIRY_KEY, newExpiry.toString());

    return newSessionId;
  } catch (error) {
    console.error('Error managing session ID:', error);
    // Fallback: return a new session ID without storing
    return generateSessionId();
  }
}

/**
 * Clear session ID from storage (on error or manual clear)
 */
export function clearSessionId(): void {
  const STORAGE_KEY = 'compare-session-id';
  const EXPIRY_KEY = 'compare-session-expiry';

  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EXPIRY_KEY);
  } catch (error) {
    console.error('Error clearing session ID:', error);
  }
}

/**
 * Refresh session expiry (extend by 2 hours)
 */
export function refreshSessionExpiry(): void {
  const EXPIRY_KEY = 'compare-session-expiry';
  const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours

  try {
    const newExpiry = Date.now() + SESSION_DURATION;
    localStorage.setItem(EXPIRY_KEY, newExpiry.toString());
  } catch (error) {
    console.error('Error refreshing session expiry:', error);
  }
}

/**
 * Get remaining time for session in milliseconds
 */
export function getSessionRemainingTime(): number {
  const EXPIRY_KEY = 'compare-session-expiry';

  try {
    const storedExpiry = localStorage.getItem(EXPIRY_KEY);
    if (storedExpiry) {
      const expiryTime = parseInt(storedExpiry, 10);
      const now = Date.now();
      return Math.max(0, expiryTime - now);
    }
  } catch (error) {
    console.error('Error getting session remaining time:', error);
  }

  return 0;
}
