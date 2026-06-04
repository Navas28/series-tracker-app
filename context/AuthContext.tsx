import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getToken, saveToken, deleteToken } from '@/lib/auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  verifyOtp: (email: string, otp: string, purpose: 'verify_email' | 'reset_password') => Promise<{ token?: string; resetToken?: string }>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
};

async function fetchMe(token: string): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${API_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: '{ me { id email name } }' }),
    });
    const json = await res.json();
    return json.data?.me ?? null;
  } catch {
    return null;
  }
}

async function post<T>(path: string, body: Record<string, string>): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'request_failed');
  return json as T;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = await getToken();
      if (token) {
        const me = await fetchMe(token);
        if (me) {
          setUser(me);
        } else {
          await deleteToken();
        }
      }
      setInitializing(false);
    };
    init();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token } = await post<{ token: string }>('/auth/login', { email, password });
    await saveToken(token);
    const me = await fetchMe(token);
    if (me) setUser(me);
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    await post('/auth/register', { email, password, name });
  }, []);

  const verifyOtp = useCallback(
    async (email: string, otp: string, purpose: 'verify_email' | 'reset_password') => {
      const data = await post<{ token?: string; resetToken?: string }>(
        '/auth/verify-otp',
        { email, otp }
      );
      if (purpose === 'verify_email' && data.token) {
        await saveToken(data.token);
        const me = await fetchMe(data.token);
        if (me) setUser(me);
      }
      return data;
    },
    []
  );

  const forgotPassword = useCallback(async (email: string) => {
    await post('/auth/forgot-password', { email });
  }, []);

  const resetPassword = useCallback(async (resetToken: string, newPassword: string) => {
    const { token } = await post<{ token: string }>('/auth/reset-password', {
      resetToken,
      newPassword,
    });
    await saveToken(token);
    const me = await fetchMe(token);
    if (me) setUser(me);
  }, []);

  const signOut = useCallback(async () => {
    await deleteToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, initializing, signIn, signUp, verifyOtp, forgotPassword, resetPassword, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
