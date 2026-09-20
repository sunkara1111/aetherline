'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Company, ConnectionType } from '@/lib/types';
import { parseCSVTags, validateWebhookUrl } from '@/lib/companies';

interface CompanyManagerProps {
  companies: Company[];
  onSave: (company: Company) => void;
  onClose: () => void;
  editingCompany?: Company;
  onDelete?: (id: string) => void;
}

export default function CompanyManager({ companies, onSave, onClose, editingCompany, onDelete }: CompanyManagerProps) {
  const [name, setName] = useState(editingCompany?.name || '');
  const [industry, setIndustry] = useState(editingCompany?.industry || '');
  const [notes, setNotes] = useState(editingCompany?.notes || '');
  const [connectionType, setConnectionType] = useState<ConnectionType>(editingCompany?.connectionType || 'demo');
  const [csvData, setCsvData] = useState(editingCompany?.csvData || '');
  const [webhookUrl, setWebhookUrl] = useState(editingCompany?.webhookUrl || '');
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleDelete = () => {
    if (editingCompany && onDelete) {
      onDelete(editingCompany.id);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white dark:bg-industrial-900 rounded-2xl shadow-sharp-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-industrial-200 dark:border-industrial-700"
      >
        <div className="p-6 border-b-2 border-industrial-200 dark:border-industrial-700 bg-industrial-50 dark:bg-industrial-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-industrial-900 dark:text-white mb-1">
                {editingCompany ? 'Edit Company' : 'Connect Company'}
              </h2>
              <p className="text-sm text-industrial-600 dark:text-industrial-400">
                {editingCompany ? 'Update company connection details' : 'Add a new company to monitor'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-industrial-600 dark:text-industrial-400 hover:text-industrial-900 dark:hover:text-white transition-colors rounded-lg hover:bg-industrial-200 dark:hover:bg-industrial-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-xl"
            >
              <p className="text-sm text-red-800 dark:text-red-200 font-semibold">{error}</p>
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-bold text-industrial-900 dark:text-white mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Acme Chemical Plant"
              className="input-field w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-industrial-900 dark:text-white mb-2">
              Industry
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., Chemical Processing, Manufacturing"
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-industrial-900 dark:text-white mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this connection"
              rows={3}
              className="input-field w-full resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-industrial-900 dark:text-white mb-3">
              Connection Type
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-primary-500 dark:hover:border-primary-400 bg-industrial-50 dark:bg-industrial-800 border-industrial-200 dark:border-industrial-700 hover:shadow-sharp">
                <input
                  type="radio"
                  value="demo"
                  checked={connectionType === 'demo'}
                  onChange={(e) => setConnectionType(e.target.value as ConnectionType)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-bold text-industrial-900 dark:text-white">Demo Plant</div>
                  <div className="text-sm text-industrial-600 dark:text-industrial-400 mt-1">
                    Built-in simulated process signals with mock operational updates
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-primary-500 dark:hover:border-primary-400 bg-industrial-50 dark:bg-industrial-800 border-industrial-200 dark:border-industrial-700 hover:shadow-sharp">
                <input
                  type="radio"
                  value="csv"
                  checked={connectionType === 'csv'}
                  onChange={(e) => setConnectionType(e.target.value as ConnectionType)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-bold text-industrial-900 dark:text-white">CSV / Sample Data Upload</div>
                  <div className="text-sm text-industrial-600 dark:text-industrial-400 mt-1">
                    Paste tag definitions. Valid rows drive the live canvas with in-browser simulated values (client-side only).
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-primary-500 dark:hover:border-primary-400 bg-industrial-50 dark:bg-industrial-800 border-industrial-200 dark:border-industrial-700 hover:shadow-sharp">
                <input
                  type="radio"
                  value="webhook"
                  checked={connectionType === 'webhook'}
                  onChange={(e) => setConnectionType(e.target.value as ConnectionType)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-bold text-industrial-900 dark:text-white">Webhook / Data Feed</div>
                  <div className="text-sm text-industrial-600 dark:text-industrial-400 mt-1">
                    Connect to an external data feed URL
                  </div>
                </div>
              </label>
            </div>
          </div>

          {connectionType === 'csv' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label className="block text-sm font-bold text-industrial-900 dark:text-white mb-2">
                CSV Data
              </label>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder={'id,name,unit,min,max,alarmLow,alarmHigh\nR101_TEMP,Reactor Temperature,°C,0,300,50,250'}
                rows={6}
                className="input-field w-full font-mono text-sm resize-none"
              />
              <p className="mt-2 text-sm text-industrial-600 dark:text-industrial-400">
                Required columns: id, name, unit, min, max, alarmLow, alarmHigh. Optional: description, criticalLow, criticalHigh.
              </p>
            </motion.div>
          )}

          {connectionType === 'webhook' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label className="block text-sm font-bold text-industrial-900 dark:text-white mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://api.example.com/data-feed"
                className="input-field w-full font-mono text-sm"
              />
              <p className="mt-2 text-sm text-industrial-600 dark:text-industrial-400">
                Stored only on this device. GitHub Pages cannot receive webhook posts, so the workbench continues with demo plant signals and shows a waiting-for-feed status in Updates.
              </p>
            </motion.div>
          )}

          <div className="flex gap-3 pt-4 border-t-2 border-industrial-200 dark:border-industrial-700">
            <button
              type="submit"
              className="flex-1 btn-primary py-3"
            >
              {editingCompany ? 'Update Company' : 'Connect Company'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary py-3"
            >
              Cancel
            </button>
            {editingCompany && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-5 py-3 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 font-semibold rounded-lg transition-all duration-200 border-2 border-red-300 dark:border-red-700"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-industrial-900 rounded-xl p-6 max-w-md border-2 border-red-300 dark:border-red-700 shadow-sharp-xl"
          >
            <h3 className="text-xl font-bold text-industrial-900 dark:text-white mb-3">
              Delete Company?
            </h3>
            <p className="text-industrial-600 dark:text-industrial-400 mb-6">
              Are you sure you want to delete <strong>{editingCompany?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
