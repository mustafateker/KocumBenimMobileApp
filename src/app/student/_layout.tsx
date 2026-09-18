import { Redirect, Tabs } from 'expo-router';

import { AppErrorBoundary } from '@/components/app-error-boundary';
import { TabBar, type TabBarState, type TabMeta } from '@/components/tab-bar';
import { HamburgerMenuProvider } from '@/lib/hamburger-menu-context';
import { useNotificationRouting } from '@/lib/push-notifications';
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

  return <StudentTabs />;
}

/**
 * Oturum dogrulandiktan sonra monte olur. Bildirime dokunuldugunda yapilan
 * yonlendirme burada dinlenir — hedef ekranlar (Gorevlerim, Sorularim) ancak
 * bu agacin altinda var.
 */
function StudentTabs() {
  useNotificationRouting();

  return (
    <HamburgerMenuProvider>
      <Tabs
        unstable_screenErrorBoundary={AppErrorBoundary}
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
