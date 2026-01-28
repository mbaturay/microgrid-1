import { Project, Track } from '@/app/data/mockData';
import { Card } from '@/app/components/ui/card';
import { motion } from 'motion/react';
import { DollarSign, TrendingUp, Clock, Zap, MapPin, Calendar } from 'lucide-react';
import { LiveOutputsPanel } from '@/app/components/LiveOutputsPanel';

interface OverviewTabProps {
  project: Project;
}

export function OverviewTab({ project }: OverviewTabProps) {
  const tracks: Array<{ id: Track; title: string; description: string }> = [
    { id: 1, title: 'Track 1: End-of-Life Decision', description: 'Evaluate replacement vs. upgrade options for aging equipment' },
    { id: 2, title: 'Track 2: Fully Off-Grid Facility', description: 'Design standalone microgrid for complete energy independence' },
    { id: 3, title: 'Track 3: Isolate Critical Loads', description: 'Protect essential operations during grid outages' },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left Column: Project Info + Track Selection */}
      <div className="xl:col-span-2 space-y-6">
        {/* Project Summary Card */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold text-[var(--ef-black)] mb-6">Project Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--ef-teal)]/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[var(--ef-teal)]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Location</p>
                <p className="font-semibold text-[var(--ef-black)]">{project.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--ef-jade)]/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-[var(--ef-jade)]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Capacity</p>
                <p className="font-semibold text-[var(--ef-black)]">{project.capacity} MW</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Carbon Offset</p>
                <p className="font-semibold text-[var(--ef-black)]">{project.carbonOffset} tons</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">ROI</p>
                <p className="font-semibold text-[var(--ef-black)]">{project.roi}%</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Payback</p>
                <p className="font-semibold text-[var(--ef-black)]">{project.payback} years</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Stage</p>
                <p className="font-semibold text-[var(--ef-black)]">{project.stage}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Track Selector Card */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-[var(--ef-black)] mb-2">Select Analysis Track</h2>
          <p className="text-sm text-gray-600 mb-6">
            Choose the track that best matches your project requirements. This affects visible modules and calculations.
          </p>
          <div className="space-y-3">
            {tracks.map((track) => {
              const isSelected = project.track === track.id;
              return (
                <motion.button
                  key={track.id}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-[var(--ef-jade)] bg-[var(--ef-jade)]/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? 'border-[var(--ef-jade)] bg-[var(--ef-jade)]' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--ef-black)] mb-1">{track.title}</h3>
                      <p className="text-sm text-gray-600">{track.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {project.track && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Track {project.track} specific modules and guidance are now active.
                {project.track === 2 && ' Off-grid specific calculations are enabled.'}
                {project.track === 3 && ' Critical loads analysis tools are available.'}
              </p>
            </div>
          )}
        </motion.div>

        {/* Next Steps Card */}
        <motion.div
          className="bg-gradient-to-br from-[var(--ef-jade)]/10 to-[var(--ef-teal)]/10 rounded-xl border border-[var(--ef-jade)]/20 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-semibold text-lg text-[var(--ef-black)] mb-4">Next Steps</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[var(--ef-jade)] mt-1">✓</span>
              <span className="text-gray-700">Review and update Model Variables for accurate calculations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ef-jade)] mt-1">✓</span>
              <span className="text-gray-700">Upload interval data CSV with timestamp and kW/kWh columns</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ef-jade)] mt-1">✓</span>
              <span className="text-gray-700">Fine-tune consumption module based on track requirements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ef-jade)] mt-1">✓</span>
              <span className="text-gray-700">Export results when calculations are complete</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Right Column: Live Outputs Panel */}
      <div className="xl:col-span-1">
        <LiveOutputsPanel project={project} />
      </div>
    </div>
  );
}
