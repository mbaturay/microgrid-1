'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { Project } from '@/app/data/mockData';
import { StageBadge } from '@/app/components/StageBadge';

interface ProjectsListProps {
  projects: Project[];
  selectedProjectId: string | null;
  hoveredProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onHoverProject: (projectId: string | null) => void;
}

export function ProjectsList({
  projects,
  selectedProjectId,
  hoveredProjectId,
  onSelectProject,
  onHoverProject,
}: ProjectsListProps) {
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);
  const latestHighlightRef = useRef<string | null>(null);
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState('');

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
    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }

    if (!hoveredProjectId) {
      setHighlightedProjectId(null);
      return;
    }

    latestHighlightRef.current = hoveredProjectId;
    setHighlightedProjectId(hoveredProjectId);
    highlightTimeoutRef.current = window.setTimeout(() => {
      if (latestHighlightRef.current === hoveredProjectId) {
        setHighlightedProjectId(null);
      }
    }, 800);
  }, [hoveredProjectId]);

  useEffect(() => {
    if (!hoveredProjectId) {
      return;
    }

    const container = containerRef.current;
    const node = itemRefs.current[hoveredProjectId];
    if (!container || !node) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const isFullyVisible =
      nodeRect.top >= containerRect.top && nodeRect.bottom <= containerRect.bottom;

    if (!isFullyVisible) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [hoveredProjectId]);

  return (
    <div
      ref={containerRef}
      className="space-y-3 max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto pr-2"
      aria-live="polite"
    >
      <span className="sr-only" aria-live="polite">
        {liveMessage}
      </span>
      {projects.map((project, idx) => {
        const isSelected = project.id === selectedProjectId;
        const isHovered = project.id === hoveredProjectId;
        const isActive = isSelected || isHovered;
        const isHighlighted = project.id === highlightedProjectId && !isSelected;
        const nameId = `project-name-${project.id}`;
        const roiId = `project-roi-${project.id}`;

        return (
          <motion.div
            key={project.id}
            ref={(node) => {
              itemRefs.current[project.id] = node;
            }}
            className="p-3 sm:p-4 rounded-lg border cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ef-jade)]"
            initial={{ opacity: 0, y: 16 }}
            animate={{
              opacity: 1,
              y: isActive ? -2 : 0,
              borderColor: isSelected
                ? 'var(--ef-jade)'
                : isHovered
                  ? 'rgba(20, 184, 166, 0.8)'
                  : 'rgba(229,231,235,1)',
              boxShadow: isSelected
                ? '0 12px 24px -16px rgba(2, 132, 99, 0.45)'
                : isHighlighted
                  ? '0 0 0 2px rgba(250, 204, 21, 0.5)'
                  : '0 0 0 0 rgba(0,0,0,0)',
              scale: isHighlighted ? 1.01 : 1,
            }}
            transition={{ duration: 0.2, ease: 'easeOut', delay: 0.2 + idx * 0.02 }}
            whileHover={{ scale: 1.01 }}
            onClick={() => onSelectProject(project.id)}
            onMouseEnter={() => onHoverProject(project.id)}
            onMouseLeave={() => onHoverProject(null)}
            onFocus={() => {
              onHoverProject(project.id);
              setLiveMessage(`Project ${project.name} highlighted`);
            }}
            onBlur={() => onHoverProject(null)}
            onKeyDown={(event) => {
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
                  className="font-semibold text-[var(--ef-black)] group-hover:text-[var(--ef-jade)] transition-colors truncate"
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
                <p id={roiId} className="text-sm font-semibold text-[var(--ef-jade)]">
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
