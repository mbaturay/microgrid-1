import { useNavigate, useLocation } from 'react-router';
import { Building2, Calculator } from 'lucide-react';
import { motion } from 'motion/react';
import { useProjectLens } from '@/app/lib/ProjectLensContext';

export function ModeSwitch() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lens, setLens } = useProjectLens();
  const isExecutiveMode = lens === 'executive';
  const projectMatch = location.pathname.match(/\/project\/(\w+)/);
  const currentProjectId = projectMatch?.[1] ?? '1';

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-[var(--ef-light-1)] rounded-lg">
      <motion.button
        onClick={() => {
          setLens('executive');
          if (location.pathname === '/') {
            return;
          }
        }}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
          isExecutiveMode
            ? 'bg-white text-[var(--ef-black)] shadow-sm'
            : 'text-[var(--ef-teal)] hover:text-[var(--ef-black)]'
        }`}
        aria-pressed={isExecutiveMode}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Building2 className="w-4 h-4" />
        Executive
      </motion.button>
      <motion.button
        onClick={() => {
          setLens('practitioner');
          if (!location.pathname.startsWith('/project/')) {
            navigate(`/project/${currentProjectId}`);
          }
        }}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
          !isExecutiveMode
            ? 'bg-white text-[var(--ef-black)] shadow-sm'
            : 'text-[var(--ef-teal)] hover:text-[var(--ef-black)]'
        }`}
        aria-pressed={!isExecutiveMode}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Calculator className="w-4 h-4" />
        Practitioner
      </motion.button>
    </div>
  );
}
