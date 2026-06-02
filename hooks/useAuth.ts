import { useState, useEffect, useCallback } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { getToken, saveToken, deleteToken } from '@/lib/auth';

WebBrowser.maybeCompleteAuthSession();

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  const [, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    const init = async () => {
      const token = await getToken();
      if (token) {
        try {
          const res = await fetch(`${API_URL}/graphql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ query: '{ me { id email name picture } }' }),
          });
          const json = await res.json();
          if (json.data?.me) {
            setUser(json.data.me);
          } else {
            await deleteToken();
          }
        } catch {
          await deleteToken();
        }
      }
      setInitializing(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      exchangeToken(response.authentication.accessToken);
    }
  }, [response]);

  const exchangeToken = async (accessToken: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });
      const { token, user: authUser } = await res.json();
      await saveToken(token);
      setUser(authUser);
    } catch (error) {
      console.error('Auth exchange error:', error);
    }
  };

  const signInWithGoogle = useCallback(async () => {
    await promptAsync();
  }, [promptAsync]);

  const signOut = useCallback(async () => {
    await deleteToken();
    setUser(null);
  }, []);

  return { user, initializing, signInWithGoogle, signOut };
}
