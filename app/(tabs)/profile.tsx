import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart2, Bell, ChevronRight, LogOut, Download } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useAllTracking } from '@/hooks/useTracking';
import { Colors } from '@/constants/theme';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { exportTrackingData } from '@/services/export';

const colors = Colors.dark;

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { data: allTracking } = useAllTracking();

  const [signOutModal, setSignOutModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportTrackingData(allTracking ?? []);
    } catch (error) {
      console.error('[Export] failed:', error);
      Alert.alert('Export Failed', 'Could not export your data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

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

        <View className="items-center pt-10 pb-8">
          <View className="relative mb-5">
            <View className="w-28 h-28 rounded-full bg-surface-elevated border border-border items-center justify-center">
              <Text className="font-display text-3xl text-text-sub">
                {(user.name ?? 'U')[0].toUpperCase()}
              </Text>
            </View>
            <View className="w-5 h-5 rounded-full bg-success border-2 border-background absolute bottom-0 right-1" />
          </View>

          <Text className="font-heading text-xl text-text">{user.name ?? 'Series Fan'}</Text>
          <Text className="font-body text-sm text-text-sub mt-1">{user.email}</Text>
        </View>

        <View className="px-5" style={{ gap: 12 }}>

          <View>
            <Text className="font-body text-xs text-text-muted uppercase mb-2 ml-1" style={{ letterSpacing: 1 }}>
              Account
            </Text>
            <View className="bg-surface rounded-xl border border-border overflow-hidden">
              <TouchableOpacity
                className="flex-row items-center px-4 py-4"
                activeOpacity={0.7}
                onPress={() => router.push('/stats')}
              >
                <View className="w-9 h-9 rounded-lg bg-watched-subtle items-center justify-center mr-4">
                  <BarChart2 size={18} color={colors.watched} strokeWidth={1.5} />
                </View>
                <Text className="flex-1 font-body-medium text-base text-text">My Watch Statistics</Text>
                <ChevronRight size={16} color={colors.textMuted} />
              </TouchableOpacity>

              <View className="h-px bg-border-subtle" />

              <TouchableOpacity
                className="flex-row items-center px-4 py-4"
                onPress={handleExport}
                activeOpacity={0.7}
                disabled={isExporting}
              >
                <View className="w-9 h-9 rounded-lg bg-watched-subtle items-center justify-center mr-4">
                  <Download size={18} color={colors.watched} strokeWidth={1.5} />
                </View>
                <Text className="flex-1 font-body-medium text-base text-text">Export My Data</Text>
                {isExporting
                  ? <ActivityIndicator size="small" color={colors.textMuted} />
                  : <ChevronRight size={16} color={colors.textMuted} />
                }
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-2">
            <TouchableOpacity
              className="flex-row items-center justify-center rounded-xl border border-error py-4"
              onPress={() => setSignOutModal(true)}
              activeOpacity={0.8}
            >
              <LogOut size={18} color={colors.error} strokeWidth={1.5} />
              <Text className="font-body-semibold text-base text-error ml-2">Sign Out</Text>
            </TouchableOpacity>
          </View>

          <Text className="font-mono text-xs text-text-muted text-center py-6">BINGE | Version 1.0.0</Text>
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
