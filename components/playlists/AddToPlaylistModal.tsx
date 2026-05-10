import { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { X, Plus, Check } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { usePlaylists, useAddToPlaylist } from '@/hooks/usePlaylists';
import CreatePlaylistModal from './CreatePlaylistModal';
import type { PlaylistSeries } from '@/services/firestore/playlists';

interface Props {
  visible: boolean;
  onClose: () => void;
  series: PlaylistSeries;
}

export default function AddToPlaylistModal({ visible, onClose, series }: Props) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showCreate, setShowCreate] = useState(false);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const { data: playlists, isLoading } = usePlaylists();
  const { mutate: addToPlaylist, isPending } = useAddToPlaylist();

  const handleAdd = (playlistId: string) => {
    addToPlaylist(
      { playlistId, series },
      { onSuccess: () => setAddedIds(prev => [...prev, playlistId]) },
    );
  };

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

            {isLoading && (
              <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} />
            )}

            <FlashList
              data={playlists}
              keyExtractor={p => p.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: playlist }) => {
                const alreadyIn =
                  playlist.series.some(s => s.seriesId === series.seriesId) ||
                  addedIds.includes(playlist.id);
                return (
                  <TouchableOpacity
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
              }}
              ListEmptyComponent={
                !isLoading ? (
                  <Text className="font-body text-sm text-text-sub text-center py-4">
                    No playlists yet
                  </Text>
                ) : null
              }
            />
          </View>
        </View>
      </Modal>

      <CreatePlaylistModal visible={showCreate} onClose={() => setShowCreate(false)} />
    </>
  );
}
