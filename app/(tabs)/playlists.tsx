import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, ScrollView, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { Plus, ListVideo, ArrowRight, Trash2, X, Check, ArrowRightLeft } from 'lucide-react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { usePlaylists, useCreatePlaylist, useDeletePlaylist, useAddToPlaylist, useRemoveFromPlaylist } from '@/hooks/usePlaylists';
import { useAllTracking } from '@/hooks/useTracking';
import { getImageUrl } from '@/services/tmdb/client';
import CreatePlaylistModal from '@/components/playlists/CreatePlaylistModal';
import PlaylistCard from '@/components/playlists/PlaylistCard';
import { Skeleton } from '@/components/ui/Skeleton';

export default function PlaylistsScreen() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [showCreate, setShowCreate] = useState(false);

  const { data: playlists, isLoading } = usePlaylists();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>

      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -14 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400 }}
        className="flex-row items-center justify-between px-5 pt-3 pb-4"
      >
        <View>
          <Text className="font-display text-2xl text-text">Playlists</Text>
          <Text className="font-body text-sm text-text-sub mt-0.5">Organize your watchlist</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowCreate(true)}
          activeOpacity={0.8}
          className="flex-row items-center bg-accent rounded-xl px-4 py-2.5"
          style={{ gap: 6 }}
        >
          <Plus size={16} color={colors.accentFg} strokeWidth={2.5} />
          <Text className="font-body-semibold text-sm text-accent-fg">New</Text>
        </TouchableOpacity>
      </MotiView>

      {/* Loading skeleton */}
      {isLoading && (
        <View className="px-5" style={{ gap: 12 }}>
          {[0, 1, 2].map(i => (
            <MotiView
              key={i}
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 300, delay: i * 80 }}
              className="bg-surface rounded-xl border border-border p-4"
              style={{ height: 76 }}
            >
              <Skeleton width="55%" height={14} />
              <Skeleton width="35%" height={10} style={{ marginTop: 8 }} />
            </MotiView>
          ))}
        </View>
      )}

      {/* Empty state */}
      {!isLoading && (!playlists || playlists.length === 0) && (
        <MotiView
          from={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 18, delay: 100 }}
          className="flex-1 items-center justify-center px-8"
        >
          <View className="w-20 h-20 rounded-3xl bg-accent-subtle items-center justify-center mb-5">
            <ListVideo size={32} color={colors.accent} strokeWidth={1.5} />
          </View>
          <Text className="font-heading text-xl text-text text-center">No playlists yet</Text>
          <Text className="font-body text-sm text-text-sub text-center mt-2 leading-relaxed">
            Create a playlist to organize your watchlist
          </Text>
          <TouchableOpacity
            onPress={() => setShowCreate(true)}
            activeOpacity={0.85}
            className="mt-6 flex-row items-center bg-accent rounded-xl px-6 py-3"
            style={{ gap: 8 }}
          >
            <Plus size={16} color={colors.accentFg} strokeWidth={2.5} />
            <Text className="font-body-semibold text-sm text-accent-fg">Create Playlist</Text>
          </TouchableOpacity>
        </MotiView>
      )}

      {/* Playlist list */}
      {!isLoading && playlists && playlists.length > 0 && (
        <FlashList
          data={playlists}
          keyExtractor={p => p.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item: playlist, index }) => (
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 320, delay: index * 70 }}
            >
              <PlaylistCard playlist={playlist} />
            </MotiView>
          )}
        />
      )}

      <CreatePlaylistModal visible={showCreate} onClose={() => setShowCreate(false)} />
    </SafeAreaView>
  );
}
