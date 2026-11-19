export type ExType = 'choice' | 'picture' | 'match' | 'order';
export type Opt = { id: string; text: string; emoji?: string };
export type Exercise = {
  id: string; type: ExType; level: number; instruction: string; simpleInstruction: string; question: string;
  steps: string[]; hints: string[]; explanation: string; visualExample: string;
  options?: Opt[]; answer?: string; pairs?: { l: string; r: string }[]; items?: string[];
};
export type Result = { exId: string; level: number; attempts: number; hints: number; correct: boolean };
export type Assignment = { id: string; title: string; subject: string; grade: number; topic: string; objective: string; needs: string[]; maxLevel: number; lang: 'kk' | 'ru'; source: 'ai' | 'offline'; exercises: Exercise[] };
export type Progress = { alias: string; assignmentId: string; results: Result[]; level: number };
