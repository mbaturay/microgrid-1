import { ProjectStage } from '@/app/data/mockData';

interface StageBadgeProps {
  stage: ProjectStage;
  size?: 'sm' | 'md' | 'lg';
}

const stageColors: Record<ProjectStage, string> = {
  'Proposed': 'bg-gray-100 text-gray-700',
  'Analysis': 'bg-blue-100 text-blue-700',
  'Green Ink': 'bg-[var(--ef-jade)]/10 text-[var(--ef-jade)]',
  'Construction': 'bg-[var(--ef-yellow)]/20 text-[var(--ef-teal)]',
  'Complete': 'bg-green-100 text-green-700',
};

export function StageBadge({ stage, size = 'md' }: StageBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${stageColors[stage]} ${sizeClasses[size]}`}>
      {stage}
    </span>
  );
}
