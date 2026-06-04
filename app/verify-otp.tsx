import { useRef, useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { email, purpose } = useLocalSearchParams<{ email: string; purpose: string }>();
  const { verifyOtp, forgotPassword } = useAuth();
  const toast = useToast();
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

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
    if (cooldown > 0) return;
    setResending(true);
    try {
      if (isReset) {
        await forgotPassword(email);
      } else {
        const API_URL = process.env.EXPO_PUBLIC_API_URL!;
        const res = await fetch(`${API_URL}/auth/resend-verification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'request_failed');
      }
      toast.success('New code sent to your email');
      setCooldown(30);
      setDigits(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (err: unknown) {
      const code = err instanceof Error ? err.message : '';
      if (code === 'otp_cooldown') {
        toast.error('Please wait before requesting a new code.');
        setCooldown(30);
      } else {
        toast.error('Failed to resend. Please try again.');
      }
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
              {isReset ? 'Reset Password' : 'Verify Email'}
            </Text>
            <Text className="font-body text-sm text-text-muted mb-1">
              We sent a 6-digit code to
            </Text>
            <Text className="font-body-semibold text-sm text-text-sub mb-1">
              {email}
            </Text>
            <Text className="font-body text-xs text-text-muted mb-10">
              Expires in 10 minutes
            </Text>

            {/* OTP tiles */}
            <View className="flex-row justify-between mb-10">
              {digits.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(ref) => { inputs.current[i] = ref; }}
                  className={`bg-surface text-center font-mono-bold text-2xl text-text rounded-lg ${
                    digit ? 'border-2 border-accent' : 'border-2 border-border'
                  }`}
                  style={{ width: 50, height: 62 }}
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
                <ActivityIndicator size="small" color={colors.accentFg} />
              ) : (
                <Text className="font-body-semibold text-base text-accent-fg">
                  Verify Code
                </Text>
              )}
            </TouchableOpacity>

            {/* Resend */}
            <TouchableOpacity
              className="items-center py-2"
              onPress={handleResend}
              activeOpacity={0.7}
              disabled={resending || cooldown > 0}
            >
              {resending ? (
                <ActivityIndicator size="small" color={colors.textMuted} />
              ) : cooldown > 0 ? (
                <Text className="font-body text-sm text-text-muted">
                  Resend in <Text className="font-mono text-accent">{cooldown}s</Text>
                </Text>
              ) : (
                <Text className="font-body text-sm text-text-muted">
                  Didn't receive it?{' '}
                  <Text className="font-body-medium text-accent">Resend code</Text>
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
            <Text className="font-body text-sm text-text-muted">← Go back</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
