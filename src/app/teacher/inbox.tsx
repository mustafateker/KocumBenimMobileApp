import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { GhostButton, IconButton, NeonButton, PressScale } from '@/components/button';
import { CanvasView } from '@/components/canvas-view';
import { Screen, ScreenHeader } from '@/components/screen';
import { Card, EmptyState, Txt } from '@/components/ui';
import { replyToQuestion, setQuestionStatus, teacherInbox, type InboxQuestion } from '@/db/repo';
import { initials, parseCanvas, type QuestionStatus } from '@/db/types';
import { relativeTime } from '@/lib/date';
import { OnColor, Palette, Radius, Space } from '@/theme/tokens';

type Filter = 'all' | QuestionStatus;

const FILTERS: { key: Filter; label: string; color: string }[] = [
  { key: 'all', label: 'Hepsi', color: Palette.purple },
  { key: 'pending', label: 'Bekleyen', color: Palette.orange },
  { key: 'in_lesson', label: 'Derste', color: Palette.blue },
  { key: 'answered', label: 'Cevaplandı', color: Palette.green },
];

export default function Inbox() {
  const db = useSQLiteContext();
  const [filter, setFilter] = useState<Filter>('all');
  const [questions, setQuestions] = useState<InboxQuestion[]>([]);
  const [replying, setReplying] = useState<InboxQuestion | null>(null);

  const load = useCallback(() => {
    teacherInbox(db, filter === 'all' ? undefined : filter).then(setQuestions);
  }, [db, filter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const markInLesson = useCallback(
    async (q: InboxQuestion) => {
      await setQuestionStatus(db, q.id, q.status === 'in_lesson' ? 'pending' : 'in_lesson');
      load();
    },
    [db, load]
  );

  return (
    <>
      <Screen tint={Palette.orange}>
        <ScreenHeader title="Gelen Kutusu" subtitle="Öğrencilerin takıldığı sorular." />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <PressScale key={f.key} onPress={() => setFilter(f.key)} scaleTo={0.96}>
                <View
                  style={[
                    styles.filter,
                    active && { backgroundColor: f.color, borderColor: f.color },
                  ]}
                >
                  <Txt variant="smallStrong" color={active ? OnColor : Palette.textDim}>
                    {f.label}
                  </Txt>
                </View>
              </PressScale>
            );
          })}
        </ScrollView>

        {questions.length === 0 ? (
          <EmptyState
            icon="mail-open-outline"
            title="Burası tertemiz"
            subtitle="Bu filtrede gösterilecek soru yok."
            color={Palette.orange}
          />
        ) : (
          questions.map((q) => (
            <InboxCard
              key={q.id}
              question={q}
              onToggleLesson={() => markInLesson(q)}
              onReply={() => setReplying(q)}
            />
          ))
        )}
      </Screen>

      <ReplyModal
        question={replying}
        onClose={() => setReplying(null)}
        onSent={() => {
          setReplying(null);
          load();
        }}
      />
    </>
  );
}

function InboxCard({
  question,
  onToggleLesson,
  onReply,
}: {
  question: InboxQuestion;
  onToggleLesson: () => void;
  onReply: () => void;
}) {
  const answered = question.status === 'answered';
  const inLesson = question.status === 'in_lesson';

  return (
    <Card accent={answered ? Palette.green : inLesson ? Palette.blue : Palette.orange} style={styles.card}>
      <View style={styles.cardHead}>
        <View style={styles.who}>
          <View style={styles.avatar}>
            <Txt variant="tiny" color={Palette.purple}>
              {initials(question.student_name)}
            </Txt>
          </View>
          <View>
            <Txt variant="smallStrong">{question.student_name}</Txt>
            <Txt variant="tiny" color={Palette.textFaint}>
              {relativeTime(question.created_at)}
            </Txt>
          </View>
        </View>
      </View>

      {question.image_uri ? (
        <CanvasView
          imageUri={question.image_uri}
          canvas={parseCanvas(question.strokes)}
          style={styles.canvas}
        />
      ) : null}

      {question.note ? (
        <View style={styles.note}>
          <Ionicons name="chatbubble-outline" size={14} color={Palette.textDim} />
          <Txt variant="small" style={styles.flex}>
            {question.note}
          </Txt>
        </View>
      ) : null}

      {question.teacher_reply ? (
        <View style={styles.reply}>
          <Ionicons name="checkmark-circle" size={15} color={Palette.green} />
          <Txt variant="small" style={styles.flex}>
            {question.teacher_reply}
          </Txt>
        </View>
      ) : null}

      <View style={styles.actions}>
        <GhostButton
          label={inLesson ? 'İşaretli' : 'Derste çöz'}
          icon={inLesson ? 'checkmark-circle' : 'school-outline'}
          color={Palette.blue}
          onPress={onToggleLesson}
          style={styles.flex}
          full
        />
        <NeonButton
          label={answered ? 'Düzenle' : 'Cevapla'}
          icon="paper-plane"
          color={Palette.orange}
          onPress={onReply}
          style={styles.flex}
          full
        />
      </View>
    </Card>
  );
}

function ReplyModal({
  question,
  onClose,
  onSent,
}: {
  question: InboxQuestion | null;
  onClose: () => void;
  onSent: () => void;
}) {
  const db = useSQLiteContext();
  const [text, setText] = useState('');

  // Farkli bir soru acildiginda kutuyu o sorunun mevcut cevabiyla doldur.
  const [loadedFor, setLoadedFor] = useState<number | null>(null);
  if (question && loadedFor !== question.id) {
    setLoadedFor(question.id);
    setText(question.teacher_reply ?? '');
  }

  const send = useCallback(async () => {
    if (!question || text.trim().length === 0) return;
    await replyToQuestion(db, question.id, text.trim());
    setText('');
    setLoadedFor(null);
    onSent();
  }, [db, question, text, onSent]);

  return (
    <Modal visible={question !== null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHead}>
            <Txt variant="section">{question?.student_name} için cevap</Txt>
            <IconButton icon="close" onPress={onClose} size={34} />
          </View>

          {question?.note ? (
            <Txt variant="small" color={Palette.textDim}>
              “{question.note}”
            </Txt>
          ) : null}

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="İpucu ver, çözümü tamamen verme…"
            placeholderTextColor={Palette.textFaint}
            style={styles.input}
            multiline
            autoFocus
          />

          <NeonButton
            label="Gönder"
            icon="paper-plane"
            color={Palette.orange}
            full
            disabled={text.trim().length === 0}
            onPress={send}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  filters: {
    flexDirection: 'row',
    gap: Space.sm,
    paddingRight: Space.lg,
  },
  filter: {
    height: 36,
    paddingHorizontal: Space.lg,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    gap: Space.md,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.sm,
  },
  who: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.purpleSoft,
  },
  canvas: {
    height: 200,
  },
  note: {
    flexDirection: 'row',
    gap: Space.sm,
    alignItems: 'flex-start',
  },
  reply: {
    flexDirection: 'row',
    gap: Space.sm,
    alignItems: 'flex-start',
    padding: Space.md,
    borderRadius: Radius.md,
    backgroundColor: Palette.greenSoft,
  },
  actions: {
    flexDirection: 'row',
    gap: Space.sm,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Palette.overlay,
  },
  modalCard: {
    gap: Space.md,
    padding: Space.xl,
    paddingBottom: Space.xxl,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    backgroundColor: Palette.bg,
  },
  modalHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.sm,
  },
  input: {
    minHeight: 96,
    maxHeight: 180,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    padding: Space.lg,
    color: Palette.text,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    textAlignVertical: 'top',
  },
});
