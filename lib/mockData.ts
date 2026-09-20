import type { SignalTag, SignalData, SignalDataPoint, AlarmEvent, AlarmSeverity } from './types';

export const MOCK_TAGS: SignalTag[] = [
  {
    id: 'R101_TEMP',
    name: 'Reactor-101 Temperature',
    description: 'Main reactor vessel temperature',
    unit: '°C',
    min: 0,
    max: 300,
    alarmLow: 50,
    alarmHigh: 250,
    criticalLow: 30,
    criticalHigh: 280,
  },
  {
    id: 'R101_PRESS',
    name: 'Reactor-101 Pressure',
    description: 'Main reactor vessel pressure',
    unit: 'bar',
    min: 0,
    max: 50,
    alarmLow: 5,
    alarmHigh: 40,
    criticalLow: 2,
    criticalHigh: 45,
  },
  {
    id: 'FCV_201_POS',
    name: 'Flow Control Valve FCV-201',
    description: 'Coolant flow control valve position',
    unit: '%',
    min: 0,
    max: 100,
    alarmLow: 10,
    alarmHigh: 95,
    criticalLow: 5,
    criticalHigh: 100,
  },
  {
    id: 'FLOW_301',
    name: 'Coolant Flow Rate',
    description: 'Primary coolant flow rate',
    unit: 'L/min',
    min: 0,
    max: 500,
    alarmLow: 50,
    alarmHigh: 450,
    criticalLow: 25,
    criticalHigh: 480,
  },
  {
    id: 'MTR_401_SPEED',
    name: 'Pump Motor M-401 Speed',
    description: 'Primary circulation pump speed',
    unit: 'RPM',
    min: 0,
    max: 3600,
    alarmLow: 500,
    alarmHigh: 3400,
    criticalLow: 300,
    criticalHigh: 3550,
  },
  {
    id: 'LVL_501',
    name: 'Tank T-501 Level',
    description: 'Feed tank level',
    unit: '%',
    min: 0,
    max: 100,
    alarmLow: 15,
    alarmHigh: 90,
    criticalLow: 5,
    criticalHigh: 98,
  },
  {
    id: 'VLV_601_STAT',
    name: 'Safety Valve SV-601',
    description: 'Emergency pressure relief valve',
    unit: 'state',
    min: 0,
    max: 1,
    alarmLow: 0.5,
    alarmHigh: 0.5,
  },
  {
    id: 'COND_701',
    name: 'Process Conductivity',
    description: 'Feed water conductivity',
    unit: 'µS/cm',
    min: 0,
    max: 1000,
    alarmLow: 50,
    alarmHigh: 800,
    criticalHigh: 950,
  },
];

export function generateSignalHistory(tag: SignalTag, duration: number = 300000): SignalDataPoint[] {
  const history: SignalDataPoint[] = [];
  const now = Date.now();
  const interval = 1000;
  const points = Math.floor(duration / interval);

  let baseValue = (tag.max + tag.min) / 2;
  let trend = 0;

  for (let i = points; i >= 0; i--) {
    const timestamp = now - i * interval;
    
    trend += (Math.random() - 0.5) * 0.3;
    trend = Math.max(-2, Math.min(2, trend));
    
    const noise = (Math.random() - 0.5) * (tag.max - tag.min) * 0.05;
    const drift = Math.sin(i / 50) * (tag.max - tag.min) * 0.15;
    
    let value = baseValue + drift + noise + trend;
    
    value = Math.max(tag.min, Math.min(tag.max, value));
    
    baseValue = baseValue * 0.95 + value * 0.05;
    
    history.push({
      timestamp,
      value: Math.round(value * 100) / 100,
      quality: Math.random() > 0.98 ? 'uncertain' : 'good',
    });
  }

  return history;
}

export function updateSignalData(signalData: SignalData[]): SignalData[] {
  return signalData.map(signal => {
    const history = [...signal.history];
    const lastPoint = history[history.length - 1];
    const tag = signal.tag;
    
    const trend = history.length > 10
      ? (lastPoint.value - history[history.length - 10].value) / 10
      : 0;
    
    const noise = (Math.random() - 0.5) * (tag.max - tag.min) * 0.05;
    let newValue = lastPoint.value + trend + noise;
    newValue = Math.max(tag.min, Math.min(tag.max, newValue));
    
    const newPoint: SignalDataPoint = {
      timestamp: Date.now(),
      value: Math.round(newValue * 100) / 100,
      quality: Math.random() > 0.98 ? 'uncertain' : 'good',
    };
    
    history.push(newPoint);
    if (history.length > 300) {
      history.shift();
    }
    
    const inAlarm = newValue < tag.alarmLow || newValue > tag.alarmHigh;
    let alarmSeverity: AlarmSeverity | undefined;
    
    if (tag.criticalLow && newValue < tag.criticalLow) {
      alarmSeverity = 'critical';
    } else if (tag.criticalHigh && newValue > tag.criticalHigh) {
      alarmSeverity = 'critical';
    } else if (newValue < tag.alarmLow || newValue > tag.alarmHigh) {
      alarmSeverity = 'high';
    }
    
    return {
      ...signal,
      history,
      currentValue: newValue,
      quality: newPoint.quality,
      inAlarm,
      alarmSeverity,
    };
  });
}

export function initializeSignalData(): SignalData[] {
  return MOCK_TAGS.map(tag => {
    const history = generateSignalHistory(tag);
    const currentValue = history[history.length - 1].value;
    const inAlarm = currentValue < tag.alarmLow || currentValue > tag.alarmHigh;
    
    let alarmSeverity: AlarmSeverity | undefined;
    if (tag.criticalLow && currentValue < tag.criticalLow) {
      alarmSeverity = 'critical';
    } else if (tag.criticalHigh && currentValue > tag.criticalHigh) {
      alarmSeverity = 'critical';
    } else if (currentValue < tag.alarmLow || currentValue > tag.alarmHigh) {
      alarmSeverity = 'high';
    }
    
    return {
      tag,
      history,
      currentValue,
      quality: history[history.length - 1].quality,
      inAlarm,
      alarmSeverity,
    };
  });
}

export function generateAlarmEvents(signalData: SignalData[]): AlarmEvent[] {
  const events: AlarmEvent[] = [];
  const now = Date.now();
  
  signalData.forEach(signal => {
    if (signal.inAlarm && signal.alarmSeverity) {
      const isLow = signal.currentValue < signal.tag.alarmLow;
      const threshold = isLow ? signal.tag.alarmLow : signal.tag.alarmHigh;
      
      events.push({
        id: `${signal.tag.id}_${now}`,
        timestamp: now,
        tagId: signal.tag.id,
        tagName: signal.tag.name,
        severity: signal.alarmSeverity,
        state: 'active',
        value: signal.currentValue,
        threshold,
        message: `${signal.tag.name} ${isLow ? 'below' : 'above'} ${isLow ? 'low' : 'high'} limit: ${signal.currentValue} ${signal.tag.unit}`,
        acknowledged: false,
      });
    }
  });
  
  return events;
}
