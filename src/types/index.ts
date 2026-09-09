export type UserRole = 'unni' | 'dongsaeng';

export type ViewMode = 'solo' | 'duo';

export interface UserAccount {
  id: UserRole;
  name: string;
  avatar_emoji: string;
  email: string;
}

export interface Profile {
  id: UserRole;
  name: string;
  avatar_emoji: string;
  created_at?: string;
}

export interface Challenge {
  id: string;
  mode: ViewMode; // Default 'solo'
  budget_per_person: number;
  start_day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  current_start_date: string; // ISO String timestamp of current cycle start
  is_active: boolean;
  created_at?: string;
}

export interface Expense {
  id: string;
  challenge_id: string;
  user_id: UserRole;
  amount: number;
  memo: string;
  tag: string;
  spent_at: string; // ISO String
  created_at?: string;
}

export interface Reaction {
  id: string;
  expense_id: string;
  user_id: UserRole;
  emoji: '👏' | '🚨' | '☕' | '🎉';
  created_at?: string;
}

export type PaceStatus = 'safe' | 'warning' | 'danger';

export interface PacemakerMetrics {
  elapsedDays: number; // 1 to 7
  totalBudget: number; // e.g. 50000
  totalSpent: number; // Sum of expenses for user in current cycle
  remainingBudget: number; // totalBudget - totalSpent
  dailyTargetBudget: number; // totalBudget / 7
  targetRemainingBudget: number; // Ideal remaining budget at current elapsed day
  todaySpent: number; // Spent today
  todaySafeBudget: number; // Safe amount available to spend today without breaking pace
  paceStatus: PaceStatus;
  statusMessage: string;
  statusEmoji: string;
  // Date & day of week properties
  startDate: Date;
  startDateFormatted: string;
  startDayOfWeekName: string;
  startDayOfWeekShort: string;
  endDateFormatted: string;
  endDayOfWeekShort: string;
  todayFormatted: string;
  todayDayOfWeekName: string;
  todayDayOfWeekShort: string;
  cycleRangeText: string;
}
