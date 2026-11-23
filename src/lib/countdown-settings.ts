import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'kocumbenim.setting.showExamCountdown.v1';

export async function getShowExamCountdown(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEY);
    if (val === null) return true; // Varsayılan olarak açık
    return val === 'true';
  } catch {
    return true;
  }
}

export async function setShowExamCountdown(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {
    // sessizce devam
  }
}

export function useShowExamCountdown() {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    getShowExamCountdown().then((val) => {
      if (mounted) {
        setEnabled(val);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const update = useCallback(async (nextVal: boolean) => {
    setEnabled(nextVal);
    await setShowExamCountdown(nextVal);
  }, []);

  return { enabled, loading, setEnabled: update };
}
