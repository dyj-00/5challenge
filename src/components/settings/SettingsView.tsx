'use client';

import React, { useState } from 'react';
import { useChallengeContext } from '@/context/ChallengeContext';
import { calculatePacemakerMetrics, formatCurrency } from '@/lib/pacemaker';

export default function SettingsView() {
  const { challenge, expenses, currentUser, updateSettings, resetChallenge } = useChallengeContext();
  const metrics = calculatePacemakerMetrics(challenge, expenses, currentUser);

  const [customBudget, setCustomBudget] = useState<string>(challenge.budget_per_person.toString());
  const [selectedDay, setSelectedDay] = useState<number>(challenge.start_day_of_week);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  const budgetPresets = [30000, 50000, 70000, 100000];
  const daysOfWeek = [
    { id: 1, name: '월요일' },
    { id: 2, name: '화요일' },
    { id: 3, name: '수요일' },
    { id: 4, name: '목요일' },
    { id: 5, name: '금요일' },
    { id: 6, name: '토요일' },
    { id: 0, name: '일요일' },
  ];

  const handleSaveSettings = async () => {
    const budgetNum = parseInt(customBudget, 10);
    if (isNaN(budgetNum) || budgetNum < 10000) {
      alert('주간 예산은 최소 10,000원 이상 설정해 주세요.');
      return;
    }

    await updateSettings({
      budget_per_person: budgetNum,
      start_day_of_week: selectedDay,
    });

    setSaveSuccessMsg('설정이 성공적으로 저장되었습니다! ✨');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleExecuteReset = async () => {
    const budgetNum = parseInt(customBudget, 10) || challenge.budget_per_person;
    await resetChallenge(budgetNum, challenge.mode, selectedDay);
    setShowResetConfirm(false);
    setSaveSuccessMsg('새 주차 챌린지가 시작되었습니다! 🚀');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Settings Header */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-xl">⚙️</span>
        <div>
          <h2 className="font-extrabold text-base text-slate-900">챌린지 환경 설정</h2>
          <p className="text-xs text-slate-500 font-medium">예산 금액, 주간 시작 요일을 설정합니다.</p>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-bounce-short shadow-sm">
          <span>✅</span>
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 1. Custom Weekly Budget Input */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-sm">
        <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
          1. 주간 목표 예산 금액
        </h3>
        <div className="space-y-2">
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              value={customBudget}
              onChange={(e) => setCustomBudget(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-2xl px-4 py-3 text-lg font-black text-emerald-700 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
              원 / 7일
            </span>
          </div>

          {/* Budget Presets */}
          <div className="flex flex-wrap gap-1.5">
            {budgetPresets.map((amt) => (
              <button
                key={amt}
                onClick={() => setCustomBudget(amt.toString())}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  parseInt(customBudget, 10) === amt
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {(amt / 10000).toFixed(0)}만 원
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Cycle Start Day Picker */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-sm">
        <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
          2. 매주 시작 요일 설정
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          설정한 요일 기준으로 7일간의 권장 지출선이 자동 갱신됩니다.
        </p>

        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">현재 챌린지 시작 기준일</span>
          <span className="font-black text-emerald-800">
            {metrics.startDateFormatted} ({metrics.startDayOfWeekName})
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {daysOfWeek.map((day) => (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDay === day.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
              }`}
            >
              {day.name}
            </button>
          ))}
        </div>
      </div>

      {/* Save Settings Button */}
      <button
        onClick={handleSaveSettings}
        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl shadow-md transition-colors text-sm"
      >
        설정 내용 저장하기 💾
      </button>

      {/* 3. Immediate Manual Reset Section */}
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔄</span>
          <div>
            <h3 className="font-extrabold text-sm text-rose-800">수동 리셋 & 챌린지 신규 시작</h3>
            <p className="text-[11px] text-rose-600 font-medium">
              필요할 때 즉시 예산을 새로 채우고 1일차부터 시작합니다.
            </p>
          </div>
        </div>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl shadow-md transition-transform active:scale-95 text-xs"
          >
            🚨 지금 이번 주 챌린지 시작하기 ({formatCurrency(parseInt(customBudget, 10) || 50000)} 리셋)
          </button>
        ) : (
          <div className="bg-white border border-rose-300 p-4 rounded-2xl space-y-3">
            <p className="text-xs text-rose-800 font-extrabold text-center">
              정말로 지금 새 챌린지를 시작하시겠습니까?
              <br />
              <span className="text-[11px] text-slate-500 font-normal">
                현재 주차 지출 내역이 리셋되며 카운트다운이 1일차부터 새로 시작됩니다.
              </span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleExecuteReset}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl"
              >
                네, 리셋 실행!
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
