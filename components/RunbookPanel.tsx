'use client';

import { useState, useEffect } from 'react';
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
    if (autoGenerate && alarmEvents.length > 0) {
      const generated = generateRunbooks(alarmEvents);
      setRunbooks(generated);
      if (generated.length > 0 && !selectedRunbook) {
        setSelectedRunbook(generated[0]);
      }
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
    critical: 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/10',
    high: 'border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10',
    medium: 'border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10',
    low: 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10',
    info: 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/10',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Response Runbooks
        </h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoGenerate}
              onChange={(e) => setAutoGenerate(e.target.checked)}
              className="rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-500 focus:ring-primary-500"
            />
            Auto-generate
          </label>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {runbooks.length} runbook{runbooks.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {runbooks.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-soft dark:shadow-soft-dark p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            {alarmEvents.length === 0
              ? 'No active alarms. Runbooks will generate when alarm patterns are detected.'
              : 'Analyzing alarm patterns...'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-2">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Generated Procedures
            </div>
            {runbooks.map((runbook) => (
              <button
                key={runbook.id}
                onClick={() => setSelectedRunbook(runbook)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedRunbook?.id === runbook.id
                    ? severityStyles[runbook.severity] + ' border-2 shadow-soft dark:shadow-soft-dark'
                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {runbook.title}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span className={`uppercase font-medium ${
                    runbook.severity === 'critical' ? 'text-red-600 dark:text-red-400' :
                    runbook.severity === 'high' ? 'text-orange-600 dark:text-orange-400' :
                    'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {runbook.severity}
                  </span>
                  <span>•</span>
                  <span>{runbook.steps.length} steps</span>
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  {new Date(runbook.generatedAt).toLocaleTimeString()}
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selectedRunbook ? (
              <div className={`border-2 rounded-xl p-5 shadow-soft dark:shadow-soft-dark ${severityStyles[selectedRunbook.severity]}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {selectedRunbook.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {selectedRunbook.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-full text-gray-700 dark:text-gray-300 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(selectedRunbook)}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                  >
                    Download
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedRunbook.steps.map((step) => (
                    <div
                      key={step.step}
                      className="bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-sm">
                          {step.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                            Condition
                          </div>
                          <div className="text-sm text-gray-900 dark:text-white mb-3">
                            {step.condition}
                          </div>
                          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                            Action
                          </div>
                          <div className="text-sm text-primary-700 dark:text-primary-300 font-medium">
                            {step.action}
                          </div>
                          {step.safetyNote && (
                            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                              <div className="text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                                <span>⚠️</span>
                                <span>SAFETY NOTE:</span>
                              </div>
                              <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                                {step.safetyNote}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 text-xs text-gray-500 dark:text-gray-400">
                  Generated: {new Date(selectedRunbook.generatedAt).toLocaleString()} • 
                  Pattern: {selectedRunbook.pattern.replace(/_/g, ' ').toUpperCase()}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-soft dark:shadow-soft-dark p-8 text-center h-full flex items-center justify-center">
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  Select a runbook to view details
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
