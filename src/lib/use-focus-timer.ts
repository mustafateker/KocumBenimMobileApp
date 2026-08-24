import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'done';

type Options = {
  /** Sure dolunca cagrilir. actualSec, gercekte odaklanilan saniye. */
  onComplete: (info: { plannedSec: number; actualSec: number; startedAt: string }) => void;
};

/**
 * Odak zamanlayicisi.
 *
 * Gecen sure duvar saatinden hesaplanir (interval saymaz), boylece
 * uygulama arka plana atildiginda veya ekran kilitlendiginde sure kaymaz.
 */
export function useFocusTimer({ onComplete }: Options) {
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [plannedSec, setPlannedSec] = useState(25 * 60);
  const [elapsedSec, setElapsedSec] = useState(0);

  /** Halka animasyonu JS render'ina bagli kalmasin diye ayri tutulur. */
  const progress = useSharedValue(0);

  const segmentStartRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const startedAtRef = useRef<string | null>(null);
  const plannedRef = useRef(plannedSec);
  const completedRef = useRef(false);

  // Aralik geri cagirmasi guncel hedefi gorsun diye state'i ref'e yansitiriz;
  // yazma render sirasinda degil efektte yapilir.
  useEffect(() => {
    plannedRef.current = plannedSec;
  }, [plannedSec]);

  const currentElapsed = useCallback(() => {
    const live = segmentStartRef.current ? (Date.now() - segmentStartRef.current) / 1000 : 0;
    return accumulatedRef.current + live;
  }, []);

  /** Oturumu kapatir ve gercekte odaklanilan saniyeyi dondurur. */
  const finish = useCallback(
    (reason: 'done' | 'cancel') => {
      const actual = Math.floor(currentElapsed());
      const planned = plannedRef.current;
      const startedAt = startedAtRef.current;

      segmentStartRef.current = null;
      accumulatedRef.current = 0;
      startedAtRef.current = null;
      setElapsedSec(0);
      // Reanimated paylasilan degerleri mutasyon icin tasarlandi; React
      // Compiler'in degismezlik kurali bu kullanimi tanimiyor.
      // eslint-disable-next-line react-hooks/immutability
      progress.value = 0;
      setStatus('idle');

      // Yanlislikla dokunmalari kayit altina almamak icin cok kisa
      // oturumlar (30 sn alti) atilir.
      if (startedAt && actual >= 30) {
        onComplete({ plannedSec: planned, actualSec: actual, startedAt });
      }
      return actual;
    },
    [currentElapsed, onComplete, progress]
  );

  /* Saniye tik'i — yalnizca calisirken doner. */
  useEffect(() => {
    if (status !== 'running') return;

    const tick = () => {
      const elapsed = currentElapsed();
      setElapsedSec(Math.floor(elapsed));
      // eslint-disable-next-line react-hooks/immutability
      progress.value = Math.min(1, elapsed / plannedRef.current);

      if (elapsed >= plannedRef.current && !completedRef.current) {
        completedRef.current = true;
        finish('done');
      }
    };

    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [status, currentElapsed, finish, progress]);

  /* Arka plandan donunce ekrani hemen guncelle. */
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active' && status === 'running') {
        setElapsedSec(Math.floor(currentElapsed()));
      }
    });
    return () => sub.remove();
  }, [status, currentElapsed]);

  const start = useCallback(
    (seconds: number) => {
      completedRef.current = false;
      accumulatedRef.current = 0;
      segmentStartRef.current = Date.now();
      startedAtRef.current = new Date().toISOString();
      setPlannedSec(seconds);
      plannedRef.current = seconds;
      setElapsedSec(0);
      // eslint-disable-next-line react-hooks/immutability
      progress.value = 0;
      setStatus('running');
    },
    [progress]
  );

  const pause = useCallback(() => {
    if (status !== 'running') return;
    accumulatedRef.current = currentElapsed();
    segmentStartRef.current = null;
    setStatus('paused');
  }, [status, currentElapsed]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    segmentStartRef.current = Date.now();
    setStatus('running');
  }, [status]);

  /** Erken bitis: o ana kadarki sure yine de kaydedilir; gecen saniye doner. */
  const stop = useCallback(() => finish('cancel'), [finish]);

  return {
    status,
    plannedSec,
    elapsedSec,
    remainingSec: Math.max(0, plannedSec - elapsedSec),
    progress,
    start,
    pause,
    resume,
    stop,
    setPlannedSec,
  };
}
