'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  generateCompanyUpdates,
  tagsFromCompany,
} from '@/lib/companies';
import type { SignalData, AlarmEvent, Company, CompanyUpdate } from '@/lib/types';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [alarmEvents, setAlarmEvents] = useState<AlarmEvent[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWorkspace, setShowWorkspace] = useState(false);
  
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

  // Initialize signals from the active company (CSV tags when present)
  useEffect(() => {
    const currentCompany = companies.find(c => c.id === currentCompanyId);
    setSignals(initializeSignalData(tagsFromCompany(currentCompany)));
    setAlarmEvents([]);
  }, [companies, currentCompanyId]);

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
  const csvTags = tagsFromCompany(currentCompany);

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
    <main className="min-h-screen flex flex-col bg-white dark:bg-industrial-950 transition-colors duration-300">
      {/* Marketing Hero Section */}
      <AnimatePresence>
        {!showWorkspace && (
          <motion.section
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="relative flex-1 flex flex-col"
          >
            {/* Top Navigation */}
            <nav className="relative z-10 border-b border-industrial-200 dark:border-industrial-800 bg-white/80 dark:bg-industrial-950/80 backdrop-blur-lg">
              <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sharp">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-industrial-900 dark:text-white">Aetherline</h2>
                      <p className="text-xs text-industrial-600 dark:text-industrial-400">Signal Narrative Platform</p>
                    </div>
                  </motion.div>
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={toggleTheme}
                    className="p-2.5 rounded-lg bg-industrial-100 dark:bg-industrial-800 text-industrial-700 dark:text-industrial-300 hover:bg-industrial-200 dark:hover:bg-industrial-700 transition-all duration-200"
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
                  </motion.button>
                </div>
              </div>
            </nav>

            {/* Hero Content */}
            <div className="flex-1 flex items-center justify-center px-6 py-20">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-6">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" aria-hidden="true" />
                        Live
                      </span>
                      <span className="text-primary-400 dark:text-primary-500">·</span>
                      Industrial Signal Intelligence
                    </span>
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-industrial-900 dark:text-white mb-6 leading-tight">
                      Turn Industrial Data
                      <br />
                      Into <span className="text-gradient-primary">Operational Clarity</span>
                    </h1>
                    <p className="text-xl sm:text-2xl text-industrial-600 dark:text-industrial-300 max-w-3xl mx-auto leading-relaxed">
                      Real-time signal visualization, intelligent alarm pattern recognition, and automated response procedures for modern automation engineers
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                  >
                    <button
                      onClick={() => setShowWorkspace(true)}
                      className="group px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-sharp-lg hover:shadow-sharp-xl transition-all duration-300 flex items-center gap-3"
                    >
                      Launch Workbench
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                    <p className="text-sm text-industrial-500 dark:text-industrial-400 max-w-xl">
                      Created by <span className="font-semibold text-industrial-700 dark:text-industrial-200">Dineshgopi Sunkara</span>
                      <span className="mx-1.5">·</span>
                      Senior Controls Engineer · Automation Engineer
                    </p>
                  </motion.div>

                  {/* Feature Highlights */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto"
                  >
                    {[
                      {
                        icon: (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                          </svg>
                        ),
                        title: 'Live Signal Canvas',
                        description: 'Real-time sparkline visualization with intelligent alarm bands and quality indicators'
                      },
                      {
                        icon: (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        ),
                        title: 'Smart Runbooks',
                        description: 'Auto-generated response procedures based on pattern recognition and alarm correlation'
                      },
                      {
                        icon: (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ),
                        title: 'Event Timeline',
                        description: 'Comprehensive compliance logging with JSON and HTML export for audit trails'
                      }
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                        className="card-editorial p-6 hover:scale-105 transition-transform duration-300"
                      >
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center mb-4">
                          {feature.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-industrial-900 dark:text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-industrial-600 dark:text-industrial-400">
                          {feature.description}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Workspace Section */}
      <AnimatePresence>
        {showWorkspace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1"
          >
            {/* Sticky Header */}
            <header className="sticky top-0 z-40 border-b border-industrial-200 dark:border-industrial-800 bg-white/95 dark:bg-industrial-950/95 backdrop-blur-lg">
              <div className="container mx-auto px-6 py-4">
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowWorkspace(false)}
                      className="p-2 text-industrial-600 dark:text-industrial-400 hover:text-industrial-900 dark:hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </button>
                    <div>
                      <h1 className="text-xl font-bold text-industrial-900 dark:text-white">Aetherline</h1>
                      <p className="text-xs text-industrial-600 dark:text-industrial-400">Signal Workbench</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-right">
                      <div className="text-xs text-industrial-600 dark:text-industrial-400">System Time</div>
                      <div className="text-sm font-mono font-semibold text-industrial-900 dark:text-white tabular-nums">
                        {currentTime.toLocaleTimeString()}
                      </div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="p-2.5 rounded-lg bg-industrial-100 dark:bg-industrial-800 text-industrial-700 dark:text-industrial-300 hover:bg-industrial-200 dark:hover:bg-industrial-700 transition-all duration-200"
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
                    <button
                      onClick={() => setIsRunning(!isRunning)}
                      className={`px-5 py-2.5 font-semibold text-sm rounded-lg transition-all duration-200 shadow-sharp flex items-center gap-2 ${
                        isRunning
                          ? 'bg-primary-600 hover:bg-primary-700 text-white'
                          : 'bg-industrial-200 dark:bg-industrial-800 text-industrial-900 dark:text-white hover:bg-industrial-300 dark:hover:bg-industrial-700'
                      }`}
                    >
                      {isRunning ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Pause
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          Resume
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Company Controls */}
                {companies.length > 0 && currentCompany && (
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={currentCompanyId || ''}
                      onChange={(e) => handleSwitchCompany(e.target.value)}
                      className="input-field text-sm"
                    >
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowUpdates(!showUpdates)}
                      className={`btn-${showUpdates ? 'primary' : 'secondary'} text-sm`}
                    >
                      {showUpdates ? 'Hide' : 'Show'} Updates
                    </button>
                    <button
                      onClick={() => {
                        setEditingCompany(currentCompany);
                        setShowCompanyManager(true);
                      }}
                      className="btn-secondary text-sm"
                    >
                      Edit Company
                    </button>
                    <button
                      onClick={() => {
                        setEditingCompany(undefined);
                        setShowCompanyManager(true);
                      }}
                      className="btn-accent text-sm"
                    >
                      + Connect Company
                    </button>
                  </div>
                )}
              </div>
            </header>

            {/* Main Workspace Content */}
            <div className="container mx-auto px-6 py-8">
              {currentCompany?.connectionType === 'webhook' && (
                <div className="mb-6 rounded-xl border-2 border-accent-300 dark:border-accent-800 bg-accent-50 dark:bg-accent-950/40 px-4 py-3 text-sm text-industrial-700 dark:text-industrial-300">
                  Webhook URL stored locally on this device. This GitHub Pages site cannot receive feed posts, so the workbench keeps running demo plant signals.
                </div>
              )}
              {currentCompany?.connectionType === 'csv' && !csvTags && (
                <div className="mb-6 rounded-xl border-2 border-primary-300 dark:border-primary-800 bg-primary-50 dark:bg-primary-950/30 px-4 py-3 text-sm text-industrial-700 dark:text-industrial-300">
                  CSV connection is saved locally. Add a header plus tag rows to drive the canvas; until then the demo plant signals stay on.
                </div>
              )}
              {currentCompany?.connectionType === 'csv' && !!csvTags && (
                <div className="mb-6 rounded-xl border-2 border-industrial-200 dark:border-industrial-700 bg-industrial-50 dark:bg-industrial-900 px-4 py-3 text-sm text-industrial-700 dark:text-industrial-300">
                  Live canvas is simulating the {csvTags.length} tag{csvTags.length === 1 ? '' : 's'} from this company&apos;s CSV. Values are generated in-browser — not a plant feed.
                </div>
              )}
              {showUpdates && currentCompany ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-industrial-900 dark:text-white">
                      {currentCompany.name} <span className="text-industrial-500">/ Operations Feed</span>
                    </h2>
                    <button
                      onClick={() => setShowUpdates(false)}
                      className="p-2 text-industrial-600 dark:text-industrial-400 hover:text-industrial-900 dark:hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <CompanyUpdates company={currentCompany} updates={companyUpdates} />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                      className="card-elevated p-6"
                    >
                      <SignalCanvas signals={signals} />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                      className="card-elevated p-6"
                    >
                      <RunbookPanel alarmEvents={alarmEvents} />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="card-elevated p-6"
                  >
                    <EventTimeline alarmEvents={alarmEvents} />
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer — visible on the public landing page and the workbench */}
      <footer className="mt-auto border-t border-industrial-200 dark:border-industrial-800 bg-industrial-50 dark:bg-industrial-900">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="font-semibold text-industrial-900 dark:text-white mb-1">
                Aetherline v2.0.0
              </div>
              <div className="text-sm text-industrial-600 dark:text-industrial-400">
                © Dineshgopi Sunkara
              </div>
              <div className="text-xs text-industrial-500 dark:text-industrial-500 mt-1">
                Senior Controls Engineer · Automation Engineer
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end text-center md:text-right text-xs text-industrial-500 dark:text-industrial-500 space-y-1">
              <div>Client-side only • No API keys required</div>
              <div>Mock process data • Educational purposes • Not for production control</div>
              <div className="text-primary-600 dark:text-primary-400 font-medium">MIT License</div>
            </div>
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
          onDelete={handleDeleteCompany}
        />
      )}
    </main>
  );
}
