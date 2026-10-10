import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplash } from '@/components/animated-splash';
import { AppErrorBoundary } from '@/components/app-error-boundary';
import { installCrashReporter } from '@/lib/crash-reporter';
import { ErrorDialogProvider } from '@/lib/error-dialog';
import { NotificationCenterProvider } from '@/lib/notification-center';
import { SessionProvider } from '@/lib/session';
import { Accent, Brand, Palette } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});
// Native ekran, uzerine binen JS katmaniyla yumusak devrolsun.
SplashScreen.setOptions({ fade: true, duration: 250 });

// Ilk render'dan once takilmali: React agacinin disinda olusan yakalanmamis
// hatalari da (zamanlayici, olay isleyicisi) kayit altina alir.
installCrashReporter();

/** Kok yigindaki bir hata bu ekrani gosterir — beyaz ekran/sessiz kapanma yerine. */
export { AppErrorBoundary as ErrorBoundary };

/** Uygulamanin sicak notr temasini navigasyon katmanina da uygula. */
const NavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Palette.bg,
    card: Palette.surface,
    text: Palette.text,
    border: Palette.border,
    primary: Accent,
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  /** JS acilis katmani; kendi animasyonu bitince kendini kaldirir. */
  const [splashVisible, setSplashVisible] = useState(true);

  const onReady = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const dismissSplash = useCallback(() => setSplashVisible(false), []);

  if (!fontsLoaded) {
    // Yazi tipleri gelene kadar native acilis ekrani ustte kalir; buradaki
    // zemin onun rengiyle ayni olsun ki bir kare bile beyaz parlamasin.
    return <View style={styles.booting} />;
  }

  return (
    <GestureHandlerRootView style={styles.root} onLayout={onReady}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <ErrorDialogProvider>
            <SessionProvider>
              <NotificationCenterProvider>
                <ThemeProvider value={NavTheme}>
                  <StatusBar style={splashVisible ? 'light' : 'dark'} />
                  <Stack
                    // Tek tek ekranlarda olusan render hatalari da uygulamayi
                    // kapatmak yerine hata kodlu ekrana dussun.
                    unstable_screenErrorBoundary={AppErrorBoundary}
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: Palette.bg },
                      animation: 'fade',
                    }}
                  >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="login" />
                    <Stack.Screen name="signup" />
                    <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
                    <Stack.Screen name="student" />
                    <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
                    <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
                    <Stack.Screen name="diagnostics" options={{ animation: 'slide_from_right' }} />
                    <Stack.Screen name="lessons" options={{ animation: 'slide_from_right' }} />
                    <Stack.Screen name="stats" options={{ animation: 'slide_from_right' }} />
                    <Stack.Screen
                      name="annotate"
                      options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
                    />
                    <Stack.Screen
                      name="focus"
                      options={{ presentation: 'fullScreenModal', animation: 'fade', gestureEnabled: false }}
                    />
                  </Stack>
                </ThemeProvider>
              </NotificationCenterProvider>
            </SessionProvider>
          </ErrorDialogProvider>
        </SafeAreaProvider>
      </KeyboardProvider>

      {splashVisible ? <AnimatedSplash onFinish={dismissSplash} /> : null}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.bg },
  booting: { flex: 1, backgroundColor: Brand.bg },
});
