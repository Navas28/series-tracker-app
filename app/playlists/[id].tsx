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
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Trash2, Plus, X, Check, ArrowRightLeft } from 'lucide-react-native';
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
  const [moveModalOpen, setMoveModalOpen]     = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [selectedSeries, setSelectedSeries]   = useState<PlaylistSeries | null>(null);
  const [removeTarget, setRemoveTarget]       = useState<{ id: number; name: string } | null>(null);

  const playlist = playlists?.find(p => p.id === id);
  const otherPlaylists = playlists?.filter(p => p.id !== id) ?? [];

  const handleDelete = () => setDeleteModalOpen(true);
  const confirmDelete = () => deletePlaylist(id, { onSuccess: () => router.back() });

  const handleRemove = (seriesId: number, name: string) => {
    setRemoveTarget({ id: seriesId, name });
    setRemoveModalOpen(true);
  };
  const confirmRemove = () => {
    if (removeTarget) removeFromPlaylist({ playlistId: id, seriesId: removeTarget.id });
  };

  const handleMove = (target: Playlist) => {
    if (!selectedSeries) return;
    addToPlaylist(
      { playlistId: target.id, series: selectedSeries },
      {
        onSuccess: () => {
          removeFromPlaylist({ playlistId: id, seriesId: selectedSeries.seriesId });
          setMoveModalOpen(false);
          setSelectedSeries(null);
        },
      },
    );
  };

  const handleAdd = (series: PlaylistSeries) => {
    addToPlaylist({ playlistId: id, series });
  };

  const alreadyInPlaylist = new Set(playlist?.series.map(s => s.seriesId) ?? []);

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
            <Text className="font-body-medium text-xs text-accent-fg">Add</Text>
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
                        style={{ width: '100%', aspectRatio: 2 / 3 }}
                      >
                        {s.posterUrl && (
                          <Image source={{ uri: s.posterUrl }} style={{ flex: 1 }} contentFit="cover" />
                        )}
                      </View>
                      <Text className="font-body-medium text-xs text-text mt-1.5" numberOfLines={1}>
                        {s.name}
                      </Text>
                    </TouchableOpacity>

                    <View className="flex-row mt-1" style={{ gap: 6 }}>
                      <TouchableOpacity
                        onPress={() => { setSelectedSeries(s); setMoveModalOpen(true); }}
                        className="flex-1 items-center py-1.5 rounded-lg bg-surface-elevated border border-border"
                        activeOpacity={0.75}
                      >
                        <ArrowRightLeft size={12} color={colors.textSub} strokeWidth={2} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRemove(s.seriesId, s.name)}
                        className="flex-1 items-center py-1.5 rounded-lg bg-surface-elevated border border-error"
                        activeOpacity={0.75}
                      >
                        <X size={12} color={colors.error} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
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
                maxHeight: '75%',
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

              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: colors.textMuted, paddingHorizontal: 20, marginBottom: 12 }}>
                Choose from your currently tracked series
              </Text>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 16 }}>
                {(allTracking ?? []).map(t => {
                  const added = alreadyInPlaylist.has(t.seriesId);
                  return (
                    <TouchableOpacity
                      key={t.seriesId}
                      onPress={() => !added && handleAdd({ seriesId: t.seriesId, name: t.name, posterUrl: t.posterUrl })}
                      activeOpacity={added ? 1 : 0.75}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        padding: 10,
                        borderRadius: 12,
                        backgroundColor: added ? colors.accentSubtle : colors.surfaceElevated,
                        borderWidth: 1,
                        borderColor: added ? colors.accent : colors.border,
                        opacity: added ? 0.8 : 1,
                      }}
                    >
                      <View style={{ width: 40, height: 56, borderRadius: 6, overflow: 'hidden', backgroundColor: colors.border }}>
                        {t.posterUrl && <Image source={{ uri: t.posterUrl }} style={{ flex: 1 }} contentFit="cover" />}
                      </View>
                      <Text style={{ flex: 1, fontFamily: 'Inter-Medium', fontSize: 14, color: colors.text }} numberOfLines={1}>
                        {t.name}
                      </Text>
                      {added ? (
                        <Check size={18} color={colors.accent} strokeWidth={2.5} />
                      ) : (
                        <Plus size={18} color={colors.textSub} strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                  );
                })}
                {(!allTracking || allTracking.length === 0) && (
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingVertical: 24 }}>
                    Start tracking series first to add them to playlists.
                  </Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Move to Playlist Modal */}
        <Modal
          visible={moveModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setMoveModalOpen(false)}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <Pressable
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
              onPress={() => setMoveModalOpen(false)}
            />
            <View
              style={{
                backgroundColor: colors.surface,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingBottom: 36,
                maxHeight: '55%',
              }}
            >
              <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
                <Text style={{ fontFamily: 'Sora-SemiBold', fontSize: 18, color: colors.text }}>Move to Playlist</Text>
                <TouchableOpacity
                  onPress={() => setMoveModalOpen(false)}
                  style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={16} color={colors.textSub} />
                </TouchableOpacity>
              </View>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: colors.textMuted, paddingHorizontal: 20, marginBottom: 12 }}>
                Moving: {selectedSeries?.name}
              </Text>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 12 }}>
                {otherPlaylists.length === 0 ? (
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingVertical: 24 }}>
                    No other playlists. Create one first.
                  </Text>
                ) : (
                  otherPlaylists.map(p => (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => handleMove(p)}
                      activeOpacity={0.8}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 14,
                        borderRadius: 12,
                        backgroundColor: colors.surfaceElevated,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Text style={{ fontFamily: 'Inter-Medium', fontSize: 15, color: colors.text }}>
                        {p.name}
                      </Text>
                      <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: colors.textMuted }}>
                        {p.series.length} series
                      </Text>
                    </TouchableOpacity>
                  ))
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
