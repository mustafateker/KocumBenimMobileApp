import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import {
  dismissPlayReviewPrompt,
  submitPlayReviewAndOpenStore,
  subscribePlayReviewPrompt,
} from '@/lib/play-review';
import { useSession } from '@/lib/session';
import {
  Accent,
  Border,
  DetailAccent,
  Elevation,
  Palette,
  Radius,
  Space,
  pillRadius,
  softOf,
} from '@/theme/tokens';

import { GhostButton, NeonButton, PressScale } from './button';
import { RaccoonIcon } from './raccoon-icon';
import { TextField, Txt } from './ui';

const QUICK_TAGS = [
  'Koçum çok faydalı',
  'Ödev takibi harika',
  'Ders çalışmayı sevdirdi',
];

/**
 * Kullanıcı Koçum (AI Koç) ekranını kullandıktan sonra başka bir ekrana ilk geçtiğinde
 * açılan ikna edici Google Play değerlendirme ve yorum popup'ı.
 */
export function PlayReviewPrompt() {
  const { user } = useSession();
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return subscribePlayReviewPrompt((v) => {
      setVisible(v);
    });
  }, []);

  if (!visible) return null;

  const handleSelectStar = (star: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setRating(star);
  };

  const handleAddTag = (tag: string) => {
    setComment((prev) => {
      if (prev.includes(tag)) return prev;
      return prev.trim().length > 0 ? `${prev.trim()} · ${tag}` : tag;
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await submitPlayReviewAndOpenStore({
        rating,
        comment,
        studentName: user?.name,
        studentEmail: user?.email,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => dismissPlayReviewPrompt()}
    >
      <Pressable
        style={styles.backdrop}
        onPress={() => dismissPlayReviewPrompt()}
        accessibilityRole="none"
      >
        <Pressable
          style={styles.card}
          onPress={() => {}}
          accessibilityRole="alert"
          accessibilityViewIsModal
        >
          <View style={styles.accentBar} />

          <View style={styles.heroWrap}>
            <View style={styles.iconCircle}>
              <RaccoonIcon size={44} />
            </View>
            <View style={styles.playBadge}>
              <Ionicons name="logo-google-playstore" size={13} color={Accent} />
              <Txt variant="tiny" color={Accent}>
                Google Play Değerlendirme
              </Txt>
            </View>
          </View>

          <View style={styles.copyWrap}>
            <Txt variant="section" center>
              Koçum Senin İçin Çalışıyor!
            </Txt>
            <Txt variant="small" color={Palette.textDim} center>
              Yapay zeka koçun Koçum ile çalışma planını ve konu analizlerini hazırladık. Google Play&apos;de vereceğin 5 yıldız ve güzel bir yorum, senin gibi binlerce öğrencinin hedeflerine ulaşmasına büyük güç katıyor. Bize 10 saniyeni ayırıp destek olur musun?
            </Txt>
          </View>

          {/* 5 Yıldız Seçici */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= rating;
              return (
                <PressScale key={star} onPress={() => handleSelectStar(star)} scaleTo={0.88}>
                  <View
                    style={[
                      styles.starButton,
                      active && {
                        borderColor: Palette.gold,
                        backgroundColor: softOf(Palette.gold),
                      },
                    ]}
                  >
                    <Ionicons
                      name={active ? 'star' : 'star-outline'}
                      size={26}
                      color={active ? Palette.gold : Palette.textFaint}
                    />
                  </View>
                </PressScale>
              );
            })}
          </View>

          {/* Hızlı Yorum Etiketleri */}
          <View style={styles.tagsRow}>
            {QUICK_TAGS.map((tag) => (
              <PressScale key={tag} onPress={() => handleAddTag(tag)} scaleTo={0.95}>
                <View style={styles.tagChip}>
                  <Txt variant="tiny" color={Palette.textDim}>
                    + {tag}
                  </Txt>
                </View>
              </PressScale>
            ))}
          </View>

          {/* Yorum Kutusu */}
          <View style={styles.inputWrap}>
            <TextField
              value={comment}
              onChangeText={setComment}
              placeholder="Deneyimini veya yorumunu yazabilirsin..."
              multiline
              style={styles.commentInput}
            />
          </View>

          {/* Aksiyon Butonları */}
          <View style={styles.actionsCol}>
            <NeonButton
              label="Google Play'de Değerlendir ve Gönder"
              icon="star"
              color={Accent}
              size="lg"
              disabled={submitting}
              onPress={handleSubmit}
              full
            />
            <GhostButton
              label="Daha Sonra Hatırlat"
              color={Palette.textDim}
              onPress={() => dismissPlayReviewPrompt()}
              full
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Space.lg,
    backgroundColor: Palette.overlay,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    gap: Space.md,
    overflow: 'hidden',
    paddingHorizontal: Space.xl,
    paddingTop: Space.xl,
    paddingBottom: Space.lg,
    borderRadius: Radius.xl,
    borderWidth: Border.thick,
    borderColor: Palette.borderStrong,
    backgroundColor: Palette.surface,
    ...Elevation.xl,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: Accent,
  },
  heroWrap: {
    alignItems: 'center',
    gap: Space.xs,
    marginTop: Space.xs,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DetailAccent,
    borderWidth: Border.thick,
    borderColor: Accent,
  },
  playBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Space.md,
    paddingVertical: 4,
    borderRadius: pillRadius(26),
    backgroundColor: softOf(Accent),
    borderWidth: 1,
    borderColor: Accent,
  },
  copyWrap: {
    alignSelf: 'stretch',
    gap: Space.xs,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.sm,
  },
  starButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Border.thin,
    borderColor: Palette.border,
    backgroundColor: Palette.surfaceHi,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: pillRadius(24),
    borderWidth: Border.thin,
    borderColor: Palette.border,
    backgroundColor: Palette.surfaceHi,
  },
  inputWrap: {
    alignSelf: 'stretch',
  },
  commentInput: {
    minHeight: 54,
    textAlignVertical: 'top',
  },
  actionsCol: {
    alignSelf: 'stretch',
    gap: Space.xs,
    marginTop: 2,
  },
});
