'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { Project } from '@/app/data/mockData';
import { StageBadge } from '@/app/components/StageBadge';

interface ProjectsListProps {
  projects: Project[];
  selectedProjectId: string | null;
  hoveredProjectId: string | null;
  hoverSource: 'map' | 'list' | null;
  onSelectProject: (projectId: string) => void;
  onHoverProject: (projectId: string | null) => void;
  onHoverSourceChange: (source: 'map' | 'list' | null) => void;
}

export function ProjectsList({
  projects,
  selectedProjectId,
  hoveredProjectId,
  hoverSource,
  onSelectProject,
  onHoverProject,
  onHoverSourceChange,
}: ProjectsListProps) {
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [liveMessage, setLiveMessage] = useState('');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const lastScrollAtRef = useRef(0);
  const lastInteractionRef = useRef<'keyboard' | 'mouse' | null>(null);

  const selectedIndex = useMemo(
    () => projects.findIndex((project) => project.id === selectedProjectId),
    [projects, selectedProjectId]
  );

  useEffect(() => {
    if (!selectedProjectId) {
      return;
    }

    const node = itemRefs.current[selectedProjectId];
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updatePreference);
      return () => mediaQuery.removeEventListener('change', updatePreference);
    }

    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  useEffect(() => {
    if (!hoveredProjectId || hoverSource !== 'map') {
      return;
    }

    const now = Date.now();
    if (now - lastScrollAtRef.current < 500) {
      return;
    }

    const container = containerRef.current;
    const node = itemRefs.current[hoveredProjectId];
    if (!container || !node) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const aboveThreshold = nodeRect.top < containerRect.top - 40;
    const belowThreshold = nodeRect.bottom > containerRect.bottom + 40;

    if (aboveThreshold || belowThreshold) {
      node.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
      lastScrollAtRef.current = now;
    }
  }, [hoveredProjectId, hoverSource, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="space-y-3 max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto pr-2"
    >
      <span className="sr-only" aria-live="polite">
        {liveMessage}
      </span>
      {projects.map((project, idx) => {
        const isSelected = project.id === selectedProjectId;
        const isHovered = project.id === hoveredProjectId;
        const isActive = isSelected || isHovered;
        const isHighlight = isHovered && !isSelected;
        const nameId = `project-name-${project.id}`;
        const roiId = `project-roi-${project.id}`;
        const liftClass = !prefersReducedMotion && isHighlight ? '-translate-y-[1px]' : '';

        return (
          <motion.div
            key={project.id}
            ref={(node) => {
              itemRefs.current[project.id] = node;
            }}
            className={`p-3 sm:p-4 rounded-lg border cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#03454D] ${
              isSelected
                ? 'border-[#03454D] shadow-md'
                : isHighlight
                  ? `border-gray-200 ring-2 ring-yellow-300/40 shadow-sm ${liftClass} transition-[transform,box-shadow] duration-150 ease-out`
                  : 'border-gray-200 hover:border-[#03454D]'
            }`}
            initial={{ opacity: 0, y: 16 }}
            animate={{
              opacity: 1,
              y: prefersReducedMotion ? 0 : isSelected ? -2 : isHighlight ? -1 : 0,
            }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: 'easeOut', delay: 0.2 + idx * 0.02 }}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
            onClick={() => onSelectProject(project.id)}
            onMouseEnter={() => {
              lastInteractionRef.current = 'mouse';
              onHoverSourceChange('list');
              onHoverProject(project.id);
            }}
            onMouseDown={() => {
              lastInteractionRef.current = 'mouse';
            }}
            onMouseLeave={() => {
              onHoverSourceChange(null);
              onHoverProject(null);
            }}
            onFocus={() => {
              onHoverSourceChange('list');
              onHoverProject(project.id);
              if (lastInteractionRef.current === 'keyboard') {
                setLiveMessage(`Project ${project.name} highlighted`);
              }
            }}
            onBlur={() => {
              onHoverSourceChange(null);
              onHoverProject(null);
            }}
            onKeyDown={(event) => {
              lastInteractionRef.current = 'keyboard';
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelectProject(project.id);
              }
            }}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-describedby={`${nameId} ${roiId}`}
          >
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="flex-1 min-w-0">
                <h4
                  id={nameId}
                  className="font-semibold text-[var(--ef-black)] group-hover:text-[#03454D] transition-colors truncate"
                >
                  {project.name}
                </h4>
                <p className="text-sm text-gray-600">{project.location}</p>
              </div>
              <StageBadge stage={project.stage} size="sm" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">ROI</p>
                <p id={roiId} className="text-sm font-semibold text-[#03454D]">
                  {project.roi}%
                </p>
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
        );
      })}
      {selectedProjectId && selectedIndex === -1 && (
        <div className="text-sm text-gray-500">Selected project is filtered out.</div>
      )}
    </div>
  );
}
