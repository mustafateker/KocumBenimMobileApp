import type { ErrorBoundaryProps } from 'expo-router';
import { useMemo } from 'react';

import { CrashScreen } from './crash-screen';

import { logFatalError } from '@/lib/crash-reporter';

/**
 * Render sirasinda olusan hatalari yakalar. Onceden bu hatalar uygulamayi
 * sessizce kapatiyordu; artik kullanici bir hata kodu goruyor, kayit da
 * Ayarlar > Hata Kayitlari listesine dusuyor.
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
