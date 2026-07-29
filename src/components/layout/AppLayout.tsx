import React, { useState, useEffect } from 'react';
import { NavigationTab } from '../../types';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileMenu } from './MobileMenu';
import { OrgAndRoleSelector } from '../auth/OrgAndRoleSelector';
import { DashboardPage } from '../../pages/DashboardPage';
import { AtletiPage } from '../../pages/AtletiPage';
import { PacchettiPage } from '../../pages/PacchettiPage';
import { AbbonamentiPage } from '../../pages/AbbonamentiPage';
import { PagamentiPage } from '../../pages/PagamentiPage';
import { ScadenzePage } from '../../pages/ScadenzePage';
import { RinnoviPage } from '../../pages/RinnoviPage';
import { AttivitaPage } from '../../pages/AttivitaPage';
import { CalendarioPage } from '../../pages/CalendarioPage';
import { DocumentiPage } from '../../pages/DocumentiPage';
import { ComunicazioniPage } from '../../pages/ComunicazioniPage';
import { ReportPage } from '../../pages/ReportPage';
import { CollaboratoriPage } from '../../pages/CollaboratoriPage';
import { ImpostazioniPage } from '../../pages/ImpostazioniPage';
import { AtletaPortalePage } from '../../pages/AtletaPortalePage';
import { useAuth } from '../../context/AuthContext';

export const AppLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const { user } = useAuth();

  // Auto switch tab if current active tab is not allowed for user role
  useEffect(() => {
    if (user?.role === 'atleta' && currentTab !== 'atleta_portale' && currentTab !== 'calendario' && currentTab !== 'documenti' && currentTab !== 'impostazioni') {
      setCurrentTab('atleta_portale');
    }
  }, [user?.role]);

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'atleta_portale':
        return <AtletaPortalePage />;
      case 'atleti':
        return <AtletiPage />;
      case 'pacchetti':
        return <PacchettiPage />;
      case 'abbonamenti':
        return <AbbonamentiPage />;
      case 'pagamenti':
        return <PagamentiPage />;
      case 'scadenze':
        return <ScadenzePage />;
      case 'rinnovi':
        return <RinnoviPage />;
      case 'attivita':
        return <AttivitaPage />;
      case 'calendario':
        return <CalendarioPage />;
      case 'documenti':
        return <DocumentiPage />;
      case 'comunicazioni':
        return <ComunicazioniPage />;
      case 'report':
        return <ReportPage />;
      case 'collaboratori':
        return <CollaboratoriPage />;
      case 'impostazioni':
        return <ImpostazioniPage />;
      default:
        return <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-row overflow-x-hidden antialiased font-sans">
      {/* Desktop Collapsible Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Mobile Slide-over Drawer Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Org & Role Testing Switcher Bar */}
        <OrgAndRoleSelector />

        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onTabChange={(tab) => setCurrentTab(tab)}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-zinc-800">
          <div className="max-w-7xl mx-auto">{renderActiveView()}</div>
        </main>
      </div>
    </div>
  );
};
