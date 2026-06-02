import { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native';
import { X, Plus, Check, Search } from 'lucide-react-native';
import { TextInput } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { usePlaylists, useAddToPlaylist } from '@/hooks/usePlaylists';
import CreatePlaylistModal from './CreatePlaylistModal';
interface Props {
  visible: boolean;
  onClose: () => void;
  series: { tvdbId: number; name: string; posterUrl: string | null };
}

export default function AddToPlaylistModal({ visible, onClose, series }: Props) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showCreate, setShowCreate] = useState(false);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: playlists, isLoading } = usePlaylists();
  const { mutate: addToPlaylist, isPending } = useAddToPlaylist();

  const handleAdd = (playlistId: string) => {
    addToPlaylist(
      { playlistId, tvdbId: series.tvdbId },
      { onSuccess: () => setAddedIds(prev => [...prev, playlistId]) },
    );
  };

  const filteredPlaylists = (playlists ?? []).filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
          <View className="bg-surface rounded-t-2xl px-5 pt-5 pb-8" style={{ maxHeight: '60%' }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-heading text-lg text-text">Add to Playlist</Text>
              <TouchableOpacity onPress={onClose} hitSlop={8}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setShowCreate(true)}
              activeOpacity={0.8}
              className="flex-row items-center rounded-xl border border-dashed border-border py-3 px-4 mb-4"
              style={{ gap: 10 }}
            >
              <Plus size={18} color={colors.accent} strokeWidth={2} />
              <Text className="font-body-medium text-sm text-accent">Create new playlist</Text>
            </TouchableOpacity>

            <View className="flex-row items-center bg-surface-elevated rounded-xl px-3 py-2 border border-border mb-4">
              <Search size={18} color={colors.textMuted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search playlists..."
                placeholderTextColor={colors.textMuted}
                className="flex-1 ml-2 font-body text-sm text-text"
                style={{ paddingVertical: 4 }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
                  <X size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {isLoading && (
              <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} />
            )}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }} keyboardShouldPersistTaps="handled">
              {filteredPlaylists.length === 0 ? (
                !isLoading && (
                  <Text className="font-body text-sm text-text-sub text-center py-4">
                    No playlists yet
                  </Text>
                )
              ) : (
                filteredPlaylists.map(playlist => {
                  const alreadyIn =
                    playlist.series.some(s => s.tvdbId === series.tvdbId) ||
                    addedIds.includes(playlist.id);
                  return (
                    <TouchableOpacity
                      key={playlist.id}
                      onPress={() => !alreadyIn && handleAdd(playlist.id)}
                      activeOpacity={alreadyIn ? 1 : 0.8}
                      className="flex-row items-center justify-between py-3.5 border-b border-border-subtle"
                    >
                      <View>
                        <Text className="font-body-medium text-sm text-text">{playlist.name}</Text>
                        <Text className="font-body text-xs text-text-sub mt-0.5">
                          {playlist.series.length} series
                        </Text>
                      </View>
                      {alreadyIn ? (
                        <Check size={18} color={colors.watched} strokeWidth={2.5} />
                      ) : isPending ? (
                        <ActivityIndicator size="small" color={colors.accent} />
                      ) : (
                        <Plus size={18} color={colors.accent} strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <CreatePlaylistModal visible={showCreate} onClose={() => setShowCreate(false)} />
    </>
  );
}
