import { useEffect, useState } from 'react';
import { Project, Track, type SiteTeam } from '@/app/data/mockData';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { motion } from 'motion/react';
import { DollarSign, TrendingUp, Clock, Zap, MapPin, Calendar, Lock } from 'lucide-react';
import { LiveOutputsPanel } from '@/app/components/LiveOutputsPanel';

interface OverviewTabProps {
  project: Project;
  onUpdateSiteTeam?: (siteTeam: SiteTeam) => void;
  onUpdateTrack?: (track: Track) => void;
  lens?: 'executive' | 'practitioner';
  trackMode?: 'preview' | 'edit';
  selectedTrack?: Track;
  previewTrack?: Track | null;
  onPreviewTrack?: (track: Track) => void;
  onApplyPreviewTrack?: () => void;
  previewToast?: string | null;
  outputsOverride?: Project['outputs'];
}

const emptySiteTeam: SiteTeam = {
  avp: '',
  agmm: '',
  projectOrganizer: '',
  projectManagers: [],
  taxSupport: [],
};

export function OverviewTab({
  project,
  onUpdateSiteTeam,
  onUpdateTrack,
  lens = 'practitioner',
  trackMode = 'edit',
  selectedTrack,
  previewTrack,
  onPreviewTrack,
  onApplyPreviewTrack,
  previewToast,
  outputsOverride,
}: OverviewTabProps) {
  const [isEditingSiteTeam, setIsEditingSiteTeam] = useState(false);
  const [draftSiteTeam, setDraftSiteTeam] = useState<SiteTeam>(project.meta?.siteTeam ?? emptySiteTeam);
  const tracks: Array<{ id: Track; title: string; description: string }> = [
    { id: 1, title: 'Track 1: End-of-Life Decision', description: 'Evaluate replacement vs. upgrade options for aging equipment' },
    { id: 2, title: 'Track 2: Fully Off-Grid Facility', description: 'Design standalone microgrid for complete energy independence' },
    { id: 3, title: 'Track 3: Isolate Critical Loads', description: 'Protect essential operations during grid outages' },
  ];
  const activeTrack = selectedTrack ?? project.track ?? 1;
  const isPreviewMode = trackMode === 'preview';
  const isPreviewing = isPreviewMode && previewTrack && previewTrack !== (project.track ?? 1);
  const isExecutiveLens = lens === 'executive';
  const isSiteTeamEditable = lens === 'practitioner';

  const updateDraft = (partial: Partial<SiteTeam>) => {
    setDraftSiteTeam((prev) => ({ ...prev, ...partial }));
  };

  const updateListItem = (key: keyof SiteTeam, index: number, value: string) => {
    const list = [...(draftSiteTeam[key] as string[] | undefined ?? [])];
    list[index] = value;
    updateDraft({ [key]: list } as Partial<SiteTeam>);
  };

  const addListItem = (key: keyof SiteTeam) => {
    const list = [...(draftSiteTeam[key] as string[] | undefined ?? [])];
    list.push('');
    updateDraft({ [key]: list } as Partial<SiteTeam>);
  };

  const removeListItem = (key: keyof SiteTeam, index: number) => {
    const list = [...(draftSiteTeam[key] as string[] | undefined ?? [])];
    list.splice(index, 1);
    updateDraft({ [key]: list } as Partial<SiteTeam>);
  };

  const normalizeSiteTeam = (siteTeam: SiteTeam): SiteTeam => {
    const normalizeSingle = (value?: string) => value?.trim() || '';
    const normalizeList = (list?: string[]) => {
      const unique = new Set(
        (list ?? [])
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

  const handleSiteTeamSave = () => {
    const normalized = normalizeSiteTeam(draftSiteTeam);
    setDraftSiteTeam(normalized);
    onUpdateSiteTeam?.(normalized);
    setIsEditingSiteTeam(false);
  };

  const handleSiteTeamCancel = () => {
    setDraftSiteTeam(project.meta?.siteTeam ?? emptySiteTeam);
    setIsEditingSiteTeam(false);
  };

  useEffect(() => {
    if (!isEditingSiteTeam) {
      setDraftSiteTeam(project.meta?.siteTeam ?? emptySiteTeam);
    }
  }, [project, isEditingSiteTeam]);

  useEffect(() => {
    if (!isSiteTeamEditable && isEditingSiteTeam) {
      setIsEditingSiteTeam(false);
    }
  }, [isSiteTeamEditable, isEditingSiteTeam]);

  const renderList = (items?: string[]) => {
    if (!items || items.length === 0) {
      return <span className="text-gray-400">—</span>;
    }
    return items.join(', ');
  };

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
              <div className="w-10 h-10 rounded-lg bg-[#03454D]/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-[#03454D]" />
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

        {/* Site Team Card */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--ef-black)]">Site Team</h2>
              <p className="text-sm text-gray-600">Key contacts for this project.</p>
            </div>
            {!isEditingSiteTeam && isSiteTeamEditable && (
              <Button variant="outline" size="sm" onClick={() => setIsEditingSiteTeam(true)}>
                Edit
              </Button>
            )}
          </div>

          {!isEditingSiteTeam && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">AVP</p>
                <p className="font-medium text-[var(--ef-black)]">{draftSiteTeam.avp || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">AGMM</p>
                <p className="font-medium text-[var(--ef-black)]">{draftSiteTeam.agmm || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Project Organizer</p>
                <p className="font-medium text-[var(--ef-black)]">{draftSiteTeam.projectOrganizer || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Project Managers</p>
                <p className="font-medium text-[var(--ef-black)]">{renderList(draftSiteTeam.projectManagers)}</p>
              </div>
              <div>
                <p className="text-gray-500">Tax Support</p>
                <p className="font-medium text-[var(--ef-black)]">{renderList(draftSiteTeam.taxSupport)}</p>
              </div>
            </div>
          )}

          {isEditingSiteTeam && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="site-team-avp" className="text-sm text-gray-600">AVP</Label>
                  <Input
                    id="site-team-avp"
                    value={draftSiteTeam.avp ?? ''}
                    onChange={(event) => updateDraft({ avp: event.target.value })}
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <Label htmlFor="site-team-agmm" className="text-sm text-gray-600">AGMM</Label>
                  <Input
                    id="site-team-agmm"
                    value={draftSiteTeam.agmm ?? ''}
                    onChange={(event) => updateDraft({ agmm: event.target.value })}
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <Label htmlFor="site-team-organizer" className="text-sm text-gray-600">Project Organizer</Label>
                  <Input
                    id="site-team-organizer"
                    value={draftSiteTeam.projectOrganizer ?? ''}
                    onChange={(event) => updateDraft({ projectOrganizer: event.target.value })}
                    placeholder="Enter name"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-600">Project Managers</Label>
                  <Button variant="ghost" size="sm" onClick={() => addListItem('projectManagers')}>
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {(draftSiteTeam.projectManagers ?? []).map((manager, index) => (
                    <div key={`pm-${index}`} className="flex items-center gap-2">
                      <Input
                        value={manager}
                        onChange={(event) => updateListItem('projectManagers', index, event.target.value)}
                        placeholder="Enter name"
                      />
                      <Button variant="ghost" size="sm" onClick={() => removeListItem('projectManagers', index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-600">Tax Support</Label>
                  <Button variant="ghost" size="sm" onClick={() => addListItem('taxSupport')}>
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {(draftSiteTeam.taxSupport ?? []).map((member, index) => (
                    <div key={`tax-${index}`} className="flex items-center gap-2">
                      <Input
                        value={member}
                        onChange={(event) => updateListItem('taxSupport', index, event.target.value)}
                        placeholder="Enter name"
                      />
                      <Button variant="ghost" size="sm" onClick={() => removeListItem('taxSupport', index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleSiteTeamCancel}>
                  Cancel
                </Button>
                <Button size="sm" className="bg-[#03454D] hover:bg-[#03454D]/90 text-white" onClick={handleSiteTeamSave}>
                  Save
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Track Selector Card */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--ef-black)] mb-2">Select Analysis Track</h2>
              <p className="text-sm text-gray-600">
                Choose the track that best matches your project requirements. This affects visible modules and calculations.
              </p>
            </div>
          </div>
          {previewToast && (
            <div className="sr-only" aria-live="polite">
              {previewToast}
            </div>
          )}
          <div className="space-y-3">
            {tracks.map((track) => {
              const isSelected = activeTrack === track.id;
              const isLocked = !onUpdateTrack && !isPreviewMode;
              return (
                <motion.button
                  key={track.id}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-[#03454D] bg-[#03454D]/5'
                      : 'border-gray-200 bg-white'
                  } ${isLocked ? 'opacity-80' : 'hover:border-gray-300 cursor-pointer'}`}
                  whileHover={isLocked ? undefined : { scale: 1.01 }}
                  whileTap={isLocked ? undefined : { scale: 0.99 }}
                  onClick={() => {
                    if (isPreviewMode) {
                      onPreviewTrack?.(track.id);
                      return;
                    }
                    onUpdateTrack?.(track.id);
                  }}
                  aria-disabled={isLocked}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? 'border-[#03454D] bg-[#03454D]' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-[var(--ef-black)]">{track.title}</h3>
                        {isPreviewing && previewTrack === track.id && (
                          <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                            Preview
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{track.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 min-h-[72px]">
            {isExecutiveLens ? (
              <div
                className={`rounded-lg border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-600 transition-opacity duration-200 ${
                  isPreviewing ? 'opacity-100' : 'opacity-60'
                }`}
              >
                {isPreviewing
                  ? `Viewing Track ${previewTrack} scenario (preview). Results update live. Switch to Practitioner to persist changes.`
                  : 'Viewing saved project scenario.'}
              </div>
            ) : (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Track {activeTrack} specific modules and guidance are now active.
                  {activeTrack === 2 && ' Off-grid specific calculations are enabled.'}
                  {activeTrack === 3 && ' Critical loads analysis tools are available.'}
                </p>
              </div>
            )}
          </div>
          {isExecutiveLens && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={isPreviewing ? onApplyPreviewTrack : undefined}
                disabled={!isPreviewing}
                aria-disabled={!isPreviewing}
                title={!isPreviewing ? 'Already the default scenario.' : undefined}
              >
                Apply as default
              </Button>
            </div>
          )}
        </motion.div>

        {/* Next Steps Card */}
        <motion.div
          className="bg-gradient-to-br from-[#03454D]/10 to-[var(--ef-teal)]/10 rounded-xl border border-[#03454D]/20 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-semibold text-lg text-[var(--ef-black)] mb-4">
            {isExecutiveLens ? 'Project Readiness' : 'Next Steps'}
          </h3>
          <ul className="space-y-2">
            {isExecutiveLens ? (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-gray-500 mt-1">•</span>
                  <span className="text-gray-700">Model assumptions are still being refined</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-500 mt-1">•</span>
                  <span className="text-gray-700">Interval data has not yet been uploaded</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-500 mt-1">•</span>
                  <span className="text-gray-700">Results are preliminary and subject to change</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-500 mt-1">•</span>
                  <span className="text-gray-700">Scenario selection is under review</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-[#03454D] mt-1">✓</span>
                  <span className="text-gray-700">Review and update Model Variables for accurate calculations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#03454D] mt-1">✓</span>
                  <span className="text-gray-700">Upload interval data CSV with timestamp and kW/kWh columns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#03454D] mt-1">✓</span>
                  <span className="text-gray-700">Fine-tune consumption module based on track requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#03454D] mt-1">✓</span>
                  <span className="text-gray-700">Export results when calculations are complete</span>
                </li>
              </>
            )}
          </ul>
        </motion.div>
      </div>

      {/* Right Column: Live Outputs Panel */}
      <div className="xl:col-span-1">
        <LiveOutputsPanel project={project} outputsOverride={outputsOverride} />
      </div>
    </div>
  );
}
