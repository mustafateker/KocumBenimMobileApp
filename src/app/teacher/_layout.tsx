import { Redirect, Tabs } from 'expo-router';

import { TabBar, type TabBarState, type TabMeta } from '@/components/tab-bar';
import { useSession } from '@/lib/session';
import { Palette } from '@/theme/tokens';

const TABS: Record<string, TabMeta> = {
  index: { label: 'Öğrenciler', icon: 'people', color: Palette.purple },
  inbox: { label: 'Gelen Kutusu', icon: 'mail', color: Palette.orange },
  planner: { label: 'Program', icon: 'calendar', color: Palette.blue },
};

export default function TeacherLayout() {
  const { user, loading } = useSession();

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;
  if (user.role !== 'teacher') return <Redirect href="/" />;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...(props as unknown as TabBarState)} tabs={TABS} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="inbox" />
      <Tabs.Screen name="planner" />
      {/* Ogrenci detayi sekme cubugunda gorunmez, listeden acilir. */}
      <Tabs.Screen name="student/[id]" options={{ href: null }} />
    </Tabs>
  );
}
