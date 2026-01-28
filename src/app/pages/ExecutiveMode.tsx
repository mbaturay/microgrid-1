import { useState, useMemo, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Search, TrendingUp, Zap, DollarSign, Target, Clock } from 'lucide-react';
import { ModeSwitch } from '@/app/components/ModeSwitch';
import { KPICard } from '@/app/components/KPICard';
import { StageBadge } from '@/app/components/StageBadge';
import { mockProjects, portfolioStats, pipelineCounts, ProjectStage } from '@/app/data/mockData';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';

const PortfolioMap = lazy(() => import('@/app/components/executive/PortfolioMap'));

export function ExecutiveMode() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<ProjectStage | 'All'>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const stages: Array<ProjectStage | 'All'> = ['All', 'Proposed', 'Analysis', 'Green Ink', 'Construction', 'Complete'];
  const regions = ['All', ...Array.from(new Set(mockProjects.map(p => p.location)))].sort();

  // Filter projects
  const filteredProjects = useMemo(() => {
    return mockProjects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = selectedStage === 'All' || project.stage === selectedStage;
      const matchesRegion = selectedRegion === 'All' || project.location === selectedRegion;
      return matchesSearch && matchesStage && matchesRegion;
    });
  }, [searchQuery, selectedStage, selectedRegion]);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-[var(--ef-light-2)]">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-[1920px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--ef-black)] mb-1">Solar ROI Portfolio</h1>
              <p className="text-sm text-gray-600">Executive Dashboard</p>
            </div>
            <ModeSwitch />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-8 py-8">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <KPICard
            title="Total Projects"
            value={portfolioStats.totalProjects}
            icon={Target}
          />
          <KPICard
            title="Total Capacity"
            value={`${portfolioStats.totalCapacity.toFixed(1)} MW`}
            icon={Zap}
          />
          <KPICard
            title="Carbon Offset"
            value={`${(portfolioStats.totalCarbonOffset / 1000).toFixed(1)}k`}
            subtitle="tons CO₂"
            icon={TrendingUp}
          />
          <KPICard
            title="Total Investment"
            value={`$${(portfolioStats.totalInvestment / 1000000).toFixed(1)}M`}
            icon={DollarSign}
          />
          <KPICard
            title="Avg ROI"
            value={`${portfolioStats.averageROI.toFixed(1)}%`}
            icon={TrendingUp}
          />
          <KPICard
            title="Avg Payback"
            value={`${portfolioStats.averagePayback.toFixed(1)} yrs`}
            icon={Clock}
          />
        </div>

        {/* Pipeline Stage Bar */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-semibold text-lg text-[var(--ef-black)] mb-4">Pipeline Stages</h3>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {stages.map((stage) => {
              const count = stage === 'All' 
                ? portfolioStats.totalProjects 
                : pipelineCounts[stage as ProjectStage];
              const isActive = selectedStage === stage;

              return (
                <button
                  key={stage}
                  onClick={() => setSelectedStage(stage)}
                  className={`px-3 sm:px-4 py-3 rounded-lg border-2 transition-all flex-1 sm:flex-initial min-w-[120px] ${
                    isActive
                      ? 'border-[var(--ef-jade)] bg-[var(--ef-jade)]/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-xs font-semibold text-gray-600 mb-1">{stage}</div>
                  <div className="text-xl sm:text-2xl font-bold text-[var(--ef-black)]">{count}</div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search projects or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ef-jade)]"
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region === 'All' ? 'All Regions' : region}
                </option>
              ))}
            </select>
            {(searchQuery || selectedStage !== 'All' || selectedRegion !== 'All') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStage('All');
                  setSelectedRegion('All');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Split View: Map + Project List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Panel */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-semibold text-lg text-[var(--ef-black)] mb-4">Project Locations</h3>
            <div className="h-[400px] sm:h-[500px] lg:h-[600px] rounded-lg border border-gray-200 overflow-hidden">
              <Suspense fallback={<div className="h-full w-full bg-[var(--ef-light-2)]" />}>
                <PortfolioMap
                  projects={filteredProjects}
                  selectedProjectId={selectedProjectId}
                  onSelect={handleSelectProject}
                />
              </Suspense>
            </div>
          </motion.div>

          {/* Recent Projects List */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-semibold text-lg text-[var(--ef-black)] mb-4">
              Projects ({filteredProjects.length})
            </h3>
            <div className="space-y-3 max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto pr-2">
              {filteredProjects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  className={`p-3 sm:p-4 rounded-lg border transition-all cursor-pointer group ${
                    selectedProjectId === project.id
                      ? 'border-[var(--ef-jade)] shadow-md'
                      : 'border-gray-200 hover:border-[var(--ef-jade)] hover:shadow-md'
                  }`}
                  onClick={() => handleSelectProject(project.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[var(--ef-black)] group-hover:text-[var(--ef-jade)] transition-colors truncate">
                        {project.name}
                      </h4>
                      <p className="text-sm text-gray-600">{project.location}</p>
                    </div>
                    <StageBadge stage={project.stage} size="sm" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">ROI</p>
                      <p className="text-sm font-semibold text-[var(--ef-jade)]">{project.roi}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payback</p>
                      <p className="text-sm font-semibold text-gray-700">{project.payback} yrs</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">NPV</p>
                      <p className="text-sm font-semibold text-gray-700">
                        ${(project.npv / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Capacity</p>
                      <p className="text-sm font-semibold text-gray-700">{project.capacity} MW</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}