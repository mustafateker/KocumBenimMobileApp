import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Accent, Palette, softOf } from '@/theme/tokens';

/**
 * Ekran zemininin dekoratif katmani.
 *
 * Sicak kagit zeminin uzerinde tek renkli, cok hafif bir tepe alani bulunur.
 * Izgara ve konfeti kaldirildi: uzun okuma/odak oturumlarinda zemin icerikle
 * yarismamali. Kenardaki iki buyuk organik daire cocuk dostu yumusakligi
 * korur fakat bilgi gibi algilanacak kadar kontrast yaratmaz.
 */

export function PatternBackground({
  /** Tepe bandinin rengi — pastel tonu kullanilir. */
  color = Accent,
  /** Tepe bandinin ekran yuksekligine orani. 0 verilirse band cizilmez. */
  bandRatio = 0.28,
}: {
  color?: string;
  bandRatio?: number;
}) {
  const { width, height } = useWindowDimensions();
  const band = height * bandRatio;

  return (
    <View style={styles.layer} pointerEvents="none">
      <Svg width={width} height={height}>
        <Rect x={0} y={0} width={width} height={height} fill={Palette.bg} />

        {/* Baslik alanini sessizce ayiran tek renkli organik bant. */}
        {bandRatio > 0 ? (
          <Path
            d={`M0 0 H${width} V${band} Q${width * 0.58} ${band + 28} 0 ${band - 8} Z`}
            fill={softOf(color)}
            opacity={0.78}
          />
        ) : null}
        <Circle cx={width + 42} cy={height * 0.44} r={96} fill={Palette.bgDeep} opacity={0.18} />
        <Circle cx={-35} cy={height * 0.78} r={72} fill={Palette.bgDeep} opacity={0.14} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
