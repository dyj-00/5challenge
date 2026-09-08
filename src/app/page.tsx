'use client';

import React, { useState } from 'react';
import MobileContainer from '@/components/layout/MobileContainer';
import ModeToggleTab from '@/components/dashboard/ModeToggleTab';
import DualGaugeCard from '@/components/dashboard/DualGaugeCard';
import TimelineFeed from '@/components/dashboard/TimelineFeed';
import AddExpenseModal from '@/components/dashboard/AddExpenseModal';
import ProfilePickerModal from '@/components/profile/ProfilePickerModal';
import SettingsView from '@/components/settings/SettingsView';
import StatsView from '@/components/stats/StatsView';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'settings'>('home');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);

  return (
    <MobileContainer
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onOpenProfilePicker={() => setIsProfileModalOpen(true)}
      onOpenAddExpense={() => setIsAddExpenseOpen(true)}
    >
      {activeTab === 'home' && (
        <div className="space-y-4 animate-fade-in">
          {/* Top Mode Toggle Tab [ 👤 혼자 도전 | 👭 자매 챌린지 ] */}
          <ModeToggleTab />

          {/* Gauge Card (Solo / Duo View) */}
          <DualGaugeCard />

          {/* Timeline Feed (Solo: My Expenses / Duo: Combined Feed) */}
          <TimelineFeed />
        </div>
      )}

      {activeTab === 'stats' && <StatsView />}

      {activeTab === 'settings' && <SettingsView />}

      {/* Account Login / Profile Switcher Modal */}
      <ProfilePickerModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* One-Touch Expense Input Modal (Always records under currently logged-in user) */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
      />
    </MobileContainer>
  );
}
