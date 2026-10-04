import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Accent, Border, DetailAccent, Palette, Radius, Space } from '@/theme/tokens';

import { Txt } from './ui';

export type TabMeta = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
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

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, Space.md) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const meta = tabs[route.name];
          if (!meta) return null;

          return (
            <TabButton
              key={route.key}
              meta={meta}
              focused={state.index === index}
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
    transform: [{ translateY: -lift.value * 3 }, { scale: 1 + lift.value * 0.12 }],
  }));

  return (
    <Pressable onPress={onPress} style={styles.tab} hitSlop={6}>
      <Animated.View style={[styles.iconSlot, iconStyle, focused && { backgroundColor: DetailAccent }]}>
        <Ionicons
          name={focused ? meta.icon : (`${meta.icon}-outline` as TabMeta['icon'])}
          size={21}
          color={focused ? Accent : Palette.textFaint}
        />
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
    paddingTop: Space.sm,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.surface,
    paddingVertical: Space.xs,
    paddingHorizontal: Space.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  iconSlot: {
    width: 40,
    height: 32,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
