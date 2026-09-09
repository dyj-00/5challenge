import { Challenge, Expense, PacemakerMetrics, PaceStatus, UserRole } from '@/types';

export function getDayOfWeekName(dayIndex: number): string {
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return days[(dayIndex + 7) % 7] || '월요일';
}

export function getDayOfWeekShort(dayIndex: number): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[(dayIndex + 7) % 7] || '월';
}

export function calculatePacemakerMetrics(
  challenge: Challenge,
  expenses: Expense[],
  userId: UserRole
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

  // Determine current 7-day cycle index (0, 1, 2, ...)
  const cycleIndex = Math.floor(totalDaysElapsed / 7);

  // Active 7-day cycle start & end date (Midnight)
  const cycleStartDate = new Date(startMidnight.getTime() + cycleIndex * 7 * 24 * 60 * 60 * 1000);
  const cycleEndDate = new Date(cycleStartDate.getTime() + 6 * 24 * 60 * 60 * 1000);

  // Elapsed days in active cycle: 1 to 7
  const elapsedDays = Math.min(7, Math.max(1, (totalDaysElapsed % 7) + 1));

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

  // Filter expenses strictly for the requested user within current 7-day cycle
  const userExpenses = expenses.filter(
    (exp) => exp.user_id === userId && new Date(exp.spent_at) >= cycleStartDate
  );

  const totalSpent = userExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = totalBudget - totalSpent;

  const dailyTargetBudget = Math.round(totalBudget / 7);
  const targetRemainingBudget = Math.max(0, Math.round(totalBudget - dailyTargetBudget * elapsedDays));

  // Today's spending (compared by local calendar date)
  const todaySpent = userExpenses
    .filter((exp) => {
      const expDate = new Date(exp.spent_at);
      return (
        expDate.getFullYear() === now.getFullYear() &&
        expDate.getMonth() === now.getMonth() &&
        expDate.getDate() === now.getDate()
      );
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  const balanceBeforeToday = remainingBudget + todaySpent;
  const todaySafeBudget = Math.max(0, balanceBeforeToday - targetRemainingBudget);

  // Pace status determination
  let paceStatus: PaceStatus = 'safe';
  let statusMessage = '방어 성공! 페이스를 완벽하게 유지하고 있어요 👏';
  let statusEmoji = '🟢';

  const diffFromTarget = remainingBudget - targetRemainingBudget;

  if (diffFromTarget >= 0) {
    paceStatus = 'safe';
    statusMessage = `권장 잔액보다 ${diffFromTarget.toLocaleString()}원 더 넉넉해요! 🎉`;
    statusEmoji = '🟢';
  } else if (diffFromTarget >= -Math.round(dailyTargetBudget * 0.8)) {
    paceStatus = 'warning';
    statusMessage = `권장선보다 ${Math.abs(diffFromTarget).toLocaleString()}원 오버되었어요. 조금만 아껴보아요! ☕`;
    statusEmoji = '🟡';
  } else {
    paceStatus = 'danger';
    statusMessage = `경고! 권장선보다 ${Math.abs(diffFromTarget).toLocaleString()}원 초과 지출했어요! 🚨`;
    statusEmoji = '🔴';
  }

  return {
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
    startDate: cycleStartDate,
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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}
