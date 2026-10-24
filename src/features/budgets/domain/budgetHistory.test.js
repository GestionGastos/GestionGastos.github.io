import { describe, expect, it } from 'vitest';
import { sortBudgetHistory } from './budgetHistory.js';

describe('sortBudgetHistory', () => {
  it('orders budgets chronologically so the current month appears last', () => {
    const history = [
      { year: 2026, month: 'Octubre' },
      { year: 2025, month: 'Diciembre' },
      { year: 2026, month: 'Febrero' },
    ];

    expect(sortBudgetHistory(history).map(({ month, year }) => `${month} ${year}`)).toEqual([
      'Diciembre 2025',
      'Febrero 2026',
      'Octubre 2026',
    ]);
    expect(history[0].month).toBe('Octubre');
  });

  it('uses the numeric order field when the month label is not recognized', () => {
    const result = sortBudgetHistory([
      { year: '2026', month: 'period-b', order: '11' },
      { year: '2026', month: 'period-a', order: '10' },
    ]);

    expect(result.map((item) => item.month)).toEqual(['period-a', 'period-b']);
  });
});
