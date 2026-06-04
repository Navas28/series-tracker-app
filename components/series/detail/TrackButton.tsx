import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BookmarkPlus, BookmarkCheck, ListPlus } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { useSeriesTracking, useAddTracking, useRemoveTracking } from '@/hooks/useTracking';
import AddToPlaylistModal from '@/components/playlists/AddToPlaylistModal';
import type { ShowDetails } from '@/services/api/types';

interface Props {
  series: ShowDetails;
}

export default function TrackButton({ series }: Props) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showPlaylists, setShowPlaylists] = useState(false);

  const { data: tracking } = useSeriesTracking(series.id);
  const { mutate: addTracking, isPending: adding } = useAddTracking();
  const { mutate: removeTracking, isPending: removing } = useRemoveTracking();

  const isTracked = !!tracking;
  const isPending = adding || removing;

  const handleTrack = () => {
    if (isTracked) {
      removeTracking(series.id);
    } else {
      addTracking(series.id);
    }
  };

  return (
    <>
      <View className="flex-row px-5 pb-6 mt-1" style={{ gap: 10 }}>
        <TouchableOpacity
          onPress={handleTrack}
          disabled={isPending}
          activeOpacity={0.8}
          className={`flex-1 flex-row items-center justify-center rounded-xl py-3.5 ${
            isTracked ? 'bg-watched-subtle border border-watched' : 'bg-accent'
          }`}
          style={{ gap: 7 }}
        >
          {isPending ? (
            <ActivityIndicator size="small" color={isTracked ? colors.watched : colors.accentFg} />
          ) : isTracked ? (
            <BookmarkCheck size={18} color={colors.watched} strokeWidth={2} />
          ) : (
            <BookmarkPlus size={18} color={colors.accentFg} strokeWidth={2} />
          )}
          <Text
            className={`font-body-semibold text-sm ${isTracked ? 'text-watched' : 'text-accent-fg'}`}
          >
            {isTracked ? 'Tracking' : 'Track Series'}
          </Text>
        </TouchableOpacity>

        {isTracked && (
          <TouchableOpacity
            onPress={() => setShowPlaylists(true)}
            activeOpacity={0.8}
            className="w-12 items-center justify-center rounded-xl border border-border bg-surface"
          >
            <ListPlus size={20} color={colors.textSub} strokeWidth={1.75} />
          </TouchableOpacity>
        )}
      </View>

      <AddToPlaylistModal
        visible={showPlaylists}
        onClose={() => setShowPlaylists(false)}
        series={{ tvdbId: series.id, name: series.name, posterUrl: series.poster_path }}
      />
    </>
  );
}
