import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressScale } from '@/components/button';
import { MenuButton, NotificationBell } from '@/components/header-actions';
import { RaccoonIcon } from '@/components/raccoon-icon';
import { ScreenBackground, ScreenHeader } from '@/components/screen';
import { Card, Txt } from '@/components/ui';
import { getAiCoachContext, sendAiCoachMessage } from '@/lib/api';
import { markAiCoachUsed, triggerPlayReviewOnLeaveAiCoach } from '@/lib/play-review';
import { useStudent } from '@/lib/session';
import type { AiChatMessage, AiCoachContext } from '@/lib/types';
import { Accent, Border, DetailAccent, Font, OnColor, Palette, Radius, Space, pillRadius } from '@/theme/tokens';

const QUICK_QUESTIONS = [
  {
    id: 'analysis',
    label: 'Soru analizlerim',
    prompt: 'Çözdüğüm sorulara göre doğru ve yanlış analizlerim nasıl?',
  },
  {
    id: 'topics',
    label: 'Hangi konulara çalışmam lazım?',
    prompt: 'Eksiklerime ve sınıfıma göre öncelikle hangi konulara çalışmam lazım?',
  },
  {
    id: 'task',
    label: 'Bugün bana ödev ata',
    prompt: 'Sınıfıma ve eksik konularıma göre bugün için bana ödev atar mısın?',
  },
  {
    id: 'time',
    label: 'Çalışma süremi değerlendir',
    prompt: 'Günlük çalışma hedefim ve son günlerdeki çalışma sürem nasıl?',
  },
  {
    id: 'plan',
    label: 'Günlük çalışma planım',
    prompt: 'Bugün derslerimi ve zamanımı nasıl planlamalıyım?',
  },
];

export default function AiCoachScreen() {
  const router = useRouter();
  const student = useStudent();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<AiChatMessage>>(null);

  const [context, setContext] = useState<AiCoachContext | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const loadContext = useCallback(async () => {
    try {
      const ctx = await getAiCoachContext();
      setContext(ctx);

      setMessages((prev) => {
        if (prev.length > 0) return prev;
        return [
          {
            id: 'init-greeting',
            role: 'raccoon',
            text: ctx.greeting,
            timestamp: '18:08',
          },
          {
            id: 'demo-user-1',
            role: 'student',
            text: 'Eksiklerime ve sınıfıma göre öncelikle hangi konulara çalışmam lazım?',
            timestamp: '18:09',
          },
          {
            id: 'demo-ai-1',
            role: 'raccoon',
            text: `5. sınıf müfredatında düzenli ilerlemek için bugün şu konulara odaklanabilirsin:

- Matematik: Doğal Sayılar ve İşlemler, Çok Basamaklı Sayılar
- Türkçe: Sözcükte Anlam, Eş ve Zıt Anlamlı Kelimeler
- Fen Bilimleri: Gökyüzündeki Komşumuz: Güneş ve Ay

Bu konulardan görev atamamı istersen 'Bugün bana ödev ata' yazman yeterli.`,
            timestamp: '18:09',
          },
        ];
      });
    } catch {
      setMessages((prev) => {
        if (prev.length > 0) return prev;
        const name = student.nickname ?? student.name.split(' ')[0];
        const grade = student.grade ?? '8. Sınıf';
        return [
          {
            id: 'init-greeting-fallback',
            role: 'raccoon',
            text: `Merhaba ${name}. ${grade} çalışma verilerini, görevlerini ve odak süreni birlikte takip ediyoruz. Aşağıdaki hazır başlıkları seçebilir veya sorununuzu doğrudan yazabilirsin.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      });
    }
  }, [student.grade, student.name, student.nickname]);

  useFocusEffect(
    useCallback(() => {
      loadContext();
      markAiCoachUsed();
      return () => {
        // Kullanıcı Koçum ekranını kullandıktan sonra başka bir ekrana ilk geçtiğinde
        // Google Play değerlendirme popup'ını tetikler.
        triggerPlayReviewOnLeaveAiCoach();
      };
    }, [loadContext])
  );

  const handleSend = useCallback(
    async (textToSend?: string) => {
      const trimmed = (textToSend ?? input).trim();
      if (!trimmed || sending) return;

      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
      }

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const userMsg: AiChatMessage = {
        id: `user-${Date.now()}`,
        role: 'student',
        text: trimmed,
        timestamp: nowTime,
      };

      const updatedHistory = [...messages, userMsg];
      setMessages(updatedHistory);
      if (!textToSend) {
        setInput('');
      }
      setSending(true);

      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);

      try {
        const historyPayload = updatedHistory
          .slice(-6)
          .map((m) => ({ role: m.role === 'student' ? 'user' : 'model', text: m.text }));

        const res = await sendAiCoachMessage(trimmed, historyPayload);

        const raccoonMsg: AiChatMessage = {
          id: `raccoon-${Date.now()}`,
          role: 'raccoon',
          text: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdTasks: res.createdTasks,
          geminiUsed: res.geminiUsed,
        };

        setMessages((prev) => [...prev, raccoonMsg]);
        if (res.createdTasks && res.createdTasks.length > 0) {
          loadContext();
        }
      } catch {
        const lower = trimmed.toLowerCase();
        const grade = context?.student?.grade ?? student.grade ?? '8. Sınıf';
        const name = student.nickname ?? student.name.split(' ')[0];
        const target = context?.student?.targetMinutes ?? 60;
        const todayMin = context?.studyStats?.todayMinutes ?? 0;
        const yesterdayMin = context?.studyStats?.yesterdayMinutes ?? 0;
        const topWeak = context?.weakTopics?.[0];

        let fallbackReply = '';
        if (lower.includes('analiz') || lower.includes('doğru') || lower.includes('yanlış')) {
          if (topWeak) {
            fallbackReply = `Kayıtlı soru çözümlerine göre ${topWeak.subject} dersi ${topWeak.topic} konusunda %${topWeak.accuracyRate} başarı oranın ve ${topWeak.wrongCount} yanlışın bulunuyor. Bu konudaki yanlışlarını azaltmak için önce konu tekrarı yapıp ardından 20 soruluk test çözmeni öneririm.`;
          } else {
            fallbackReply = `${name}, çözdüğün görevlerdeki doğru ve yanlış dağılımın dengeli görünüyor. Görevlerim sekmesinden soru görevlerini tamamladıkça konu bazlı detaylı analizlerin burada güncellenir.`;
          }
        } else if (lower.includes('hangi konu') || lower.includes('konulara çalış')) {
          if (topWeak) {
            fallbackReply = `Öncelikle yanlış sayının yüksek olduğu ${topWeak.subject} - ${topWeak.topic} konusuna çalışmalısın. 15 dakikalık konu tekrarının ardından 20 soru çözerek bu konuyu pekiştirebilirsin.`;
          } else {
            fallbackReply = `${grade} müfredatında eksik kalan konun bulunmuyor. Günlük çalışma rutinine göre sıradaki üniteden konu tekrarı ve 20 soruluk pratik yapabilirsin.`;
          }
        } else if (lower.includes('ödev') || lower.includes('görev')) {
          fallbackReply = `${grade} seviyene uygun çalışma önerin hazır. Sunucu bağlantısı kurulduğunda görevlerin panona otomatik eklenecektir. Şimdilik ana ekrandan 25 dakikalık bir odak oturumu başlatabilirsin.`;
        } else if (lower.includes('süre') || lower.includes('dakika') || lower.includes('değerlendir')) {
          fallbackReply = `Günlük adaptif çalışma hedefin ${target} dakika. Dün ${yesterdayMin} dakika, bugün ise şu ana kadar ${todayMin} dakika çalıştın. Kalan süreni 25 dakikalık odak oturumlarıyla tamamlayabilirsin.`;
        } else {
          fallbackReply = `${name}, ${grade} hedeflerin doğrultusunda bugün ${target} dakikalık çalışma planın bulunuyor. Soru analizlerini, çalışman gereken konuları veya günlük planını aşağıdaki kısa sorulardan seçerek inceleyebilirsin.`;
        }

        const fallbackMsg: AiChatMessage = {
          id: `raccoon-${Date.now()}`,
          role: 'raccoon',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          geminiUsed: false,
        };

        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setSending(false);
        setTimeout(() => {
          listRef.current?.scrollToEnd({ animated: true });
        }, 120);
      }
    },
    [
      context?.student?.grade,
      context?.student?.targetMinutes,
      context?.studyStats?.todayMinutes,
      context?.studyStats?.yesterdayMinutes,
      context?.weakTopics,
      input,
      loadContext,
      messages,
      sending,
      student.grade,
      student.name,
      student.nickname,
    ]
  );

  const displayGrade = context?.student?.grade ?? student.grade ?? '8. Sınıf';
  const targetMinutes = context?.student?.targetMinutes ?? 60;
  const todayMin = context?.studyStats?.todayMinutes ?? 0;
  const yesterdayMin = context?.studyStats?.yesterdayMinutes ?? 0;
  const topWeak = context?.weakTopics?.[0]?.topic ?? 'Dengeli';
  const quickQuestions = context?.suggestedPrompts && context.suggestedPrompts.length > 0 ? context.suggestedPrompts : QUICK_QUESTIONS;

  return (
    <ScreenBackground>
      <View style={[styles.container, { paddingTop: insets.top + Space.md }]}>
        <View style={styles.headerPad}>
          <ScreenHeader
            title="Koçum"
            subtitle={`${displayGrade} · Kişisel Çalışma Koçun`}
            left={<MenuButton />}
            right={<NotificationBell />}
          />

          {/* Kişisel Koçluk Durum Kartı */}
          <Card accent={DetailAccent} style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <RaccoonIcon size={38} />

              <View style={styles.metricCol}>
                <Txt variant="tiny" color={Palette.textFaint}>
                  Günlük Hedef
                </Txt>
                <Txt variant="smallStrong" color={Palette.text}>
                  {targetMinutes} dk
                </Txt>
              </View>

              <View style={styles.divider} />

              <View style={styles.metricCol}>
                <Txt variant="tiny" color={Palette.textFaint}>
                  Bugün / Dün
                </Txt>
                <Txt variant="smallStrong" color={Palette.text}>
                  {todayMin} / {yesterdayMin} dk
                </Txt>
              </View>

              <View style={styles.divider} />

              <View style={[styles.metricCol, styles.metricColWide]}>
                <Txt variant="tiny" color={Palette.textFaint}>
                  Öncelikli Konu
                </Txt>
                <Txt variant="smallStrong" color={Accent} numberOfLines={1}>
                  {topWeak}
                </Txt>
              </View>
            </View>
          </Card>
        </View>

        {/* Sohbet Akışı */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ChatMessageItem message={item} onGoToTasks={() => router.push('/student/tasks')} />
          )}
          ListFooterComponent={
            sending ? (
              <View style={styles.typingContainer}>
                <RaccoonIcon size={28} />
                <View style={styles.typingBubble}>
                  <Txt variant="small" color={Palette.textDim}>
                    Koçum yanıt hazırlıyor...
                  </Txt>
                </View>
              </View>
            ) : null
          }
        />

        {/* Textbox Üstü Kısa Hazır Sorular + Mesaj Girdi Alanı */}
        <KeyboardStickyView>
          <View style={[styles.bottomArea, { paddingBottom: Math.max(insets.bottom, Space.sm) + 64 }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.quickPromptsRow}
            >
              {quickQuestions.map((item) => (
                <PressScale
                  key={item.id}
                  onPress={() => handleSend(item.prompt)}
                  disabled={sending}
                  scaleTo={0.96}
                >
                  <View style={styles.quickPromptChip}>
                    <Txt variant="tiny" color={Palette.text}>
                      {item.label}
                    </Txt>
                  </View>
                </PressScale>
              ))}
            </ScrollView>

            <View style={styles.inputInner}>
              <TextInput
                style={styles.textInput}
                placeholder="Koçum'a sor veya ödev iste..."
                placeholderTextColor={Palette.textFaint}
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={1000}
                returnKeyType="default"
              />
              <PressScale
                onPress={() => handleSend()}
                disabled={!input.trim() || sending}
                scaleTo={0.92}
                style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
              >
                <Ionicons
                  name="arrow-up"
                  size={18}
                  color={input.trim() && !sending ? OnColor : Palette.textFaint}
                />
              </PressScale>
            </View>
          </View>
        </KeyboardStickyView>
      </View>
    </ScreenBackground>
  );
}

function ChatMessageItem({
  message,
  onGoToTasks,
}: {
  message: AiChatMessage;
  onGoToTasks: () => void;
}) {
  const isStudent = message.role === 'student';

  if (isStudent) {
    return (
      <View style={styles.studentMsgContainer}>
        <View style={styles.studentBubble}>
          <Txt variant="body" color={OnColor}>
            {message.text}
          </Txt>
          <Txt variant="tiny" color="rgba(245, 239, 241, 0.7)" style={styles.timeRight}>
            {message.timestamp}
          </Txt>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.raccoonMsgContainer}>
      <RaccoonIcon size={34} style={{ marginTop: 2 }} />

      <View style={styles.raccoonContent}>
        <View style={styles.raccoonBubble}>
          <View style={styles.coachHeader}>
            <Txt variant="tiny" color={Accent}>
              Koçum
            </Txt>
            <Txt variant="tiny" color={Palette.textFaint}>
              {message.timestamp}
            </Txt>
          </View>

          <Txt variant="body" color={Palette.text} style={styles.msgText}>
            {message.text}
          </Txt>

          {message.createdTasks && message.createdTasks.length > 0 ? (
            <View style={styles.tasksBox}>
              <View style={styles.tasksBoxHead}>
                <Ionicons name="checkmark-circle" size={16} color={Accent} />
                <Txt variant="smallStrong" color={Palette.text}>
                  Ödevlerime Eklenen Aktiviteler
                </Txt>
              </View>

              {message.createdTasks.map((t) => {
                const activityType =
                  t.category === 'topic'
                    ? 'Konu Çalışması'
                    : t.category === 'focus'
                      ? `${t.durationMinutes} dk Pomodoro`
                      : `${t.target} Soru Çözümü`;
                return (
                  <View key={t.id} style={styles.miniTaskCard}>
                    <Txt variant="smallStrong" numberOfLines={1}>
                      {t.title}
                    </Txt>
                    <Txt variant="tiny" color={Palette.textDim}>
                      {t.subject} · {activityType} · {t.durationMinutes} dk
                    </Txt>
                  </View>
                );
              })}

              <PressScale onPress={onGoToTasks} scaleTo={0.97} style={styles.goToTasksBtn}>
                <Txt variant="tiny" color={Accent}>
                  Ödevlerim Ekranında Aç
                </Txt>
                <Ionicons name="arrow-forward" size={12} color={Accent} />
              </PressScale>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerPad: {
    paddingHorizontal: Space.lg,
    gap: Space.sm,
  },
  summaryCard: {
    paddingVertical: Space.sm + 2,
    paddingHorizontal: Space.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.sm,
  },
  raccoonBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.surfaceHi,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricCol: {
    alignItems: 'center',
    gap: 2,
  },
  metricColWide: {
    flex: 1,
    alignItems: 'flex-end',
  },
  divider: {
    width: 1,
    height: 26,
    backgroundColor: Palette.border,
  },
  chatList: {
    paddingHorizontal: Space.lg,
    paddingTop: Space.md,
    paddingBottom: Space.md,
  },
  studentMsgContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Space.md,
  },
  studentBubble: {
    maxWidth: '82%',
    backgroundColor: Accent,
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm + 2,
    borderRadius: Radius.lg,
    borderBottomRightRadius: Radius.sm,
  },
  timeRight: {
    alignSelf: 'flex-end',
    marginTop: 4,
    fontSize: 10,
  },
  raccoonMsgContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.sm,
    marginBottom: Space.md,
  },
  raccoonAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Palette.surface,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  raccoonAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.surface,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  raccoonContent: {
    flex: 1,
  },
  raccoonBubble: {
    backgroundColor: Palette.surface,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    borderRadius: Radius.lg,
    borderTopLeftRadius: Radius.sm,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    gap: 4,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  msgText: {
    lineHeight: 22,
  },
  tasksBox: {
    marginTop: Space.xs,
    backgroundColor: Palette.bg,
    borderRadius: Radius.md,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    padding: Space.sm,
    gap: Space.xs,
  },
  tasksBoxHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniTaskCard: {
    backgroundColor: Palette.surface,
    padding: Space.sm,
    borderRadius: Radius.sm,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    gap: 2,
  },
  goToTasksBtn: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
    marginBottom: Space.md,
  },
  typingBubble: {
    backgroundColor: Palette.surface,
    borderWidth: Border.thin,
    borderColor: Palette.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Space.md,
    paddingVertical: Space.xs + 2,
  },
  bottomArea: {
    backgroundColor: Palette.bg,
    borderTopWidth: Border.thin,
    borderTopColor: Palette.border,
    paddingTop: Space.xs + 2,
    gap: Space.xs + 2,
  },
  quickPromptsRow: {
    paddingHorizontal: Space.lg,
    gap: Space.xs,
  },
  quickPromptChip: {
    backgroundColor: Palette.surface,
    borderColor: Palette.border,
    borderWidth: Border.thin,
    borderRadius: pillRadius(32),
    paddingHorizontal: Space.md,
    paddingVertical: 6,
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    marginHorizontal: Space.lg,
    borderRadius: pillRadius(44),
    borderWidth: Border.thick,
    borderColor: Palette.border,
    paddingLeft: Space.md,
    paddingRight: Space.xs,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    fontFamily: Font.regular,
    fontSize: 14,
    color: Palette.text,
    maxHeight: 80,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Space.xs,
  },
  sendBtnDisabled: {
    backgroundColor: Palette.surfaceHi,
  },
});
