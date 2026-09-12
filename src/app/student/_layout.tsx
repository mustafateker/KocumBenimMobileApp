import { Redirect, Tabs } from 'expo-router';

import { TabBar, type TabBarState, type TabMeta } from '@/components/tab-bar';
import { HamburgerMenuProvider } from '@/lib/hamburger-menu-context';
import { useSession } from '@/lib/session';
import { Accent, Palette } from '@/theme/tokens';

const TABS: Record<string, TabMeta> = {
  index: { label: 'Ana Sayfa', icon: 'home', color: Accent },
  tasks: { label: 'Görevlerim', icon: 'checkmark-done', color: Palette.green },
  questions: { label: 'Sorularım', icon: 'camera', color: Palette.orange },
  profile: { label: 'Profil', icon: 'person', color: Palette.blue },
};

export default function StudentLayout() {
  const { user, loading } = useSession();

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;
  if (user.role !== 'student') return <Redirect href="/" />;
  if (!user.onboardingCompletedAt) return <Redirect href="/onboarding" />;

  return (
    <HamburgerMenuProvider>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <TabBar {...(props as unknown as TabBarState)} tabs={TABS} />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="tasks" />
        <Tabs.Screen name="questions" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </HamburgerMenuProvider>
  );
}
