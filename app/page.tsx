'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import SignalCanvas from '@/components/SignalCanvas';
import RunbookPanel from '@/components/RunbookPanel';
import EventTimeline from '@/components/EventTimeline';
import CompanyManager from '@/components/CompanyManager';
import CompanyUpdates from '@/components/CompanyUpdates';
import { initializeSignalData, updateSignalData, generateAlarmEvents } from '@/lib/mockData';
import { 
  saveCompanies, 
  loadCompanies, 
  saveCurrentCompanyId, 
  loadCurrentCompanyId,
  createDefaultCompany,
  generateCompanyUpdates 
} from '@/lib/companies';
import type { SignalData, AlarmEvent, Company, CompanyUpdate } from '@/lib/types';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [alarmEvents, setAlarmEvents] = useState<AlarmEvent[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Companies state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);
  const [showCompanyManager, setShowCompanyManager] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | undefined>();
  const [companyUpdates, setCompanyUpdates] = useState<CompanyUpdate[]>([]);
  const [showUpdates, setShowUpdates] = useState(false);

  // Load companies from localStorage on mount
  useEffect(() => {
    const loaded = loadCompanies();
    if (loaded.length === 0) {
      const defaultCompany = createDefaultCompany();
      setCompanies([defaultCompany]);
      setCurrentCompanyId(defaultCompany.id);
      saveCompanies([defaultCompany]);
      saveCurrentCompanyId(defaultCompany.id);
    } else {
      setCompanies(loaded);
      const savedId = loadCurrentCompanyId();
      setCurrentCompanyId(savedId || loaded[0].id);
    }
  }, []);

  // Initialize signals
  useEffect(() => {
    setSignals(initializeSignalData());
  }, []);

  // Update simulation
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSignals(prev => {
        const updated = updateSignalData(prev);
        const newAlarms = generateAlarmEvents(updated);
        setAlarmEvents(newAlarms);
        return updated;
      });
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Generate company updates
  useEffect(() => {
    const currentCompany = companies.find(c => c.id === currentCompanyId);
    if (currentCompany && alarmEvents.length > 0) {
      setCompanyUpdates(prev => 
        generateCompanyUpdates(currentCompany, alarmEvents, prev)
      );
    }
  }, [alarmEvents, companies, currentCompanyId]);

  const currentCompany = companies.find(c => c.id === currentCompanyId);

  const handleSaveCompany = (company: Company) => {
    const updated = editingCompany
      ? companies.map(c => c.id === company.id ? company : c)
      : [...companies, company];
    
    setCompanies(updated);
    saveCompanies(updated);
    
    if (!editingCompany) {
      setCurrentCompanyId(company.id);
      saveCurrentCompanyId(company.id);
    }
    
    setShowCompanyManager(false);
    setEditingCompany(undefined);
  };

  const handleDeleteCompany = (id: string) => {
    const updated = companies.filter(c => c.id !== id);
    setCompanies(updated);
    saveCompanies(updated);
    
    if (currentCompanyId === id) {
      const newCurrent = updated[0]?.id || null;
      setCurrentCompanyId(newCurrent);
      if (newCurrent) saveCurrentCompanyId(newCurrent);
    }
  };

  const handleSwitchCompany = (id: string) => {
    setCurrentCompanyId(id);
    saveCurrentCompanyId(id);
    setCompanyUpdates([]);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm sticky top-0 z-40 backdrop-blur-sm bg-white/95 dark:bg-slate-800/95">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          {/* Hero section */}
          <div className="text-center mb-6 pt-2">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2">
              Aetherline
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
              Modern industrial automation monitoring with real-time signal visualization, 
              intelligent alarm management, and automated response procedures
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Company selector */}
              {companies.length > 0 && currentCompany && (
                <div className="flex items-center gap-2">
                  <select
                    value={currentCompanyId || ''}
                    onChange={(e) => handleSwitchCompany(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  >
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowUpdates(!showUpdates)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      showUpdates
                        ? 'bg-primary-500 text-white'
                        : 'bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:border-primary-500 dark:hover:border-primary-400'
                    }`}
                  >
                    Updates
                  </button>
                  <button
                    onClick={() => {
                      setEditingCompany(undefined);
                      setShowCompanyManager(true);
                    }}
                    className="px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 hover:border-primary-500 dark:hover:border-primary-400 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                  >
                    + Connect Company
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* System time */}
              <div className="text-right hidden sm:block">
                <div className="text-xs text-gray-500 dark:text-gray-400">System Time</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>

              {/* Pause/Resume */}
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-4 py-2 font-medium text-sm rounded-lg transition-all shadow-sm ${
                  isRunning
                    ? 'bg-primary-500 hover:bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600'
                }`}
              >
                {isRunning ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Pause
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Resume
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {showUpdates && currentCompany ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {currentCompany.name} - Operations Feed
              </h2>
              <button
                onClick={() => setShowUpdates(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <CompanyUpdates company={currentCompany} updates={companyUpdates} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-soft dark:shadow-soft-dark p-5 sm:p-6">
                <SignalCanvas signals={signals} />
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-soft dark:shadow-soft-dark p-5 sm:p-6">
                <RunbookPanel alarmEvents={alarmEvents} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-soft dark:shadow-soft-dark p-5 sm:p-6">
              <EventTimeline alarmEvents={alarmEvents} />
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 mt-12">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="font-semibold text-gray-900 dark:text-white mb-1">
                Aetherline v1.0.0
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                © Dineshgopi Sunkara
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Senior Controls Engineer · Automation Engineer
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end text-center md:text-right text-xs text-gray-500 dark:text-gray-500 space-y-1">
              <div>Fully client-side • No API keys required</div>
              <div>Mock process data • Educational purposes</div>
              <div className="text-primary-600 dark:text-primary-400 font-medium">MIT License</div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700 text-center text-xs text-gray-500 dark:text-gray-500">
            Modern industrial automation monitoring and compliance tracking platform
          </div>
        </div>
      </footer>

      {/* Company Manager Modal */}
      {showCompanyManager && (
        <CompanyManager
          companies={companies}
          onSave={handleSaveCompany}
          onClose={() => {
            setShowCompanyManager(false);
            setEditingCompany(undefined);
          }}
          editingCompany={editingCompany}
        />
      )}
    </main>
  );
}
