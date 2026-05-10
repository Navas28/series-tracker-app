import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useCreatePlaylist } from '@/hooks/usePlaylists';

const colors = Colors.dark;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function CreatePlaylistModal({ visible, onClose }: Props) {
  const [name, setName] = useState('');
  const { mutate: createPlaylist, isPending } = useCreatePlaylist();

  const handleCreate = () => {
    if (!name.trim()) return;
    createPlaylist(name, {
      onSuccess: () => {
        setName('');
        onClose();
      },
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(1,13,35,0.75)' }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: Platform.OS === 'ios' ? 36 : 24,
            }}
          >
            <View className="flex-row items-center justify-between mb-5">
              <Text className="font-heading text-lg text-text">New Playlist</Text>
              <TouchableOpacity onPress={onClose} hitSlop={8}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Playlist name"
              placeholderTextColor={colors.textMuted}
              style={{
                backgroundColor: colors.surfaceElevated,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontFamily: 'Inter-Regular',
                fontSize: 14,
                color: colors.text,
                marginBottom: 16,
              }}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />

            <TouchableOpacity
              onPress={handleCreate}
              disabled={!name.trim() || isPending}
              activeOpacity={0.8}
              style={{
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
                backgroundColor: name.trim() ? colors.accent : colors.surfaceElevated,
              }}
            >
              {isPending ? (
                <ActivityIndicator size="small" color={colors.accentFg} />
              ) : (
                <Text style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 14,
                  color: name.trim() ? colors.accentFg : colors.textMuted,
                }}>
                  Create Playlist
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
