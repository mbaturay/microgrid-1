import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ProjectLens = 'executive' | 'practitioner';

interface ProjectLensContextValue {
  lens: ProjectLens;
  setLens: (lens: ProjectLens) => void;
}

const ProjectLensContext = createContext<ProjectLensContextValue | undefined>(undefined);



export function ProjectLensProvider({ children }: { children: React.ReactNode }) {
  const [lens, setLens] = useState<ProjectLens>('executive');
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
