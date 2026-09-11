'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useChallengeContext } from '@/context/ChallengeContext';
import { UserRole } from '@/types';
import { PRESET_ACCOUNTS } from '@/lib/supabase';

interface ProfilePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilePickerModal({ isOpen, onClose }: ProfilePickerModalProps) {
  const { currentUser, setCurrentUser } = useChallengeContext();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSelect = (role: UserRole) => {
    setCurrentUser(role);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-lg p-1"
        >
          ✕
        </button>

        <div className="text-center space-y-1">
          <div className="text-3xl">🔐</div>
          <h2 className="text-lg font-extrabold text-slate-900">프로필 선택</h2>
          <p className="text-xs text-slate-500 font-medium">
            지출을 기록할 본인의 프로필을 선택하세요.
          </p>
        </div>

        <div className="space-y-2.5">
          {PRESET_ACCOUNTS.map((acc) => {
            const isSelected = currentUser === acc.id;
            return (
              <button
                key={acc.id}
                onClick={() => handleSelect(acc.id)}
                className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="text-2xl p-2 bg-white rounded-xl border border-slate-200">{acc.avatar_emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">{acc.name}</span>
                    {isSelected && (
                      <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                        현재 선택됨
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{acc.email}</p>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
        >
          닫기
        </button>
      </div>
    </div>,
    document.body
  );
}
