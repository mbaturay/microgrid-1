import { Project } from '@/app/data/mockData';
import { Button } from '@/app/components/ui/button';
import { Download, FileDown, FileText, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { ConfidenceBadge } from '@/app/components/ConfidenceBadge';

interface OutputsTabProps {
  project: Project;
}

export function OutputsTab({ project }: OutputsTabProps) {
  const keyMetrics = [
    { label: 'Net Present Value (NPV)', value: `$${(project.npv / 1000000).toFixed(2)}M`, confidence: 'computed' as const },
    { label: 'Return on Investment (ROI)', value: `${project.roi}%`, confidence: 'computed' as const },
    { label: 'Simple Payback Period', value: `${project.payback} years`, confidence: 'computed' as const },
    { label: 'Total Capital Expenditure', value: `$${(project.totalInvestment / 1000000).toFixed(2)}M`, confidence: 'partial' as const },
    { label: 'Annual Energy Savings', value: `$${(project.annualSavings / 1000).toFixed(0)}k`, confidence: 'computed' as const },
    { label: 'Total Tax Benefits', value: `$${(project.totalTaxBenefit / 1000000).toFixed(2)}M`, confidence: 'stubbed' as const },
    { label: 'Levelized Cost of Energy (LCOE)', value: '$0.082/kWh', confidence: 'computed' as const },
    { label: 'Carbon Offset (25 years)', value: `${(project.carbonOffset * 25 / 1000).toFixed(1)}k tons CO₂`, confidence: 'computed' as const },
  ];

  const exportOptions = [
    { id: 'json', label: 'Export Project JSON', description: 'Complete project data in JSON format', icon: FileDown, available: true },
    { id: 'csv', label: 'Export Results CSV', description: 'Key outputs and calculations', icon: FileDown, available: true },
    { id: 'pdf', label: 'PDF Executive Summary', description: 'Formatted report for stakeholders', icon: FileText, available: false },
    { id: 'utility', label: 'Utility Filing Package', description: 'Documents for utility interconnection', icon: FileText, available: false },
    { id: 'incentive', label: 'Incentive Application Package', description: 'Supporting docs for rebate applications', icon: FileText, available: false },
  ];

  return (
    <div className="space-y-6">
      {/* Investment Summary */}
      <motion.div
        className="bg-gradient-to-br from-[var(--ef-jade)]/10 via-white to-[var(--ef-teal)]/10 rounded-xl border-2 border-[var(--ef-jade)]/20 shadow-lg p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-[var(--ef-black)] mb-6">Investment Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {keyMetrics.map((metric, idx) => (
            <motion.div
              key={metric.label}
              className="bg-white rounded-lg p-4 border border-gray-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-gray-600">{metric.label}</p>
                <ConfidenceBadge confidence={metric.confidence} size="sm" />
              </div>
              <p className="text-2xl font-bold text-[var(--ef-black)]">{metric.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Savings Narrative */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-xl font-bold text-[var(--ef-black)] mb-4">Financial Analysis</h3>
        <div className="prose max-w-none text-gray-700 space-y-3">
          <p>
            The <strong>{project.name}</strong> solar installation in {project.location} represents a financially sound investment 
            with an expected <strong>ROI of {project.roi}%</strong> and a payback period of <strong>{project.payback} years</strong>.
          </p>
          <p>
            With a total system capacity of <strong>{project.capacity} MW</strong>, the project will offset approximately{' '}
            <strong>{project.carbonOffset} tons of CO₂ annually</strong>, contributing significantly to sustainability goals.
          </p>
          <p>
            Annual energy savings are projected at <strong>${(project.annualSavings / 1000).toFixed(0)}k</strong>, 
            with total tax benefits estimated at <strong>${(project.totalTaxBenefit / 1000000).toFixed(2)}M</strong> over 
            the project lifetime. The net present value (NPV) of <strong>${(project.npv / 1000000).toFixed(2)}M</strong> indicates 
            substantial long-term value creation.
          </p>
        </div>
      </motion.div>

      {/* Key Assumptions */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-bold text-[var(--ef-black)] mb-4">Key Assumptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Project Lifetime</span>
              <span className="font-semibold text-gray-900">25 years</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Discount Rate</span>
              <span className="font-semibold text-gray-900">5.5%</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Annual Degradation</span>
              <span className="font-semibold text-gray-900">0.5%</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Federal ITC</span>
              <span className="font-semibold text-gray-900">30%</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Utility Escalation</span>
              <span className="font-semibold text-gray-900">3.2% / year</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Average Utility Rate</span>
              <span className="font-semibold text-gray-900">$0.145 / kWh</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">System Efficiency</span>
              <span className="font-semibold text-gray-900">22%</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Track</span>
              <span className="font-semibold text-gray-900">Track {project.track || 1}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Export Options */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-xl font-bold text-[var(--ef-black)] mb-6">Export & Download</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.id}
                className={`p-4 rounded-lg border ${
                  option.available
                    ? 'border-gray-200 hover:border-[var(--ef-jade)] hover:shadow-md'
                    : 'border-gray-100 bg-gray-50'
                } transition-all`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    option.available ? 'bg-[var(--ef-jade)]/10' : 'bg-gray-200'
                  }`}>
                    <Icon className={`w-5 h-5 ${option.available ? 'text-[var(--ef-jade)]' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{option.label}</h4>
                    <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                    <Button
                      size="sm"
                      variant={option.available ? 'default' : 'outline'}
                      disabled={!option.available}
                      className={option.available ? 'bg-[var(--ef-jade)] hover:bg-[var(--ef-jade)]/90' : ''}
                    >
                      {option.available ? (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Coming Soon
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
