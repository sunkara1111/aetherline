'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ComplianceEvent, AlarmEvent } from '@/lib/types';

interface EventTimelineProps {
  alarmEvents: AlarmEvent[];
}

function generateComplianceEvents(alarmEvents: AlarmEvent[]): ComplianceEvent[] {
  const events: ComplianceEvent[] = [];
  
  events.push({
    id: `shift_${Date.now()}`,
    timestamp: Date.now() - 7200000,
    type: 'shift_change',
    description: 'Simulated shift start — demo plant, no named operator',
    tags: ['SHIFT', 'DEMO'],
    data: { shift: 'day', source: 'demo' },
  });
  
  alarmEvents.forEach(event => {
    events.push({
      id: `alarm_${event.id}`,
      timestamp: event.timestamp,
      type: 'alarm',
      severity: event.severity,
      description: event.message,
      tags: [event.tagId],
      data: {
        tagId: event.tagId,
        tagName: event.tagName,
        value: event.value,
        threshold: event.threshold,
        severity: event.severity,
        state: event.state,
      },
    });
    
    if (event.acknowledged) {
      events.push({
        id: `ack_${event.id}`,
        timestamp: event.acknowledgedAt || event.timestamp + 60000,
        type: 'acknowledgment',
        user: event.acknowledgedBy || 'Demo operator',
        description: `Alarm acknowledged: ${event.tagName}`,
        tags: [event.tagId, 'ACK'],
        data: {
          alarmId: event.id,
          tagId: event.tagId,
        },
      });
    }
  });
  
  return events.sort((a, b) => b.timestamp - a.timestamp);
}

export default function EventTimeline({ alarmEvents }: EventTimelineProps) {
  const [filter, setFilter] = useState<'all' | 'alarm' | 'action'>('all');
  
  const complianceEvents = useMemo(
    () => generateComplianceEvents(alarmEvents),
    [alarmEvents]
  );
  
  const filteredEvents = useMemo(() => {
    if (filter === 'all') return complianceEvents;
    if (filter === 'alarm') return complianceEvents.filter(e => e.type === 'alarm');
    if (filter === 'action') return complianceEvents.filter(e => e.type !== 'alarm');
    return complianceEvents;
  }, [complianceEvents, filter]);

  const exportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      facility: 'Demo Plant — Reactor Area',
      events: filteredEvents,
      summary: {
        totalEvents: filteredEvents.length,
        alarms: filteredEvents.filter(e => e.type === 'alarm').length,
        critical: filteredEvents.filter(e => e.severity === 'critical').length,
      },
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_events_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportHTML = () => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aetherline Compliance Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Inter, system-ui, -apple-system, sans-serif;
      background: white; 
      color: #0f172a; 
      padding: 40px; 
      line-height: 1.6;
    }
    .header { 
      border-bottom: 3px solid #f3770b; 
      padding-bottom: 20px; 
      margin-bottom: 30px; 
    }
    .header h1 { font-size: 28px; margin-bottom: 10px; color: #0f172a; font-weight: 700; }
    .header .meta { font-size: 14px; color: #64748b; }
    .summary { 
      background: #f8fafc; 
      padding: 20px; 
      border-left: 4px solid #f3770b; 
      margin-bottom: 30px;
      border-radius: 8px;
    }
    .summary h2 { font-size: 18px; margin-bottom: 12px; color: #1e293b; font-weight: 600; }
    .summary .stat { display: inline-block; margin-right: 30px; font-size: 14px; }
    .event { 
      padding: 16px; 
      border-left: 4px solid #cbd5e1; 
      margin-bottom: 16px; 
      page-break-inside: avoid;
      border-radius: 8px;
      background: #fafafa;
    }
    .event.alarm { border-left-color: #f3770b; background: #fff7ed; }
    .event.critical { border-left-color: #dc2626; background: #fef2f2; }
    .event.action { border-left-color: #06b6d4; background: #ecfeff; }
    .event .time { font-size: 12px; color: #64748b; font-weight: 600; }
    .event .type { 
      display: inline-block; 
      padding: 4px 10px; 
      background: #0f172a; 
      color: #fff; 
      font-size: 11px; 
      margin: 6px 0;
      border-radius: 4px;
      font-weight: 600;
    }
    .event .desc { font-size: 14px; margin: 8px 0; color: #1e293b; }
    .event .tags { font-size: 12px; color: #64748b; }
    .event .data { 
      font-size: 11px; 
      color: #64748b; 
      margin-top: 8px; 
      padding-top: 8px; 
      border-top: 1px solid #e2e8f0; 
    }
    .footer { 
      margin-top: 50px; 
      padding-top: 20px; 
      border-top: 2px solid #e2e8f0; 
      font-size: 12px; 
      color: #64748b; 
      text-align: center; 
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Aetherline Compliance Report</h1>
    <div class="meta">
      <div>Facility: Demo Plant — Reactor Area</div>
      <div>Generated: ${new Date().toLocaleString()}</div>
      <div>Report Period: ${filteredEvents.length > 0 ? new Date(filteredEvents[filteredEvents.length - 1].timestamp).toLocaleString() : 'N/A'} - ${filteredEvents.length > 0 ? new Date(filteredEvents[0].timestamp).toLocaleString() : 'N/A'}</div>
    </div>
  </div>
  
  <div class="summary">
    <h2>Executive Summary</h2>
    <div class="stat">Total Events: <strong>${filteredEvents.length}</strong></div>
    <div class="stat">Alarms: <strong>${filteredEvents.filter(e => e.type === 'alarm').length}</strong></div>
    <div class="stat">Critical: <strong>${filteredEvents.filter(e => e.severity === 'critical').length}</strong></div>
    <div class="stat">High: <strong>${filteredEvents.filter(e => e.severity === 'high').length}</strong></div>
  </div>
  
  <div class="events">
    ${filteredEvents.map(event => `
      <div class="event ${event.type === 'alarm' ? (event.severity === 'critical' ? 'critical' : 'alarm') : 'action'}">
        <div class="time">${new Date(event.timestamp).toLocaleString()}</div>
        <div class="type">${event.type.toUpperCase()}</div>
        ${event.severity ? `<div class="type" style="background: ${event.severity === 'critical' ? '#dc2626' : '#f3770b'};">${event.severity.toUpperCase()}</div>` : ''}
        <div class="desc">${event.description}</div>
        ${event.user ? `<div class="tags">User: ${event.user}</div>` : ''}
        <div class="tags">Tags: ${event.tags.join(', ')}</div>
        <div class="data">
          ${Object.entries(event.data).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(' | ')}
        </div>
      </div>
    `).join('')}
  </div>
  
  <div class="footer">
    <div><strong>Aetherline</strong> - Industrial Signal Narrative Workbench</div>
    <div style="margin-top: 8px;">© Dineshgopi Sunkara - Senior Controls Engineer · Automation Engineer</div>
    <div style="margin-top: 4px;">Educational demo export. Mock process data — not a production compliance record.</div>
  </div>
</body>
</html>`;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_report_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const eventTypeIcons = {
    alarm: '🚨',
    acknowledgment: '✓',
    action: '⚙️',
    note: '📝',
    shift_change: '👤',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-industrial-900 dark:text-white mb-1">
            Event Timeline
          </h2>
          <p className="text-sm text-industrial-600 dark:text-industrial-400">
            Comprehensive compliance logging and audit trail
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="input-field text-sm"
          >
            <option value="all">All Events</option>
            <option value="alarm">Alarms Only</option>
            <option value="action">Actions Only</option>
          </select>
          <button
            onClick={exportJSON}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            JSON
          </button>
          <button
            onClick={exportHTML}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            HTML
          </button>
        </div>
      </div>

      <div className="bg-industrial-50 dark:bg-industrial-800/50 border-2 border-industrial-200 dark:border-industrial-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="badge badge-primary">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </div>
          <div className="text-xs text-industrial-600 dark:text-industrial-400 font-medium">
            Newest first
          </div>
        </div>
        
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-custom">
          {filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-industrial-200 dark:bg-industrial-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-industrial-500 dark:text-industrial-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-industrial-600 dark:text-industrial-400 font-medium">No events to display</p>
            </motion.div>
          ) : (
            filteredEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={`relative border-l-4 pl-5 py-4 rounded-r-xl transition-all hover:scale-[1.01] ${
                  event.severity === 'critical'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : event.type === 'alarm'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">
                        {eventTypeIcons[event.type] || '•'}
                      </span>
                      <span className={`badge text-[10px] ${
                        event.type === 'alarm'
                          ? 'badge-primary'
                          : 'badge-accent'
                      }`}>
                        {event.type.replace('_', ' ').toUpperCase()}
                      </span>
                      {event.severity && (
                        <span className={`badge text-[10px] ${
                          event.severity === 'critical'
                            ? 'badge-warning'
                            : 'badge-primary'
                        }`}>
                          {event.severity.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-industrial-900 dark:text-white font-bold mb-2">
                      {event.description}
                    </div>
                    {event.user && (
                      <div className="text-xs text-industrial-600 dark:text-industrial-400 mb-2">
                        <span className="font-semibold">User:</span> {event.user}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {event.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-1 bg-white dark:bg-industrial-900 border border-industrial-300 dark:border-industrial-600 rounded text-industrial-700 dark:text-industrial-300 font-bold uppercase tracking-wider"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-industrial-500 dark:text-industrial-400 text-right flex-shrink-0 font-mono">
                    <div>{new Date(event.timestamp).toLocaleDateString()}</div>
                    <div className="font-bold text-industrial-900 dark:text-white">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
