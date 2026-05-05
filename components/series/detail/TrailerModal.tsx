import React, { useState, useCallback } from 'react';
import { View, Modal, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  videoKey: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PLAYER_HEIGHT = Math.round(SCREEN_WIDTH * 0.5625); // 16:9 aspect ratio

export default function TrailerModal({ visible, onClose, videoKey }: Props) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [playing, setPlaying] = useState(true);

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/95 items-center justify-center">
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.7}
          className="absolute top-14 right-5 w-10 h-10 rounded-full bg-white/10 items-center justify-center z-10"
        >
          <X size={24} color="#fff" strokeWidth={2} />
        </TouchableOpacity>

        <View style={{ width: SCREEN_WIDTH, height: PLAYER_HEIGHT }}>
          <YoutubePlayer
            height={PLAYER_HEIGHT}
            play={playing}
            videoId={videoKey}
            onChangeState={onStateChange}
            initialPlayerParams={{
              modestbranding: true,
              rel: false,
              iv_load_policy: 3,
              cc_load_policy: 0,
            }}
          />
        </View>
      </View>
    </Modal>
  );
}
