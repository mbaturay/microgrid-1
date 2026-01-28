import { useEffect, useMemo, useRef, useState } from 'react';
import { Project, type VariableMap } from '@/app/data/mockData';
import { LiveOutputsPanel } from '@/app/components/LiveOutputsPanel';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion';
import { Switch } from '@/app/components/ui/switch';
import { Search, Download, Upload } from 'lucide-react';
import { motion } from 'motion/react';

interface ModelVariablesTabProps {
  project: Project;
  variables?: VariableMap;
  onUpdateVariables?: (variables: VariableMap) => void;
}

interface ModelVariable {
  id: string;
  label: string;
  value: string | number | boolean;
  defaultValue?: string | number | boolean;
  type: 'text' | 'number' | 'percent' | 'currency' | 'boolean' | 'select' | 'date';
  section: string;
  unit?: string;
  options?: string[];
  min?: number;
  max?: number;
  helper?: string;
}

const mockVariables: ModelVariable[] = [
  // System Configuration
  { id: 'system_capacity', label: 'System Capacity', value: 2.5, type: 'number', section: 'System Configuration', unit: 'MW' },
  { id: 'panel_efficiency', label: 'Panel Efficiency', value: 22, type: 'percent', section: 'System Configuration' },
  { id: 'inverter_efficiency', label: 'Inverter Efficiency', value: 98, type: 'percent', section: 'System Configuration' },
  { id: 'battery_included', label: 'Battery Storage Included', value: true, type: 'boolean', section: 'System Configuration' },
  { id: 'battery_capacity', label: 'Battery Capacity', value: 4, type: 'number', section: 'System Configuration', unit: 'MWh' },
  
  // Financial Parameters
  { id: 'capex_per_watt', label: 'CapEx per Watt', value: 1.28, type: 'currency', section: 'Financial Parameters' },
  { id: 'discount_rate', label: 'Discount Rate', value: 5.5, type: 'percent', section: 'Financial Parameters' },
  { id: 'inflation_rate', label: 'Inflation Rate', value: 2.5, type: 'percent', section: 'Financial Parameters' },
  { id: 'project_lifetime', label: 'Project Lifetime', value: 25, type: 'number', section: 'Financial Parameters', unit: 'years' },
  { id: 'degradation_rate', label: 'Annual Degradation', value: 0.5, type: 'percent', section: 'Financial Parameters' },
  
  // Utility Rates
  { id: 'utility_rate', label: 'Utility Rate (Average)', value: 0.145, type: 'currency', section: 'Utility Rates', unit: '$/kWh' },
  { id: 'demand_charge', label: 'Demand Charge', value: 12.5, type: 'currency', section: 'Utility Rates', unit: '$/kW' },
  { id: 'escalation_rate', label: 'Utility Escalation Rate', value: 3.2, type: 'percent', section: 'Utility Rates' },
  { id: 'net_metering', label: 'Net Metering Available', value: true, type: 'boolean', section: 'Utility Rates' },
  
  // Incentives
  { id: 'federal_itc', label: 'Federal ITC', value: 30, type: 'percent', section: 'Incentives' },
  { id: 'state_rebate', label: 'State Rebate', value: 250000, type: 'currency', section: 'Incentives' },
  { id: 'depreciation_method', label: 'Depreciation Method', value: 'MACRS', type: 'select', section: 'Incentives', options: ['MACRS', 'Straight Line', 'None'] },
  
  // Operations & Maintenance
  { id: 'om_fixed', label: 'O&M Fixed Annual', value: 18000, type: 'currency', section: 'Operations & Maintenance' },
  { id: 'om_variable', label: 'O&M Variable', value: 0.015, type: 'currency', section: 'Operations & Maintenance', unit: '$/kWh' },
  { id: 'insurance_rate', label: 'Insurance Rate', value: 0.25, type: 'percent', section: 'Operations & Maintenance' },
  { id: 'warranty_years', label: 'Warranty Period', value: 10, type: 'number', section: 'Operations & Maintenance', unit: 'years' },
];

const sectionDescriptions: Record<string, string> = {
  'System Configuration': 'Define core system sizing and hardware assumptions.',
  'Financial Parameters': 'Tune cost of capital and lifecycle assumptions.',
  'Utility Rates': 'Set grid pricing and escalation assumptions.',
  Incentives: 'Apply credits and rebates that affect project economics.',
  'Operations & Maintenance': 'Ongoing costs and coverage assumptions.',
};

export function ModelVariablesTab({ project, variables, onUpdateVariables }: ModelVariablesTabProps) {
  const HEADER_OFFSET = 160;
  const [searchQuery, setSearchQuery] = useState('');
  const [changedOnly, setChangedOnly] = useState(false);
  const [variablesState, setVariablesState] = useState(() =>
    mockVariables.map((variable) => ({
      ...variable,
      value: variables?.[variable.id] ?? variable.value,
    }))
  );
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [highlightedSectionId, setHighlightedSectionId] = useState<string | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const recalcTimeoutRef = useRef<number | null>(null);
  const sectionHighlightTimeoutRef = useRef<number | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToSection = (section: string) => {
    const node = sectionRefs.current[section];
    if (!node) {
      return;
    }

    const top = node.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  const triggerSectionHighlight = (sectionId: string) => {
    setHighlightedSectionId(sectionId);
    if (sectionHighlightTimeoutRef.current) {
      window.clearTimeout(sectionHighlightTimeoutRef.current);
    }
    sectionHighlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedSectionId(null);
    }, prefersReducedMotion ? 0 : 900);
  };

  const getSectionId = (section: string) =>
    section
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

  const defaultValues = useMemo(() => {
    return new Map(
      mockVariables.map((variable) => [variable.id, variable.defaultValue ?? variable.value])
    );
  }, []);

  useEffect(() => {
    if (!variables) {
      return;
    }
    setVariablesState(
      mockVariables.map((variable) => ({
        ...variable,
        value: variables[variable.id] ?? variable.value,
      }))
    );
  }, [variables]);

  useEffect(() => {
    if (variables || !onUpdateVariables) {
      return;
    }
    const defaults: VariableMap = {};
    mockVariables.forEach((variable) => {
      defaults[variable.id] = variable.value;
    });
    onUpdateVariables(defaults);
  }, [variables, onUpdateVariables]);

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

  const getConstraints = (variable: ModelVariable) => {
    let min = variable.min;
    let max = variable.max;

    if (min === undefined && ['number', 'currency', 'percent'].includes(variable.type)) {
      min = 0;
    }
    if (max === undefined && variable.type === 'percent') {
      max = 100;
    }

    return { min, max };
  };

  const normalizeValue = (variable: ModelVariable, value: any) => {
    if (variable.type === 'boolean' || variable.type === 'select') {
      return value;
    }

    const { min, max } = getConstraints(variable);
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return value;
    }

    let nextValue = numericValue;
    if (min !== undefined && nextValue < min) {
      nextValue = min;
    }
    if (max !== undefined && nextValue > max) {
      nextValue = max;
    }

    return nextValue;
  };

  const isChanged = (variable: ModelVariable) => {
    const defaultValue = defaultValues.get(variable.id);
    if (variable.type === 'number' || variable.type === 'currency' || variable.type === 'percent') {
      return Number(variable.value) !== Number(defaultValue);
    }
    return variable.value !== defaultValue;
  };

  const getWarning = (variable: ModelVariable) => {
    if (variable.type !== 'number' && variable.type !== 'currency' && variable.type !== 'percent') {
      return null;
    }

    const value = Number(variable.value);
    if (Number.isNaN(value)) {
      return null;
    }

    const { max } = getConstraints(variable);
    if (max !== undefined && value >= max * 0.9) {
      return 'This value is unusually high.';
    }
    if (variable.type === 'percent' && value >= 60) {
      return 'This value is unusually high.';
    }

    return null;
  };

  const triggerRecalc = () => {
    setIsRecalculating(true);
    if (recalcTimeoutRef.current) {
      window.clearTimeout(recalcTimeoutRef.current);
    }
    recalcTimeoutRef.current = window.setTimeout(() => {
      setIsRecalculating(false);
    }, prefersReducedMotion ? 0 : 650);
  };

  useEffect(() => {
    return () => {
      if (recalcTimeoutRef.current) {
        window.clearTimeout(recalcTimeoutRef.current);
      }
      if (sectionHighlightTimeoutRef.current) {
        window.clearTimeout(sectionHighlightTimeoutRef.current);
      }
    };
  }, []);

  const sections = Array.from(new Set(variablesState.map((v) => v.section)));

  const filteredVariables = variablesState.filter((variable) => {
    const matchesSearch =
      variable.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      variable.section.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) {
      return false;
    }

    if (changedOnly) {
      return isChanged(variable);
    }

    return true;
  });

  const filteredSections = sections.filter((section) =>
    filteredVariables.some((variable) => variable.section === section)
  );

  const sectionChangeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    variablesState.forEach((variable) => {
      if (!isChanged(variable)) {
        return;
      }
      counts.set(variable.section, (counts.get(variable.section) ?? 0) + 1);
    });
    return counts;
  }, [variablesState]);

  useEffect(() => {
    if (filteredSections.length === 0) {
      return;
    }

    if (!activeSection) {
      setActiveSection(filteredSections[0]);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const nextSection = visible[0].target.getAttribute('data-section');
          if (nextSection) {
            setActiveSection(nextSection);
          }
        }
      },
      { rootMargin: '-10% 0px -60% 0px', threshold: 0.4 }
    );

    filteredSections.forEach((section) => {
      const node = sectionRefs.current[section];
      if (node) {
        observer.observe(node);
      }
    });

    return () => observer.disconnect();
  }, [filteredSections, activeSection]);

  const handleVariableChange = (id: string, value: any) => {
    setVariablesState((prev) => {
      const next = prev.map((variable) => {
        if (variable.id !== id) {
          return variable;
        }

        const nextValue = normalizeValue(variable, value);
        return { ...variable, value: nextValue };
      });
      const nextVariables: VariableMap = {};
      next.forEach((variable) => {
        nextVariables[variable.id] = variable.value;
      });
      onUpdateVariables?.(nextVariables);
      return next;
    });
    triggerRecalc();
  };

  const resetVariable = (id: string) => {
    const defaultValue = defaultValues.get(id);
    if (defaultValue === undefined) {
      return;
    }
    setVariablesState((prev) => {
      const next = prev.map((variable) =>
        variable.id === id ? { ...variable, value: defaultValue } : variable
      );
      const nextVariables: VariableMap = {};
      next.forEach((variable) => {
        nextVariables[variable.id] = variable.value;
      });
      onUpdateVariables?.(nextVariables);
      return next;
    });
    triggerRecalc();
  };

  const resetSection = (section: string) => {
    setVariablesState((prev) => {
      const next = prev.map((variable) => {
        if (variable.section !== section) {
          return variable;
        }
        const defaultValue = defaultValues.get(variable.id);
        if (defaultValue === undefined) {
          return variable;
        }
        return { ...variable, value: defaultValue };
      });
      const nextVariables: VariableMap = {};
      next.forEach((variable) => {
        nextVariables[variable.id] = variable.value;
      });
      onUpdateVariables?.(nextVariables);
      return next;
    });
    triggerRecalc();
  };

  const handleImportVariables = () => {
    const updatedIds = variablesState.map((variable) => variable.id);
    setHighlightedIds(updatedIds);
    setImportMessage(`${updatedIds.length} variables updated`);
    window.setTimeout(() => {
      setHighlightedIds([]);
      setImportMessage(null);
    }, prefersReducedMotion ? 0 : 1800);
  };

  const renderInput = (variable: ModelVariable) => {
    const { min, max } = getConstraints(variable);

    switch (variable.type) {
      case 'boolean':
        return (
          <Switch
            checked={variable.value as boolean}
            onCheckedChange={(checked) => handleVariableChange(variable.id, checked)}
          />
        );
      case 'select':
        return (
          <select
            value={variable.value as string}
            onChange={(e) => handleVariableChange(variable.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#03454D]"
          >
            {variable.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'percent':
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={typeof variable.value === 'boolean' ? '' : variable.value}
              onChange={(e) => handleVariableChange(variable.id, parseFloat(e.target.value))}
              className="flex-1"
              step="0.1"
              min={min}
              max={max}
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        );
      case 'currency':
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">$</span>
            <Input
              type="number"
              value={typeof variable.value === 'boolean' ? '' : variable.value}
              onChange={(e) => handleVariableChange(variable.id, parseFloat(e.target.value))}
              className="flex-1"
              step="0.01"
              min={min}
              max={max}
            />
            {variable.unit && <span className="text-sm text-gray-500">{variable.unit}</span>}
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <Input
              type={variable.type}
              value={typeof variable.value === 'boolean' ? '' : (variable.value as string | number)}
              onChange={(e) => handleVariableChange(variable.id, variable.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
              className="flex-1"
              step="0.01"
              min={min}
              max={max}
            />
            {variable.unit && <span className="text-sm text-gray-500">{variable.unit}</span>}
          </div>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left Column: Variables Form */}
      <div className="xl:col-span-2">
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--ef-black)]">Model Variables</h2>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleImportVariables}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Variables
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Variables
                </Button>
              </div>
              <span className="text-[11px] text-gray-500">Reuse assumptions across projects.</span>
            </div>
          </div>
          {importMessage && (
            <div className="mb-4 rounded-md border border-[#03454D]/20 bg-[#F4F7F7] px-3 py-2 text-xs text-[#1F2123]">
              {importMessage}
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 pb-6 border-b">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#03454D]" />
              <Input
                type="text"
                placeholder="Search variables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={changedOnly}
                onCheckedChange={setChangedOnly}
                id="changed-only"
              />
              <Label htmlFor="changed-only" className="text-sm">Show changed only</Label>
            </div>
          </div>

          <div className="sticky top-0 z-10 -mx-2 mb-4 bg-white/95 px-2 py-3 backdrop-blur">
            <div className="flex flex-wrap gap-2">
              {filteredSections.map((section) => {
                const isActive = activeSection === section;
                const count = sectionChangeCounts.get(section) ?? 0;
                return (
                  <button
                    key={section}
                    type="button"
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      isActive
                        ? 'border-[#03454D] bg-[#03454D]/10 text-[#03454D]'
                        : 'border-gray-200 text-gray-600 hover:border-[#03454D]/60'
                    }`}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => {
                      scrollToSection(section);
                      setActiveSection(section);
                      triggerSectionHighlight(getSectionId(section));
                    }}
                  >
                    {section}
                    {count > 0 && <span className="ml-2 rounded-full bg-[#03454D]/15 px-2 py-0.5 text-[10px] text-[#03454D]">{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Variables by Section */}
          <Accordion type="multiple" defaultValue={filteredSections} className="space-y-4">
            {filteredSections.map((section) => {
              const sectionVars = filteredVariables.filter(v => v.section === section);
              const sectionHelper = sectionDescriptions[section] ?? 'Adjust inputs for this section.';
              const changeCount = sectionChangeCounts.get(section) ?? 0;
              const sectionId = getSectionId(section);
              const isSectionHighlighted = highlightedSectionId === sectionId;
              return (
                <div
                  key={section}
                  id={sectionId}
                  className="scroll-mt-24"
                  ref={(node) => {
                    sectionRefs.current[section] = node;
                  }}
                  data-section={section}
                >
                  <AccordionItem
                    value={section}
                    className={`border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm transition ${
                      isSectionHighlighted
                        ? 'ring-2 ring-[#03454D]/20 bg-[#03454D]/5'
                        : ''
                    } ${prefersReducedMotion ? '' : 'duration-200'}`}
                  >
                    <AccordionTrigger className="px-4 py-4 hover:bg-gray-50">
                      <div className="flex w-full items-start justify-between gap-4 text-left">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[var(--ef-black)]">{section}</span>
                            {changeCount > 0 && (
                              <span className="rounded-full bg-[#03454D]/10 px-2 py-0.5 text-[10px] font-medium text-[#03454D]">
                                {changeCount} changes
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#1F2123]/70 mt-1">{sectionHelper}</p>
                        </div>
                        <button
                          type="button"
                          className="text-xs font-medium text-gray-500 hover:text-[#03454D]"
                          onClick={(event) => {
                            event.stopPropagation();
                            resetSection(section);
                          }}
                        >
                          Reset section
                        </button>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-5">
                      <div className="space-y-4 pt-2">
                        {sectionVars.map((variable) => (
                          <div
                            key={variable.id}
                            className={`group grid grid-cols-1 md:grid-cols-2 gap-3 items-start rounded-lg border border-transparent px-2 py-2 transition ${
                              highlightedIds.includes(variable.id) ? 'border-[#03454D]/50 bg-[#03454D]/5' : ''
                            }`}
                          >
                            <Label htmlFor={variable.id} className="text-sm font-medium text-[#1F2123] pt-2 flex items-center gap-2">
                              <span>{variable.label}</span>
                              {isChanged(variable) && <span className="h-2 w-2 rounded-full bg-[#0B8562]" />}
                            </Label>
                            <div className="space-y-1">
                              <div className="space-y-1">
                                {renderInput(variable)}
                                <button
                                  type="button"
                                  className="text-xs text-gray-500 hover:text-[#03454D] opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 pl-1 text-left"
                                  onClick={() => resetVariable(variable.id)}
                                >
                                  Reset to default
                                </button>
                              </div>
                              {getWarning(variable) && (
                                <p className="text-xs text-amber-600">{getWarning(variable)}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </div>
              );
            })}
          </Accordion>
        </motion.div>
      </div>

      {/* Right Column: Live Outputs Panel */}
      <div className="xl:col-span-1">
        <LiveOutputsPanel
          project={project}
          isRecalculating={isRecalculating}
          prefersReducedMotion={prefersReducedMotion}
        />
      </div>
    </div>
  );
}
