import { useState, useEffect, useCallback } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { getToken, saveToken, deleteToken } from '@/lib/auth';

WebBrowser.maybeCompleteAuthSession();

const API_URL = process.env.EXPO_PUBLIC_API_URL!;
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

async function fetchMe(token: string): Promise<AuthUser | null> {
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
    return json.data?.me ?? null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });

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

  useEffect(() => {
    if (response?.type !== 'success') return;
    const accessToken = response.authentication?.accessToken;
    if (!accessToken) return;

    const exchange = async () => {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });
      const data = await res.json() as { token?: string };
      if (!data.token) return;
      await saveToken(data.token);
      const me = await fetchMe(data.token);
      if (me) setUser(me);
    };

    exchange();
  }, [response]);

  const signInWithGoogle = useCallback(async () => {
    await promptAsync();
  }, [promptAsync]);

  const signOut = useCallback(async () => {
    await deleteToken();
    setUser(null);
  }, []);

  return { user, initializing, signInWithGoogle, signOut };
}
