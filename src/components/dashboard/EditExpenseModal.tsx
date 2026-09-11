'use client';

import React, { useEffect, useState } from 'react';
import { Expense } from '@/types';
import { useChallengeContext } from '@/context/ChallengeContext';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
}

export default function EditExpenseModal({ isOpen, onClose, expense }: EditExpenseModalProps) {
  const { updateExpense, deleteExpense, currentUser } = useChallengeContext();

  const [amount, setAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [tag, setTag] = useState<string>('#식비');
  const [spentAt, setSpentAt] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const formatDateForInput = (isoStr?: string) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setMemo(expense.memo);
      setTag(expense.tag || '#식비');
      setSpentAt(formatDateForInput(expense.spent_at));
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const defaultTags = [
    '#방어성공',
    '#어쩔수없었음',
    '#충동구매반성',
    '#식비',
    '#생필품',
    '#무지출',
    '#커피/디저트',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('올바른 지출 금액을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      let spentAtIso = expense.spent_at;
      if (spentAt) {
        const parsedDate = new Date(spentAt);
        if (!isNaN(parsedDate.getTime())) {
          spentAtIso = parsedDate.toISOString();
        }
      }

      await updateExpense(expense.id, {
        amount: numAmount,
        memo: memo.trim() || tag,
        tag,
        spent_at: spentAtIso,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('이 지출 내역을 삭제하시겠습니까?')) {
      setIsSubmitting(true);
      try {
        await deleteExpense(expense.id);
        onClose();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const accountName = currentUser === 'unni' ? '다운 🎀' : '다영 🐻';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center animate-fade-in sm:p-4">
      <div className="bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-slide-up relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✏️</span>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">지출 내역 수정</h3>
              <p className="text-[11px] text-emerald-600 font-bold">
                {accountName} 데이터 수정 중
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              지출 금액 (원)
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="금액을 입력하세요"
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-2xl px-4 py-3.5 text-xl font-black text-emerald-600 focus:outline-none placeholder-slate-400 transition-colors shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-500">
                원
              </span>
            </div>
          </div>

          {/* Memo Input */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              한 줄 메모
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 편의점 점심 삼각김밥, 카페 라떼"
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none placeholder-slate-400"
            />
          </div>

          {/* Tag Selector */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              챌린지 태그
            </label>
            <div className="flex flex-wrap gap-1.5">
              {defaultTags.map((t) => {
                const isSelected = tag === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTag(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date / Time Input */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              지출 일시
            </label>
            <input
              type="datetime-local"
              value={spentAt}
              onChange={(e) => setSpentAt(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="px-4 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-2xl border border-rose-200 transition-colors text-sm whitespace-nowrap"
            >
              삭제 🗑️
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/25 transition-transform active:scale-95 text-base"
            >
              {isSubmitting ? '수정 중...' : '수정 완료하기 ✏️'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
