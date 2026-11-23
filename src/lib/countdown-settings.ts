import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'kocumbenim.setting.showExamCountdown.v1';

let cachedEnabled: boolean | null = null;
const listeners = new Set<(enabled: boolean) => void>();

function notifyListeners(val: boolean) {
  cachedEnabled = val;
  listeners.forEach((listener) => {
    try {
      listener(val);
    } catch {
      // sessizce devam
    }
  });
}

export async function getShowExamCountdown(): Promise<boolean> {
  if (cachedEnabled !== null) {
    return cachedEnabled;
  }
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEY);
    if (val === null) {
      cachedEnabled = true;
      return true;
    }
    const parsed = val === 'true';
    cachedEnabled = parsed;
    return parsed;
  } catch {
    cachedEnabled = true;
    return true;
  }
}

export async function setShowExamCountdown(enabled: boolean): Promise<void> {
  notifyListeners(enabled);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {
    // sessizce devam
  }
}

export function useShowExamCountdown() {
  const [enabled, setEnabled] = useState<boolean>(() => (cachedEnabled !== null ? cachedEnabled : true));
  const [loading, setLoading] = useState<boolean>(() => cachedEnabled === null);

  useEffect(() => {
    let mounted = true;

    const onUpdate = (val: boolean) => {
      if (mounted) {
        setEnabled(val);
        setLoading(false);
      }
    };
    listeners.add(onUpdate);

    getShowExamCountdown().then((val) => {
      if (mounted) {
        setEnabled(val);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      listeners.delete(onUpdate);
    };
  }, []);

  const update = useCallback(async (nextVal: boolean) => {
    await setShowExamCountdown(nextVal);
  }, []);

  return { enabled, loading, setEnabled: update };
}
