import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/theme';
import { useToast } from '@/components/ui/Toast';

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <MotiView
          from={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 120 }}
          className="items-center mb-6"
        >
          {/* Logo */}
          <Image
            source={require('@/assets/images/logo.png')}
            className="w-[400px] h-[400px]"
            resizeMode="contain"
          />

          <Text className="font-display text-4xl text-text tracking-tight -mt-24">
            Binge
          </Text>

          {/* Tagline */}
          <Text className="font-body text-base text-text-sub text-center mt-3 max-w-xs leading-relaxed">
            Track your progress.{'\n'}Never miss an episode.
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 700, delay: 250 }}
          className="w-full gap-3"
        >
          {/* Google sign-in button */}
          <TouchableOpacity
            className="flex-row items-center justify-center bg-accent rounded-xl py-4 px-6 w-full"
            onPress={handleLogin}
            activeOpacity={0.82}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.accentFg} />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color={colors.accentFg} />
                <Text className="font-body-semibold text-base text-accent-fg ml-3">
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>
        </MotiView>
      </View>

      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 900, delay: 500 }}
        className="pb-8 px-6"
      >
        <Text className="font-body text-xs text-text-muted text-center">
          By continuing, you agree to our Terms of Service.
        </Text>
      </MotiView>
    </SafeAreaView>
  );
}

