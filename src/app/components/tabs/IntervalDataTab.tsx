import { useState } from 'react';
import { Project } from '@/app/data/mockData';
import { LiveOutputsPanel } from '@/app/components/LiveOutputsPanel';
import { Button } from '@/app/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { motion } from 'motion/react';

interface IntervalDataTabProps {
  project: Project;
}

type QACheck = {
  id: string;
  label: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
};

export function IntervalDataTab({ project }: IntervalDataTabProps) {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [qaChecks] = useState<QACheck[]>([
    { id: 'duplicates', label: 'Duplicate Timestamps', status: 'pass', message: 'No duplicates found' },
    { id: 'outliers', label: 'Outlier Detection', status: 'warning', message: '3 potential outliers detected' },
    { id: 'missing', label: 'Missing Months', status: 'fail', message: 'Missing data for July 2025' },
    { id: 'format', label: 'Timestamp Format', status: 'pass', message: 'All timestamps valid (YYYY-MM-DD HH:MM:SS)' },
    { id: 'column', label: 'Column Headers', status: 'pass', message: 'kW column detected correctly' },
  ]);

  const statusConfig = {
    pass: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    warning: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    fail: { icon: X, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left Column: Upload and QA */}
      <div className="xl:col-span-2 space-y-6">
        {/* Upload Section */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold text-[var(--ef-black)] mb-6">Interval Data Upload</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">CSV Requirements</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Column 1:</strong> Timestamp (YYYY-MM-DD HH:MM:SS format)</li>
              <li>• <strong>Column 2:</strong> Energy value labeled as "kW" or "kWh"</li>
              <li>• No duplicate timestamps</li>
              <li>• Minimum 12 months of data recommended</li>
            </ul>
          </div>

          {!fileUploaded ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-[var(--ef-jade)] transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">Drop CSV file here or click to browse</p>
              <p className="text-sm text-gray-500 mb-4">Maximum file size: 50MB</p>
              <Button
                onClick={() => setFileUploaded(true)}
                className="bg-[var(--ef-jade)] hover:bg-[var(--ef-jade)]/90"
              >
                Select File
              </Button>
            </div>
          ) : (
            <div className="border border-[var(--ef-jade)] rounded-lg p-4 bg-[var(--ef-jade)]/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-[var(--ef-jade)]" />
                  <div>
                    <p className="font-semibold text-[var(--ef-black)]">interval_data_2025.csv</p>
                    <p className="text-sm text-gray-600">8,760 rows • 2.4 MB • Uploaded 2 mins ago</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setFileUploaded(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* QA Checks Section */}
        {fileUploaded && (
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xl font-bold text-[var(--ef-black)] mb-6">Data Quality Checks</h3>
            
            <div className="space-y-3 mb-6">
              {qaChecks.map((check, idx) => {
                const config = statusConfig[check.status];
                const Icon = config.icon;
                return (
                  <motion.div
                    key={check.id}
                    className={`p-4 rounded-lg border ${config.border} ${config.bg}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{check.label}</p>
                        <p className="text-sm text-gray-600 mt-1">{check.message}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {qaChecks.some(c => c.status === 'fail' || c.status === 'warning') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  <strong>Action Required:</strong> Please review and fix the issues above. 
                  You can re-upload a corrected CSV file or proceed with warnings (not recommended).
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">Fix and Re-upload</Button>
                  <Button size="sm" variant="ghost" className="text-yellow-700">Proceed Anyway</Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Preview Table */}
        {fileUploaded && (
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-[var(--ef-black)] mb-6">Data Preview (First 10 Rows)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Timestamp</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">kW</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }, (_, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-600">2025-01-{String(i + 1).padStart(2, '0')} 00:00:00</td>
                      <td className="py-2 px-3 text-right text-gray-900">{(Math.random() * 500 + 1000).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">Showing 10 of 8,760 rows</p>
          </motion.div>
        )}

        {/* Important Note */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 mb-1">Do Not Edit Calculated Tables</p>
              <p className="text-sm text-red-800">
                Interval data is used for calculations only. To modify results, edit Model Variables or Budget Intake instead.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Live Outputs Panel */}
      <div className="xl:col-span-1">
        <LiveOutputsPanel project={project} />
      </div>
    </div>
  );
}
