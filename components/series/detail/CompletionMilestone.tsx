import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { Trophy, Star, Flame, Sparkles } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'nativewind';

interface Props {
  visible: boolean;
  onHide: () => void;
  seriesName?: string;
  totalEpisodes?: number;
  totalSeasons?: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/* Particle burst positions — pre-computed so each render is stable */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  angle: (i / 18) * 2 * Math.PI,
  distance: 120 + (i % 3) * 60,
  color: i % 3 === 0 ? 'accent' : i % 3 === 1 ? 'watched' : 'rating',
  size: 6 + (i % 3) * 3,
  delay: 80 + i * 30,
}));

export default function CompletionMilestone({
  visible,
  onHide,
  seriesName = 'this series',
  totalEpisodes = 0,
  totalSeasons = 0,
}: Props) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (visible) {
      setActive(true);
      const timer = setTimeout(() => {
        setActive(false);
        onHide();
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!active) return null;

  const colorMap: Record<string, string> = {
    accent:  colors.accent,
    watched: colors.watched,
    rating:  colors.rating,
  };

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
        backgroundColor: 'rgba(0,0,0,0.72)',
      }}
    >
      {/* ── Particle burst ───────────────────────────────── */}
      {PARTICLES.map((p, i) => (
        <MotiView
          key={i}
          from={{ translateX: 0, translateY: 0, opacity: 1, scale: 1 }}
          animate={{
            translateX: Math.cos(p.angle) * p.distance,
            translateY: Math.sin(p.angle) * p.distance,
            opacity: 0,
            scale: 0.3,
          }}
          transition={{ type: 'timing', duration: 1400, delay: p.delay }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: colorMap[p.color],
          }}
        />
      ))}

      {/* ── Card ─────────────────────────────────────────── */}
      <MotiView
        from={{ scale: 0.6, opacity: 0, translateY: 32 }}
        animate={{ scale: 1, opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 14, stiffness: 140 }}
        style={{
          width: SCREEN_WIDTH * 0.84,
          backgroundColor: colors.surface,
          borderRadius: 28,
          padding: 28,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.4,
          shadowRadius: 28,
          elevation: 20,
        }}
      >
        {/* Trophy icon with wobble */}
        <MotiView
          from={{ rotate: '-15deg', scale: 0.8 }}
          animate={{ rotate: ['15deg', '-10deg', '8deg', '0deg'], scale: 1 }}
          transition={{ type: 'spring', damping: 8, stiffness: 120, delay: 200 }}
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: colors.accentSubtle,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            borderWidth: 2,
            borderColor: colors.accent,
          }}
        >
          <Trophy size={44} color={colors.accent} strokeWidth={2} />
        </MotiView>

        {/* Badge */}
        <MotiView
          from={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 350 }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: colors.accentSubtle,
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 99,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.accent,
          }}
        >
          <Flame size={13} color={colors.accent} strokeWidth={2} />
          <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 11, color: colors.accent, letterSpacing: 1, textTransform: 'uppercase' }}>
            Series Completed
          </Text>
        </MotiView>

        {/* Series name */}
        <MotiText
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 280 }}
          style={{
            fontFamily: 'Sora-Bold',
            fontSize: 24,
            color: colors.text,
            textAlign: 'center',
            lineHeight: 30,
            marginBottom: 8,
          }}
          numberOfLines={2}
        >
          {seriesName}
        </MotiText>

        {/* Motivational tagline */}
        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 450 }}
          style={{
            fontFamily: 'Inter-Regular',
            fontSize: 14,
            color: colors.textSub,
            textAlign: 'center',
            lineHeight: 20,
            marginBottom: 20,
          }}
        >
          You made it through every episode.{'\n'}What a journey! 🎉
        </MotiText>

        {/* Stats row */}
        {(totalEpisodes > 0 || totalSeasons > 0) && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 380, delay: 550 }}
            style={{
              flexDirection: 'row',
              gap: 12,
              marginBottom: 22,
              width: '100%',
            }}
          >
            {totalSeasons > 0 && (
              <View style={{
                flex: 1,
                backgroundColor: colors.surfaceElevated,
                borderRadius: 14,
                padding: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}>
                <Text style={{ fontFamily: 'SpaceMono-Bold', fontSize: 22, color: colors.accent }}>
                  {totalSeasons}
                </Text>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                  {totalSeasons === 1 ? 'Season' : 'Seasons'}
                </Text>
              </View>
            )}
            {totalEpisodes > 0 && (
              <View style={{
                flex: 1,
                backgroundColor: colors.surfaceElevated,
                borderRadius: 14,
                padding: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}>
                <Text style={{ fontFamily: 'SpaceMono-Bold', fontSize: 22, color: colors.watched }}>
                  {totalEpisodes}
                </Text>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                  Episodes
                </Text>
              </View>
            )}
          </MotiView>
        )}

        {/* Dismiss button */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 300, delay: 700 }}
          style={{ width: '100%' }}
        >
          <TouchableOpacity
            onPress={() => { setActive(false); onHide(); }}
            activeOpacity={0.85}
            style={{
              backgroundColor: colors.accent,
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: colors.accentFg }}>
              Awesome! 🏆
            </Text>
          </TouchableOpacity>
        </MotiView>
      </MotiView>
    </View>
  );
}
