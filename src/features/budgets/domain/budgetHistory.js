const MONTH_INDEX = new Map([
  ['enero', 1], ['january', 1],
  ['febrero', 2], ['february', 2],
  ['marzo', 3], ['march', 3],
  ['abril', 4], ['april', 4],
  ['mayo', 5], ['may', 5],
  ['junio', 6], ['june', 6],
  ['julio', 7], ['july', 7],
  ['agosto', 8], ['august', 8],
  ['septiembre', 9], ['september', 9],
  ['octubre', 10], ['october', 10],
  ['noviembre', 11], ['november', 11],
  ['diciembre', 12], ['december', 12],
]);

function monthOrder(budget) {
  const order = Number(budget?.order);
  if (order >= 1 && order <= 12) return order;

  const monthName = String(budget?.month ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return MONTH_INDEX.get(monthName) ?? 0;
}

export function sortBudgetHistory(budgets = []) {
  return [...budgets].sort((left, right) => {
    const yearDifference = Number(left?.year ?? 0) - Number(right?.year ?? 0);
    if (yearDifference !== 0) return yearDifference;
    return monthOrder(left) - monthOrder(right);
  });
}
