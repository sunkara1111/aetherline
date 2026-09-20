'use client';

import { useState } from 'react';
import type { Company, ConnectionType } from '@/lib/types';
import { parseCSVTags, validateWebhookUrl } from '@/lib/companies';

interface CompanyManagerProps {
  companies: Company[];
  onSave: (company: Company) => void;
  onClose: () => void;
  editingCompany?: Company;
}

export default function CompanyManager({ companies, onSave, onClose, editingCompany }: CompanyManagerProps) {
  const [name, setName] = useState(editingCompany?.name || '');
  const [industry, setIndustry] = useState(editingCompany?.industry || '');
  const [notes, setNotes] = useState(editingCompany?.notes || '');
  const [connectionType, setConnectionType] = useState<ConnectionType>(editingCompany?.connectionType || 'demo');
  const [csvData, setCsvData] = useState(editingCompany?.csvData || '');
  const [webhookUrl, setWebhookUrl] = useState(editingCompany?.webhookUrl || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Company name is required');
      return;
    }

    if (connectionType === 'csv' && csvData.trim()) {
      const result = parseCSVTags(csvData);
      if (!result.success) {
        setError(result.error || 'Invalid CSV format');
        return;
      }
    }

    if (connectionType === 'webhook' && webhookUrl.trim()) {
      const result = validateWebhookUrl(webhookUrl);
      if (!result.valid) {
        setError(result.error || 'Invalid webhook URL');
        return;
      }
    }

    const company: Company = {
      id: editingCompany?.id || `company-${Date.now()}`,
      name: name.trim(),
      industry: industry.trim() || undefined,
      notes: notes.trim() || undefined,
      connectionType,
      csvData: connectionType === 'csv' ? csvData.trim() : undefined,
      webhookUrl: connectionType === 'webhook' ? webhookUrl.trim() : undefined,
      createdAt: editingCompany?.createdAt || Date.now(),
      lastUpdated: Date.now(),
    };

    onSave(company);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {editingCompany ? 'Edit Company' : 'Connect Company'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Acme Chemical Plant"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Industry
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., Chemical Processing, Manufacturing"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this connection"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Connection Type
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:border-primary-500 dark:hover:border-primary-400 bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600">
                <input
                  type="radio"
                  value="demo"
                  checked={connectionType === 'demo'}
                  onChange={(e) => setConnectionType(e.target.value as ConnectionType)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">Demo Plant</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Built-in simulated process signals with mock operational updates
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:border-primary-500 dark:hover:border-primary-400 bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600">
                <input
                  type="radio"
                  value="csv"
                  checked={connectionType === 'csv'}
                  onChange={(e) => setConnectionType(e.target.value as ConnectionType)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">CSV / Sample Data Upload</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Upload tag definitions and sample data (client-side only)
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:border-primary-500 dark:hover:border-primary-400 bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600">
                <input
                  type="radio"
                  value="webhook"
                  checked={connectionType === 'webhook'}
                  onChange={(e) => setConnectionType(e.target.value as ConnectionType)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">Webhook / Data Feed</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Connect to an external data feed URL
                  </div>
                </div>
              </label>
            </div>
          </div>

          {connectionType === 'csv' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CSV Data
              </label>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="Paste CSV data here..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors font-mono text-sm resize-none"
              />
            </div>
          )}

          {connectionType === 'webhook' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://api.example.com/data-feed"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors font-mono text-sm"
              />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                If the feed is unreachable, a &quot;waiting for feed&quot; status will be shown
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              {editingCompany ? 'Update Company' : 'Connect Company'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
