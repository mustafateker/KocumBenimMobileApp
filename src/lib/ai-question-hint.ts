import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetch as expoFetch } from 'expo/fetch';

export async function getCachedQuestionHint(questionId: number): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(`kocumbenim.aiHint.${questionId}`);
  } catch {
    return null;
  }
}

export async function generateQuestionHint(options: {
  questionId: number;
  note?: string;
  subject?: string;
  topic?: string;
  grade?: string;
}): Promise<string> {
  const { questionId, note, subject = 'Matematik', topic, grade = '8. Sınıf' } = options;

  // Önce yerel önbelleğe bak
  const cached = await getCachedQuestionHint(questionId);
  if (cached) return cached;

  const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

  if (geminiKey) {
    try {
      const systemInstruction = `Sen 'Koçum' adında bir Yapay Zeka Öğrenci Koçusun.
Öğrenci yapamadığı bir soruyu sordu.
KESİNLİKLE ŞIKKI VEYA DOĞRUDAN SONUCU (A, B, C, D veya doğrudan sayısal cevabı) SÖYLEME!
GÖREVİN:
1. Sorunun hangi konuya ve temel formüle/özelliğe dayandığını belirt.
2. Öğrencinin soruyu kendi başına çözebilmesi için ilk düşünme adımını (Sokratik rehberlik) ver.
3. En fazla 2-3 kısa cümle yaz. Hiçbir emoji kullanma.`;

      const prompt = `ÖĞRENCİ DÜZEYİ: ${grade}
DERS: ${subject}
KONU: ${topic ?? 'Genel'}
ÖĞRENCİ NOTU: ${note || 'Bu soruda tıkandım, çözüm için nereden başlamalıyım?'}`;

      const res = await expoFetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 200 },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 10) {
          const clean = text.trim();
          await AsyncStorage.setItem(`kocumbenim.aiHint.${questionId}`, clean);
          return clean;
        }
      }
    } catch {
      // Fallback
    }
  }

  const fallback = `Bu soru ${subject} dersinde verilen bilgileri adım adım denklemleştirmeyi gerektiriyor. Önce soruda verilen bilinenleri ve senden isteneni kenara yaz, ardından ilk aşamadaki sadeleştirme veya bağıntı kurma adımını uygula.`;
  await AsyncStorage.setItem(`kocumbenim.aiHint.${questionId}`, fallback);
  return fallback;
}
