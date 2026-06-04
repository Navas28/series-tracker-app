import { useRef, useState } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { email, purpose } = useLocalSearchParams<{ email: string; purpose: string }>();
  const { verifyOtp, forgotPassword } = useAuth();
  const toast = useToast();

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  const isReset = purpose === 'reset_password';

  const handleDigit = (value: string, index: number) => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    if (cleaned && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length < 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtp(email, otp, purpose as 'verify_email' | 'reset_password');
      if (isReset && result?.resetToken) {
        router.replace(`/reset-password?token=${encodeURIComponent(result.resetToken)}`);
      }
      // For verify_email: token is saved in verifyOtp, root layout redirects automatically
    } catch (err: unknown) {
      const code = err instanceof Error ? err.message : '';
      if (code === 'otp_expired') {
        toast.error('Code expired. Request a new one.');
      } else {
        toast.error('Incorrect code. Please try again.');
      }
      setDigits(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      if (isReset) {
        await forgotPassword(email);
      } else {
        const API_URL = process.env.EXPO_PUBLIC_API_URL!;
        await fetch(`${API_URL}/auth/resend-verification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      }
      toast.success('New code sent to your email');
      setDigits(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch {
      toast.error('Failed to resend. Please try again.');
    } finally {
      setResending(false);
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
                  {isReset ? 'Reset Password' : 'Verify Email'}
                </Text>
                <Text className="font-body text-sm text-text-muted text-center">
                  We sent a 6-digit code to
                </Text>
                <Text className="font-body-semibold text-sm text-text-sub mt-1">
                  {email}
                </Text>
                <Text className="font-body text-xs text-text-muted mt-2">
                  Expires in 10 minutes
                </Text>
              </View>

              {/* OTP digit boxes */}
              <View className="flex-row justify-between mb-8">
                {digits.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={(ref) => { inputs.current[i] = ref; }}
                    className={`w-12 h-14 bg-surface border rounded-xl text-center font-mono-bold text-xl text-text ${
                      digit ? 'border-accent' : 'border-border'
                    }`}
                    value={digit}
                    onChangeText={(v) => handleDigit(v, i)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              {/* Verify button */}
              <TouchableOpacity
                className="bg-accent rounded-xl py-4 items-center mb-5"
                onPress={handleVerify}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#010d23" />
                ) : (
                  <Text className="font-body-semibold text-base text-accent-fg">
                    Verify Code
                  </Text>
                )}
              </TouchableOpacity>

              {/* Resend */}
              <TouchableOpacity
                className="items-center"
                onPress={handleResend}
                activeOpacity={0.7}
                disabled={resending}
              >
                {resending ? (
                  <ActivityIndicator size="small" color="#455f82" />
                ) : (
                  <Text className="font-body text-sm text-text-muted">
                    Didn't receive it?{' '}
                    <Text className="text-accent">Resend code</Text>
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
                ← Go back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
