import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { clearCsrfToken, csrfFetch, refreshCsrfToken, setCsrfToken } from '../utils/csrf';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  `${window.location.protocol}//${window.location.hostname}:8000`;

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (idToken: string) => Promise<boolean>;
  loginAsDemo: () => void;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<{ ok: boolean; message: string; debugResetToken?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ ok: boolean; message: string }>;
  logout: () => void;
  getAuthToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveAuthenticatedUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('rectotime_user', JSON.stringify(userData));
    localStorage.setItem('rectotime_user_id', userData.id);
  };

  // Cookie-based auth no longer exposes a browser-readable token.
  const getAuthToken = (): string | null => {
    return null;
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('rectotime_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));

        // Refresh CSRF token for existing authenticated sessions.
        refreshCsrfToken()
          .catch(() => {
            // Keep app usable if backend session is unavailable.
          });
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('rectotime_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data?.ok && data.user) {
        if (typeof data.csrfToken === 'string') {
          setCsrfToken(data.csrfToken);
        }
        saveAuthenticatedUser(data.user as User);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (!data?.ok || !data.user) {
        return false;
      }

      if (typeof data.csrfToken === 'string') {
        setCsrfToken(data.csrfToken);
      }

      localStorage.removeItem('onboarding_completed');
      localStorage.removeItem('onboarding_never_show');
      localStorage.setItem('rectotime_guided_setup_active', 'true');
      saveAuthenticatedUser(data.user as User);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const loginWithGoogle = async (idToken: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id_token: idToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data?.ok && data.user) {
        if (typeof data.csrfToken === 'string') {
          setCsrfToken(data.csrfToken);
        }
        saveAuthenticatedUser(data.user as User);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    }
  };

  const requestPasswordReset = async (
    email: string
  ): Promise<{ ok: boolean; message: string; debugResetToken?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return {
        ok: !!data?.ok,
        message: data?.message || 'If this email exists, a password reset link has been sent.',
        debugResetToken: typeof data?.debugResetToken === 'string' ? data.debugResetToken : undefined,
      };
    } catch (error) {
      console.error('Forgot password request error:', error);
      return {
        ok: false,
        message: 'Failed to request password reset. Please try again.',
      };
    }
  };

  const resetPassword = async (
    token: string,
    newPassword: string
  ): Promise<{ ok: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { ok: false, message: data?.detail || data?.message || 'Password reset failed.' };
      }

      return {
        ok: !!data?.ok,
        message: data?.message || 'Password reset successful',
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        ok: false,
        message: 'Password reset failed. Please try again.',
      };
    }
  };

  const loginAsDemo = () => {
    const demoUser: User = {
      id: 'demo-user-00000000',
      email: 'demo@rectotime.app',
      name: 'Demo User',
      createdAt: new Date().toISOString(),
    };
    saveAuthenticatedUser(demoUser);
  };

  const logout = () => {
    csrfFetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
    }).catch(() => {
      // Ignore logout API failures and still clear local auth state.
    });

    setUser(null);
    localStorage.removeItem('rectotime_user');
    localStorage.removeItem('rectotime_user_id');
    clearCsrfToken();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    loginAsDemo,
    signup,
    requestPasswordReset,
    resetPassword,
    logout,
    getAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
