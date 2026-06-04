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
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      router.push(`/verify-otp?email=${encodeURIComponent(email.trim())}&purpose=reset_password`);
    } catch {
      toast.error('Something went wrong. Please try again.');
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
                  Forgot Password
                </Text>
                <Text className="font-body text-sm text-text-muted text-center">
                  Enter your email and we'll send you a reset code.
                </Text>
              </View>

              <View className="mb-6">
                <Text className="font-body-medium text-xs text-text-sub mb-2 uppercase tracking-wider">
                  Email
                </Text>
                <TextInput
                  className="bg-surface border border-border rounded-xl px-4 py-3.5 font-body text-sm text-text"
                  placeholder="you@example.com"
                  placeholderTextColor="#455f82"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
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
                    Send Reset Code
                  </Text>
                )}
              </TouchableOpacity>
            </MotiView>

            <TouchableOpacity
              className="items-center mt-6"
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text className="font-body text-sm text-text-muted">
                ← Back to sign in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
