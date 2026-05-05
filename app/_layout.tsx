import '../global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
} from '@expo-google-fonts/sora';
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from '@expo-google-fonts/space-mono';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useColorScheme } from 'nativewind';

import { useAuth } from '@/hooks/useAuth';

GoogleSignin.configure({
  webClientId: '574604558680-otv70h7boa343mg808go16t365jff93l.apps.googleusercontent.com',
});

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const { user, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Inter-Regular':     Inter_400Regular,
    'Inter-Medium':      Inter_500Medium,
    'Inter-SemiBold':    Inter_600SemiBold,
    'Sora-Regular':      Sora_400Regular,
    'Sora-SemiBold':     Sora_600SemiBold,
    'Sora-Bold':         Sora_700Bold,
    'SpaceMono-Regular': SpaceMono_400Regular,
    'SpaceMono-Bold':    SpaceMono_700Bold,
  });

  useEffect(() => {
    if (initializing || !fontsLoaded) return;

    const inAuthGroup = segments[0] === 'login';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, initializing, segments, fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded && !initializing) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, initializing]);

  if (!fontsLoaded || initializing) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
