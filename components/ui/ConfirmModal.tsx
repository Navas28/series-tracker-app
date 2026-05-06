import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { AlertTriangle, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  /** 'danger' shows the confirm button in error red. 'default' uses accent. */
  variant?: 'danger' | 'default';
}

/**
 * A branded, animated confirmation modal.
 * Replaces Alert.alert() for destructive actions.
 */
export default function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
}: ConfirmModalProps) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const confirmBg    = variant === 'danger' ? colors.error        : colors.accent;
  const confirmFg    = variant === 'danger' ? '#ffffff'           : colors.accentFg;
  const iconBg       = variant === 'danger' ? colors.errorSubtle  : colors.accentSubtle;
  const iconColor    = variant === 'danger' ? colors.error        : colors.accent;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <AnimatePresence>
        {visible && (
          <>
            {/* Backdrop */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'timing', duration: 180 }}
              style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)' }}
            >
              <Pressable style={{ flex: 1 }} onPress={onClose} />
            </MotiView>

            {/* Dialog card */}
            <MotiView
              from={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 32,
              }}
              pointerEvents="box-none"
            >
              <View
                style={{
                  width: '100%',
                  backgroundColor: colors.surface,
                  borderRadius: 24,
                  padding: 24,
                  borderWidth: 1,
                  borderColor: colors.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.28,
                  shadowRadius: 20,
                  elevation: 16,
                }}
              >
                {/* Close X */}
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={8}
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: colors.surfaceElevated,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={14} color={colors.textMuted} strokeWidth={2} />
                </TouchableOpacity>

                {/* Icon */}
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    backgroundColor: iconBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: iconColor + '40',
                  }}
                >
                  <AlertTriangle size={26} color={iconColor} strokeWidth={2} />
                </View>

                {/* Title */}
                <Text
                  style={{
                    fontFamily: 'Sora-SemiBold',
                    fontSize: 18,
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  {title}
                </Text>

                {/* Message */}
                <Text
                  style={{
                    fontFamily: 'Inter-Regular',
                    fontSize: 14,
                    color: colors.textSub,
                    lineHeight: 21,
                    marginBottom: 24,
                  }}
                >
                  {message}
                </Text>

                {/* Buttons */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {/* Cancel */}
                  <TouchableOpacity
                    onPress={onClose}
                    activeOpacity={0.75}
                    style={{
                      flex: 1,
                      paddingVertical: 13,
                      borderRadius: 12,
                      backgroundColor: colors.surfaceElevated,
                      borderWidth: 1,
                      borderColor: colors.border,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontFamily: 'Inter-Medium', fontSize: 15, color: colors.textSub }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  {/* Confirm */}
                  <TouchableOpacity
                    onPress={() => { onConfirm(); onClose(); }}
                    activeOpacity={0.82}
                    style={{
                      flex: 1,
                      paddingVertical: 13,
                      borderRadius: 12,
                      backgroundColor: confirmBg,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: confirmFg }}>
                      {confirmLabel}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </MotiView>
          </>
        )}
      </AnimatePresence>
    </Modal>
  );
}
