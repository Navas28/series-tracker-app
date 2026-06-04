import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

type Mode = 'login' | 'register';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const toast = useToast();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password, name.trim());
        router.push(`/verify-otp?email=${encodeURIComponent(email.trim())}&purpose=verify_email`);
      }
    } catch (err: unknown) {
      const code = err instanceof Error ? err.message : 'something_went_wrong';
      if (code === 'email_not_verified') {
        router.push(`/verify-otp?email=${encodeURIComponent(email.trim())}&purpose=verify_email`);
      } else if (code === 'email_taken') {
        toast.error('An account with this email already exists');
      } else if (code === 'invalid_credentials') {
        toast.error('Incorrect email or password');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 items-center justify-center px-5 py-8">
            <View className="w-full max-w-md">
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="items-center mb-10"
              >
                <View className="mb-4 h-20 items-center justify-center">
                  <Image
                    source={require('@/assets/images/logo.png')}
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
                transition={{ type: 'timing', duration: 700, delay: 150 }}
                className="bg-surface-elevated/60 border border-border-subtle rounded-[24px] p-8"
              >
                {/* Tab switcher */}
                <View className="flex-row bg-surface rounded-xl p-1 mb-8">
                  {(['login', 'register'] as Mode[]).map((m) => (
                    <TouchableOpacity
                      key={m}
                      className={`flex-1 py-2.5 rounded-lg items-center ${mode === m ? 'bg-accent' : ''}`}
                      onPress={() => switchMode(m)}
                      activeOpacity={0.8}
                    >
                      <Text
                        className={`font-body-semibold text-sm ${mode === m ? 'text-accent-fg' : 'text-text-muted'}`}
                      >
                        {m === 'login' ? 'Sign In' : 'Register'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Name field — register only */}
                {mode === 'register' && (
                  <View className="mb-4">
                    <Text className="font-body-medium text-xs text-text-sub mb-2 uppercase tracking-wider">
                      Name
                    </Text>
                    <TextInput
                      className="bg-surface border border-border rounded-xl px-4 py-3.5 font-body text-sm text-text"
                      placeholder="Your name"
                      placeholderTextColor="#455f82"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                )}

                {/* Email field */}
                <View className="mb-4">
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
                  />
                </View>

                {/* Password field */}
                <View className="mb-6">
                  <Text className="font-body-medium text-xs text-text-sub mb-2 uppercase tracking-wider">
                    Password
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
                  />
                </View>

                {/* Submit button */}
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
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Forgot password */}
                {mode === 'login' && (
                  <TouchableOpacity
                    className="items-center mt-5"
                    onPress={() => router.push('/forgot-password')}
                    activeOpacity={0.7}
                  >
                    <Text className="font-body text-sm text-text-muted">
                      Forgot your password?
                    </Text>
                  </TouchableOpacity>
                )}
              </MotiView>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
