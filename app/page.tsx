'use client';

import { useState, useEffect } from 'react';
import SignalCanvas from '@/components/SignalCanvas';
import RunbookPanel from '@/components/RunbookPanel';
import EventTimeline from '@/components/EventTimeline';
import { initializeSignalData, updateSignalData, generateAlarmEvents } from '@/lib/mockData';
import type { SignalData, AlarmEvent } from '@/lib/types';

export default function Home() {
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [alarmEvents, setAlarmEvents] = useState<AlarmEvent[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setSignals(initializeSignalData());
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSignals(prev => {
        const updated = updateSignalData(prev);
        const newAlarms = generateAlarmEvents(updated);
        setAlarmEvents(newAlarms);
        return updated;
      });
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <main className="min-h-screen bg-hud-bg">
      <header className="border-b-2 border-hud-accent bg-hud-panel shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-hud-accent font-mono tracking-wider">
                AETHERLINE
              </h1>
              <p className="text-sm text-hud-textDim font-mono mt-1">
                Industrial Signal Narrative Workbench
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-hud-textDim font-mono">SYSTEM TIME</div>
                <div className="text-lg font-bold text-hud-accent font-mono">
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-4 py-2 font-mono text-sm font-bold rounded border-2 transition-all ${
                  isRunning
                    ? 'bg-hud-accent text-hud-bg border-hud-accent hover:bg-hud-accent/80'
                    : 'bg-hud-panel text-hud-accent border-hud-accent hover:bg-hud-accent hover:text-hud-bg'
                }`}
              >
                {isRunning ? '⏸ PAUSE' : '▶ RESUME'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div className="bg-hud-panel border border-hud-border rounded-lg p-6 shadow-xl">
            <SignalCanvas signals={signals} />
          </div>
          
          <div className="bg-hud-panel border border-hud-border rounded-lg p-6 shadow-xl">
            <RunbookPanel alarmEvents={alarmEvents} />
          </div>
        </div>

        <div className="bg-hud-panel border border-hud-border rounded-lg p-6 shadow-xl">
          <EventTimeline alarmEvents={alarmEvents} />
        </div>
      </div>

      <footer className="border-t border-hud-border bg-hud-panel mt-12">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-hud-textDim font-mono">
              <div className="font-bold text-hud-accent">Aetherline v1.0.0</div>
              <div className="mt-1">
                Created by{' '}
                <span className="text-hud-accent font-bold">Dineshgopi Sunkara</span>
              </div>
              <div className="text-xs mt-1">
                Senior Controls Engineer · Automation Engineer
              </div>
            </div>
            <div className="flex flex-col items-end text-xs text-hud-textDim font-mono">
              <div>Fully client-side • No API keys required</div>
              <div className="mt-1">Mock PLC/SCADA data • Educational purposes</div>
              <div className="mt-1 text-hud-accent">MIT License</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-hud-border text-center text-xs text-hud-textDim font-mono">
            Industrial automation visualization and compliance tracking system
          </div>
        </div>
      </footer>
    </main>
  );
}
