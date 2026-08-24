import { Redirect, Tabs } from 'expo-router';

import { TabBar, type TabBarState, type TabMeta } from '@/components/tab-bar';
import { useSession } from '@/lib/session';
import { Palette } from '@/theme/tokens';

const TABS: Record<string, TabMeta> = {
  index: { label: 'Anasayfa', icon: 'home', color: Palette.purple },
  questions: { label: 'Sorular', icon: 'camera', color: Palette.orange },
  games: { label: 'Oyun', icon: 'game-controller', color: Palette.green },
  profile: { label: 'Profil', icon: 'person', color: Palette.blue },
};

export default function StudentLayout() {
  const { user, loading } = useSession();

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;
  if (user.role !== 'student') return <Redirect href="/" />;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...(props as unknown as TabBarState)} tabs={TABS} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="questions" />
      <Tabs.Screen name="games" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
