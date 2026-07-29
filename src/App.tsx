import React, { useEffect, useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AthletesProvider } from './context/AthletesContext';
import { PackagesProvider } from './context/PackagesContext';
import { SubscriptionsProvider } from './context/SubscriptionsContext';
import { PaymentsProvider } from './context/PaymentsContext';
import { RenewalsProvider } from './context/RenewalsContext';
import { TasksProvider } from './context/TasksContext';
import { CalendarProvider } from './context/CalendarContext';
import { DocumentsProvider } from './context/DocumentsContext';
import { CommunicationsProvider } from './context/CommunicationsContext';
import { SettingsProvider } from './context/SettingsContext';
import { RegisterPaymentModal } from './components/payments/RegisterPaymentModal';
import { ToastContainer } from './components/common/ToastContainer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { FirstRunSetupPage } from './pages/setup/FirstRunSetupPage';
import { LocalOwnerProfile } from './types';
import { readOwnerProfile } from './lib/ownerProfile';

const MainContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-zinc-100">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest animate-pulse">
          Caricamento Builder Athlete Manager...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <AppLayout />
      <RegisterPaymentModal />
    </>
  );
};

export default function App() {
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);
  const [ownerProfile, setOwnerProfile] = useState<LocalOwnerProfile | null>(null);

  useEffect(() => {
    setOwnerProfile(readOwnerProfile());
    setIsCheckingSetup(false);
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        {isCheckingSetup ? (
          <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-zinc-100">
            <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin mb-4" />
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest animate-pulse">
              Verifica configurazione iniziale...
            </p>
          </div>
        ) : !ownerProfile ? (
          <FirstRunSetupPage onCompleted={setOwnerProfile} />
        ) : (
        <AuthProvider>
          <AthletesProvider>
            <PackagesProvider>
              <SubscriptionsProvider>
                <PaymentsProvider>
                  <RenewalsProvider>
                    <TasksProvider>
                      <CalendarProvider>
                        <DocumentsProvider>
                          <CommunicationsProvider>
                            <SettingsProvider>
                              <MainContent />
                            </SettingsProvider>
                          </CommunicationsProvider>
                        </DocumentsProvider>
                      </CalendarProvider>
                    </TasksProvider>
                  </RenewalsProvider>
                </PaymentsProvider>
              </SubscriptionsProvider>
            </PackagesProvider>
          </AthletesProvider>
        </AuthProvider>
        )}
        <ToastContainer />
      </ToastProvider>
    </ErrorBoundary>
  );
}


