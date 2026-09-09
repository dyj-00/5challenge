'use client';

import React from 'react';
import { useChallengeContext } from '@/context/ChallengeContext';
import { UserRole } from '@/types';
import { formatCurrency } from '@/lib/pacemaker';

interface TopHeaderProps {
  onOpenProfilePicker: () => void;
}

export default function TopHeader({ onOpenProfilePicker }: TopHeaderProps) {
  const { currentUser, challenge } = useChallengeContext();

  const getProfileBadge = (role: UserRole) => {
    switch (role) {
      case 'unni':
        return { name: '다운 계정', emoji: '🎀', bg: 'bg-rose-100 text-rose-700 border-rose-200' };
      default:
        return { name: '다영 계정', emoji: '🐻', bg: 'bg-amber-100 text-amber-700 border-amber-200' };
    }
  };

  const profileInfo = getProfileBadge(currentUser);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md px-4 py-3 border-b border-slate-200 flex items-center justify-between shadow-sm">
      {/* App Brand & Current Budget Info */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center font-extrabold text-white text-xs shadow-md shadow-emerald-500/20">
          5만
        </div>
        <div>
          <h1 className="font-extrabold text-sm text-slate-900 leading-tight">
            {formatCurrency(challenge.budget_per_person)} 챌린지
          </h1>
        </div>
      </div>

      {/* User Login Account Selector Button */}
      <button
        onClick={onOpenProfilePicker}
        className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-sm ${profileInfo.bg}`}
        title="계정 전환 / 로그인"
      >
        <span>{profileInfo.emoji}</span>
        <span>{profileInfo.name}</span>
        <span className="text-[10px] opacity-70">▼</span>
      </button>
    </header>
  );
}
