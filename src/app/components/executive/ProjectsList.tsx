'use client';

import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import type { Project } from '@/app/data/mockData';
import { StageBadge } from '@/app/components/StageBadge';

interface ProjectsListProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
}

export function ProjectsList({ projects, selectedProjectId, onSelectProject }: ProjectsListProps) {
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  return (
    <div className="space-y-3 max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto pr-2">
      {projects.map((project, idx) => {
        const isSelected = project.id === selectedProjectId;

        return (
          <motion.div
            key={project.id}
            ref={(node) => {
              itemRefs.current[project.id] = node;
            }}
            className="p-3 sm:p-4 rounded-lg border cursor-pointer group"
            initial={{ opacity: 0, y: 16 }}
            animate={{
              opacity: 1,
              y: isSelected ? -2 : 0,
              borderColor: isSelected ? 'var(--ef-jade)' : 'rgba(229,231,235,1)',
              boxShadow: isSelected
                ? '0 12px 24px -16px rgba(2, 132, 99, 0.45)'
                : '0 0 0 0 rgba(0,0,0,0)',
            }}
            transition={{ duration: 0.15, ease: 'easeOut', delay: 0.2 + idx * 0.02 }}
            whileHover={{ scale: 1.01 }}
            onClick={() => onSelectProject(project.id)}
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
        );
      })}
      {selectedProjectId && selectedIndex === -1 && (
        <div className="text-sm text-gray-500">Selected project is filtered out.</div>
      )}
    </div>
  );
}
