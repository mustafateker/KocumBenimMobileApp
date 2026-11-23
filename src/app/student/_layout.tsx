import { Redirect, Tabs } from 'expo-router';

import { AppErrorBoundary } from '@/components/app-error-boundary';
import { PlayReviewPrompt } from '@/components/play-review-prompt';
import { RaccoonIcon } from '@/components/raccoon-icon';
import { TabBar, type TabBarState, type TabMeta } from '@/components/tab-bar';
import { HamburgerMenuProvider } from '@/lib/hamburger-menu-context';
import { useNotificationRouting } from '@/lib/push-notifications';
import { useSession } from '@/lib/session';

const TABS: Record<string, TabMeta> = {
  index: { label: 'Anasayfa', icon: 'home' },
  tasks: { label: 'Ödevlerim', icon: 'checkmark-done' },
  'ai-coach': {
    label: 'Koçum',
    icon: 'sparkles',
    featured: true,
    customIcon: () => (
      <RaccoonIcon fill />
    ),
  },
  questions: { label: 'Sorularım', icon: 'camera' },
  profile: { label: 'Profil', icon: 'person' },
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
        <Tabs.Screen name="ai-coach" />
        <Tabs.Screen name="questions" />
        <Tabs.Screen name="profile" />
      </Tabs>
      <PlayReviewPrompt />
    </HamburgerMenuProvider>
  );
}
