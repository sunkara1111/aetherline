'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RunbookEntry, AlarmEvent } from '@/lib/types';
import { generateRunbooks, exportRunbookAsText } from '@/lib/runbook';

interface RunbookPanelProps {
  alarmEvents: AlarmEvent[];
}

export default function RunbookPanel({ alarmEvents }: RunbookPanelProps) {
  const [runbooks, setRunbooks] = useState<RunbookEntry[]>([]);
  const [selectedRunbook, setSelectedRunbook] = useState<RunbookEntry | null>(null);
  const [autoGenerate, setAutoGenerate] = useState(true);

  useEffect(() => {
    if (!autoGenerate) return;
    if (alarmEvents.length === 0) {
      setRunbooks([]);
      setSelectedRunbook(null);
      return;
    }
    const generated = generateRunbooks(alarmEvents);
    setRunbooks(generated);
    if (generated.length > 0 && !selectedRunbook) {
      setSelectedRunbook(generated[0]);
    }
  }, [alarmEvents, autoGenerate, selectedRunbook]);

  const handleDownload = (runbook: RunbookEntry) => {
    const text = exportRunbookAsText(runbook);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `runbook_${runbook.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const severityStyles = {
    critical: 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20',
    high: 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20',
    medium: 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20',
    low: 'border-accent-300 dark:border-accent-700 bg-accent-50 dark:bg-accent-900/20',
    info: 'border-industrial-300 dark:border-industrial-700 bg-industrial-50 dark:bg-industrial-900/20',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-industrial-900 dark:text-white mb-1">
            Response Runbooks
          </h2>
          <p className="text-sm text-industrial-600 dark:text-industrial-400">
            Auto-generated procedures based on alarm patterns
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-industrial-600 dark:text-industrial-400 cursor-pointer hover:text-industrial-900 dark:hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={autoGenerate}
              onChange={(e) => setAutoGenerate(e.target.checked)}
              className="rounded border-2 border-industrial-300 dark:border-industrial-600 bg-white dark:bg-industrial-900 text-primary-600 focus:ring-2 focus:ring-primary-500"
            />
            <span className="font-medium">Auto-generate</span>
          </label>
          <div className="badge badge-primary">
            {runbooks.length} runbook{runbooks.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {runbooks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-industrial-50 dark:bg-industrial-800/50 border-2 border-industrial-200 dark:border-industrial-700 rounded-xl p-12 text-center"
        >
          <div className="w-16 h-16 bg-industrial-200 dark:bg-industrial-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-industrial-500 dark:text-industrial-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-industrial-600 dark:text-industrial-400 font-medium">
            {alarmEvents.length === 0
              ? 'No active alarms. Runbooks will generate when patterns are detected.'
              : 'Analyzing alarm patterns...'}
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 space-y-3">
            <div className="text-xs font-bold text-industrial-600 dark:text-industrial-400 uppercase tracking-wider mb-3">
              Generated Procedures
            </div>
            <AnimatePresence mode="popLayout">
              {runbooks.map((runbook, index) => (
                <motion.button
                  key={runbook.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedRunbook(runbook)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedRunbook?.id === runbook.id
                      ? severityStyles[runbook.severity] + ' shadow-sharp-md dark:shadow-sharp-dark-md scale-105'
                      : 'border-industrial-200 dark:border-industrial-700 bg-industrial-50 dark:bg-industrial-800/50 hover:border-primary-300 dark:hover:border-primary-600 hover:scale-102'
                  }`}
                >
                  <div className="text-sm font-bold text-industrial-900 dark:text-white mb-2">
                    {runbook.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`badge text-[10px] ${
                      runbook.severity === 'critical' ? 'badge-warning' :
                      runbook.severity === 'high' ? 'badge-primary' :
                      'badge-accent'
                    }`}>
                      {runbook.severity.toUpperCase()}
                    </span>
                    <span className="text-industrial-500 dark:text-industrial-500">•</span>
                    <span className="text-industrial-600 dark:text-industrial-400 font-semibold">{runbook.steps.length} steps</span>
                  </div>
                  <div className="mt-2 text-xs text-industrial-500 dark:text-industrial-500 font-mono">
                    {new Date(runbook.generatedAt).toLocaleTimeString()}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedRunbook ? (
                <motion.div
                  key={selectedRunbook.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={`border-2 rounded-xl p-6 shadow-sharp-md dark:shadow-sharp-dark-md ${severityStyles[selectedRunbook.severity]}`}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="text-xl font-bold text-industrial-900 dark:text-white mb-3">
                        {selectedRunbook.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {selectedRunbook.tags.map(tag => (
                          <span
                            key={tag}
                            className="badge bg-white dark:bg-industrial-900 border border-industrial-300 dark:border-industrial-600 text-industrial-700 dark:text-industrial-300 font-bold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(selectedRunbook)}
                      className="btn-primary text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  </div>

                  <div className="space-y-4">
                    {selectedRunbook.steps.map((step, index) => (
                      <motion.div
                        key={step.step}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/70 dark:bg-industrial-900/50 border-2 border-industrial-200 dark:border-industrial-700 rounded-xl p-5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold shadow-sharp">
                            {step.step}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-industrial-600 dark:text-industrial-400 uppercase tracking-wider mb-2">
                              Condition
                            </div>
                            <div className="text-sm text-industrial-900 dark:text-white font-medium mb-4">
                              {step.condition}
                            </div>
                            <div className="text-xs font-bold text-industrial-600 dark:text-industrial-400 uppercase tracking-wider mb-2">
                              Action
                            </div>
                            <div className="text-sm text-primary-700 dark:text-primary-300 font-bold">
                              {step.action}
                            </div>
                            {step.safetyNote && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-lg"
                              >
                                <div className="text-xs font-bold text-red-700 dark:text-red-300 flex items-center gap-2 mb-2">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  SAFETY NOTE
                                </div>
                                <div className="text-xs text-red-700 dark:text-red-300 font-medium">
                                  {step.safetyNote}
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-5 pt-5 border-t-2 border-industrial-200 dark:border-industrial-700 text-xs text-industrial-500 dark:text-industrial-500 font-mono">
                    Generated: {new Date(selectedRunbook.generatedAt).toLocaleString()} • 
                    Pattern: {selectedRunbook.pattern.replace(/_/g, ' ').toUpperCase()}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-industrial-50 dark:bg-industrial-800/50 border-2 border-industrial-200 dark:border-industrial-700 rounded-xl p-12 text-center h-full flex items-center justify-center"
                >
                  <div className="text-industrial-600 dark:text-industrial-400 font-medium">
                    Select a runbook to view details
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
