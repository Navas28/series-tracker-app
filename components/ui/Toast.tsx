import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { CheckCircle, XCircle, Info, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';

/* ─── Types ─────────────────────────────────────────────────── */

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  show: (variant: ToastVariant, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

/* ─── Context ────────────────────────────────────────────────── */

const ToastContext = createContext<ToastContextValue | null>(null);

/* ─── Single Toast item ──────────────────────────────────────── */

function ToastItem({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const config: Record<ToastVariant, { icon: React.ReactNode; bg: string; border: string; text: string }> = {
    success: {
      icon: <CheckCircle size={20} color={colors.success} strokeWidth={2} />,
      bg:   colors.successSubtle,
      border: colors.success,
      text: colors.success,
    },
    error: {
      icon: <XCircle size={20} color={colors.error} strokeWidth={2} />,
      bg:   colors.errorSubtle,
      border: colors.error,
      text: colors.error,
    },
    info: {
      icon: <Info size={20} color={colors.accent} strokeWidth={2} />,
      bg:   colors.accentSubtle,
      border: colors.accent,
      text: colors.accent,
    },
  };

  const { icon, bg, border, text } = config[item.variant];

  return (
    <MotiView
      from={{ opacity: 0, translateY: -16, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      exit={{ opacity: 0, translateY: -12, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      exitTransition={{ type: 'timing', duration: 220 }}
      style={[styles.toast, { backgroundColor: bg, borderColor: border }]}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: border }]} />

      {/* Icon */}
      <View style={styles.iconWrap}>{icon}</View>

      {/* Message */}
      <Text
        style={[styles.message, { color: text }]}
        numberOfLines={3}
      >
        {item.message}
      </Text>

      {/* Dismiss button */}
      <View style={styles.dismissWrap}>
        <X
          size={16}
          color={text}
          strokeWidth={2.5}
          onPress={() => onDismiss(item.id)}
        />
      </View>
    </MotiView>
  );
}

/* ─── Provider ───────────────────────────────────────────────── */

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const insets = useSafeAreaInsets();

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback(
    (variant: ToastVariant, message: string, duration = 3500) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts(prev => [...prev, { id, variant, message, duration }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const api: ToastContextValue = {
    show,
    success: (msg, dur) => show('success', msg, dur),
    error:   (msg, dur) => show('error',   msg, dur),
    info:    (msg, dur) => show('info',    msg, dur),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Toast stack — rendered above everything */}
      <View
        style={[
          styles.container,
          { top: insets.top + Spacing[3] },
        ]}
        pointerEvents="box-none"
      >
        <AnimatePresence>
          {toasts.map(item => (
            <ToastItem key={item.id} item={item} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </View>
    </ToastContext.Provider>
  );
}

/* ─── Hook ───────────────────────────────────────────────────── */

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

/* ─── Styles ─────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing[4],
    right: Spacing[4],
    zIndex: 9999,
    gap: Spacing[2],
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    paddingVertical: Spacing[3],
    paddingRight: Spacing[3],
    // subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
    marginRight: Spacing[3],
  },
  iconWrap: {
    marginRight: Spacing[2],
  },
  message: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.45,
  },
  dismissWrap: {
    marginLeft: Spacing[2],
    padding: Spacing[1],
  },
});
