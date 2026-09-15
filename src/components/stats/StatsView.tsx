'use client';

import React, { useState } from 'react';
import { useChallengeContext } from '@/context/ChallengeContext';
import {
  calculatePacemakerMetrics,
  formatCurrency,
  getAllCycleMetrics,
  getCycleDateRange,
} from '@/lib/pacemaker';
import { ChevronRight, Calendar, Tag as TagIcon, X } from 'lucide-react';
import { Expense } from '@/types';

export default function StatsView() {
  const {
    challenge,
    expenses,
    currentUser,
    selectedCycleIndex,
    setSelectedCycleIndex,
    currentCycleIndex,
  } = useChallengeContext();

  const [inspectingCycle, setInspectingCycle] = useState<number | null>(null);

  // Get metrics for all cycle weeks up to current week
  const allCycleMetrics = getAllCycleMetrics(challenge, expenses, currentUser);

  // Selected week metrics
  const activeCycleIdx = inspectingCycle !== null ? inspectingCycle : selectedCycleIndex;
  const metrics = calculatePacemakerMetrics(challenge, expenses, currentUser, activeCycleIdx);
  const { cycleStartDate, cycleNextStartDate } = getCycleDateRange(challenge, activeCycleIdx);

  // Expenses for the active cycle
  const cycleExpenses = expenses.filter((exp) => {
    if (exp.user_id !== currentUser) return false;
    const d = new Date(exp.spent_at || exp.created_at || Date.now());
    return d >= cycleStartDate && d < cycleNextStartDate;
  });

  // Group by tag
  const tagTotals: Record<string, number> = {};
  cycleExpenses.forEach((exp) => {
    const t = exp.tag || '#기타';
    tagTotals[t] = (tagTotals[t] || 0) + exp.amount;
  });

  const sortedTags = Object.entries(tagTotals).sort((a, b) => b[1] - a[1]);
  const accountLabel = currentUser === 'unni' ? '다운 🎀' : '다영 🐻';

  return (
    <div className="space-y-4 animate-fade-in pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <div>
            <h2 className="font-extrabold text-base text-slate-900">소비 분석 & 역대 주차 리포트</h2>
            <p className="text-xs text-emerald-600 font-bold">
              {accountLabel} · {metrics.cycleIndex + 1}회차 ({metrics.cycleRangeText})
            </p>
          </div>
        </div>
      </div>

      {/* 1. 역대 주차별 챌린지 결과 목록 (Requirement 3) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>역대 주차별 챌린지 결과 목록</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-400">클릭하여 상세 조회</span>
        </div>

        <div className="space-y-2">
          {allCycleMetrics.slice().reverse().map((item) => {
            const isSelected = activeCycleIdx === item.cycleIndex;
            return (
              <div
                key={item.cycleIndex}
                onClick={() => {
                  setSelectedCycleIndex(item.cycleIndex);
                  setInspectingCycle(item.cycleIndex);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-300 shadow-sm ring-2 ring-emerald-400/20'
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70'
                }`}
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm text-slate-900">
                      {item.cycleIndex + 1}회차
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      ({item.cycleRangeText})
                    </span>
                    {item.isCurrentWeek && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        이번 주
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 font-bold">
                    지출: <span className="text-slate-900 font-black">{formatCurrency(item.totalSpent)}</span>
                    <span className="text-slate-400 font-normal"> / 예산 {formatCurrency(item.totalBudget)}</span>
                  </div>
                </div>

                {/* Result Badge */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.isPastWeek ? (
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-full border whitespace-nowrap ${
                        item.isSuccess
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : 'bg-rose-100 border-rose-300 text-rose-800'
                      }`}
                    >
                      {item.resultBadgeText}
                    </span>
                  ) : (
                    <span className="text-xs font-black px-2.5 py-1 rounded-full border bg-amber-50 border-amber-200 text-amber-800 whitespace-nowrap">
                      진행 중 ⏳
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Selected Week Metric Summary Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-extrabold text-slate-500">
            {metrics.cycleIndex + 1}회차 총 지출액
          </span>
          <div className="text-lg font-black text-rose-600">
            {formatCurrency(metrics.totalSpent)}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">목표 예산: {formatCurrency(metrics.totalBudget)}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-extrabold text-slate-500">
            {metrics.isPastWeek ? '최종 남은 잔액' : '현재 남은 잔액'}
          </span>
          <div className="text-lg font-black text-emerald-600">
            {formatCurrency(metrics.remainingBudget)}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            {metrics.isPastWeek ? (metrics.isSuccess ? '방어 완료' : '예산 초과') : `권장 잔액: ${formatCurrency(metrics.targetRemainingBudget)}`}
          </p>
        </div>
      </div>

      {/* 3. Pace Summary Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-sm">
        <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
          {metrics.cycleIndex + 1}회차 소비 페이스 진단
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{metrics.statusEmoji}</span>
          <div>
            <div className="font-extrabold text-sm text-slate-900">
              {metrics.isPastWeek
                ? metrics.isSuccess
                  ? '🎉 챌린지 무사 방어 성공!'
                  : '🥲 예산 초과 정산 완료'
                : metrics.paceStatus === 'safe'
                ? '🟢 안정적인 절약 페이스'
                : metrics.paceStatus === 'warning'
                ? '🟡 약간 아껴야 할 시점'
                : '🔴 긴급 예산 관리가 필요해요'}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{metrics.statusMessage}</p>
          </div>
        </div>
      </div>

      {/* 4. Tag Breakdown for Selected Week */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-sm">
        <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <TagIcon className="w-4 h-4 text-emerald-600" />
          <span>{metrics.cycleIndex + 1}회차 카테고리 & 태그별 지출 분석</span>
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

      {/* 5. Detailed Expenses Inspector List for Selected Week (Requirement 3 Detail) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            {metrics.cycleIndex + 1}회차 상세 지출 내역 ({cycleExpenses.length}건)
          </h3>
        </div>

        {cycleExpenses.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">이 주차에 등록된 상세 지출 내역이 없습니다.</p>
        ) : (
          <div className="space-y-2.5">
            {cycleExpenses.map((exp) => {
              const d = new Date(exp.spent_at || exp.created_at || Date.now());
              const dateStr = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
              return (
                <div
                  key={exp.id}
                  className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-extrabold text-slate-800">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">
                        {exp.tag || '#식비'}
                      </span>
                      <span>{exp.memo}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">{dateStr}</div>
                  </div>
                  <div className="font-black text-sm text-slate-900">
                    {formatCurrency(exp.amount)}
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
