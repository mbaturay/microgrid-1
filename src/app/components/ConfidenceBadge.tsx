import { ConfidenceBadge as ConfidenceType } from '@/app/data/mockData';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface ConfidenceBadgeProps {
  confidence: ConfidenceType;
  size?: 'sm' | 'md';
}

const confidenceConfig: Record<ConfidenceType, { icon: React.ElementType; label: string; className: string }> = {
  computed: {
    icon: CheckCircle2,
    label: 'Computed',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  partial: {
    icon: AlertCircle,
    label: 'Partial',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  stubbed: {
    icon: HelpCircle,
    label: 'Stubbed',
    className: 'bg-gray-50 text-gray-600 border-gray-200',
  },
};

export function ConfidenceBadge({ confidence, size = 'md' }: ConfidenceBadgeProps) {
  const config = confidenceConfig[confidence];
  const Icon = config.icon;
  
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-2.5 py-1.5';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md font-medium border ${config.className} ${sizeClasses}`}>
      <Icon className={iconSize} />
      {config.label}
    </span>
  );
}
