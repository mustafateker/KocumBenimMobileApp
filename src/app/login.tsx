import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, PressScale } from '@/components/button';
import { ScreenBackground } from '@/components/screen';
import { Txt } from '@/components/ui';
import { listUsers } from '@/db/repo';
import { initials, type Role, type User } from '@/db/types';
import { useSession } from '@/lib/session';
import { OnColor, Palette, Radius, Space, glow } from '@/theme/tokens';

const ROLES: { role: Role; label: string; icon: React.ComponentProps<typeof Ionicons>['name']; color: string }[] = [
  { role: 'student', label: 'Öğrenci', icon: 'rocket', color: Palette.purple },
  { role: 'teacher', label: 'Öğretmen', icon: 'school', color: Palette.orange },
  { role: 'parent', label: 'Veli', icon: 'heart', color: Palette.pink },
];

export default function Login() {
  const db = useSQLiteContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn } = useSession();

  const [role, setRole] = useState<Role>('student');
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const shake = useSharedValue(0);

  const accent = ROLES.find((r) => r.role === role)!.color;

  useEffect(() => {
    listUsers(db, role).then(setUsers);
  }, [db, role]);

  const changeRole = useCallback((next: Role) => {
    setRole(next);
    setSelected(null);
    setPin('');
    setError(false);
  }, []);

  const rejectPin = useCallback(() => {
    setError(true);
    setPin('');
    // Reanimated paylasilan degerleri mutasyon icin tasarlandi; React
    // Compiler'in degismezlik kurali bu kullanimi tanimiyor.
    // eslint-disable-next-line react-hooks/immutability
    shake.value = withSequence(
      withTiming(-9, { duration: 55 }),
      withTiming(9, { duration: 55 }),
      withTiming(-6, { duration: 55 }),
      withTiming(0, { duration: 55 })
    );
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  }, [shake]);

  const submit = useCallback(
    async (code: string) => {
      if (!selected) return;
      const ok = await signIn(selected.id, code);
      if (ok) {
        router.replace('/');
      } else {
        rejectPin();
      }
    },
    [selected, signIn, router, rejectPin]
  );

  const press = useCallback(
    (digit: string) => {
      setError(false);
      const next = (pin + digit).slice(0, 4);
      setPin(next);
      if (next.length === 4) submit(next);
    },
    [pin, submit]
  );

  return (
    <ScreenBackground tint={accent}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Space.xxl, paddingBottom: insets.bottom + Space.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Marka */}
        <View style={styles.brand}>
          <LinearGradient
            colors={[accent, Palette.purple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.logo, glow(accent, 0.5)]}
          >
            <Ionicons name="flash" size={34} color={OnColor} />
          </LinearGradient>
          <Txt variant="hero" center>
            Koçum Benim
          </Txt>
          <Txt variant="small" color={Palette.textDim} center>
            Odaklan, seviye atla, kazandığını harca.
          </Txt>
        </View>

        {/* Rol secimi */}
        <View style={styles.roles}>
          {ROLES.map((r) => {
            const active = r.role === role;
            return (
              <PressScale key={r.role} onPress={() => changeRole(r.role)} style={styles.roleWrap}>
                <View
                  style={[
                    styles.role,
                    active && {
                      backgroundColor: r.color + '22',
                      borderColor: r.color,
                      ...glow(r.color, 0.28),
                    },
                  ]}
                >
                  <Ionicons name={r.icon} size={18} color={active ? r.color : Palette.textFaint} />
                  <Txt variant="smallStrong" color={active ? r.color : Palette.textFaint}>
                    {r.label}
                  </Txt>
                </View>
              </PressScale>
            );
          })}
        </View>

        {selected ? (
          <PinPad
            user={selected}
            pin={pin}
            accent={accent}
            error={error}
            shake={shake}
            onDigit={press}
            onBack={() => {
              setSelected(null);
              setPin('');
              setError(false);
            }}
            onErase={() => {
              setError(false);
              setPin((p) => p.slice(0, -1));
            }}
          />
        ) : (
          <UserGrid
            users={users}
            accent={accent}
            onSelect={(u) => {
              setSelected(u);
              setPin('');
            }}
          />
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

/* --------------------------- kullanici secim izgarasi --------------------------- */

function UserGrid({
  users,
  accent,
  onSelect,
}: {
  users: User[];
  accent: string;
  onSelect: (u: User) => void;
}) {
  if (users.length === 0) {
    return (
      <View style={styles.emptyUsers}>
        <Txt variant="body" color={Palette.textDim} center>
          Bu rolde henüz kayıtlı kimse yok.
        </Txt>
        <Txt variant="small" color={Palette.textFaint} center>
          Öğretmen panelinden yeni öğrenci ekleyebilirsin.
        </Txt>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {users.map((u) => (
        <PressScale key={u.id} onPress={() => onSelect(u)} style={styles.gridItem}>
          <View style={styles.userCard}>
            <View style={[styles.avatar, { backgroundColor: accent + '1F', borderColor: accent + '44' }]}>
              <Txt variant="section" color={accent}>
                {initials(u.name)}
              </Txt>
            </View>
            <Txt variant="smallStrong" center numberOfLines={1}>
              {u.name}
            </Txt>
            {u.grade ? (
              <Txt variant="tiny" color={Palette.textFaint} center>
                {u.grade}
              </Txt>
            ) : null}
          </View>
        </PressScale>
      ))}
    </View>
  );
}

/* ---------------------------------- pin pad --------------------------------- */

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

function PinPad({
  user,
  pin,
  accent,
  error,
  shake,
  onDigit,
  onErase,
  onBack,
}: {
  user: User;
  pin: string;
  accent: string;
  error: boolean;
  shake: SharedValue<number>;
  onDigit: (d: string) => void;
  onErase: () => void;
  onBack: () => void;
}) {
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  return (
    <View style={styles.pinWrap}>
      <View style={styles.pinHead}>
        <IconButton icon="chevron-back" onPress={onBack} />
        <View style={styles.pinWho}>
          <Txt variant="section">{user.name}</Txt>
          <Txt variant="small" color={error ? Palette.pink : Palette.textDim}>
            {error ? 'Kod yanlış, tekrar dene' : '4 haneli kodunu gir'}
          </Txt>
        </View>
      </View>

      <Animated.View style={[styles.dots, shakeStyle]}>
        {[0, 1, 2, 3].map((i) => {
          const filled = i < pin.length;
          const color = error ? Palette.pink : accent;
          return (
            <View
              key={i}
              style={[
                styles.dot,
                filled && { backgroundColor: color, borderColor: color, ...glow(color, 0.4) },
                error && { borderColor: Palette.pink },
              ]}
            />
          );
        })}
      </Animated.View>

      <View style={styles.keypad}>
        {KEYS.map((key, i) => {
          if (key === '') return <View key={i} style={styles.key} />;

          const isDelete = key === 'del';
          return (
            <Pressable
              key={i}
              onPress={() => (isDelete ? onErase() : onDigit(key))}
              style={({ pressed }) => [
                styles.key,
                pressed && { backgroundColor: accent + '26', borderColor: accent + '66' },
              ]}
            >
              {isDelete ? (
                <Ionicons name="backspace-outline" size={22} color={Palette.textDim} />
              ) : (
                <Txt variant="section">{key}</Txt>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Space.lg,
    gap: Space.xl,
  },
  brand: {
    alignItems: 'center',
    gap: Space.sm,
  },
  logo: {
    width: 74,
    height: 74,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.sm,
  },
  roles: {
    flexDirection: 'row',
    gap: Space.sm,
  },
  roleWrap: { flex: 1 },
  role: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.md,
  },
  gridItem: {
    width: '31%',
    flexGrow: 1,
  },
  userCard: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: Space.lg,
    paddingHorizontal: Space.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyUsers: {
    gap: Space.sm,
    paddingVertical: Space.xxl,
  },
  pinWrap: {
    gap: Space.xl,
  },
  pinHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  pinWho: {
    flex: 1,
    gap: 2,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Space.lg,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Palette.border,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.md,
  },
  key: {
    width: '30%',
    flexGrow: 1,
    height: 62,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
});
