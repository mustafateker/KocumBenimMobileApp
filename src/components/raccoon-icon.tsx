import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

const RACCOON_SOURCE = require('../../assets/images/ai-raccoon-icon.png');

export type RaccoonIconProps = {
  size?: number;
  fill?: boolean;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Koçum Benim AI Koç Rakun ikonu (`app-icon.png`).
 */
export function RaccoonIcon({
  size = 24,
  fill = false,
  style,
}: RaccoonIconProps) {
  return (
    <View
      style={[
        styles.wrap,
        fill
          ? styles.fill
          : {
              width: size,
              height: size,
            },
        style,
      ]}
    >
      <Image source={RACCOON_SOURCE} style={styles.image} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
