import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ProjectLens = 'executive' | 'practitioner';

interface ProjectLensContextValue {
  lens: ProjectLens;
  setLens: (lens: ProjectLens) => void;
}

const ProjectLensContext = createContext<ProjectLensContextValue | undefined>(undefined);

const STORAGE_KEY = 'projectLens';

export function ProjectLensProvider({ children }: { children: React.ReactNode }) {
  const [lens, setLensState] = useState<ProjectLens>('executive');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'executive' || stored === 'practitioner') {
      setLensState(stored);
    }
  }, []);

  const setLens = (next: ProjectLens) => {
    setLensState(next);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEY, next);
    }
  };

  const value = useMemo(() => ({ lens, setLens }), [lens]);

  return <ProjectLensContext.Provider value={value}>{children}</ProjectLensContext.Provider>;
}

export function useProjectLens() {
  const context = useContext(ProjectLensContext);
  if (!context) {
    throw new Error('useProjectLens must be used within ProjectLensProvider');
  }
  return context;
}
