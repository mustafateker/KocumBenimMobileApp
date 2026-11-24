import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetch as expoFetch } from 'expo/fetch';

import { apiMediaUrl, getAccessToken } from '@/lib/api-client';
import { canUseAi, consumeAiQuota } from '@/lib/usage-limits';

const DAILY_HINT_LIMIT = 10;
const CIRCUIT_BREAKER_COOLDOWN_MS = 30 * 60 * 1000; // 30 dakika kota aşımı kilidi
const STORAGE_KEY_CIRCUIT_BREAKER = 'kocumbenim.aiHint.circuitBreakerUntil';
const STORAGE_KEY_DAILY_USAGE = 'kocumbenim.aiHint.dailyUsage';

function bytesToBase64(bytes: Uint8Array): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let base64 = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < len ? bytes[i + 1] : 0;
    const b3 = i + 2 < len ? bytes[i + 2] : 0;

    const n = (b1 << 16) | (b2 << 8) | b3;

    base64 += chars[(n >> 18) & 63];
    base64 += chars[(n >> 12) & 63];
    base64 += i + 1 < len ? chars[(n >> 6) & 63] : '=';
    base64 += i + 2 < len ? chars[n & 63] : '=';
  }
  return base64;
}

export async function checkCircuitBreaker(): Promise<{ tripped: boolean; remainingMinutes: number }> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_CIRCUIT_BREAKER);
    if (!raw) return { tripped: false, remainingMinutes: 0 };
    const until = Number(raw);
    const now = Date.now();
    if (now < until) {
      const remainingMinutes = Math.max(1, Math.ceil((until - now) / 60000));
      return { tripped: true, remainingMinutes };
    }
    await AsyncStorage.removeItem(STORAGE_KEY_CIRCUIT_BREAKER);
    return { tripped: false, remainingMinutes: 0 };
  } catch {
    return { tripped: false, remainingMinutes: 0 };
  }
}

export async function tripCircuitBreaker(): Promise<void> {
  try {
    const until = Date.now() + CIRCUIT_BREAKER_COOLDOWN_MS;
    await AsyncStorage.setItem(STORAGE_KEY_CIRCUIT_BREAKER, String(until));
  } catch {
    // sessizce devam
  }
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function checkDailyLimit(): Promise<{ exceeded: boolean; current: number; max: number }> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_DAILY_USAGE);
    const today = getTodayString();
    if (!raw) return { exceeded: false, current: 0, max: DAILY_HINT_LIMIT };
    const parsed = JSON.parse(raw) as { date: string; count: number };
    if (parsed.date !== today) {
      return { exceeded: false, current: 0, max: DAILY_HINT_LIMIT };
    }
    return {
      exceeded: parsed.count >= DAILY_HINT_LIMIT,
      current: parsed.count,
      max: DAILY_HINT_LIMIT,
    };
  } catch {
    return { exceeded: false, current: 0, max: DAILY_HINT_LIMIT };
  }
}

async function incrementDailyUsage(): Promise<void> {
  try {
    const today = getTodayString();
    const raw = await AsyncStorage.getItem(STORAGE_KEY_DAILY_USAGE);
    let count = 1;
    if (raw) {
      const parsed = JSON.parse(raw) as { date: string; count: number };
      if (parsed.date === today) {
        count = parsed.count + 1;
      }
    }
    await AsyncStorage.setItem(STORAGE_KEY_DAILY_USAGE, JSON.stringify({ date: today, count }));
  } catch {
    // sessizce devam
  }
}

export async function getCachedQuestionHint(questionId: number): Promise<string | null> {
  try {
    const cached = await AsyncStorage.getItem(`kocumbenim.aiHint.${questionId}`);
    if (cached && (cached.includes('üslü ifadeler') || cached.includes('denklemleştirmeyi'))) {
      await AsyncStorage.removeItem(`kocumbenim.aiHint.${questionId}`);
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

export async function clearCachedQuestionHint(questionId: number): Promise<void> {
  try {
    await AsyncStorage.removeItem(`kocumbenim.aiHint.${questionId}`);
  } catch {
    // sessizce devam
  }
}

export async function generateQuestionHint(options: {
  questionId: number;
  imageUrl?: string | null;
  note?: string;
  subject?: string;
  topic?: string;
  grade?: string;
  forceRefresh?: boolean;
  isPro?: boolean;
}): Promise<string> {
  const { questionId, imageUrl, note, subject = 'Ders', topic, grade = '8. Sınıf', forceRefresh = false, isPro = false } = options;

  if (!forceRefresh) {
    const cached = await getCachedQuestionHint(questionId);
    if (cached) return cached;
  } else {
    await clearCachedQuestionHint(questionId);
  }

  // Ortak günlük AI kotası kontrolü (Free: 1/gün, Pro: sınırsız)
  const canUse = await canUseAi(isPro);
  if (!canUse) {
    return 'Bugünkü yapay zeka kullanım hakkın doldu. Sınırsız soru ipuçları ve detaylı analizler için Koçum Pro\'ya geçebilirsin.';
  }

  // 1. Devre Kesici (Circuit Breaker) Kontrolü - Kota veya 429 aşılmışsa API çağrısı yapma
  const breaker = await checkCircuitBreaker();
  if (breaker.tripped) {
    return `Yapay zeka ipucu servisi yoğunluk/kota sınırı nedeniyle geçici olarak duraklatıldı. Lütfen ${breaker.remainingMinutes} dakika sonra tekrar dene.`;
  }

  // 2. Öğrenci Başına Günlük Kota Kontrolü (Spam önleme)
  const daily = await checkDailyLimit();
  if (daily.exceeded) {
    return `Bugünkü yapay zeka ipucu hakkın (${daily.max}/${daily.max}) doldu. Yarın yeni soruların için tekrar kullanabilirsin.`;
  }

  const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

  if (geminiKey) {
    try {
      const systemInstruction = `Sen 'Koçum' adında bir Yapay Zeka Öğrenci Koçusun.
GÖREVİN VE ÇALIŞMA KURALLARIN:
1. GÖRSELİ DİKKATLE İNCELE VE DOĞRULA:
   Görselde GERÇEKTEN okunabilir, çözülmeyi bekleyen bir ders sorusu, problem, metin veya test sorusu var mı?
   Eğer görselde bir soru YOKSA (örneğin karalama, anlamsız çizim, boş ekran, siyah zemin, rastgele fotoğraf, selfie, nesne, duvar veya tamamen okunamaz/bulanık bir içerik varsa):
   KESİNLİKLE herhangi bir konu uydurma, matematik veya başka bir ders konusu hakkında ASLA varsayımda bulunup ipucu verme!
   Tam olarak ve yalnızca şu ifadeyi dön:
   Görselde okunabilir bir soru tespit edilemedi. Lütfen sorunun net, tam ve okunur bir fotoğrafını yükle.
2. EĞER GÖRSELDE GERÇEK VE OKUNUR BİR SORU VARSA:
   - Sorunun ait olduğu dersi ve alt konuyu tespit et.
   - Doğrudan şıkkı veya nihai sayısal cevabı KESİNLİKLE söyleme.
   - Öğrencinin soruyu kendi başına çözebilmesi için ilk adımı gösteren 1-2 cümlelik rehber (Sokratik) ipucu ver.
3. KESİNLİKLE hiçbir emoji kullanma.`;

      const contentsParts: (
        | { text: string }
        | { inlineData: { mimeType: string; data: string } }
      )[] = [];

      // Varsa sorunun gorselini indir ve base64 olarak Gemini'ye ekle
      if (imageUrl) {
        try {
          const fullUrl = apiMediaUrl(imageUrl);
          const headers: Record<string, string> = {};
          const token = getAccessToken();
          if (token) headers.Authorization = `Bearer ${token}`;

          const imgRes = await expoFetch(fullUrl, { headers });
          if (imgRes.ok) {
            const arrayBuffer = await imgRes.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            if (bytes.length > 0) {
              const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
              const mimeType = contentType.split(';')[0].trim() || 'image/jpeg';
              const base64Data = bytesToBase64(bytes);
              contentsParts.push({
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              });
            }
          }
        } catch {
          // Gorsel indirilemediyse metinle devam et
        }
      }

      const promptText = `ÖĞRENCİ DÜZEYİ: ${grade}
DERS: ${subject}
${topic ? `KONU: ${topic}` : ''}
${note ? `ÖĞRENCİ NOTU: ${note}` : ''}
Lütfen görseldeki soruyu inceleyerek rehberlik et.`;

      contentsParts.push({ text: promptText });

      const candidateModels = [
        'gemini-3.5-flash-lite',
        'gemini-flash-lite-latest',
        'gemini-3.1-flash-lite',
        'gemini-3.8-flash',
      ];

      for (const model of candidateModels) {
        try {
          const res = await expoFetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemInstruction }] },
                contents: [{ role: 'user', parts: contentsParts }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 250 },
              }),
            }
          );

          // 3. HTTP 429 (Too Many Requests / Quota Exceeded) Algılama
          if (res.status === 429) {
            await tripCircuitBreaker();
            return 'Yapay zeka ipucu servisi günlük/dakikalık kota sınırına ulaştığı için 30 dakika süreyle duraklatıldı. Lütfen daha sonra tekrar dene.';
          }

          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim().length > 5) {
              const clean = text.trim();
              // Sadece basarili gercek ipuclarinda gunluk kotayi azalt
              if (!clean.includes('tespit edilemedi')) {
                await incrementDailyUsage();
                await consumeAiQuota(isPro);
              }
              await AsyncStorage.setItem(`kocumbenim.aiHint.${questionId}`, clean);
              return clean;
            }
          } else {
            const errData = await res.json().catch(() => null);
            if (
              res.status === 403 ||
              errData?.error?.status === 'RESOURCE_EXHAUSTED' ||
              errData?.error?.message?.toLowerCase().includes('quota')
            ) {
              await tripCircuitBreaker();
              return 'Yapay zeka ipucu servisi kota sınırına ulaştığı için geçici olarak duraklatıldı. Lütfen daha sonra tekrar dene.';
            }
          }
        } catch {
          // Sıradaki modeli dene
        }
      }
    } catch {
      // Ag hatasi veya baglanti kopmasi
    }
  }

  const fallback = 'Görselde okunabilir bir soru tespit edilemedi. Lütfen sorunun net, tam ve okunur bir fotoğrafını yükle.';
  await AsyncStorage.setItem(`kocumbenim.aiHint.${questionId}`, fallback);
  return fallback;
}
