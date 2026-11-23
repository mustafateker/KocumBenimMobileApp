import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ComponentProps, ReactNode } from 'react';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Accent, Border, DetailAccent, Palette, Radius, Space } from '@/theme/tokens';

import { Txt } from './ui';

export type TabMeta = {
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  featured?: boolean;
  customIcon?: (focused: boolean) => ReactNode;
};

/**
 * Ozel tab cubugunun ihtiyaci olan en kucuk sozlesme.
 *
 * @react-navigation/bottom-tabs ayri bir bagimlilik olarak kurulu degil
 * (expo-router onu kendi icinde tasiyor). Kutuphanenin build ic yollarina
 * dokunmak yerine burada yapisal bir tip tanimliyoruz.
 */
export type TabBarState = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string) => void;
  };
};

/** Tum ekranlarda ayni marka vurgusunu kullanan sakin alt gezinme cubugu. */
export function TabBar({
  state,
  navigation,
  tabs,
}: TabBarState & { tabs: Record<string, TabMeta> }) {
  const insets = useSafeAreaInsets();
  const orderedOrder = Object.keys(tabs);
  const orderedRoutes = [...state.routes].sort(
    (a, b) => orderedOrder.indexOf(a.name) - orderedOrder.indexOf(b.name)
  );
  const activeRouteKey = state.routes[state.index]?.key;

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom > 0 ? insets.bottom - 4 : 8, 8) }]}>
      <View style={styles.bar}>
        {orderedRoutes.map((route) => {
          const meta = tabs[route.name];
          if (!meta) return null;

          return (
            <TabButton
              key={route.key}
              meta={meta}
              focused={route.key === activeRouteKey}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                }
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!event.defaultPrevented) navigation.navigate(route.name);
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

function TabButton({
  meta,
  focused,
  onPress,
}: {
  meta: TabMeta;
  focused: boolean;
  onPress: () => void;
}) {
  const lift = useSharedValue(focused ? 1 : 0);

  // Shared value'ya render sirasinda yazmak Reanimated'in uyardigi bir hata;
  // animasyonu efekte alarak render'i saf tutuyoruz.
  useEffect(() => {
    lift.value = withSpring(focused ? 1 : 0, { damping: 16, stiffness: 220 });
  }, [focused, lift]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: meta.featured ? -1 - lift.value * 2 : -lift.value * 2 },
      { scale: 1 + lift.value * 0.08 },
    ],
  }));

  return (
    <Pressable onPress={onPress} style={styles.tab} hitSlop={6}>
      <Animated.View
        style={[
          meta.featured ? styles.featuredIconSlot : styles.iconSlot,
          iconStyle,
          focused && (meta.featured ? styles.featuredFocusedSlot : { backgroundColor: DetailAccent }),
        ]}
      >
        {meta.customIcon ? (
          meta.customIcon(focused)
        ) : (
          <Ionicons
            name={focused ? meta.icon : (`${meta.icon}-outline` as TabMeta['icon'])}
            size={meta.featured ? 32 : 21}
            color={focused ? Accent : Palette.textFaint}
          />
        )}
      </Animated.View>
      <Txt variant="tiny" color={focused ? Accent : Palette.textFaint}>
        {meta.label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Palette.surface,
    borderTopWidth: Border.thin,
    borderTopColor: Palette.border,
    paddingHorizontal: Space.md,
    paddingTop: 5,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.surface,
    paddingVertical: 3,
    paddingHorizontal: Space.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 2,
  },
  iconSlot: {
    width: 38,
    height: 27,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredIconSlot: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surfaceHi,
    borderWidth: 1.5,
    borderColor: Palette.border,
    overflow: 'hidden',
  },
  featuredFocusedSlot: {
    borderColor: DetailAccent,
    borderWidth: 2,
  },
});
