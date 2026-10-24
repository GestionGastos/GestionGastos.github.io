import { describe, expect, it, vi } from 'vitest';
import { OperationStatus } from '../../../shared/domain/operation.js';
import { buildBudgetPayload, executeCreateBudget, previewBudgetSummary, validateBudgetStep } from './budgetActions.js';

const messages = {
  requiredBasics: 'basics',
  requiredExpense: 'expense',
  requiredTag: 'tag',
  saveSuccess: ({ month, year, available }) => `${month} ${year} ${available}`,
  networkError: 'network',
};

describe('budgetActions', () => {
  it('requires a tag before save', () => {
    expect(validateBudgetStep(2, {
      basics: { year: '2026', month: 'Octubre', salary: '1' },
      expenses: [{ expense: 'rent', amount: '10' }],
      tags: [{ tag: '  ' }],
    }, messages).tags).toBe('tag');
  });

  it('builds a payload and available total that match the entered values', () => {
    const input = {
      basics: { year: '2026', month: 'Octubre', salary: '3500000', save: '500000', additionalIncome: '300000', cash: '100000' },
      expenses: [{ expense: 'rent', amount: '1450000' }],
      tags: [{ tag: 'octubre-2026' }],
    };
    const payload = buildBudgetPayload(input);
    const summary = previewBudgetSummary(input);

    expect(payload.order).toBe('10');
    expect(summary.available).toBe(1750000);
  });

  it('keeps values and returns a typed error when save fails', async () => {
    const submit = vi.fn().mockRejectedValue({ status: 500 });
    const result = await executeCreateBudget({
      basics: { year: '2026', month: 'Octubre', salary: '10', save: '0', additionalIncome: '0', cash: '0' },
      expenses: [{ expense: 'rent', amount: '1' }],
      tags: [{ tag: 'octubre' }],
    }, submit, messages, (value) => String(value));

    expect(result.status).toBe(OperationStatus.error);
    expect(result.error.type).toBe('NETWORK');
  });
});
