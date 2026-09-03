import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

/**
 * Cihazda saklanan basit acik/kapali tercih — bildirim/ses/titresim gibi
 * sunucu gerektirmeyen ayarlar icin. Ilk render varsayilan degeri gosterir,
 * depolanan deger okunur okunmaz guncellenir.
 */
export function useLocalPref(key: string, defaultValue: boolean): [boolean, (v: boolean) => void] {
  const storageKey = `kocumbenim.pref.${key}`;
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(storageKey).then((stored) => {
      if (!cancelled && stored !== null) setValue(stored === '1');
    });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  const update = useCallback(
    (v: boolean) => {
      setValue(v);
      AsyncStorage.setItem(storageKey, v ? '1' : '0').catch(() => {});
    },
    [storageKey]
  );

  return [value, update];
}
