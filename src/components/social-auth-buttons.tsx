import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { PressScale } from '@/components/button';
import { Txt } from '@/components/ui';
import { Border, Font, OnboardingPalette, Palette, Radius, Space } from '@/theme/tokens';

type SocialAuthButtonsProps = {
  mode: 'login' | 'signup';
  loadingProvider?: 'google' | 'apple' | null;
  disabled?: boolean;
  onApplePress?: () => void;
  onGooglePress?: () => void;
};

/**
 * Resmi Google 4 renkli "G" SVG ikonu.
 */
function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Mavi: Sag kol ve dis yay */}
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      {/* Yesil: Alt yay */}
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      {/* Sari: Sol yay */}
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      {/* Kirmizi: Ust yay */}
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </Svg>
  );
}

export function SocialAuthButtons({
  mode,
  loadingProvider,
  disabled = false,
  onApplePress,
  onGooglePress,
}: SocialAuthButtonsProps) {
  const isApple = Platform.OS === 'ios';
  const actionLabel = mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol';

  return (
    <View style={styles.container}>
      {/* "veya" Ayraci */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Txt variant="tiny" color={OnboardingPalette.textFaint} style={styles.dividerText}>
          veya
        </Txt>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.buttonList}>
        {/* iOS tarafinda en ustte Apple ile Giris / Kayit butonu */}
        {isApple && (
          <PressScale
            onPress={onApplePress}
            disabled={disabled || loadingProvider != null}
            scaleTo={0.98}
            style={[styles.socialButton, styles.appleButton, disabled && styles.buttonDisabled]}
          >
            {loadingProvider === 'apple' ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.buttonInner}>
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" style={styles.iconOffset} />
                <Txt style={styles.appleText}>{`Apple ile ${actionLabel}`}</Txt>
              </View>
            )}
          </PressScale>
        )}

        {/* Google ile Giris / Kayit butonu (Android'de tek, iOS'ta Apple'in altinda) */}
        <PressScale
          onPress={onGooglePress}
          disabled={disabled || loadingProvider != null}
          scaleTo={0.98}
          style={[styles.socialButton, styles.googleButton, disabled && styles.buttonDisabled]}
        >
          {loadingProvider === 'google' ? (
            <ActivityIndicator color={Palette.text} size="small" />
          ) : (
            <View style={styles.buttonInner}>
              <GoogleIcon size={19} />
              <Txt style={styles.googleText}>{`Google ile ${actionLabel}`}</Txt>
            </View>
          )}
        </PressScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Space.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    marginVertical: Space.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: OnboardingPalette.border,
  },
  dividerText: {
    fontFamily: Font.medium,
    letterSpacing: 0.3,
  },
  buttonList: {
    gap: Space.sm,
  },
  socialButton: {
    height: 50,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Space.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  iconOffset: {
    marginBottom: 2,
  },
  appleButton: {
    backgroundColor: '#000000',
    borderWidth: Border.thin,
    borderColor: '#1A1836',
  },
  appleText: {
    color: '#FFFFFF',
    fontFamily: Font.bold,
    fontSize: 15,
    letterSpacing: -0.2,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: OnboardingPalette.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  googleText: {
    color: '#2D2B52',
    fontFamily: Font.bold,
    fontSize: 15,
    letterSpacing: -0.2,
  },
});
