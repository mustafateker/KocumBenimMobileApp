import { useRouter } from 'expo-router';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { HamburgerMenu } from '@/components/hamburger-menu';
import { Palette } from '@/theme/tokens';

import { useSession, useStudent } from './session';

type HamburgerMenuContextValue = { open: () => void };

const HamburgerMenuContext = createContext<HamburgerMenuContextValue | null>(null);

/**
 * Hamburger menuyu tek yerde monte eder ve her sekmeden ayni ornegi
 * tetiklemeyi saglar — boylece Ayarlar/Bildirimler/Istatistikler/Cikis
 * listesi tek yerde tanimli kalir.
 */
export function HamburgerMenuProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const student = useStudent();
  const { signOut } = useSession();

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <HamburgerMenuContext.Provider value={value}>
      {children}
      <HamburgerMenu
        visible={visible}
        onClose={close}
        title={student.nickname ?? student.name}
        subtitle="Menü"
        items={[
          {
            icon: 'notifications-outline',
            label: 'Bildirimler',
            color: Palette.gold,
            onPress: () => router.push('/notifications'),
          },
          {
            icon: 'stats-chart-outline',
            label: 'İstatistikler',
            color: Palette.blue,
            onPress: () => router.push('/stats'),
          },
          {
            icon: 'calendar-outline',
            label: 'Özel Derslerim',
            color: Palette.purple,
            onPress: () => router.push('/lessons'),
          },
          {
            icon: 'settings-outline',
            label: 'Ayarlar',
            color: Palette.textDim,
            onPress: () => router.push('/settings'),
          },
          {
            icon: 'help-circle-outline',
            label: 'Yardım & Destek',
            color: Palette.green,
            onPress: () => router.push('/help'),
          },
          {
            icon: 'log-out-outline',
            label: 'Çıkış Yap',
            color: Palette.pink,
            onPress: () => {
              signOut().then(() => router.replace('/login'));
            },
          },
        ]}
      />
    </HamburgerMenuContext.Provider>
  );
}

export function useHamburgerMenu(): HamburgerMenuContextValue {
  const ctx = useContext(HamburgerMenuContext);
  if (!ctx) throw new Error('useHamburgerMenu, HamburgerMenuProvider icinde kullanilmali');
  return ctx;
}
