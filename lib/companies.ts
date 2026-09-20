import type { Company, CompanyUpdate, AlarmEvent, AlarmSeverity } from './types';

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

export function parseCSVTags(csvContent: string): { success: boolean; error?: string } {
  // Simple CSV validation - in a real app, this would parse and validate tag structure
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    return { success: false, error: 'CSV must contain header and at least one data row' };
  }
  return { success: true };
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
