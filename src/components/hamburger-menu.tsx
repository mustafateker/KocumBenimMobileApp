import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressScale } from './button';
import { IconBubble, Txt } from './ui';

import { Elevation, Motion, Palette, Radius, Space } from '@/theme/tokens';

export type HamburgerMenuItem = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  /** Belirtilmezse notr metin/ikon rengi kullanilir — cikis gibi tek vurgu haric. */
  color?: string;
  onPress: () => void;
};

/**
 * Sagdan acilan menu paneli. Profil ekranindaki hamburger tetikleyicisi
 * Ayarlar ve Cikis Yap gibi sayfaya ozgu olmayan aksiyonlari burada toplar.
 */
export function HamburgerMenu({
  visible,
  onClose,
  title,
  subtitle,
  items,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  items: HamburgerMenuItem[];
}) {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const [mounted, setMounted] = useState(visible);

  // Kapaniş animasyonu bitene kadar Modal'i takili tutmak icin: acilirken
  // hemen (render sirasinda) takili isaretlenir, kapanirken efekt geri
  // cagirmasi (runOnJS) animasyon bitince sokup cikarir.
  if (visible && !mounted) {
    setMounted(true);
  }

  useEffect(() => {
    if (visible) {
      progress.value = withTiming(1, { duration: Motion.duration.moderate });
      return;
    }
    progress.value = withTiming(0, { duration: Motion.duration.base }, (finished) => {
      if (finished) runOnJS(setMounted)(false);
    });
  }, [visible, progress]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - progress.value) * 300 }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value * 0.45 }));

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.panel,
            Elevation.xl,
            panelStyle,
            { paddingTop: insets.top + Space.lg, paddingBottom: insets.bottom + Space.lg },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.flex}>
              {title ? <Txt variant="section">{title}</Txt> : null}
              {subtitle ? (
                <Txt variant="tiny" color={Palette.textFaint}>
                  {subtitle}
                </Txt>
              ) : null}
            </View>
            <PressScale onPress={onClose} scaleTo={0.88}>
              <View style={styles.closeButton}>
                <Ionicons name="close" size={18} color={Palette.textDim} />
              </View>
            </PressScale>
          </View>

          <View style={styles.items}>
            {items.map((item) => (
              <PressScale
                key={item.label}
                onPress={() => {
                  onClose();
                  item.onPress();
                }}
              >
                <View style={styles.row}>
                  <IconBubble name={item.icon} color={item.color ?? Palette.textDim} size={38} />
                  <Txt variant="bodyStrong" color={item.color ?? Palette.text} style={styles.flex}>
                    {item.label}
                  </Txt>
                  <Ionicons name="chevron-forward" size={16} color={Palette.textFaint} />
                </View>
              </PressScale>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Palette.overlay,
  },
  panel: {
    width: 300,
    maxWidth: '82%',
    backgroundColor: Palette.surface,
    borderTopLeftRadius: Radius.xl,
    borderBottomLeftRadius: Radius.xl,
    paddingHorizontal: Space.lg,
    gap: Space.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.md,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surfaceHi,
  },
  items: {
    gap: Space.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: Space.md,
  },
});
