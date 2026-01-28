import { Project, ConfidenceBadge as ConfidenceType } from '@/app/data/mockData';
import { motion } from 'motion/react';
import { ConfidenceBadge } from '@/app/components/ConfidenceBadge';
import { DollarSign, TrendingUp, Clock, Zap, PiggyBank, FileText } from 'lucide-react';

interface LiveOutputsPanelProps {
  project: Project;
  isRecalculating?: boolean;
  prefersReducedMotion?: boolean;
}

interface OutputMetric {
  label: string;
  value: string;
  confidence: ConfidenceType;
  icon: React.ElementType;
}

const formatCurrency = (value: number, decimals = 2) =>
  `$${(value / 1000000).toFixed(decimals)}M`;

const formatCurrencyShort = (value: number) => `$${(value / 1000).toFixed(0)}k`;

export function LiveOutputsPanel({
  project,
  isRecalculating = false,
  prefersReducedMotion = false,
}: LiveOutputsPanelProps) {
  const outputs = project.outputs;
  const outputGroups: { title: string; items: OutputMetric[] }[] = [
    {
      title: 'Financial',
      items: [
        {
          label: 'NPV',
          value: outputs ? formatCurrency(outputs.npv.value) : `$${(project.npv / 1000000).toFixed(2)}M`,
          confidence: outputs?.npv.confidence ?? 'computed',
          icon: DollarSign,
        },
        {
          label: 'ROI',
          value: outputs ? `${outputs.roi.value.toFixed(1)}%` : `${project.roi}%`,
          confidence: outputs?.roi.confidence ?? 'computed',
          icon: TrendingUp,
        },
        {
          label: 'Payback',
          value: outputs ? `${outputs.payback.value.toFixed(1)} years` : `${project.payback} years`,
          confidence: outputs?.payback.confidence ?? 'computed',
          icon: Clock,
        },
        {
          label: 'CapEx',
          value: outputs ? formatCurrency(outputs.capex.value) : `$${(project.totalInvestment / 1000000).toFixed(2)}M`,
          confidence: outputs?.capex.confidence ?? 'partial',
          icon: PiggyBank,
        },
      ],
    },
    {
      title: 'Energy',
      items: [
        {
          label: 'Annual Savings',
          value: outputs ? formatCurrencyShort(outputs.annualSavings.value) : `$${(project.annualSavings / 1000).toFixed(0)}k`,
          confidence: outputs?.annualSavings.confidence ?? 'computed',
          icon: Zap,
        },
      ],
    },
    {
      title: 'Incentives',
      items: [
        {
          label: 'Total Tax Benefit',
          value: outputs ? formatCurrency(outputs.totalTaxBenefit.value) : `$${(project.totalTaxBenefit / 1000000).toFixed(2)}M`,
          confidence: outputs?.totalTaxBenefit.confidence ?? 'stubbed',
          icon: FileText,
        },
      ],
    },
  ];

  return (
    <motion.div
      className="sticky top-24 bg-white rounded-xl shadow-lg border-2 border-[var(--ef-jade)]/20 p-6 relative"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      {isRecalculating && (
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-[var(--ef-jade)]/30 animate-pulse" />
      )}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg text-[var(--ef-black)]">Live Outputs</h3>
        <div className={`w-2 h-2 rounded-full bg-[var(--ef-jade)] ${isRecalculating ? 'animate-pulse' : ''}`} />
      </div>

      <div className="space-y-6">
        {outputGroups.map((group, groupIndex) => (
          <div key={group.title} className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {group.title}
            </div>
            {group.items.map((output, idx) => {
              const Icon = output.icon;
              return (
                <motion.div
                  key={output.label}
                  className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-200"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + groupIndex * 0.08 + idx * 0.04 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[var(--ef-jade)]/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[var(--ef-jade)]" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">{output.label}</span>
                    </div>
                    <ConfidenceBadge confidence={output.confidence} size="sm" />
                  </div>
                  <p className="text-2xl font-bold text-[var(--ef-black)] ml-10">
                    <motion.span
                      key={output.value}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {output.value}
                    </motion.span>
                  </p>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <div className={`w-2 h-2 rounded-full bg-[var(--ef-jade)] ${isRecalculating ? 'animate-pulse' : ''}`} />
          <span>{isRecalculating ? 'Recalculating…' : 'Auto-updating on changes'}</span>
        </div>
        <p className="text-xs text-gray-500">
          Values update automatically when you modify Model Variables or upload new data.
          Confidence badges indicate data quality.
        </p>
      </div>
    </motion.div>
  );
}
