'use client';

import { useMemo } from 'react';
import type { SignalData } from '@/lib/types';

interface SignalCanvasProps {
  signals: SignalData[];
}

function Sparkline({ data, width = 120, height = 40, color = '#14b8a6' }: {
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
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function SignalCanvas({ signals }: SignalCanvasProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Live Signal Monitoring
        </h2>
        <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-primary-500 rounded-full" />
            <span>Normal</span>
          </div>
        </div>
      </div>
      
      <div className="grid gap-3">
        {signals.map((signal) => {
          const values = signal.history.map(p => p.value);
          const trend = signal.history.length >= 2
            ? signal.history[signal.history.length - 1].value - signal.history[signal.history.length - 2].value
            : 0;
          
          let sparklineColor = '#14b8a6';
          let bgClass = 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700';
          
          if (signal.inAlarm) {
            if (signal.alarmSeverity === 'critical') {
              sparklineColor = '#dc2626';
              bgClass = 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-800';
            } else {
              sparklineColor = '#f97316';
              bgClass = 'bg-orange-50 dark:bg-orange-900/10 border-orange-300 dark:border-orange-800';
            }
          }
          
          return (
            <div
              key={signal.tag.id}
              className={`relative rounded-xl border shadow-soft dark:shadow-soft-dark p-4 transition-all hover:shadow-soft-lg dark:hover:shadow-soft-lg-dark ${bgClass}`}
            >
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {signal.tag.id}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {signal.tag.description}
                  </div>
                  <div className="flex gap-3 mt-2 text-xs text-gray-500 dark:text-gray-500">
                    <span>Low: {signal.tag.alarmLow}</span>
                    <span>High: {signal.tag.alarmHigh}</span>
                    {signal.tag.criticalLow && (
                      <span className="text-red-600 dark:text-red-400">CL: {signal.tag.criticalLow}</span>
                    )}
                    {signal.tag.criticalHigh && (
                      <span className="text-red-600 dark:text-red-400">CH: {signal.tag.criticalHigh}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className={`text-2xl font-bold tabular-nums ${
                    signal.inAlarm
                      ? signal.alarmSeverity === 'critical'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-orange-600 dark:text-orange-400'
                      : 'text-primary-600 dark:text-primary-400'
                  }`}>
                    {signal.currentValue.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {signal.tag.unit}
                  </div>
                  {trend !== 0 && (
                    <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${
                      trend > 0 ? 'text-orange-500 dark:text-orange-400' : 'text-blue-500 dark:text-blue-400'
                    }`}>
                      <span>{trend > 0 ? '↑' : '↓'}</span>
                      <span>{Math.abs(trend).toFixed(2)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <Sparkline
                    data={values}
                    width={140}
                    height={50}
                    color={sparklineColor}
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {signal.quality}
                  </div>
                </div>
              </div>
              
              {signal.inAlarm && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                  <div className={`text-xs font-semibold flex items-center gap-2 ${
                    signal.alarmSeverity === 'critical' 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    <span className={`inline-block w-2 h-2 rounded-full animate-pulse ${
                      signal.alarmSeverity === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                    }`} />
                    ALARM: {signal.currentValue < signal.tag.alarmLow ? 'LOW' : 'HIGH'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
