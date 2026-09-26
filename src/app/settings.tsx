import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';

import { GhostButton, NeonButton, PressScale } from '@/components/button';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, IconBubble, TextField, Txt } from '@/components/ui';
import { changePassword, deleteAccount, getPreferences, patchMe, patchPreferences } from '@/lib/api';
import { ApiError } from '@/lib/api-client';
import { useSession, useStudent } from '@/lib/session';
import type { Preferences } from '@/lib/types';
import { Accent, Palette, Space } from '@/theme/tokens';

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

  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);

  useEffect(() => {
    getPreferences()
      .then(setPrefs)
      .catch(() => {
        // Aglama hatasi ekrani bozmasin; varsayilan degerler kalir.
      });
  }, []);

  const togglePref = useCallback((key: keyof Preferences, value: boolean) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    patchPreferences({ [key]: value }).catch(() => {
      // Sunucuya yazilamadiysa bir sonraki acilista eski deger geri gelir.
    });
  }, []);

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
      await changePassword(currentPassword, newPassword);
      setChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordError(err instanceof ApiError ? 'Mevcut parola hatalı.' : 'Bir hata oluştu, tekrar dene.');
    } finally {
      setSavingPassword(false);
    }
  }, [savingPassword, newPassword, currentPassword]);

  const [editingParentEmail, setEditingParentEmail] = useState(false);
  const [parentEmailInput, setParentEmailInput] = useState(student.parentEmail ?? '');
  const [parentEmailError, setParentEmailError] = useState<string | null>(null);
  const [savingParentEmail, setSavingParentEmail] = useState(false);

  const submitParentEmail = useCallback(async () => {
    if (savingParentEmail) return;
    setSavingParentEmail(true);
    setParentEmailError(null);
    try {
      const updated = await patchMe({ parentEmail: parentEmailInput.trim() || null });
      setUser(updated);
      setEditingParentEmail(false);
    } catch {
      setParentEmailError('Kaydedilemedi, tekrar dene.');
    } finally {
      setSavingParentEmail(false);
    }
  }, [savingParentEmail, parentEmailInput, setUser]);

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
            await deleteAccount();
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  }, [signOut, router]);

  return (
    <Screen tint={Palette.text}>
      <ScreenHeader title="Ayarlar" subtitle="Hesabını ve tercihlerini yönet" onBack={() => router.back()} />

      {/* Hesap */}
      <View style={styles.section}>
        <Txt variant="smallStrong" color={Palette.textDim}>
          Hesap
        </Txt>
        <Card style={styles.list}>
          <SettingRow icon="mail-outline" color={Accent} label="E-posta" trailing={student.email ?? '—'} />
          <PressScale onPress={() => setEditingParentEmail((c) => !c)}>
            <SettingRow
              icon="people-outline"
              color={Accent}
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
              {parentEmailError ? (
                <Txt variant="small" color={Palette.pink}>
                  {parentEmailError}
                </Txt>
              ) : (
                <Txt variant="small" color={Palette.textDim}>
                  İlerleme raporların bu adrese gönderilebilir.
                </Txt>
              )}
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
            <SettingRow icon="lock-closed-outline" color={Accent} label="Parolayı Değiştir" chevron />
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
        <Txt variant="smallStrong" color={Palette.textDim}>
          Bildirim Tercihleri
        </Txt>
        <Card style={styles.list}>
          <SettingRow
            icon="clipboard-outline"
            color={Accent}
            label="Görev bildirimleri"
            control={
              <Switch
                value={prefs.taskNotifs}
                onValueChange={(v) => togglePref('taskNotifs', v)}
                trackColor={SWITCH_TRACK}
              />
            }
          />
          <SettingRow
            icon="flame-outline"
            color={Accent}
            label="Seri hatırlatmaları"
            control={
              <Switch
                value={prefs.streakNotifs}
                onValueChange={(v) => togglePref('streakNotifs', v)}
                trackColor={SWITCH_TRACK}
              />
            }
          />
          <SettingRow
            icon="megaphone-outline"
            color={Accent}
            label="Uygulama duyuruları"
            control={
              <Switch
                value={prefs.announcements}
                onValueChange={(v) => togglePref('announcements', v)}
                trackColor={SWITCH_TRACK}
              />
            }
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
            color={Accent}
            label="Ses efektleri"
            control={
              <Switch value={prefs.sound} onValueChange={(v) => togglePref('sound', v)} trackColor={SWITCH_TRACK} />
            }
          />
          <SettingRow
            icon="phone-portrait-outline"
            color={Accent}
            label="Titreşim"
            control={
              <Switch
                value={prefs.haptics}
                onValueChange={(v) => togglePref('haptics', v)}
                trackColor={SWITCH_TRACK}
              />
            }
          />
        </Card>
      </View>

      {/* Destek ve yasal */}
      <View style={styles.section}>
        <Txt variant="smallStrong" color={Palette.textDim}>
          Destek ve Yasal
        </Txt>
        <Card style={styles.list}>
          <PressScale onPress={() => router.push('/help')}>
            <SettingRow icon="help-circle-outline" color={Accent} label="Yardım & Destek" chevron />
          </PressScale>
          <PressScale onPress={() => router.push('/privacy-policy')}>
            <SettingRow icon="shield-checkmark-outline" color={Palette.textDim} label="Gizlilik Politikası" chevron />
          </PressScale>
          <PressScale onPress={() => router.push('/terms')}>
            <SettingRow icon="document-text-outline" color={Palette.textDim} label="Kullanım Şartları" chevron />
          </PressScale>
          <PressScale onPress={() => router.push('/data-disclosure')}>
            <SettingRow icon="reader-outline" color={Palette.textDim} label="Aydınlatma Metni" chevron />
          </PressScale>
          <PressScale onPress={() => router.push('/diagnostics')}>
            <SettingRow icon="bug-outline" color={Palette.textDim} label="Hata Kayıtları" chevron />
          </PressScale>
          <SettingRow icon="information-circle-outline" color={Palette.textDim} label="Sürüm" trailing="1.0.0" />
        </Card>
      </View>

      {/* Tehlikeli bolge */}
      <View style={styles.section}>
        <Txt variant="smallStrong" color={Palette.pink}>
          Hesap İşlemleri
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

const SWITCH_TRACK = { false: Palette.border, true: Accent };

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
