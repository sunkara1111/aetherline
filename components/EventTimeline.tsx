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
      font-family: 'Courier New', monospace; 
      background: white; 
      color: #000; 
      padding: 40px; 
      line-height: 1.6;
    }
    .header { 
      border-bottom: 3px solid #000; 
      padding-bottom: 20px; 
      margin-bottom: 30px; 
    }
    .header h1 { font-size: 24px; margin-bottom: 10px; }
    .header .meta { font-size: 12px; color: #666; }
    .summary { 
      background: #f5f5f5; 
      padding: 15px; 
      border-left: 4px solid #000; 
      margin-bottom: 30px; 
    }
    .summary h2 { font-size: 16px; margin-bottom: 10px; }
    .summary .stat { display: inline-block; margin-right: 30px; font-size: 14px; }
    .event { 
      padding: 15px; 
      border-left: 4px solid #ccc; 
      margin-bottom: 15px; 
      page-break-inside: avoid; 
    }
    .event.alarm { border-left-color: #f97316; background: #fff7ed; }
    .event.critical { border-left-color: #dc2626; background: #fef2f2; }
    .event.action { border-left-color: #3b82f6; background: #eff6ff; }
    .event .time { font-size: 12px; color: #666; font-weight: bold; }
    .event .type { 
      display: inline-block; 
      padding: 2px 8px; 
      background: #000; 
      color: #fff; 
      font-size: 10px; 
      margin: 5px 0; 
    }
    .event .desc { font-size: 14px; margin: 5px 0; }
    .event .tags { font-size: 11px; color: #666; }
    .event .data { 
      font-size: 11px; 
      color: #666; 
      margin-top: 5px; 
      padding-top: 5px; 
      border-top: 1px solid #ddd; 
    }
    .footer { 
      margin-top: 40px; 
      padding-top: 20px; 
      border-top: 2px solid #000; 
      font-size: 11px; 
      color: #666; 
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
    <h1>AETHERLINE COMPLIANCE REPORT</h1>
    <div class="meta">
      <div>Facility: Industrial Plant - Reactor Area</div>
      <div>Generated: ${new Date().toLocaleString()}</div>
      <div>Report Period: ${filteredEvents.length > 0 ? new Date(filteredEvents[filteredEvents.length - 1].timestamp).toLocaleString() : 'N/A'} - ${filteredEvents.length > 0 ? new Date(filteredEvents[0].timestamp).toLocaleString() : 'N/A'}</div>
    </div>
  </div>
  
  <div class="summary">
    <h2>EXECUTIVE SUMMARY</h2>
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
    <div>Generated by Aetherline Industrial Signal Narrative Workbench</div>
    <div>Created by Dineshgopi Sunkara</div>
    <div>This is an official compliance record. Retain per regulatory requirements.</div>
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
        <h2 className="text-lg font-bold text-hud-accent font-mono">
          COMPLIANCE EVENT TIMELINE
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-hud-panel border border-hud-border text-hud-text text-xs font-mono rounded focus:outline-none focus:border-hud-accent"
          >
            <option value="all">ALL EVENTS</option>
            <option value="alarm">ALARMS ONLY</option>
            <option value="action">ACTIONS ONLY</option>
          </select>
          <button
            onClick={exportJSON}
            className="px-3 py-1.5 bg-hud-panel border border-hud-accent text-hud-accent font-mono text-xs font-bold rounded hover:bg-hud-accent hover:text-hud-bg transition-colors"
          >
            EXPORT JSON
          </button>
          <button
            onClick={exportHTML}
            className="px-3 py-1.5 bg-hud-accent text-hud-bg font-mono text-xs font-bold rounded hover:bg-hud-accent/80 transition-colors"
          >
            EXPORT HTML
          </button>
        </div>
      </div>

      <div className="bg-hud-panel border border-hud-border rounded-md p-4">
        <div className="text-xs text-hud-textDim font-mono mb-4">
          {filteredEvents.length} EVENT{filteredEvents.length !== 1 ? 'S' : ''} • 
          NEWEST FIRST
        </div>
        
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-hud-textDim font-mono text-sm">
              No events to display
            </div>
          ) : (
            filteredEvents.map((event, idx) => (
              <div
                key={event.id}
                className={`relative border-l-4 pl-4 py-2 ${
                  event.severity === 'critical'
                    ? 'border-red-600 bg-red-950/20'
                    : event.type === 'alarm'
                    ? 'border-orange-500 bg-orange-950/20'
                    : 'border-blue-500 bg-blue-950/20'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {eventTypeIcons[event.type] || '•'}
                      </span>
                      <span className={`text-xs font-bold font-mono uppercase px-2 py-0.5 rounded ${
                        event.type === 'alarm'
                          ? 'bg-orange-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}>
                        {event.type.replace('_', ' ')}
                      </span>
                      {event.severity && (
                        <span className={`text-xs font-bold font-mono uppercase px-2 py-0.5 rounded ${
                          event.severity === 'critical'
                            ? 'bg-red-600 text-white'
                            : 'bg-orange-500 text-white'
                        }`}>
                          {event.severity}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-hud-text font-mono mb-1">
                      {event.description}
                    </div>
                    {event.user && (
                      <div className="text-xs text-hud-textDim font-mono">
                        User: {event.user}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {event.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-1.5 py-0.5 bg-hud-bg border border-hud-border rounded text-hud-accent font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-hud-textDim font-mono text-right flex-shrink-0">
                    <div>{new Date(event.timestamp).toLocaleDateString()}</div>
                    <div className="font-bold">
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
