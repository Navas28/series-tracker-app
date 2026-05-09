import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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

  const { data: playlists, isLoading } = usePlaylists();

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

      {isLoading && (
        <View className="px-5" style={{ gap: 12 }}>
          {[0, 1, 2].map(i => (
            <View
              key={i}
              className="bg-surface rounded-xl border border-border p-4"
              style={{ height: 76 }}
            >
              <Skeleton width="55%" height={14} />
              <Skeleton width="35%" height={10} style={{ marginTop: 8 }} />
            </View>
          ))}
        </View>
      )}

      {!isLoading && (!playlists || playlists.length === 0) && (
        <View className="flex-1 items-center justify-center px-8">
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
      )}

      {!isLoading && playlists && playlists.length > 0 && (
        <FlashList
          data={playlists}
          keyExtractor={p => p.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item: playlist }) => <PlaylistCard playlist={playlist} />}
        />
      )}

      <CreatePlaylistModal visible={showCreate} onClose={() => setShowCreate(false)} />
    </SafeAreaView>
  );
}
