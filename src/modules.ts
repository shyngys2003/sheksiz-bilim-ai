import type { Key } from './i18n';
export type ModuleId = 'adaptive' | 'social' | 'story';
export const MODULES: { id: ModuleId; icon: string; tone: string; title: Key; desc: Key }[] = [
  { id: 'adaptive', icon: '🧩', tone: 'sky', title: 'adaptive', desc: 'adaptiveD' },
  { id: 'social', icon: '💬', tone: 'mint', title: 'social', desc: 'socialD' },
  { id: 'story', icon: '📖', tone: 'sun', title: 'story', desc: 'storyD' },
];
