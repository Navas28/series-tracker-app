import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Sun, Moon, BarChart2, Bell, ChevronRight, LogOut } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/theme';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const [signOutModal, setSignOutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.log('Logout failed', error);
    }
  };

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar + name */}
        <MotiView
          from={{ opacity: 0, translateY: -16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          className="items-center pt-10 pb-8"
        >
          <View className="relative mb-5">
            {user.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                className="w-28 h-28 rounded-full border-2 border-border"
              />
            ) : (
              <View className="w-28 h-28 rounded-full bg-surface-elevated border border-border items-center justify-center">
                <Text className="font-display text-3xl text-text-sub">
                  {(user.displayName ?? 'U')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View className="w-5 h-5 rounded-full bg-success border-2 border-background absolute bottom-0 right-1" />
          </View>

          <Text className="font-heading text-xl text-text">{user.displayName ?? 'Series Fan'}</Text>
          <Text className="font-body text-sm text-text-sub mt-1">{user.email}</Text>
        </MotiView>

        <View className="px-5" style={{ gap: 12 }}>
          {/* Appearance */}
          <MotiView
            from={{ opacity: 0, translateX: -12 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 100 }}
          >
            <Text className="font-body text-xs text-text-muted uppercase mb-2 ml-1" style={{ letterSpacing: 1 }}>
              Appearance
            </Text>
            <View className="bg-surface rounded-xl border border-border overflow-hidden">
              <TouchableOpacity
                className="flex-row items-center px-4 py-4"
                onPress={toggleColorScheme}
                activeOpacity={0.7}
              >
                <View className="w-9 h-9 rounded-lg bg-accent-subtle items-center justify-center mr-4">
                  {isDark ? (
                    <Moon size={18} color={colors.accent} strokeWidth={1.5} />
                  ) : (
                    <Sun size={18} color={colors.accent} strokeWidth={1.5} />
                  )}
                </View>
                <Text className="flex-1 font-body-medium text-base text-text">
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </Text>
                <Text className="font-body text-sm text-text-muted">Tap to switch</Text>
              </TouchableOpacity>
            </View>
          </MotiView>

          {/* Account */}
          <MotiView
            from={{ opacity: 0, translateX: -12 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 150 }}
          >
            <Text className="font-body text-xs text-text-muted uppercase mb-2 ml-1" style={{ letterSpacing: 1 }}>
              Account
            </Text>
            <View className="bg-surface rounded-xl border border-border overflow-hidden">
              <TouchableOpacity className="flex-row items-center px-4 py-4" activeOpacity={0.7}>
                <View className="w-9 h-9 rounded-lg bg-watched-subtle items-center justify-center mr-4">
                  <BarChart2 size={18} color={colors.watched} strokeWidth={1.5} />
                </View>
                <Text className="flex-1 font-body-medium text-base text-text">My Watch Statistics</Text>
                <ChevronRight size={16} color={colors.textMuted} />
              </TouchableOpacity>

              <View className="h-px bg-border-subtle ml-16" />

              <TouchableOpacity className="flex-row items-center px-4 py-4" activeOpacity={0.7}>
                <View className="w-9 h-9 rounded-lg bg-accent-subtle items-center justify-center mr-4">
                  <Bell size={18} color={colors.accent} strokeWidth={1.5} />
                </View>
                <Text className="flex-1 font-body-medium text-base text-text">Release Notifications</Text>
                <ChevronRight size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </MotiView>

          {/* Sign Out */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 200 }}
            className="mt-2"
          >
            <TouchableOpacity
              className="flex-row items-center justify-center rounded-xl border border-error py-4"
              onPress={() => setSignOutModal(true)}
              activeOpacity={0.8}
            >
              <LogOut size={18} color={colors.error} strokeWidth={1.5} />
              <Text className="font-body-semibold text-base text-error ml-2">Sign Out</Text>
            </TouchableOpacity>
          </MotiView>

        <Text className="font-mono text-xs text-text-muted text-center py-6">BINGE | Version 1.0.0 (Beta)</Text>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={signOutModal}
        onClose={() => setSignOutModal(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of Binge?"
        confirmLabel="Sign Out"
        variant="danger"
      />
    </SafeAreaView>
  );
}
