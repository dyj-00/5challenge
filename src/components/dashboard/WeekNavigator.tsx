'use client';

import React from 'react';
import { useChallengeContext } from '@/context/ChallengeContext';
import { calculatePacemakerMetrics } from '@/lib/pacemaker';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

export default function WeekNavigator() {
  const {
    challenge,
    expenses,
    currentUser,
    selectedCycleIndex,
    currentCycleIndex,
    setSelectedCycleIndex,
    resetToCurrentWeek,
    isCurrentWeek,
  } = useChallengeContext();

  const metrics = calculatePacemakerMetrics(challenge, expenses, currentUser, selectedCycleIndex);

  const canGoPrev = selectedCycleIndex > 0;
  const canGoNext = selectedCycleIndex < currentCycleIndex;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm space-y-2">
      {/* Week Selector Bar */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => canGoPrev && setSelectedCycleIndex(selectedCycleIndex - 1)}
          disabled={!canGoPrev}
          className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-all ${
            canGoPrev
              ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95'
              : 'bg-slate-50/50 border-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>이전 주</span>
        </button>

        {/* Center Week Title & Badge */}
        <div className="text-center min-w-0">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <span className="font-extrabold text-sm text-slate-900">
              {metrics.cycleIndex + 1}회차
            </span>
            {isCurrentWeek ? (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                이번 주 (현재)
              </span>
            ) : (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                지난 주차
              </span>
            )}
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
            {metrics.cycleRangeText}
          </p>
        </div>

        <button
          onClick={() => canGoNext && setSelectedCycleIndex(selectedCycleIndex + 1)}
          disabled={!canGoNext}
          className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-all ${
            canGoNext
              ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95'
              : 'bg-slate-50/50 border-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          <span>다음 주</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Return to Current Week Quick Button */}
      {!isCurrentWeek && (
        <button
          onClick={resetToCurrentWeek}
          className="w-full py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl text-emerald-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>이번 주(현재)로 돌아가기</span>
        </button>
      )}
    </div>
  );
}
