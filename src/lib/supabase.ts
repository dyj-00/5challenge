import { createClient } from '@supabase/supabase-js';
import { Challenge, Expense, Profile, Reaction, UserRole } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Preset Accounts
export const PRESET_ACCOUNTS = [
  { id: 'dongsaeng' as UserRole, name: '동생', avatar_emoji: '🐻', email: 'dongsaeng@sister.app' },
  { id: 'unni' as UserRole, name: '언니', avatar_emoji: '🎀', email: 'unni@sister.app' },
];

const DEFAULT_PROFILES: Profile[] = [
  { id: 'dongsaeng', name: '동생', avatar_emoji: '🐻' },
  { id: 'unni', name: '언니', avatar_emoji: '🎀' },
];

const DEFAULT_CHALLENGE: Challenge = {
  id: 'local-challenge-1',
  mode: 'solo',
  budget_per_person: 50000,
  start_day_of_week: 1, // Monday
  current_start_date: '2026-09-08T00:00:00.000Z',
  is_active: true,
};

const DEFAULT_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    challenge_id: 'local-challenge-1',
    user_id: 'dongsaeng',
    amount: 5000,
    memo: '카페 커피 ☕',
    tag: '#어쩔수없었음',
    spent_at: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    challenge_id: 'local-challenge-1',
    user_id: 'unni',
    amount: 4500,
    memo: '아침 아이스 아메리카노 ☕',
    tag: '#어쩔수없었음',
    spent_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
];

const DEFAULT_REACTIONS: Reaction[] = [
  {
    id: 'react-1',
    expense_id: 'exp-2',
    user_id: 'dongsaeng',
    emoji: '👏',
    created_at: new Date().toISOString(),
  },
];

// LocalStorage helpers for instant client-side operation
const STORAGE_KEYS = {
  USER_ROLE: 'pacemaker_user_role',
  VIEW_MODE: 'pacemaker_view_mode',
  CHALLENGE: 'pacemaker_challenge',
  EXPENSES: 'pacemaker_expenses',
  REACTIONS: 'pacemaker_reactions',
};

export const LocalStore = {
  getUserRole(): UserRole {
    if (typeof window === 'undefined') return 'dongsaeng';
    const role = localStorage.getItem(STORAGE_KEYS.USER_ROLE) as UserRole;
    return role || 'dongsaeng';
  },

  setUserRole(role: UserRole) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
    }
  },

  getViewMode(): 'solo' | 'duo' {
    if (typeof window === 'undefined') return 'solo';
    const mode = localStorage.getItem(STORAGE_KEYS.VIEW_MODE) as 'solo' | 'duo';
    return mode || 'solo';
  },

  setViewMode(mode: 'solo' | 'duo') {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
    }
  },

  getChallenge(): Challenge {
    if (typeof window === 'undefined') return DEFAULT_CHALLENGE;
    const data = localStorage.getItem(STORAGE_KEYS.CHALLENGE);
    return data ? JSON.parse(data) : DEFAULT_CHALLENGE;
  },

  saveChallenge(challenge: Challenge) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CHALLENGE, JSON.stringify(challenge));
    }
  },

  getExpenses(): Expense[] {
    if (typeof window === 'undefined') return DEFAULT_EXPENSES;
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : DEFAULT_EXPENSES;
  },

  saveExpenses(expenses: Expense[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    }
  },

  getReactions(): Reaction[] {
    if (typeof window === 'undefined') return DEFAULT_REACTIONS;
    const data = localStorage.getItem(STORAGE_KEYS.REACTIONS);
    return data ? JSON.parse(data) : DEFAULT_REACTIONS;
  },

  saveReactions(reactions: Reaction[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.REACTIONS, JSON.stringify(reactions));
    }
  },
};
