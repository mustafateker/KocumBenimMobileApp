import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

import type { CanvasData } from '@/lib/types';
import { Palette, Radius, Space } from '@/theme/tokens';

import { Txt } from './ui';

/**
 * Soru fotografi (sunucudaki S3/MinIO URL'i) + uzerine yapilan cizim ve notlar.
 *
 * Cizimler olusturuldugu piksel uzayinda saklanir; viewBox sayesinde
 * kucuk onizlemede de tam ekranda da dogru olcekte gorunur.
 */
export function CanvasView({
  imageUri,
  canvas,
  style,
  /** Fotograf yoksa gosterilecek yedek metin (ornek verideki sorular). */
  fallbackNote,
}: {
  imageUri: string;
  canvas: CanvasData;
  style?: StyleProp<ViewStyle>;
  fallbackNote?: string | null;
}) {
  const hasImage = imageUri.length > 0;

  return (
    <View style={[styles.wrap, style]}>
      {hasImage ? (
        <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} contentFit="contain" />
      ) : (
        <View style={styles.fallback}>
          <Txt variant="small" color={Palette.textDim}>
            {fallbackNote ?? 'Fotoğraf yok'}
          </Txt>
        </View>
      )}

      {canvas.items.length > 0 ? (
        <Svg
          style={StyleSheet.absoluteFill}
          viewBox={`0 0 ${canvas.w} ${canvas.h}`}
          preserveAspectRatio="xMidYMid meet"
          pointerEvents="none"
        >
          {canvas.items.map((item, i) =>
            item.kind === 'stroke' ? (
              <Path
                key={i}
                d={item.d}
                stroke={item.color}
                strokeWidth={item.width}
                strokeOpacity={item.highlight ? 0.38 : 1}
                strokeLinecap={item.highlight ? 'butt' : 'round'}
                strokeLinejoin="round"
                fill="none"
              />
            ) : (
              <SvgText
                key={i}
                x={item.x}
                y={item.y}
                fill={item.color}
                fontSize={Math.max(14, canvas.w * 0.045)}
                fontWeight="bold"
              >
                {item.text}
              </SvgText>
            )
          )}
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Palette.surfaceHi,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  fallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Space.lg,
  },
});
