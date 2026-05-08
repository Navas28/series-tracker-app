import { View, Text, ScrollView } from 'react-native';
import { MessageSquare, ThumbsUp, AlertTriangle } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';
import { useTraktComments } from '@/hooks/useTrakt';

interface Props {
  traktId: number | null;
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

export default function SeriesReviews({ traktId }: Props) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { data: comments, isLoading } = useTraktComments(traktId);

  if (!traktId || (!isLoading && (!comments || comments.length === 0))) return null;

  return (
    <View className="mb-7">
      <View className="flex-row items-center px-5 mb-3" style={{ gap: 8 }}>
        <Text className="font-heading text-base text-text">Reviews</Text>
        <View className="bg-accent-subtle rounded-full px-2 py-0.5">
          <Text className="font-mono text-2xs text-accent">Trakt</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <View
                key={i}
                className="bg-surface border border-border rounded-xl p-4"
                style={{ width: 260, height: 130 }}
              />
            ))
          : comments?.map(comment => (
              <View
                key={comment.id}
                className="bg-surface border border-border rounded-xl p-4"
                style={{ width: 260 }}
              >
                {comment.spoiler && (
                  <View className="flex-row items-center mb-2" style={{ gap: 4 }}>
                    <AlertTriangle size={11} color={colors.accent} />
                    <Text className="font-body text-[10px] text-accent uppercase">Spoiler</Text>
                  </View>
                )}

                <Text
                  className="font-body text-xs text-text-sub leading-4"
                  numberOfLines={4}
                >
                  {comment.comment}
                </Text>

                <View className="flex-row items-center justify-between mt-3">
                  <Text className="font-body-medium text-2xs text-text" numberOfLines={1}>
                    {comment.username}
                    {comment.userRating ? (
                      <Text className="font-mono text-rating">  ★ {comment.userRating}</Text>
                    ) : null}
                  </Text>
                  <View className="flex-row items-center" style={{ gap: 8 }}>
                    {comment.likes > 0 && (
                      <View className="flex-row items-center" style={{ gap: 3 }}>
                        <ThumbsUp size={10} color={colors.textMuted} />
                        <Text className="font-mono text-[10px] text-text-muted">{comment.likes}</Text>
                      </View>
                    )}
                    <Text className="font-body text-2xs text-text-muted">
                      {timeAgo(comment.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
      </ScrollView>
    </View>
  );
}
