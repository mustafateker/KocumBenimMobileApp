import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cokme/hata gunlugu.
 *
 * Uygulama "dumduz kapaniyordu": yakalanmayan bir JS hatasi surumu
 * derlemelerinde hicbir iz birakmadan sureci sonlandiriyor. Burada uc katman
 * var:
 *
 *  1. `installCrashReporter()` — React'in disinda kalan (olay isleyicileri,
 *     zamanlayicilar, async gorevler) yakalanmamis hatalari ErrorUtils'ten
 *     alir. Olumcul olanlari kaydeder, sonra orijinal isleyiciye devreder.
 *  2. `logHandledError()` — catch bloklarindan bilerek cagrilir; kullaniciya
 *     gosterilen hatanin bir kopyasi tanilama ekranina dusur.
 *  3. `src/app/_layout.tsx` icindeki ErrorBoundary — render sirasindaki
 *     hatalari yakalar ve beyaz ekran yerine kod iceren bir ekran gosterir.
 *
 * Kayitlar AsyncStorage'da halka tampon olarak durur, Ayarlar > Hata Kayitlari
 * ekranindan okunur. Native taraftaki cokmeler (kamera OOM gibi) JS'e hic
 * ulasmaz; onlar icin `adb logcat` gerekir.
 */

const STORAGE_KEY = 'kocumbenim.diagnostics.log';
const MAX_ENTRIES = 25;

export type CrashLogEntry = {
  /** Listede anahtar olarak kullanilir; zaman + sayac. */
  id: string;
  /** ISO zaman damgasi. */
  at: string;
  /** Kullaniciya okunacak kisa kod — destek isterken bunu soyler. */
  code: string;
  message: string;
  stack: string | null;
  /** Olumcul hatalar uygulamayi kapatir; digerleri sadece kaydedilir. */
  fatal: boolean;
};

/**
 * Bellek kopyasi: AsyncStorage yazimi asenkron oldugundan, cokme aninda
 * diske yetisemeyebiliriz. Hata ekrani kaydi buradan okur.
 */
let memoryLog: CrashLogEntry[] = [];
let loaded = false;
let counter = 0;

type GlobalErrorUtils = {
  getGlobalHandler?: () => ((error: unknown, isFatal?: boolean) => void) | undefined;
  setGlobalHandler?: (handler: (error: unknown, isFatal?: boolean) => void) => void;
};

function errorUtils(): GlobalErrorUtils | undefined {
  return (globalThis as { ErrorUtils?: GlobalErrorUtils }).ErrorUtils;
}

function nextId(): string {
  counter += 1;
  return `${Date.now()}-${counter}`;
}

function describe(error: unknown): { message: string; stack: string | null } {
  if (error instanceof Error) {
    return { message: error.message || error.name, stack: error.stack ?? null };
  }
  if (typeof error === 'string') return { message: error, stack: null };
  try {
    return { message: JSON.stringify(error), stack: null };
  } catch {
    return { message: String(error), stack: null };
  }
}

async function persist(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memoryLog));
  } catch {
    // Diske yazilamadiysa kayit en azindan bu oturum boyunca bellekte kalir.
  }
}

/** Yeni bir kayit ekler ve halka tamponu kirpar. Cagiran beklemek zorunda degil. */
function record(entry: CrashLogEntry): CrashLogEntry {
  memoryLog = [entry, ...memoryLog].slice(0, MAX_ENTRIES);
  persist();
  return entry;
}

/**
 * Yakalanmis bir hatayi gunluge yazar. `code` destek konusmalarinda gecen
 * kimliktir — ornegin 'CAMERA_CAPTURE', 'QUESTION_UPLOAD', API hata kodu.
 */
export function logHandledError(code: string, error: unknown): CrashLogEntry {
  const { message, stack } = describe(error);
  return record({ id: nextId(), at: new Date().toISOString(), code, message, stack, fatal: false });
}

/** ErrorBoundary'nin yakaladigi render hatasi. */
export function logFatalError(code: string, error: unknown): CrashLogEntry {
  const { message, stack } = describe(error);
  return record({ id: nextId(), at: new Date().toISOString(), code, message, stack, fatal: true });
}

/**
 * ErrorUtils'e baglanir. Uygulama acilisinda bir kez cagrilmali; ikinci cagri
 * kendi isleyicimizi kendisine zincirlemesin diye korumali.
 */
let installed = false;

export function installCrashReporter(): void {
  if (installed) return;
  const utils = errorUtils();
  if (!utils?.setGlobalHandler) return;
  installed = true;

  const previous = utils.getGlobalHandler?.();

  utils.setGlobalHandler((error, isFatal) => {
    const { message, stack } = describe(error);
    record({
      id: nextId(),
      at: new Date().toISOString(),
      code: isFatal ? 'FATAL_JS' : 'UNCAUGHT_JS',
      message,
      stack,
      fatal: !!isFatal,
    });
    // Gelistirme modundaki kirmizi ekran ve Metro gunlugu korunsun.
    previous?.(error, isFatal);
  });
}

/** Tanilama ekrani icin: diskteki kayitlari bellek kopyasiyla birlestirir. */
export async function readCrashLog(): Promise<CrashLogEntry[]> {
  if (!loaded) {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const stored = raw ? (JSON.parse(raw) as CrashLogEntry[]) : [];
      const seen = new Set(memoryLog.map((e) => e.id));
      memoryLog = [...memoryLog, ...stored.filter((e) => !seen.has(e.id))]
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, MAX_ENTRIES);
    } catch {
      // Bozuk/okunamayan kayit listesi ekrani bosaltsin, patlatmasin.
    }
    loaded = true;
  }
  return memoryLog;
}

export async function clearCrashLog(): Promise<void> {
  memoryLog = [];
  loaded = true;
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silinemediyse bir sonraki denemede tekrar denenir.
  }
}
