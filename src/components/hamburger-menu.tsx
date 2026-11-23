import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressScale } from './button';
import { Txt } from './ui';

import { Accent, Border, Elevation, Motion, OnColor, Palette, Radius, Space } from '@/theme/tokens';

export type HamburgerMenuItem = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  selected?: boolean;
  color?: string;
  onPress: () => void;
};

/**
 * Soldan acilan menu paneli. Tetikleyici hamburger dugmesi tum ogrenci
 * ekranlarinda sol ustte durdugu icin panel de ayni kenardan giriyor.
 */
export function HamburgerMenu({
  visible,
  onClose,
  title,
  subtitle,
  items,
  footerItems,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  items: HamburgerMenuItem[];
  footerItems?: HamburgerMenuItem[];
}) {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const [mounted, setMounted] = useState(visible);

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
    transform: [{ translateX: -(1 - progress.value) * PANEL_WIDTH }],
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
            {
              paddingTop: insets.top + Space.md,
              paddingBottom: Math.max(insets.bottom, Space.md) + Space.xs,
            },
          ]}
        >
          {/* Baslik ve Kapatma */}
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

          {/* Ana Menü Öğeleri */}
          <ScrollView
            style={styles.mainScroll}
            contentContainerStyle={styles.mainScrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {items.map((item, index) => {
              const isSelected = !!item.selected;
              return (
                <View key={item.label}>
                  <PressScale
                    onPress={() => {
                      onClose();
                      item.onPress();
                    }}
                  >
                    <View style={[styles.row, isSelected && styles.rowSelected]}>
                      <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}>
                        <Ionicons
                          name={item.icon}
                          size={19}
                          color={isSelected ? OnColor : item.color ?? Palette.textDim}
                        />
                      </View>
                      <Txt
                        variant={isSelected ? 'bodyStrong' : 'body'}
                        color={isSelected ? Accent : item.color ?? Palette.text}
                        style={styles.flex}
                      >
                        {item.label}
                      </Txt>
                      <Ionicons
                        name="chevron-forward"
                        size={15}
                        color={isSelected ? Accent : Palette.textFaint}
                      />
                    </View>
                  </PressScale>
                  {index < items.length - 1 && <View style={styles.divider} />}
                </View>
              );
            })}
          </ScrollView>

          {/* Alt Sabit Kısım: Yardım ve Destek + Çıkış Yap */}
          {footerItems && footerItems.length > 0 && (
            <View style={styles.footer}>
              <View style={styles.fullDivider} />
              {footerItems.map((item, index) => {
                const isSelected = !!item.selected;
                return (
                  <View key={item.label}>
                    {index > 0 && <View style={styles.fullDivider} />}
                    <PressScale
                      onPress={() => {
                        onClose();
                        item.onPress();
                      }}
                    >
                      <View style={[styles.row, isSelected && styles.rowSelected]}>
                        <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}>
                          <Ionicons
                            name={item.icon}
                            size={19}
                            color={isSelected ? OnColor : item.color ?? Palette.textDim}
                          />
                        </View>
                        <Txt
                          variant={isSelected ? 'bodyStrong' : 'body'}
                          color={isSelected ? Accent : item.color ?? Palette.text}
                          style={styles.flex}
                        >
                          {item.label}
                        </Txt>
                        <Ionicons
                          name="chevron-forward"
                          size={15}
                          color={isSelected ? Accent : Palette.textFaint}
                        />
                      </View>
                    </PressScale>
                  </View>
                );
              })}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

/** Panel genisligi — kapanis animasyonunun kaydirma mesafesiyle ayni olmali. */
const PANEL_WIDTH = 300;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
    width: PANEL_WIDTH,
    maxWidth: '82%',
    backgroundColor: Palette.surface,
    borderTopRightRadius: Radius.sheet,
    borderBottomRightRadius: Radius.sheet,
    paddingHorizontal: Space.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingBottom: Space.md,
    borderBottomWidth: Border.thin,
    borderBottomColor: Palette.border,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surfaceHi,
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    paddingVertical: Space.xs,
  },
  footer: {
    paddingTop: Space.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
    marginHorizontal: Space.xs,
  },
  fullDivider: {
    height: 1,
    backgroundColor: Palette.border,
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: 10,
    paddingHorizontal: Space.sm,
    borderRadius: Radius.md,
  },
  rowSelected: {
    backgroundColor: 'rgba(58, 57, 103, 0.05)',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surfaceHi,
  },
  iconWrapSelected: {
    backgroundColor: Accent,
  },
});
