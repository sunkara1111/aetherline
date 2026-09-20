import type { AlarmEvent, RunbookEntry, RunbookStep, AlarmSeverity } from './types';

interface AlarmPattern {
  tags: string[];
  conditions: string[];
  type: string;
}

function detectAlarmPatterns(events: AlarmEvent[]): AlarmPattern[] {
  const patterns: AlarmPattern[] = [];
  
  const tagGroups = new Map<string, AlarmEvent[]>();
  events.forEach(event => {
    const group = tagGroups.get(event.tagId) || [];
    group.push(event);
    tagGroups.set(event.tagId, group);
  });
  
  const reactorTemp = events.find(e => e.tagId === 'R101_TEMP');
  const reactorPress = events.find(e => e.tagId === 'R101_PRESS');
  const coolantFlow = events.find(e => e.tagId === 'FLOW_301');
  
  if (reactorTemp && reactorPress) {
    patterns.push({
      tags: ['R101_TEMP', 'R101_PRESS'],
      conditions: ['High temperature', 'High pressure'],
      type: 'reactor_overpressure',
    });
  }
  
  if (reactorTemp && coolantFlow) {
    patterns.push({
      tags: ['R101_TEMP', 'FLOW_301'],
      conditions: ['High temperature', 'Low flow'],
      type: 'cooling_failure',
    });
  }
  
  tagGroups.forEach((groupEvents, tagId) => {
    if (groupEvents.length > 0) {
      patterns.push({
        tags: [tagId],
        conditions: [groupEvents[0].message],
        type: 'single_tag_alarm',
      });
    }
  });
  
  return patterns;
}

function generateRunbookForPattern(pattern: AlarmPattern, events: AlarmEvent[]): RunbookEntry {
  const id = `RB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const severity: AlarmSeverity = events.some(e => e.severity === 'critical') ? 'critical' : 'high';
  
  let title = '';
  let steps: RunbookStep[] = [];
  
  if (pattern.type === 'reactor_overpressure') {
    title = 'Reactor Overpressure Emergency Response';
    steps = [
      {
        step: 1,
        condition: 'Reactor temperature >250°C AND pressure >40 bar',
        action: 'Immediately reduce reactor heat input by 50%',
        safetyNote: 'DO NOT shut down heat completely - thermal shock risk',
      },
      {
        step: 2,
        condition: 'Temperature still rising after 2 minutes',
        action: 'Open emergency cooling bypass valve FCV-202',
      },
      {
        step: 3,
        condition: 'Pressure >45 bar',
        action: 'Activate emergency pressure relief system (SV-601)',
        safetyNote: 'Evacuate personnel from relief valve area',
      },
      {
        step: 4,
        condition: 'After pressure stabilizes',
        action: 'Document event and notify shift supervisor',
      },
    ];
  } else if (pattern.type === 'cooling_failure') {
    title = 'Coolant Flow Failure Response';
    steps = [
      {
        step: 1,
        condition: 'Coolant flow <50 L/min OR pump speed <500 RPM',
        action: 'Check pump motor M-401 status and circuit breakers',
      },
      {
        step: 2,
        condition: 'Pump motor not running',
        action: 'Start backup pump M-402 immediately',
        safetyNote: 'Maximum 60 seconds without coolant flow',
      },
      {
        step: 3,
        condition: 'Temperature >280°C',
        action: 'Initiate emergency reactor shutdown sequence',
        safetyNote: 'Follow lockout-tagout procedures',
      },
      {
        step: 4,
        condition: 'Flow restored',
        action: 'Monitor temperature decline rate (target: 2-5°C/min)',
      },
    ];
  } else {
    const event = events[0];
    title = `${event.tagName} Alarm Response`;
    
    if (event.value > event.threshold) {
      steps = [
        {
          step: 1,
          condition: `${event.tagName} exceeds ${event.threshold} ${event.value}`,
          action: 'Verify reading with secondary instrument',
        },
        {
          step: 2,
          condition: 'Reading confirmed',
          action: 'Reduce process input or increase control action',
        },
        {
          step: 3,
          condition: 'Value does not decrease within 5 minutes',
          action: 'Contact process engineer and consider shutdown',
        },
      ];
    } else {
      steps = [
        {
          step: 1,
          condition: `${event.tagName} below ${event.threshold} ${event.value}`,
          action: 'Check for sensor failure or process upset',
        },
        {
          step: 2,
          condition: 'Sensor functioning correctly',
          action: 'Increase process input or adjust control parameters',
        },
        {
          step: 3,
          condition: 'Value does not increase within 5 minutes',
          action: 'Investigate upstream equipment and piping',
        },
      ];
    }
    
    steps.push({
      step: steps.length + 1,
      condition: 'After resolution',
      action: 'Document root cause and corrective actions in log book',
    });
  }
  
  return {
    id,
    title,
    pattern: pattern.type,
    severity,
    tags: pattern.tags,
    steps,
    generatedAt: Date.now(),
  };
}

export function generateRunbooks(events: AlarmEvent[]): RunbookEntry[] {
  if (events.length === 0) return [];
  
  const patterns = detectAlarmPatterns(events);
  const runbooks: RunbookEntry[] = [];
  
  patterns.forEach(pattern => {
    const patternEvents = events.filter(e => pattern.tags.includes(e.tagId));
    if (patternEvents.length > 0) {
      runbooks.push(generateRunbookForPattern(pattern, patternEvents));
    }
  });
  
  return runbooks;
}

export function exportRunbookAsText(runbook: RunbookEntry): string {
  let text = `AUTOMATION RUNBOOK\n`;
  text += `${'='.repeat(80)}\n\n`;
  text += `Title: ${runbook.title}\n`;
  text += `Generated: ${new Date(runbook.generatedAt).toLocaleString()}\n`;
  text += `Severity: ${runbook.severity.toUpperCase()}\n`;
  text += `Affected Tags: ${runbook.tags.join(', ')}\n\n`;
  text += `${'='.repeat(80)}\n\n`;
  
  runbook.steps.forEach(step => {
    text += `STEP ${step.step}\n`;
    text += `${'-'.repeat(40)}\n`;
    text += `Condition: ${step.condition}\n`;
    text += `Action: ${step.action}\n`;
    if (step.safetyNote) {
      text += `⚠️  SAFETY: ${step.safetyNote}\n`;
    }
    text += `\n`;
  });
  
  text += `${'='.repeat(80)}\n`;
  text += `END OF RUNBOOK\n`;
  
  return text;
}
