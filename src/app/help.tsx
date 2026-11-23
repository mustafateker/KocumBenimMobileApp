import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { NeonButton, PressScale } from '@/components/button';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, IconBubble, SectionLabel, Txt } from '@/components/ui';
import { mailtoWithSubject, SUPPORT_EMAIL } from '@/lib/legal-constants';
import {
  Accent,
  Border,
  DetailAccent,
  Palette,
  Radius,
  Space,
  pillRadius,
} from '@/theme/tokens';

type FaqCategory = 'all' | 'level' | 'focus' | 'questions' | 'curriculum' | 'account';

interface Faq {
  id: string;
  category: Exclude<FaqCategory, 'all'>;
  question: string;
  answer: string;
}

const CATEGORIES: {
  key: FaqCategory;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}[] = [
  { key: 'all', label: 'Tümü', icon: 'grid-outline' },
  { key: 'level', label: 'Seviye & XP', icon: 'trophy-outline' },
  { key: 'focus', label: 'Odak & Seri', icon: 'timer-outline' },
  { key: 'questions', label: 'Soru & İpucu', icon: 'help-circle-outline' },
  { key: 'curriculum', label: 'Dersler & Görevler', icon: 'book-outline' },
  { key: 'account', label: 'Hesap & Güvenlik', icon: 'shield-checkmark-outline' },
];

const CATEGORY_NAMES: Record<Exclude<FaqCategory, 'all'>, string> = {
  level: 'Seviye & XP',
  focus: 'Odak & Seri',
  questions: 'Soru & İpucu',
  curriculum: 'Dersler & Görevler',
  account: 'Hesap & Güvenlik',
};

const FAQS: Faq[] = [
  {
    id: 'xp-sources',
    category: 'level',
    question: 'XP nasıl kazanılır ve hangi aktiviteler puan kazandırır?',
    answer:
      'Odaklanma oturumu tamamlama (25 dk odak = 15 XP, günde en fazla 6 oturumdan toplam 90 XP), günlük soru hedefini tamamlama (30 XP), soru hata/yanlış analizi kaydı (15 XP), günlük uygulamaya giriş check-in (10 XP), haftalık deneme sınavı analizi girişi (50 XP) ve 7 günlük kesintisiz seri tamamlama (40 XP) ile XP kazanabilirsin.',
  },
  {
    id: 'hard-cap',
    category: 'level',
    question: 'Günlük XP limiti (Hard Cap) nedir ve neden uygulanır?',
    answer:
      'Sistemin sömürülmesini engellemek, sağlıklı ve dengeli bir ders çalışma temposu oluşturmak amacıyla günlük XP kazanım tavanı 150 XP olarak belirlenmiştir. 150 XP limitine ulaştıktan sonra da çalışmaya devam edebilirsin; ancak o gün için ilave XP hanene yazılmaz.',
  },
  {
    id: 'level-characters',
    category: 'level',
    question: 'Seviye sistemi ve karakterler nasıl çalışır?',
    answer:
      'Toplam 10 seviye ve her seviyeye özel tasarlanmış bir Koç karakteri (maskot) bulunur. Seviye 1 Çırak Kaşif ile başlar; İstikrarlı Yolcu, Odak Mimarı, Görev Avcısı, Disiplin Ustası, Soru Stratejisti, Zirve Adayı, Maraton Koşucusu, Akademi Lideri aşamalarından geçerek Seviye 10 Sınav Şampiyonu unvanına ulaşırsın. Ulaştığın seviyenin özel karakteri profilinde ve ana ekranında yer alır.',
  },
  {
    id: 'level-decay',
    category: 'level',
    question: 'Seviye 10 Şampiyonluk Savunması ve XP erimesi (decay) nedir?',
    answer:
      'Seviye 10’a (25.000 XP) ulaştığında unvan koruma modu başlar. İlk ulaşıldığında sana 3 günlük Şampiyon Kalkanı tanımlanır ve hiçbir erime olmaz. Ayrıca her ay 1 günlük dondurma hakkın bulunur. Çalışmaya ara verildiğinde 2. gün 50 XP, 3. gün 100 XP, 4. gün ve sonrası her gün 150 XP erime uygulanır. Puanın 25.000 altına inerse unvanın geçici olarak Seviye 9 Akademi Lideri kademesine geriler; ancak çalışmaya döndüğün gün sınır puanı tekrar aşarak şampiyonluk unvanını hemen geri alabilirsin.',
  },
  {
    id: 'level-stars',
    category: 'level',
    question: 'Seviye 10 Yıldız Kademeleri nedir?',
    answer:
      '25.000 XP sonrasında da çalışma temposunu sürdüren öğrencileri ödüllendirmek için Yıldız Kademeleri bulunur. 25.000 XP’de 1 Yıldız, 27.500 XP’de 2 Yıldız ve 30.000 XP’de Efsane Şampiyon (3 Yıldız) unvanı elde edilir.',
  },
  {
    id: 'focus-mode',
    category: 'focus',
    question: 'Odak modu ve Pomodoro nasıl çalışır?',
    answer:
      'Üs ekranındaki odak halkasına dokunup çalışma süreni seç (25, 45, 60 dk veya sana özel bir süre) ve "Çalışmaya Başla" butonuna bas. Süre dolana kadar tam ekran odak modunda kalırsın. Tamamlanan oturumlar çalışma istatistiklerine kaydedilir, 15 XP kazandırır ve günlük serine eklenir.',
  },
  {
    id: 'focus-streak',
    category: 'focus',
    question: 'Seri (streak) nasıl korunur ve çarpan bonusları nelerdir?',
    answer:
      'Her gün en az bir odak oturumu veya çalışma aktivitesi tamamladığında serin bir gün artar. 7 gün ve üzeri serilerde +%10, 30 gün ve üzeri kesintisiz serilerde ise +%20 XP bonus çarpanı aktif olur. Bir gün hiç çalışma yapmazsan serin sıfırlanır.',
  },
  {
    id: 'focus-cancel',
    category: 'focus',
    question: 'Odak oturumunu erken bitirirsem ne olur?',
    answer:
      'Odaklanma oturumu asgari süre (25 dakika) tamamlanmadan erken sonlandırılır veya iptal edilirse oturum tamamlanmamış sayılır ve XP verilmez. Amacımız bölünmeden, masada kesintisiz odaklanma alışkanlığı kazandırmaktır.',
  },
  {
    id: 'ask-question',
    category: 'questions',
    question: 'Koçuma nasıl soru gönderebilirim?',
    answer:
      'Sorular sekmesinden "Soru Çek" butonuna dokun. Kameranla sorunun net bir fotoğrafını çek veya galerinden yükle. Gerekirse soruyu kırp, önemli yerleri kalem aracıyla işaretle ya da not ekleyerek koçuna gönder.',
  },
  {
    id: 'ai-hint',
    category: 'questions',
    question: 'Yapay zeka "Koç’un İpucu" özelliği nasıl çalışır?',
    answer:
      'Gönderdiğin sorunun detayında yer alan "İpucunu Gör" butonuna bastığında, yapay zeka destekli Koç sistemi soruyu analiz eder. Bu özellik sorunun doğrudan yanıtını vermek yerine; sorunun hangi konudan geldiğini, hatırlaman gereken formülü veya ilk çözüm adımını gösteren pedagojik bir ipucu sunar. Böylece soruyu kendi çabanla çözmen hedeflenir.',
  },
  {
    id: 'coach-reply',
    category: 'questions',
    question: 'Koçum sorumu ne zaman yanıtlar?',
    answer:
      'Gönderdiğin sorular koçunun paneline anında iletilir. Koçun soruyu detaylıca inceleyip çözüm adımlarını, püf noktalarını ve varsa ek çalışma tavsiyesini sisteme yükler. Çözülen sorular Sorularım sekmesinde "Cevaplandı" olarak arşivlenir.',
  },
  {
    id: 'curriculum-maarif',
    category: 'curriculum',
    question: 'Müfredat ve konu takibi (Maarif Modeli) nasıl yapılır?',
    answer:
      'Derslerim ekranında sınıf seviyene ve MEB Türkiye Yüzyılı Maarif Modeline uygun üniteler listelenir. Okulda geldiğin son konuyu seçtiğinde, o konuya kadar olan tüm önceki konular otomatik tamamlandı kabul edilir. Eksik veya tekrar edilmesi gereken konuları dilediğin an inceleyebilirsin.',
  },
  {
    id: 'daily-tasks',
    category: 'curriculum',
    question: 'Günlük görevler ve soru hedefleri nasıl tamamlanır?',
    answer:
      'Koçunun tanımladığı günlük soru hedefleri, konu tekrarları ve deneme ödevleri Üs ve Görevlerim ekranlarında listelenir. Her görevin altındaki ilerleme çubuğu durumunu gösterir; hedefe ulaştığında görev otomatik tamamlanır ve 30 XP kazanırsın. Hatalı sorularının analizini kaydettiğinde de ek 15 XP verilir.',
  },
  {
    id: 'trial-exams',
    category: 'curriculum',
    question: 'Deneme sınavı analizi nasıl kaydedilir?',
    answer:
      'Katıldığın deneme sınavlarının netlerini, ders bazlı doğru ve yanlış sayılarını sisteme kaydedebilirsin. Bu veriler koçunun eksik olduğun kazanımları tespit etmesini sağlar; ayrıca haftalık deneme analizi girişi 50 XP kazandırır.',
  },
  {
    id: 'private-lessons',
    category: 'curriculum',
    question: 'Özel derslerimi nereden takip edebilirim?',
    answer:
      'Koçunun seninle planladığı birebir özel dersler Özel Derslerim sayfasında tarih, saat ve konu bilgisiyle listelenir. Yaklaşan bir özel dersin olduğunda Üs ekranında hatırlatma kartı olarak da karşına çıkar.',
  },
  {
    id: 'password-change',
    category: 'account',
    question: 'Parolamı nasıl değiştirebilirim veya sıfırlayabilirim?',
    answer:
      'Mevcut parolanı biliyorsan Ayarlar > Hesap bölümündeki "Parolayı Değiştir" alanından mevcut ve yeni parolanı girerek anında güncelleyebilirsin. Giriş yapamıyor ve parolanı unuttuysan kayıtlı e-posta adresinden destek ekibimize yazarak sıfırlama talep edebilirsin.',
  },
  {
    id: 'parent-email',
    category: 'account',
    question: 'Veli e-postası eklemek ne işe yarar?',
    answer:
      'Ayarlar > Hesap bölümüne veli e-postası eklediğinde, haftalık veya aylık ders çalışma özetlerin ve deneme analiz raporların velinle paylaşılabilir. Bu alan tamamen isteğe bağlıdır; dilediğin zaman güncelleyebilir veya kaldırabilirsin.',
  },
  {
    id: 'notification-settings',
    category: 'account',
    question: 'Bildirimlerimi nasıl yönetebilirim?',
    answer:
      'Ayarlar > Bildirim Tercihleri üzerinden görev hatırlatmalarını, seri koruma uyarılarını, koç mesajlarını ve uygulama duyurularını ayrı ayrı açıp kapatabilirsin.',
  },
  {
    id: 'account-deletion',
    category: 'account',
    question: 'Hesabımı ve verilerimi nasıl silebilirim?',
    answer:
      'Ayarlar > Hesap İşlemleri > "Hesabı Sil" yolunu kullanarak profilin, soru arşivin, odaklanma kayıtların ve tüm istatistiklerin dahil olmak üzere hesabını kalıcı olarak silebilirsin. Uygulamaya erişemiyorsan kayıtlı e-postandan destek adresimize hesap silme talebi iletebilirsin.',
  },
  {
    id: 'privacy-safety',
    category: 'account',
    question: 'Kişisel verilerim nasıl korunuyor?',
    answer:
      'Kişisel verilerin, soruların ve çalışma istatistiklerin KVKK ve yasal mevzuata uygun şekilde güvenle saklanır. Ayrıntılı bilgiye Ayarlar > Destek ve Yasal bölümündeki Gizlilik Politikası ve Aydınlatma Metni sayfalarından ulaşabilirsin.',
  },
];

export default function Help() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>('xp-sources');

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FAQS.filter((faq) => {
      const matchesCategory =
        selectedCategory === 'all' || faq.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/student');
    }
  }, [router]);

  return (
    <Screen tint={Accent}>
      <ScreenHeader
        title="Yardım & Destek"
        subtitle="Sık sorulan sorular, rehber ve iletişim"
        onBack={handleBack}
      />

      {/* Arama Alani */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Palette.textDim} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Soru veya konu ara..."
          placeholderTextColor={Palette.textFaint}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 ? (
          <PressScale onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={Palette.textFaint} />
          </PressScale>
        ) : null}
      </View>

      {/* Kategori Filtre Haplari */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.key;
          return (
            <PressScale
              key={cat.key}
              onPress={() => setSelectedCategory(cat.key)}
              scaleTo={0.96}
            >
              <View style={[styles.categoryChip, active && styles.categoryChipActive]}>
                <Ionicons
                  name={cat.icon}
                  size={14}
                  color={active ? '#FFFFFF' : Palette.textDim}
                />
                <Txt
                  variant="smallStrong"
                  color={active ? '#FFFFFF' : Palette.textDim}
                >
                  {cat.label}
                </Txt>
              </View>
            </PressScale>
          );
        })}
      </ScrollView>

      {/* SSS Bolumu */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <SectionLabel>Sık Sorulan Sorular</SectionLabel>
          <View style={styles.countBadge}>
            <Txt variant="tiny" color={DetailAccent}>
              {filteredFaqs.length} Soru
            </Txt>
          </View>
        </View>

        {filteredFaqs.length === 0 ? (
          <Card style={styles.emptyCard}>
            <IconBubble name="search-outline" color={DetailAccent} size={48} />
            <Txt variant="bodyStrong">Sonuç Bulunamadı</Txt>
            <Txt variant="small" color={Palette.textDim} style={styles.emptyText}>
              Aradığın kelimeyle eşleşen soru bulunamadı. Farklı bir arama yapabilir veya aşağıdaki alandan bize doğrudan yazabilirsin.
            </Txt>
          </Card>
        ) : (
          <Card style={styles.faqCard}>
            {filteredFaqs.map((faq, i) => {
              const open = openId === faq.id;
              return (
                <View key={faq.id}>
                  <PressScale
                    onPress={() => setOpenId(open ? null : faq.id)}
                    scaleTo={0.99}
                  >
                    <View style={styles.faqRow}>
                      <View style={styles.faqTitleWrap}>
                        <View style={styles.faqCategoryPill}>
                          <Txt variant="tiny" color={DetailAccent}>
                            {CATEGORY_NAMES[faq.category]}
                          </Txt>
                        </View>
                        <Txt variant="bodyStrong" style={styles.faqQuestion}>
                          {faq.question}
                        </Txt>
                      </View>
                      <View
                        style={[
                          styles.chevronBox,
                          open && styles.chevronBoxOpen,
                        ]}
                      >
                        <Ionicons
                          name={open ? 'chevron-up' : 'chevron-down'}
                          size={16}
                          color={open ? DetailAccent : Palette.textFaint}
                        />
                      </View>
                    </View>
                  </PressScale>
                  {open ? (
                    <View style={styles.faqAnswerBox}>
                      <Txt variant="small" color={Palette.textDim} style={styles.faqAnswer}>
                        {faq.answer}
                      </Txt>
                    </View>
                  ) : null}
                  {i < filteredFaqs.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              );
            })}
          </Card>
        )}
      </View>

      {/* Bize Ulas */}
      <View style={styles.section}>
        <SectionLabel>Bize Ulaş</SectionLabel>
        <Card style={styles.contactCard}>
          <IconBubble name="mail-outline" color={DetailAccent} size={48} />
          <View style={styles.flex}>
            <Txt variant="bodyStrong">Sorunun cevabını bulamadın mı?</Txt>
            <Txt variant="small" color={Palette.textDim} style={styles.contactSub}>
              {SUPPORT_EMAIL} adresine dilediğin an yazabilirsin. Ekibimiz en kısa sürede dönüş yapacaktır.
            </Txt>
          </View>
        </Card>
        <NeonButton
          label="Destek Ekibine E-posta Gönder"
          icon="mail"
          color={Accent}
          full
          onPress={() => Linking.openURL(mailtoWithSubject('Koçum Benim - Destek Talebi'))}
        />
      </View>

      {/* Hesabimi Silmek Istiyorum */}
      <View style={styles.section}>
        <SectionLabel>Hesabımı Silmek İstiyorum</SectionLabel>
        <Card style={styles.deleteCard}>
          <Txt variant="small" color={Palette.textDim} style={styles.deleteIntro}>
            Hesabını ve tüm verilerini (profilin, görevlerin, soruların, odak geçmişin ve istatistiklerin dahil) kalıcı olarak silebilirsin. Bu işlem geri alınamaz.
          </Txt>

          <View style={styles.step}>
            <IconBubble name="trash-outline" color={DetailAccent} size={36} />
            <View style={styles.flex}>
              <Txt variant="smallStrong">Uygulama içinden</Txt>
              <Txt variant="small" color={Palette.textDim}>
                Ayarlar &gt; Hesap İşlemleri &gt; Hesabı Sil yoluyla hesabını hemen silebilirsin.
              </Txt>
            </View>
          </View>

          <View style={styles.step}>
            <IconBubble name="mail-open-outline" color={DetailAccent} size={36} />
            <View style={styles.flex}>
              <Txt variant="smallStrong">Uygulamaya erişemiyorsan</Txt>
              <Txt variant="small" color={Palette.textDim}>
                Hesabına kayıtlı e-posta adresinden {SUPPORT_EMAIL} adresine &ldquo;Hesap Silme Talebi&rdquo; konulu bir e-posta gönder; talebin en geç 30 gün içinde işleme alınır ve tüm verilerin silinir.
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: pillRadius(20),
    backgroundColor: 'rgba(251, 174, 117, 0.14)',
    borderWidth: Border.thin,
    borderColor: 'rgba(251, 174, 117, 0.28)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    paddingHorizontal: Space.md,
    borderWidth: 1,
    borderColor: Palette.border,
    height: 48,
    shadowColor: '#2D2B52',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Palette.text,
    paddingVertical: 0,
  },
  categoryScroll: {
    gap: Space.xs,
    paddingVertical: Space.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: pillRadius(32),
    borderWidth: 1,
    borderColor: 'rgba(58, 57, 103, 0.12)',
    backgroundColor: '#FFFFFF',
  },
  categoryChipActive: {
    borderColor: DetailAccent,
    backgroundColor: DetailAccent,
  },
  faqCard: {
    padding: Space.sm,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: '#FFFFFF',
    shadowColor: '#2D2B52',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    gap: 0,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Space.md,
    paddingVertical: Space.md,
    paddingHorizontal: Space.sm,
  },
  faqTitleWrap: {
    flex: 1,
    gap: 4,
  },
  faqCategoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: pillRadius(18),
    backgroundColor: 'rgba(251, 174, 117, 0.12)',
  },
  faqQuestion: {
    lineHeight: 22,
  },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  chevronBoxOpen: {
    backgroundColor: 'rgba(251, 174, 117, 0.16)',
  },
  faqAnswerBox: {
    paddingHorizontal: Space.sm,
    paddingBottom: Space.md,
    paddingTop: Space.xs,
  },
  faqAnswer: {
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
  },
  emptyCard: {
    padding: Space.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.sm,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: '#FFFFFF',
    padding: Space.lg,
  },
  contactSub: {
    lineHeight: 20,
    marginTop: 2,
  },
  deleteCard: {
    gap: Space.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: '#FFFFFF',
    padding: Space.lg,
  },
  deleteIntro: {
    lineHeight: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.md,
  },
});
