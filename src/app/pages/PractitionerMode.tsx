import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Download, Lock, Upload, Save } from 'lucide-react';
import { ModeSwitch } from '@/app/components/ModeSwitch';
import { StageBadge } from '@/app/components/StageBadge';
import { mockProjects, type Project, type SiteTeam, type VariableMap } from '@/app/data/mockData';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { OverviewTab } from '@/app/components/tabs/OverviewTab';
import { ModelVariablesTab } from '@/app/components/tabs/ModelVariablesTab';
import { IntervalDataTab } from '@/app/components/tabs/IntervalDataTab';
import { OutputsTab } from '@/app/components/tabs/OutputsTab';
import { computeOutputs } from '@/app/lib/projectCalculator';
import { useProjectLens } from '@/app/lib/ProjectLensContext';

export function PractitionerMode() {
  const STORAGE_KEY = 'microgrid-projects';
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { lens } = useProjectLens();
  const isEditableLens = lens === 'practitioner';
  const [previewTrack, setPreviewTrack] = useState<Project['track'] | null>(null);
  const [previewToast, setPreviewToast] = useState<string | null>(null);
  const previewToastRef = useRef<number | null>(null);
  const actionTooltip = 'Switch to Practitioner to edit or export project';
  const [projects, setProjects] = useState<Project[]>(() =>
    mockProjects.map((project) => {
      const track = project.track ?? 1;
      return {
        ...project,
        track,
        outputs: computeOutputs(project.variables, project.intervalData, track),
      };
    })
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Project[];
      const storedById = new Map(parsed.map((item) => [item.id, item]));
      const merged = mockProjects.map((project) => {
        const storedProject = storedById.get(project.id);
        if (!storedProject) {
          const track = project.track ?? 1;
          return {
            ...project,
            track,
            outputs: computeOutputs(project.variables, project.intervalData, track),
          };
        }

        const track = storedProject.track ?? project.track ?? 1;
        return {
          ...project,
          ...storedProject,
          track,
          meta: {
            ...project.meta,
            ...storedProject.meta,
            siteTeam: storedProject.meta?.siteTeam ?? project.meta?.siteTeam,
          },
          outputs: computeOutputs(storedProject.variables ?? project.variables, storedProject.intervalData ?? project.intervalData, track),
        };
      });
      setProjects(merged);
    } catch (error) {
      console.error('Failed to load projects from storage', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    return () => {
      if (previewToastRef.current) {
        window.clearTimeout(previewToastRef.current);
      }
    };
  }, []);

  const project = useMemo(() => projects.find((p) => p.id === projectId), [projects, projectId]);
  const displayTrack = useMemo(() => {
    if (!project) {
      return 1;
    }
    return previewTrack ?? project.track ?? 1;
  }, [project, previewTrack]);
  const previewOutputs = useMemo(() => {
    if (!project || isEditableLens || !previewTrack) {
      return undefined;
    }
    return computeOutputs(project.variables, project.intervalData, previewTrack);
  }, [project, isEditableLens, previewTrack]);

  const normalizeSiteTeam = (siteTeam: SiteTeam): SiteTeam => {
    const normalizeSingle = (value?: string) => value?.trim() || '';
    const normalizeList = (list?: string[]) => {
      if (!list) {
        return [];
      }
      const unique = new Set(
        list
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      );
      return Array.from(unique);
    };

    return {
      avp: normalizeSingle(siteTeam.avp),
      agmm: normalizeSingle(siteTeam.agmm),
      projectOrganizer: normalizeSingle(siteTeam.projectOrganizer),
      projectManagers: normalizeList(siteTeam.projectManagers),
      taxSupport: normalizeList(siteTeam.taxSupport),
    };
  };

  const updateProject = (nextProject: Project) => {
    const track = nextProject.track ?? 1;
    const outputs = computeOutputs(nextProject.variables, nextProject.intervalData, track);
    const withOutputs = { ...nextProject, track, outputs };
    setProjects((prev) => prev.map((item) => (item.id === withOutputs.id ? withOutputs : item)));
  };

  const handleUpdateSiteTeam = (siteTeam: SiteTeam) => {
    if (!project) {
      return;
    }
    const normalized = normalizeSiteTeam(siteTeam);
    updateProject({
      ...project,
      meta: {
        ...project.meta,
        siteTeam: normalized,
      },
    });
  };

  const handleUpdateTrack = (track: Project['track']) => {
    if (!project) {
      return;
    }
    updateProject({ ...project, track: track ?? 1 });
  };

  const handlePreviewTrack = (track: Project['track']) => {
    if (!track) {
      return;
    }
    setPreviewTrack(track);
    setPreviewToast(`Previewing Track ${track} — outputs updated (temporary).`);
    if (previewToastRef.current) {
      window.clearTimeout(previewToastRef.current);
    }
    previewToastRef.current = window.setTimeout(() => {
      setPreviewToast(null);
    }, 1200);
  };

  const handleApplyPreviewTrack = () => {
    if (!project || !previewTrack) {
      return;
    }
    handleUpdateTrack(previewTrack);
    setPreviewTrack(null);
    setPreviewToast(null);
  };

  const handleUpdateVariables = (variables: VariableMap) => {
    if (!project) {
      return;
    }
    updateProject({ ...project, variables });
  };

  const handleExportProject = () => {
    if (!project) {
      return;
    }

    const payload = JSON.stringify(project, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}-project.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImportProject = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !project) {
      return;
    }

    try {
      const text = await file.text();
      const imported = JSON.parse(text) as Project;
      const merged: Project = {
        ...project,
        ...imported,
        id: project.id,
        track: imported.track ?? project.track ?? 1,
        meta: {
          ...project.meta,
          ...imported.meta,
          siteTeam: normalizeSiteTeam(imported.meta?.siteTeam ?? project.meta?.siteTeam ?? {}),
        },
      };
      updateProject(merged);
    } catch (error) {
      console.error('Failed to import project', error);
    } finally {
      event.target.value = '';
    }
  };

  // Only show error if projectId exists and lookup fails
  if (projectId && !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <Button onClick={() => navigate('/')}>Return to Portfolio</Button>
        </div>
      </div>
    );
  }
  // If projectId is missing, do not show error (per requirements)
  if (!projectId) {
    return null;
  }

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
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                    className="text-[#03454D]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Portfolio
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-baseline gap-2">
                <h1 className="text-2xl font-bold text-[var(--ef-black)]">{project.name}</h1>
                <span className="text-sm text-gray-500">{project.location}</span>
              </div>
              <StageBadge stage={project.stage} />
            </div>
            <div className="flex items-center gap-3 min-h-[36px]">
              <ModeSwitch />
              {isEditableLens ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleImportProject}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import Project
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportProject}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Project
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#03454D] hover:bg-[#03454D]/90 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              ) : (
                <div className="h-[32px]" aria-hidden="true" />
              )}
            </div>
          </div>
        </div>
      </motion.header>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border border-gray-200 p-1 mb-6 w-full grid grid-cols-8 gap-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#03454D] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="budget"
              disabled={!isEditableLens}
              aria-disabled={!isEditableLens}
              className="data-[state=active]:bg-[#03454D] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              <span className="flex items-center gap-2">
                Budget
                {!isEditableLens && <Lock className="h-3 w-3" />}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="model-variables"
              disabled={!isEditableLens}
              aria-disabled={!isEditableLens}
              className="data-[state=active]:bg-[#03454D] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              <span className="flex items-center gap-2">
                Model Variables
                {!isEditableLens && <Lock className="h-3 w-3" />}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="interval-data"
              disabled={!isEditableLens}
              aria-disabled={!isEditableLens}
              className="data-[state=active]:bg-[#03454D] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              <span className="flex items-center gap-2">
                Interval Data
                {!isEditableLens && <Lock className="h-3 w-3" />}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="utility-baseline"
              disabled={!isEditableLens}
              className="data-[state=active]:bg-[#03454D] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              <span className="flex items-center gap-2">
                Utility Baseline
                {!isEditableLens && <Lock className="h-3 w-3" />}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="solar-baseline"
              disabled={!isEditableLens}
              className="data-[state=active]:bg-[#03454D] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              <span className="flex items-center gap-2">
                Solar Baseline
                {!isEditableLens && <Lock className="h-3 w-3" />}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="consumption"
              disabled={!isEditableLens}
              aria-disabled={!isEditableLens}
              className="data-[state=active]:bg-[#03454D] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              <span className="flex items-center gap-2">
                Consumption
                {!isEditableLens && <Lock className="h-3 w-3" />}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="outputs"
              className="data-[state=active]:bg-[#03454D] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Outputs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              project={project}
              onUpdateSiteTeam={handleUpdateSiteTeam}
              onUpdateTrack={isEditableLens ? handleUpdateTrack : undefined}
              lens={lens}
              trackMode={isEditableLens ? 'edit' : 'preview'}
              selectedTrack={isEditableLens ? project.track : displayTrack}
              previewTrack={previewTrack}
              onPreviewTrack={handlePreviewTrack}
              onApplyPreviewTrack={isEditableLens ? undefined : handleApplyPreviewTrack}
              previewToast={previewToast}
              outputsOverride={previewOutputs}
            />
          </TabsContent>

          <TabsContent value="budget">
            {isEditableLens ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-[var(--ef-black)] mb-6">Budget Intake</h2>
                <p className="text-gray-600 mb-6">
                  Edit budget inputs here. Calculated tables below are read-only.
                </p>
                <div className="text-center py-12 text-gray-400">
                  Budget form placeholder - editable fields for budget intake
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-[var(--ef-black)] mb-2">Budget Intake</h2>
                <p className="text-sm text-gray-600">Switch to Practitioner to edit budget inputs.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="model-variables">
            {isEditableLens ? (
              <ModelVariablesTab
                project={project}
                variables={project.variables}
                onUpdateVariables={handleUpdateVariables}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-[var(--ef-black)] mb-2">Model Variables</h2>
                <p className="text-sm text-gray-600">Switch to Practitioner to edit model variables.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="interval-data">
            {isEditableLens ? (
              <IntervalDataTab project={project} />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-[var(--ef-black)] mb-2">Interval Data</h2>
                <p className="text-sm text-gray-600">Switch to Practitioner to upload or edit interval data.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="utility-baseline">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-[var(--ef-black)] mb-6">Utility Baseline</h2>
              <p className="text-gray-600 mb-6">
                {isEditableLens
                  ? 'Read-only calculated utility baseline data. Edit Model Variables to adjust.'
                  : 'Switch to Practitioner to edit inputs that affect utility baseline.'}
              </p>
              <div className="text-center py-12 text-gray-400">
                Utility baseline tables - read-only with lock icons
              </div>
            </div>
          </TabsContent>

          <TabsContent value="solar-baseline">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-[var(--ef-black)] mb-6">Solar Baseline</h2>
              <p className="text-gray-600 mb-6">
                {isEditableLens
                  ? 'Read-only calculated solar baseline data. Edit Model Variables to adjust.'
                  : 'Switch to Practitioner to edit inputs that affect solar baseline.'}
              </p>
              <div className="text-center py-12 text-gray-400">
                Solar baseline tables - read-only with lock icons
              </div>
            </div>
          </TabsContent>

          <TabsContent value="consumption">
            {isEditableLens ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-[var(--ef-black)] mb-6">Consumption Module</h2>
                <p className="text-gray-600 mb-6">
                  Fine-tune consumption parameters. Track-specific guidance below.
                </p>
                <div className="text-center py-12 text-gray-400">
                  Consumption fine-tune controls - sliders and selects
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-[var(--ef-black)] mb-2">Consumption Module</h2>
                <p className="text-sm text-gray-600">Switch to Practitioner to edit consumption inputs.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="outputs">
            <OutputsTab project={project} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}