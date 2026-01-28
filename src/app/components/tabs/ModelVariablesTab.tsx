import { useState } from 'react';
import { Project } from '@/app/data/mockData';
import { LiveOutputsPanel } from '@/app/components/LiveOutputsPanel';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion';
import { Switch } from '@/app/components/ui/switch';
import { Search, RotateCcw, Download, Upload } from 'lucide-react';
import { motion } from 'motion/react';

interface ModelVariablesTabProps {
  project: Project;
}

interface ModelVariable {
  id: string;
  label: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'percent' | 'currency' | 'boolean' | 'select' | 'date';
  section: string;
  unit?: string;
  options?: string[];
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

export function ModelVariablesTab({ project }: ModelVariablesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [changedOnly, setChangedOnly] = useState(false);
  const [variables, setVariables] = useState(mockVariables);

  const sections = Array.from(new Set(variables.map(v => v.section)));

  const filteredVariables = variables.filter(v => {
    const matchesSearch = v.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.section.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredSections = sections.filter(section =>
    filteredVariables.some(v => v.section === section)
  );

  const handleVariableChange = (id: string, value: any) => {
    setVariables(prev => prev.map(v => v.id === id ? { ...v, value } : v));
  };

  const renderInput = (variable: ModelVariable) => {
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ef-jade)]"
          >
            {variable.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'percent':
        return (
          <div className="relative">
            <Input
              type="number"
              value={variable.value}
              onChange={(e) => handleVariableChange(variable.id, parseFloat(e.target.value))}
              className="pr-8"
              step="0.1"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
          </div>
        );
      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">$</span>
            <Input
              type="number"
              value={variable.value}
              onChange={(e) => handleVariableChange(variable.id, parseFloat(e.target.value))}
              className="pl-7"
              step="0.01"
            />
            {variable.unit && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{variable.unit}</span>
            )}
          </div>
        );
      default:
        return (
          <div className="relative">
            <Input
              type={variable.type}
              value={variable.value as string | number}
              onChange={(e) => handleVariableChange(variable.id, variable.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
              step="0.01"
            />
            {variable.unit && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{variable.unit}</span>
            )}
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
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import JSON
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 pb-6 border-b">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
            <Button variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
          </div>

          {/* Variables by Section */}
          <Accordion type="multiple" defaultValue={filteredSections} className="space-y-2">
            {filteredSections.map((section) => {
              const sectionVars = filteredVariables.filter(v => v.section === section);
              return (
                <AccordionItem key={section} value={section} className="border border-gray-200 rounded-lg overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                    <span className="font-semibold text-[var(--ef-black)]">{section}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4 pt-2">
                      {sectionVars.map((variable) => (
                        <div key={variable.id} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                          <Label htmlFor={variable.id} className="text-sm font-medium text-gray-700 pt-2">
                            {variable.label}
                          </Label>
                          <div>
                            {renderInput(variable)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </motion.div>
      </div>

      {/* Right Column: Live Outputs Panel */}
      <div className="xl:col-span-1">
        <LiveOutputsPanel project={project} />
      </div>
    </div>
  );
}
