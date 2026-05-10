import { useState } from 'react';
import { View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, ListVideo } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { usePlaylists } from '@/hooks/usePlaylists';
import CreatePlaylistModal from '@/components/playlists/CreatePlaylistModal';
import PlaylistCard from '@/components/playlists/PlaylistCard';
import { Skeleton } from '@/components/ui/Skeleton';

const colors = Colors.dark;

export default function PlaylistsScreen() {
  const [showCreate, setShowCreate] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: playlists, isLoading, refetch } = usePlaylists();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>

      <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
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
      </View>

      <FlashList
        data={(!isLoading && playlists) ? playlists : []}
        keyExtractor={p => p.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        ListHeaderComponent={isLoading ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 12 }}>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={{ width: '48%', marginBottom: 16 }}>
                <View style={{ aspectRatio: 1, width: '100%', marginBottom: 8, backgroundColor: colors.surfaceElevated, opacity: 0.55, borderRadius: 12 }} />
                <Skeleton width="70%" height={14} />
                <Skeleton width="40%" height={10} style={{ marginTop: 4 }} />
              </View>
            ))}
          </View>
        ) : null}
        ListEmptyComponent={!isLoading ? (
          <View className="flex-1 items-center justify-center px-8" style={{ paddingTop: 80 }}>
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
          </View>
        ) : null}
        numColumns={2}
        renderItem={({ item: playlist, index }) => (
          <View style={{ flex: 1, paddingLeft: index % 2 === 1 ? 6 : 0, paddingRight: index % 2 === 0 ? 6 : 0 }}>
            <PlaylistCard playlist={playlist} />
          </View>
        )}
      />

      <CreatePlaylistModal visible={showCreate} onClose={() => setShowCreate(false)} />
    </SafeAreaView>
  );
}
