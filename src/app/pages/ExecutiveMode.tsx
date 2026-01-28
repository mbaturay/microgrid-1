import { useState, useMemo, Suspense, lazy, type ComponentType, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Search, TrendingUp, Zap, DollarSign, Target, Clock } from 'lucide-react';
import { ModeSwitch } from '@/app/components/ModeSwitch';
import { KPICard } from '@/app/components/KPICard';
import { Skeleton } from '@/app/components/ui/skeleton';
import { mockProjects, portfolioStats, pipelineCounts, ProjectStage } from '@/app/data/mockData';
import { STAGES, getStageTheme, type Stage } from '@/app/lib/stageStyles';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { ProjectsList } from '@/app/components/executive/ProjectsList';

const dynamic = <T extends ComponentType<any>>(loader: () => Promise<{ default: T }>) => lazy(loader);
const PortfolioMap = dynamic(() => import('@/app/components/executive/PortfolioMap'));

export function ExecutiveMode() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStages, setSelectedStages] = useState<Stage[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [hoverSource, setHoverSource] = useState<'map' | 'list' | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const regions = ['All', ...Array.from(new Set(mockProjects.map(p => p.location)))].sort();

  const baseFilteredProjects = useMemo(() => {
    return mockProjects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = selectedRegion === 'All' || project.location === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, selectedRegion]);

  const stageFilteredProjects = useMemo(() => {
    if (selectedStages.length === 0) {
      return baseFilteredProjects;
    }

    return baseFilteredProjects.filter(project => selectedStages.includes(project.stage));
  }, [baseFilteredProjects, selectedStages]);

  const stageCounts = useMemo(() => {
    return baseFilteredProjects.reduce<Record<ProjectStage, number>>(
      (acc, project) => {
        acc[project.stage] = (acc[project.stage] ?? 0) + 1;
        return acc;
      },
      {
        Proposed: 0,
        Analysis: 0,
        'Green Ink': 0,
        Construction: 0,
        Complete: 0,
      }
    );
  }, [baseFilteredProjects]);

  const toggleStage = (stage: Stage) => {
    if (stage === 'All') {
      return;
    }

    setSelectedStages((prev) =>
      prev.includes(stage) ? prev.filter((item) => item !== stage) : [...prev, stage]
    );
  };

  const clearStages = () => {
    setSelectedStages([]);
  };

  const hasStageFilters = selectedStages.length > 0;
  const hasRegionFilter = selectedRegion !== 'All';
  const hasFilters = hasStageFilters || hasRegionFilter;
  const hasSearch = searchQuery.trim().length > 0;

  const showSearchOnlyEmpty = hasSearch && !hasFilters && stageFilteredProjects.length === 0;
  const showFiltersOnlyEmpty = !hasSearch && hasFilters && stageFilteredProjects.length === 0;
  const showSearchAndFiltersEmpty = hasSearch && hasFilters && stageFilteredProjects.length === 0;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updatePreference);
    } else {
      mediaQuery.addListener(updatePreference);
    }

    const timer = window.setTimeout(() => setIsLoading(false), 250);
    return () => {
      window.clearTimeout(timer);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updatePreference);
      } else {
        mediaQuery.removeListener(updatePreference);
      }
    };
  }, []);

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
          {isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-7 w-20" />
              </div>
            ))
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Pipeline Stage Bar */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="font-semibold text-lg text-[var(--ef-black)]">
              Pipeline Stages ({baseFilteredProjects.length})
            </h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">Counts reflect current search &amp; region filters.</p>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="rounded-lg border border-gray-200 bg-white px-4 py-3 min-w-[120px]">
                  <Skeleton className="h-3 w-16 mb-3" />
                  <Skeleton className="h-6 w-10" />
                </div>
              ))
            ) : (
              STAGES.filter((stage) => stage !== 'All').map((stage) => {
                const count = stageCounts[stage as ProjectStage];
                const isActive = selectedStages.includes(stage);
                const theme = getStageTheme(stage);
                const hoverLift = prefersReducedMotion ? '' : 'hover:-translate-y-[1px]';

                return (
                  <button
                    key={stage}
                    onClick={() => toggleStage(stage)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleStage(stage);
                      }
                    }}
                    aria-pressed={isActive}
                    className={`px-3 sm:px-4 py-3 rounded-lg transition-all duration-150 flex-1 sm:flex-initial min-w-[120px] border cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ef-jade)] ${hoverLift} ${
                      isActive
                        ? `${theme.tileClass} ring-2 ${theme.ringClass}`
                        : 'border-gray-200 bg-white hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: theme.dotColor }}
                      />
                      <div className="text-xs font-semibold text-gray-600">{stage}</div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-[var(--ef-black)]">{count}</div>
                  </button>
                );
              })
            )}
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
              {hasSearch && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
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
            {hasFilters && (
              <Button
                variant="outline"
                onClick={() => {
                  clearStages();
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
            <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-lg border border-gray-200 overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm">
                  <Skeleton className="h-full w-full rounded-none" />
                </div>
              )}
              <Suspense fallback={<div className="h-full w-full bg-[var(--ef-light-2)]" />}>
                <PortfolioMap
                  projects={stageFilteredProjects}
                  selectedProjectId={selectedProjectId}
                  hoveredProjectId={hoveredProjectId}
                  onSelectProject={handleSelectProject}
                  onHoverProject={setHoveredProjectId}
                  onHoverSourceChange={setHoverSource}
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
              Projects ({stageFilteredProjects.length})
            </h3>
            {showSearchOnlyEmpty && (
              <div className="rounded-lg border border-dashed border-gray-200 bg-[var(--ef-light-2)] p-6 text-center space-y-2">
                <div className="text-sm text-gray-700">No projects found</div>
                <div className="text-xs text-gray-400">Try adjusting your search.</div>
              </div>
            )}
            {showFiltersOnlyEmpty && (
              <div className="rounded-lg border border-dashed border-gray-200 bg-[var(--ef-light-2)] p-6 text-center space-y-2">
                <div className="text-sm text-gray-700">No projects match the selected filters</div>
                <Button
                  variant="outline"
                  onClick={() => {
                    clearStages();
                    setSelectedRegion('All');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
            {showSearchAndFiltersEmpty && (
              <div className="rounded-lg border border-dashed border-gray-200 bg-[var(--ef-light-2)] p-6 text-center space-y-2">
                <div className="text-sm text-gray-700">No projects match your search and filters</div>
                <div className="text-xs text-gray-400">Try refining your search or clearing filters.</div>
                <Button
                  variant="outline"
                  onClick={() => {
                    clearStages();
                    setSelectedRegion('All');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
            {!showSearchOnlyEmpty && !showFiltersOnlyEmpty && !showSearchAndFiltersEmpty && (
              <ProjectsList
                projects={stageFilteredProjects}
                selectedProjectId={selectedProjectId}
                hoveredProjectId={hoveredProjectId}
                hoverSource={hoverSource}
                onSelectProject={handleSelectProject}
                onHoverProject={setHoveredProjectId}
                onHoverSourceChange={setHoverSource}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}