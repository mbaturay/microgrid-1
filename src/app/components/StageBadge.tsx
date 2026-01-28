import type { ProjectStage } from '@/app/data/mockData';
import { getStageTheme } from '@/app/lib/stageStyles';

interface StageBadgeProps {
  stage: ProjectStage;
  size?: 'sm' | 'md' | 'lg';
}

export function StageBadge({ stage, size = 'md' }: StageBadgeProps) {
  const theme = getStageTheme(stage);
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${theme.badgeClass} ${sizeClasses[size]}`}>
      {stage}
    </span>
  );
}
