import type { ErrorBoundaryProps } from 'expo-router';
import { useMemo } from 'react';

import { CrashScreen } from './crash-screen';

import { logFatalError } from '@/lib/crash-reporter';

/**
 * Render sirasinda olusan hatalari yakalar; kullanici bir hata kodu gorur, kayit da
 * Ayarlar > Hata Kayitlari listesine duser.
 *
 * `useMemo` bilerek: ayni hata icin ikinci bir render kaydi cogaltmasin.
 */
export function AppErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const entry = useMemo(() => logFatalError('RENDER_ERROR', error), [error]);

  return (
    <CrashScreen
      code={entry.code}
      message={entry.message}
      stack={entry.stack}
      onRetry={() => {
        retry();
      }}
    />
  );
}
