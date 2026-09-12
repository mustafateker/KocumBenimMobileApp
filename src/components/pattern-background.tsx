import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { Accent, Palette, softOf } from '@/theme/tokens';

/**
 * Ekran zemininin dekoratif katmani — tamamen gradyansiz.
 *
 * Uc kattan olusur:
 *  1. Matematik defteri karesi: cok soluk mor izgara. Uygulamanin konusunu
 *     zemine tasir, icerigi bogmaz.
 *  2. Tepe bandi: ustte kavisli, adimin/ekranin renginin pastel tonunda duz
 *     bir blok. Basligi tasiyan alani ayirir.
 *  3. Serpme sekiller: kenarlarda duran birkac duz renkli konfeti. Sabit
 *     konumlarda dururlar, her render'da yer degistirmezler.
 *
 * Duolingo dilinden sapmamak icin hicbir katmanda gecis/gradyan yok; renk
 * duz dolgu olarak yasar.
 */

const GRID_STEP = 28;
const GRID_COLOR = '#F0EAFA';

/** Serpme sekiller — W/H orani cinsinden sabit konumlar. */
const CONFETTI = [
  { x: 0.08, y: 0.1, r: 7, kind: 'dot', tone: Palette.gold },
  { x: 0.9, y: 0.16, r: 10, kind: 'square', tone: Palette.blue },
  { x: 0.83, y: 0.06, r: 5, kind: 'dot', tone: Palette.pink },
  { x: 0.06, y: 0.42, r: 9, kind: 'square', tone: Palette.green },
  { x: 0.94, y: 0.52, r: 6, kind: 'dot', tone: Palette.purple },
  { x: 0.12, y: 0.74, r: 11, kind: 'square', tone: Palette.orange },
  { x: 0.88, y: 0.82, r: 7, kind: 'dot', tone: Palette.gold },
] as const;

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

  const columns = Math.ceil(width / GRID_STEP);
  const rows = Math.ceil(height / GRID_STEP);

  return (
    <View style={styles.layer} pointerEvents="none">
      <Svg width={width} height={height}>
        <Rect x={0} y={0} width={width} height={height} fill={Palette.bg} />

        {/* tepe bandi: alt kenari asagi dogru kavisli duz blok */}
        {bandRatio > 0 ? (
          <Path
            d={`M0 0 H${width} V${band} Q${width / 2} ${band + 46} 0 ${band} Z`}
            fill={softOf(color)}
          />
        ) : null}

        {/* matematik defteri izgarasi */}
        {Array.from({ length: columns }, (_, i) => (
          <Line
            key={`v${i}`}
            x1={i * GRID_STEP}
            y1={0}
            x2={i * GRID_STEP}
            y2={height}
            stroke={GRID_COLOR}
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: rows }, (_, i) => (
          <Line
            key={`h${i}`}
            x1={0}
            y1={i * GRID_STEP}
            x2={width}
            y2={i * GRID_STEP}
            stroke={GRID_COLOR}
            strokeWidth={1}
          />
        ))}

        {/* serpme sekiller */}
        {CONFETTI.map((c, i) =>
          c.kind === 'dot' ? (
            <Circle key={i} cx={c.x * width} cy={c.y * height} r={c.r} fill={softOf(c.tone)} />
          ) : (
            <Rect
              key={i}
              x={c.x * width - c.r}
              y={c.y * height - c.r}
              width={c.r * 2}
              height={c.r * 2}
              rx={c.r * 0.42}
              fill={softOf(c.tone)}
              transform={`rotate(${i % 2 === 0 ? 18 : -14} ${c.x * width} ${c.y * height})`}
            />
          )
        )}
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
