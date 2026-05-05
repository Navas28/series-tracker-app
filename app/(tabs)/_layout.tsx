import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Home, Search, Bookmark, User } from 'lucide-react-native';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const screenOptions = {
    tabBarActiveTintColor: colors.accent,
    tabBarInactiveTintColor: colors.textMuted,
    headerShown: false,
    tabBarButton: HapticTab,
    tabBarStyle: {
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      borderTopWidth: 1,
    },
    tabBarLabelStyle: {
      fontFamily: 'Inter-Medium',
      fontSize: 11,
    },
  };

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Search size={24} color={color} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'My Series',
          tabBarIcon: ({ color }) => <Bookmark size={24} color={color} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} strokeWidth={1.75} />,
        }}
      />
    </Tabs>
  );
}
