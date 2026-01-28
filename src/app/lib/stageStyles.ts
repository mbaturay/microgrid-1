import type { ProjectStage } from '@/app/data/mockData';

export type Stage = ProjectStage | 'All';

export const STAGES: Stage[] = ['All', 'Proposed', 'Analysis', 'Green Ink', 'Construction', 'Complete'];

const stageThemes: Record<Stage, {
  label: string;
  dotColor: string;
  badgeClass: string;
  tileClass: string;
  ringClass: string;
  textClass: string;
}> = {
  All: {
    label: 'All',
    dotColor: '#64748B',
    badgeClass: 'bg-white text-slate-700 border border-slate-200',
    tileClass: 'border border-slate-200 border-l-4 border-l-slate-300 bg-slate-50/40',
    ringClass: 'ring-slate-300/70',
    textClass: 'text-slate-700',
  },
  Proposed: {
    label: 'Proposed',
    dotColor: '#94A3B8',
    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
    tileClass: 'border border-slate-200 border-l-4 border-l-slate-300 bg-slate-50/70',
    ringClass: 'ring-slate-300/70',
    textClass: 'text-slate-700',
  },
  Analysis: {
    label: 'Analysis',
    dotColor: '#60A5FA',
    badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    tileClass: 'border border-blue-200 border-l-4 border-l-blue-300 bg-blue-50/60',
    ringClass: 'ring-blue-300/70',
    textClass: 'text-blue-800',
  },
  'Green Ink': {
    label: 'Green Ink',
    dotColor: '#10B981',
    badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    tileClass: 'border border-emerald-200 border-l-4 border-l-emerald-400 bg-emerald-50/60',
    ringClass: 'ring-emerald-300/70',
    textClass: 'text-emerald-800',
  },
  Construction: {
    label: 'Construction',
    dotColor: '#F59E0B',
    badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200',
    tileClass: 'border border-amber-200 border-l-4 border-l-amber-400 bg-amber-50/60',
    ringClass: 'ring-amber-300/70',
    textClass: 'text-amber-800',
  },
  Complete: {
    label: 'Complete',
    dotColor: '#0F766E',
    badgeClass: 'bg-teal-100 text-teal-800 border border-teal-200',
    tileClass: 'border border-teal-200 border-l-4 border-l-teal-500 bg-teal-50/60',
    ringClass: 'ring-teal-300/70',
    textClass: 'text-teal-800',
  },
};

export const getStageTheme = (stage: Stage) => stageThemes[stage];
