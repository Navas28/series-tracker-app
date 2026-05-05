import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { Film } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/theme';

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.log('Login failed', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <MotiView
          from={{ opacity: 0, translateY: -24 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600 }}
          className="items-center mb-16"
        >
          <View className="w-28 h-28 rounded-full bg-accent-subtle border border-border items-center justify-center mb-6">
            <Film size={52} color={colors.accent} strokeWidth={1.5} />
          </View>
          <Text className="font-display text-3xl text-text">Series Tracker</Text>
          <Text className="font-body text-base text-text-sub text-center mt-3 max-w-xs">
            Track your progress. Never miss an episode.
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 200 }}
          className="w-full"
        >
          <TouchableOpacity
            className="flex-row items-center justify-center bg-accent rounded-xl py-4 px-6 w-full"
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-google" size={20} color={colors.accentFg} />
            <Text className="font-body-semibold text-base text-accent-fg ml-3">
              Continue with Google
            </Text>
          </TouchableOpacity>
        </MotiView>
      </View>

      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 800, delay: 400 }}
        className="pb-8 px-6"
      >
        <Text className="font-body text-xs text-text-muted text-center">
          By continuing, you agree to our Terms of Service.
        </Text>
      </MotiView>
    </SafeAreaView>
  );
}
