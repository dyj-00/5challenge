import { Challenge, Expense, PacemakerMetrics, PaceStatus, UserRole } from '@/types';

export function getDayOfWeekName(dayIndex: number): string {
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return days[(dayIndex + 7) % 7] || '월요일';
}

export function getDayOfWeekShort(dayIndex: number): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[(dayIndex + 7) % 7] || '월';
}

/**
 * Calculates current real-world cycle index from challenge start date and current date
 */
export function getCurrentCycleIndex(challenge: Challenge): number {
  const rawStartDate = new Date(challenge.current_start_date || new Date().toISOString());
  const now = new Date();
  const startMidnight = new Date(rawStartDate.getFullYear(), rawStartDate.getMonth(), rawStartDate.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = Math.max(0, nowMidnight.getTime() - startMidnight.getTime());
  const totalDaysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(totalDaysElapsed / 7);
}

/**
 * Returns date range (start midnight to end 23:59:59.999) for a given cycle index
 */
export function getCycleDateRange(challenge: Challenge, cycleIndex: number) {
  const rawStartDate = new Date(challenge.current_start_date || new Date().toISOString());
  const startMidnight = new Date(rawStartDate.getFullYear(), rawStartDate.getMonth(), rawStartDate.getDate());

  const cycleStartDate = new Date(startMidnight.getTime() + cycleIndex * 7 * 24 * 60 * 60 * 1000);
  const cycleNextStartDate = new Date(cycleStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const cycleEndDate = new Date(cycleStartDate.getTime() + 6 * 24 * 60 * 60 * 1000);

  return {
    cycleStartDate,
    cycleNextStartDate,
    cycleEndDate,
  };
}

export function calculatePacemakerMetrics(
  challenge: Challenge,
  expenses: Expense[],
  userId: UserRole,
  targetCycleIndex?: number
): PacemakerMetrics {
  const totalBudget = challenge.budget_per_person || 50000;
  const rawStartDate = new Date(challenge.current_start_date || new Date().toISOString());
  const now = new Date();

  // Normalize dates to local midnight (00:00:00.000) for exact calendar day comparison
  const startMidnight = new Date(rawStartDate.getFullYear(), rawStartDate.getMonth(), rawStartDate.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Total calendar days elapsed since original start_date (Day 1 on start date)
  const diffTime = Math.max(0, nowMidnight.getTime() - startMidnight.getTime());
  const totalDaysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const currentCycleIndex = Math.floor(totalDaysElapsed / 7);
  const cycleIndex = typeof targetCycleIndex === 'number' ? targetCycleIndex : currentCycleIndex;

  const isCurrentWeek = cycleIndex === currentCycleIndex;
  const isPastWeek = cycleIndex < currentCycleIndex;

  // Active 7-day cycle start & end date
  const { cycleStartDate, cycleNextStartDate, cycleEndDate } = getCycleDateRange(challenge, cycleIndex);

  // Elapsed days in target cycle
  let elapsedDays: number;
  if (isPastWeek) {
    elapsedDays = 7;
  } else if (isCurrentWeek) {
    elapsedDays = Math.min(7, Math.max(1, (totalDaysElapsed % 7) + 1));
  } else {
    elapsedDays = 1;
  }

  // Date formatting helpers
  const formatShortDate = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;

  const startDateFormatted = formatShortDate(cycleStartDate);
  const startDayOfWeekName = getDayOfWeekName(cycleStartDate.getDay());
  const startDayOfWeekShort = getDayOfWeekShort(cycleStartDate.getDay());

  const endDateFormatted = formatShortDate(cycleEndDate);
  const endDayOfWeekShort = getDayOfWeekShort(cycleEndDate.getDay());

  const todayFormatted = formatShortDate(now);
  const todayDayOfWeekName = getDayOfWeekName(now.getDay());
  const todayDayOfWeekShort = getDayOfWeekShort(now.getDay());

  const cycleRangeText = `${startDateFormatted}(${startDayOfWeekShort}) ~ ${endDateFormatted}(${endDayOfWeekShort})`;

  // Filter expenses strictly for the requested user within target 7-day cycle range
  const userExpenses = expenses.filter((exp) => {
    if (exp.user_id !== userId) return false;
    const expDate = new Date(exp.spent_at || exp.created_at || Date.now());
    return expDate >= cycleStartDate && expDate < cycleNextStartDate;
  });

  const totalSpent = userExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = totalBudget - totalSpent;

  const dailyTargetBudget = Math.round(totalBudget / 7);
  const targetRemainingBudget = Math.max(0, Math.round(totalBudget - dailyTargetBudget * elapsedDays));

  // Today's spending (compared by local calendar date)
  const todaySpent = userExpenses
    .filter((exp) => {
      const expDate = new Date(exp.spent_at || exp.created_at || Date.now());
      return (
        expDate.getFullYear() === now.getFullYear() &&
        expDate.getMonth() === now.getMonth() &&
        expDate.getDate() === now.getDate()
      );
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  const balanceBeforeToday = remainingBudget + todaySpent;
  const todaySafeBudget = Math.max(0, balanceBeforeToday - targetRemainingBudget);

  // Pace status & Result badges determination
  let paceStatus: PaceStatus = 'safe';
  let statusMessage = '';
  let statusEmoji = '🟢';
  let resultBadgeText = '';
  const isSuccess = remainingBudget >= 0;

  if (isPastWeek) {
    if (isSuccess) {
      paceStatus = 'safe';
      resultBadgeText = `${formatCurrency(totalBudget)} 방어 성공! 🎉`;
      statusMessage = `${cycleIndex + 1}회차 챌린지 성공! ${formatCurrency(totalBudget)} 예산을 무사히 방어했어요! 🎉`;
      statusEmoji = '🎉';
    } else {
      paceStatus = 'danger';
      const overAmount = Math.abs(remainingBudget);
      resultBadgeText = `초과 달성(실패) 🥲`;
      statusMessage = `${cycleIndex + 1}회차 챌린지 실패 🥲 예산을 ${formatCurrency(overAmount)} 초과했어요.`;
      statusEmoji = '🥲';
    }
  } else {
    // Current Week
    const diffFromTarget = remainingBudget - targetRemainingBudget;
    if (diffFromTarget >= 0) {
      paceStatus = 'safe';
      resultBadgeText = '안전';
      statusMessage = `권장 잔액보다 ${diffFromTarget.toLocaleString()}원 더 넉넉해요! 🎉`;
      statusEmoji = '🟢';
    } else if (diffFromTarget >= -Math.round(dailyTargetBudget * 0.8)) {
      paceStatus = 'warning';
      resultBadgeText = '주의';
      statusMessage = `권장선보다 ${Math.abs(diffFromTarget).toLocaleString()}원 오버되었어요. 조금만 아껴보아요! ☕`;
      statusEmoji = '🟡';
    } else {
      paceStatus = 'danger';
      resultBadgeText = '위험';
      statusMessage = `경고! 권장선보다 ${Math.abs(diffFromTarget).toLocaleString()}원 초과 지출했어요! 🚨`;
      statusEmoji = '🔴';
    }
  }

  return {
    cycleIndex,
    currentCycleIndex,
    isCurrentWeek,
    isPastWeek,
    elapsedDays,
    totalBudget,
    totalSpent,
    remainingBudget,
    dailyTargetBudget,
    targetRemainingBudget,
    todaySpent,
    todaySafeBudget,
    paceStatus,
    statusMessage,
    statusEmoji,
    resultBadgeText,
    isSuccess,
    startDate: cycleStartDate,
    endDate: cycleEndDate,
    startDateFormatted,
    startDayOfWeekName,
    startDayOfWeekShort,
    endDateFormatted,
    endDayOfWeekShort,
    todayFormatted,
    todayDayOfWeekName,
    todayDayOfWeekShort,
    cycleRangeText,
  };
}

export function getAllCycleMetrics(
  challenge: Challenge,
  expenses: Expense[],
  userId: UserRole
): PacemakerMetrics[] {
  const currentIdx = getCurrentCycleIndex(challenge);
  const metricsList: PacemakerMetrics[] = [];
  for (let i = 0; i <= currentIdx; i++) {
    metricsList.push(calculatePacemakerMetrics(challenge, expenses, userId, i));
  }
  return metricsList;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}
