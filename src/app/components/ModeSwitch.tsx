import { useNavigate, useLocation } from 'react-router';
import { Building2, Calculator } from 'lucide-react';
import { motion } from 'motion/react';

export function ModeSwitch() {
  const navigate = useNavigate();
  const location = useLocation();
  const isExecutiveMode = location.pathname === '/';

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-[var(--ef-light-1)] rounded-lg">
      <motion.button
        onClick={() => navigate('/')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
          isExecutiveMode
            ? 'bg-white text-[var(--ef-black)] shadow-sm'
            : 'text-[var(--ef-teal)] hover:text-[var(--ef-black)]'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Building2 className="w-4 h-4" />
        Executive
      </motion.button>
      <motion.button
        onClick={() => {
          if (location.pathname.startsWith('/project/')) {
            return; // Already in practitioner mode
          }
          navigate('/project/1');
        }}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
          !isExecutiveMode
            ? 'bg-white text-[var(--ef-black)] shadow-sm'
            : 'text-[var(--ef-teal)] hover:text-[var(--ef-black)]'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Calculator className="w-4 h-4" />
        Practitioner
      </motion.button>
    </div>
  );
}
