import React, { useState } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { getBannerAdUnitId } from '@/lib/ads';
import { useSubscription } from '@/lib/subscription';

export function AdBanner({ style }: { style?: ViewStyle }) {
  const { isPro } = useSubscription();
  const [loadFailed, setLoadFailed] = useState(false);

  // Pro kullanicilarda, web platformunda veya yukleme basarisiz oldugunda yer kaplamadan gizlenir
  if (isPro || Platform.OS === 'web' || loadFailed) {
    return null;
  }

  const unitId = getBannerAdUnitId();
  if (!unitId) return null;

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={() => {
          setLoadFailed(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
});
