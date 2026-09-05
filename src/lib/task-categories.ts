import type { Ionicons } from '@expo/vector-icons';

import { Palette } from '@/theme/tokens';
import type { TaskCategory } from './types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORY_META: Record<TaskCategory, { label: string; color: string; icon: IconName }> = {
  question: { label: 'Soru Çözme', color: Palette.blue, icon: 'help-circle' },
  topic: { label: 'Konu Çalışma', color: Palette.purple, icon: 'book' },
  focus: { label: 'Odaklı Çalışma', color: Palette.orange, icon: 'timer' },
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
