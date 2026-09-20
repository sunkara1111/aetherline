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

  const severityColors = {
    critical: 'border-red-600 bg-red-950/30',
    high: 'border-orange-500 bg-orange-950/30',
    medium: 'border-yellow-500 bg-yellow-950/30',
    low: 'border-blue-500 bg-blue-950/30',
    info: 'border-gray-500 bg-gray-950/30',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-hud-accent font-mono">
          AUTOMATION RUNBOOKS
        </h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-hud-textDim font-mono cursor-pointer">
            <input
              type="checkbox"
              checked={autoGenerate}
              onChange={(e) => setAutoGenerate(e.target.checked)}
              className="rounded bg-hud-panel border-hud-border"
            />
            AUTO-GENERATE
          </label>
          <div className="text-xs text-hud-textDim font-mono">
            {runbooks.length} RUNBOOK{runbooks.length !== 1 ? 'S' : ''}
          </div>
        </div>
      </div>

      {runbooks.length === 0 ? (
        <div className="bg-hud-panel border border-hud-border rounded-md p-8 text-center">
          <div className="text-hud-textDim font-mono text-sm">
            {alarmEvents.length === 0
              ? 'No active alarms. Runbooks will generate when alarm patterns are detected.'
              : 'Analyzing alarm patterns...'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-2">
            <div className="text-xs font-bold text-hud-textDim font-mono mb-2">
              GENERATED RUNBOOKS
            </div>
            {runbooks.map((runbook) => (
              <button
                key={runbook.id}
                onClick={() => setSelectedRunbook(runbook)}
                className={`w-full text-left p-3 rounded border transition-all ${
                  selectedRunbook?.id === runbook.id
                    ? severityColors[runbook.severity] + ' border-2'
                    : 'border-hud-border bg-hud-panel hover:border-hud-accent'
                }`}
              >
                <div className="text-sm font-bold text-hud-text font-mono mb-1">
                  {runbook.title}
                </div>
                <div className="flex items-center gap-2 text-xs text-hud-textDim font-mono">
                  <span className={`uppercase ${
                    runbook.severity === 'critical' ? 'text-red-400' :
                    runbook.severity === 'high' ? 'text-orange-400' :
                    'text-yellow-400'
                  }`}>
                    {runbook.severity}
                  </span>
                  <span>•</span>
                  <span>{runbook.steps.length} STEPS</span>
                </div>
                <div className="mt-1 text-xs text-hud-textDim">
                  {new Date(runbook.generatedAt).toLocaleTimeString()}
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selectedRunbook ? (
              <div className={`border-2 rounded-md p-4 ${severityColors[selectedRunbook.severity]}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-hud-text font-mono mb-2">
                      {selectedRunbook.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                      {selectedRunbook.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-hud-bg border border-hud-border rounded text-hud-accent"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(selectedRunbook)}
                    className="px-3 py-1.5 bg-hud-accent text-hud-bg font-mono text-xs font-bold rounded hover:bg-hud-accent/80 transition-colors"
                  >
                    DOWNLOAD
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedRunbook.steps.map((step) => (
                    <div
                      key={step.step}
                      className="bg-hud-bg/50 border border-hud-border rounded p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-hud-accent text-hud-bg flex items-center justify-center font-bold font-mono">
                          {step.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-hud-textDim font-mono mb-1">
                            CONDITION
                          </div>
                          <div className="text-sm text-hud-text font-mono mb-2">
                            {step.condition}
                          </div>
                          <div className="text-xs text-hud-textDim font-mono mb-1">
                            ACTION
                          </div>
                          <div className="text-sm text-hud-accent font-mono font-bold">
                            {step.action}
                          </div>
                          {step.safetyNote && (
                            <div className="mt-2 p-2 bg-red-950/50 border border-red-600 rounded">
                              <div className="text-xs font-bold text-red-400 font-mono flex items-center gap-2">
                                <span>⚠️</span>
                                <span>SAFETY NOTE:</span>
                              </div>
                              <div className="text-xs text-red-300 font-mono mt-1">
                                {step.safetyNote}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-hud-border text-xs text-hud-textDim font-mono">
                  Generated: {new Date(selectedRunbook.generatedAt).toLocaleString()} • 
                  Pattern: {selectedRunbook.pattern.replace(/_/g, ' ').toUpperCase()}
                </div>
              </div>
            ) : (
              <div className="bg-hud-panel border border-hud-border rounded-md p-8 text-center h-full flex items-center justify-center">
                <div className="text-hud-textDim font-mono text-sm">
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
