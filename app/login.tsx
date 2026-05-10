import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import Svg, { Path } from "react-native-svg";
import { useColorScheme } from "nativewind";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "@/constants/theme";
import { useToast } from "@/components/ui/Toast";

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-5 z-10">
        <View className="w-full max-w-md">
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="items-center mb-10"
          >
            <View className="mb-4 h-20 items-center justify-center">
              <Image
                source={require("@/assets/images/logo.png")}
                className="w-64 h-64"
                resizeMode="contain"
              />
            </View>
            <Text className="font-display text-4xl tracking-tighter text-text">
              BIN<Text className="text-accent">GE</Text>
            </Text>
            <Text className="font-mono text-xs text-watched uppercase mt-2 tracking-widest">
              Series Database & Tracker
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 700, delay: 150 }}
            className="bg-surface-elevated/60 border border-border-subtle rounded-[24px] p-8"
          >
            <View className="items-center mb-8">
              <Text className="font-heading text-2xl text-text mb-2">
                Welcome Back
              </Text>
              <Text className="font-body text-sm text-text-muted text-center">
                Sync your watchlist across all your devices.
              </Text>
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-center bg-white rounded-xl py-4 px-6 w-full mb-6"
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#010d23" />
              ) : (
                <>
                  <Svg width={20} height={20} viewBox="0 0 24 24">
                    <Path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <Path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <Path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <Path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                      fill="#EA4335"
                    />
                  </Svg>
                  <Text className="font-body-semibold text-base text-[#1e3244] ml-3">
                    Continue with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </MotiView>

          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 900, delay: 400 }}
            className="mt-10 items-center"
          >
            <View className="flex-row justify-center mb-4">
              <Text className="font-mono text-[10px] text-watched uppercase tracking-widest mx-3">
                Privacy
              </Text>
              <Text className="font-mono text-[10px] text-watched uppercase tracking-widest mx-3">
                Terms
              </Text>
              <Text className="font-mono text-[10px] text-watched uppercase tracking-widest mx-3">
                Database
              </Text>
            </View>
          </MotiView>
        </View>
      </View>
    </SafeAreaView>
  );
}
