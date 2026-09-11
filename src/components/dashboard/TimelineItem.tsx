'use client';

import React from 'react';
import { Expense, Reaction, UserRole } from '@/types';
import { formatCurrency } from '@/lib/pacemaker';
import { useChallengeContext } from '@/context/ChallengeContext';

interface TimelineItemProps {
  expense: Expense;
  reactions: Reaction[];
  onEdit?: (expense: Expense) => void;
}

export default function TimelineItem({ expense, reactions, onEdit }: TimelineItemProps) {
  const { currentUser, toggleReaction, deleteExpense } = useChallengeContext();

  const isMyExpense = expense.user_id === currentUser;

  const getUserBadge = (role: UserRole) => {
    if (role === 'unni') {
      return { name: '다운', emoji: '🎀', bg: 'bg-rose-100 text-rose-700' };
    }
    return { name: '다영', emoji: '🐻', bg: 'bg-amber-100 text-amber-700' };
  };

  const userBadge = getUserBadge(expense.user_id);

  const emojiOptions: Array<'👏' | '🚨' | '☕' | '🎉'> = ['👏', '🚨', '☕', '🎉'];

  const dateObj = new Date(expense.spent_at);
  const timeFormatted = dateObj.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  const dateFormatted = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

  return (
    <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 space-y-3 shadow-sm transition-all">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold flex items-center gap-1 ${userBadge.bg}`}>
            <span>{userBadge.emoji}</span>
            <span>{userBadge.name}</span>
          </span>
          {expense.tag && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              {expense.tag}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-semibold">
            {dateFormatted} {timeFormatted}
          </span>
          {isMyExpense && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(expense)}
                  className="text-slate-400 hover:text-emerald-600 text-xs px-1.5 py-0.5 rounded-lg hover:bg-slate-100 transition-colors font-bold flex items-center gap-0.5"
                  title="수정"
                >
                  <span>✏️</span>
                  <span className="text-[10px]">수정</span>
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm('이 지출 내역을 삭제하시겠습니까?')) {
                    deleteExpense(expense.id);
                  }
                }}
                className="text-slate-400 hover:text-rose-500 text-xs p-1 transition-colors"
                title="삭제"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expense Amount & Memo */}
      <div className="flex items-baseline justify-between pt-0.5">
        <h4 className="font-extrabold text-sm text-slate-800 pr-2 leading-snug">
          {expense.memo || '지출 내역'}
        </h4>
        <span className="text-base font-black text-rose-600 whitespace-nowrap">
          -{formatCurrency(expense.amount)}
        </span>
      </div>

      {/* Emoji Reactions Bar */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {emojiOptions.map((emoji) => {
            const currentReactions = reactions.filter(
              (r) => r.expense_id === expense.id && r.emoji === emoji
            );
            const hasReacted = currentReactions.some((r) => r.user_id === currentUser);
            const count = currentReactions.length;

            return (
              <button
                key={emoji}
                onClick={() => toggleReaction(expense.id, emoji)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-90 ${
                  hasReacted
                    ? 'bg-emerald-100 border border-emerald-300 text-emerald-800 scale-105 shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700'
                }`}
              >
                <span>{emoji}</span>
                {count > 0 && <span className="text-[10px] font-black">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
