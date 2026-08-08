'use client';
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import KpiCards from '@/components/schedule/KpiCards';
import CatalogPanel from '@/components/schedule/CatalogPanel';
import ScheduleTable from '@/components/schedule/ScheduleTable';
import ExportToolbar from '@/components/ui/ExportToolbar';

import StatsModal from '@/components/modals/StatsModal';
import SettingsModal from '@/components/modals/SettingsModal';
import SavedSchedulesModal from '@/components/modals/SavedSchedulesModal';
import UploadExcelModal from '@/components/modals/UploadExcelModal';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#f4f6fb] dark:bg-[#0b101d]">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        openSavedModal={() => setIsSavedModalOpen(true)}
        openStatsModal={() => setIsStatsModalOpen(true)}
        openSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* 2. Main Dashboard Content */}
      <div className="flex-1 p-4 md:p-8 space-y-6 max-w-full overflow-hidden flex flex-col">
        {/* Top Header & Controls */}
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Top 5 KPI Stat Cards */}
        <KpiCards />

        {/* Central Workspace: Left Catalog + Right Schedule Table */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 w-full">
          <CatalogPanel />
          <div className="flex-1 min-w-0 w-full">
            <ScheduleTable />
          </div>
        </div>
      </div>

      {/* Modals */}
      <StatsModal 
        isOpen={isStatsModalOpen} 
        onClose={() => setIsStatsModalOpen(false)} 
      />

      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
        openUploadModal={() => setIsUploadModalOpen(true)}
      />

      <SavedSchedulesModal 
        isOpen={isSavedModalOpen} 
        onClose={() => setIsSavedModalOpen(false)} 
      />

      <UploadExcelModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </div>
  );
}
