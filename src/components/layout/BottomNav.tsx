'use client';

import React from 'react';
import { Home, BarChart2, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'stats' | 'settings';
  setActiveTab: (tab: 'home' | 'stats' | 'settings') => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const tabs = [
    { id: 'home', label: '대시보드', icon: Home },
    { id: 'stats', label: '소비분석', icon: BarChart2 },
    { id: 'settings', label: '챌린지설정', icon: Settings },
  ] as const;

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2 flex justify-around items-center shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all py-1 px-3.5 rounded-2xl ${
              isActive
                ? 'text-emerald-600 font-extrabold bg-emerald-50'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[11px] leading-none">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
