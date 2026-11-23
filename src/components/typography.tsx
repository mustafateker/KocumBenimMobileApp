import React from 'react';
import {
  type ColorValue,
  type StyleProp,
  Text,
  type TextProps,
  type TextStyle,
} from 'react-native';

import {
  Accent,
  DetailAccent,
  FontWeightMap,
  OnColor,
  Palette,
  Type,
  type FontWeight,
} from '@/theme/tokens';

export type TypographyVariant = keyof typeof Type;

export type TypographyColor =
  | 'primary'
  | 'dim'
  | 'faint'
  | 'accent'
  | 'detail'
  | 'orange'
  | 'green'
  | 'success'
  | 'blue'
  | 'pink'
  | 'rose'
  | 'danger'
  | 'white'
  | (string & {});

export interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: TypographyColor;
  weight?: FontWeight;
  align?: 'left' | 'center' | 'right';
  center?: boolean;
  size?: number;
  lineHeight?: number;
  letterSpacing?: number;
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

export function resolveTypographyColor(color?: TypographyColor): ColorValue {
  if (!color) return Palette.text;
  switch (color) {
    case 'primary':
      return Palette.text;
    case 'dim':
      return Palette.textDim;
    case 'faint':
      return Palette.textFaint;
    case 'accent':
      return Accent;
    case 'detail':
    case 'orange':
      return DetailAccent;
    case 'green':
    case 'success':
      return Palette.green;
    case 'blue':
      return Palette.blue;
    case 'pink':
    case 'rose':
    case 'danger':
      return Palette.pink;
    case 'white':
      return OnColor;
    default:
      return color;
  }
}

/**
 * Modern soft-edtech tipografi bileşeni.
 * Plus Jakarta Sans font ailesi, genişletilmiş satır yükseklikleri
 * ve kusursuz Türkçe karakter desteği ile çalışır.
 */
export function Typography({
  variant = 'body',
  color = 'primary',
  weight,
  align,
  center,
  size,
  lineHeight,
  letterSpacing,
  style,
  ...rest
}: TypographyProps) {
  const baseType = Type[variant] ?? Type.body;

  const resolvedColor = resolveTypographyColor(color);
  const resolvedFontFamily = weight ? FontWeightMap[weight] : baseType.fontFamily;

  const customStyle: TextStyle = {
    color: resolvedColor,
    fontFamily: resolvedFontFamily,
  };

  if (align || center) {
    customStyle.textAlign = align ?? (center ? 'center' : undefined);
  }
  if (size !== undefined) {
    customStyle.fontSize = size;
  }
  if (lineHeight !== undefined) {
    customStyle.lineHeight = lineHeight;
  }
  if (letterSpacing !== undefined) {
    customStyle.letterSpacing = letterSpacing;
  }

  return <Text style={[baseType, customStyle, style]} {...rest} />;
}

// Compound Typography Bileşenleri
Typography.Hero = function Hero(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="hero" {...props} />;
};

Typography.Display = function Display(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="display" {...props} />;
};

Typography.Title = function Title(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="title" {...props} />;
};

Typography.Section = function Section(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="section" {...props} />;
};

Typography.Body = function Body(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="body" {...props} />;
};

Typography.BodyStrong = function BodyStrong(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="bodyStrong" {...props} />;
};

Typography.Small = function Small(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="small" {...props} />;
};

Typography.SmallStrong = function SmallStrong(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="smallStrong" {...props} />;
};

Typography.Caption = function Caption(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="caption" {...props} />;
};

Typography.Tiny = function Tiny(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="tiny" {...props} />;
};

Typography.Stat = function Stat(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="stat" {...props} />;
};

Typography.Timer = function Timer(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="timer" {...props} />;
};

/** Geriye dönük uyumluluk ve hızlı kullanım için Txt alias'ı */
export const Txt = Typography;
