import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Border, DetailAccent, Elevation, Palette, Radius, Space } from '@/theme/tokens';

import { GhostButton, NeonButton } from './button';
import { IconBubble, Txt } from './ui';

type AppDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

/**
 * Uygulamanin ortak modal bildirimi. Native Alert yerine marka renklerini,
 * tutarli aksiyon siralamasini ve Android geri tusu davranisini kullanir.
 */
export function AppDialog({
  visible,
  title,
  message,
  icon = 'information-circle-outline',
  confirmLabel = 'Tamam',
  cancelLabel,
  onConfirm,
  onCancel,
}: AppDialogProps) {
  const dismiss = onCancel ?? onConfirm;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={dismiss}
    >
      <Pressable style={styles.backdrop} onPress={dismiss} accessibilityRole="none">
        <Pressable
          style={styles.card}
          onPress={() => {}}
          accessibilityRole="alert"
          accessibilityViewIsModal
        >
          <View style={styles.accentLine} />
          <IconBubble name={icon} color={DetailAccent} size={58} />

          <View style={styles.copy}>
            <Txt variant="section" center>
              {title}
            </Txt>
            <Txt variant="body" color={Palette.textDim} center>
              {message}
            </Txt>
          </View>

          <View style={styles.actions}>
            {cancelLabel && onCancel ? (
              <GhostButton label={cancelLabel} onPress={onCancel} style={styles.action} full />
            ) : null}
            <NeonButton label={confirmLabel} onPress={onConfirm} style={styles.action} full />
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
    padding: Space.xl,
    backgroundColor: Palette.overlay,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    gap: Space.lg,
    overflow: 'hidden',
    paddingHorizontal: Space.xl,
    paddingTop: Space.xxl,
    paddingBottom: Space.xl,
    borderRadius: Radius.xl,
    borderWidth: Border.thin,
    borderColor: Palette.borderStrong,
    backgroundColor: Palette.surface,
    ...Elevation.xl,
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: DetailAccent,
  },
  copy: {
    alignSelf: 'stretch',
    gap: Space.sm,
  },
  actions: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: Space.md,
    marginTop: Space.xs,
  },
  action: {
    flex: 1,
  },
});
