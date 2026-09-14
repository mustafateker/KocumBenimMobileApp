import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { NeonButton, PressScale } from '@/components/button';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, IconBubble, SectionLabel, Txt } from '@/components/ui';
import { mailtoWithSubject, SUPPORT_EMAIL } from '@/lib/legal-constants';
import { Palette, Space } from '@/theme/tokens';

type Faq = { question: string; answer: string };

const FAQS: Faq[] = [
  {
    question: 'Odak modu nasıl çalışır?',
    answer:
      'Üs ekranındaki halkaya dokunup süreni seç (25, 45, 60 dk ya da özel bir süre), "Çalışmaya Başla"ya bas. Süre dolana ya da erken bitirene kadar tam ekran odak modunda kalırsın; tamamlanan oturumlar XP kazandırır ve günlük serine eklenir.',
  },
  {
    question: 'Günlük görevler nasıl tamamlanır?',
    answer:
      'Koçun sana atadığı soru çözme, konu çalışma ve odaklı çalışma görevleri Üs ekranında ve Görevlerim sayfasında listelenir. Her görevin ilerleme çubuğu, ne kadarını tamamladığını gösterir; hedefe ulaşınca görev otomatik tamamlanmış sayılır.',
  },
  {
    question: '"Hızlı Soru Sor" ne işe yarar?',
    answer:
      'Takıldığın bir soruyu telefonunun kamerasıyla çek, üzerine kalemle işaretle ya da not ekle, sonra koçuna gönder. Koçun soruyu inceleyip cevaplar; geçmiş sorularını Sorular sekmesinden takip edebilirsin.',
  },
  {
    question: 'Seri (streak) nasıl korunur?',
    answer:
      'Her gün en az bir odak oturumu tamamladığında serin bir artar. Bir gün hiç çalışmazsan seri sıfırlanır. Üs ekranındaki alevli sayaç güncel serini gösterir.',
  },
  {
    question: 'XP nasıl kazanılır?',
    answer:
      'Tamamladığın odak oturumları ve görevler XP kazandırır. XP, ne kadar düzenli ve üretken çalıştığının bir göstergesidir; Ben sekmesinden toplam ilerlemeni görebilirsin.',
  },
  {
    question: 'Özel derslerimi nereden görürüm?',
    answer:
      'Koçunun sana tanımladığı birebir özel dersler Özel Derslerim sayfasında tarih ve saatiyle listelenir. Yaklaşan bir dersin varsa Üs ekranında da hatırlatma kartı olarak çıkar.',
  },
  {
    question: 'Bildirimleri nasıl açıp kapatırım?',
    answer:
      'Ayarlar > Bildirim Tercihleri altından görev bildirimlerini, seri hatırlatmalarını ve uygulama duyurularını ayrı ayrı açıp kapatabilirsin.',
  },
  {
    question: 'Parolamı unuttum, ne yapmalıyım?',
    answer:
      `Uygulama içinden parola sıfırlama henüz desteklenmiyor. ${SUPPORT_EMAIL} adresine kayıtlı e-postanla yazarsan sana yardımcı oluruz.`,
  },
  {
    question: 'Veli e-postası ne işe yarar?',
    answer:
      'Ayarlar > Hesap altına bir veli e-postası eklersen, ilerleme raporların o adrese gönderilebilir. Tamamen opsiyoneldir, istediğin zaman kaldırabilirsin.',
  },
  {
    question: 'Verilerim güvende mi?',
    answer:
      'Hangi verilerini topladığımızı, nasıl kullandığımızı ve haklarını Ayarlar > Destek ve Yasal bölümündeki Gizlilik Politikası ve Aydınlatma Metni sayfalarında ayrıntılıyla anlatıyoruz.',
  },
];

export default function Help() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Screen tint={Palette.green}>
      <ScreenHeader
        title="Yardım & Destek"
        subtitle="Sık sorulanlar, iletişim ve hesap işlemleri"
        onBack={() => router.back()}
      />

      <View style={styles.section}>
        <SectionLabel>Sık Sorulan Sorular</SectionLabel>
        <Card style={styles.faqCard}>
          {FAQS.map((faq, i) => {
            const open = openIndex === i;
            return (
              <View key={faq.question}>
                <PressScale onPress={() => setOpenIndex(open ? null : i)} scaleTo={0.99}>
                  <View style={styles.faqRow}>
                    <Txt variant="bodyStrong" style={styles.flex}>
                      {faq.question}
                    </Txt>
                    <Ionicons
                      name={open ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={Palette.textFaint}
                    />
                  </View>
                </PressScale>
                {open ? (
                  <Txt variant="small" color={Palette.textDim} style={styles.faqAnswer}>
                    {faq.answer}
                  </Txt>
                ) : null}
                {i < FAQS.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            );
          })}
        </Card>
      </View>

      <View style={styles.section}>
        <SectionLabel>Bize Ulaş</SectionLabel>
        <Card style={styles.contactCard}>
          <IconBubble name="mail-outline" color={Palette.green} size={48} />
          <View style={styles.flex}>
            <Txt variant="bodyStrong">Sorunun cevabını bulamadın mı?</Txt>
            <Txt variant="small" color={Palette.textDim}>
              {SUPPORT_EMAIL} adresine yazabilirsin, elimizden geldiğince hızlı döneriz.
            </Txt>
          </View>
        </Card>
        <NeonButton
          label="E-posta Gönder"
          icon="mail"
          color={Palette.green}
          full
          onPress={() => Linking.openURL(mailtoWithSubject('Koçum Benim - Destek Talebi'))}
        />
      </View>

      <View style={styles.section}>
        <SectionLabel>Hesabımı Silmek İstiyorum</SectionLabel>
        <Card style={styles.list}>
          <Txt variant="small" color={Palette.textDim} style={styles.body}>
            Hesabını ve tüm verilerini (profilin, görevlerin, sorularin, odak geçmişin ve
            istatistiklerin dahil) kalıcı olarak silebilirsin. Bu işlem geri alınamaz.
          </Txt>

          <View style={styles.step}>
            <IconBubble name="trash-outline" color={Palette.pink} size={36} />
            <View style={styles.flex}>
              <Txt variant="smallStrong">Uygulama içinden</Txt>
              <Txt variant="small" color={Palette.textDim}>
                Ayarlar &gt; Hesap İşlemleri &gt; Hesabı Sil yoluyla hesabını hemen silebilirsin.
              </Txt>
            </View>
          </View>

          <View style={styles.step}>
            <IconBubble name="mail-open-outline" color={Palette.pink} size={36} />
            <View style={styles.flex}>
              <Txt variant="smallStrong">Uygulamaya erişemiyorsan</Txt>
              <Txt variant="small" color={Palette.textDim}>
                Hesabına kayıtlı e-posta adresinden {SUPPORT_EMAIL} adresine &ldquo;Hesap Silme
                Talebi&rdquo; konulu bir e-posta gönder; talebin en geç 30 gün içinde işleme alınır
                ve tüm verilerin silinir.
              </Txt>
            </View>
          </View>

          <NeonButton
            label="Hesap Silme Talebi Gönder"
            icon="mail"
            color={Palette.pink}
            full
            onPress={() => Linking.openURL(mailtoWithSubject('Koçum Benim - Hesap Silme Talebi'))}
          />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  section: {
    gap: Space.sm,
  },
  faqCard: {
    padding: Space.sm,
    gap: 0,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: Space.md,
    paddingHorizontal: Space.sm,
  },
  faqAnswer: {
    paddingHorizontal: Space.sm,
    paddingBottom: Space.md,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  list: {
    gap: Space.md,
  },
  body: {
    lineHeight: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.md,
  },
});
