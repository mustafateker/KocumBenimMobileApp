import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { AppDialog } from '@/components/app-dialog';

import { logHandledError } from './crash-reporter';
import { describeError } from './error-messages';

type DialogCopy = { title: string; message: string };

type ErrorDialogValue = {
  /** Dogrulama gibi kullaniciya dogrudan soylenecek mesaj. */
  showMessage: (title: string, message: string) => void;
  /**
   * Yakalanan bir hatayi gunluge yazar ve ortak pop-up ile gosterir.
   * `code` Ayarlar > Hata Kayitlari'nda gorunen kimliktir.
   */
  showError: (err: unknown, options: { title: string; code: string }) => void;
};

const ErrorDialogContext = createContext<ErrorDialogValue | null>(null);

/** Ayni mesajin arka arkaya (ornegin cevrimdisiyken birden fazla yukleme) gelmesini engeller. */
const REPEAT_WINDOW_MS = 8000;

export function ErrorDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogCopy | null>(null);
  const lastShown = useRef<{ key: string; at: number } | null>(null);

  const open = useCallback((copy: DialogCopy) => {
    const key = `${copy.title}|${copy.message}`;
    const now = Date.now();
    if (lastShown.current?.key === key && now - lastShown.current.at < REPEAT_WINDOW_MS) return;
    lastShown.current = { key, at: now };
    setDialog((current) => current ?? copy);
  }, []);

  const showMessage = useCallback((title: string, message: string) => open({ title, message }), [open]);

  const showError = useCallback(
    (err: unknown, options: { title: string; code: string }) => {
      logHandledError(options.code, err);
      open(describeError(err, options.title));
    },
    [open]
  );

  const value = useMemo(() => ({ showMessage, showError }), [showMessage, showError]);

  return (
    <ErrorDialogContext.Provider value={value}>
      {children}
      <AppDialog
        visible={dialog !== null}
        icon="alert-circle-outline"
        title={dialog?.title ?? ''}
        message={dialog?.message ?? ''}
        confirmLabel="Tamam"
        onConfirm={() => setDialog(null)}
      />
    </ErrorDialogContext.Provider>
  );
}

export function useErrorDialog(): ErrorDialogValue {
  const ctx = useContext(ErrorDialogContext);
  if (!ctx) throw new Error('useErrorDialog, ErrorDialogProvider icinde kullanilmali');
  return ctx;
}
