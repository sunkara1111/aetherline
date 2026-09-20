export type AlarmSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AlarmState = 'active' | 'acknowledged' | 'cleared' | 'shelved';

export interface SignalTag {
  id: string;
  name: string;
  description: string;
  unit: string;
  min: number;
  max: number;
  alarmLow: number;
  alarmHigh: number;
  criticalLow?: number;
  criticalHigh?: number;
}

export interface SignalDataPoint {
  timestamp: number;
  value: number;
  quality: 'good' | 'bad' | 'uncertain';
}

export interface SignalData {
  tag: SignalTag;
  history: SignalDataPoint[];
  currentValue: number;
  quality: 'good' | 'bad' | 'uncertain';
  inAlarm: boolean;
  alarmSeverity?: AlarmSeverity;
}

export interface AlarmEvent {
  id: string;
  timestamp: number;
  tagId: string;
  tagName: string;
  severity: AlarmSeverity;
  state: AlarmState;
  value: number;
  threshold: number;
  message: string;
  acknowledged?: boolean;
  acknowledgedAt?: number;
  acknowledgedBy?: string;
  clearedAt?: number;
}

export interface RunbookStep {
  step: number;
  condition: string;
  action: string;
  safetyNote?: string;
}

export interface RunbookEntry {
  id: string;
  title: string;
  pattern: string;
  severity: AlarmSeverity;
  tags: string[];
  steps: RunbookStep[];
  generatedAt: number;
}

export interface ComplianceEvent {
  id: string;
  timestamp: number;
  type: 'alarm' | 'acknowledgment' | 'action' | 'note' | 'shift_change';
  severity?: AlarmSeverity;
  user?: string;
  description: string;
  tags: string[];
  data: Record<string, any>;
}
