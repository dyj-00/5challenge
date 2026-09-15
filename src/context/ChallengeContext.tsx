'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Challenge, Expense, Reaction, UserRole, ViewMode } from '@/types';
import { isSupabaseConfigured, LocalStore, PRESET_ACCOUNTS, supabase } from '@/lib/supabase';
import { getCurrentCycleIndex, getCycleDateRange } from '@/lib/pacemaker';
import confetti from 'canvas-confetti';

interface ChallengeContextType {
  currentUser: UserRole;
  setCurrentUser: (role: UserRole) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  challenge: Challenge;
  expenses: Expense[];
  reactions: Reaction[];
  isLoading: boolean;
  selectedCycleIndex: number;
  currentCycleIndex: number;
  setSelectedCycleIndex: (index: number) => void;
  resetToCurrentWeek: () => void;
  isCurrentWeek: boolean;
  isPastWeek: boolean;
  addExpense: (expenseData: { amount: number; memo: string; tag: string; spent_at?: string }) => Promise<void>;
  updateExpense: (
    id: string,
    updatedData: { amount: number; memo: string; tag: string; spent_at?: string }
  ) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  toggleReaction: (expenseId: string, emoji: '👏' | '🚨' | '☕' | '🎉') => Promise<void>;
  resetChallenge: (customBudget?: number, mode?: ViewMode, startDay?: number) => Promise<void>;
  updateSettings: (settings: Partial<Challenge>) => Promise<void>;
  triggerConfetti: () => void;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export function ChallengeProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserRole] = useState<UserRole>('dongsaeng');
  const [viewMode, setViewModeState] = useState<ViewMode>('solo');
  const [challenge, setChallenge] = useState<Challenge>(LocalStore.getChallenge());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected week cycle index state
  const currentIdx = getCurrentCycleIndex(challenge);
  const [selectedCycleIndex, setSelectedCycleIndex] = useState<number>(currentIdx);

  // Synchronize initial cycle index when challenge loads
  useEffect(() => {
    setSelectedCycleIndex(getCurrentCycleIndex(challenge));
  }, [challenge.current_start_date]);

  const currentCycleIndex = getCurrentCycleIndex(challenge);
  const isCurrentWeek = selectedCycleIndex === currentCycleIndex;
  const isPastWeek = selectedCycleIndex < currentCycleIndex;

  const resetToCurrentWeek = () => {
    setSelectedCycleIndex(getCurrentCycleIndex(challenge));
  };

  // Trigger celebratory confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff6b8b', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'],
      });
    } catch {
      // Ignore if canvas is unavailable
    }
  };

  // Load initial state on client mount
  useEffect(() => {
    const role = LocalStore.getUserRole();
    const mode = LocalStore.getViewMode();
    const localChallenge = LocalStore.getChallenge();
    const localExpenses = LocalStore.getExpenses();
    const localReactions = LocalStore.getReactions();

    setCurrentUserRole(role);
    setViewModeState(mode);
    setChallenge(localChallenge);
    setExpenses(localExpenses);
    setReactions(localReactions);

    async function loadData() {
      if (isSupabaseConfigured && supabase) {
        try {
          // Fetch active challenge
          const { data: chalData } = await supabase
            .from('challenges')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (chalData) {
            setChallenge(chalData as Challenge);
            LocalStore.saveChallenge(chalData as Challenge);
          }

          // Fetch expenses
          const { data: expData } = await supabase
            .from('expenses')
            .select('*')
            .order('spent_at', { ascending: false });

          if (expData) {
            setExpenses(expData as Expense[]);
            LocalStore.saveExpenses(expData as Expense[]);
          }

          // Fetch reactions
          const { data: reactData } = await supabase.from('reactions').select('*');
          if (reactData) {
            setReactions(reactData as Reaction[]);
            LocalStore.saveReactions(reactData as Reaction[]);
          }
        } catch (err) {
          console.error('Supabase load error, using local state:', err);
        }
      }
      setIsLoading(false);
    }

    loadData();

    // Supabase Realtime subscriptions if configured
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const channel = client
        .channel('public-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'expenses' },
          async () => {
            const { data } = await client
              .from('expenses')
              .select('*')
              .order('spent_at', { ascending: false });
            if (data) {
              setExpenses(data as Expense[]);
              LocalStore.saveExpenses(data as Expense[]);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reactions' },
          async () => {
            const { data } = await client.from('reactions').select('*');
            if (data) {
              setReactions(data as Reaction[]);
              LocalStore.saveReactions(data as Reaction[]);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'challenges' },
          async () => {
            const { data } = await client
              .from('challenges')
              .select('*')
              .eq('is_active', true)
              .limit(1)
              .single();
            if (data) {
              setChallenge(data as Challenge);
              LocalStore.saveChallenge(data as Challenge);
            }
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, []);

  const setCurrentUser = (role: UserRole) => {
    setCurrentUserRole(role);
    LocalStore.setUserRole(role);
  };

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    LocalStore.setViewMode(mode);
  };

  // Expense is ALWAYS created under the currently logged-in user!
  const addExpense = async ({
    amount,
    memo,
    tag,
    spent_at,
  }: {
    amount: number;
    memo: string;
    tag: string;
    spent_at?: string;
  }) => {
    // Determine spent_at timestamp
    let targetSpentAt = spent_at;
    if (!targetSpentAt) {
      if (selectedCycleIndex < currentCycleIndex) {
        // If viewing past week, default spent_at to 12:00 PM on that cycle's start date
        const { cycleStartDate } = getCycleDateRange(challenge, selectedCycleIndex);
        const noonInCycle = new Date(cycleStartDate.getTime() + 12 * 3600 * 1000);
        targetSpentAt = noonInCycle.toISOString();
      } else {
        targetSpentAt = new Date().toISOString();
      }
    }

    const newExpense: Expense = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'exp-' + Date.now(),
      challenge_id: challenge.id,
      user_id: currentUser, // Always logged-in user!
      amount,
      memo: memo.trim() || '지출',
      tag: tag || '#식비',
      spent_at: targetSpentAt,
      created_at: new Date().toISOString(),
    };

    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    LocalStore.saveExpenses(updated);

    if (tag === '#방어성공' || tag === '#무지출') {
      triggerConfetti();
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('expenses').insert({
        id: newExpense.id,
        challenge_id: newExpense.challenge_id,
        user_id: newExpense.user_id,
        amount: newExpense.amount,
        memo: newExpense.memo,
        tag: newExpense.tag,
        spent_at: newExpense.spent_at,
      });
    }
  };

  const updateExpense = async (
    id: string,
    updatedData: { amount: number; memo: string; tag: string; spent_at?: string }
  ) => {
    const updated = expenses.map((exp) => {
      if (exp.id === id) {
        return {
          ...exp,
          amount: updatedData.amount,
          memo: updatedData.memo.trim() || updatedData.tag,
          tag: updatedData.tag,
          spent_at: updatedData.spent_at || exp.spent_at,
        };
      }
      return exp;
    });

    setExpenses(updated);
    LocalStore.saveExpenses(updated);

    if (updatedData.tag === '#방어성공' || updatedData.tag === '#무지출') {
      triggerConfetti();
    }

    if (isSupabaseConfigured && supabase) {
      const target = updated.find((e) => e.id === id);
      if (target) {
        await supabase
          .from('expenses')
          .update({
            amount: target.amount,
            memo: target.memo,
            tag: target.tag,
            spent_at: target.spent_at,
          })
          .eq('id', id);
      }
    }
  };

  const deleteExpense = async (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    LocalStore.saveExpenses(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('expenses').delete().eq('id', id);
    }
  };

  const toggleReaction = async (expenseId: string, emoji: '👏' | '🚨' | '☕' | '🎉') => {
    const existing = reactions.find(
      (r) => r.expense_id === expenseId && r.user_id === currentUser && r.emoji === emoji
    );

    let updated: Reaction[];
    if (existing) {
      updated = reactions.filter((r) => r.id !== existing.id);
      setReactions(updated);
      LocalStore.saveReactions(updated);

      if (isSupabaseConfigured && supabase) {
        await supabase.from('reactions').delete().eq('id', existing.id);
      }
    } else {
      const newReaction: Reaction = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'react-' + Date.now(),
        expense_id: expenseId,
        user_id: currentUser,
        emoji,
        created_at: new Date().toISOString(),
      };
      updated = [...reactions, newReaction];
      setReactions(updated);
      LocalStore.saveReactions(updated);

      if (emoji === '🎉') {
        triggerConfetti();
      }

      if (isSupabaseConfigured && supabase) {
        await supabase.from('reactions').insert({
          id: newReaction.id,
          expense_id: newReaction.expense_id,
          user_id: newReaction.user_id,
          emoji: newReaction.emoji,
        });
      }
    }
  };

  const resetChallenge = async (customBudget?: number, mode?: ViewMode, startDay?: number) => {
    const newChallenge: Challenge = {
      ...challenge,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'chal-' + Date.now(),
      budget_per_person: customBudget ?? challenge.budget_per_person,
      mode: mode ?? challenge.mode,
      start_day_of_week: startDay ?? challenge.start_day_of_week,
      current_start_date: new Date().toISOString(),
    };

    setChallenge(newChallenge);
    LocalStore.saveChallenge(newChallenge);

    setExpenses([]);
    LocalStore.saveExpenses([]);
    setReactions([]);
    LocalStore.saveReactions([]);

    triggerConfetti();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('challenges').update({ is_active: false }).eq('is_active', true);
      await supabase.from('challenges').insert({
        id: newChallenge.id,
        mode: newChallenge.mode,
        budget_per_person: newChallenge.budget_per_person,
        start_day_of_week: newChallenge.start_day_of_week,
        current_start_date: newChallenge.current_start_date,
        is_active: true,
      });
    }
  };

  const updateSettings = async (settings: Partial<Challenge>) => {
    const updated: Challenge = {
      ...challenge,
      ...settings,
    };
    setChallenge(updated);
    LocalStore.saveChallenge(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('challenges').update(settings).eq('id', challenge.id);
    }
  };

  return (
    <ChallengeContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        viewMode,
        setViewMode,
        challenge,
        expenses,
        reactions,
        isLoading,
        selectedCycleIndex,
        currentCycleIndex,
        setSelectedCycleIndex,
        resetToCurrentWeek,
        isCurrentWeek,
        isPastWeek,
        addExpense,
        updateExpense,
        deleteExpense,
        toggleReaction,
        resetChallenge,
        updateSettings,
        triggerConfetti,
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
}

export function useChallengeContext() {
  const context = useContext(ChallengeContext);
  if (!context) {
    throw new Error('useChallengeContext must be used within ChallengeProvider');
  }
  return context;
}
