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
import { useRouter } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword } = useAuth();
  const toast = useToast();
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

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
              <Mail size={22} color={colors.accent} strokeWidth={1.75} />
            </View>

            {/* Heading */}
            <Text className="font-heading text-3xl text-text mb-2">
              Forgot Password
            </Text>
            <Text className="font-body text-sm text-text-muted mb-10">
              Enter your email and we'll send you a reset code.
            </Text>

            {/* Email field */}
            <View className="mb-8">
              <Text className="font-body-medium text-xs text-text-muted uppercase tracking-wider mb-2">
                Email
              </Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-4 font-body text-sm text-text"
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                onSubmitEditing={handleSubmit}
                returnKeyType="send"
              />
            </View>

            {/* CTA */}
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
                  Send Reset Code
                </Text>
              )}
            </TouchableOpacity>
          </MotiView>

          {/* Back link */}
          <TouchableOpacity
            className="items-center mt-10"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text className="font-body text-sm text-text-muted">← Back to sign in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
