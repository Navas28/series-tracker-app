import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { Trophy, PartyPopper } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'nativewind';

interface Props {
  visible: boolean;
  onHide: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CompletionMilestone({ visible, onHide }: Props) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (visible) {
      setActive(true);
      const timer = setTimeout(() => {
        setActive(false);
        onHide();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!active) return null;

  return (
    <View 
      className="absolute inset-0 z-[100] items-center justify-center bg-black/60"
      style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
    >
      <MotiView
        from={{ scale: 0, opacity: 0, translateY: 20 }}
        animate={{ scale: 1, opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 12 }}
        className="bg-surface rounded-3xl p-8 items-center border border-border shadow-2xl"
        style={{ width: SCREEN_WIDTH * 0.8 }}
      >
        <MotiView
          from={{ rotate: '0deg' }}
          animate={{ rotate: ['-10deg', '10deg', '-10deg', '0deg'] }}
          transition={{ loop: true, duration: 500 }}
          className="w-20 h-20 rounded-full bg-watched-subtle items-center justify-center mb-5"
        >
          <Trophy size={40} color={colors.watched} strokeWidth={2.5} />
        </MotiView>

        <MotiText
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 200 }}
          className="font-display text-2xl text-text text-center"
        >
          Series Completed!
        </MotiText>
        
        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 400 }}
          className="font-body text-sm text-text-sub text-center mt-2"
        >
          You've watched every episode. What a journey!
        </MotiText>

        <View className="flex-row mt-6" style={{ gap: 8 }}>
          <PartyPopper size={20} color={colors.accent} />
          <Text className="font-body-bold text-sm text-accent">MILESTONE UNLOCKED</Text>
        </View>
      </MotiView>
      
      {/* Background Particles (Simplified) */}
      {[...Array(12)].map((_, i) => (
        <MotiView
          key={i}
          from={{ 
            translateX: 0, 
            translateY: 0, 
            opacity: 1,
            scale: 1 
          }}
          animate={{ 
            translateX: (Math.random() - 0.5) * 400, 
            translateY: (Math.random() - 0.5) * 600,
            opacity: 0,
            scale: 0.5
          }}
          transition={{ duration: 2000, delay: 100, type: 'timing' }}
          className="absolute w-3 h-3 rounded-full bg-accent"
          style={{ 
            left: SCREEN_WIDTH / 2, 
            top: SCREEN_HEIGHT / 2,
            backgroundColor: i % 2 === 0 ? colors.accent : colors.watched
          }}
        />
      ))}
    </View>
  );
}
