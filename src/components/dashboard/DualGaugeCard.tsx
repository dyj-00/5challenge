'use client';

import React from 'react';
import { useChallengeContext } from '@/context/ChallengeContext';
import { calculatePacemakerMetrics, formatCurrency } from '@/lib/pacemaker';
import { UserRole } from '@/types';

export default function DualGaugeCard() {
  const { challenge, expenses, currentUser, viewMode } = useChallengeContext();
  const isDuoView = viewMode === 'duo';

  // Compute metrics for current logged-in user
  const myMetrics = calculatePacemakerMetrics(challenge, expenses, currentUser);

  // Compute metrics for sister in Duo Mode
  const sisterRole: UserRole = currentUser === 'unni' ? 'dongsaeng' : 'unni';
  const sisterName = sisterRole === 'unni' ? '언니' : '동생';
  const sisterEmoji = sisterRole === 'unni' ? '🎀' : '🐻';
  const sisterMetrics = calculatePacemakerMetrics(challenge, expenses, sisterRole);

  const myRoleName = currentUser === 'unni' ? '언니(나)' : '동생(나)';
  const myEmoji = currentUser === 'unni' ? '🎀' : '🐻';

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-4 shadow-md relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">⏱️</span>
          <div>
            <h2 className="font-extrabold text-sm text-slate-900">
              {myMetrics.elapsedDays}일차 소비 페이스
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              7일 예산 {formatCurrency(myMetrics.totalBudget)} 기준
            </p>
          </div>
        </div>

        {/* Global Pace Badge */}
        <div className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 border ${
          myMetrics.paceStatus === 'safe'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : myMetrics.paceStatus === 'warning'
            ? 'bg-amber-50 border-amber-200 text-amber-700'
            : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}>
          <span>{myMetrics.statusEmoji}</span>
          <span>{myMetrics.paceStatus === 'safe' ? '안전 페이스' : myMetrics.paceStatus === 'warning' ? '주의' : '위험'}</span>
        </div>
      </div>

      {/* Mode View Render */}
      {isDuoView ? (
        /* [👭 자매 챌린지 페어 모드] - Side-by-side Gauges */
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* My Gauge Column */}
          <GaugeItem
            name={myRoleName}
            emoji={myEmoji}
            remaining={myMetrics.remainingBudget}
            total={myMetrics.totalBudget}
            spent={myMetrics.totalSpent}
            status={myMetrics.paceStatus}
            isMe={true}
          />

          {/* Sister Gauge Column */}
          <GaugeItem
            name={sisterName}
            emoji={sisterEmoji}
            remaining={sisterMetrics.remainingBudget}
            total={sisterMetrics.totalBudget}
            spent={sisterMetrics.totalSpent}
            status={sisterMetrics.paceStatus}
            isMe={false}
          />
        </div>
      ) : (
        /* [👤 혼자 도전 솔로 모드] - Single Gauge Bar (Sister completely hidden) */
        <div className="space-y-3 pt-1">
          <div className="flex justify-between items-baseline">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
              <span>{myEmoji}</span>
              <span>나의 1인 남은 예산</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-emerald-600">
                {formatCurrency(myMetrics.remainingBudget)}
              </span>
              <span className="text-xs text-slate-500 font-medium"> / {formatCurrency(myMetrics.totalBudget)}</span>
            </div>
          </div>

          {/* Clean Progress Bar Container */}
          <div className="relative w-full h-5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                myMetrics.paceStatus === 'safe'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : myMetrics.paceStatus === 'warning'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-rose-500 to-red-400'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, (myMetrics.remainingBudget / myMetrics.totalBudget) * 100))}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 font-semibold pt-0.5">
            <span>내가 쓴 금액</span>
            <span className="text-slate-800 font-extrabold">{formatCurrency(myMetrics.totalSpent)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface GaugeItemProps {
  name: string;
  emoji: string;
  remaining: number;
  total: number;
  spent: number;
  status: 'safe' | 'warning' | 'danger';
  isMe: boolean;
}

function GaugeItem({ name, emoji, remaining, total, spent, status, isMe }: GaugeItemProps) {
  const percent = Math.max(0, Math.min(100, (remaining / total) * 100));

  return (
    <div className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-all ${
      isMe
        ? 'bg-slate-50/90 border-slate-300 shadow-sm'
        : 'bg-slate-50/40 border-slate-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
          <span>{emoji}</span>
          <span className="truncate">{name}</span>
        </div>
        {isMe && (
          <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-extrabold">
            나
          </span>
        )}
      </div>

      <div>
        <div className="text-base font-black text-slate-900 tracking-tight">
          {formatCurrency(remaining)}
        </div>
        <div className="text-[10px] text-slate-500 font-semibold">
          / {formatCurrency(total)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-3.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-slate-300/80 shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            status === 'safe'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : status === 'warning'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
              : 'bg-gradient-to-r from-rose-500 to-red-400'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="text-[10px] text-slate-500 flex justify-between font-semibold">
        <span>사용 금액</span>
        <span className="text-slate-900 font-extrabold">{formatCurrency(spent)}</span>
      </div>
    </div>
  );
}
