import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  animated?: boolean;
}

export function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, animated = true }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);

  useEffect(() => {
    if (!animated || typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, animated]);

  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[#1F2123]/80 mb-1">{title}</p>
          <p className="text-3xl font-bold text-[var(--ef-black)] mb-2">
            {typeof displayValue === 'number' && animated
              ? displayValue.toLocaleString()
              : displayValue}
          </p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-[#03454D]/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#03454D]" />
          </div>
        )}
      </div>
      {trend && trendValue && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className={`text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
        </div>
      )}
    </motion.div>
  );
}
