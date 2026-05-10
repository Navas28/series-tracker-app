import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'nativewind';

interface Props {
  visible: boolean;
  onHide: () => void;
  seriesName?: string;
  totalEpisodes?: number;
  totalSeasons?: number;
  totalMinutes?: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  angle: (i / 14) * 2 * Math.PI,
  distance: 100 + (i % 4) * 55,
  colorKey: (['accent', 'watched', 'rating', 'success'] as const)[i % 4],
  size: 5 + (i % 4) * 3,
  delay: 60 + i * 35,
}));

function formatWatchTime(totalMinutes: number): { main: string; sub: string } {
  if (!totalMinutes) return { main: '', sub: '' };
  const totalHours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const mStr = mins > 0 ? ` ${mins}m` : '';
  const rawHours = `${totalHours}h${mStr}`;
  if (totalHours < 24) return { main: rawHours, sub: '' };
  const days = Math.floor(totalHours / 24);
  const hrs = totalHours % 24;
  const hStr = hrs > 0 ? ` ${hrs}h` : '';
  return { main: `${days}d${hStr}${mStr}`, sub: rawHours };
}

export default function CompletionMilestone({
  visible,
  onHide,
  seriesName = 'this series',
  totalEpisodes = 0,
  totalSeasons = 0,
  totalMinutes = 0,
}: Props) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (visible) {
      setActive(true);
      const timer = setTimeout(() => { setActive(false); onHide(); }, 6000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!active) return null;

  const colorMap: Record<string, string> = {
    accent: colors.accent,
    watched: colors.watched,
    rating: colors.rating,
    success: colors.success,
  };

  const watchTime = formatWatchTime(totalMinutes);
  const stats = [
    totalSeasons > 0 ? { value: String(totalSeasons), label: totalSeasons === 1 ? 'Season' : 'Seasons' } : null,
    totalEpisodes > 0 ? { value: String(totalEpisodes), label: 'Episodes' } : null,
    watchTime.main ? { value: watchTime.main, label: 'Watch Time', sub: watchTime.sub } : null,
  ].filter(Boolean) as { value: string; label: string; sub?: string }[];

  return (
    <View
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        zIndex: 200,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(1,13,35,0.88)',
      }}
    >
      {/* Particles */}
      {PARTICLES.map((p, i) => (
        <MotiView
          key={i}
          from={{ translateX: 0, translateY: 0, opacity: 1, scale: 1 }}
          animate={{
            translateX: Math.cos(p.angle) * p.distance,
            translateY: Math.sin(p.angle) * p.distance,
            opacity: 0,
            scale: 0.2,
          }}
          transition={{ type: 'timing', duration: 1600, delay: p.delay }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: colorMap[p.colorKey],
          }}
        />
      ))}

      {/* Card */}
      <MotiView
        from={{ scale: 0.75, opacity: 0, translateY: 40 }}
        animate={{ scale: 1, opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 16, stiffness: 150 }}
        style={{
          width: SCREEN_WIDTH * 0.86,
          backgroundColor: colors.surfaceElevated,
          borderRadius: 32,
          paddingHorizontal: 24,
          paddingTop: 32,
          paddingBottom: 24,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.accent + '55',
          shadowColor: colors.accent,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 32,
          elevation: 24,
        }}
      >
        {/* Trophy ring */}
        <MotiView
          from={{ scale: 0.5, rotate: '-20deg' }}
          animate={{ scale: 1, rotate: '0deg' }}
          transition={{ type: 'spring', damping: 10, stiffness: 130, delay: 100 }}
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 22,
            borderWidth: 2,
            borderColor: colors.accent,
            backgroundColor: colors.accentSubtle,
          }}
        >
          <Text style={{ fontSize: 44 }}>🏆</Text>
        </MotiView>

        {/* Badge */}
        <MotiView
          from={{ opacity: 0, translateY: 6 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 360, delay: 280 }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: colors.accentSubtle,
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 99,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: colors.accent + '80',
          }}
        >
          <Text style={{ fontSize: 11 }}>✦</Text>
          <Text style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 11,
            color: colors.accent,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}>
            Series Completed
          </Text>
        </MotiView>

        {/* Series name */}
        <MotiText
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 380, delay: 320 }}
          numberOfLines={2}
          style={{
            fontFamily: 'Sora-Bold',
            fontSize: 26,
            color: colors.text,
            textAlign: 'center',
            lineHeight: 33,
            marginBottom: 6,
          }}
        >
          {seriesName}
        </MotiText>

        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 380, delay: 420 }}
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 13,
            color: colors.textSub,
            textAlign: 'center',
            lineHeight: 19,
            marginBottom: 24,
          }}
        >
          Every episode. Every season. Done.
        </MotiText>

        {/* Stats row */}
        {stats.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 380, delay: 500 }}
            style={{ flexDirection: 'row', gap: 10, width: '100%', marginBottom: 22 }}
          >
            {stats.map((s, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  paddingVertical: 14,
                  paddingHorizontal: 8,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'SpaceMono-Bold',
                    fontSize: s.value.length > 5 ? 16 : 22,
                    color: i === 0 ? colors.accent : i === 1 ? colors.watched : colors.success,
                    textAlign: 'center',
                  }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {s.value}
                </Text>
                {!!s.sub && (
                  <Text style={{
                    fontFamily: 'SpaceMono-Regular',
                    fontSize: 9,
                    color: colors.textMuted,
                    marginTop: 1,
                  }}>
                    {s.sub}
                  </Text>
                )}
                <Text style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 10,
                  color: colors.textMuted,
                  marginTop: 3,
                  textAlign: 'center',
                }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </MotiView>
        )}

        {/* Dismiss */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 300, delay: 660 }}
          style={{ width: '100%' }}
        >
          <TouchableOpacity
            onPress={() => { setActive(false); onHide(); }}
            activeOpacity={0.85}
            style={{
              backgroundColor: colors.accent,
              borderRadius: 16,
              paddingVertical: 15,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: colors.accentFg }}>
              That's a wrap! 🎬
            </Text>
          </TouchableOpacity>
        </MotiView>
      </MotiView>
    </View>
  );
}
