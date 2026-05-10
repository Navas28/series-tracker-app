import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  TextInput,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Trash2, Plus, X, Check, Search } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Colors } from '@/constants/theme';
import {
  usePlaylists,
  useDeletePlaylist,
  useRemoveFromPlaylist,
  useAddToPlaylist,
} from '@/hooks/usePlaylists';
import { useAllTracking } from '@/hooks/useTracking';
import { Skeleton } from '@/components/ui/Skeleton';
import ConfirmModal from '@/components/ui/ConfirmModal';
import type { Playlist, PlaylistSeries } from '@/services/firestore/playlists';

const colors = Colors.dark;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_GAP = 12;
const H_PADDING = 20;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - COLUMN_GAP) / 2;

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: playlists, isLoading } = usePlaylists();
  const { data: allTracking }          = useAllTracking();
  const { mutate: deletePlaylist }     = useDeletePlaylist();
  const { mutate: removeFromPlaylist } = useRemoveFromPlaylist();
  const { mutate: addToPlaylist }      = useAddToPlaylist();

  const [addModalOpen, setAddModalOpen]       = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removeTarget, setRemoveTarget]       = useState<{ id: number; name: string } | null>(null);
  const [searchQuery, setSearchQuery]         = useState('');

  const playlist = playlists?.find(p => p.id === id);

  const handleDelete = () => setDeleteModalOpen(true);
  const confirmDelete = () => deletePlaylist(id, { onSuccess: () => router.back() });

  const handleRemove = (seriesId: number, name: string) => {
    setRemoveTarget({ id: seriesId, name });
    setRemoveModalOpen(true);
  };
  const confirmRemove = () => {
    if (removeTarget) removeFromPlaylist({ playlistId: id, seriesId: removeTarget.id });
  };

  const handleAdd = (series: PlaylistSeries) => {
    addToPlaylist({ playlistId: id, series });
  };

  const alreadyInPlaylist = new Set(playlist?.series.map(s => s.seriesId) ?? []);

  const filteredSeries = (allTracking ?? []).filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) && !alreadyInPlaylist.has(t.seriesId)
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>

        {/* Header */}
        <View className="flex-row items-center px-5 py-3" style={{ gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={22} color={colors.text} strokeWidth={1.75} />
          </TouchableOpacity>
          <Text className="font-heading text-base text-text flex-1" numberOfLines={1}>
            {playlist?.name ?? ''}
          </Text>
          <TouchableOpacity
            onPress={() => setAddModalOpen(true)}
            hitSlop={8}
            className="flex-row items-center bg-accent rounded-lg px-3 py-1.5"
            style={{ gap: 5 }}
          >
            <Plus size={14} color={colors.accentFg} strokeWidth={2.5} />
            <Text className="font-body-medium text-sm text-accent-fg">Add</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} hitSlop={8}>
            <Trash2 size={20} color={colors.error} strokeWidth={1.75} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {isLoading && (
          <View className="flex-row px-5 mt-2" style={{ gap: COLUMN_GAP }}>
            {[0, 1].map(i => (
              <Skeleton key={i} width={CARD_WIDTH} height={CARD_WIDTH * 1.5} borderRadius={12} />
            ))}
          </View>
        )}

        {!isLoading && playlist && (
          <>
            {playlist.series.length === 0 ? (
              <View className="flex-1 items-center justify-center px-8">
                <Text className="font-body text-sm text-text-sub text-center leading-relaxed">
                  No series yet.{'\n'}Tap Add to start building this playlist.
                </Text>
                <TouchableOpacity
                  onPress={() => setAddModalOpen(true)}
                  className="mt-5 flex-row items-center bg-accent rounded-xl px-5 py-3"
                  style={{ gap: 8 }}
                  activeOpacity={0.85}
                >
                  <Plus size={16} color={colors.accentFg} strokeWidth={2.5} />
                  <Text className="font-body-semibold text-sm text-accent-fg">Add Series</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlashList
                data={playlist.series}
                numColumns={2}
                keyExtractor={s => String(s.seriesId)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: H_PADDING, paddingTop: 8, paddingBottom: 40 }}
                ItemSeparatorComponent={() => <View style={{ height: COLUMN_GAP }} />}
                renderItem={({ item: s, index }) => (
                  <View style={{ flex: 1, paddingLeft: index % 2 === 1 ? COLUMN_GAP : 0 }}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => router.push(`/series/${s.seriesId}`)}
                    >
                      <View
                        className="rounded-xl overflow-hidden bg-surface-elevated"
                        style={{ width: '100%', aspectRatio: 2 / 3, position: 'relative' }}
                      >
                        {s.posterUrl && (
                          <Image source={{ uri: s.posterUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                        )}
                        <TouchableOpacity
                          onPress={() => handleRemove(s.seriesId, s.name)}
                          style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            padding: 6,
                            borderRadius: 12,
                          }}
                          hitSlop={8}
                        >
                          <X size={14} color="#FFF" strokeWidth={2.5} />
                        </TouchableOpacity>
                      </View>
                      <Text className="font-body-medium text-xs text-text mt-1.5" numberOfLines={1}>
                        {s.name}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </>
        )}

        {/* Add Series Modal */}
        <Modal
          visible={addModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setAddModalOpen(false)}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <Pressable
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
              onPress={() => setAddModalOpen(false)}
            />
            <View
              style={{
                backgroundColor: colors.surface,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                maxHeight: '80%',
                paddingBottom: 36,
              }}
            >
              <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
                <Text style={{ fontFamily: 'Sora-SemiBold', fontSize: 18, color: colors.text }}>
                  Add to Playlist
                </Text>
                <TouchableOpacity
                  onPress={() => setAddModalOpen(false)}
                  style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={16} color={colors.textSub} />
                </TouchableOpacity>
              </View>

              <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceElevated, borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: colors.border }}>
                  <Search size={18} color={colors.textMuted} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search your series..."
                    placeholderTextColor={colors.textMuted}
                    style={{ flex: 1, marginLeft: 8, fontFamily: 'Inter-Regular', fontSize: 14, color: colors.text }}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
                      <X size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 16 }} keyboardShouldPersistTaps="handled">
                {filteredSeries.length === 0 ? (
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingVertical: 24 }}>
                    {allTracking?.length === 0 ? "Start tracking series first to add them to playlists." : "No series found."}
                  </Text>
                ) : (
                  filteredSeries.map(t => {
                    return (
                      <TouchableOpacity
                        key={t.seriesId}
                        onPress={() => handleAdd({ seriesId: t.seriesId, name: t.name, posterUrl: t.posterUrl })}
                        activeOpacity={0.75}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                          padding: 10,
                          borderRadius: 12,
                          backgroundColor: colors.surfaceElevated,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <View style={{ width: 40, height: 56, borderRadius: 6, overflow: 'hidden', backgroundColor: colors.border }}>
                          {t.posterUrl && <Image source={{ uri: t.posterUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />}
                        </View>
                        <Text style={{ flex: 1, fontFamily: 'Inter-Medium', fontSize: 14, color: colors.text }} numberOfLines={1}>
                          {t.name}
                        </Text>
                        <Plus size={18} color={colors.textSub} strokeWidth={2} />
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>



        <ConfirmModal
          visible={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Playlist"
          message={`Delete "${playlist?.name ?? 'this playlist'}"? This action can't be undone.`}
          confirmLabel="Delete"
          variant="danger"
        />

        <ConfirmModal
          visible={removeModalOpen}
          onClose={() => setRemoveModalOpen(false)}
          onConfirm={confirmRemove}
          title="Remove Series"
          message={`Remove "${removeTarget?.name ?? 'this series'}" from the playlist?`}
          confirmLabel="Remove"
          variant="danger"
        />

      </SafeAreaView>
    </>
  );
}
