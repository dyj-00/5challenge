import { Challenge, Expense, PacemakerMetrics, PaceStatus, UserRole } from '@/types';

export function calculatePacemakerMetrics(
  challenge: Challenge,
  expenses: Expense[],
  userId: UserRole
): PacemakerMetrics {
  const totalBudget = challenge.budget_per_person || 50000;
  const startDate = new Date(challenge.current_start_date || new Date().toISOString());
  const now = new Date();

  // Calculate elapsed days (1 to 7)
  const diffTime = Math.max(0, now.getTime() - startDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const elapsedDays = Math.min(7, Math.max(1, diffDays));

  // Filter expenses strictly for the requested user within current challenge cycle
  const userExpenses = expenses.filter(
    (exp) => exp.user_id === userId && new Date(exp.spent_at) >= startDate
  );

  const totalSpent = userExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = totalBudget - totalSpent;

  const dailyTargetBudget = Math.round(totalBudget / 7);
  const targetRemainingBudget = Math.max(0, Math.round(totalBudget - dailyTargetBudget * elapsedDays));

  // Today's spending
  const todayStr = now.toISOString().split('T')[0];
  const todaySpent = userExpenses
    .filter((exp) => exp.spent_at.startsWith(todayStr))
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
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

export function getDayOfWeekName(dayIndex: number): string {
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return days[dayIndex % 7] || '월요일';
}
