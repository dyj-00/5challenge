'use client';

import React from 'react';
import { useChallengeContext } from '@/context/ChallengeContext';
import { calculatePacemakerMetrics, formatCurrency } from '@/lib/pacemaker';

export default function PacemakerStatus() {
  const { challenge, expenses, currentUser } = useChallengeContext();
  const metrics = calculatePacemakerMetrics(challenge, expenses, currentUser);

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-4 space-y-3 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          <div>
            <h3 className="text-xs font-extrabold text-slate-500">오늘의 페이스 방어 가이드</h3>
            <p className="text-sm font-black text-slate-900 mt-0.5">
              오늘 사용할 수 있는 안전 금액:{' '}
              <span className="text-emerald-600 font-black">{formatCurrency(metrics.todaySafeBudget)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-bold">
          <span>{metrics.statusEmoji}</span>
          <span>{metrics.statusMessage}</span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-500 block font-semibold">1일 평균 권장 지출</span>
          <span className="font-extrabold text-slate-900">{formatCurrency(metrics.dailyTargetBudget)}</span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-500 block font-semibold">오늘 실제 사용한 금액</span>
          <span className={`font-extrabold ${metrics.todaySpent > metrics.dailyTargetBudget ? 'text-rose-600' : 'text-slate-900'}`}>
            {formatCurrency(metrics.todaySpent)}
          </span>
        </div>
      </div>
    </div>
  );
}
