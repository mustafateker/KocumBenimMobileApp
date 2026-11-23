import { usePathname, useRouter } from 'expo-router';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { HamburgerMenu, type HamburgerMenuItem } from '@/components/hamburger-menu';
import { getExamTrack } from '@/lib/mock-exams';

import { useSession, useStudent } from './session';

type HamburgerMenuContextValue = { open: () => void };

const HamburgerMenuContext = createContext<HamburgerMenuContextValue | null>(null);

/**
 * Hamburger menuyu tek yerde monte eder ve her sekmeden ayni ornegi
 * tetiklemeyi saglar.
 */
export function HamburgerMenuProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const student = useStudent();
  const { signOut } = useSession();

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  const value = useMemo(() => ({ open }), [open]);

  const isLgs = useMemo(() => getExamTrack(student.grade) === 'lgs', [student.grade]);

  const mainItems: HamburgerMenuItem[] = useMemo(
    () => [
      {
        icon: 'book-outline',
        label: 'Derslerim',
        selected: pathname?.startsWith('/subjects'),
        onPress: () => router.push('/subjects'),
      },
      {
        icon: 'ribbon-outline',
        label: isLgs ? 'LGS Denemelerim' : 'YKS Denemelerim',
        selected: pathname?.startsWith('/mock-exams'),
        onPress: () => router.push('/mock-exams'),
      },
      {
        icon: 'notifications-outline',
        label: 'Bildirimler',
        selected: pathname?.startsWith('/notifications'),
        onPress: () => router.push('/notifications'),
      },
      {
        icon: 'stats-chart-outline',
        label: 'Raporlar & İstatistikler',
        selected: pathname?.startsWith('/stats'),
        onPress: () => router.push('/stats'),
      },
      {
        icon: 'calendar-outline',
        label: 'Özel Derslerim',
        selected: pathname?.startsWith('/lessons'),
        onPress: () => router.push('/lessons'),
      },
      {
        icon: 'settings-outline',
        label: 'Ayarlar',
        selected: pathname?.startsWith('/settings'),
        onPress: () => router.push('/settings'),
      },
    ],
    [pathname, router, isLgs]
  );

  const footerItems: HamburgerMenuItem[] = useMemo(
    () => [
      {
        icon: 'help-circle-outline',
        label: 'Yardım & Destek',
        selected: pathname?.startsWith('/help'),
        onPress: () => router.push('/help'),
      },
      {
        icon: 'log-out-outline',
        label: 'Çıkış Yap',
        onPress: () => {
          signOut().then(() => router.replace('/login'));
        },
      },
    ],
    [pathname, router, signOut]
  );

  return (
    <HamburgerMenuContext.Provider value={value}>
      {children}
      <HamburgerMenu
        visible={visible}
        onClose={close}
        title={student.nickname ?? student.name}
        subtitle="Menü"
        items={mainItems}
        footerItems={footerItems}
      />
    </HamburgerMenuContext.Provider>
  );
}

export function useHamburgerMenu(): HamburgerMenuContextValue {
  const ctx = useContext(HamburgerMenuContext);
  if (!ctx) throw new Error('useHamburgerMenu, HamburgerMenuProvider icinde kullanilmali');
  return ctx;
}
