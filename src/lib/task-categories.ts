import type { Ionicons } from '@expo/vector-icons';

import { Accent } from '@/theme/tokens';
import type { Task, TaskCategory } from './types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORY_META: Record<TaskCategory, { label: string; color: string; icon: IconName }> = {
  question: { label: 'Soru Çözme', color: Accent, icon: 'help-circle' },
  topic: { label: 'Konu Çalışma', color: Accent, icon: 'book' },
  focus: { label: 'Odaklı Çalışma', color: Accent, icon: 'timer' },
};

export function categoryLabel(category: TaskCategory): string {
  return CATEGORY_META[category]?.label ?? CATEGORY_META.question.label;
}

export function categoryColor(category: TaskCategory): string {
  return CATEGORY_META[category]?.color ?? CATEGORY_META.question.color;
}

export function categoryIcon(category: TaskCategory): IconName {
  return CATEGORY_META[category]?.icon ?? CATEGORY_META.question.icon;
}

/**
 * Gorevin hedefinin birimi. `target` soru cozmede soru sayisi, odakli calismada dakika,
 * konu calismada 1'dir (calisildi / calisilmadi). Bu ayrimdan once atanmis odakli ve konu
 * gorevlerinde (suresi olmayan ya da hedefi 1'den buyuk) hedef hala soru sayisidir.
 */
export type TaskGoal = 'questions' | 'minutes' | 'topic';

export function taskGoal(task: Task): TaskGoal {
  if (task.category === 'focus' && task.durationMinutes) return 'minutes';
  if (task.category === 'topic' && task.target === 1) return 'topic';
  return 'questions';
}

/** Kartlarda basligin yaninda gorunen kisa hedef: "5/20", "45 dk" ya da "Konu". */
export function taskGoalLabel(task: Task): string {
  const goal = taskGoal(task);
  if (goal === 'minutes') return `${task.durationMinutes} dk`;
  if (goal === 'topic') return 'Konu';
  return `${task.done}/${task.target}`;
}

/** Kartta baslik altindaki ders/konu satiri; baslik zaten konunun adiysa yalnizca ders. */
export function taskTopicLabel(task: Task): string {
  if (!task.topic) return '';
  return task.topic === task.title ? task.subject : `${task.subject} · ${task.topic}`;
}
