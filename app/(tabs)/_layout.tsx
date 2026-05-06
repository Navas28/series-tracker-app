import { Tabs } from 'expo-router';
import { AnimatedTabBar } from '@/components/ui/AnimatedTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Tell the navigator the height so scroll views get correct bottom insets
        tabBarStyle: { height: 96 },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="playlists" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
