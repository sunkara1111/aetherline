'use client';

import { motion } from 'framer-motion';
import type { Company, CompanyUpdate } from '@/lib/types';

interface CompanyUpdatesProps {
  company: Company;
  updates: CompanyUpdate[];
}

export default function CompanyUpdates({ company, updates }: CompanyUpdatesProps) {
  const getUpdateIcon = (type: CompanyUpdate['type']) => {
    switch (type) {
      case 'status':
        return (
          <div className="w-12 h-12 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center shadow-sharp">
            <svg className="w-6 h-6 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'alarm':
        return (
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shadow-sharp animate-pulse-soft">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'runbook':
        return (
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shadow-sharp">
            <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'operational':
        return (
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shadow-sharp">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        );
    }
  };

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null;
    
    const colors = {
      critical: 'badge-warning',
      high: 'badge-primary',
      medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
      low: 'badge-accent',
    };

    return (
      <span className={`badge ${colors[severity as keyof typeof colors] || colors.low}`}>
        {severity.toUpperCase()}
      </span>
    );
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (company.connectionType === 'webhook' && company.webhookUrl && updates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-elevated p-12"
      >
        <div className="text-center">
          <div className="w-20 h-20 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-5 shadow-sharp">
            <svg className="w-10 h-10 text-primary-600 dark:text-primary-400 animate-pulse-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-industrial-900 dark:text-white mb-3">
            Waiting for Data Feed
          </h3>
          <p className="text-industrial-600 dark:text-industrial-400 mb-5">
            URL saved on this device. GitHub Pages cannot receive webhook posts, so no live feed will arrive here.
          </p>
          <code className="inline-block px-4 py-2 bg-industrial-100 dark:bg-industrial-900 text-industrial-800 dark:text-industrial-300 rounded-lg text-sm font-mono break-all border-2 border-industrial-300 dark:border-industrial-700">
            {company.webhookUrl}
          </code>
        </div>
      </motion.div>
    );
  }

  if (updates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-elevated p-12"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-industrial-200 dark:bg-industrial-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-industrial-500 dark:text-industrial-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-industrial-600 dark:text-industrial-400 font-medium">No updates available yet</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((update, index) => (
        <motion.div
          key={update.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="card-elevated p-6 hover:scale-[1.01] transition-transform"
        >
          <div className="flex gap-5">
            <div className="flex-shrink-0">
              {getUpdateIcon(update.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-bold text-industrial-900 dark:text-white text-lg">
                    {update.title}
                  </h3>
                  {update.severity && getSeverityBadge(update.severity)}
                </div>
                <span className="text-sm text-industrial-500 dark:text-industrial-400 whitespace-nowrap font-mono">
                  {formatTimestamp(update.timestamp)}
                </span>
              </div>
              <p className="text-industrial-700 dark:text-industrial-300 text-sm leading-relaxed mb-2">
                {update.description}
              </p>
              {update.details && (
                <p className="text-industrial-600 dark:text-industrial-400 text-xs font-mono bg-industrial-100 dark:bg-industrial-900 px-3 py-2 rounded-lg border border-industrial-200 dark:border-industrial-700">
                  {update.details}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
