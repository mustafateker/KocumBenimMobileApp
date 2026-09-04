import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useSession } from '@/lib/session';
import { Palette } from '@/theme/tokens';

/** Giris kapisi: kayitli oturum varsa rolun ana ekranina, yoksa girise. */
export default function Index() {
  const { user, loading } = useSession();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Palette.blue} />
      </View>
    );
  }

  if (!user) return <Redirect href="/login" />;

  if (user.role === 'student') {
    if (!user.onboardingCompletedAt) return <Redirect href="/onboarding" />;
    return <Redirect href="/student" />;
  }

  // Ogretmen/veli girisi su an bu mobil uygulamada yok (ayri web panel planlaniyor).
  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.bg,
  },
});
