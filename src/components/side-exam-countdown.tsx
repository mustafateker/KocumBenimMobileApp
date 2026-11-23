import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Calendar,
  Sparkles,
  Timer,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GhostButton, NeonButton, PressScale } from '@/components/button';
import { Txt } from '@/components/ui';
import { getShowExamCountdown, useShowExamCountdown } from '@/lib/countdown-settings';
import { getExamCountdown, isExamYearStudent, type ExamCountdownInfo } from '@/lib/mock-exams';
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

type SideExamCountdownProps = {
  grade?: string | number | null;
  target?: string | null;
};

export function SideExamCountdown({ grade, target }: SideExamCountdownProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { enabled, loading, setEnabled } = useShowExamCountdown();

  // Ekran odağa geldiğinde veya ayarlardan dönüldüğünde anında senkronize et
  useFocusEffect(
    useCallback(() => {
      getShowExamCountdown().then((val) => {
        if (val !== enabled) {
          setEnabled(val);
        }
      });
    }, [enabled, setEnabled])
  );

  const [prevGrade, setPrevGrade] = useState(grade);
  const [countdown, setCountdown] = useState<ExamCountdownInfo>(() =>
    getExamCountdown(grade)
  );
  const [modalVisible, setModalVisible] = useState(false);

  if (grade !== prevGrade) {
    setPrevGrade(grade);
    setCountdown(getExamCountdown(grade));
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getExamCountdown(grade));
    }, 60000);
    return () => clearInterval(interval);
  }, [grade]);

  // Yalnızca 8. ve 12. sınıflar için sayaç aktiftir; ayarlardan kapatıldıysa veya yükleniyorsa gizle
  if (loading || !enabled || !isExamYearStudent(grade)) {
    return null;
  }

  const isLgs = countdown.examTrack === 'lgs';
  const badgeColor = isLgs ? DetailAccent : Accent;

  const defaultTarget = isLgs ? 'Hedef Fen Lisesi' : 'Hedef Üniversite';
  const displayTarget = target?.trim() ? target.trim() : defaultTarget;

  const handleOpenPopup = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setModalVisible(true);
  };

  const handleGoToExams = () => {
    setModalVisible(false);
    router.push('/mock-exams');
  };

  const handleDisableCountdown = async () => {
    setModalVisible(false);
    await setEnabled(false);
  };

  return (
    <>
      {/* Ekranın Sağ Yanına Sabitlenmiş Kompakt Sayaç Sekmesi */}
      <View
        style={[
          styles.floatingContainer,
          { top: insets.top + 76 },
        ]}
        pointerEvents="box-none"
      >
        <PressScale onPress={handleOpenPopup} scaleTo={0.94}>
          <View
            style={[
              styles.sideTab,
              Elevation.card,
              { borderColor: isLgs ? 'rgba(251, 174, 117, 0.45)' : 'rgba(58, 57, 103, 0.25)' },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${countdown.examName} sınavına ${countdown.days} gün kaldı. Ayrıntıları görmek için dokunun.`}
          >
            <View style={styles.tabContentRow}>
              <Timer size={14} color={badgeColor} strokeWidth={2.4} />
              <Txt style={[styles.tabExamText, { color: badgeColor }]}>
                {countdown.examName}
              </Txt>
              <View style={styles.tabDot} />
              <Txt style={styles.tabDaysText}>
                {countdown.days}g
              </Txt>
            </View>
          </View>
        </PressScale>
      </View>

      {/* Tıklanınca Açılan Detaylı Sınav Pop-up Modalı */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} />

          <View style={[styles.modalCard, Elevation.modal]}>
            {/* Modal Üst Başlık */}
            <View style={styles.modalHeader}>
              <View style={styles.headerLeft}>
                <View
                  style={[
                    styles.iconBubble,
                    { backgroundColor: isLgs ? 'rgba(251, 174, 117, 0.2)' : 'rgba(58, 57, 103, 0.12)' },
                  ]}
                >
                  <Calendar size={18} color={badgeColor} strokeWidth={2.4} />
                </View>
                <View>
                  <Txt variant="section" color={Palette.text}>
                    {countdown.title}
                  </Txt>
                  <Txt variant="tiny" color={Palette.textDim}>
                    {countdown.examDateStr}
                  </Txt>
                </View>
              </View>

              <PressScale onPress={() => setModalVisible(false)} scaleTo={0.9}>
                <View style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={Palette.textDim} />
                </View>
              </PressScale>
            </View>

            {/* Büyük Canlı Sayaç Blokları */}
            <View style={styles.countdownRow}>
              <View style={styles.unitBox}>
                <View style={styles.unitPill}>
                  <Txt style={styles.unitNumber}>{countdown.days}</Txt>
                </View>
                <Txt variant="tiny" color={Palette.textDim} style={styles.unitLabel}>
                  GÜN
                </Txt>
              </View>

              <Txt variant="section" color={Palette.textFaint} style={styles.colon}>
                :
              </Txt>

              <View style={styles.unitBox}>
                <View style={styles.unitPill}>
                  <Txt style={styles.unitNumber}>{countdown.hours}</Txt>
                </View>
                <Txt variant="tiny" color={Palette.textDim} style={styles.unitLabel}>
                  SAAT
                </Txt>
              </View>

              <Txt variant="section" color={Palette.textFaint} style={styles.colon}>
                :
              </Txt>

              <View style={styles.unitBox}>
                <View style={styles.unitPill}>
                  <Txt style={styles.unitNumber}>{countdown.minutes}</Txt>
                </View>
                <Txt variant="tiny" color={Palette.textDim} style={styles.unitLabel}>
                  DAKİKA
                </Txt>
              </View>
            </View>

            {/* Hedef Bilgi Kartı */}
            <View style={styles.targetCard}>
              <View style={styles.targetHeader}>
                <Sparkles size={12} color={Palette.orange} />
                <Txt variant="tiny" color={Palette.orange} style={{ fontWeight: '700' }}>
                  HEDEF OKUL / BÖLÜM
                </Txt>
              </View>
              <Txt variant="bodyStrong" color={Palette.text}>
                {displayTarget}
              </Txt>
            </View>

            {/* Eylemler */}
            <View style={styles.actionButtons}>
              <NeonButton
                label={isLgs ? 'LGS Denemelerime Git' : 'YKS Denemelerime Git'}
                icon="arrow-forward"
                color={badgeColor}
                onPress={handleGoToExams}
                full
              />
              <GhostButton
                label="Kapat"
                onPress={() => setModalVisible(false)}
                full
              />
            </View>

            <Txt variant="tiny" color={Palette.textFaint} center style={styles.hintText}>
              Bu sayacı Ayarlar → Uygulama bölümünden dilediğinde kapatabilirsin.
            </Txt>

            <PressScale onPress={handleDisableCountdown} scaleTo={0.96}>
              <View style={styles.disableBtnRow}>
                <Ionicons name="eye-off-outline" size={14} color={Palette.textDim} />
                <Txt variant="tiny" color={Palette.textDim} style={styles.disableBtnText}>
                  Bu Sayacı Ana Ekrandan Kaldır
                </Txt>
              </View>
            </PressScale>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    right: 0,
    zIndex: 999,
  },
  sideTab: {
    backgroundColor: Palette.surface,
    borderTopLeftRadius: Radius.pill,
    borderBottomLeftRadius: Radius.pill,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: Border.thin,
    borderRightWidth: 0,
    paddingVertical: 7,
    paddingLeft: 11,
    paddingRight: 8,
  },
  tabContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tabExamText: {
    fontFamily: Font.bold,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  tabDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Palette.textFaint,
    marginHorizontal: 1,
  },
  tabDaysText: {
    fontFamily: Font.bold,
    fontSize: 12,
    color: Palette.text,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Palette.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Space.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Palette.surface,
    borderRadius: Radius.xl,
    padding: Space.lg,
    gap: Space.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    flex: 1,
  },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Space.xs,
  },
  unitBox: {
    alignItems: 'center',
    gap: 4,
  },
  unitPill: {
    backgroundColor: Palette.surfaceHi,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.md,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Border.thin,
    borderColor: 'rgba(58, 57, 103, 0.08)',
  },
  unitNumber: {
    fontFamily: Font.bold,
    fontSize: 24,
    color: Palette.text,
  },
  unitLabel: {
    letterSpacing: 0.5,
  },
  colon: {
    marginTop: -18,
    fontFamily: Font.bold,
  },
  targetCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(251, 174, 117, 0.35)',
    padding: Space.sm,
    gap: 4,
  },
  targetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtons: {
    gap: Space.xs,
    paddingTop: Space.xs,
  },
  hintText: {
    marginTop: 2,
  },
  disableBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Space.xs,
    marginTop: Space.xs,
  },
  disableBtnText: {
    textDecorationLine: 'underline',
  },
});
