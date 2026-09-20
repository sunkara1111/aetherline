'use client';

import { useMemo } from 'react';
import type { SignalData } from '@/lib/types';

interface SignalCanvasProps {
  signals: SignalData[];
}

function Sparkline({ data, width = 120, height = 40, color = '#2dd4bf' }: {
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
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function AlarmBand({ inAlarm, severity }: {
  inAlarm: boolean;
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
}) {
  if (!inAlarm) return null;
  
  const colors = {
    critical: 'bg-red-600',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500',
    info: 'bg-gray-500',
  };
  
  const bgColor = severity ? colors[severity] : 'bg-yellow-500';
  
  return (
    <div className={`absolute inset-0 ${bgColor} opacity-10 pointer-events-none animate-pulse`} />
  );
}

export default function SignalCanvas({ signals }: SignalCanvasProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-hud-accent font-mono">
          LIVE SIGNAL CANVAS
        </h2>
        <div className="flex gap-4 text-xs text-hud-textDim font-mono">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
            <span>CRITICAL</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span>HIGH</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-hud-accent rounded-full" />
            <span>NORMAL</span>
          </div>
        </div>
      </div>
      
      <div className="grid gap-2">
        {signals.map((signal) => {
          const values = signal.history.map(p => p.value);
          const trend = signal.history.length >= 2
            ? signal.history[signal.history.length - 1].value - signal.history[signal.history.length - 2].value
            : 0;
          
          let sparklineColor = '#2dd4bf';
          if (signal.inAlarm) {
            sparklineColor = signal.alarmSeverity === 'critical' ? '#dc2626' : '#f97316';
          }
          
          return (
            <div
              key={signal.tag.id}
              className="relative bg-hud-panel border border-hud-border rounded-md p-3 hover:border-hud-accent transition-colors"
            >
              <AlarmBand inAlarm={signal.inAlarm} severity={signal.alarmSeverity} />
              
              <div className="relative z-10 grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-hud-text font-mono truncate">
                    {signal.tag.id}
                  </div>
                  <div className="text-xs text-hud-textDim truncate">
                    {signal.tag.description}
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-hud-textDim font-mono">
                    <span>L: {signal.tag.alarmLow}</span>
                    <span>H: {signal.tag.alarmHigh}</span>
                    {signal.tag.criticalLow && (
                      <span className="text-red-400">CL: {signal.tag.criticalLow}</span>
                    )}
                    {signal.tag.criticalHigh && (
                      <span className="text-red-400">CH: {signal.tag.criticalHigh}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className={`text-2xl font-bold font-mono ${
                    signal.inAlarm
                      ? signal.alarmSeverity === 'critical'
                        ? 'text-red-500'
                        : 'text-orange-500'
                      : 'text-hud-accent'
                  }`}>
                    {signal.currentValue.toFixed(2)}
                  </div>
                  <div className="text-xs text-hud-textDim font-mono">
                    {signal.tag.unit}
                  </div>
                  {trend !== 0 && (
                    <div className={`text-xs font-mono mt-1 ${
                      trend > 0 ? 'text-orange-400' : 'text-blue-400'
                    }`}>
                      {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(2)}
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
                  <div className="text-xs text-hud-textDim font-mono">
                    {signal.quality.toUpperCase()}
                  </div>
                </div>
              </div>
              
              {signal.inAlarm && (
                <div className="mt-2 pt-2 border-t border-hud-border">
                  <div className="text-xs font-bold text-red-400 font-mono flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
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
