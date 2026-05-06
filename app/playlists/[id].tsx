import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Trash2, Plus, X, Check, ArrowRightLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { Image } from 'expo-image';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import {
  usePlaylists,
  useDeletePlaylist,
  useRemoveFromPlaylist,
  useAddToPlaylist,
} from '@/hooks/usePlaylists';
import { useAllTracking } from '@/hooks/useTracking';
import { getImageUrl } from '@/services/tmdb/client';
import SeriesCard from '@/components/series/SeriesCard';
import { Skeleton } from '@/components/ui/Skeleton';
import ConfirmModal from '@/components/ui/ConfirmModal';
import type { Playlist, PlaylistSeries } from '@/services/firestore/playlists';
import type { SeriesListItem } from '@/services/tmdb/types';

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

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

  /* ── Delete playlist ── */
  const handleDelete = () => setDeleteModalOpen(true);
  const confirmDelete = () => deletePlaylist(id, { onSuccess: () => router.back() });

  /* ── Remove series from this playlist ── */
  const handleRemove = (seriesId: number, name: string) => {
    setRemoveTarget({ id: seriesId, name });
    setRemoveModalOpen(true);
  };
  const confirmRemove = () => {
    if (removeTarget) removeFromPlaylist({ playlistId: id, seriesId: removeTarget.id });
  };

  /* ── Move series to another playlist ── */
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

  /* ── Add tracked series ── */
  const handleAdd = (series: PlaylistSeries) => {
    addToPlaylist({ playlistId: id, series });
  };

  const alreadyInPlaylist = new Set(playlist?.series.map(s => s.seriesId) ?? []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>

        {/* ── Header ─────────────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 380 }}
          className="flex-row items-center px-5 py-3"
          style={{ gap: 12 }}
        >
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
          <TouchableOpacity onPress={() => setDeleteModalOpen(true)} hitSlop={8}>
            <Trash2 size={20} color={colors.error} strokeWidth={1.75} />
          </TouchableOpacity>
        </MotiView>

        {/* ── Content ─────────────────────────────────────────── */}
        {isLoading && (
          <View className="flex-row flex-wrap px-5 mt-2" style={{ gap: 12 }}>
            {[0, 1, 2, 3].map(i => (
              <Skeleton key={i} width={110} height={165} borderRadius={10} />
            ))}
          </View>
        )}

        {!isLoading && playlist && (
          <>
            {playlist.series.length === 0 ? (
              <MotiView
                from={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 18 }}
                className="flex-1 items-center justify-center px-8"
              >
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
              </MotiView>
            ) : (
              <FlashList
                data={playlist.series}
                numColumns={3}
                keyExtractor={s => String(s.seriesId)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
                renderItem={({ item: s, index }) => {
                  const imageUrl = getImageUrl(s.posterPath, 'w185');
                  return (
                    <MotiView
                      from={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', damping: 20, delay: index * 50 }}
                      style={{ flex: 1, maxWidth: '33.33%', paddingLeft: index % 3 !== 0 ? 10 : 0 }}
                    >
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => router.push(`/series/${s.seriesId}`)}
                      >
                        <View className="rounded-xl overflow-hidden bg-surface-elevated" style={{ aspectRatio: 2 / 3 }}>
                          {imageUrl && (
                            <Image source={{ uri: imageUrl }} style={{ flex: 1 }} contentFit="cover" />
                          )}
                        </View>
                        <Text className="font-body-medium text-xs text-text mt-1.5" numberOfLines={1}>
                          {s.name}
                        </Text>
                      </TouchableOpacity>

                      {/* Action row: move + remove */}
                      <View className="flex-row mt-1" style={{ gap: 6 }}>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedSeries(s);
                            setMoveModalOpen(true);
                          }}
                          className="flex-1 items-center py-1 rounded-lg bg-surface-elevated border border-border"
                          activeOpacity={0.75}
                        >
                          <ArrowRightLeft size={12} color={colors.textSub} strokeWidth={2} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleRemove(s.seriesId, s.name)}
                          className="flex-1 items-center py-1 rounded-lg bg-error-subtle border border-error"
                          activeOpacity={0.75}
                        >
                          <X size={12} color={colors.error} strokeWidth={2} />
                        </TouchableOpacity>
                      </View>
                    </MotiView>
                  );
                }}
              />
            )}
          </>
        )}

        {/* ──────────────────────────────────────────────────────── */}
        {/*  Add Series Modal (from tracked series)                  */}
        {/* ──────────────────────────────────────────────────────── */}
        <Modal visible={addModalOpen} transparent animationType="none" onRequestClose={() => setAddModalOpen(false)}>
          <AnimatePresence>
            {addModalOpen && (
              <>
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'timing', duration: 180 }}
                  style={{ position: 'absolute', inset: 0, backgroundColor: colors.overlay }}
                >
                  <Pressable style={{ flex: 1 }} onPress={() => setAddModalOpen(false)} />
                </MotiView>

                <MotiView
                  from={{ translateY: 500 }}
                  animate={{ translateY: 0 }}
                  exit={{ translateY: 500 }}
                  transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: colors.surface,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    maxHeight: '75%',
                    paddingBottom: 36,
                  }}
                >
                  {/* Handle */}
                  <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
                    <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
                    <Text style={{ fontFamily: 'Sora-SemiBold', fontSize: 18, color: colors.text }}>
                      Add to Playlist
                    </Text>
                    <TouchableOpacity onPress={() => setAddModalOpen(false)}
                      style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }}>
                      <X size={16} color={colors.textSub} />
                    </TouchableOpacity>
                  </View>

                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: colors.textMuted, paddingHorizontal: 20, marginBottom: 12 }}>
                    Choose from your currently tracked series
                  </Text>

                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 16 }}>
                    {(allTracking ?? []).map((t, i) => {
                      const added = alreadyInPlaylist.has(t.seriesId);
                      const posterUrl = getImageUrl(t.posterPath, 'w92');
                      return (
                        <MotiView
                          key={t.seriesId}
                          from={{ opacity: 0, translateX: -10 }}
                          animate={{ opacity: 1, translateX: 0 }}
                          transition={{ type: 'timing', duration: 260, delay: i * 40 }}
                        >
                          <TouchableOpacity
                            onPress={() => !added && handleAdd({ seriesId: t.seriesId, name: t.name, posterPath: t.posterPath })}
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
                              {posterUrl && <Image source={{ uri: posterUrl }} style={{ flex: 1 }} contentFit="cover" />}
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
                        </MotiView>
                      );
                    })}
                    {(!allTracking || allTracking.length === 0) && (
                      <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingVertical: 24 }}>
                        Start tracking series first to add them to playlists.
                      </Text>
                    )}
                  </ScrollView>
                </MotiView>
              </>
            )}
          </AnimatePresence>
        </Modal>

        {/* ──────────────────────────────────────────────────────── */}
        {/*  Move to Playlist Modal                                   */}
        {/* ──────────────────────────────────────────────────────── */}
        <Modal visible={moveModalOpen} transparent animationType="none" onRequestClose={() => setMoveModalOpen(false)}>
          <AnimatePresence>
            {moveModalOpen && (
              <>
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'timing', duration: 180 }}
                  style={{ position: 'absolute', inset: 0, backgroundColor: colors.overlay }}
                >
                  <Pressable style={{ flex: 1 }} onPress={() => setMoveModalOpen(false)} />
                </MotiView>

                <MotiView
                  from={{ translateY: 400 }}
                  animate={{ translateY: 0 }}
                  exit={{ translateY: 400 }}
                  transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
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
                    <TouchableOpacity onPress={() => setMoveModalOpen(false)}
                      style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }}>
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
                      otherPlaylists.map((p, i) => (
                        <MotiView
                          key={p.id}
                          from={{ opacity: 0, translateX: -8 }}
                          animate={{ opacity: 1, translateX: 0 }}
                          transition={{ type: 'timing', duration: 240, delay: i * 50 }}
                        >
                          <TouchableOpacity
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
                        </MotiView>
                      ))
                    )}
                  </ScrollView>
                </MotiView>
              </>
            )}
          </AnimatePresence>
        </Modal>

        {/* ── Delete Playlist confirm ── */}
        <ConfirmModal
          visible={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Playlist"
          message={`Delete "${playlist?.name ?? 'this playlist'}"? This action can't be undone.`}
          confirmLabel="Delete"
          variant="danger"
        />

        {/* ── Remove Series confirm ── */}
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
