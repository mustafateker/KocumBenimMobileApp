import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GhostButton } from '@/components/button';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, EmptyState, Pill, Txt } from '@/components/ui';
import { clearCrashLog, readCrashLog, type CrashLogEntry } from '@/lib/crash-reporter';
import { Palette, Radius, Space } from '@/theme/tokens';

/**
 * Hata kayitlari. "Uygulama dumduz kapaniyor, hata kodu yok" sikayetinin
 * karsiligi: her yakalanan hata burada kodu, zamani ve teknik detayiyla
 * duruyor, destekle paylasilabiliyor.
 */
export default function Diagnostics() {
  const router = useRouter();
  const [entries, setEntries] = useState<CrashLogEntry[]>([]);

  const load = useCallback(() => {
    readCrashLog().then(setEntries);
  }, []);

  useFocusEffect(load);

  const clear = useCallback(async () => {
    await clearCrashLog();
    setEntries([]);
  }, []);

  return (
    <Screen tint={Palette.pink}>
      <ScreenHeader
        title="Hata Kayıtları"
        subtitle="Son 25 hata — destekle paylaşmak için"
        onBack={() => router.back()}
      />

      {entries.length === 0 ? (
        <EmptyState
          icon="shield-checkmark-outline"
          title="Kayıtlı hata yok"
          subtitle="Uygulama bir hatayla karşılaşırsa kodu ve detayı burada birikir."
          color={Palette.green}
        />
      ) : (
        <>
          <View style={styles.list}>
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </View>
          <GhostButton label="Kayıtları Temizle" icon="trash-outline" color={Palette.pink} full onPress={clear} />
        </>
      )}
    </Screen>
  );
}

function EntryCard({ entry }: { entry: CrashLogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const color = entry.fatal ? Palette.pink : Palette.gold;

  return (
    <Card accent={color} style={styles.card}>
      <View style={styles.head}>
        <Pill label={entry.code} color={color} icon={entry.fatal ? 'alert-circle' : 'warning'} />
        <Txt variant="tiny" color={Palette.textFaint}>
          {formatTimestamp(entry.at)}
        </Txt>
      </View>

      <Txt variant="small">{entry.message}</Txt>

      {entry.stack ? (
        <Txt variant="tiny" color={Palette.purple} onPress={() => setExpanded((e) => !e)}>
          {expanded ? 'Detayı gizle' : 'Teknik detayı göster'}
        </Txt>
      ) : null}

      {expanded && entry.stack ? (
        <View style={styles.stackBox}>
          <Txt variant="tiny" color={Palette.textDim}>
            {entry.stack.slice(0, 1500)}
          </Txt>
        </View>
      ) : null}
    </Card>
  );
}

/** Kayit zamani — gun/ay saat:dakika. */
function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  list: {
    gap: Space.md,
  },
  card: {
    gap: Space.sm,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.sm,
  },
  stackBox: {
    padding: Space.md,
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceHi,
  },
});
