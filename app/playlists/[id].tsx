import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { usePlaylists, useDeletePlaylist, useRemoveFromPlaylist } from '@/hooks/usePlaylists';
import SeriesCard from '@/components/series/SeriesCard';
import type { SeriesListItem } from '@/services/tmdb/types';

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { data: playlists, isLoading } = usePlaylists();
  const { mutate: deletePlaylist } = useDeletePlaylist();
  const { mutate: removeFromPlaylist } = useRemoveFromPlaylist();

  const playlist = playlists?.find(p => p.id === id);

  const handleDelete = () => {
    Alert.alert('Delete Playlist', `Delete "${playlist?.name}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deletePlaylist(id, { onSuccess: () => router.back() });
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-row items-center justify-between px-5 py-3">
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={22} color={colors.text} strokeWidth={1.75} />
          </TouchableOpacity>
          <Text className="font-heading text-base text-text flex-1 text-center mx-4" numberOfLines={1}>
            {playlist?.name ?? ''}
          </Text>
          <TouchableOpacity onPress={handleDelete} hitSlop={8}>
            <Trash2 size={20} color={colors.error} strokeWidth={1.75} />
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.accent} />
          </View>
        )}

        {!isLoading && playlist && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 12, flexDirection: 'row', flexWrap: 'wrap' }}
          >
            {playlist.series.length === 0 && (
              <View className="flex-1 items-center pt-16">
                <Text className="font-body text-sm text-text-sub text-center">
                  No series in this playlist yet.{'\n'}Add some from a series detail page.
                </Text>
              </View>
            )}
            {playlist.series.map(s => {
              const fakeItem: SeriesListItem = {
                id: s.seriesId,
                name: s.name,
                original_name: s.name,
                overview: '',
                poster_path: s.posterPath,
                backdrop_path: null,
                first_air_date: '',
                genre_ids: [],
                origin_country: [],
                original_language: '',
                popularity: 0,
                vote_average: 0,
                vote_count: 0,
              };
              return <SeriesCard key={s.seriesId} item={fakeItem} width={110} />;
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}
