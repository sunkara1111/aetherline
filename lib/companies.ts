import type { Company, CompanyUpdate, AlarmEvent, AlarmSeverity, SignalTag } from './types';

const STORAGE_KEY = 'aetherline-companies';
const CURRENT_COMPANY_KEY = 'aetherline-current-company';

export function saveCompanies(companies: Company[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
}

export function loadCompanies(): Company[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveCurrentCompanyId(id: string): void {
  localStorage.setItem(CURRENT_COMPANY_KEY, id);
}

export function loadCurrentCompanyId(): string | null {
  return localStorage.getItem(CURRENT_COMPANY_KEY);
}

export function createDefaultCompany(): Company {
  return {
    id: `demo-${Date.now()}`,
    name: 'Demo Plant',
    industry: 'Chemical Processing',
    notes: 'Built-in demonstration facility with simulated process signals',
    connectionType: 'demo',
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  };
}

export function generateCompanyUpdates(
  company: Company,
  alarmEvents: AlarmEvent[],
  existingUpdates: CompanyUpdate[]
): CompanyUpdate[] {
  if (company.connectionType !== 'demo') {
    return existingUpdates;
  }

  const updates: CompanyUpdate[] = [...existingUpdates];
  const now = Date.now();

  // Generate operational status updates periodically
  const lastStatusUpdate = updates.find(u => u.type === 'status');
  if (!lastStatusUpdate || now - lastStatusUpdate.timestamp > 300000) { // 5 minutes
    const activeAlarms = alarmEvents.filter(e => e.state === 'active').length;
    const criticalAlarms = alarmEvents.filter(e => e.state === 'active' && e.severity === 'critical').length;

    let status = 'operational';
    let severity: AlarmSeverity | undefined = undefined;
    let description = 'All systems operating within normal parameters';

    if (criticalAlarms > 0) {
      status = 'critical';
      severity = 'critical';
      description = `${criticalAlarms} critical alarm${criticalAlarms !== 1 ? 's' : ''} require immediate attention`;
    } else if (activeAlarms > 3) {
      status = 'warning';
      severity = 'high';
      description = `${activeAlarms} active alarms detected - monitoring closely`;
    } else if (activeAlarms > 0) {
      status = 'advisory';
      severity = 'medium';
      description = `${activeAlarms} minor alarm${activeAlarms !== 1 ? 's' : ''} active`;
    }

    updates.unshift({
      id: `update-${now}`,
      companyId: company.id,
      timestamp: now,
      type: 'status',
      severity,
      title: `System Status: ${status.toUpperCase()}`,
      description,
    });
  }

  // Generate updates for new critical alarms
  const recentCriticalAlarms = alarmEvents.filter(
    e => e.severity === 'critical' && 
    e.state === 'active' && 
    !updates.some(u => u.details === e.id)
  );

  recentCriticalAlarms.forEach(alarm => {
    updates.unshift({
      id: `alarm-${alarm.id}`,
      companyId: company.id,
      timestamp: alarm.timestamp,
      type: 'alarm',
      severity: 'critical',
      title: 'Critical Alarm Triggered',
      description: alarm.message,
      details: alarm.id,
    });
  });

  // Limit to last 50 updates
  return updates.slice(0, 50);
}

export interface ParsedCsvTags {
  success: boolean;
  error?: string;
  tags?: SignalTag[];
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseCSVTags(csvContent: string): ParsedCsvTags {
  const lines = csvContent
    .trim()
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'));

  if (lines.length < 2) {
    return { success: false, error: 'CSV must contain a header row and at least one tag row' };
  }

  const headers = splitCsvLine(lines[0]).map(header => header.replace(/^\uFEFF/, '').toLowerCase());
  const required = ['id', 'name', 'unit', 'min', 'max', 'alarmlow', 'alarmhigh'];
  const missing = required.filter(column => !headers.includes(column));
  if (missing.length > 0) {
    return {
      success: false,
      error: `CSV header must include: id, name, unit, min, max, alarmLow, alarmHigh`,
    };
  }

  const tags: SignalTag[] = [];

  for (let rowIndex = 1; rowIndex < lines.length; rowIndex++) {
    const cells = splitCsvLine(lines[rowIndex]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? '';
    });

    const min = Number(row.min);
    const max = Number(row.max);
    const alarmLow = Number(row.alarmlow);
    const alarmHigh = Number(row.alarmhigh);

    if (!row.id || !row.name || !row.unit) {
      return { success: false, error: `Row ${rowIndex + 1} is missing id, name, or unit` };
    }
    if (![min, max, alarmLow, alarmHigh].every(Number.isFinite)) {
      return { success: false, error: `Row ${rowIndex + 1} has non-numeric min, max, alarmLow, or alarmHigh` };
    }
    if (min >= max) {
      return { success: false, error: `Row ${rowIndex + 1} min must be less than max` };
    }

    tags.push({
      id: row.id,
      name: row.name,
      description: row.description || row.name,
      unit: row.unit,
      min,
      max,
      alarmLow,
      alarmHigh,
      criticalLow: parseOptionalNumber(row.criticallow),
      criticalHigh: parseOptionalNumber(row.criticalhigh),
    });
  }

  return { success: true, tags };
}

export function tagsFromCompany(company?: Company | null): SignalTag[] | undefined {
  if (!company || company.connectionType !== 'csv' || !company.csvData?.trim()) {
    return undefined;
  }
  const parsed = parseCSVTags(company.csvData);
  return parsed.success ? parsed.tags : undefined;
}

export function validateWebhookUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}
