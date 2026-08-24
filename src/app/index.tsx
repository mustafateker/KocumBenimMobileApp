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

  switch (user.role) {
    case 'student':
      return <Redirect href="/student" />;
    case 'teacher':
      return <Redirect href="/teacher" />;
    case 'parent':
      return <Redirect href="/parent" />;
  }
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.bg,
  },
});
