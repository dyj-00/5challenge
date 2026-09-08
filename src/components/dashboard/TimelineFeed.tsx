'use client';

import React from 'react';
import { useChallengeContext } from '@/context/ChallengeContext';
import TimelineItem from './TimelineItem';

export default function TimelineFeed() {
  const { expenses, reactions, challenge, currentUser, viewMode } = useChallengeContext();

  const startDate = new Date(challenge.current_start_date || new Date().toISOString());

  // Filter expenses for current week challenge cycle
  const currentExpenses = expenses.filter(
    (exp) => new Date(exp.spent_at) >= startDate
  );

  // In Solo mode, show ONLY current user's expenses!
  // In Duo mode, show combined timeline (mine + sister's)!
  const filteredExpenses = viewMode === 'solo'
    ? currentExpenses.filter((exp) => exp.user_id === currentUser)
    : currentExpenses;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
          <span>📜</span>
          <span>{viewMode === 'solo' ? '나의 지출 타임라인' : '자매 통합 소비 타임라인'}</span>
        </h3>
        <span className="text-xs font-bold text-slate-500">
          총 {filteredExpenses.length}건
        </span>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-2 shadow-sm">
          <div className="text-4xl">🎉</div>
          <h4 className="font-bold text-sm text-slate-800">아직 등록된 지출이 없어요!</h4>
          <p className="text-xs text-slate-500">
            {viewMode === 'solo'
              ? '하단 [+] 버튼을 눌러 나의 첫 지출이나 #무지출 내역을 기록해 보세요.'
              : '하단 [+] 버튼을 눌러 지출 내역을 공유해 보세요.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((exp) => (
            <TimelineItem key={exp.id} expense={exp} reactions={reactions} />
          ))}
        </div>
      )}
    </div>
  );
}
