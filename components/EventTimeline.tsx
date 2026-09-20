'use client';

import { useState, useMemo } from 'react';
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
    user: 'Operator A. Johnson',
    description: 'Shift start - Day shift beginning',
    tags: ['SHIFT', 'PERSONNEL'],
    data: { shift: 'day', operator: 'A. Johnson' },
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
        user: event.acknowledgedBy || 'Operator A. Johnson',
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
      facility: 'Industrial Plant - Reactor Area',
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
      font-family: system-ui, -apple-system, sans-serif;
      background: white; 
      color: #000; 
      padding: 40px; 
      line-height: 1.6;
    }
    .header { 
      border-bottom: 3px solid #14b8a6; 
      padding-bottom: 20px; 
      margin-bottom: 30px; 
    }
    .header h1 { font-size: 28px; margin-bottom: 10px; color: #0f172a; }
    .header .meta { font-size: 14px; color: #64748b; }
    .summary { 
      background: #f1f5f9; 
      padding: 20px; 
      border-left: 4px solid #14b8a6; 
      margin-bottom: 30px;
      border-radius: 8px;
    }
    .summary h2 { font-size: 18px; margin-bottom: 12px; color: #1e293b; }
    .summary .stat { display: inline-block; margin-right: 30px; font-size: 14px; }
    .event { 
      padding: 16px; 
      border-left: 4px solid #cbd5e1; 
      margin-bottom: 16px; 
      page-break-inside: avoid;
      border-radius: 8px;
      background: #fafafa;
    }
    .event.alarm { border-left-color: #f97316; background: #fff7ed; }
    .event.critical { border-left-color: #dc2626; background: #fef2f2; }
    .event.action { border-left-color: #3b82f6; background: #eff6ff; }
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
      <div>Facility: Industrial Plant - Reactor Area</div>
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
        ${event.severity ? `<div class="type" style="background: ${event.severity === 'critical' ? '#dc2626' : '#f97316'};">${event.severity.toUpperCase()}</div>` : ''}
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
    <div style="margin-top: 4px;">This is an official compliance record. Retain per regulatory requirements.</div>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Event Timeline
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          >
            <option value="all">All Events</option>
            <option value="alarm">Alarms Only</option>
            <option value="action">Actions Only</option>
          </select>
          <button
            onClick={exportJSON}
            className="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 hover:border-primary-500 dark:hover:border-primary-400 text-gray-900 dark:text-white font-medium text-sm rounded-lg transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={exportHTML}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
          >
            Export HTML
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-soft dark:shadow-soft-dark p-5">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} • 
          Newest first
        </div>
        
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p>No events to display</p>
            </div>
          ) : (
            filteredEvents.map((event, idx) => (
              <div
                key={event.id}
                className={`relative border-l-4 pl-4 py-3 rounded-r-lg transition-colors ${
                  event.severity === 'critical'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                    : event.type === 'alarm'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10'
                    : 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">
                        {eventTypeIcons[event.type] || '•'}
                      </span>
                      <span className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-full ${
                        event.type === 'alarm'
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      }`}>
                        {event.type.replace('_', ' ')}
                      </span>
                      {event.severity && (
                        <span className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-full ${
                          event.severity === 'critical'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                        }`}>
                          {event.severity}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white font-medium mb-1">
                      {event.description}
                    </div>
                    {event.user && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        User: {event.user}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {event.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded text-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-right flex-shrink-0">
                    <div>{new Date(event.timestamp).toLocaleDateString()}</div>
                    <div className="font-semibold">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
