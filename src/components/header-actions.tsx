import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { IconButton } from './button';
import { Txt } from './ui';

import { useHamburgerMenu } from '@/lib/hamburger-menu-context';
import { useNotificationCenter } from '@/lib/notification-center';
import { OnColor, Palette } from '@/theme/tokens';

/**
 * Ogrenci ekranlarinin ortak baslik aksiyonlari: menu solda, bildirim sagda.
 * Ikisi de tek yerde tanimli ki her sekmede ayni yerde ve ayni davranista olsun.
 */

export function MenuButton() {
  const { open } = useHamburgerMenu();
  return <IconButton icon="menu" onPress={open} />;
}

/** Okunmamis bildirim varsa sayaci rozet olarak gosterir. */
export function NotificationBell() {
  const router = useRouter();
  const { unread, refresh } = useNotificationCenter();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <View>
      <IconButton
        icon={unread > 0 ? 'notifications' : 'notifications-outline'}
        color={unread > 0 ? Palette.gold : Palette.textDim}
        onPress={() => router.push('/notifications')}
      />
      {unread > 0 ? (
        <View style={styles.badge} pointerEvents="none">
          <Txt variant="tiny" color={OnColor}>
            {unread > 9 ? '9+' : String(unread)}
          </Txt>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    // Kose yaricapi yuksekligin yarisi: Android'de arka planli bir yuzeye
    // boyutundan buyuk bir yaricap verilirse koseler duz cizilir.
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.pink,
    borderWidth: 2,
    borderColor: Palette.bg,
  },
});
