export function createBudgetDraft(budget) {
  return {
    year: budget?.year ?? '',
    month: budget?.month ?? '',
    basics: {
      salary: String(budget?.basics?.salary ?? '0'),
      save: String(budget?.basics?.save ?? '0'),
      additionalIncome: String(budget?.basics?.additionalIncome ?? '0'),
    },
    expenses: ensureRows(budget?.expenses, { expense: '', amount: '' }),
    additionals: ensureRows(budget?.additionals, { name: '', amount: '' }),
    tags: ensureRows(budget?.tags, { tag: '' }),
  };
}

export function applyBudgetDraft(budget, draft) {
  return {
    ...budget,
    year: draft.year,
    month: draft.month,
    basics: {
      salary: draft.basics.salary || '0',
      save: draft.basics.save || '0',
      additionalIncome: draft.basics.additionalIncome || '0',
    },
    expenses: draft.expenses.filter((expense) => expense.expense && expense.amount),
    additionals: draft.additionals.filter((expense) => expense.name && expense.amount),
    tags: draft.tags.filter((tag) => tag.tag),
  };
}

function ensureRows(rows, fallback) {
  return rows?.length ? rows.map((row) => ({ ...fallback, ...row })) : [{ ...fallback }];
}
