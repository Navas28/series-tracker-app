import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useLocalSearchParams } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { resetPassword } = useAuth();
  const toast = useToast();
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password || !confirm) {
      toast.error('Please fill in both fields');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
    } catch {
      toast.error('Reset link expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 28,
            paddingVertical: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <MotiView
            from={{ opacity: 0, translateY: 24 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 120 }}
          >
            {/* Icon mark */}
            <View className="w-12 h-12 rounded-xl bg-accent-subtle items-center justify-center mb-7">
              <Lock size={22} color={colors.accent} strokeWidth={1.75} />
            </View>

            {/* Heading */}
            <Text className="font-heading text-3xl text-text mb-2">
              New Password
            </Text>
            <Text className="font-body text-sm text-text-muted mb-10">
              Choose a strong password for your account.
            </Text>

            {/* Password fields */}
            <View className="mb-5">
              <Text className="font-body-medium text-xs text-text-muted uppercase tracking-wider mb-2">
                New Password
              </Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-4 font-body text-sm text-text"
                placeholder="Min. 8 characters"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>

            <View className="mb-8">
              <Text className="font-body-medium text-xs text-text-muted uppercase tracking-wider mb-2">
                Confirm Password
              </Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-4 font-body text-sm text-text"
                placeholder="Repeat your password"
                placeholderTextColor={colors.textMuted}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleSubmit}
                returnKeyType="done"
              />
            </View>

            <TouchableOpacity
              className="bg-accent rounded-xl py-4 items-center"
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.accentFg} />
              ) : (
                <Text className="font-body-semibold text-base text-accent-fg">
                  Set New Password
                </Text>
              )}
            </TouchableOpacity>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
