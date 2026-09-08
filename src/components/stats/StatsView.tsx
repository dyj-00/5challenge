'use client';

import React from 'react';
import { useChallengeContext } from '@/context/ChallengeContext';
import { calculatePacemakerMetrics, formatCurrency } from '@/lib/pacemaker';

export default function StatsView() {
  const { challenge, expenses, currentUser } = useChallengeContext();
  const metrics = calculatePacemakerMetrics(challenge, expenses, currentUser);

  const startDate = new Date(challenge.current_start_date || new Date().toISOString());

  // Current cycle expenses strictly for the currently logged-in user
  const userExpenses = expenses.filter(
    (exp) => exp.user_id === currentUser && new Date(exp.spent_at) >= startDate
  );

  // Group by tag
  const tagTotals: Record<string, number> = {};
  userExpenses.forEach((exp) => {
    const t = exp.tag || '#기타';
    tagTotals[t] = (tagTotals[t] || 0) + exp.amount;
  });

  const sortedTags = Object.entries(tagTotals).sort((a, b) => b[1] - a[1]);

  const accountLabel = currentUser === 'unni' ? '언니 계정 🎀' : '동생 계정 🐻';

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-xl">📊</span>
        <div>
          <h2 className="font-extrabold text-base text-slate-900">나의 소비 분석 리포트</h2>
          <p className="text-xs text-emerald-600 font-bold">
            {accountLabel} 기준 · {metrics.elapsedDays}일차 지출 통계
          </p>
        </div>
      </div>

      {/* Overview Metric Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-extrabold text-slate-500">총 지출액</span>
          <div className="text-lg font-black text-rose-600">
            {formatCurrency(metrics.totalSpent)}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">목표 예산: {formatCurrency(metrics.totalBudget)}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-extrabold text-slate-500">남은 잔액</span>
          <div className="text-lg font-black text-emerald-600">
            {formatCurrency(metrics.remainingBudget)}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">권장 잔액: {formatCurrency(metrics.targetRemainingBudget)}</p>
        </div>
      </div>

      {/* Pace Summary Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-sm">
        <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
          소비 페이스 진단
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{metrics.statusEmoji}</span>
          <div>
            <div className="font-extrabold text-sm text-slate-900">
              {metrics.paceStatus === 'safe'
                ? '🟢 안정적인 절약 페이스'
                : metrics.paceStatus === 'warning'
                ? '🟡 약간 아껴야 할 시점'
                : '🔴 긴급 예산 관리가 필요해요'}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{metrics.statusMessage}</p>
          </div>
        </div>
      </div>

      {/* Tag Breakdown */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-sm">
        <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
          카테고리 & 태그별 지출 분석
        </h3>

        {sortedTags.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">등록된 지출 내역이 없습니다.</p>
        ) : (
          <div className="space-y-2.5">
            {sortedTags.map(([tagName, total]) => {
              const share = metrics.totalSpent > 0 ? (total / metrics.totalSpent) * 100 : 0;
              return (
                <div key={tagName} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800">{tagName}</span>
                    <span className="text-slate-600">{formatCurrency(total)} ({share.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
