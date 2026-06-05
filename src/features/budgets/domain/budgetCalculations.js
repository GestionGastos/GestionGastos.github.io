export function calculateBudgetSummary(budget) {
  const salary = Number(budget?.basics?.salary ?? 0);
  const savings = Number(budget?.basics?.save ?? 0);
  const additionalIncome = Number(budget?.basics?.additionalIncome ?? 0);
  const fixedExpenses = sumAmounts(budget?.expenses, 'amount');
  const additionalExpenses = sumAmounts(budget?.additionals, 'amount');
  const income = salary + additionalIncome;
  const available = income - savings - fixedExpenses - additionalExpenses;

  return {
    income,
    savings,
    fixedExpenses,
    additionalExpenses,
    available,
  };
}

export function chartSegments(budget) {
  const summary = calculateBudgetSummary(budget);
  const parts = [
    { label: 'Disponible', value: Math.max(summary.available, 0), color: 'var(--color-secondary)' },
    { label: 'Ahorro', value: summary.savings, color: 'var(--color-primary)' },
    { label: 'Gastos fijos', value: summary.fixedExpenses, color: 'var(--color-tertiary)' },
    { label: 'Adicionales', value: summary.additionalExpenses, color: 'var(--color-outline)' },
  ].filter((part) => part.value > 0);

  const total = parts.reduce((sum, part) => sum + part.value, 0) || 1;
  let cursor = 0;

  return parts.map((part) => {
    const percent = (part.value / total) * 100;
    const segment = { ...part, percent, start: cursor, end: cursor + percent };
    cursor += percent;
    return segment;
  });
}

function sumAmounts(items = [], key) {
  return items.reduce((sum, item) => sum + Number(item?.[key] ?? 0), 0);
}
