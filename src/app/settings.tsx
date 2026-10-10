import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { AppDialog } from '@/components/app-dialog';
import { GhostButton, NeonButton, PressScale } from '@/components/button';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, IconBubble, SectionLabel, TextField, Txt } from '@/components/ui';
import { changePassword, deleteAccount, getPreferences, patchMe, patchPreferences } from '@/lib/api';
import { ApiError } from '@/lib/api-client';
import { useErrorDialog } from '@/lib/error-dialog';
import { useSession, useStudent } from '@/lib/session';
import type { Preferences } from '@/lib/types';
import { EMAIL_RE } from '@/lib/validation';
import { Accent, DetailAccent, Palette, Space } from '@/theme/tokens';

const DEFAULT_PREFS: Preferences = {
  taskNotifs: true,
  streakNotifs: true,
  announcements: true,
  sound: true,
  haptics: true,
};

export default function Settings() {
  const student = useStudent();
  const router = useRouter();
  const { signOut, setUser } = useSession();
  const { showMessage, showError } = useErrorDialog();

  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    getPreferences()
      .then(setPrefs)
      .catch((err) => showError(err, { title: 'Tercihler yüklenemedi', code: 'PREFERENCES_LOAD' }));
  }, [showError]);

  const togglePref = useCallback(
    (key: keyof Preferences, value: boolean) => {
      setPrefs((p) => ({ ...p, [key]: value }));
      patchPreferences({ [key]: value }).catch((err) => {
        setPrefs((p) => ({ ...p, [key]: !value }));
        showError(err, { title: 'Tercih kaydedilemedi', code: 'PREFERENCE_SAVE' });
      });
    },
    [showError]
  );

  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const submitPassword = useCallback(async () => {
    if (savingPassword) return;
    if (!currentPassword) {
      showMessage('Eksik bilgi', 'Mevcut parolanı gir.');
      return;
    }
    if (newPassword.length < 4) {
      showMessage('Parola çok kısa', 'Yeni parola en az 4 karakter olmalı.');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      showMessage('Parola güncellendi', 'Yeni parolan kaydedildi.');
    } catch (err) {
      if (err instanceof ApiError && (err.code === 'INVALID_CREDENTIALS' || err.status === 401 || err.status === 403)) {
        showMessage('Parola değiştirilemedi', 'Mevcut parola hatalı.');
      } else {
        showError(err, { title: 'Parola değiştirilemedi', code: 'PASSWORD_CHANGE' });
      }
    } finally {
      setSavingPassword(false);
    }
  }, [savingPassword, newPassword, currentPassword, showMessage, showError]);

  const [editingParentEmail, setEditingParentEmail] = useState(false);
  const [parentEmailInput, setParentEmailInput] = useState(student.parentEmail ?? '');
  const [savingParentEmail, setSavingParentEmail] = useState(false);

  const submitParentEmail = useCallback(async () => {
    if (savingParentEmail) return;
    const email = parentEmailInput.trim();
    if (email && !EMAIL_RE.test(email)) {
      showMessage('Geçersiz e-posta', 'Geçerli bir veli e-posta adresi gir.');
      return;
    }
    setSavingParentEmail(true);
    try {
      const updated = await patchMe({ parentEmail: email || null });
      setUser(updated);
      setEditingParentEmail(false);
    } catch (err) {
      showError(err, { title: 'Kaydedilemedi', code: 'PARENT_EMAIL_SAVE' });
    } finally {
      setSavingParentEmail(false);
    }
  }, [savingParentEmail, parentEmailInput, setUser, showMessage, showError]);

  const confirmDelete = useCallback(() => setDeleteDialogOpen(true), []);

  const deleteNow = useCallback(async () => {
    setDeleteDialogOpen(false);
    try {
      await deleteAccount();
    } catch (err) {
      showError(err, { title: 'Hesap silinemedi', code: 'ACCOUNT_DELETE' });
      return;
    }
    await signOut();
    router.replace('/login');
  }, [signOut, router, showError]);

  return (
    <Screen>
      <ScreenHeader title="Ayarlar" subtitle="Hesabını ve tercihlerini yönet" onBack={() => router.back()} />

      {/* Hesap */}
      <View style={styles.section}>
        <SectionLabel>Hesap</SectionLabel>
        <Card style={styles.list}>
          <SettingRow icon="mail-outline" label="E-posta" trailing={student.email ?? '—'} />
          <PressScale onPress={() => setEditingParentEmail((c) => !c)}>
            <SettingRow
              icon="people-outline"
              label="Veli E-postası"
              trailing={editingParentEmail ? undefined : (student.parentEmail ?? 'Ekle')}
              chevron
            />
          </PressScale>

          {editingParentEmail ? (
            <View style={styles.passwordForm}>
              <TextField
                value={parentEmailInput}
                onChangeText={setParentEmailInput}
                placeholder="veli@ornek.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Txt variant="small" color={Palette.textDim}>
                İlerleme raporların bu adrese gönderilebilir.
              </Txt>
              <NeonButton
                label={savingParentEmail ? 'Kaydediliyor…' : 'Kaydet'}
                color={Accent}
                disabled={savingParentEmail}
                onPress={submitParentEmail}
                full
              />
            </View>
          ) : null}

          <PressScale onPress={() => setChangingPassword((c) => !c)}>
            <SettingRow icon="lock-closed-outline" label="Parolayı Değiştir" chevron />
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
              <NeonButton
                label={savingPassword ? 'Kaydediliyor…' : 'Parolayı Güncelle'}
                color={Accent}
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
        <SectionLabel>Bildirim Tercihleri</SectionLabel>
        <Card style={styles.list}>
          <SettingRow
            icon="clipboard-outline"
            label="Görev bildirimleri"
            control={
              <SettingsSwitch
                value={prefs.taskNotifs}
                onValueChange={(v) => togglePref('taskNotifs', v)}
              />
            }
          />
          <SettingRow
            icon="flame-outline"
            label="Seri hatırlatmaları"
            control={
              <SettingsSwitch
                value={prefs.streakNotifs}
                onValueChange={(v) => togglePref('streakNotifs', v)}
              />
            }
          />
          <SettingRow
            icon="megaphone-outline"
            label="Uygulama duyuruları"
            control={
              <SettingsSwitch
                value={prefs.announcements}
                onValueChange={(v) => togglePref('announcements', v)}
              />
            }
          />
        </Card>
      </View>

      {/* Uygulama */}
      <View style={styles.section}>
        <SectionLabel>Uygulama</SectionLabel>
        <Card style={styles.list}>
          <SettingRow
            icon="volume-high-outline"
            label="Ses efektleri"
            control={
              <SettingsSwitch value={prefs.sound} onValueChange={(v) => togglePref('sound', v)} />
            }
          />
          <SettingRow
            icon="phone-portrait-outline"
            label="Titreşim"
            control={
              <SettingsSwitch value={prefs.haptics} onValueChange={(v) => togglePref('haptics', v)} />
            }
          />
        </Card>
      </View>

      {/* Destek ve yasal */}
      <View style={styles.section}>
        <SectionLabel>Destek ve Yasal</SectionLabel>
        <Card style={styles.list}>
          <PressScale onPress={() => router.push('/help')}>
            <SettingRow icon="help-circle-outline" label="Yardım & Destek" chevron />
          </PressScale>
          <PressScale onPress={() => router.push('/privacy-policy')}>
            <SettingRow icon="shield-checkmark-outline" label="Gizlilik Politikası" chevron />
          </PressScale>
          <PressScale onPress={() => router.push('/terms')}>
            <SettingRow icon="document-text-outline" label="Kullanım Şartları" chevron />
          </PressScale>
          <PressScale onPress={() => router.push('/data-disclosure')}>
            <SettingRow icon="reader-outline" label="Aydınlatma Metni" chevron />
          </PressScale>
          <PressScale onPress={() => router.push('/diagnostics')}>
            <SettingRow icon="bug-outline" label="Hata Kayıtları" chevron />
          </PressScale>
          <SettingRow icon="information-circle-outline" label="Sürüm" trailing="1.0.0" />
        </Card>
      </View>

      {/* Tehlikeli bolge */}
      <View style={styles.section}>
        <SectionLabel>Hesap İşlemleri</SectionLabel>
        <GhostButton
          label="Çıkış Yap"
          icon="log-out-outline"
          color={Palette.text}
          full
          onPress={async () => {
            await signOut();
            router.replace('/login');
          }}
        />
        <GhostButton label="Hesabı Sil" icon="trash-outline" color={Palette.text} full onPress={confirmDelete} />
      </View>

      <AppDialog
        visible={deleteDialogOpen}
        icon="trash-outline"
        title="Hesabını silmek istiyor musun?"
        message="Bu işlem geri alınamaz. Tüm görevlerin, soruların ve odak geçmişin kalıcı olarak silinir."
        cancelLabel="Vazgeç"
        confirmLabel="Hesabı Sil"
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={deleteNow}
      />
    </Screen>
  );
}

const SWITCH_TRACK = { false: Palette.border, true: Accent };

function SettingsSwitch({ value, onValueChange }: { value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={SWITCH_TRACK}
      thumbColor={Palette.surface}
      ios_backgroundColor={Palette.border}
    />
  );
}

function SettingRow({
  icon,
  label,
  trailing,
  chevron,
  control,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  trailing?: string;
  chevron?: boolean;
  control?: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <IconBubble name={icon} color={DetailAccent} size={36} />
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
