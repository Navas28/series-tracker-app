import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { useCreatePlaylist } from '@/hooks/usePlaylists';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function CreatePlaylistModal({ visible, onClose }: Props) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
        <View className="bg-surface rounded-t-2xl px-5 pt-5 pb-8">
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
            className="bg-surface-elevated border border-border rounded-xl px-4 py-3 font-body text-sm text-text mb-4"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />

          <TouchableOpacity
            onPress={handleCreate}
            disabled={!name.trim() || isPending}
            activeOpacity={0.8}
            className={`rounded-xl py-3.5 items-center ${name.trim() ? 'bg-accent' : 'bg-surface-elevated'}`}
          >
            {isPending ? (
              <ActivityIndicator size="small" color={colors.accentFg} />
            ) : (
              <Text className={`font-body-semibold text-sm ${name.trim() ? 'text-accent-fg' : 'text-text-muted'}`}>
                Create Playlist
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
