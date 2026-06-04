import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { resetPassword } = useAuth();
  const toast = useToast();

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
      // token saved in resetPassword → root layout redirects to tabs automatically
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
        <View className="flex-1 items-center justify-center px-5">
          <View className="w-full max-w-md">
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="bg-surface-elevated/60 border border-border-subtle rounded-[24px] p-8"
            >
              <View className="items-center mb-8">
                <Text className="font-heading text-2xl text-text mb-2">
                  New Password
                </Text>
                <Text className="font-body text-sm text-text-muted text-center">
                  Choose a strong password for your account.
                </Text>
              </View>

              <View className="mb-4">
                <Text className="font-body-medium text-xs text-text-sub mb-2 uppercase tracking-wider">
                  New Password
                </Text>
                <TextInput
                  className="bg-surface border border-border rounded-xl px-4 py-3.5 font-body text-sm text-text"
                  placeholder="Min. 8 characters"
                  placeholderTextColor="#455f82"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
              </View>

              <View className="mb-6">
                <Text className="font-body-medium text-xs text-text-sub mb-2 uppercase tracking-wider">
                  Confirm Password
                </Text>
                <TextInput
                  className="bg-surface border border-border rounded-xl px-4 py-3.5 font-body text-sm text-text"
                  placeholder="Repeat your password"
                  placeholderTextColor="#455f82"
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                className="bg-accent rounded-xl py-4 items-center"
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#010d23" />
                ) : (
                  <Text className="font-body-semibold text-base text-accent-fg">
                    Set New Password
                  </Text>
                )}
              </TouchableOpacity>
            </MotiView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
