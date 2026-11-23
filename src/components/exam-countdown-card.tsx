import { useRouter } from 'expo-router';
import {
  Award,
  Calendar,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PressScale } from '@/components/button';
import { Txt } from '@/components/ui';
import { getExamCountdown, type ExamCountdownInfo } from '@/lib/mock-exams';
import {
  Accent,
  Border,
  DetailAccent,
  Elevation,
  Font,
  Palette,
  Radius,
  Space,
} from '@/theme/tokens';

type ExamCountdownCardProps = {
  grade?: string | number | null;
  target?: string | null;
  onPress?: () => void;
};

export function ExamCountdownCard({
  grade,
  target,
  onPress,
}: ExamCountdownCardProps) {
  const router = useRouter();

  const [countdown, setCountdown] = useState<ExamCountdownInfo>(() =>
    getExamCountdown(grade)
  );

  useEffect(() => {
    // 1 dakikada bir geri sayımı tazele
    const interval = setInterval(() => {
      setCountdown(getExamCountdown(grade));
    }, 60000);
    return () => clearInterval(interval);
  }, [grade]);

  const isLgs = countdown.examTrack === 'lgs';

  const defaultTarget = isLgs ? 'Hedef Fen Lisesi' : 'Hedef Üniversite';
  const displayTarget = target?.trim() ? target.trim() : defaultTarget;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/mock-exams');
    }
  };

  const accentColor = isLgs ? DetailAccent : Accent;

  return (
    <View style={styles.wrapper}>
      <PressScale onPress={handlePress} scaleTo={0.98}>
        <View
          style={[styles.card, Elevation.card]}
          accessibilityRole="button"
          accessibilityLabel={`${countdown.title}, deneme sınavlarına gitmek için dokunun`}
        >
          {/* Üst Başlık Satırı */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleWrap}>
              <View style={[styles.iconChip, { backgroundColor: isLgs ? 'rgba(251, 174, 117, 0.2)' : 'rgba(58, 57, 103, 0.1)' }]}>
                <Calendar size={14} color={accentColor} strokeWidth={2.4} />
              </View>
              <View>
                <Txt variant="smallStrong" color={Palette.text}>
                  {countdown.title}
                </Txt>
                <Txt variant="tiny" color={Palette.textDim}>
                  {countdown.examDateStr}
                </Txt>
              </View>
            </View>

            <View style={styles.actionBadge}>
              <Txt variant="tiny" color={accentColor} style={styles.actionBadgeText}>
                Denemelerim
              </Txt>
              <ChevronRight size={13} color={accentColor} strokeWidth={2.4} />
            </View>
          </View>

          {/* Sayaç Rakamları & Hedef */}
          <View style={styles.timerContentRow}>
            {/* Sayaç Kutuları */}
            <View style={styles.countdownBoxes}>
              <View style={styles.timeUnitBox}>
                <View style={styles.numPill}>
                  <Txt style={styles.numText}>{countdown.days}</Txt>
                </View>
                <Txt variant="tiny" color={Palette.textDim}>
                  GÜN
                </Txt>
              </View>

              <Txt variant="section" color={Palette.textFaint} style={styles.colonSeparator}>
                :
              </Txt>

              <View style={styles.timeUnitBox}>
                <View style={styles.numPill}>
                  <Txt style={styles.numText}>{countdown.hours}</Txt>
                </View>
                <Txt variant="tiny" color={Palette.textDim}>
                  SAAT
                </Txt>
              </View>

              <Txt variant="section" color={Palette.textFaint} style={styles.colonSeparator}>
                :
              </Txt>

              <View style={styles.timeUnitBox}>
                <View style={styles.numPill}>
                  <Txt style={styles.numText}>{countdown.minutes}</Txt>
                </View>
                <Txt variant="tiny" color={Palette.textDim}>
                  DAKİKA
                </Txt>
              </View>
            </View>

            {/* Hedef Bilgisi Rozeti */}
            <View style={styles.targetWrap}>
              <View style={styles.targetIconRow}>
                <Sparkles size={11} color={Palette.orange} />
                <Txt variant="tiny" color={Palette.textFaint} numberOfLines={1}>
                  HEDEF
                </Txt>
              </View>
              <Txt variant="smallStrong" color={Palette.text} numberOfLines={1} style={styles.targetText}>
                {displayTarget}
              </Txt>
            </View>
          </View>

          {/* Alt Sınav Format & Kural İpucu */}
          <View style={styles.footerRow}>
            <View style={styles.formatChip}>
              <Clock size={11} color={Palette.textDim} />
              <Txt variant="tiny" color={Palette.textDim} numberOfLines={1}>
                {isLgs ? 'Sözel 50 S / 75 dk · Sayısal 40 S / 80 dk' : 'TYT 120 S / 165 dk · AYT 80 S / 180 dk'}
              </Txt>
            </View>

            <View style={styles.ruleBadge}>
              <Award size={11} color={Palette.green} />
              <Txt variant="tiny" color={Palette.green} style={{ fontWeight: '700' }}>
                {isLgs ? '3Y = 1D' : '4Y = 1D'}
              </Txt>
            </View>
          </View>
        </View>
      </PressScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: Space.xs,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    padding: Space.md,
    gap: Space.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
  },
  iconChip: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Palette.surfaceHi,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  actionBadgeText: {
    fontWeight: '700',
  },
  timerContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.sm,
    paddingVertical: 2,
  },
  countdownBoxes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeUnitBox: {
    alignItems: 'center',
    gap: 2,
  },
  numPill: {
    backgroundColor: Palette.surfaceHi,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Border.thin,
    borderColor: 'rgba(58, 57, 103, 0.08)',
  },
  numText: {
    fontFamily: Font.bold,
    fontSize: 18,
    color: Palette.text,
  },
  colonSeparator: {
    marginTop: -14,
    fontFamily: Font.bold,
  },
  targetWrap: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  targetIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  targetText: {
    textAlign: 'right',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Space.xs,
    borderTopWidth: Border.thin,
    borderTopColor: Palette.border,
    gap: Space.xs,
  },
  formatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  ruleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Palette.greenSoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
});
