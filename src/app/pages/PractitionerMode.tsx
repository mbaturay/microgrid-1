import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Download, Upload, Save } from 'lucide-react';
import { ModeSwitch } from '@/app/components/ModeSwitch';
import { StageBadge } from '@/app/components/StageBadge';
import { mockProjects } from '@/app/data/mockData';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { OverviewTab } from '@/app/components/tabs/OverviewTab';
import { ModelVariablesTab } from '@/app/components/tabs/ModelVariablesTab';
import { IntervalDataTab } from '@/app/components/tabs/IntervalDataTab';
import { OutputsTab } from '@/app/components/tabs/OutputsTab';

export function PractitionerMode() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const project = mockProjects.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <Button onClick={() => navigate('/')}>Return to Portfolio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--ef-light-2)]">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-[1920px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-[var(--ef-teal)]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Portfolio
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-[var(--ef-black)]">{project.name}</h1>
                <p className="text-sm text-gray-600">{project.location}</p>
              </div>
              <StageBadge stage={project.stage} />
            </div>
            <ModeSwitch />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {project.lastSaved && `Last saved: ${project.lastSaved}`}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Project
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Project
                </Button>
                <Button size="sm" className="bg-[var(--ef-jade)] hover:bg-[var(--ef-jade)]/90 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
              <div className="text-[11px] text-gray-500">Includes all project inputs and settings.</div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border border-gray-200 p-1 mb-6 w-full grid grid-cols-8 gap-1">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-[var(--ef-jade)] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="budget"
              className="data-[state=active]:bg-[var(--ef-jade)] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Budget
            </TabsTrigger>
            <TabsTrigger 
              value="model-variables"
              className="data-[state=active]:bg-[var(--ef-jade)] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Model Variables
            </TabsTrigger>
            <TabsTrigger 
              value="interval-data"
              className="data-[state=active]:bg-[var(--ef-jade)] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Interval Data
            </TabsTrigger>
            <TabsTrigger 
              value="utility-baseline"
              className="data-[state=active]:bg-[var(--ef-jade)] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Utility Baseline
            </TabsTrigger>
            <TabsTrigger 
              value="solar-baseline"
              className="data-[state=active]:bg-[var(--ef-jade)] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Solar Baseline
            </TabsTrigger>
            <TabsTrigger 
              value="consumption"
              className="data-[state=active]:bg-[var(--ef-jade)] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Consumption
            </TabsTrigger>
            <TabsTrigger 
              value="outputs"
              className="data-[state=active]:bg-[var(--ef-jade)] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Outputs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab project={project} />
          </TabsContent>

          <TabsContent value="budget">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-[var(--ef-black)] mb-6">Budget Intake</h2>
              <p className="text-gray-600 mb-6">
                Edit budget inputs here. Calculated tables below are read-only.
              </p>
              <div className="text-center py-12 text-gray-400">
                Budget form placeholder - editable fields for budget intake
              </div>
            </div>
          </TabsContent>

          <TabsContent value="model-variables">
            <ModelVariablesTab project={project} />
          </TabsContent>

          <TabsContent value="interval-data">
            <IntervalDataTab project={project} />
          </TabsContent>

          <TabsContent value="utility-baseline">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-[var(--ef-black)] mb-6">Utility Baseline</h2>
              <p className="text-gray-600 mb-6">
                Read-only calculated utility baseline data. Edit Model Variables to adjust.
              </p>
              <div className="text-center py-12 text-gray-400">
                Utility baseline tables - read-only with lock icons
              </div>
            </div>
          </TabsContent>

          <TabsContent value="solar-baseline">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-[var(--ef-black)] mb-6">Solar Baseline</h2>
              <p className="text-gray-600 mb-6">
                Read-only calculated solar baseline data. Edit Model Variables to adjust.
              </p>
              <div className="text-center py-12 text-gray-400">
                Solar baseline tables - read-only with lock icons
              </div>
            </div>
          </TabsContent>

          <TabsContent value="consumption">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-[var(--ef-black)] mb-6">Consumption Module</h2>
              <p className="text-gray-600 mb-6">
                Fine-tune consumption parameters. Track-specific guidance below.
              </p>
              <div className="text-center py-12 text-gray-400">
                Consumption fine-tune controls - sliders and selects
              </div>
            </div>
          </TabsContent>

          <TabsContent value="outputs">
            <OutputsTab project={project} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}