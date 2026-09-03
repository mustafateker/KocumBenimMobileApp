import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';

import { GhostButton, NeonButton, PressScale } from '@/components/button';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, IconBubble, TextField, Txt } from '@/components/ui';
import { deleteAccount, updatePassword, verifyEmailPassword } from '@/db/repo';
import { useLocalPref } from '@/lib/use-local-pref';
import { useSession, useStudent } from '@/lib/session';
import { Palette, Space } from '@/theme/tokens';

export default function Settings() {
  const db = useSQLiteContext();
  const student = useStudent();
  const router = useRouter();
  const { signOut } = useSession();

  const [taskNotifs, setTaskNotifs] = useLocalPref('notif.tasks', true);
  const [streakNotifs, setStreakNotifs] = useLocalPref('notif.streak', true);
  const [announceNotifs, setAnnounceNotifs] = useLocalPref('notif.announcements', true);
  const [sound, setSound] = useLocalPref('app.sound', true);
  const [haptics, setHaptics] = useLocalPref('app.haptics', true);

  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const submitPassword = useCallback(async () => {
    if (savingPassword) return;
    if (newPassword.length < 4) {
      setPasswordError('Yeni parola en az 4 karakter olmalı.');
      return;
    }
    setSavingPassword(true);
    setPasswordError(null);
    try {
      const ok = await verifyEmailPassword(db, student.email ?? '', currentPassword);
      if (!ok) {
        setPasswordError('Mevcut parola hatalı.');
        return;
      }
      await updatePassword(db, student.id, newPassword);
      setChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
    } finally {
      setSavingPassword(false);
    }
  }, [savingPassword, newPassword, db, student.email, student.id, currentPassword]);

  const confirmDelete = useCallback(() => {
    Alert.alert(
      'Hesabını silmek istediğine emin misin?',
      'Bu işlem geri alınamaz. Tüm görevlerin, sorularin ve odak geçmişin silinir.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Hesabı Sil',
          style: 'destructive',
          onPress: async () => {
            await deleteAccount(db, student.id);
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  }, [db, student.id, signOut, router]);

  return (
    <Screen tint={Palette.text}>
      <ScreenHeader title="Ayarlar" subtitle="Hesabını ve tercihlerini yönet" onBack={() => router.back()} />

      {/* Hesap */}
      <View style={styles.section}>
        <Txt variant="smallStrong" color={Palette.textDim}>
          Hesap
        </Txt>
        <Card style={styles.list}>
          <SettingRow icon="mail-outline" color={Palette.purple} label="E-posta" trailing={student.email ?? '—'} />
          <PressScale onPress={() => setChangingPassword((c) => !c)}>
            <SettingRow icon="lock-closed-outline" color={Palette.blue} label="Parolayı Değiştir" chevron />
          </PressScale>

          {changingPassword ? (
            <View style={styles.passwordForm}>
              <TextField
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Mevcut parola"
                secureTextEntry
              />
              <TextField value={newPassword} onChangeText={setNewPassword} placeholder="Yeni parola" secureTextEntry />
              {passwordError ? (
                <Txt variant="small" color={Palette.pink}>
                  {passwordError}
                </Txt>
              ) : null}
              <NeonButton
                label={savingPassword ? 'Kaydediliyor…' : 'Parolayı Güncelle'}
                color={Palette.blue}
                disabled={savingPassword}
                onPress={submitPassword}
                full
              />
            </View>
          ) : null}
        </Card>
      </View>

      {/* Bildirim tercihleri */}
      <View style={styles.section}>
        <Txt variant="smallStrong" color={Palette.textDim}>
          Bildirim Tercihleri
        </Txt>
        <Card style={styles.list}>
          <SettingRow
            icon="clipboard-outline"
            color={Palette.gold}
            label="Görev bildirimleri"
            control={<Switch value={taskNotifs} onValueChange={setTaskNotifs} trackColor={SWITCH_TRACK} />}
          />
          <SettingRow
            icon="flame-outline"
            color={Palette.orange}
            label="Seri hatırlatmaları"
            control={<Switch value={streakNotifs} onValueChange={setStreakNotifs} trackColor={SWITCH_TRACK} />}
          />
          <SettingRow
            icon="megaphone-outline"
            color={Palette.green}
            label="Uygulama duyuruları"
            control={<Switch value={announceNotifs} onValueChange={setAnnounceNotifs} trackColor={SWITCH_TRACK} />}
          />
        </Card>
      </View>

      {/* Uygulama */}
      <View style={styles.section}>
        <Txt variant="smallStrong" color={Palette.textDim}>
          Uygulama
        </Txt>
        <Card style={styles.list}>
          <SettingRow
            icon="volume-high-outline"
            color={Palette.blue}
            label="Ses efektleri"
            control={<Switch value={sound} onValueChange={setSound} trackColor={SWITCH_TRACK} />}
          />
          <SettingRow
            icon="phone-portrait-outline"
            color={Palette.purple}
            label="Titreşim"
            control={<Switch value={haptics} onValueChange={setHaptics} trackColor={SWITCH_TRACK} />}
          />
        </Card>
      </View>

      {/* Destek ve yasal */}
      <View style={styles.section}>
        <Txt variant="smallStrong" color={Palette.textDim}>
          Destek ve Yasal
        </Txt>
        <Card style={styles.list}>
          <SettingRow icon="shield-checkmark-outline" color={Palette.textDim} label="Gizlilik Politikası" chevron />
          <SettingRow icon="document-text-outline" color={Palette.textDim} label="Kullanım Şartları" chevron />
          <SettingRow icon="information-circle-outline" color={Palette.textDim} label="Sürüm" trailing="1.0.0" />
        </Card>
      </View>

      {/* Tehlikeli bolge */}
      <View style={styles.section}>
        <Txt variant="smallStrong" color={Palette.pink}>
          Tehlikeli Bölge
        </Txt>
        <GhostButton
          label="Çıkış Yap"
          icon="log-out-outline"
          color={Palette.textDim}
          full
          onPress={async () => {
            await signOut();
            router.replace('/login');
          }}
        />
        <GhostButton label="Hesabı Sil" icon="trash-outline" color={Palette.pink} full onPress={confirmDelete} />
      </View>
    </Screen>
  );
}

const SWITCH_TRACK = { false: Palette.border, true: Palette.purple };

function SettingRow({
  icon,
  color,
  label,
  trailing,
  chevron,
  control,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  label: string;
  trailing?: string;
  chevron?: boolean;
  control?: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <IconBubble name={icon} color={color} size={36} />
      <Txt variant="bodyStrong" style={styles.flex} numberOfLines={1}>
        {label}
      </Txt>
      {trailing ? (
        <Txt variant="small" color={Palette.textFaint} numberOfLines={1}>
          {trailing}
        </Txt>
      ) : null}
      {chevron ? <Ionicons name="chevron-forward" size={18} color={Palette.textFaint} /> : null}
      {control}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  section: {
    gap: Space.sm,
  },
  list: {
    padding: Space.sm,
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: Space.md,
    paddingHorizontal: Space.sm,
  },
  passwordForm: {
    gap: Space.md,
    padding: Space.md,
    paddingTop: 0,
  },
});
