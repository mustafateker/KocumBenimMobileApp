import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen, ScreenHeader } from '@/components/screen';
import { Card, Txt } from '@/components/ui';
import { Palette, Space } from '@/theme/tokens';

export type LegalSection = {
  heading: string;
  body: string;
};

/**
 * Gizlilik Politikası, Kullanım Şartları ve Aydınlatma Metni gibi uzun
 * metin sayfalarının ortak iskeleti. İçerik ekrandan ekrana degisir,
 * duzen ayni kalir.
 */
export function LegalScreen({
  title,
  subtitle,
  updatedAt,
  sections,
}: {
  title: string;
  subtitle?: string;
  /** "12 Eylül 2026" gibi okunur bir tarih. */
  updatedAt: string;
  sections: LegalSection[];
}) {
  const router = useRouter();

  return (
    <Screen tint={Palette.textDim}>
      <ScreenHeader title={title} subtitle={subtitle} onBack={() => router.back()} />

      <Txt variant="small" color={Palette.textFaint}>
        Son güncelleme: {updatedAt}
      </Txt>

      <View style={styles.sections}>
        {sections.map((section) => (
          <Card key={section.heading} style={styles.card}>
            <Txt variant="bodyStrong">{section.heading}</Txt>
            <Txt variant="small" color={Palette.textDim} style={styles.body}>
              {section.body}
            </Txt>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sections: {
    gap: Space.md,
  },
  card: {
    gap: Space.sm,
  },
  body: {
    lineHeight: 20,
  },
});
