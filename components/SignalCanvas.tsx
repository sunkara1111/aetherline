'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { SignalData } from '@/lib/types';

interface SignalCanvasProps {
  signals: SignalData[];
}

function Sparkline({ data, width = 120, height = 40, color = '#06b6d4' }: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const path = useMemo(() => {
    if (data.length < 2) return '';
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  }, [data, width, height]);
  
  return (
    <svg width={width} height={height} className="inline-block">
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SignalCanvas({ signals }: SignalCanvasProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-industrial-900 dark:text-white mb-1">
            Live Signal Monitoring
          </h2>
          <p className="text-sm text-industrial-600 dark:text-industrial-400">
            Real-time process variables and alarm states
          </p>
        </div>
        <div className="flex gap-4 text-xs text-industrial-600 dark:text-industrial-400">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse-soft" />
            <span className="font-medium">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-primary-500 rounded-full" />
            <span className="font-medium">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-accent-500 rounded-full" />
            <span className="font-medium">Normal</span>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4">
        {signals.map((signal, index) => {
          const values = signal.history.map(p => p.value);
          const trend = signal.history.length >= 2
            ? signal.history[signal.history.length - 1].value - signal.history[signal.history.length - 2].value
            : 0;
          
          let sparklineColor = '#06b6d4';
          let bgClass = 'bg-industrial-50 dark:bg-industrial-800/50 border-industrial-200 dark:border-industrial-700';
          let valueColor = 'text-accent-600 dark:text-accent-400';
          
          if (signal.inAlarm) {
            if (signal.alarmSeverity === 'critical') {
              sparklineColor = '#dc2626';
              bgClass = 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700';
              valueColor = 'text-red-600 dark:text-red-400';
            } else {
              sparklineColor = '#f3770b';
              bgClass = 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700';
              valueColor = 'text-primary-600 dark:text-primary-400';
            }
          }
          
          return (
            <motion.div
              key={signal.tag.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative rounded-xl border-2 shadow-sharp dark:shadow-sharp-dark p-5 transition-all hover:shadow-sharp-lg dark:hover:shadow-sharp-dark-lg hover:scale-[1.01] ${bgClass}`}
            >
              <div className="grid grid-cols-[1fr_auto_auto] gap-6 items-center">
                <div className="min-w-0">
                  <div className="text-base font-bold text-industrial-900 dark:text-white truncate mb-1">
                    {signal.tag.id}
                  </div>
                  <div className="text-sm text-industrial-600 dark:text-industrial-400 truncate mb-3">
                    {signal.tag.description}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-industrial-500 dark:text-industrial-500 font-mono">
                    <span className="font-medium">L: {signal.tag.alarmLow}</span>
                    <span className="font-medium">H: {signal.tag.alarmHigh}</span>
                    {signal.tag.criticalLow && (
                      <span className="text-red-600 dark:text-red-400 font-bold">CL: {signal.tag.criticalLow}</span>
                    )}
                    {signal.tag.criticalHigh && (
                      <span className="text-red-600 dark:text-red-400 font-bold">CH: {signal.tag.criticalHigh}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <div className={`text-3xl font-bold tabular-nums ${valueColor}`}>
                    {signal.currentValue.toFixed(2)}
                  </div>
                  <div className="text-xs text-industrial-500 dark:text-industrial-400 font-semibold uppercase tracking-wider">
                    {signal.tag.unit}
                  </div>
                  {trend !== 0 && (
                    <div className={`text-sm font-bold mt-1 flex items-center gap-1 ${
                      trend > 0 ? 'text-primary-600 dark:text-primary-400' : 'text-accent-600 dark:text-accent-400'
                    }`}>
                      <span className="text-base">{trend > 0 ? '↑' : '↓'}</span>
                      <span>{Math.abs(trend).toFixed(2)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="bg-white dark:bg-industrial-900 rounded-lg p-2">
                    <Sparkline
                      data={values}
                      width={140}
                      height={50}
                      color={sparklineColor}
                    />
                  </div>
                  <div className="badge badge-accent text-[10px] uppercase font-bold tracking-wider">
                    {signal.quality}
                  </div>
                </div>
              </div>
              
              {signal.inAlarm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t-2 border-industrial-300 dark:border-industrial-600"
                >
                  <div className={`text-sm font-bold flex items-center gap-2 ${
                    signal.alarmSeverity === 'critical' 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-primary-600 dark:text-primary-400'
                  }`}>
                    <span className={`inline-block w-3 h-3 rounded-full animate-pulse-soft ${
                      signal.alarmSeverity === 'critical' ? 'bg-red-500 shadow-glow-primary' : 'bg-primary-500 shadow-glow-primary'
                    }`} />
                    ⚠️ ALARM: {signal.currentValue < signal.tag.alarmLow ? 'LOW' : 'HIGH'}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
