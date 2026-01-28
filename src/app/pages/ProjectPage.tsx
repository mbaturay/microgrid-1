import { useParams } from 'react-router';
import { useProjectLens } from '@/app/lib/ProjectLensContext';
import { PractitionerMode } from './PractitionerMode';
import { mockProjects } from '@/app/data/mockData';

export function ProjectPage() {
  const { projectId } = useParams();
  const { lens } = useProjectLens();

  // If no projectId param, do not show error (per requirements)
  if (!projectId) {
    return null;
  }

  // Only show error if projectId is present but not found
  const projectExists = mockProjects.some((p) => p.id === projectId);
  if (!projectExists) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
        </div>
      </div>
    );
  }

  // Always render PractitionerMode (it handles lens-specific UI)
  return <PractitionerMode />;
}
