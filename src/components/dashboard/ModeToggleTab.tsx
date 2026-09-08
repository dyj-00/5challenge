'use client';

import React from 'react';
import { useChallengeContext } from '@/context/ChallengeContext';
import { ViewMode } from '@/types';

export default function ModeToggleTab() {
  const { viewMode, setViewMode } = useChallengeContext();

  return (
    <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center shadow-inner border border-slate-300/80">
      <button
        onClick={() => setViewMode('solo')}
        className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
          viewMode === 'solo'
            ? 'bg-white text-slate-900 shadow-md scale-[1.02]'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <span className="text-sm">👤</span>
        <span>혼자 도전 (솔로 모드)</span>
      </button>

      <button
        onClick={() => setViewMode('duo')}
        className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
          viewMode === 'duo'
            ? 'bg-white text-emerald-700 shadow-md scale-[1.02]'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <span className="text-sm">👭</span>
        <span>자매 챌린지 (페어 모드)</span>
      </button>
    </div>
  );
}
