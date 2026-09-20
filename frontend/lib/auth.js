const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

const TOKEN_KEY = "pennypal_token";
const USER_KEY = "pennypal_user";

/**
 * Format Firebase error messages into user-friendly text
 */
function parseAuthError(rawMessage) {
  if (!rawMessage) return "An unexpected error occurred. Please try again.";
  const msg = rawMessage.toUpperCase();
  if (msg.includes("EMAIL_EXISTS")) {
    return "An account with this email already exists. Please sign in.";
  }
  if (msg.includes("INVALID_LOGIN_CREDENTIALS") || msg.includes("INVALID_PASSWORD") || msg.includes("EMAIL_NOT_FOUND")) {
    return "Invalid email or password. Please check your credentials.";
  }
  if (msg.includes("USER_DISABLED")) {
    return "This account has been disabled. Please contact support.";
  }
  if (msg.includes("TOO_MANY_ATTEMPTS_TRY_LATER")) {
    return "Too many failed attempts. Please wait a few minutes and try again.";
  }
  if (msg.includes("WEAK_PASSWORD")) {
    return "Password should be at least 6 characters.";
  }
  return rawMessage;
}

/**
 * Sign up a new user via the backend Express API
 */
export async function signup(email, password) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: parseAuthError(data.error || data.message),
      };
    }

    const sessionUser = {
      uid: data.userId,
      email,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
      window.dispatchEvent(new Event("auth-changed"));
    }

    return {
      success: true,
      user: sessionUser,
      token: data.token,
    };
  } catch (err) {
    return {
      success: false,
      error: "Unable to reach PennyPal authentication server. Make sure the backend is running.",
    };
  }
}

/**
 * Sign in an existing user via the backend Express API
 */
export async function signin(email, password) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: parseAuthError(data.error || data.message),
      };
    }

    const sessionUser = {
      uid: data.userId,
      email,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
      window.dispatchEvent(new Event("auth-changed"));
    }

    return {
      success: true,
      user: sessionUser,
      token: data.token,
    };
  } catch (err) {
    return {
      success: false,
      error: "Unable to reach PennyPal authentication server. Make sure the backend is running.",
    };
  }
}

/**
 * Sign out and clear session tokens
 */
export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("auth-changed"));
  }
}

/**
 * Get current session user (contains Firebase UID which is our vaultId)
 */
export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  try {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

/**
 * Get current Firebase ID Token for Authorization header
 */
export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Check if a user session is active
 */
export function isAuthenticated() {
  return !!getAuthToken() && !!getCurrentUser();
}
