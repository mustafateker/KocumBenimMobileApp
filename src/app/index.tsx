import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useSession } from '@/lib/session';
import { Palette } from '@/theme/tokens';

/** Giris kapisi: kayitli oturum varsa rolun ana ekranina, yoksa girise. */
export default function Index() {
  const { user, loading, signOut } = useSession();

  useEffect(() => {
    if (!loading && user && user.role !== 'student') {
      signOut();
    }
  }, [loading, user, signOut]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Palette.blue} />
      </View>
    );
  }

  if (!user || user.role !== 'student') return <Redirect href="/login" />;

  if (!user.onboardingCompletedAt) return <Redirect href="/onboarding" />;
  return <Redirect href="/student" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.bg,
  },
});
