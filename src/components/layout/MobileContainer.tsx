'use client';

import React from 'react';
import BottomNav from './BottomNav';
import TopHeader from './TopHeader';

interface MobileContainerProps {
  children: React.ReactNode;
  activeTab: 'home' | 'stats' | 'settings';
  setActiveTab: (tab: 'home' | 'stats' | 'settings') => void;
  onOpenProfilePicker: () => void;
  onOpenAddExpense: () => void;
}

export default function MobileContainer({
  children,
  activeTab,
  setActiveTab,
  onOpenProfilePicker,
  onOpenAddExpense,
}: MobileContainerProps) {
  return (
    <div className="h-[100dvh] w-full bg-slate-100 text-slate-900 flex justify-center items-center font-sans antialiased sm:py-6 overflow-hidden">
      {/* Mobile Frame Container (Bright Clean Theme) */}
      <div className="w-full max-w-md h-[100dvh] sm:h-[844px] sm:min-h-[844px] bg-slate-50 sm:rounded-[40px] shadow-2xl shadow-slate-300/60 border border-slate-200/80 flex flex-col relative overflow-hidden">
        
        {/* Top Header */}
        <TopHeader onOpenProfilePicker={onOpenProfilePicker} />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto px-4 pt-3 pb-28 space-y-4 scrollbar-thin scrollbar-thumb-slate-300">
          {children}
        </main>

        {/* Floating Add Expense Quick Button */}
        {activeTab !== 'settings' && (
          <button
            onClick={onOpenAddExpense}
            className="absolute bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-5 z-40 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold p-4 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            aria-label="지출 등록"
          >
            <span className="text-xl leading-none font-black">＋</span>
          </button>
        )}

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
